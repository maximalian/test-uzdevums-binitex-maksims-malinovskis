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

// Format a Date object into the YYYY-MM-DD string that <input type="date" /> expects.
const formatDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parse the YYYY-MM-DD value from the input into a Date (start of day).
const parseDateInputValue = (value: string): Date => {
  // Using T00:00:00 keeps the date consistent regardless of timezone offsets.
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
  const isCustomRange = from !== minDate || to !== maxDate;

  // Precompute formatted values to keep JSX tidy and avoid repeated formatting.
  const { fromValue, toValue, minValue, maxValue } = useMemo(
    () => ({
      fromValue: formatDateInputValue(from ?? minDate),
      toValue: formatDateInputValue(to ?? maxDate),
      minValue: formatDateInputValue(minDate),
      maxValue: formatDateInputValue(maxDate),
    }),
    [from, to, minDate, maxDate]
  );

  // Visual-only validation:
  // We do not clamp or block input because users can still type dates manually, and we must not
  // fight the native <input type="date"> UX; instead we highlight out-of-range values.
  const isFromInvalid = from.getTime() < minDate.getTime() || from.getTime() > maxDate.getTime();
  const isToInvalid = to.getTime() < minDate.getTime() || to.getTime() > maxDate.getTime();

  // Handle "from" date changes and propagate to the parent with the parsed Date.
  const handleFromChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseDateInputValue(event.target.value);
    onChangeFrom(parsed);
  };

  // Handle "to" date changes and propagate to the parent with the parsed Date.
  const handleToChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseDateInputValue(event.target.value);
    onChangeTo(parsed);
  };

  // UX shortcut: quickly reset the period to the full data range (does not affect other filters).
  const handleShowAllTime = () => {
    onChangeFrom(minDate);
    onChangeTo(maxDate);
  };

  return (
    <div className="d-flex flex-wrap gap-3 align-items-end">
      <label className="d-flex flex-column filter-w-180">
        <span className="form-label mb-1">Period from</span>

        <div className="has-validation">
          <input
            type="date"
            value={fromValue}
            min={minValue}
            max={maxValue}
            onChange={handleFromChange}
            className={`form-control${isFromInvalid ? " is-invalid" : ""}`}
          />
          <div className="invalid-feedback">Date is out of range</div>
        </div>
      </label>

      <label className="d-flex flex-column filter-w-180">
        <span className="form-label mb-1">to</span>

        <div className="has-validation">
          <input
            type="date"
            value={toValue}
            min={minValue}
            max={maxValue}
            onChange={handleToChange}
            className={`form-control${isToInvalid ? " is-invalid" : ""}`}
          />
          <div className="invalid-feedback">Date is out of range</div>
        </div>
      </label>

      <div className="d-flex flex-column filter-w-180">
        <span className="form-label mb-1">&nbsp;</span>
        {isCustomRange && (
          <>
            {/* UX requirement: show the button only when the period differs from minDate/maxDate. */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleShowAllTime}
            >
              Show full range
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
