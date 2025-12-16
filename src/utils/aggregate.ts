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

  // aggregation pass: totals + per-period sums
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
      });
    }

    const bucket = aggregates.get(countryKey)!;

    // totals (all time)
    bucket.casesTotalAllTime += record.cases;
    bucket.deathsTotalAllTime += record.deaths;

    // period sums
    const recordDate = parseApiDate(record.dateRep);
    if (isDateInRange(recordDate, filters.dateRange.from, filters.dateRange.to)) {
      bucket.casesInPeriod += record.cases;
      bucket.deathsInPeriod += record.deaths;
    }
  }

  // map to final rows with /1000 metrics
  let rows: CountryRow[] = Array.from(aggregates.values()).map((agg) => ({
    country: agg.country,
    casesInPeriod: agg.casesInPeriod,
    deathsInPeriod: agg.deathsInPeriod,
    casesTotalAllTime: agg.casesTotalAllTime,
    deathsTotalAllTime: agg.deathsTotalAllTime,
    population: agg.population,
    // /1000 metrics
    casesPer1000: calcPerThousand(agg.casesInPeriod, agg.population),
    deathsPer1000: calcPerThousand(agg.deathsInPeriod, agg.population),
  }));

  const rowsBeforeFilters = rows.length;

  // filtering: country (case-insensitive substring)
  const countryQuery = filters.countryQuery.trim();
  if (countryQuery !== "") {
    const q = countryQuery.toLowerCase();
    rows = rows.filter((row) => row.country.toLowerCase().includes(q));
  }

  const rowsAfterCountryFilter = rows.length;

  // filtering: numeric field min/max (empty strings mean "no bound"; NaN is ignored)
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

  const rowsAfterNumericFilter = rows.length;

  // DEBUG-only counts to trace filtering (easy to remove)
  if (import.meta.env?.DEV) {
    console.debug("[aggregateByCountry] rows", {
      beforeFilters: rowsBeforeFilters,
      afterCountry: rowsAfterCountryFilter,
      afterNumeric: rowsAfterNumericFilter,
    });
  }

  // sorting: stable alphabetical ordering by country name
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

  const aggregated = aggregateByCountry(sampleRecords, filters);
  console.log("Sample aggregation:", aggregated);
}
