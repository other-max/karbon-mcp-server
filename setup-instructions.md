# Karbon MCP Server Setup Instructions

## ✅ Server Built Successfully!

Your Karbon MCP server has been successfully created and compiled. Here's how to set it up:

## Step 1: Get Your Karbon API Credentials

1. Log into your Karbon account
2. Navigate to **Settings** → **Integrations** → **API**
3. Generate a new API key to get:
   - **Bearer Token** (starts with "Bearer ")
   - **Access Key** (your API access key)

## Step 2: Add Server to MCP Configuration

### Option A: Using Cline's MCP Settings

1. In VS Code, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Search for "Cline: Open MCP Settings"
3. Add this configuration:

```json
{
  "mcpServers": {
    "karbon-server": {
      "command": "node",
      "args": ["C:/Users/MDucharme/OneDrive - Beppel & Associates PC/Documents/Cline/MCP/karbon-server/build/index.js"],
      "env": {
        "KARBON_BEARER_TOKEN": "your_actual_bearer_token_here",
        "KARBON_ACCESS_KEY": "your_actual_access_key_here"
      }
    }
  }
}
```

### Option B: Manual Configuration File

1. Locate your MCP configuration file (usually at):
   - Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
   - Mac: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the server configuration from Option A above

## Step 3: Restart Cline

After adding the configuration:
1. Restart VS Code or reload the Cline extension
2. The Karbon server should now be available

## Available Tools

Once configured, you'll have access to these tools:

### 🔍 `search_clients`
Search for clients by name or email across all types (Contacts, Organizations, Client Groups)

**Example:**
```json
{
  "search_term": "Smith",
  "max_results": 10
}
```

### 👤 `get_client_by_id`
Get detailed information about a specific client

**Example:**
```json
{
  "client_id": "12345",
  "client_type": "Contact"
}
```

### 📋 `get_work_items`
Get work items with optional filtering

**Example:**
```json
{
  "client_key": "12345",
  "work_type": "Tax",
  "max_results": 20
}
```

### 📄 `get_work_item_by_id`
Get detailed information about a specific work item

**Example:**
```json
{
  "work_item_key": "67890"
}
```

## Troubleshooting

- **Authentication Error**: Double-check your Bearer Token and Access Key
- **Server Not Found**: Verify the file path in your MCP configuration
- **No Response**: Check that environment variables are set correctly
- **Rate Limits**: The server includes automatic rate limit handling

## Security Notes

- Keep your API credentials secure and never commit them to version control
- The Bearer Token and Access Key provide full access to your Karbon account
- Consider using environment variables or secure credential storage in production

## Support

For Karbon API documentation, visit: https://karbonhq.github.io/karbon-api-reference/

---

**🎉 Your Karbon MCP Server is ready to use!**
