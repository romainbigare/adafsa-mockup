import { taxonomyBreakdown, classBreakdown, byProvince, rank, sum, mean, median } from '../src/domain/aggregate.js';
import { is, close, done } from './helpers.js';
import { signed, signedPct } from '../src/domain/format.js';

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


/* A class breakdown reports two measures, and both need their share. The count
 * column was named after the shares were worked out, so every count share read
 * 0.0% under a total of 100% — visible on the structures page. */
const shareRows = classBreakdown([
  { category: 'Structures', type: 'Warehouse', area: 6, count: 3 },
  { category: 'Structures', type: 'Shed', area: 2, count: 1 },
  { category: 'Protected Agriculture', type: 'Greenhouse', area: 2, count: 4 }
]);
close(shareRows.reduce((a, r) => a + r.farmShare, 0), 100, 0.01, 'the count shares add to a hundred');
close(shareRows.find((r) => r.name === 'Structures').farmShare, 50, 0.01, 'four of eight structures is half');
close(shareRows.find((r) => r.name === 'Structures').areaShare, 80, 0.01, 'and it covers eight tenths of the footprint');
close(shareRows.find((r) => r.name === 'Structures').children.find((c) => c.name === 'Warehouse').farmShare,
  37.5, 0.01, 'the types carry their share too');


/* A movement that rounds to nothing must read as nothing. "−0%" claims a
 * direction the number does not have, and one of them in a column costs the
 * whole column its credibility. */
is(signedPct(-0.4), '0%', 'a hair below zero is zero');
is(signedPct(0.4), '0%', 'and so is a hair above it');
is(signedPct(-13), '−13%', 'a real fall keeps its sign');
is(signedPct(13), '+13%', 'and so does a real rise');
is(signed(-0.02, 1), '0.0', 'the same rule for a plain signed number');
is(signed(-674), '−674', 'and a real loss keeps its minus');
is(signedPct(null), '—', 'nothing to compare reads as nothing');

done('aggregate');
