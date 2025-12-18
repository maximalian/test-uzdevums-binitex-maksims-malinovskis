import type { ChangeEvent, FC } from "react";

type FieldKey = "cases" | "deaths" | "casesPer1000" | "deathsPer1000";

type FieldRangeFilterProps = {
  field: FieldKey;
  // `minValue`/`maxValue` intentionally stay `string`:
  // users can type intermediate states like "-" / "." / "1e" and we must not block input.
  // Parsing/validation for business filtering happens elsewhere; here we only show UI state.
  minValue: string;
  maxValue: string;
  onChangeField: (field: FieldKey) => void;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
};

const FieldRangeFilter: FC<FieldRangeFilterProps> = ({
  field,
  minValue,
  maxValue,
  onChangeField,
  onChangeMin,
  onChangeMax,
}) => {
  // Visual-only validation:
  // we do NOT change filtering logic and do NOT block typing; we only add Bootstrap `is-invalid`.
  const isValueValid = (value: string) => value === "" || !Number.isNaN(Number(value));

  const minIsValid = isValueValid(minValue);
  const maxIsValid = isValueValid(maxValue);

  const handleFieldChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextField = event.target.value as FieldKey;
    onChangeField(nextField);
  };

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChangeMin(nextValue);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChangeMax(nextValue);
  };

  return (
    <div className="d-flex flex-wrap gap-3 align-items-end">
      <label className="d-flex flex-column" style={{ minWidth: 220 }}>
        <span className="form-label mb-1">Фильтровать по полю</span>
        <select value={field} onChange={handleFieldChange} className="form-select">
          <option value="cases">cases</option>
          <option value="deaths">deaths</option>
          <option value="casesPer1000">casesPer1000</option>
          <option value="deathsPer1000">deathsPer1000</option>
        </select>
      </label>

      <label className="d-flex flex-column" style={{ minWidth: 140 }}>
        <span className="form-label mb-1">значение от</span>
        <input
          type="text"
          value={minValue}
          onChange={handleMinChange}
          className={`form-control${minIsValid ? "" : " is-invalid"}`}
        />
        <div className="invalid-feedback">Введите числовое значение</div>
      </label>

      <label className="d-flex flex-column" style={{ minWidth: 140 }}>
        <span className="form-label mb-1">значение до</span>
        <input
          type="text"
          value={maxValue}
          onChange={handleMaxChange}
          className={`form-control${maxIsValid ? "" : " is-invalid"}`}
        />
        <div className="invalid-feedback">Введите числовое значение</div>
      </label>
    </div>
  );
};

export default FieldRangeFilter;
