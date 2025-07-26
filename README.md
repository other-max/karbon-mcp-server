# Karbon MCP Server

This MCP server provides integration with the Karbon API, allowing you to interact with clients and work items through the Model Context Protocol.

## Features

- **get_client_by_id**: Get detailed information about a specific client by their ID
- **search_clients**: Search for clients across all types (Contacts, Organizations, Client Groups)
- **get_work_items**: Get work items with optional filtering by client, work type, or title
- **get_work_item_by_id**: Get detailed information about a specific work item by its ID

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Server

```bash
npm run build
```

### 3. Set Environment Variables

You need to set your Karbon API credentials as environment variables:

```bash
# Windows (Command Prompt)
set KARBON_BEARER_TOKEN=your_bearer_token_here
set KARBON_ACCESS_KEY=your_access_key_here

# Windows (PowerShell)
$env:KARBON_BEARER_TOKEN="your_bearer_token_here"
$env:KARBON_ACCESS_KEY="your_access_key_here"

# Linux/Mac
export KARBON_BEARER_TOKEN=your_bearer_token_here
export KARBON_ACCESS_KEY=your_access_key_here
```

### 4. Add to MCP Configuration

Add this server to your MCP configuration file (typically `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "karbon-server": {
      "command": "node",
      "args": ["/path/to/karbon-mcp-server/build/index.js"],
      "env": {
        "KARBON_BEARER_TOKEN": "your_bearer_token_here",
        "KARBON_ACCESS_KEY": "your_access_key_here"
      }
    }
  }
}
```

**Note**: Replace `/path/to/karbon-mcp-server/` with the actual path where you cloned/downloaded this repository.

## Getting Karbon API Credentials

1. Log into your Karbon account
2. Go to Settings > Integrations > API
3. Generate a new API key to get your Bearer Token and Access Key

## Usage Examples

Once configured, you can use these tools through the MCP interface:

### Search for clients
```json
{
  "tool": "search_clients",
  "arguments": {
    "search_term": "Smith",
    "max_results": 10
  }
}
```

### Get a specific client
```json
{
  "tool": "get_client_by_id",
  "arguments": {
    "client_id": "12345",
    "client_type": "Contact"
  }
}
```

### Get work items for a client
```json
{
  "tool": "get_work_items",
  "arguments": {
    "client_key": "12345",
    "work_type": "Tax",
    "max_results": 20
  }
}
```

### Get a specific work item
```json
{
  "tool": "get_work_item_by_id",
  "arguments": {
    "work_item_key": "67890"
  }
}
```

## API Reference

For more information about the Karbon API, see: https://karbonhq.github.io/karbon-api-reference/

## Troubleshooting

- Make sure your API credentials are correct and have the necessary permissions
- Check that the environment variables are set correctly
- Verify that the server path in your MCP configuration is correct
- Check the console for any error messages when the server starts
