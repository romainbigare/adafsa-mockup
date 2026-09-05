/* Band scales must be disjoint and complete, or a farm falls through the floor
 * and shows as unclassified on a page that claims to score every farm. */
import {
  CULTIVATION, CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION,
  classify, distribution, worstCount, SUBSIDY_SCORE, keepsSubsidy
} from '../src/domain/bands.js';
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

/* The subsidy line is the bottom of the acceptable band, not a second number
 * living beside it. If someone moves one, this fails rather than letting the
 * page and the contract quietly disagree. */
is(SUBSIDY_SCORE, 65, 'the subsidy line is 65, as the quote states');
ok(!keepsSubsidy(SUBSIDY_SCORE - 0.1), 'just below the line loses the subsidy');
ok(keepsSubsidy(SUBSIDY_SCORE), 'exactly on the line keeps it');
ok(!keepsSubsidy(null), 'an unscored farm is not on the list');
for (let v = 0; v <= 100; v += 0.5) {
  const band = classify(EFFICIENCY, v);
  is(keepsSubsidy(v), band.sev <= 2, `score ${v}: the subsidy list is acceptable and above`);
}

const records = [
  { area: 10, score: 95 }, { area: 20, score: 85 }, { area: 30, score: 40 }, { area: 5, score: null }
];
const rows = distribution(EFFICIENCY, records, (r) => r.score);
is(rows.length, 5, 'one row per band, including empty ones');
is(rows.find((r) => r.id === 'excellent').count, 1, 'counts land in the right band');
close(rows.find((r) => r.id === 'critical').shareOfArea, 50, 0.01, 'unscored records are excluded from the totals');
is(worstCount(EFFICIENCY, records, (r) => r.score), 1, 'worst-band count drives the alert, not a chart');

done('bands');
