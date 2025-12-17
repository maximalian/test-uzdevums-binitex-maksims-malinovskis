import type { FC, MouseEvent } from "react";

type ResetButtonProps = {
  onReset: () => void;
  disabled?: boolean;
};

const ResetButton: FC<ResetButtonProps> = ({ onReset, disabled = false }) => {
  // Button to reset filters back to their default values
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // DEBUG remove later: confirm reset wiring
    console.log("Reset clicked");
    onReset();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="btn btn-outline-secondary"
      // `btn-outline-secondary` is noticeable but not "danger" (reset is reversible and not destructive).
    >
      Сбросить фильтры
    </button>
  );
};

export default ResetButton;
