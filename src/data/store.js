/* The one place a page asks for data.
 *
 * Every screen in the platform reads its rows through query() here. That is
 * what makes the number contract enforceable rather than merely intended: with
 * twenty-two pages, a convention that "figures should agree" would not survive,
 * but a single function they all call will.
 *
 * The store is built once, on first use, and held. It carries no geometry — see
 * geometry.js for the polygons, which only pages with a map ever pull. */

import * as attributes from '../../data/attributes.js';
import { buildTaxonomy, splitKey, FIELD_CATEGORIES, TREE_CATEGORIES } from '../domain/taxonomy.js';
import { farmInRegion } from '../domain/regions.js';
import { composeFarm } from './compose.js';
import { enrichFarm, fieldCropPool } from '../mock/farms.js';

let cache = null;

function build() {
  const dictionaries = {
    cropTypes: attributes.cropTypes,
    cropCategories: attributes.cropCategories,
    landTypes: attributes.landTypes,
    landCategories: attributes.landCategories
  };
  const taxonomy = buildTaxonomy(dictionaries);
  const pool = fieldCropPool(taxonomy);

  const farms = attributes.farms
    .map((record) => composeFarm(record, dictionaries))
    .map((farm) => enrichFarm(farm, { fieldCropPool: pool }));

  /* Yield is only meaningful against the crop's own average, so the averages
   * are computed across every farm once and written back onto each crop row.
   * Doing it here rather than per page is what stops two pages disagreeing
   * about what "below average" means. */
  const cropAverages = new Map();
  for (const farm of farms) {
    for (const crop of farm.crops) {
      if (crop.former || !crop.area) continue;
      if (!cropAverages.has(crop.type)) cropAverages.set(crop.type, { sum: 0, n: 0 });
      const acc = cropAverages.get(crop.type);
      acc.sum += crop.tonnesPerDunum;
      acc.n += 1;
    }
  }
  for (const [type, acc] of cropAverages) cropAverages.set(type, acc.sum / acc.n);

  for (const farm of farms) {
    for (const crop of farm.crops) {
      const average = cropAverages.get(crop.type);
      crop.cropAverage = average ?? null;
      crop.yieldDeviation = average ? ((crop.tonnesPerDunum - average) / average) * 100 : null;
    }
    const scored = farm.crops.filter((c) => c.yieldDeviation != null && !c.former);
    farm.yieldDeviation = scored.length ? scored.reduce((a, c) => a + c.yieldDeviation, 0) / scored.length : null;
  }

  /* Region-wide land-use totals, including parcels that fall outside every
   * mapped holding — the land-use module reports the whole survey. */
  const landClasses = attributes.landTypes.map((type, i) => ({
    category: attributes.landCategories[i],
    type,
    area: attributes.landTotals[i]
  }));

  return { farms, taxonomy, landClasses, cropAverages, byId: new Map(farms.map((f) => [String(f.fid), f])) };
}

export function store() {
  if (!cache) cache = build();
  return cache;
}

export const allFarms = () => store().farms;
export const taxonomyTree = () => store().taxonomy;
export const landClasses = () => store().landClasses;
export const farmById = (fid) => store().byId.get(String(fid)) || null;

/* The working set.
 *
 * `region` narrows to a province; `types` is a Set of taxonomy keys and narrows
 * to the farms growing at least one of them. An empty or absent set means no
 * narrowing — "nothing ticked" is treated as "everything", so a page never
 * opens on a blank screen. */
export function query({ region = 'emirate', types = null } = {}) {
  const farms = store().farms.filter((farm) => farmInRegion(farm, region));
  if (!types || !types.size) return farms;
  return farms.filter((farm) => farm.crops.some((crop) => !crop.former && crop.area > 0 && types.has(crop.key)));
}

/* The crop rows of a working set, flattened — what the crop, yield, water and
 * calendar pages count. Former crops are kept out unless asked for, since they
 * describe land that is no longer in production. */
export function cropRows(farms, { types = null, categories = null, includeFormer = false } = {}) {
  const rows = [];
  for (const farm of farms) {
    for (const crop of farm.crops) {
      if (!includeFormer && crop.former) continue;
      if (types && types.size && !types.has(crop.key)) continue;
      if (categories && !categories.includes(crop.category)) continue;
      rows.push({ farm, ...crop });
    }
  }
  return rows;
}

export const fieldCropRows = (farms, options = {}) => cropRows(farms, { ...options, categories: FIELD_CATEGORIES });
export const treeCropRows = (farms, options = {}) => cropRows(farms, { ...options, categories: TREE_CATEGORIES });

/* Taxonomy entries as the farm records see them, for breakdown tables. */
export function taxonomyEntries(farms, { types = null } = {}) {
  return farms.map((farm) => ({
    ...farm,
    taxonomy: farm.crops
      .filter((c) => !c.former && c.area > 0 && (!types || !types.size || types.has(c.key)))
      .map((c) => ({ category: c.category, type: c.type, area: c.area }))
  }));
}

export const keyToLabel = (key) => splitKey(key).type;
