/**
 * Parses API date strings (expected format: DD/MM/YYYY or DD-MM-YYYY) into a Date.
 * Throws a descriptive error if the input is malformed or invalid (e.g., bad day/month).
 */
export function parseApiDate(dateRep: string): Date {
  const match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(dateRep.trim());
  if (!match) {
    throw new Error(`Invalid date format "${dateRep}". Expected DD/MM/YYYY or DD-MM-YYYY.`);
  }

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  // Basic range checks before constructing the date.
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month "${mm}" in date "${dateRep}".`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day "${dd}" in date "${dateRep}".`);
  }

  // Use UTC to avoid timezone shifts when normalizing.
  const parsed = new Date(Date.UTC(year, month - 1, day));

  // Validate that the resulting date matches the components (catches 31 Feb, etc.).
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date "${dateRep}".`);
  }

  return parsed;
}

// Resets time to midnight UTC for day-level comparisons.
export function normalizeDate(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Inclusive range check using normalized dates to avoid time-of-day issues.
export function isDateInRange(date: Date, from: Date, to: Date): boolean {
  const target = normalizeDate(date).getTime();
  const start = normalizeDate(from).getTime();
  const end = normalizeDate(to).getTime();
  return target >= start && target <= end;
}

// Computes the minimum and maximum dates across records containing a dateRep field.
export function getMinMaxDates(records: Array<{ dateRep: string }>): { min: Date; max: Date } {
  if (!records.length) {
    throw new Error("Cannot compute min/max dates from an empty collection.");
  }

  let min = parseApiDate(records[0].dateRep);
  let max = min;

  for (let i = 1; i < records.length; i += 1) {
    const current = parseApiDate(records[i].dateRep);
    if (current.getTime() < min.getTime()) min = current;
    if (current.getTime() > max.getTime()) max = current;
  }

  return { min, max };
}

/*
Quick checks in a console/devtools session:

  const d = parseApiDate("01/12/2019"); // -> Date for 2019-12-01 UTC.
  isDateInRange(d, parseApiDate("30/11/2019"), parseApiDate("02/12/2019")); // true.
  getMinMaxDates([
    { dateRep: "05/01/2020" },
    { dateRep: "01/12/2019" },
    { dateRep: "20/12/2019" },
  ]); // -> { min: 2019-12-01, max: 2020-01-05 } (Date objects).
*/
