interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="error-container">
      <p className="error">{message}</p>
    </div>
  );
}
