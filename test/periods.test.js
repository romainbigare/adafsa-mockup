import { QUARTERS, quarterSeries, historyIndices, comparisonById, COMPARISONS } from '../src/domain/periods.js';
import { is, ok, done } from './helpers.js';

is(QUARTERS.length, 8, 'eight quarters of history');
is(QUARTERS[QUARTERS.length - 1].id, '2026Q3', 'the series ends on the current quarter');
is(quarterSeries(5, { year: 2026, q: 2 }).map((q) => q.id), ['2025Q2', '2025Q3', '2025Q4', '2026Q1', '2026Q2'], 'quarters roll across the year end');

is(historyIndices('quarter'), { now: 7, base: 6 }, 'quarter-on-quarter looks back one');
is(historyIndices('year'), { now: 7, base: 3 }, 'year-on-year looks back four');
is(comparisonById('nonsense').id, 'quarter', 'an unknown comparison falls back to the default');
ok(COMPARISONS.some((c) => c.id === 'year'), 'year-on-year is offered as well as quarterly');

done('periods');
