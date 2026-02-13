import { useApp } from "@modelcontextprotocol/ext-apps/react";
import {
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { GridApi } from "ag-grid-community";
import { useCallback, useEffect, useRef, useState } from "react";

import { ReportHeader } from "./components/ReportHeader";
import { ReportToolbar } from "./components/ReportToolbar";
import { ReportGrid } from "./components/ReportGrid";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { useReportData } from "./hooks/useReportData";
import { exportHtml } from "./lib/export-html";

export function App() {
  const { status, reportData, errorMessage, registerHandlers } =
    useReportData();
  const [searchText, setSearchText] = useState("");
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const gridApiRef = useRef<GridApi | null>(null);

  const { app, error } = useApp({
    appInfo: { name: "Socrata Report", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      registerHandlers(app);

      app.onhostcontextchanged = (ctx) => {
        setHostContext((prev) => ({ ...prev, ...ctx }));
        if (ctx.theme) applyDocumentTheme(ctx.theme);
        if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
        if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
      };

      app.onteardown = async () => {
        gridApiRef.current = null;
        return {};
      };
    },
  });

  useEffect(() => {
    if (app) {
      const ctx = app.getHostContext();
      if (ctx) {
        setHostContext(ctx);
        if (ctx.theme) applyDocumentTheme(ctx.theme);
        if (ctx.styles?.variables)
          applyHostStyleVariables(ctx.styles.variables);
        if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
      }
    }
  }, [app]);

  const handleGridReady = useCallback((api: GridApi) => {
    gridApiRef.current = api;
  }, []);

  const handleExportCsv = useCallback(() => {
    if (!gridApiRef.current || !reportData) return;
    gridApiRef.current.exportDataAsCsv({
      fileName: `${reportData.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`,
    });
  }, [reportData]);

  const handleExportHtml = useCallback(() => {
    if (!gridApiRef.current || !reportData) return;
    const meta = `${reportData.domain} / ${reportData.datasetId} \u00b7 ${reportData.totalRows.toLocaleString()} rows \u00b7 Query: ${reportData.query}`;
    exportHtml(gridApiRef.current, reportData.title, meta);
  }, [reportData]);

  if (error) {
    return <ErrorState message={`Connection error: ${error.message}`} />;
  }

  const safeArea = hostContext?.safeAreaInsets;

  return (
    <div
      style={{
        padding: `${safeArea?.top ?? 0}px ${safeArea?.right ?? 0}px ${safeArea?.bottom ?? 0}px ${safeArea?.left ?? 0}px`,
      }}
    >
      {status === "loading" && <LoadingState />}

      {status === "error" && errorMessage && (
        <ErrorState message={errorMessage} />
      )}

      {status === "cancelled" && errorMessage && (
        <ErrorState message={errorMessage} />
      )}

      {status === "ready" && reportData && (
        <div className="report-card report-entrance">
          <div className="card-body">
            <ReportHeader
              title={reportData.title}
              domain={reportData.domain}
              datasetId={reportData.datasetId}
              totalRows={reportData.totalRows}
              query={reportData.query}
            />
            <ReportToolbar
              searchText={searchText}
              onSearchChange={setSearchText}
              onExportCsv={handleExportCsv}
              onExportHtml={handleExportHtml}
            />
          </div>
          <div className="card-grid">
            <ReportGrid
              columns={reportData.columns}
              rowData={reportData.data}
              quickFilterText={searchText}
              onGridReady={handleGridReady}
            />
          </div>
        </div>
      )}
    </div>
  );
}
