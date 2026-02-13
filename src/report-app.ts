import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  ClientSideRowModelModule,
  CsvExportModule,
  QuickFilterModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  ModuleRegistry,
  type GridApi,
  type GridOptions,
  type ColDef,
  createGrid,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./global.css";
import "./report-app.css";

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
  QuickFilterModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
]);

// DOM elements
const mainEl = document.querySelector(".main") as HTMLElement;
const reportHeader = document.getElementById("report-header")!;
const reportTitle = document.getElementById("report-title")!;
const reportMeta = document.getElementById("report-meta")!;
const toolbar = document.getElementById("toolbar")!;
const quickFilter = document.getElementById("quick-filter") as HTMLInputElement;
const exportCsvBtn = document.getElementById("export-csv-btn")!;
const exportHtmlBtn = document.getElementById("export-html-btn")!;
const loadingEl = document.getElementById("loading")!;
const gridContainer = document.getElementById("grid-container")!;
const gridDiv = document.getElementById("report-grid")!;

let gridApi: GridApi | null = null;
let currentTitle = "Report";
let currentMeta = "";

// --- Report data types ---

interface ReportColumn {
  field: string;
  headerName: string;
}

interface ReportData {
  title: string;
  domain: string;
  datasetId: string;
  columns: ReportColumn[];
  data: Record<string, unknown>[];
  totalRows: number;
  query: string;
}

// --- Host context handling ---

function handleHostContextChanged(ctx: McpUiHostContext) {
  if (ctx.theme) {
    applyDocumentTheme(ctx.theme);
  }
  if (ctx.styles?.variables) {
    applyHostStyleVariables(ctx.styles.variables);
  }
  if (ctx.styles?.css?.fonts) {
    applyHostFonts(ctx.styles.css.fonts);
  }
  if (ctx.safeAreaInsets) {
    mainEl.style.paddingTop = `${ctx.safeAreaInsets.top}px`;
    mainEl.style.paddingRight = `${ctx.safeAreaInsets.right}px`;
    mainEl.style.paddingBottom = `${ctx.safeAreaInsets.bottom}px`;
    mainEl.style.paddingLeft = `${ctx.safeAreaInsets.left}px`;
  }
}

// --- Render report ---

function renderReport(report: ReportData) {
  // Update header
  currentTitle = report.title;
  currentMeta = `${report.domain} / ${report.datasetId} \u00b7 ${report.totalRows.toLocaleString()} rows \u00b7 Query: ${report.query}`;
  reportTitle.textContent = currentTitle;
  reportMeta.textContent = currentMeta;
  reportHeader.style.display = "block";
  toolbar.style.display = "flex";
  loadingEl.style.display = "none";
  gridContainer.style.display = "block";

  // Build AG Grid column defs
  const columnDefs: ColDef[] = report.columns.map((col) => ({
    field: col.field,
    headerName: col.headerName,
    filter: true,
    sortable: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
  }));

  const gridOptions: GridOptions = {
    columnDefs,
    rowData: report.data,
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],
    domLayout: "autoHeight",
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
    },
  };

  // Destroy existing grid if re-rendering
  if (gridApi) {
    gridApi.destroy();
  }

  gridApi = createGrid(gridDiv, gridOptions);
}

// --- Export functions ---

function exportCsv() {
  if (!gridApi) return;
  gridApi.exportDataAsCsv({
    fileName: `${currentTitle.replace(/[^a-zA-Z0-9]/g, "_")}.csv`,
  });
}

function exportHtml() {
  if (!gridApi) return;

  // Get current displayed data (respects filter/sort)
  const rowData: Record<string, unknown>[] = [];
  gridApi.forEachNodeAfterFilterAndSort((node) => {
    if (node.data) rowData.push(node.data);
  });

  const columns = gridApi.getColumns();
  if (!columns) return;

  const visibleCols = columns.filter((col) => col.isVisible());

  // Build HTML table
  const headerCells = visibleCols
    .map((col) => {
      const def = col.getColDef();
      return `<th>${escapeHtml(String(def.headerName ?? def.field ?? ""))}</th>`;
    })
    .join("");

  const bodyRows = rowData
    .map((row) => {
      const cells = visibleCols
        .map((col) => {
          const field = col.getColDef().field;
          const value = field ? row[field] : "";
          return `<td>${escapeHtml(String(value ?? ""))}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(currentTitle)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 24px; color: #1a1a1a; }
    h1 { font-size: 1.25rem; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 0.85rem; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>${escapeHtml(currentTitle)}</h1>
  <p class="meta">${escapeHtml(currentMeta)} &middot; ${rowData.length.toLocaleString()} rows (filtered)</p>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentTitle.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Event listeners ---

quickFilter.addEventListener("input", () => {
  gridApi?.setGridOption("quickFilterText", quickFilter.value);
});

exportCsvBtn.addEventListener("click", exportCsv);
exportHtmlBtn.addEventListener("click", exportHtml);

// --- MCP App lifecycle ---

const app = new App({ name: "Socrata Report", version: "1.0.0" });

app.onteardown = async () => {
  if (gridApi) {
    gridApi.destroy();
    gridApi = null;
  }
  return {};
};

app.ontoolinput = (params) => {
  // Could show a preview while Claude is still generating, but for now just log
  console.info("Received tool input:", params);
};

app.ontoolresult = (result) => {
  console.info("Received tool result:", result);
  const structured = (result as CallToolResult).structuredContent as
    | ReportData
    | undefined;

  if (structured?.data) {
    renderReport(structured);
  } else {
    // Show error
    loadingEl.innerHTML = '<p class="error">No data returned. The query may have returned empty results or an error occurred.</p>';
  }
};

app.ontoolcancelled = () => {
  loadingEl.innerHTML = '<p class="error">Report generation was cancelled.</p>';
};

app.onerror = (error) => {
  console.error("App error:", error);
  loadingEl.innerHTML = `<p class="error">Error: ${escapeHtml(String(error))}</p>`;
};

app.onhostcontextchanged = handleHostContextChanged;

// Connect to host
app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx) {
    handleHostContextChanged(ctx);
  }
});
