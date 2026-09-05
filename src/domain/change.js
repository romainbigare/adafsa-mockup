/* Period-over-period comparison — the arithmetic behind every change and trend
 * page.
 *
 * The review was firm that change belongs in hard numbers rather than on a map:
 * what gained, what was lost, the net, and then the farms that produced it. All
 * of that is one calculation applied to different series, so it lives here once.
 *
 * Every function takes a `seriesOf(record)` returning an array of values,
 * oldest first, aligned with domain/periods.js QUARTERS. */

import { historyIndices, QUARTERS } from './periods.js';

export const DIRECTIONS = [
  { id: 'started', label: 'Started', hint: 'nothing before, something now' },
  { id: 'increased', label: 'Increased', hint: 'more than before' },
  { id: 'decreased', label: 'Decreased', hint: 'less than before' },
  { id: 'stopped', label: 'Stopped', hint: 'something before, nothing now' }
];

/* A small floor, so that a rounding wobble in the model does not present itself
 * as a farm changing its mind about a crop. */
const EPSILON = 0.05;

export function direction(before, after) {
  const grew = after - before;
  if (Math.abs(grew) <= EPSILON) return 'unchanged';
  if (before <= EPSILON) return 'started';
  if (after <= EPSILON) return 'stopped';
  return grew > 0 ? 'increased' : 'decreased';
}

/* One record's movement between the two periods a comparison points at. */
export function movementOf(record, seriesOf, comparisonId) {
  const series = seriesOf(record) || [];
  const { now, base } = historyIndices(comparisonId);
  const before = series[base] ?? 0;
  const after = series[now] ?? 0;
  const delta = after - before;
  return {
    record,
    before,
    after,
    delta,
    pct: before > EPSILON ? (delta / before) * 100 : null,
    direction: direction(before, after)
  };
}

export function movements(records, seriesOf, comparisonId) {
  return records.map((r) => movementOf(r, seriesOf, comparisonId));
}

/* Gained, lost and net across a set — the three figures at the top of every
 * change page. Gains and losses are reported separately rather than only netted,
 * because a quiet net can hide a great deal of movement. */
export function netMovement(moves) {
  let gained = 0;
  let lost = 0;
  let before = 0;
  let after = 0;
  const counts = { started: 0, stopped: 0, increased: 0, decreased: 0, unchanged: 0 };
  for (const m of moves) {
    before += m.before;
    after += m.after;
    if (m.delta > 0) gained += m.delta;
    if (m.delta < 0) lost += -m.delta;
    counts[m.direction] += 1;
  }
  return {
    before,
    after,
    gained,
    lost,
    net: after - before,
    pct: before > EPSILON ? ((after - before) / before) * 100 : null,
    counts
  };
}

/* The farms behind a movement, biggest mover first. */
export function contributors(moves, { direction: only = null, limit = Infinity } = {}) {
  return moves
    .filter((m) => (only ? m.direction === only : m.direction !== 'unchanged'))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, limit);
}

/* A series to draw: one point per quarter, summed or averaged across records. */
export function trend(records, seriesOf, { reduce = 'sum', quarters = QUARTERS } = {}) {
  return quarters.map((quarter, i) => {
    const values = records.map((r) => (seriesOf(r) || [])[i]).filter((v) => v != null && !Number.isNaN(v));
    if (!values.length) return { ...quarter, value: null };
    const total = values.reduce((a, b) => a + b, 0);
    return { ...quarter, value: reduce === 'mean' ? total / values.length : total };
  });
}

/* True when the comparison cannot be made yet because the history does not
 * reach back that far. Change pages show an honest empty state rather than a
 * chart of zeroes — the real platform will look exactly like this for its first
 * two quarters. */
export function hasHistoryFor(comparisonId, availableQuarters = QUARTERS.length) {
  const { now, base } = historyIndices(comparisonId);
  return availableQuarters > now - base;
}
