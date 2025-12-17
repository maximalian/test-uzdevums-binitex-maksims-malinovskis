import type { ChangeEvent, FC } from "react";
import { useMemo } from "react";

type CountrySelectProps = {
  countries: string[];
  value: string; // empty string means "all countries"
  onChange: (value: string) => void;
};

const CountrySelect: FC<CountrySelectProps> = ({ countries, value, onChange }) => {
  // Keep dropdown options sorted without mutating the incoming prop.
  const sortedCountries = useMemo(() => [...countries].sort((a, b) => a.localeCompare(b)), [countries]);

  // DEBUG: trace currently selected value on each render.
  if (import.meta.env?.DEV) {
    console.debug("[CountrySelect] value", value);
  }

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="d-flex flex-column" style={{ maxWidth: 320 }}>
      <span className="form-label mb-1">Страна</span>
      <select
        value={value}
        onChange={handleChange}
        className="form-select"
        // Dropdown: first option uses '' to represent "all countries" so aggregations can include everyone.
      >
        <option value="">Все страны</option>
        {sortedCountries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </label>
  );
};

export default CountrySelect;
