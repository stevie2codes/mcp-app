import type { App } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { useCallback, useState } from "react";

export interface ReportColumn {
  field: string;
  headerName: string;
}

export interface ReportData {
  title: string;
  domain: string;
  datasetId: string;
  columns: ReportColumn[];
  data: Record<string, unknown>[];
  totalRows: number;
  query: string;
}

export type ReportStatus = "loading" | "ready" | "error" | "cancelled";

interface ReportState {
  status: ReportStatus;
  reportData: ReportData | null;
  errorMessage: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function useReportData() {
  const [state, setState] = useState<ReportState>({
    status: "loading",
    reportData: null,
    errorMessage: null,
  });

  const registerHandlers = useCallback((app: App) => {
    app.ontoolinput = (params) => {
      console.info("Received tool input:", params);
    };

    app.ontoolresult = (result) => {
      console.info("Received tool result:", result);
      const structured = (result as CallToolResult).structuredContent as
        | ReportData
        | undefined;

      if (structured?.data) {
        setState({
          status: "ready",
          reportData: structured,
          errorMessage: null,
        });
      } else {
        setState({
          status: "error",
          reportData: null,
          errorMessage:
            "No data returned. The query may have returned empty results or an error occurred.",
        });
      }
    };

    app.ontoolcancelled = () => {
      setState({
        status: "cancelled",
        reportData: null,
        errorMessage: "Report generation was cancelled.",
      });
    };

    app.onerror = (error) => {
      console.error("App error:", error);
      setState({
        status: "error",
        reportData: null,
        errorMessage: `Error: ${escapeHtml(String(error))}`,
      });
    };
  }, []);

  return { ...state, registerHandlers };
}
