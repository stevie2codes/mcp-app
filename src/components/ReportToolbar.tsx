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
        <input
          type="text"
          placeholder="Search all columns..."
          value={searchText}
          onInput={handleInput}
        />
      </forge-text-field>
      <div className="toolbar-actions">
        <forge-button variant="outlined" dense onClick={onExportCsv}>
          Export CSV
        </forge-button>
        <forge-button variant="outlined" dense onClick={onExportHtml}>
          Export HTML
        </forge-button>
      </div>
    </div>
  );
}
