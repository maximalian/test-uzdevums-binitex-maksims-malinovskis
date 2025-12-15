import type { ChangeEvent, FC } from "react";
import { useMemo } from "react";

type DateRangeFilterProps = {
  from: Date;
  to: Date;
  minDate: Date;
  maxDate: Date;
  onChangeFrom: (newDate: Date) => void;
  onChangeTo: (newDate: Date) => void;
};

// Format a Date object into the YYYY-MM-DD string that <input type="date" /> expects
const formatDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parse the YYYY-MM-DD value from the input into a Date (start of day)
const parseDateInputValue = (value: string): Date => {
  // Using T00:00:00 keeps the date consistent regardless of timezone offsets
  return new Date(`${value}T00:00:00`);
};

const DateRangeFilter: FC<DateRangeFilterProps> = ({
  from,
  to,
  minDate,
  maxDate,
  onChangeFrom,
  onChangeTo,
}) => {
  // Precompute formatted values to keep JSX tidy and avoid repeated formatting
  const { fromValue, toValue, minValue, maxValue } = useMemo(
    () => ({
      fromValue: formatDateInputValue(from ?? minDate),
      toValue: formatDateInputValue(to ?? maxDate),
      minValue: formatDateInputValue(minDate),
      maxValue: formatDateInputValue(maxDate),
    }),
    [from, to, minDate, maxDate]
  );

  // Handle "from" date changes and propagate to parent with parsed Date
  const handleFromChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseDateInputValue(event.target.value);
    // DEBUG: log that the "from" date changed
    console.log("DateRangeFilter from changed:", parsed);
    onChangeFrom(parsed);
  };

  // Handle "to" date changes and propagate to parent with parsed Date
  const handleToChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseDateInputValue(event.target.value);
    // DEBUG: log that the "to" date changed
    console.log("DateRangeFilter to changed:", parsed);
    onChangeTo(parsed);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-end",
      }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>Период от</span>
        <input
          type="date"
          value={fromValue}
          min={minValue}
          max={maxValue}
          onChange={handleFromChange}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>до</span>
        <input
          type="date"
          value={toValue}
          min={minValue}
          max={maxValue}
          onChange={handleToChange}
        />
      </label>
    </div>
  );
};

export default DateRangeFilter;
