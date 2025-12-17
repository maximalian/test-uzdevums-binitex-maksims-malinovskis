import type { ChangeEvent, FC } from "react";

type FieldKey = "cases" | "deaths" | "casesPer1000" | "deathsPer1000";

type FieldRangeFilterProps = {
  field: FieldKey;
  // Keep min/max as strings for now to allow easy validation messaging later
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
  const handleFieldChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextField = event.target.value as FieldKey;
    // DEBUG remove later: verify field change wiring
    console.log("FieldRangeFilter field changed:", nextField);
    onChangeField(nextField);
  };

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    // DEBUG remove later: verify min value wiring
    console.log("FieldRangeFilter min changed:", nextValue);
    onChangeMin(nextValue);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    // DEBUG remove later: verify max value wiring
    console.log("FieldRangeFilter max changed:", nextValue);
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
          className="form-control"
          // String-based input; numeric validation and red background will be added later
        />
      </label>

      <label className="d-flex flex-column" style={{ minWidth: 140 }}>
        <span className="form-label mb-1">значение до</span>
        <input
          type="text"
          value={maxValue}
          onChange={handleMaxChange}
          className="form-control"
          // String-based input; numeric validation and red background will be added later
        />
      </label>
    </div>
  );
};

export default FieldRangeFilter;
