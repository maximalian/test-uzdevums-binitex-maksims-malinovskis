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
      style={{
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      Сбросить фильтры
    </button>
  );
};

export default ResetButton;
