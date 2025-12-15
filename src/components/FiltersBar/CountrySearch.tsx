import type { ChangeEvent, FC } from "react";
import { useCallback } from "react";

type CountrySearchProps = {
  value: string;
  onChange: (value: string) => void;
};

const CountrySearch: FC<CountrySearchProps> = ({ value, onChange }) => {
  // Controlled input: value is driven by parent state, and we propagate changes upward
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      // DEBUG remove later: track user input to verify onChange wiring
      console.log("CountrySearch value changed:", nextValue);
      onChange(nextValue);
    },
    [onChange]
  );

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span>Поиск страны</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Введите страну..."
        // Controlled input that will later feed into table/chart filtering
      />
    </label>
  );
};

export default CountrySearch;
