import { useEffect, useState } from "react";
import "./App.css";
import { fetchCovidData } from "./services/covidApi";
import { aggregateByCountry } from "./utils/aggregate";
import { getMinMaxDates } from "./utils/date";
import type { CovidRecord } from "./types/covid";

function App() {
  // Loading/error state for quick debug output
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);

  useEffect(() => {
    // Load data, run aggregation engine, and log debug info
    const loadAndAggregate = async () => {
      try {
        // Loading: fetch the raw dataset
        const data = await fetchCovidData();
        const records: CovidRecord[] = data.records ?? [];
        if (!records.length) {
          throw new Error("No records returned from API.");
        }

        // Compute default date range (min/max)
        const { min, max } = getMinMaxDates(records);
        const filters = {
          dateRange: { from: min, to: max },
          countryQuery: "",
        };

        // Run aggregation by country
        const aggregated = aggregateByCountry(records, filters);

        // Debug logging to verify stage 2 calculations
        console.log("Raw records count:", records.length);
        console.log("Date range:", { min, max });
        console.log("First 5 aggregated rows:", aggregated.slice(0, 5));

        setRowCount(records.length);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Aggregation failed:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAndAggregate();
  }, []);

  let content = "Loading...";
  if (error) {
    content = `Error: ${error}`;
  } else if (!loading && rowCount !== null) {
    content = `Loaded ${rowCount} rows`;
  }

  return (
    <div>
      <h1>COVID-19 Statistics</h1>
      {/* UI placeholder: we only surface debug text while validating the engine */}
      <p>{content}</p>
    </div>
  );
}

export default App;
