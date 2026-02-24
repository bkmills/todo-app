/**
 * Format an ISO date string for display.
 * e.g. "2026-02-24T12:00:00.000Z" → "Feb 24, 2026"
 */
export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Convert an ISO string to the value required by <input type="date">.
 * e.g. "2026-02-24T12:00:00.000Z" → "2026-02-24"
 */
export function isoToDateInputValue(iso) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/**
 * Convert a date input value (YYYY-MM-DD) to an ISO string stored at noon UTC
 * to prevent timezone day-boundary bugs.
 * e.g. "2026-02-24" → "2026-02-24T12:00:00.000Z"
 */
export function dateInputValueToIso(val) {
  if (!val) return "";
  return new Date(`${val}T12:00:00.000Z`).toISOString();
}
