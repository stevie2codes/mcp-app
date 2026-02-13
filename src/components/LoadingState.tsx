export function LoadingState() {
  return (
    <div className="loading-card">
      <div className="loading-body">
        <div className="loading-header">
          <forge-skeleton
            text
            style={
              {
                "--forge-skeleton-width": "240px",
                "--forge-skeleton-height": "18px",
              } as React.CSSProperties
            }
          />
          <forge-skeleton
            text
            style={
              {
                "--forge-skeleton-width": "70%",
                "--forge-skeleton-height": "12px",
                marginTop: "10px",
              } as React.CSSProperties
            }
          />
        </div>

        <div className="loading-progress-area">
          <forge-linear-progress indeterminate />
          <p className="loading-label">Fetching report data</p>
        </div>
      </div>

      <div className="loading-skeleton-grid">
        <div className="skeleton-header-row">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton-header-cell" />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton-row">
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j} className="skeleton-cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
