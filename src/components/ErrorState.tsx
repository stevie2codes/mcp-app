interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="error-card">
      <forge-inline-message theme="error">
        <forge-icon slot="icon" name="error_outline" />
        <span slot="title">Error</span>
        {message}
      </forge-inline-message>
    </div>
  );
}
