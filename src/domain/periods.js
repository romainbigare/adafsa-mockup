/* Quarters and months.
 *
 * The platform's comparisons are quarter-on-quarter and year-on-year. Week-to-
 * week was ruled out in review as too small a change to read; where a short
 * window is needed the rule is a rolling four weeks. */

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* The mockup's "today". Fixed so screenshots and the generated deck stay
 * reproducible from one run to the next. */
export const TODAY = new Date('2026-08-12T00:00:00Z');

export const CURRENT_QUARTER = { year: 2026, q: 3 };

/* Eight quarters back from the current one, oldest first. */
export function quarterSeries(count = 8, end = CURRENT_QUARTER) {
  const out = [];
  let { year, q } = end;
  for (let i = 0; i < count; i++) {
    out.unshift({ year, q, id: `${year}Q${q}`, label: `Q${q} ${String(year).slice(2)}` });
    q -= 1;
    if (q === 0) { q = 4; year -= 1; }
  }
  return out;
}

export const QUARTERS = quarterSeries();

export const previousQuarter = (id = CURRENT_QUARTER.id) => {
  const i = QUARTERS.findIndex((x) => x.id === id);
  return QUARTERS[(i < 0 ? QUARTERS.length - 1 : i) - 1] || QUARTERS[0];
};

/* How far back a change page is comparing. Quarter is the default; the review
 * left year-on-year wanted too, so both are offered rather than chosen. */
export const COMPARISONS = [
  { id: 'quarter', label: 'vs last quarter', back: 1 },
  { id: 'year', label: 'vs last year', back: 4 }
];

export const DEFAULT_COMPARISON = 'quarter';

export function comparisonById(id) {
  return COMPARISONS.find((c) => c.id === id) || COMPARISONS[0];
}

/* The index into a farm's quarterly history for "now" and for the baseline the
 * chosen comparison points at. History arrays are oldest-first, length 8. */
export function historyIndices(comparisonId) {
  const back = comparisonById(comparisonId).back;
  const now = QUARTERS.length - 1;
  return { now, base: Math.max(0, now - back) };
}
