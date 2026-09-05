/* Generates data/attributes.js — the small, geometry-free farm table that every
 * page reads. Run with `npm run build:data` after any change to data/geo/*.
 *
 * Why this exists: the three geometry files total ~4.4 MB. Most pages in the
 * platform have no map at all, and none of them need polygons to count things.
 * So the counting facts are extracted once, here, and the polygons stay behind
 * a lazy import.
 *
 * What it does:
 *   1. Projects each farm's boundary to lat/lng and takes a centroid.
 *   2. Assigns a province from that centroid (see PROVINCE_SPLITS).
 *   3. Joins crop parcels to farms on owner name (the only link in the data).
 *   4. Joins land-use parcels to farms spatially — the land-use file carries no
 *      owner, so parcels are attached to the farm whose bounding box contains
 *      their centroid.
 *   5. Computes land-use parcel areas, which the source data does not carry.
 */
import fs from 'node:fs';
import plots from '../data/geo/plots.js';
import crops from '../data/geo/crops.js';
import landuse from '../data/geo/landuse.js';

const R = 6378137.0;
const DEG = 180 / Math.PI;
const toLatLng = (x, y) => [(2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * DEG, (x / R) * DEG];

/* Longitude cuts through the Abu Dhabi Emirate. Al Dhafra is the western
 * region, Al Ain the eastern; the capital region sits between them. Approximate
 * on purpose — the real boundaries are not in this dataset and inventing
 * polygons for them would look more authoritative than it is. */
const PROVINCE_SPLITS = [
  { max: 53.5, id: 'aldhafra' },
  { max: 55.0, id: 'abudhabi' },
  { max: Infinity, id: 'alain' }
];
const provinceOf = (lng) => PROVINCE_SPLITS.find((p) => lng < p.max).id;

/* Signed ring area in Web Mercator, corrected for the projection's latitude
 * stretch (a factor of cos(lat)^2 on area), then expressed in dunums. */
function ringAreaDunums(ring, lat) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  const cos = Math.cos((lat * Math.PI) / 180);
  return (Math.abs(sum / 2) * cos * cos) / 1000;
}

function measure(feature) {
  const polys = feature.geometry?.coordinates || [];
  let x = 0, y = 0, n = 0;
  for (const poly of polys) for (const pt of poly[0]) { x += pt[0]; y += pt[1]; n++; }
  if (!n) return null;
  const [lat, lng] = toLatLng(x / n, y / n);
  let area = 0;
  for (const poly of polys) area += ringAreaDunums(poly[0], lat);
  const b = feature.bbox;
  return { lat, lng, area, bbox: b };
}

// ---- Farms -----------------------------------------------------------------
const farms = [];
const byOwner = new Map();
for (const f of plots.features) {
  const p = f.properties;
  const m = measure(f);
  if (!m) continue;
  const farm = {
    fid: p.fid,
    owner: p.name,
    area: Math.round((p.dunum || m.area) * 10) / 10,
    lat: Math.round(m.lat * 1e5) / 1e5,
    lng: Math.round(m.lng * 1e5) / 1e5,
    province: provinceOf(m.lng),
    hasPalms: /^palm$/i.test(p.crop || ''),
    crops: [],
    land: [],
    _bbox: m.bbox
  };
  farms.push(farm);
  if (!byOwner.has(p.name)) byOwner.set(p.name, []);
  byOwner.get(p.name).push(farm);
}

// ---- Crop parcels: joined on owner name -------------------------------------
/* Dual-named crops take their first name, per the review. */
const CROP_RENAME = { 'Cantaloupe/Muskmelon': 'Cantaloupe' };
const cropTypes = [];
const cropIndex = new Map();
const cropCategory = [];
function cropTypeId(category, type) {
  const name = CROP_RENAME[type] || type;
  const key = category + '|' + name;
  if (!cropIndex.has(key)) {
    cropIndex.set(key, cropTypes.length);
    cropTypes.push(name);
    cropCategory.push(category);
  }
  return cropIndex.get(key);
}

let unmatchedCrops = 0;
for (const f of crops.features) {
  const p = f.properties;
  const owners = byOwner.get(p.owner_name);
  if (!owners) { unmatchedCrops++; continue; }
  const id = cropTypeId(p.level_1, p.level_3);
  const area = Math.round((p['area_(dun)'] || 0) * 100) / 100;
  // Owner names are not unique across plots; give the parcel to the first plot.
  owners[0].crops.push([id, area]);
}

// ---- Land-use parcels: joined spatially -------------------------------------
const landTypes = [];
const landIndex = new Map();
const landCategory = [];
function landTypeId(category, type) {
  const key = category + '|' + type;
  if (!landIndex.has(key)) {
    landIndex.set(key, landTypes.length);
    landTypes.push(type);
    landCategory.push(category);
  }
  return landIndex.get(key);
}

/* A coarse grid over the farm bounding boxes, so each parcel only tests the
 * handful of farms near it rather than all five hundred. */
const CELL = 2000; // metres in Web Mercator
const grid = new Map();
const cellKey = (x, y) => Math.floor(x / CELL) + ':' + Math.floor(y / CELL);
for (const farm of farms) {
  const [x0, y0, x1, y1] = farm._bbox;
  for (let x = Math.floor(x0 / CELL); x <= Math.floor(x1 / CELL); x++) {
    for (let y = Math.floor(y0 / CELL); y <= Math.floor(y1 / CELL); y++) {
      const k = x + ':' + y;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(farm);
    }
  }
}

const parcelTotals = new Map();
let unplacedLand = 0;
for (const f of landuse.features) {
  const p = f.properties;
  const polys = f.geometry?.coordinates || [];
  let x = 0, y = 0, n = 0;
  for (const poly of polys) for (const pt of poly[0]) { x += pt[0]; y += pt[1]; n++; }
  if (!n) continue;
  const cx = x / n, cy = y / n;
  const [lat] = toLatLng(cx, cy);
  let area = 0;
  for (const poly of polys) area += ringAreaDunums(poly[0], lat);
  area = Math.round(area * 100) / 100;

  const id = landTypeId(p.Category, p.Type);
  parcelTotals.set(id, (parcelTotals.get(id) || 0) + area);

  const candidates = grid.get(cellKey(cx, cy)) || [];
  const host = candidates.find((farm) => {
    const [x0, y0, x1, y1] = farm._bbox;
    return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
  });
  if (host) host.land.push([id, area]);
  else unplacedLand++;
}

// ---- Emit -------------------------------------------------------------------
/* Parcels of the same type on one farm collapse into a single row — the pages
 * only ever ask for totals per type. */
function collapse(rows) {
  const acc = new Map();
  for (const [id, area] of rows) acc.set(id, (acc.get(id) || 0) + area);
  return [...acc.entries()]
    .map(([id, area]) => [id, Math.round(area * 100) / 100])
    .sort((a, b) => b[1] - a[1]);
}

const records = farms.map((f) => ({
  fid: f.fid,
  owner: f.owner,
  area: f.area,
  lat: f.lat,
  lng: f.lng,
  province: f.province,
  hasPalms: f.hasPalms,
  crops: collapse(f.crops),
  land: collapse(f.land)
}));

const out = `/* GENERATED by tools/build-attributes.mjs — do not hand-edit.
 * The geometry-free farm table. Every page reads this; only pages with a map
 * additionally pull the polygons from data/geo/.
 *
 * cropTypes / landTypes are dictionaries: a farm's \`crops\` and \`land\` entries
 * are [typeIndex, dunums] pairs into them, and cropCategories / landCategories
 * give each type's parent category at the same index.
 */
export const cropTypes = ${JSON.stringify(cropTypes)};
export const cropCategories = ${JSON.stringify(cropCategory)};
export const landTypes = ${JSON.stringify(landTypes)};
export const landCategories = ${JSON.stringify(landCategory)};

/* Region-wide land-use totals in dunums, indexed like landTypes. Includes the
 * parcels that fall outside every farm boundary, so the land-use module can
 * report the full survey rather than only what sits on a mapped holding. */
export const landTotals = ${JSON.stringify([...landTypes.keys()].map((i) => Math.round((parcelTotals.get(i) || 0) * 10) / 10))};

export const farms = ${JSON.stringify(records)};
`;
fs.writeFileSync('data/attributes.js', out);

const withCrops = records.filter((r) => r.crops.length).length;
const withLand = records.filter((r) => r.land.length).length;
console.log(`farms ${records.length} · with crop parcels ${withCrops} · with land-use parcels ${withLand}`);
console.log(`crop types ${cropTypes.length} · land types ${landTypes.length}`);
console.log(`unmatched crop parcels ${unmatchedCrops} · land parcels outside every farm ${unplacedLand}`);
console.log(`province split: ` + ['aldhafra', 'abudhabi', 'alain'].map((p) => p + ' ' + records.filter((r) => r.province === p).length).join(' · '));
console.log(`written ${(fs.statSync('data/attributes.js').size / 1024).toFixed(0)} KB`);
