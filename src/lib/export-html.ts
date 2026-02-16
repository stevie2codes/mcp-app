import type { GridApi } from "ag-grid-community";
import type { Template } from "../types/template";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTemplateHeaderHtml(template: Template): string {
  const { header, style } = template;
  const primaryColor = style?.primaryColor ?? "#003366";
  const accentColor = style?.accentColor ?? primaryColor;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let html = '<div class="template-header">';
  html += '<div class="template-header-top">';
  if (header.logoUrl) {
    html += `<img class="template-logo" src="${escapeHtml(header.logoUrl)}" alt="" />`;
  }
  html += '<div class="template-header-text">';
  if (header.agencyName) {
    html += `<div class="template-agency" style="color:${escapeHtml(primaryColor)}">${escapeHtml(header.agencyName)}</div>`;
  }
  if (header.subtitle) {
    html += `<div class="template-subtitle">${escapeHtml(header.subtitle)}</div>`;
  }
  html += "</div></div>";
  if (header.showDate) {
    html += `<div class="template-date">${escapeHtml(today)}</div>`;
  }
  html += `<div class="template-accent-bar" style="background:linear-gradient(90deg,${escapeHtml(primaryColor)},${escapeHtml(accentColor)})"></div>`;
  html += "</div>";
  return html;
}

export function exportHtml(
  gridApi: GridApi,
  title: string,
  meta: string,
  template?: Template,
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

  const templateCss = template
    ? `
    .template-header { margin-bottom: 16px; }
    .template-header-top { display: flex; align-items: center; gap: 14px; }
    .template-logo { height: 40px; width: auto; max-width: 120px; object-fit: contain; }
    .template-header-text { display: flex; flex-direction: column; gap: 2px; }
    .template-agency { font-size: 1.125rem; font-weight: 700; letter-spacing: -0.01em; }
    .template-subtitle { font-size: 0.85rem; color: #6b7280; }
    .template-date { margin-top: 8px; font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
    .template-accent-bar { margin-top: 12px; height: 3px; border-radius: 9999px; }`
    : "";

  const templateHeaderHtml = template
    ? buildTemplateHeaderHtml(template)
    : "";

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
    tr:nth-child(even) { background: #f9fafb; }${templateCss}
  </style>
</head>
<body>
  ${templateHeaderHtml}
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
