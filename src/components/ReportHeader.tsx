interface ReportHeaderProps {
  title: string;
  domain: string;
  datasetId: string;
  totalRows: number;
  query: string;
}

export function ReportHeader({
  title,
  domain,
  datasetId,
  totalRows,
  query,
}: ReportHeaderProps) {
  return (
    <header className="report-header">
      <h1 className="report-title">{title}</h1>
      <div className="report-byline">
        <span className="report-byline-source">
          {domain}
          <span className="report-byline-dot"> / </span>
          {datasetId}
        </span>
        <span className="report-byline-dot">&middot;</span>
        <span className="report-row-count">
          {totalRows.toLocaleString()} rows
        </span>
        <span className="report-byline-dot">&middot;</span>
        <span className="report-byline-query" title={query}>
          {query}
        </span>
      </div>
    </header>
  );
}
