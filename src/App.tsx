import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import CountrySearch from "./components/FiltersBar/CountrySearch";
import CovidTable from "./components/CovidTable/CovidTable";
import DateRangeFilter from "./components/FiltersBar/DateRangeFilter";
import FieldRangeFilter from "./components/FiltersBar/FieldRangeFilter";
import FiltersPanel from "./components/FiltersBar/FiltersPanel";
import ResetButton from "./components/FiltersBar/ResetButton";
import ViewTabs from "./components/ViewTabs/ViewTabs";
import CovidChart from "./components/CovidChart/CovidChart";
import CountrySelect from "./components/CovidChart/CountrySelect";
import ErrorState from "./components/common/ErrorState";
import LoadingState from "./components/common/LoadingState";
import type { CovidRecord } from "./types/covid";
import type { NumericFilterField } from "./types/stats";
import { fetchCovidData } from "./services/covidApi";
import { aggregateByCountry } from "./utils/aggregate";
import { getMinMaxDates } from "./utils/date";
import { buildTimeSeries } from "./utils/series";

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

  // Chart state: selected country for the chart (empty string => all countries)
  const [selectedCountry, setSelectedCountry] = useState<string>("");

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

  const handleSelectedCountryChange = useCallback((next: string) => {
    // DEBUG: track selected country for chart view
    console.log("App selectedCountry changed:", next);
    setSelectedCountry(next);
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

  // Country list for the chart dropdown: unique names from raw records, sorted.
  const countryOptions = useMemo(() => {
    const unique = new Set<string>();
    records.forEach((r) => unique.add(r.countriesAndTerritories));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [records]);

  // Aggregation memoized for performance; recompute when records or any filter changes.
  const rows = useMemo(() => {
    if (!records.length) return [];
    return aggregateByCountry(records, filters);
  }, [filters, records]);

  // Chart time series uses raw records + dateRange + selectedCountry; recomputes on those changes.
  const chartData = useMemo(() => {
    if (!records.length) return [];
    return buildTimeSeries(records, filters, selectedCountry === "" ? null : selectedCountry);
  }, [filters, records, selectedCountry]);

  // DEBUG logs: track filter changes and resulting row count.
  useEffect(() => {
    console.debug("[App] Filters updated:", filters);
  }, [filters]);

  useEffect(() => {
    console.debug("[App] Rows recomputed:", rows.length);
  }, [rows]);

  useEffect(() => {
    console.debug("[App] Chart data recomputed:", chartData.length);
  }, [chartData]);

  // Loading/Error UI is extracted into separate components for reusability and a cleaner App.tsx.
  const showLoading = loading;
  const showError = !loading && error;

  return (
    // Layout wrapper
    <div className="container py-4">
      <div className="d-flex flex-column gap-3">
        {/* Header */}
        <header className="mb-2">
          <h1 className="h3 mb-1">COVID-19 Statistics</h1>
          <div className="text-muted small">Test task</div>
        </header>

        {showLoading ? (
          <div className="card shadow-sm">
            <div className="card-body">
              <LoadingState />
            </div>
          </div>
        ) : showError ? (
          <div className="card shadow-sm">
            <div className="card-body">
              <ErrorState message={`Error: ${error ?? "Unknown error"}`} />
            </div>
          </div>
        ) : (
          <>
            {/* Filters panel */}
            <div className="d-flex flex-column gap-3 mb-2">
              {/* Date range filter block; feeds date state into aggregation */}
              <div>
                <DateRangeFilter
                  from={from}
                  to={to}
                  minDate={minDate}
                  maxDate={maxDate}
                  onChangeFrom={handleChangeFrom}
                  onChangeTo={handleChangeTo}
                />
              </div>

              {/* View tabs switcher (table/chart modes) */}
              <div>
                <ViewTabs value={view} onChange={handleChangeView} />
              </div>

              {view === "table" ? (
                <FiltersPanel title="Table filters">
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
                </FiltersPanel>
              ) : null}
            </div>

            {/* Content card */}
            <div className="card shadow-sm">
              <div className="card-body">
                {view === "table" ? (
                  rows.length === 0 ? (
                    <div className="alert alert-warning mb-0" role="alert">
                      Ничего не найдено
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Rows: {rows.length}</span>
                      </div>
                      <CovidTable data={rows} />
                    </>
                  )
                ) : (
                  // Chart view: Country selector + time series chart reacting to dateRange + selectedCountry.
                  <div className="d-flex flex-column gap-3">
                    <CountrySelect
                      countries={countryOptions}
                      value={selectedCountry}
                      onChange={handleSelectedCountryChange}
                    />
                    <CovidChart data={chartData} loading={loading} error={error} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
