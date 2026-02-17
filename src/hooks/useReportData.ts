import type { App } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { useCallback, useState } from "react";
import type { Template } from "../types/template";

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
  template?: Template;
  availableTemplates?: Template[];
}

export type TemplateSelection =
  | { kind: "none" }
  | { kind: "no-template" }
  | { kind: "template"; value: Template };

export type ReportStatus =
  | "loading"
  | "preview"
  | "ready"
  | "error"
  | "cancelled";

interface ReportState {
  status: ReportStatus;
  reportData: ReportData | null;
  errorMessage: string | null;
  selection: TemplateSelection;
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
    selection: { kind: "none" },
  });

  const handleSelectTemplate = useCallback(
    (selection: TemplateSelection) => {
      setState((prev) => ({ ...prev, selection }));
    },
    [],
  );

  const handleConfirmTemplate = useCallback(() => {
    setState((prev) => {
      if (!prev.reportData || prev.selection.kind === "none") return prev;
      return {
        ...prev,
        status: "ready" as const,
        reportData: {
          ...prev.reportData,
          template:
            prev.selection.kind === "template"
              ? prev.selection.value
              : undefined,
        },
        selection: { kind: "none" },
      };
    });
  }, []);

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
        const goToPreview =
          Array.isArray(structured.availableTemplates) &&
          structured.availableTemplates.length > 0;

        setState({
          status: goToPreview ? "preview" : "ready",
          reportData: structured,
          errorMessage: null,
          selection: goToPreview ? { kind: "no-template" } : { kind: "none" },
        });
      } else {
        setState({
          status: "error",
          reportData: null,
          errorMessage:
            "No data returned. The query may have returned empty results or an error occurred.",
          selection: { kind: "none" },
        });
      }
    };

    app.ontoolcancelled = () => {
      setState({
        status: "cancelled",
        reportData: null,
        errorMessage: "Report generation was cancelled.",
        selection: { kind: "none" },
      });
    };

    app.onerror = (error) => {
      console.error("App error:", error);
      setState({
        status: "error",
        reportData: null,
        errorMessage: `Error: ${escapeHtml(String(error))}`,
        selection: { kind: "none" },
      });
    };
  }, []);

  return {
    ...state,
    registerHandlers,
    onSelectTemplate: handleSelectTemplate,
    onConfirmTemplate: handleConfirmTemplate,
  };
}
