// Reusable loading UI keeps App.tsx clean and makes it easy to share the same UX across screens.
export default function LoadingState() {
  return (
    <div className="d-flex align-items-center gap-2 text-muted" role="status" aria-live="polite">
      <div className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}

