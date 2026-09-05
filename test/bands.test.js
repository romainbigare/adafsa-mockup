/* Band scales must be disjoint and complete, or a farm falls through the floor
 * and shows as unclassified on a page that claims to score every farm. */
import { CULTIVATION, CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION, classify, distribution, worstCount } from '../src/domain/bands.js';
import { is, ok, close, done } from './helpers.js';

const scales = [CULTIVATION, CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION];
for (const scale of scales) {
  for (let v = -60; v <= 340; v += 0.5) {
    const matches = scale.bands.filter((b) => b.test(v));
    is(matches.length, 1, `${scale.key} classifies ${v} exactly once`);
  }
  ok(classify(scale, null) === null, `${scale.key} tolerates a missing value`);
  ok(classify(scale, NaN) === null, `${scale.key} tolerates NaN`);
}

// The over-allocation threshold is strictly above 125%, as specified.
is(classify(WATER_USE, 125).id, 'excess', '125% is not yet over-allocated');
is(classify(WATER_USE, 125.1).id, 'over', 'above 125% is over-allocated');

const records = [
  { area: 10, score: 95 }, { area: 20, score: 85 }, { area: 30, score: 40 }, { area: 5, score: null }
];
const rows = distribution(EFFICIENCY, records, (r) => r.score);
is(rows.length, 5, 'one row per band, including empty ones');
is(rows.find((r) => r.id === 'excellent').count, 1, 'counts land in the right band');
close(rows.find((r) => r.id === 'critical').shareOfArea, 50, 0.01, 'unscored records are excluded from the totals');
is(worstCount(EFFICIENCY, records, (r) => r.score), 1, 'worst-band count drives the alert, not a chart');

done('bands');
