export function LoadingState() {
  return (
    <div className="loading-card">
      <div className="loading-body">
        <div className="loading-header">
          <div className="loading-title-bar" />
          <div className="loading-meta-bar" />
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
