import type { CovidRecord } from "../types/covid";
import type { AggregationFilters } from "../types/stats";
import type { ChartPoint } from "../types/chart";
import { parseApiDate, isDateInRange } from "./date";

/**
 * Builds a date-keyed time series for cases/deaths using the same filters as the table.
 */
export function buildTimeSeries(
  records: CovidRecord[],
  filters: AggregationFilters,
  selectedCountry: string | null
): ChartPoint[] {
  const normalizedCountry = (selectedCountry ?? "").trim();

  // Filter by date range first to match the table's time window.
  const filteredByDate = records
    .map((record) => ({ record, parsedDate: parseApiDate(record.dateRep) }))
    .filter(({ parsedDate }) => isDateInRange(parsedDate, filters.dateRange.from, filters.dateRange.to));

  // Filter by country if a specific country is selected; otherwise keep all.
  const filteredByCountry =
    normalizedCountry === ""
      ? filteredByDate
      : filteredByDate.filter(({ record }) => record.countriesAndTerritories === normalizedCountry);

  // Group by normalized YYYY-MM-DD and sum per-day cases/deaths.
  const grouped = new Map<string, { cases: number; deaths: number }>();
  for (const { record, parsedDate } of filteredByCountry) {
    const dateKey = parsedDate.toISOString().slice(0, 10);
    const bucket = grouped.get(dateKey) ?? { cases: 0, deaths: 0 };
    bucket.cases += record.cases;
    bucket.deaths += record.deaths;
    grouped.set(dateKey, bucket);
  }

  // Sort ascending to ensure chronological order regardless of API input order.
  const series: ChartPoint[] = Array.from(grouped.entries())
    .map(([date, totals]) => ({
      date,
      cases: totals.cases,
      deaths: totals.deaths,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return series;
}

/**
 * Quick helper to eyeball the time-series output in a console/devtools session.
 */
export function debugBuildSeriesSample(): void {
  const sampleRecords: CovidRecord[] = [
    {
      dateRep: "01/12/2019",
      day: "01",
      month: "12",
      year: "2019",
      cases: 5,
      deaths: 1,
      countriesAndTerritories: "Spain",
      geoId: "ES",
      countryterritoryCode: "ESP",
      popData2019: 47000000,
      continentExp: "EU",
    },
    {
      dateRep: "02/12/2019",
      day: "02",
      month: "12",
      year: "2019",
      cases: 7,
      deaths: 0,
      countriesAndTerritories: "Spain",
      geoId: "ES",
      countryterritoryCode: "ESP",
      popData2019: 47000000,
      continentExp: "EU",
    },
    {
      dateRep: "01/12/2019",
      day: "01",
      month: "12",
      year: "2019",
      cases: 10,
      deaths: 2,
      countriesAndTerritories: "France",
      geoId: "FR",
      countryterritoryCode: "FRA",
      popData2019: 67000000,
      continentExp: "EU",
    },
  ];

  const filters: AggregationFilters = {
    dateRange: {
      from: parseApiDate("01/12/2019"),
      to: parseApiDate("02/12/2019"),
    },
    countryQuery: "",
    numericFilter: {
      field: "cases",
      min: "",
      max: "",
    },
  };

  buildTimeSeries(sampleRecords, filters, null);
  buildTimeSeries(sampleRecords, filters, "Spain");
}
