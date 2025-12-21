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

function App() {
  // State: raw records plus loading and error flags.
  const [records, setRecords] = useState<CovidRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State: view mode toggles between table and chart.
  const [view, setView] = useState<ViewValue>("table");

  // NOTE: DEFAULT_* stub dates were removed because the API now provides real min/max bounds.
  // We keep date state as `Date | null` until the first successful load to avoid rendering the UI with
  // incorrect bounds and to guarantee `DateRangeFilter` never receives uninitialized dates.
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  // State: country filter.
  const [countryQuery, setCountryQuery] = useState("");

  // State: numeric field/min/max filters.
  const [field, setField] = useState<NumericFilterField>("cases");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  // Chart state: selected country for the chart (empty string => all countries).
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Load data once, then compute min/max to seed default filters.
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

        // Default filters: set the range to the full data span on first load.
        setFrom(min);
        setTo(max);
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
    setView(next);
  }, []);

  const handleChangeFrom = useCallback((next: Date) => {
    setFrom(next);
  }, []);

  const handleChangeTo = useCallback((next: Date) => {
    setTo(next);
  }, []);

  const handleCountryChange = useCallback((next: string) => {
    setCountryQuery(next);
  }, []);

  const handleFieldChange = useCallback((next: NumericFilterField) => {
    setField(next);
  }, []);

  const handleMinValueChange = useCallback((next: string) => {
    setMinValue(next);
  }, []);

  const handleMaxValueChange = useCallback((next: string) => {
    setMaxValue(next);
  }, []);

  const handleSelectedCountryChange = useCallback((next: string) => {
    setSelectedCountry(next);
  }, []);

  const handleReset = useCallback(() => {
    // Reset all filters back to defaults (date range plus field filters).
    setCountryQuery("");
    setField("cases");
    setMinValue("");
    setMaxValue("");
    if (!minDate || !maxDate) return;
    setFrom(minDate);
    setTo(maxDate);
  }, [maxDate, minDate]);

  const datesReady = Boolean(minDate && maxDate && from && to);

  // Memoize filters for stable references and easier logging.
  const filters = useMemo(
    () => {
      if (!from || !to) return null;
      return {
        dateRange: { from, to },
        countryQuery,
        numericFilter: {
          field,
          min: minValue,
          max: maxValue,
        },
      };
    },
    [countryQuery, field, from, maxValue, minValue, to]
  );

  // Country list for the chart dropdown: unique names from raw records, sorted.
  const countryOptions = useMemo(() => {
    const unique = new Set<string>();
    records.forEach((r) => unique.add(r.countriesAndTerritories));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [records]);

  // Memoize aggregation for performance and recompute when records or any filter changes.
  const rows = useMemo(() => {
    if (!records.length || !filters) return [];
    return aggregateByCountry(records, filters);
  }, [filters, records]);

  // Chart time series uses raw records plus dateRange and selectedCountry; recomputes when they change.
  const chartData = useMemo(() => {
    if (!records.length || !filters) return [];
    return buildTimeSeries(records, filters, selectedCountry === "" ? null : selectedCountry);
  }, [filters, records, selectedCountry]);

  // Loading/Error UI is extracted into separate components for reusability and a cleaner App.tsx.
  const showLoading = loading || (!error && !datesReady);
  const showError = !showLoading && error;

  return (
    // Layout wrapper.
    <div className="container py-4">
      <div className="d-flex flex-column gap-3">
        {/* Header. */}
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
            {/* Filters panel. */}
            <div className="d-flex flex-column gap-3 mb-2">
              {/* Date range filter block; feeds date state into aggregation. */}
              <div>
                <DateRangeFilter
                  from={from!}
                  to={to!}
                  minDate={minDate!}
                  maxDate={maxDate!}
                  onChangeFrom={handleChangeFrom}
                  onChangeTo={handleChangeTo}
                />
              </div>

              {/* View tabs switcher (table/chart modes). */}
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

            {/* Content card. */}
            <div className={`card shadow-sm${view === "table" ? " table-card" : ""}`}>
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
                  // Chart view: country selector plus time series chart reacting to dateRange and selectedCountry.
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
