import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import CountrySearch from "./components/FiltersBar/CountrySearch";
import CovidTable from "./components/CovidTable/CovidTable";
import DateRangeFilter from "./components/FiltersBar/DateRangeFilter";
import FieldRangeFilter from "./components/FiltersBar/FieldRangeFilter";
import ResetButton from "./components/FiltersBar/ResetButton";
import ViewTabs from "./components/ViewTabs/ViewTabs";
import type { CovidRecord } from "./types/covid";
import type { NumericFilterField } from "./types/stats";
import { fetchCovidData } from "./services/covidApi";
import { aggregateByCountry } from "./utils/aggregate";
import { getMinMaxDates } from "./utils/date";

type ViewValue = "table" | "chart";

// Default stub dates for Stage 3; will be replaced with real min/max from data
const DEFAULT_MIN_DATE = new Date("2019-12-01");
const DEFAULT_MAX_DATE = new Date("2020-08-28");

function App() {
  // State: raw records + loading/error
  const [records, setRecords] = useState<CovidRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State: view mode toggle between table/chart
  const [view, setView] = useState<ViewValue>("table");

  // State: date range (defaults will be replaced by fetched min/max)
  const [minDate, setMinDate] = useState<Date>(DEFAULT_MIN_DATE);
  const [maxDate, setMaxDate] = useState<Date>(DEFAULT_MAX_DATE);
  const [from, setFrom] = useState<Date>(DEFAULT_MIN_DATE);
  const [to, setTo] = useState<Date>(DEFAULT_MAX_DATE);

  // State: country filter
  const [countryQuery, setCountryQuery] = useState("");

  // State: numeric field/min/max filters
  const [field, setField] = useState<NumericFilterField>("cases");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  // Load data once; compute min/max to seed default filters.
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCovidData();
        const incoming: CovidRecord[] = data.records ?? [];
        if (!incoming.length) {
          throw new Error("No records returned from API.");
        }

        const { min, max } = getMinMaxDates(incoming);
        setRecords(incoming);
        setMinDate(min);
        setMaxDate(max);

        // default filters: set range to full data span on first load
        setFrom(min);
        setTo(max);

        // DEBUG: verify data arrival
        console.log("[App] Loaded records:", incoming.length);
        console.log("[App] Date bounds:", { min, max });
      } catch (err) {
        console.error("Data load failed:", err);
        setRecords([]);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChangeView = useCallback((next: ViewValue) => {
    // DEBUG remove later: log view changes
    console.log("App view changed:", next);
    setView(next);
  }, []);

  const handleChangeFrom = useCallback((next: Date) => {
    // DEBUG remove later: log date changes
    console.log("App from date changed:", next);
    setFrom(next);
  }, []);

  const handleChangeTo = useCallback((next: Date) => {
    // DEBUG remove later: log date changes
    console.log("App to date changed:", next);
    setTo(next);
  }, []);

  const handleCountryChange = useCallback((next: string) => {
    // DEBUG remove later: log country search input
    console.log("App countryQuery changed:", next);
    setCountryQuery(next);
  }, []);

  const handleFieldChange = useCallback((next: NumericFilterField) => {
    // DEBUG remove later: log field change
    console.log("App field changed:", next);
    setField(next);
  }, []);

  const handleMinValueChange = useCallback((next: string) => {
    // DEBUG remove later: log min value change
    console.log("App minValue changed:", next);
    setMinValue(next);
  }, []);

  const handleMaxValueChange = useCallback((next: string) => {
    // DEBUG remove later: log max value change
    console.log("App maxValue changed:", next);
    setMaxValue(next);
  }, []);

  const handleReset = useCallback(() => {
    // Reset all filters back to defaults (date range + field filters)
    console.log("App reset triggered"); // DEBUG remove later
    setCountryQuery("");
    setField("cases");
    setMinValue("");
    setMaxValue("");
    setFrom(minDate);
    setTo(maxDate);
  }, [maxDate, minDate]);

  // Filters object memoized for stable refs and easier logging.
  const filters = useMemo(
    () => ({
      dateRange: { from, to },
      countryQuery,
      numericFilter: {
        field,
        min: minValue,
        max: maxValue,
      },
    }),
    [countryQuery, field, from, maxValue, minValue, to]
  );

  // Aggregation memoized for performance; recompute when records or any filter changes.
  const rows = useMemo(() => {
    if (!records.length) return [];
    return aggregateByCountry(records, filters);
  }, [filters, records]);

  // DEBUG logs: track filter changes and resulting row count.
  useEffect(() => {
    console.debug("[App] Filters updated:", filters);
  }, [filters]);

  useEffect(() => {
    console.debug("[App] Rows recomputed:", rows.length);
  }, [rows]);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1080px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h1>COVID-19 Statistics</h1>

      {/* Date range filter block; feeds date state into aggregation */}
      <DateRangeFilter
        from={from}
        to={to}
        minDate={minDate}
        maxDate={maxDate}
        onChangeFrom={handleChangeFrom}
        onChangeTo={handleChangeTo}
      />

      {/* View tabs switcher (table/chart modes) */}
      <ViewTabs value={view} onChange={handleChangeView} />

      {view === "table" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Table view filters: country search + numeric range + reset */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <CountrySearch value={countryQuery} onChange={handleCountryChange} />
            <FieldRangeFilter
              field={field}
              minValue={minValue}
              maxValue={maxValue}
              onChangeField={handleFieldChange}
              onChangeMin={handleMinValueChange}
              onChangeMax={handleMaxValueChange}
            />
            <ResetButton onReset={handleReset} />
          </div>

          {/* Data table UI: show loading/error states, otherwise render the CovidTable with aggregated data */}
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : rows.length === 0 ? (
            <p>Ничего не найдено</p>
          ) : (
            <CovidTable data={rows} />
          )}
        </div>
      ) : (
        // Chart view placeholder to be replaced with real chart component
        <div
          style={{
            padding: "12px",
            border: "1px dashed #cbd5e1",
            borderRadius: "8px",
          }}
        >
          Chart will be here
        </div>
      )}
    </div>
  );
}

export default App;
