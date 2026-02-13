interface ReportHeaderProps {
  title: string;
  meta: string;
}

export function ReportHeader({ title, meta }: ReportHeaderProps) {
  return (
    <header className="report-header">
      <h1>{title}</h1>
      <p className="report-meta">{meta}</p>
    </header>
  );
}
