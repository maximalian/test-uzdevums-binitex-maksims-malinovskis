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

// Numeric field options that can be filtered in the aggregate view.
export type NumericFilterField =
  | 'cases'
  | 'deaths'
  | 'casesPer1000'
  | 'deathsPer1000';

// Inclusive date range used to filter aggregated records.
export type DateRangeFilter = {
  from: Date;
  to: Date;
};

// User-entered query to match country names.
export type CountryFilter = {
  countryQuery: string;
};

// Aggregation-level filters used by aggregateByCountry + filtering UI.
export type AggregationFilters = {
  dateRange: DateRangeFilter;
  countryQuery: string;
  numericFilter: {
    field: NumericFilterField;
    min: string; // Keep as string to allow validation and preserve raw user input.
    max: string; // Empty string means "not set", so parsing happens later.
  };
};
