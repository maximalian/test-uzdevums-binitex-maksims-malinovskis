// Represents a single row in the aggregated statistics table.
export type CountryRow = {
  country: string;
  casesInPeriod: number;
  deathsInPeriod: number;
  casesTotalAllTime: number; // Unfiltered cumulative cases.
  deathsTotalAllTime: number; // Unfiltered cumulative deaths.
  casesPer1000: number;
  deathsPer1000: number;
  population: number; // Raw population to enable per-1k calculations.
};

// Inclusive date range used to filter aggregated records.
export type DateRangeFilter = {
  from: Date;
  to: Date;
};

// User-entered query to match country names.
export type CountryFilter = {
  countryQuery: string;
};

// Aggregation-level filters; extendable with numeric min/max later.
export type AggregationFilters = {
  dateRange: DateRangeFilter;
  countryQuery?: string;
};
