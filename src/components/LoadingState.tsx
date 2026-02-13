export function LoadingState() {
  return (
    <div className="loading">
      <div className="loading-content">
        <forge-linear-progress indeterminate />
        <p>Waiting for report data...</p>
      </div>
    </div>
  );
}
