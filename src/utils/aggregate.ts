import { parseApiDate, isDateInRange } from "./date";
import type { CovidRecord } from "../types/covid";
import type { AggregationFilters, CountryRow } from "../types/stats";

type MutableCountryAggregate = {
  country: string;
  population: number;
  casesInPeriod: number;
  deathsInPeriod: number;
  casesTotalAllTime: number;
  deathsTotalAllTime: number;
  dailyCases: Map<string, number>;
  dailyDeaths: Map<string, number>;
};

const safePopulation = (popData2019: number | null): number =>
  typeof popData2019 === "number" && popData2019 > 0 ? popData2019 : 0;

const calcPerThousand = (value: number, population: number): number => {
  if (population <= 0) return 0;
  return value / (population / 1000);
};

/**
 * Aggregates daily Covid records by country and applies date/country/numeric filters.
 * Country key: uses ECDC `countriesAndTerritories` (underscores preserved for consistency).
 */
export function aggregateByCountry(records: CovidRecord[], filters: AggregationFilters): CountryRow[] {
  const aggregates = new Map<string, MutableCountryAggregate>();

  // Aggregation pass: totals plus per-period sums.
  for (const record of records) {
    const countryKey = record.countriesAndTerritories;
    const population = safePopulation(record.popData2019);

    if (!aggregates.has(countryKey)) {
      aggregates.set(countryKey, {
        country: countryKey,
        population,
        casesInPeriod: 0,
        deathsInPeriod: 0,
        casesTotalAllTime: 0,
        deathsTotalAllTime: 0,
        dailyCases: new Map(),
        dailyDeaths: new Map(),
      });
    }

    const bucket = aggregates.get(countryKey)!;

    // Totals (all time).
    bucket.casesTotalAllTime += record.cases;
    bucket.deathsTotalAllTime += record.deaths;

    // Period sums: group by day so we can derive per-day metrics (avg/max) later without touching UI.
    const recordDate = parseApiDate(record.dateRep);
    // Use dateRange to keep calculations constrained to the user-selected window.
    if (isDateInRange(recordDate, filters.dateRange.from, filters.dateRange.to)) {
      const dayKey = recordDate.toISOString().slice(0, 10); // YYYY-MM-DD.
      bucket.casesInPeriod += record.cases;
      bucket.deathsInPeriod += record.deaths;
      bucket.dailyCases.set(dayKey, (bucket.dailyCases.get(dayKey) ?? 0) + record.cases);
      bucket.dailyDeaths.set(dayKey, (bucket.dailyDeaths.get(dayKey) ?? 0) + record.deaths);
    }
  }

  // Map to final rows with per-thousand metrics.
  let rows: CountryRow[] = Array.from(aggregates.values()).map((agg) => {
    const dayKeys = new Set([...agg.dailyCases.keys(), ...agg.dailyDeaths.keys()]);
    const sortedDays = Array.from(dayKeys).sort();
    const casesPerDay = sortedDays.map((day) => agg.dailyCases.get(day) ?? 0);
    const deathsPerDay = sortedDays.map((day) => agg.dailyDeaths.get(day) ?? 0);
    const daysCount = dayKeys.size;

    // Average per unique day (not per raw records) to avoid over-weighting days with multiple entries.
    const avgCasesPerDay = daysCount > 0 ? agg.casesInPeriod / daysCount : 0;
    const avgDeathsPerDay = daysCount > 0 ? agg.deathsInPeriod / daysCount : 0;
    const maxCasesPerDay = daysCount > 0 ? Math.max(...casesPerDay) : 0;
    const maxDeathsPerDay = daysCount > 0 ? Math.max(...deathsPerDay) : 0;

    return {
      country: agg.country,
      casesInPeriod: agg.casesInPeriod,
      deathsInPeriod: agg.deathsInPeriod,
      casesTotalAllTime: agg.casesTotalAllTime,
      deathsTotalAllTime: agg.deathsTotalAllTime,
      population: agg.population,
      casesPer1000: calcPerThousand(agg.casesInPeriod, agg.population),
      deathsPer1000: calcPerThousand(agg.deathsInPeriod, agg.population),
      avgCasesPerDay,
      avgDeathsPerDay,
      maxCasesPerDay,
      maxDeathsPerDay,
    };
  });

  // Filtering: country (case-insensitive substring).
  const countryQuery = filters.countryQuery.trim();
  if (countryQuery !== "") {
    const q = countryQuery.toLowerCase();
    rows = rows.filter((row) => row.country.toLowerCase().includes(q));
  }

  // Filtering: numeric field min/max (empty strings mean "no bound"; NaN is ignored).
  const { field, min, max } = filters.numericFilter;
  const numericKey = {
    cases: "casesInPeriod",
    deaths: "deathsInPeriod",
    casesPer1000: "casesPer1000",
    deathsPer1000: "deathsPer1000",
  } as const;
  const minValue = min.trim() === "" ? null : Number(min);
  const maxValue = max.trim() === "" ? null : Number(max);
  const hasValidMin = minValue !== null && !Number.isNaN(minValue);
  const hasValidMax = maxValue !== null && !Number.isNaN(maxValue);

  if (hasValidMin || hasValidMax) {
    rows = rows.filter((row) => {
      const numericFieldKey = numericKey[field];
      const value = row[numericFieldKey];
      if (hasValidMin && value < (minValue as number)) return false;
      if (hasValidMax && value > (maxValue as number)) return false;
      return true;
    });
  }

  // Sorting: stable alphabetical ordering by country name.
  rows.sort((a, b) => a.country.localeCompare(b.country));

  return rows;
}

/**
 * Quick console-only helper to sanity-check aggregation logic without a test runner.
 */
export function debugAggregateSample(): void {
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

  aggregateByCountry(sampleRecords, filters);
}
