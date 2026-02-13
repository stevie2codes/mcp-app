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
    <forge-toolbar className="report-toolbar">
      <forge-text-field className="search-field" dense>
        <input
          type="text"
          placeholder="Search across all columns..."
          value={searchText}
          onInput={handleInput}
        />
      </forge-text-field>
      <div className="toolbar-actions" slot="end">
        <forge-button variant="outlined" dense onClick={onExportCsv}>
          Export CSV
        </forge-button>
        <forge-button variant="outlined" dense onClick={onExportHtml}>
          Export HTML
        </forge-button>
      </div>
    </forge-toolbar>
  );
}
