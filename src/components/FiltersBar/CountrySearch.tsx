import type { ChangeEvent, FC } from "react";
import { useCallback } from "react";

type CountrySearchProps = {
  value: string;
  onChange: (value: string) => void;
};

const CountrySearch: FC<CountrySearchProps> = ({ value, onChange }) => {
  // Controlled input: value is driven by parent state, and we propagate changes upward.
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      onChange(nextValue);
    },
    [onChange]
  );

  return (
    <label className="d-flex flex-column filter-w-220">
      <span className="form-label mb-1">Поиск страны</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Введите страну..."
        className="form-control"
        // Controlled input that will later feed into table and chart filtering.
      />
    </label>
  );
};

export default CountrySearch;
