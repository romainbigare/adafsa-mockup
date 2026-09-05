/* Number, area and date formatting. One place, so a figure written on the
 * overview reads the same way in a table three pages down. */

const NBSP = ' ';

export const int = (n) => (n == null || Number.isNaN(n) ? '—' : Math.round(n).toLocaleString('en-GB'));

export const dec = (n, places = 1) =>
  n == null || Number.isNaN(n) ? '—' : n.toLocaleString('en-GB', { minimumFractionDigits: places, maximumFractionDigits: places });

/* Thousands become 12.4k and millions 1.24M — for headline figures only, never
 * for a table cell someone might quote. */
export function compact(n) {
  if (n == null || Number.isNaN(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e4) return (n / 1e3).toFixed(1) + 'k';
  return int(n);
}

export const dunums = (n) => int(n) + NBSP + 'dun';
export const pct = (n, places = 0) => (n == null || Number.isNaN(n) ? '—' : n.toFixed(places) + '%');
export const signedPct = (n, places = 0) => (n == null || Number.isNaN(n) ? '—' : (n > 0 ? '+' : '') + n.toFixed(places) + '%');
export const signed = (n, places = 0) => (n == null || Number.isNaN(n) ? '—' : (n > 0 ? '+' : '') + n.toFixed(places));
export const m3 = (n) => int(n) + NBSP + 'm³';

/* The review asked for dates rather than clock times on the "as of" stamp — a
 * satellite pass is a day, not a minute. */
export function asOfDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const share = (part, whole) => (whole ? (part / whole) * 100 : 0);
