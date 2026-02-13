# Socrata Report Builder — MCP App

## What This Is

A standalone TypeScript MCP App that queries Socrata open data platforms and renders interactive reports (AG Grid) directly inside MCP-enabled hosts like Claude Desktop. Inspired by [Thomas Faulds' Socrata MCP Server](https://github.com/Thomas-TyTech/Socrata-MCP).

## Architecture

```
Claude calls generate_report tool → server.ts fetches Socrata SODA API → UI renders AG Grid in sandboxed iframe
```

- **Server** (`server.ts` + `main.ts`): TypeScript, uses `@modelcontextprotocol/ext-apps` SDK, stdio transport
- **UI** (`report-app.html` + `src/report-app.ts`): Vanilla JS with AG Grid Community, bundled into single HTML via Vite + vite-plugin-singlefile
- **No Python dependency** — calls the Socrata SODA API directly (`https://{domain}/resource/{datasetId}.json`)

## Key Files

| File | Role |
|------|------|
| `server.ts` | MCP server: `generate_report` tool registration, Socrata API fetch, UI resource serving |
| `main.ts` | Entry point, stdio transport |
| `report-app.html` | HTML shell for the MCP App UI |
| `src/report-app.ts` | AG Grid setup, export logic (CSV + HTML), MCP App bridge (`ontoolresult`, theme handling) |
| `src/report-app.css` | Report-specific styles |
| `src/global.css` | Base styles using host CSS variables |
| `vite.config.ts` | Bundles UI into single HTML file (required by MCP Apps SDK) |

## Build & Run

```bash
npm run build    # TypeScript check + Vite bundle + server declaration emit
npm run serve    # Run server with tsx (stdio transport)
npm start        # Build then serve
npm run dev      # Watch mode (auto-rebuild UI + run server)
```

## Claude Desktop Config

Located at `~/Library/Application Support/Claude/claude_desktop_config.json`. Uses `/opt/homebrew/bin/node` (v24) because the system `/usr/local/bin/npx` points to Node v17 which is too old.

## Conventions

- **Node compatibility**: Use `fileURLToPath(import.meta.url)` instead of `import.meta.filename`/`import.meta.dirname` — the latter requires Node 21+ and Claude Desktop may use older versions
- **AG Grid**: Community edition only (MIT license). Modules registered explicitly via `ModuleRegistry.registerModules()`
- **MCP Apps SDK patterns**: Register all handlers (`ontoolresult`, `onhostcontextchanged`, etc.) BEFORE calling `app.connect()`. Always handle `safeAreaInsets` and host theme variables
- **Socrata API**: No auth required for public datasets. Optional `SOCRATA_APP_TOKEN` env var for higher rate limits (1K → 10K req/hr)
- **Single tool**: One `generate_report` tool with UI. Claude handles dataset discovery conversationally — no need for a search tool

## Socrata SODA API Reference

- Endpoint: `GET https://{domain}/resource/{datasetId}.json`
- Query param: `$query` (SoQL — SQL-like syntax)
- Limit param: `$limit` (default 1000)
- Auth header: `X-App-Token` (optional)
- Response: JSON array of row objects
- Common domains: `data.cityofchicago.org`, `data.ny.gov`, `data.sfgov.org`

## Future Enhancements

- Charts (bar, line, pie) alongside tables
- Geographic map visualizations for GeoJSON data
- Dataset search tool (text-only, no UI)
- Load more / server-side pagination
