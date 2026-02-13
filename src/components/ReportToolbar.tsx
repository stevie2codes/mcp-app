import { useCallback } from "react";

interface ReportToolbarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onExportCsv: () => void;
  onExportHtml: () => void;
}

export function ReportToolbar({
  searchText,
  onSearchChange,
  onExportCsv,
  onExportHtml,
}: ReportToolbarProps) {
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      onSearchChange((e.target as HTMLInputElement).value);
    },
    [onSearchChange],
  );

  return (
    <div className="report-toolbar-row">
      <forge-text-field className="search-field" dense>
        <forge-icon
          slot="start"
          name="search"
          style={{ "--forge-icon-size": "18px" } as React.CSSProperties}
        />
        <input
          type="text"
          placeholder="Search all columns..."
          value={searchText}
          onInput={handleInput}
        />
      </forge-text-field>

      <forge-divider vertical className="toolbar-divider" />

      <div className="toolbar-actions">
        <forge-button variant="outlined" dense onClick={onExportCsv} id="btn-csv">
          <forge-icon
            slot="start"
            name="download"
            style={{ "--forge-icon-size": "16px" } as React.CSSProperties}
          />
          CSV
        </forge-button>
        <forge-tooltip anchor="btn-csv" placement="bottom" delay={300}>
          Export filtered data as CSV
        </forge-tooltip>

        <forge-button variant="tonal" dense onClick={onExportHtml} id="btn-html">
          <forge-icon
            slot="start"
            name="code"
            style={{ "--forge-icon-size": "16px" } as React.CSSProperties}
          />
          HTML
        </forge-button>
        <forge-tooltip anchor="btn-html" placement="bottom" delay={300}>
          Export as styled HTML table
        </forge-tooltip>
      </div>
    </div>
  );
}
