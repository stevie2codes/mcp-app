# Socrata Report Builder — MCP App

## What This Is

A standalone TypeScript MCP App that queries Socrata open data platforms and renders interactive reports (AG Grid) directly inside MCP-enabled hosts like Claude Desktop. Inspired by [Thomas Faulds' Socrata MCP Server](https://github.com/Thomas-TyTech/Socrata-MCP).

## Architecture

```
Claude calls generate_report tool → server.ts fetches Socrata SODA API → UI renders AG Grid in sandboxed iframe
```

- **Server** (`server.ts` + `main.ts`): TypeScript, uses `@modelcontextprotocol/ext-apps` SDK, stdio transport
- **UI** (`report-app.html` + `src/`): React 19 with AG Grid Community + Forge web components, bundled into single HTML via Vite + vite-plugin-singlefile
- **No Python dependency** — calls the Socrata SODA API directly (`https://{domain}/resource/{datasetId}.json`)

## Key Files

| File | Role |
|------|------|
| `server.ts` | MCP server: `generate_report` + `list_templates` tools, Socrata API fetch, UI resource serving |
| `main.ts` | Entry point, stdio transport |
| `template-loader.ts` | Reads and validates template JSON files from `templates/` directory |
| `src/types/template.ts` | Zod schema + TypeScript types for report templates |
| `report-app.html` | HTML shell for the MCP App UI |
| `src/App.tsx` | Main React component, orchestrates report rendering and exports |
| `src/components/TemplateHeader.tsx` | Branded header block (agency name, logo, subtitle, date, accent bar) |
| `src/components/ReportHeader.tsx` | Report title, source info, row count |
| `src/components/ReportToolbar.tsx` | Search field + CSV/HTML export buttons |
| `src/components/ReportGrid.tsx` | AG Grid with pagination, sorting, filtering |
| `src/hooks/useReportData.ts` | MCP App SDK bridge — handles `ontoolresult` events |
| `src/lib/export-html.ts` | HTML export with optional branded template header |
| `src/report-app.css` | Report-specific styles |
| `src/global.css` | Base styles using host CSS variables |
| `src/lib/forge-theme-bridge.css` | Maps host CSS variables to Forge design tokens |
| `templates/*.json` | User-configurable report template definitions |
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
- **Tools**: `generate_report` (with UI) and `list_templates` (text-only). Claude handles dataset discovery conversationally — no need for a search tool
- **Report templates**: JSON files in `templates/` define branded headers (agency name, logo, subtitle, date, colors). Templates always render on a white background for a print-document look. Pass `templateId` to `generate_report` or use `templateOverrides` for ad-hoc customization

## Report Templates

Templates are JSON files in the `templates/` directory that define branded report headers for operational/government-style output.

### Template schema

```json
{
  "id": "federal-standard",
  "name": "Federal Standard Report",
  "header": {
    "agencyName": "U.S. Department of Transportation",
    "logoUrl": "https://example.gov/logo.png",
    "subtitle": "Office of Data Analytics",
    "showDate": true,
    "showReportPeriod": false
  },
  "style": {
    "primaryColor": "#003366",
    "accentColor": "#B22234"
  }
}
```

### Usage

- **Discover templates**: Claude calls `list_templates` to see available IDs
- **Apply a template**: Pass `templateId: "federal-standard"` to `generate_report`
- **Override fields**: Pass `templateOverrides: { agencyName: "Custom Agency", primaryColor: "#1D3557" }` alongside or instead of `templateId`
- **Create new templates**: Add a JSON file to `templates/` following the schema above. Use `blank-starter.json` as a starting point

### Default templates

| File | Style |
|------|-------|
| `federal-standard.json` | U.S. federal agency (navy/red) |
| `municipal-report.json` | City/county government (blue/green) |
| `blank-starter.json` | Empty starter for custom templates |

### Styling

Template headers always render on a white background with hardcoded dark text colors, regardless of host theme (light/dark mode). This ensures the branded header looks like a printed document. The accent bar uses a gradient from `primaryColor` to `accentColor`. The same branded header is included in HTML exports.

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
- Template footer block (page numbers, confidentiality notices, contact info)
- Template metadata strip (prepared by, report ID, classification level)
- Template summary section (executive summary text above the data table)
- PDF export
