import type { FC } from "react";

type ErrorStateProps = {
  message: string;
};

// Reusable error UI keeps App.tsx focused on data/logic and provides consistent UX across the app.
const ErrorState: FC<ErrorStateProps> = ({ message }) => {
  return (
    <div className="alert alert-danger mb-0" role="alert">
      {message}
    </div>
  );
};

export default ErrorState;

