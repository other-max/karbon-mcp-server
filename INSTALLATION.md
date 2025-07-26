# Installation Guide

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/other-max/karbon-mcp-server.git
cd karbon-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Server

```bash
npm run build
```

### 4. Get Your Karbon API Credentials

1. Log into your Karbon account
2. Navigate to **Settings** → **Integrations** → **API**
3. Generate a new API key to get:
   - **Bearer Token**
   - **Access Key**

### 5. Configure MCP Server

#### Option A: Using Cline's MCP Settings (Recommended)

1. In VS Code, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Search for "Cline: Open MCP Settings"
3. Add this configuration (replace the path with your actual path):

```json
{
  "mcpServers": {
    "karbon-server": {
      "command": "node",
      "args": ["/your/actual/path/to/karbon-mcp-server/build/index.js"],
      "env": {
        "KARBON_BEARER_TOKEN": "your_actual_bearer_token_here",
        "KARBON_ACCESS_KEY": "your_actual_access_key_here"
      }
    }
  }
}
```

#### Option B: Manual Configuration

1. Locate your MCP configuration file:
   - **Windows**: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
   - **Mac**: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - **Linux**: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the server configuration from Option A above

### 6. Restart Cline

After adding the configuration:
1. Restart VS Code or reload the Cline extension
2. The Karbon server should now be available

## Path Examples

Replace `/your/actual/path/to/karbon-mcp-server/` with your actual path:

- **Windows**: `"C:/Users/YourUsername/Documents/karbon-mcp-server/build/index.js"`
- **Mac**: `"/Users/YourUsername/Documents/karbon-mcp-server/build/index.js"`
- **Linux**: `"/home/yourusername/Documents/karbon-mcp-server/build/index.js"`

## Verification

Once configured, you should have access to these tools in Cline:
- `search_clients`
- `get_client_by_id`
- `get_work_items`
- `get_work_item_by_id`

## Troubleshooting

- **Server not found**: Double-check the file path in your configuration
- **Authentication errors**: Verify your Karbon API credentials
- **Build errors**: Make sure you ran `npm install` and `npm run build`
- **Permission errors**: Ensure the build/index.js file is executable

For more detailed information, see [README.md](README.md) and [setup-instructions.md](setup-instructions.md).
