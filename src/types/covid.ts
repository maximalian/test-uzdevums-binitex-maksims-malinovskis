// Describes a single daily COVID-19 record as returned by the ECDC dataset
export interface CovidRecord {
  // Report date in DD/MM/YYYY format (string as provided by API)
  dateRep: string;
  // Numeric day of month (string in the source; keep as string to match payload)
  day: string;
  // Numeric month (string in the source)
  month: string;
  // Four-digit year (string in the source)
  year: string;
  // Daily reported cases
  cases: number;
  // Daily reported deaths
  deaths: number;
  // Country/territory name with underscores instead of spaces (e.g., "United_States_of_America")
  countriesAndTerritories: string;
  // Two-letter geographical identifier (may be blank for some territories)
  geoId: string;
  // Three-letter country/territory code (can be empty for some records)
  countryterritoryCode: string;
  // Population estimate for 2019 (may be missing -> null)
  popData2019: number | null;
  // Continent name abbreviation (e.g., "EU", "America")
  continentExp: string;
  // 14-day notification rate per 100k population (optional in the feed)
  notification_rate_per_100000_population_14_days?: number | null;
}

// Represents the full API payload wrapping all COVID-19 records
export interface CovidApiResponse {
  // Array of daily records under the "records" key
  records: CovidRecord[];
}

// These types mirror the upstream API shape so TypeScript can:
// - enforce correct field names and value types during parsing and usage
// - surface missing/optional fields at compile time instead of failing at runtime
// - provide IntelliSense and safer refactors when consuming COVID-19 data
