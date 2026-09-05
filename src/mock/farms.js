/* Everything the platform shows that the survey does not contain.
 *
 * This is the mock boundary. Tree counts, canopy indices, efficiency scores,
 * metered water, yields and all of the history are invented here and nowhere
 * else; replace this file with an API client and every page keeps working.
 *
 * Two properties are deliberate. Values are seeded from the farm's id, so a
 * refresh never changes a number in front of a client. And the invented figures
 * are anchored to real measured areas, so a farm with a lot of palm land has a
 * lot of palms — the fabrication stays internally consistent even when someone
 * cross-checks two pages against each other. */

import { seeded, around, between, pick, weighted, clamp } from './rng.js';
import { QUARTERS } from '../domain/periods.js';
import { CYCLE_MONTHS, windowFor } from '../domain/cropCalendar.js';
import { monthlyDemand, seasonalDemand, expectedProductionKg, cubicMetresPerKilo, YIELD_TONNES_PER_DUNUM } from '../domain/waterModel.js';
import { typeKey, TREE_CATEGORIES } from '../domain/taxonomy.js';

/* Date-palm cultivars, commonest first. */
const CULTIVARS = ['Khalas', 'Fard', 'Khenaizi', 'Lulu', 'Barhi', 'Dabbas', 'Shishi', 'Sultana', 'Naghal', 'Jabri', 'Sukkari', 'Ajwa', 'Mabroom', 'Safawi'];

/* Trees per dunum. Palms are planted wide, orchard fruit closer, forest stands
 * closest of all. */
const DENSITY = { 'Date Palm': [12, 3], 'Fruit Trees': [28, 6], 'Forest Trees': [22, 5] };

const QUARTER_COUNT = QUARTERS.length;

/* A gently drifting series, ending on the value we actually hold. Working
 * backwards from today keeps the present figure honest and lets the past wander. */
function backwardSeries(rand, current, { drift = 0.06, floor = 0 } = {}) {
  const series = new Array(QUARTER_COUNT);
  series[QUARTER_COUNT - 1] = current;
  for (let i = QUARTER_COUNT - 2; i >= 0; i--) {
    const step = 1 + around(rand, 0, drift);
    series[i] = Math.max(floor, series[i + 1] * step);
  }
  return series.map((v) => Math.round(v * 100) / 100);
}

function treeCountsFor(farm, rand) {
  const counts = { 'Date Palm': 0, 'Fruit Trees': 0, 'Forest Trees': 0 };
  for (const entry of farm.taxonomy) {
    const density = DENSITY[entry.category];
    if (!density) continue;
    counts[entry.category] += Math.round(entry.area * clamp(around(rand, density[0], density[1]), 4, 60));
  }
  return counts;
}

/* Fruit-tree species split, apportioned by the area each species occupies. */
function speciesSplit(farm, total) {
  const entries = farm.taxonomy.filter((t) => t.category === 'Fruit Trees');
  const area = entries.reduce((a, e) => a + e.area, 0);
  if (!area || !total) return [];
  return entries
    .map((e) => ({ name: e.type, trees: Math.round((e.area / area) * total), area: e.area }))
    .filter((s) => s.trees > 0)
    .sort((a, b) => b.trees - a.trees);
}

/* Crops this farm used to grow and no longer does. Without a few of these the
 * seasonal-change page can never answer "who stopped growing tomatoes", which
 * was the question the page exists for. */
function formerCrops(farm, rand, pool) {
  if (!pool.length || rand() > 0.22) return [];
  const candidate = pick(rand, pool);
  if (farm.taxonomy.some((t) => t.type === candidate.type)) return [];
  return [{ ...candidate, area: 0, former: true, pastArea: Math.round(between(rand, 0.5, 6) * 100) / 100 }];
}

export function enrichFarm(farm, { fieldCropPool = [] } = {}) {
  const rand = seeded('farm-' + farm.fid);
  const month = new Date('2026-08-12T00:00:00Z').getUTCMonth();

  // ---- Trees ---------------------------------------------------------------
  const counts = treeCountsFor(farm, rand);
  const palms = counts['Date Palm'];
  const fruitTrees = counts['Fruit Trees'];
  const forestTrees = counts['Forest Trees'];
  const trees = palms + fruitTrees + forestTrees;

  /* Canopy health is scored per farm, not per tree. The review settled this:
   * the holdings here are small, share one water source and are managed as a
   * unit, so the farm is the cluster. One number for palms, one for fruit. */
  const canopyBase = clamp(around(rand, 75, 36), 26, 97);
  const canopyPalms = palms ? Math.round(canopyBase) : null;
  const canopyFruit = fruitTrees ? Math.round(clamp(canopyBase + around(rand, 0, 24), 24, 98)) : null;

  // ---- Per-crop series and monthly presence --------------------------------
  const entries = [...farm.taxonomy, ...formerCrops(farm, rand, fieldCropPool)];
  const crops = entries.map((entry) => {
    const cropRand = seeded(`crop-${farm.fid}-${entry.category}-${entry.type}`);
    const isTree = TREE_CATEGORIES.includes(entry.category);
    /* A crop the farm no longer grows stops at some point in the record, not
     * always at the same one — otherwise every comparison period would show the
     * same set of farms stopping, or none at all. */
    let series;
    if (entry.former) {
      const stoppedAgo = 1 + Math.floor(cropRand() * 4);
      series = backwardSeries(cropRand, entry.pastArea);
      for (let i = QUARTER_COUNT - stoppedAgo; i < QUARTER_COUNT; i++) series[i] = 0;
    } else {
      series = backwardSeries(cropRand, entry.area, { drift: isTree ? 0.02 : 0.12 });
      /* And a farm that has only just taken a crop up shows nothing before it. */
      if (!isTree && cropRand() < 0.2) {
        const startedAgo = 1 + Math.floor(cropRand() * 5);
        for (let i = 0; i < QUARTER_COUNT - startedAgo; i++) series[i] = 0;
      }
    }

    /* Each holding plants on its own schedule. A few go early and a few late,
     * which is why the calendar reads as a curve rather than a block — and why
     * the count of farms in the ground rises and falls the same way the area
     * does. The window comes from the crop; the offset is this farm's. */
    const cycle = CYCLE_MONTHS[entry.category] || 12;
    const win = windowFor(entry.category, entry.type);
    const offset = win ? Math.round(around(cropRand, 0, 2.6)) : 0;
    const start = win ? (((win.from + offset) % 12) + 12) % 12 : 0;
    const monthsInGround = new Set();
    if (win) {
      for (let i = 0; i < cycle; i++) monthsInGround.add((start + i) % 12);
    } else {
      for (let i = 0; i < 12; i++) monthsInGround.add(i);
    }
    const water = seasonalDemand(entry.category, entry.area, cycle, start);
    const production = expectedProductionKg(entry.category, entry.area);
    const yieldFactor = clamp(around(cropRand, 1, 0.95), 0.3, 1.8);

    return {
      key: typeKey(entry.category, entry.type),
      category: entry.category,
      type: entry.type,
      area: entry.area,
      former: !!entry.former,
      series,
      monthly: Array.from({ length: 12 }, (_, month) => (monthsInGround.has(month) ? entry.area : 0)),
      startMonth: start,
      demandThisMonth: monthlyDemand(entry.category, entry.area, month),
      cycleMonths: cycle,
      seasonalWater: water,
      expectedKg: production * yieldFactor,
      tonnesPerDunum: (YIELD_TONNES_PER_DUNUM[entry.category] || 0) * yieldFactor,
      yieldFactor,
      cubicMetresPerKilo: cubicMetresPerKilo(water, production * yieldFactor)
    };
  });

  // ---- Water: demand, metered use, and the over-allocation flag -------------
  const demand = crops.reduce((a, c) => a + c.demandThisMonth, 0);
  /* Most farms sit near their allocation; a minority run well over, and a few
   * under-irrigate. The flag is raised against this month, never the season. */
  const useFactor = weighted(rand, [
    { weight: 0.52, range: [0.86, 1.04] },
    { weight: 0.2, range: [1.05, 1.24] },
    { weight: 0.16, range: [1.26, 1.9] },
    { weight: 0.12, range: [0.55, 0.79] }
  ]).range;
  const usePct = between(rand, useFactor[0], useFactor[1]) * 100;
  const actual = (demand * usePct) / 100;

  const cropsWithUse = crops.map((crop) => {
    const cropRand = seeded(`use-${farm.fid}-${crop.type}`);
    /* Each crop varies around the farm's overall position, so the per-crop
     * table can point at where the excess actually is. */
    const cropUse = clamp(usePct * clamp(around(cropRand, 1, 0.22), 0.5, 1.8), 30, 320);
    return { ...crop, usePct: cropUse, actualThisMonth: (crop.demandThisMonth * cropUse) / 100 };
  });

  // ---- Irrigation efficiency ------------------------------------------------
  /* Efficiency and water use pull against each other in both directions: a
   * farm well over its allocation is wasting water, and one well under it is
   * usually irrigating badly rather than frugally. */
  const efficiency = Math.round(clamp(around(rand, 93 - Math.abs(usePct - 100) * 0.38, 30), 22, 99));
  const efficiencySeries = backwardSeries(rand, efficiency, { drift: 0.05, floor: 15 }).map((v) => Math.round(clamp(v, 15, 100)));

  // ---- Structures and cultivation history ----------------------------------
  const structureSeries = backwardSeries(rand, farm.structureArea, { drift: 0.03 });
  const structureCountSeries = backwardSeries(rand, farm.structures.length, { drift: 0.04 }).map((v) => Math.round(v));
  const cultivationSeries = backwardSeries(rand, farm.cultivatedArea, { drift: 0.09 });
  const treeSeries = backwardSeries(rand, trees, { drift: 0.015 }).map((v) => Math.round(v));

  return {
    ...farm,
    crops: cropsWithUse,
    palms,
    fruitTrees,
    forestTrees,
    trees,
    cultivar: palms ? CULTIVARS[Math.min(CULTIVARS.length - 1, Math.floor(rand() ** 2 * CULTIVARS.length))] : null,
    species: speciesSplit(farm, fruitTrees),
    canopyPalms,
    canopyFruit,
    canopy: canopyPalms ?? canopyFruit,
    efficiency,
    efficiencySeries,
    waterDemand: demand,
    waterActual: actual,
    waterUsePct: usePct,
    overAllocated: usePct > 125,
    seasonalWater: crops.reduce((a, c) => a + c.seasonalWater, 0),
    expectedKg: crops.reduce((a, c) => a + c.expectedKg, 0),
    cultivationSeries,
    treeSeries,
    structureSeries,
    structureCountSeries,
    lastSurveyed: QUARTERS[QUARTER_COUNT - 1].id
  };
}

/* The pool of field crops a farm might once have grown, drawn from the real
 * taxonomy so a "stopped growing" row never names a crop nobody here plants. */
export function fieldCropPool(tree) {
  return tree
    .filter((c) => c.kind === 'field')
    .flatMap((c) => c.types.map((t) => ({ category: c.name, type: t.name })));
}
