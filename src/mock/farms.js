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
import { QUARTERS, YEAR_COUNT } from '../domain/periods.js';
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

/* Fallow land, split the way the review asked for it: land resting for less
 * than a year is waiting for its next crop, land resting longer is not being
 * used at all. The two are counted apart because they mean different things.
 *
 * The split is anchored to the cultivation record rather than drawn freely:
 * whatever left cultivation since is counted as fallow now, so the fallow
 * record moves against the planting record instead of wandering on its own. A
 * holding that was planting more in the past than it holds fallow today simply
 * reads as zero — land came from somewhere the survey does not describe, and
 * inventing that somewhere would be worse than leaving it out. Today's figure
 * is always the survey's own. */
function fallowSeries(rand, cultivation, fallowNow) {
  const last = cultivation.length - 1;
  const total = cultivation.map((value) => Math.max(0, fallowNow + (cultivation[last] - value)));
  const share = clamp(around(rand, 0.46, 0.3), 0.1, 0.85);
  const long = total.map((value, i) => {
    /* Long-term fallow drifts slowly; the recent half absorbs the movement. */
    const drift = clamp(share * (1 + around(rand, 0, 0.12)), 0.05, 0.9);
    return Math.round(value * (i === last ? share : drift) * 100) / 100;
  });
  return {
    total,
    long,
    recent: total.map((value, i) => Math.round(Math.max(0, value - long[i]) * 100) / 100)
  };
}

/* Trees by variety, with a year-by-year record.
 *
 * Tree monitoring is read by cultivar — "how did Khalas move against Barhi" —
 * so the count has to break down that far. Palms are spread over a handful of
 * cultivars with this farm's main one carrying most of them; fruit trees follow
 * the species split the survey already gives; forest trees stay one entry
 * because nothing names them. */
function treeVarieties(rand, { palms, cultivar, species, forestTrees }) {
  const out = [];

  if (palms > 0) {
    const count = 1 + Math.floor(rand() * 3);
    const names = [cultivar];
    while (names.length < count) {
      const candidate = pick(rand, CULTIVARS);
      if (!names.includes(candidate)) names.push(candidate);
    }
    /* The main cultivar takes the lion's share; the rest divide what is left.
     * The remainder from rounding goes back to the main cultivar, so the split
     * adds to the palm count exactly — five hundred farms each a tree or two
     * out would show as a discrepancy between this page and the last. */
    const weights = names.map((_, i) => (i === 0 ? 2.6 : between(rand, 0.3, 1.1)));
    const total = weights.reduce((a, w) => a + w, 0);
    const split = names.map((name, i) => ({
      category: 'Date Palm', name, trees: i === 0 ? 0 : Math.round((weights[i] / total) * palms)
    }));
    split[0].trees = palms - split.slice(1).reduce((a, entry) => a + entry.trees, 0);
    for (const entry of split) if (entry.trees > 0) out.push(entry);
  }

  for (const entry of species) out.push({ category: 'Fruit Trees', name: entry.name, trees: entry.trees });
  if (forestTrees > 0) out.push({ category: 'Forest Trees', name: 'Forest Trees', trees: forestTrees });

  return out.map((entry) => {
    const varietyRand = seeded(`variety-${entry.category}-${entry.name}-${entry.trees}`);
    /* A cultivar rises or falls across the whole emirate, not farm by farm —
     * growers follow the market together. Without a shared trend, five hundred
     * independent wobbles average to nothing and the page reports that every
     * variety moved by one tree. */
    const drift = between(seeded(`trend-${entry.category}-${entry.name}`), -0.09, 0.07);
    const years = new Array(YEAR_COUNT);
    years[YEAR_COUNT - 1] = entry.trees;
    for (let i = YEAR_COUNT - 2; i >= 0; i--) {
      years[i] = Math.max(0, Math.round(years[i + 1] / (1 + drift + around(varietyRand, 0, 0.06))));
    }
    return { ...entry, years };
  });
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
  const fallow = fallowSeries(rand, cultivationSeries, farm.fallowArea);
  const cultivar = palms ? CULTIVARS[Math.min(CULTIVARS.length - 1, Math.floor(rand() ** 2 * CULTIVARS.length))] : null;
  const species = speciesSplit(farm, fruitTrees);
  const varieties = treeVarieties(rand, { palms, cultivar, species, forestTrees });

  return {
    ...farm,
    crops: cropsWithUse,
    palms,
    fruitTrees,
    forestTrees,
    trees,
    cultivar,
    species,
    varieties,
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
    fallowRecentSeries: fallow.recent,
    fallowLongSeries: fallow.long,
    fallowRecent: fallow.recent[fallow.recent.length - 1],
    fallowLong: fallow.long[fallow.long.length - 1],
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
