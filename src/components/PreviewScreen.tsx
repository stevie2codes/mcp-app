import { useState, useCallback } from "react";
import type { ReportData, TemplateSelection } from "../hooks/useReportData";
import { DataPreview } from "./DataPreview";
import { TemplatePicker } from "./TemplatePicker";

interface PreviewScreenProps {
  reportData: ReportData;
  selection: TemplateSelection;
  onSelect: (selection: TemplateSelection) => void;
  onConfirm: () => void;
}

export function PreviewScreen({
  reportData,
  selection,
  onSelect,
  onConfirm,
}: PreviewScreenProps) {
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
  const canCreate = selection.kind === "no-template" || selection.kind === "template";

  const handleToggleTemplates = useCallback(() => {
    setIsTemplateExpanded((prev) => {
      const next = !prev;
      if (!next) {
        onSelect({ kind: "no-template" });
      }
      return next;
    });
  }, [onSelect]);

  return (
    <div className="preview-screen preview-entrance">
      <div className="preview-card">
        <div className="preview-section preview-section--data">
          <div className="preview-section-label">
            <forge-icon
              name="table_chart"
              style={{ "--forge-icon-size": "14px" } as React.CSSProperties}
            />
            Data Preview
          </div>
          <DataPreview
            title={reportData.title}
            domain={reportData.domain}
            datasetId={reportData.datasetId}
            columns={reportData.columns}
            data={reportData.data}
            totalRows={reportData.totalRows}
            query={reportData.query}
          />
        </div>

        <forge-divider />

        <button
          className={`template-toggle${isTemplateExpanded ? " template-toggle--expanded" : ""}`}
          onClick={handleToggleTemplates}
          aria-expanded={isTemplateExpanded}
          aria-controls="template-section"
        >
          <div className="template-toggle-label">
            <forge-icon
              name="style"
              style={{ "--forge-icon-size": "14px" } as React.CSSProperties}
            />
            Customize with template
          </div>
          <forge-icon
            name="expand_more"
            className="template-toggle-chevron"
            style={{ "--forge-icon-size": "20px" } as React.CSSProperties}
          />
        </button>

        <div
          id="template-section"
          className={`template-reveal${isTemplateExpanded ? " template-reveal--open" : ""}`}
          aria-hidden={!isTemplateExpanded}
        >
          <div className="preview-section preview-section--templates">
            <TemplatePicker
              templates={reportData.availableTemplates ?? []}
              selection={selection}
              onSelect={onSelect}
            />
          </div>
        </div>

        <div className="preview-footer">
          <forge-button
            variant="raised"
            disabled={!canCreate || undefined}
            onClick={onConfirm}
          >
            <forge-icon
              slot="start"
              name="assessment"
              style={{ "--forge-icon-size": "18px" } as React.CSSProperties}
            />
            Create Report
          </forge-button>
          {selection.kind === "template" && (
            <forge-badge theme="info-primary">
              {selection.value.name}
            </forge-badge>
          )}
        </div>
      </div>
    </div>
  );
}
