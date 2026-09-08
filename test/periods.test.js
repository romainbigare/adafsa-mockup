import {
  QUARTERS, quarterSeries, historyIndices, comparisonById, COMPARISONS,
  WINDOW_QUARTERS, RECENT_QUARTERS, recentWindow, YEARS
} from '../src/domain/periods.js';
import { is, ok, done } from './helpers.js';

is(QUARTERS.length, 8, 'eight quarters of history');
is(QUARTERS[QUARTERS.length - 1].id, '2026Q3', 'the series ends on the current quarter');
is(quarterSeries(5, { year: 2026, q: 2 }).map((q) => q.id), ['2025Q2', '2025Q3', '2025Q4', '2026Q1', '2026Q2'], 'quarters roll across the year end');

is(historyIndices('quarter'), { now: 7, base: 6 }, 'quarter-on-quarter looks back one');
is(historyIndices('year'), { now: 7, base: 3 }, 'year-on-year looks back four');
is(comparisonById('nonsense').id, 'quarter', 'an unknown comparison falls back to the default');
ok(COMPARISONS.some((c) => c.id === 'year'), 'year-on-year is offered as well as quarterly');


/* The review fixed both windows: six quarters for the crop pages, three years
 * for the trees. Six is the smallest window that carries a last-quarter and a
 * last-year comparison at once, so shrinking it silently breaks a reading the
 * pages promise. */
is(WINDOW_QUARTERS, 6, 'the crop pages read six quarters');
is(RECENT_QUARTERS.length, 6, 'and the window holds six');
is(RECENT_QUARTERS[RECENT_QUARTERS.length - 1].id, QUARTERS[QUARTERS.length - 1].id, 'the window ends on today');
ok(RECENT_QUARTERS.every((q, i) => q.id === QUARTERS[QUARTERS.length - 6 + i].id), 'and it is the tail of the record');
is(recentWindow([1, 2, 3, 4, 5, 6, 7, 8]), [3, 4, 5, 6, 7, 8], 'a series is trimmed to the same window');
is(YEARS.length, 3, 'trees are read over three years');
is(YEARS[YEARS.length - 1], 2026, 'ending on this one');

done('periods window');
