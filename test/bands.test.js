/* Band scales must be disjoint and complete, or a farm falls through the floor
 * and shows as unclassified on a page that claims to score every farm. */
import {
  CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION, LAND_STATE, landState,
  classify, distribution, worstCount, SUBSIDY_SCORE, keepsSubsidy
} from '../src/domain/bands.js';
import { is, ok, close, done } from './helpers.js';

const scales = [CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION];
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

/* Land is reported in three states and a farm reads as whichever covers most
 * of it. The two fallow states are never added together on a page, so nothing
 * here should ever quietly merge them. */
is(LAND_STATE.length, 3, 'land has three states, not two');
is(LAND_STATE.map((s) => s.id).join(','), 'cultivated,restingRecent,restingLong', 'and they are named as the review named them');
is(new Set(LAND_STATE.map((s) => s.color)).size, 3, 'each state has its own colour');
is(landState({ cultivatedArea: 8, fallowRecent: 2, fallowLong: 1 }).id, 'cultivated', 'a mostly planted farm reads as planted');
is(landState({ cultivatedArea: 1, fallowRecent: 2, fallowLong: 9 }).id, 'restingLong', 'a mostly unused farm reads as unused');
ok(landState({ cultivatedArea: 0, fallowRecent: 0, fallowLong: 0 }) === null, 'a farm with no land at all is unclassified');

done('bands');
