#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
// Environment variables for Karbon API credentials
const KARBON_BEARER_TOKEN = process.env.KARBON_BEARER_TOKEN;
const KARBON_ACCESS_KEY = process.env.KARBON_ACCESS_KEY;
if (!KARBON_BEARER_TOKEN || !KARBON_ACCESS_KEY) {
    throw new Error('KARBON_BEARER_TOKEN and KARBON_ACCESS_KEY environment variables are required');
}
// Validation functions
const isValidClientType = (type) => {
    return ['Contact', 'Organization', 'ClientGroup'].includes(type);
};
const isValidGetClientByIdArgs = (args) => {
    return typeof args === 'object' &&
        args !== null &&
        typeof args.client_id === 'string' &&
        typeof args.client_type === 'string' &&
        isValidClientType(args.client_type);
};
const isValidSearchClientsArgs = (args) => {
    return typeof args === 'object' &&
        args !== null &&
        typeof args.search_term === 'string' &&
        (args.max_results === undefined || typeof args.max_results === 'number');
};
const isValidGetWorkItemsArgs = (args) => {
    return typeof args === 'object' && args !== null &&
        (args.client_key === undefined || typeof args.client_key === 'string') &&
        (args.work_type === undefined || typeof args.work_type === 'string') &&
        (args.title_filter === undefined || typeof args.title_filter === 'string') &&
        (args.max_results === undefined || typeof args.max_results === 'number');
};
const isValidGetWorkItemByIdArgs = (args) => {
    return typeof args === 'object' &&
        args !== null &&
        typeof args.work_item_key === 'string';
};
class KarbonServer {
    server;
    axiosInstance;
    constructor() {
        this.server = new Server({
            name: 'karbon-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Configure axios instance with Karbon API settings
        this.axiosInstance = axios.create({
            baseURL: 'https://api.karbonhq.com/v3',
            headers: {
                'Authorization': `Bearer ${KARBON_BEARER_TOKEN}`,
                'AccessKey': KARBON_ACCESS_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
        });
        // Add response interceptor for better error handling
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 429) {
                // Rate limit exceeded - could implement retry logic here
                throw new McpError(ErrorCode.InternalError, `Karbon API rate limit exceeded: ${error.response?.data?.message || error.message}`);
            }
            if (error.response?.status === 401) {
                throw new McpError(ErrorCode.InternalError, 'Karbon API authentication failed. Please check your credentials.');
            }
            if (error.response?.status === 404) {
                throw new McpError(ErrorCode.InvalidRequest, `Resource not found: ${error.response?.data?.error?.message || error.message}`);
            }
            throw new McpError(ErrorCode.InternalError, `Karbon API error: ${error.response?.data?.error?.message || error.message}`);
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_client_by_id',
                    description: 'Get detailed information about a specific client by their ID',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            client_id: {
                                type: 'string',
                                description: 'The Karbon-generated client key/ID',
                            },
                            client_type: {
                                type: 'string',
                                enum: ['Contact', 'Organization', 'ClientGroup'],
                                description: 'The type of client to retrieve',
                            },
                        },
                        required: ['client_id', 'client_type'],
                    },
                },
                {
                    name: 'search_clients',
                    description: 'Search for clients across all types (Contacts, Organizations, Client Groups) by name, email, or other criteria',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            search_term: {
                                type: 'string',
                                description: 'Search term to find clients (name, email, etc.)',
                            },
                            max_results: {
                                type: 'number',
                                description: 'Maximum number of results to return (default: 50)',
                                minimum: 1,
                                maximum: 100,
                            },
                        },
                        required: ['search_term'],
                    },
                },
                {
                    name: 'get_work_items',
                    description: 'Get work items with optional filtering by client, work type, or title',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            client_key: {
                                type: 'string',
                                description: 'Filter by specific client key (optional)',
                            },
                            work_type: {
                                type: 'string',
                                description: 'Filter by work type (e.g., "Payroll", "Tax") (optional)',
                            },
                            title_filter: {
                                type: 'string',
                                description: 'Filter by work item title (partial match) (optional)',
                            },
                            max_results: {
                                type: 'number',
                                description: 'Maximum number of results to return (default: 100)',
                                minimum: 1,
                                maximum: 100,
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_work_item_by_id',
                    description: 'Get detailed information about a specific work item by its ID',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            work_item_key: {
                                type: 'string',
                                description: 'The Karbon-generated work item key/ID',
                            },
                        },
                        required: ['work_item_key'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case 'get_client_by_id':
                    return await this.handleGetClientById(request.params.arguments);
                case 'search_clients':
                    return await this.handleSearchClients(request.params.arguments);
                case 'get_work_items':
                    return await this.handleGetWorkItems(request.params.arguments);
                case 'get_work_item_by_id':
                    return await this.handleGetWorkItemById(request.params.arguments);
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    async handleGetClientById(args) {
        if (!isValidGetClientByIdArgs(args)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_client_by_id. Required: client_id (string), client_type (Contact|Organization|ClientGroup)');
        }
        const { client_id, client_type } = args;
        try {
            let endpoint;
            let expandParams = '';
            switch (client_type) {
                case 'Contact':
                    endpoint = `/Contacts/${client_id}`;
                    expandParams = '?$expand=BusinessCards,ClientTeam';
                    break;
                case 'Organization':
                    endpoint = `/Organizations/${client_id}`;
                    expandParams = '?$expand=BusinessCards,ClientTeam,Contacts';
                    break;
                case 'ClientGroup':
                    endpoint = `/ClientGroups/${client_id}`;
                    expandParams = '?$expand=BusinessCard,ClientTeam';
                    break;
                default:
                    throw new McpError(ErrorCode.InvalidParams, `Invalid client_type: ${client_type}`);
            }
            const response = await this.axiosInstance.get(`${endpoint}${expandParams}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            client_type,
                            client_data: response.data
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Failed to get client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleSearchClients(args) {
        if (!isValidSearchClientsArgs(args)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for search_clients. Required: search_term (string), optional: max_results (number)');
        }
        const { search_term, max_results = 50 } = args;
        const limit = Math.min(max_results, 100);
        try {
            // Search across all three client types in parallel
            const searchPromises = [
                // Search Contacts
                this.axiosInstance.get('/Contacts', {
                    params: {
                        $filter: `(contains(FullName, '${search_term}')) or (contains(EmailAddress, '${search_term}'))`,
                        $expand: 'BusinessCards',
                        $top: limit,
                    }
                }).catch(() => ({ data: { value: [] } })),
                // Search Organizations  
                this.axiosInstance.get('/Organizations', {
                    params: {
                        $filter: `(contains(FullName, '${search_term}')) or (contains(EmailAddress, '${search_term}'))`,
                        $expand: 'BusinessCards',
                        $top: limit,
                    }
                }).catch(() => ({ data: { value: [] } })),
                // Search Client Groups
                this.axiosInstance.get('/ClientGroups', {
                    params: {
                        $filter: `contains(FullName, '${search_term}')`,
                        $expand: 'BusinessCard',
                        $top: limit,
                    }
                }).catch(() => ({ data: { value: [] } })),
            ];
            const [contactsResponse, organizationsResponse, clientGroupsResponse] = await Promise.all(searchPromises);
            // Combine and format results
            const results = {
                search_term,
                total_results: 0,
                contacts: contactsResponse.data.value || [],
                organizations: organizationsResponse.data.value || [],
                client_groups: clientGroupsResponse.data.value || [],
            };
            results.total_results = results.contacts.length + results.organizations.length + results.client_groups.length;
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Failed to search clients: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleGetWorkItems(args) {
        if (!isValidGetWorkItemsArgs(args)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_work_items. All parameters are optional: client_key, work_type, title_filter, max_results');
        }
        const { client_key, work_type, title_filter, max_results = 100 } = args;
        const limit = Math.min(max_results, 100);
        try {
            // Build filter conditions
            const filters = [];
            if (client_key) {
                filters.push(`ClientKey eq '${client_key}'`);
            }
            if (work_type) {
                filters.push(`WorkType eq '${work_type}'`);
            }
            if (title_filter) {
                filters.push(`(contains(Title, '${title_filter}'))`);
            }
            const params = {
                $top: limit,
                $orderby: 'StartDate desc',
            };
            if (filters.length > 0) {
                params.$filter = filters.join(' and ');
            }
            const response = await this.axiosInstance.get('/WorkItems', { params });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            filters_applied: { client_key, work_type, title_filter },
                            total_results: response.data['@odata.count'] || response.data.value?.length || 0,
                            work_items: response.data.value || []
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Failed to get work items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleGetWorkItemById(args) {
        if (!isValidGetWorkItemByIdArgs(args)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_work_item_by_id. Required: work_item_key (string)');
        }
        const { work_item_key } = args;
        try {
            const response = await this.axiosInstance.get(`/WorkItems/${work_item_key}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            work_item_key,
                            work_item_data: response.data
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Failed to get work item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Karbon MCP server running on stdio');
    }
}
const server = new KarbonServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map