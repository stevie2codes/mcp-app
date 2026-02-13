import type { GridApi } from "ag-grid-community";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportHtml(
  gridApi: GridApi,
  title: string,
  meta: string,
): void {
  const rowData: Record<string, unknown>[] = [];
  gridApi.forEachNodeAfterFilterAndSort((node) => {
    if (node.data) rowData.push(node.data);
  });

  const columns = gridApi.getColumns();
  if (!columns) return;

  const visibleCols = columns.filter((col) => col.isVisible());

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
  <title>${escapeHtml(title)}</title>
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
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml(meta)} &middot; ${rowData.length.toLocaleString()} rows (filtered)</p>
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
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
