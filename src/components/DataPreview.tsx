import { useMemo } from "react";
import type { ReportColumn } from "../hooks/useReportData";

interface DataPreviewProps {
  title: string;
  domain: string;
  datasetId: string;
  columns: ReportColumn[];
  data: Record<string, unknown>[];
  totalRows: number;
  query: string;
}

interface ColumnStat {
  field: string;
  headerName: string;
  type: "numeric" | "text";
  min?: number;
  max?: number;
}

const PREVIEW_ROWS = 5;
const MAX_STAT_COLUMNS = 8;

export function DataPreview({
  title,
  domain,
  datasetId,
  columns,
  data,
  totalRows,
  query,
}: DataPreviewProps) {
  const previewRows = data.slice(0, PREVIEW_ROWS);

  const columnStats = useMemo<ColumnStat[]>(() => {
    return columns.slice(0, MAX_STAT_COLUMNS).map((col) => {
      const values = data
        .map((row) => row[col.field])
        .filter((v) => v !== null && v !== undefined && v !== "");
      const nums = values.map((v) => Number(v)).filter((n) => !isNaN(n));
      if (nums.length === values.length && nums.length > 0) {
        return {
          field: col.field,
          headerName: col.headerName,
          type: "numeric" as const,
          min: Math.min(...nums),
          max: Math.max(...nums),
        };
      }
      return {
        field: col.field,
        headerName: col.headerName,
        type: "text" as const,
      };
    });
  }, [columns, data]);

  return (
    <div className="data-preview">
      <header className="data-preview-header">
        <h2 className="data-preview-title">{title}</h2>
        <div className="data-preview-byline">
          <span className="data-preview-source">
            {domain}
            <span className="data-preview-dot"> / </span>
            {datasetId}
          </span>
          <span className="data-preview-dot">&middot;</span>
          <forge-badge theme="info-primary">
            {totalRows.toLocaleString()} rows
          </forge-badge>
          <span className="data-preview-dot">&middot;</span>
          <span className="data-preview-query" title={query}>
            {query}
          </span>
        </div>
      </header>

      <div className="data-preview-table-wrap">
        <table className="data-preview-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.field}>{col.headerName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.field}>{String(row[col.field] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {totalRows > PREVIEW_ROWS && (
          <div className="data-preview-truncated">
            Showing {PREVIEW_ROWS} of {totalRows.toLocaleString()} rows
          </div>
        )}
      </div>

      <div className="data-preview-stats">
        {columnStats.map((stat) => (
          <div key={stat.field} className="data-preview-stat">
            <span className="data-preview-stat-name">{stat.headerName}</span>
            {stat.type === "numeric" ? (
              <forge-badge theme="success">
                {stat.min?.toLocaleString()}&ndash;
                {stat.max?.toLocaleString()}
              </forge-badge>
            ) : (
              <forge-badge theme="default">text</forge-badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
