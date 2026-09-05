import { taxonomyBreakdown, classBreakdown, byProvince, rank, sum, mean, median } from '../src/domain/aggregate.js';
import { is, close, done } from './helpers.js';

const farm = (fid, province, area, taxonomy) => ({ fid, province, area, taxonomy });
const farms = [
  farm(1, 'alain', 10, [{ category: 'Cereals', type: 'Wheat', area: 4 }, { category: 'Cereals', type: 'Barley', area: 2 }]),
  farm(2, 'alain', 20, [{ category: 'Cereals', type: 'Wheat', area: 6 }]),
  farm(3, 'aldhafra', 30, [{ category: 'Fodder', type: 'Alfalfa', area: 8 }])
];

const breakdown = taxonomyBreakdown(farms);
is(breakdown.rows.map((r) => r.name), ['Cereals', 'Fodder'], 'categories keep the taxonomy order');
is(breakdown.totalArea, 20, 'total area');
is(breakdown.totalFarms, 3, 'total farms');

const cereals = breakdown.rows[0];
is(cereals.area, 12, 'category area sums its types');
is(cereals.farms, 2, 'a farm growing two cereals counts once against the category');
is(cereals.children.map((c) => c.name), ['Wheat', 'Barley'], 'types are ordered by area');
close(cereals.areaShare, 60, 0.001, 'category share of area');
close(cereals.children[0].areaShare, 50, 0.001, 'type share is against the same total, not rebased');

const classes = classBreakdown([
  { category: 'Structures', type: 'Warehouse', area: 10 },
  { category: 'Structures', type: 'Warehouse', area: 5 },
  { category: 'Open Agriculture', type: 'Fallow Land', area: 30 }
]);
is(classes.map((r) => r.name), ['Open Agriculture', 'Structures'], 'classes sort by area when no order is given');
is(classes.find((r) => r.name === 'Structures').children[0].area, 15, 'repeat parcels of a type collapse');

const provinces = byProvince(farms, { area: (fs) => fs.reduce((a, f) => a + f.area, 0) });
is(provinces.map((p) => p.id), ['abudhabi', 'alain', 'aldhafra'], 'every province appears, even an empty one');
is(provinces.find((p) => p.id === 'alain').area, 30);
is(provinces.find((p) => p.id === 'abudhabi').farms, 0, 'an empty province reads zero rather than vanishing');

is(rank(farms, (f) => f.area, { limit: 2 }).map((f) => f.fid), [3, 2], 'worst-first ranking');
is(rank(farms, (f) => f.area, { ascending: true })[0].fid, 1, 'ascending ranking');
is(sum(farms, (f) => f.area), 60);
is(mean(farms, (f) => f.area), 20);
is(median([5, 1, 3]), 3);
is(mean([], (f) => f.area), null, 'an empty set has no mean rather than a zero');

done('aggregate');
