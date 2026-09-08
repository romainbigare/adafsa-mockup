/* Tree monitoring reads by variety, and two pages read the same numbers.
 *
 * The map at farm level and the annual-change table both come out of
 * varietyTotals, so if the aggregation slips they slip together rather than one
 * page quietly contradicting the other. */
import { allFarms, query } from '../src/data/store.js';
import { varietyTotals, varietyPalette, MAPPED_CATEGORIES } from '../src/pages/trees/varieties.js';
import { YEAR_COUNT } from '../src/domain/periods.js';
import { TREE_CATEGORIES } from '../src/domain/taxonomy.js';
import { is, ok, close, done } from './helpers.js';

const farms = allFarms();
const treed = farms.filter((f) => f.trees > 0);
ok(treed.length > 0, 'the survey holds farms with trees');

// Every farm's varieties add up to its tree count, so no tree is lost or invented.
for (const farm of treed.slice(0, 60)) {
  const counted = farm.varieties.reduce((a, v) => a + v.trees, 0);
  close(counted, farm.trees, 2, `farm ${farm.fid}: the varieties add up to the tree count`);
  ok(farm.varieties.every((v) => v.years.length === YEAR_COUNT), `farm ${farm.fid}: every variety carries three years`);
  ok(farm.varieties.every((v) => v.years[YEAR_COUNT - 1] === v.trees), `farm ${farm.fid}: the last year is the count we hold`);
}

const totals = varietyTotals(treed, { categories: TREE_CATEGORIES });
close(totals.reduce((a, r) => a + r.trees, 0), treed.reduce((a, f) => a + f.trees, 0), 2,
  'the aggregate is the sum of the farms');
close(totals.reduce((a, r) => a + r.share, 0), 100, 0.01, 'the shares are a share of the whole');
ok(totals.every((r, i, all) => i === 0 || all[i - 1].trees >= r.trees), 'biggest variety first');

// Forest trees never reach the map: nothing names them and a legend entry would say nothing.
const mapped = varietyTotals(treed, { categories: MAPPED_CATEGORIES });
ok(!mapped.some((r) => r.category === 'Forest Trees'), 'forest trees are left off the tree map');
ok(mapped.some((r) => r.category === 'Date Palm'), 'palm cultivars are on it');

// A variety keeps its colour, and two varieties of a group never share one.
const colourOf = varietyPalette(mapped);
const palms = mapped.filter((r) => r.category === 'Date Palm');
is(new Set(palms.map(colourOf)).size, palms.length, 'every palm cultivar has its own tint');
is(colourOf(palms[0]), colourOf({ ...palms[0] }), 'the colour follows the variety, not the object');

// Filtering to a province cannot produce more trees than the emirate holds.
const province = varietyTotals(query({ region: 'alain' }), { categories: TREE_CATEGORIES });
ok(province.reduce((a, r) => a + r.trees, 0) <= totals.reduce((a, r) => a + r.trees, 0),
  'a province is never larger than the emirate');

done('trees');
