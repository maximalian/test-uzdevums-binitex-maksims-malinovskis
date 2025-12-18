import type { ChangeEvent, FC } from "react";
import { useEffect, useMemo, useRef } from "react";

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
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const isCustomRange = from !== minDate || to !== maxDate;

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

  // Visual-only validation:
  // we do NOT clamp or block input because users can still type dates manually and we must not
  // "fight" the native <input type="date"> UX; instead we highlight out-of-range values.
  const isFromInvalid = from.getTime() < minDate.getTime() || from.getTime() > maxDate.getTime();
  const isToInvalid = to.getTime() < minDate.getTime() || to.getTime() > maxDate.getTime();

  // Limiting `min`/`max` is important: it prevents selecting dates outside the dataset range
  // and avoids confusing "no data" states without changing any business logic.
  useEffect(() => {
    // DEBUG remove later: verify API-provided dataset bounds
    console.log("DateRangeFilter bounds (min/max):", { minValue, maxValue });
  }, [minValue, maxValue]);

  useEffect(() => {
    // DEBUG remove later: verify current values vs bounds
    console.debug("DateRangeFilter dates (from/to/min/max):", {
      from,
      to,
      minDate,
      maxDate,
      isCustomRange,
      isFromInvalid,
      isToInvalid,
    });
  }, [from, to, minDate, maxDate, isCustomRange, isFromInvalid, isToInvalid]);

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

  // UX shortcut: quickly reset the period to the full data range (doesn't affect other filters).
  const handleShowAllTime = () => {
    onChangeFrom(minDate);
    onChangeTo(maxDate);
  };

  return (
    <div className="d-flex flex-wrap gap-3 align-items-end">
      <label className="d-flex flex-column" style={{ minWidth: 180 }}>
        <span className="form-label mb-1">Период от</span>

        {/* Calendar icon makes the native date picker more noticeable without changing existing input styles. */}
        <div className="input-group has-validation">
          <input
            ref={fromInputRef}
            type="date"
            value={fromValue}
            min={minValue}
            max={maxValue}
            onChange={handleFromChange}
            className={`form-control${isFromInvalid ? " is-invalid" : ""}`}
          />
          <span
            className="input-group-text"
            role="button"
            tabIndex={0}
            aria-label="Открыть календарь (дата начала)"
            onClick={() => {
              fromInputRef.current?.focus();
              fromInputRef.current?.showPicker?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fromInputRef.current?.focus();
                fromInputRef.current?.showPicker?.();
              }
            }}
          >
            {"\u{1F4C5}"}
          </span>
          <div className="invalid-feedback">Дата вне допустимого диапазона</div>
        </div>
      </label>

      <label className="d-flex flex-column" style={{ minWidth: 180 }}>
        <span className="form-label mb-1">до</span>

        {/* Calendar icon makes the native date picker more noticeable without changing existing input styles. */}
        <div className="input-group has-validation">
          <input
            ref={toInputRef}
            type="date"
            value={toValue}
            min={minValue}
            max={maxValue}
            onChange={handleToChange}
            className={`form-control${isToInvalid ? " is-invalid" : ""}`}
          />
          <span
            className="input-group-text"
            role="button"
            tabIndex={0}
            aria-label="Открыть календарь (дата окончания)"
            onClick={() => {
              toInputRef.current?.focus();
              toInputRef.current?.showPicker?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toInputRef.current?.focus();
                toInputRef.current?.showPicker?.();
              }
            }}
          >
            {"\u{1F4C5}"}
          </span>
          <div className="invalid-feedback">Дата вне допустимого диапазона</div>
        </div>
      </label>

      <div className="d-flex flex-column" style={{ minWidth: 180 }}>
        <span className="form-label mb-1">&nbsp;</span>
        {isCustomRange && (
          <>
            {/* UX-требование задания: показываем кнопку только когда период отличается от minDate/maxDate. */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleShowAllTime}
            >
              Показать всё время
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
