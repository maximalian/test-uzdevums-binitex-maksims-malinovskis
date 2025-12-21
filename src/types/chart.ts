// `date` stays a string to preserve the original "YYYY-MM-DD" label format for the X-axis without extra parsing or locale changes.
export interface ChartPoint {
  date: string;
  cases: number;
  deaths: number;
}

// `daily` shows per-day values; `cumulative` would roll up totals over time (useful for future modes).
export type ChartMode = 'daily' | 'cumulative';
