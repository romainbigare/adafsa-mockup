/* Crop monitoring after the review: two change pages instead of one, a
 * six-quarter window, and land counted in three states.
 *
 * The arithmetic behind both change pages lives in pages/crop/shared.js, so it
 * is checked here rather than trusted to two pages that must agree. */
import { allFarms, query } from '../src/data/store.js';
import { cropsOf, change, at, NOW, LAST_QUARTER, LAST_YEAR } from '../src/pages/crop/shared.js';
import { MODULES, moduleByKey } from '../src/domain/modules.js';
import { QUARTERS } from '../src/domain/periods.js';
import { LAND_STATE } from '../src/domain/bands.js';
import { is, ok, close, done } from './helpers.js';

const farms = allFarms();

// The four crop screens, in the order and under the names the review settled.
const crop = moduleByKey('crop');
is(crop.pages.map((p) => p.key), ['inventory', 'annuals', 'openfield', 'fallow'], 'four crop screens');
is(crop.pages.map((p) => p.label),
  ['Crops and area summary', 'Cereals and fodder', 'Open field crops', 'Fallow land'],
  'named as agreed');
is(moduleByKey('trees').pages.map((p) => p.label), ['Tree count', 'Canopy health', 'Annual change'],
  'the tree screens too');
ok(!MODULES.some((m) => m.pages.some((p) => p.label === 'Seasonal change')),
  'the single seasonal-change page is gone');

// The three positions the farm table reads, oldest to newest.
is(NOW, QUARTERS.length - 1, 'now is the last quarter held');
is(LAST_QUARTER, NOW - 1, 'three months ago is one quarter back');
is(LAST_YEAR, NOW - 4, 'twelve months ago is four back');

// Cereals and fodder on one page, open field on the other, with nothing shared.
const annuals = farms.flatMap((f) => cropsOf(f, { categories: ['Cereals', 'Fodder'], types: null }));
const openField = farms.flatMap((f) => cropsOf(f, { categories: ['Open Field'], types: null }));
ok(annuals.length > 0 && openField.length > 0, 'both pages have something to draw');
ok(!annuals.some((r) => r.category === 'Open Field'), 'no vegetables on the annuals page');
ok(!openField.some((r) => r.category !== 'Open Field'), 'and nothing else on the open-field page');

// A filter narrows the rows a page draws without reaching outside its categories.
const withTypes = new Set(openField.map((r) => r.key).slice(0, 1));
const narrowed = query({ region: 'emirate', types: withTypes })
  .flatMap((f) => cropsOf(f, { categories: ['Open Field'], types: withTypes }));
ok(narrowed.length > 0 && narrowed.length < openField.length, 'a filter narrows without emptying the page');
ok(narrowed.every((r) => withTypes.has(r.key)), 'and leaves only what was picked');

is(change(0, 5), null, 'growth from nothing reads as new rather than as a percentage');
close(change(100, 125), 25, 0.001, 'and an ordinary change is a percentage');
is(at(undefined, 3), 0, 'a missing series reads as zero, never as undefined');

/* The three land states are counted apart, and today's two fallow figures are
 * the survey's fallow area split in two rather than a number of their own. */
for (const farm of farms.slice(0, 80)) {
  ok(farm.fallowRecentSeries.length === QUARTERS.length, `farm ${farm.fid}: a fallow record per quarter`);
  ok(farm.fallowRecentSeries.every((v) => v >= 0) && farm.fallowLongSeries.every((v) => v >= 0),
    `farm ${farm.fid}: fallow land is never negative`);
  close(farm.fallowRecent + farm.fallowLong, farm.fallowArea, 0.02,
    `farm ${farm.fid}: the two fallow states are the fallow land, split`);
  ok(QUARTERS.every((_, i) =>
    farm.fallowRecentSeries[i] + farm.fallowLongSeries[i] <= farm.area + 0.05),
    `farm ${farm.fid}: fallow land never exceeds the holding`);
}
is(LAND_STATE.length, 3, 'and the page draws three bands, not two');

done('crop pages');
