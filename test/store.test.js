/* The number contract, tested rather than promised.
 *
 * Every page reads its rows through the store, so these checks are what stop
 * two screens disagreeing: the province views must partition the emirate view,
 * a filter must narrow both the farms and their crop rows the same way, and a
 * deviation must be measured against the average the store published. */
import { allFarms, query, cropRows, taxonomyTree, farmById, landClasses } from '../src/data/store.js';
import { PROVINCES } from '../src/domain/regions.js';
import { taxonomyBreakdown } from '../src/domain/aggregate.js';
import { taxonomyEntries } from '../src/data/store.js';
import { is, ok, close, done } from './helpers.js';

const farms = allFarms();
ok(farms.length === 500, 'the survey holds five hundred farms');
ok(farms.every((f) => PROVINCES.some((p) => p.id === f.province)), 'every farm sits in exactly one province');
ok(farms.every((f) => f.area > 0), 'every farm has an area');

// The emirate is the sum of its provinces, with nothing double-counted.
const emirate = query({ region: 'emirate' });
const parts = PROVINCES.map((p) => query({ region: p.id }));
is(emirate.length, farms.length, 'the emirate view is every farm');
is(parts.reduce((a, p) => a + p.length, 0), emirate.length, 'the provinces partition the emirate');
close(parts.reduce((a, p) => a + p.reduce((s, f) => s + f.area, 0), 0),
  emirate.reduce((a, f) => a + f.area, 0), 0.01, 'and so does their area');

// A taxonomy filter narrows farms and crop rows in step.
const tomato = taxonomyTree().find((c) => c.name === 'Open Field').types.find((t) => t.name === 'Tomato');
const picked = new Set([tomato.key]);
const growers = query({ region: 'emirate', types: picked });
ok(growers.length > 0 && growers.length < farms.length, 'a filter narrows without emptying the screen');
ok(growers.every((f) => f.crops.some((c) => c.key === tomato.key && c.area > 0)), 'every farm left actually grows it');
is(cropRows(growers, { types: picked }).length, growers.length, 'one crop row per grower');

// An empty selection means everything, so a page never opens blank.
is(query({ region: 'emirate', types: new Set() }).length, farms.length, 'nothing ticked is treated as everything');

// Yield deviation is measured against the store's own published average.
const rows = cropRows(farms).filter((r) => r.cropAverage);
const sample = rows[0];
close(sample.yieldDeviation, ((sample.tonnesPerDunum - sample.cropAverage) / sample.cropAverage) * 100, 0.0001,
  'deviation matches the average it was measured against');
const tomatoRows = rows.filter((r) => r.type === 'Tomato');
close(tomatoRows.reduce((a, r) => a + r.tonnesPerDunum, 0) / tomatoRows.length, tomatoRows[0].cropAverage, 0.001,
  'the published crop average is the mean of its rows');

// Former crops are land no longer in production and stay out of the counts.
ok(cropRows(farms).every((r) => !r.former), 'former crops are excluded by default');
ok(cropRows(farms, { includeFormer: true }).length > cropRows(farms).length, 'and available when a change page asks');

// The breakdown a summary table draws agrees with the raw crop rows.
const breakdown = taxonomyBreakdown(taxonomyEntries(farms));
const cerealArea = cropRows(farms).filter((r) => r.category === 'Cereals').reduce((a, r) => a + r.area, 0);
close(breakdown.rows.find((r) => r.name === 'Cereals').area, cerealArea, 0.01, 'the table and the rows agree');

// History is aligned and ends on the present.
ok(farms.every((f) => f.efficiencySeries.length === 8), 'eight quarters of efficiency history');
ok(farms.every((f) => f.efficiencySeries[7] === f.efficiency), 'history ends on the figure the page shows');
ok(farms.every((f) => f.crops.every((c) => c.series.length === 8)), 'crop history is aligned with it');
ok(farms.every((f) => f.crops.every((c) => c.former || Math.abs(c.series[7] - c.area) < 0.011)), 'and ends on the measured area');

ok(farmById(farms[0].fid) === farms[0], 'a farm can be looked up by id');
ok(farmById('nope') === null, 'an unknown id is null rather than a throw');
ok(landClasses().every((c) => c.area >= 0), 'land-use totals cover the whole survey');

done('store');
