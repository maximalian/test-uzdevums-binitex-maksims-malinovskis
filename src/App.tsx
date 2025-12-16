import { useCallback, useEffect, useState } from "react";
import "./App.css";
import CountrySearch from "./components/FiltersBar/CountrySearch";
import CovidTable from "./components/CovidTable/CovidTable";
import DateRangeFilter from "./components/FiltersBar/DateRangeFilter";
import FieldRangeFilter from "./components/FiltersBar/FieldRangeFilter";
import ResetButton from "./components/FiltersBar/ResetButton";
import ViewTabs from "./components/ViewTabs/ViewTabs";
import type { CovidRecord } from "./types/covid";
import type { CountryRow } from "./types/stats";
import { fetchCovidData } from "./services/covidApi";
import { aggregateByCountry } from "./utils/aggregate";
import { getMinMaxDates } from "./utils/date";

type ViewValue = "table" | "chart";
type FieldKey = "cases" | "deaths" | "casesPer1000" | "deathsPer1000";

// Default stub dates for Stage 3; will be replaced with real min/max from data
const DEFAULT_MIN_DATE = new Date("2019-12-01");
const DEFAULT_MAX_DATE = new Date("2020-08-28");

function App() {
  // View mode toggle between table/chart
  const [view, setView] = useState<ViewValue>("table");
  // Date range state (stubbed defaults for now; will be replaced by fetched min/max)
  const [minDate, setMinDate] = useState<Date>(DEFAULT_MIN_DATE);
  const [maxDate, setMaxDate] = useState<Date>(DEFAULT_MAX_DATE);
  const [from, setFrom] = useState<Date>(DEFAULT_MIN_DATE);
  const [to, setTo] = useState<Date>(DEFAULT_MAX_DATE);
  // Country filter
  const [countryQuery, setCountryQuery] = useState("");
  // Field/value filters
  const [field, setField] = useState<FieldKey>("cases");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  // Stage 2 debug: track loaded row count to ensure data pipeline still works
  const [rowCount, setRowCount] = useState<number | null>(null);
  // Aggregated data and fetch status for table rendering
  const [aggregatedData, setAggregatedData] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data once to keep aggregation pipeline validated; will be connected to filters later
  useEffect(() => {
    const loadAndAggregate = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCovidData();
        const records: CovidRecord[] = data.records ?? [];
        if (!records.length) {
          throw new Error("No records returned from API.");
        }
        // Compute min/max dates from data to wire into filters on the next iteration
        const { min, max } = getMinMaxDates(records);
        setMinDate(min);
        setMaxDate(max);
        setFrom(min);
        setTo(max);

        const filters = {
          dateRange: { from: min, to: max },
          countryQuery: "",
        };
        const aggregated = aggregateByCountry(records, filters);

        // DEBUG: verify data loading + aggregation are still intact
        console.log("Loaded records:", records.length);
        console.log("Date range from data:", { min, max });
        console.log("Aggregated preview:", aggregated.slice(0, 3));

        setRowCount(records.length);
        setAggregatedData(aggregated);
      } catch (err) {
        console.error("Aggregation failed:", err);
        setAggregatedData([]);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadAndAggregate();
    // We intentionally omit dependencies to run only once for debug-loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleFieldChange = useCallback((next: FieldKey) => {
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

      {/* Date range filter block; will feed into data pipeline on next stage */}
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
          ) : (
            <CovidTable data={aggregatedData} />
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

      {/* Debug status: ensures data pipeline still runs while UI is a skeleton */}
      {rowCount !== null && (
        <p style={{ color: "#475569" }}>Loaded rows (debug): {rowCount}</p>
      )}
    </div>
  );
}

export default App;
