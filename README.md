# Socrata Report Builder

An MCP App that queries public datasets on [Socrata](https://dev.socrata.com/) open data platforms and renders interactive reports directly inside your conversation.

Ask Claude something like *"Show me Chicago crime data from 2024"* and get back a sortable, filterable data table you can explore and export — without leaving the chat.

## Features

- **Interactive data tables** powered by AG Grid Community (sort, filter, resize, reorder columns)
- **Quick search** across all columns
- **Pagination** with configurable page sizes (25, 50, 100, 200)
- **Export CSV** — downloads the current filtered/sorted view
- **Export HTML** — snapshots the report as a self-contained HTML file
- **Host theme integration** — adapts to light/dark mode automatically

## How It Works

```
You ask Claude → Claude calls generate_report → Server fetches Socrata API → AG Grid renders in-conversation
```

Claude interprets your natural language request, fills in the Socrata domain and dataset ID, and calls the `generate_report` tool. The MCP App UI appears inline with an interactive table of the results.

## Prerequisites

- Node.js >= 18
- [Claude Desktop](https://claude.ai/download) (latest version with MCP Apps support)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/stevie2codes/mcp-app.git
cd mcp-app
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Add to Claude Desktop

Open Claude Desktop → **Settings** → **Developer** → **Edit Config** and add:

```json
{
  "mcpServers": {
    "socrata-report": {
      "command": "node",
      "args": ["node_modules/.bin/tsx", "/path/to/mcp-app/main.ts"],
      "env": {}
    }
  }
}
```

Replace `/path/to/mcp-app` with the actual path to where you cloned the repo.

**Quit and relaunch Claude Desktop** for changes to take effect.

### 4. (Optional) Socrata App Token

By default, the Socrata API allows 1,000 requests/hour without authentication. For higher limits (10,000 req/hr), get a free token at [dev.socrata.com](https://dev.socrata.com/) and add it to your config:

```json
"env": {
  "SOCRATA_APP_TOKEN": "your_token_here"
}
```

## Usage

Start a new conversation in Claude Desktop and try:

- *"Show me Chicago crime data from 2024"*
- *"Pull up New York City 311 complaints"*
- *"Find building permits in San Francisco"*

Claude will call the `generate_report` tool and the interactive table will appear in the conversation.

### The `generate_report` tool

| Parameter | Required | Description |
|-----------|----------|-------------|
| `domain` | Yes | Socrata domain (e.g. `data.cityofchicago.org`) |
| `datasetId` | Yes | Dataset identifier (e.g. `ijzp-q8t2`) |
| `title` | Yes | Report heading |
| `query` | No | SoQL query (e.g. `SELECT * WHERE year = 2024`) |
| `columns` | No | Subset of columns to display |
| `limit` | No | Max rows to fetch (default: 1000) |

## Development

```bash
# Build and run
npm start

# Watch mode (auto-rebuild UI + run server)
npm run dev
```

## Project Structure

```
mcp-app/
├── server.ts              # MCP server: tool registration, Socrata API calls, resource serving
├── main.ts                # Entry point (stdio transport)
├── report-app.html        # HTML shell for the MCP App UI
├── src/
│   ├── report-app.ts      # AG Grid setup, export logic, MCP App bridge
│   ├── report-app.css     # Report styles
│   └── global.css         # Base styles
├── vite.config.ts         # Bundles UI into single HTML file
├── tsconfig.json          # Client-side TypeScript config
├── tsconfig.server.json   # Server-side TypeScript config
└── package.json
```

## Tech Stack

- [MCP Apps SDK](https://github.com/modelcontextprotocol/ext-apps) — interactive UI inside MCP hosts
- [AG Grid Community](https://www.ag-grid.com/) — data table with sort, filter, pagination
- [Vite](https://vitejs.dev/) + [vite-plugin-singlefile](https://github.com/nicccce/vite-plugin-singlefile) — bundles UI into single HTML
- [Socrata SODA API](https://dev.socrata.com/) — public open data

## Acknowledgments

Inspired by the [Socrata MCP Server](https://github.com/Thomas-TyTech/Socrata-MCP) by [Thomas Faulds](https://github.com/Thomas-TyTech), which provides a Python-based MCP server for querying Socrata open data platforms. This project reimplements the Socrata API integration in TypeScript and wraps it in an MCP App with an interactive UI.
