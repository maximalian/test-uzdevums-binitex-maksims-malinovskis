import type { FC, MouseEvent } from "react";
import { useCallback, useMemo } from "react";

type ViewValue = "table" | "chart";

type ViewTabsProps = {
  value: ViewValue;
  onChange: (value: ViewValue) => void;
};

const ViewTabs: FC<ViewTabsProps> = ({ value, onChange }) => {
  // List of available view modes; this component toggles between table and chart displays.
  const tabs = useMemo(
    () => [
      { key: "table" as const, label: "Table" },
      { key: "chart" as const, label: "Chart" },
    ],
    []
  );

  const handleClick = useCallback(
    (next: ViewValue) =>
      (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (next === value) return;
        onChange(next);
      },
    [onChange, value]
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid #ddd",
        paddingBottom: "4px",
      }}
    >
      {tabs.map(({ key, label }) => {
        const isActive = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={handleClick(key)}
            style={{
              padding: "8px 12px",
              border: "none",
              borderBottom: isActive ? "2px solid #1976d2" : "2px solid transparent",
              backgroundColor: isActive ? "#e8f1fb" : "transparent",
              color: "#0f172a",
              cursor: isActive ? "default" : "pointer",
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ViewTabs;
