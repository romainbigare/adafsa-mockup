/* The four directions are the interaction the seasonal-change page exists for:
 * who started, who stopped, who grew and who shrank. */
import { direction, movementOf, movements, netMovement, contributors, trend, hasHistoryFor } from '../src/domain/change.js';
import { is, close, ok, done } from './helpers.js';

is(direction(0, 4), 'started', 'nothing before, something now');
is(direction(4, 0), 'stopped', 'something before, nothing now');
is(direction(2, 5), 'increased');
is(direction(5, 2), 'decreased');
is(direction(3, 3), 'unchanged');
is(direction(3, 3.02), 'unchanged', 'a rounding wobble is not a change of mind');
is(direction(0, 0), 'unchanged', 'absent in both periods is not a movement');

const series = (values) => ({ values });
const seriesOf = (r) => r.values;
const record = series([1, 1, 1, 2, 3, 3, 4, 6]);

is(movementOf(record, seriesOf, 'quarter').before, 4, 'quarter-on-quarter uses the previous quarter');
is(movementOf(record, seriesOf, 'year').before, 2, 'year-on-year reaches back four quarters');
close(movementOf(record, seriesOf, 'quarter').pct, 50, 0.001, 'percentage change');

const set = [series([0, 0, 0, 0, 0, 0, 0, 5]), series([3, 3, 3, 3, 3, 3, 3, 0]), series([1, 1, 1, 1, 1, 1, 2, 4])];
const moves = movements(set, seriesOf, 'quarter');
const net = netMovement(moves);
is(net.gained, 7, 'gains are reported apart from losses');
is(net.lost, 3, 'losses are reported apart from gains');
is(net.net, 4);
is(net.counts, { started: 1, stopped: 1, increased: 1, decreased: 0, unchanged: 0 }, 'direction counts');

is(contributors(moves, { direction: 'started' }).length, 1, 'contributors filter by direction');
is(contributors(moves)[0].delta, 5, 'biggest mover first');

const drawn = trend(set, seriesOf, { reduce: 'sum' });
is(drawn.length, 8, 'one point per quarter');
is(drawn[7].value, 9, 'the last point sums the present');
ok(hasHistoryFor('quarter', 8) && !hasHistoryFor('year', 2), 'a comparison the history cannot reach is refused');

done('change');
