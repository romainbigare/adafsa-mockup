/* Group-by helpers.
 *
 * Every summary table in the platform is one of a small number of shapes: a
 * total, a breakdown by taxonomy category that opens into its types, or a
 * breakdown by province. Writing those once here is what keeps twenty-two pages
 * from each inventing their own arithmetic — and what makes the number contract
 * enforceable rather than merely intended.
 *
 * Nothing here touches the DOM or knows what a page looks like. */

import { CATEGORY_ORDER, typeKey } from './taxonomy.js';
import { PROVINCES } from './regions.js';

export const sum = (records, valueOf) => records.reduce((total, r) => total + (valueOf(r) || 0), 0);

export const mean = (records, valueOf) => {
  const values = records.map(valueOf).filter((v) => v != null && !Number.isNaN(v));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

export function median(values) {
  const sorted = values.filter((v) => v != null && !Number.isNaN(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/* Crop distribution: category rows, each opening into its type rows, measured
 * both by area and by how many farms grow it.
 *
 * A farm growing three cereals counts once against Cereals and once against
 * each of the three — which is what the review asked for, and why the farm
 * column does not add up to the farm total. The tables say so. */
export function taxonomyBreakdown(farms, { categories = CATEGORY_ORDER } = {}) {
  const cats = new Map();
  const ensure = (name) => {
    if (!cats.has(name)) cats.set(name, { name, area: 0, farms: new Set(), types: new Map() });
    return cats.get(name);
  };

  for (const farm of farms) {
    for (const entry of farm.taxonomy) {
      if (!categories.includes(entry.category)) continue;
      const cat = ensure(entry.category);
      cat.area += entry.area;
      cat.farms.add(farm.fid);
      if (!cat.types.has(entry.type)) cat.types.set(entry.type, { name: entry.type, area: 0, farms: new Set() });
      const type = cat.types.get(entry.type);
      type.area += entry.area;
      type.farms.add(farm.fid);
    }
  }

  const rows = categories
    .filter((name) => cats.has(name))
    .map((name) => {
      const cat = cats.get(name);
      return {
        key: name,
        name,
        area: cat.area,
        farms: cat.farms.size,
        children: [...cat.types.values()]
          .sort((a, b) => b.area - a.area)
          .map((t) => ({ key: typeKey(name, t.name), name: t.name, area: t.area, farms: t.farms.size }))
      };
    });

  const totalArea = rows.reduce((a, r) => a + r.area, 0);
  const totalFarms = new Set(farms.filter((f) => f.taxonomy.some((t) => categories.includes(t.category))).map((f) => f.fid)).size;
  return withShares(rows, totalArea, totalFarms);
}

/* Adds percentage columns to a breakdown, at both levels, against the totals
 * passed in rather than against the visible rows — so filtering a table never
 * silently rebases its percentages. */
export function withShares(rows, totalArea, totalFarms) {
  const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);
  return {
    rows: rows.map((r) => ({
      ...r,
      areaShare: pct(r.area, totalArea),
      farmShare: pct(r.farms, totalFarms),
      children: (r.children || []).map((c) => ({
        ...c,
        areaShare: pct(c.area, totalArea),
        farmShare: pct(c.farms, totalFarms)
      }))
    })),
    totalArea,
    totalFarms
  };
}

/* A generic category → type breakdown for datasets that are not the crop
 * taxonomy (land-use classes, structure types). */
export function classBreakdown(entries, { order = null } = {}) {
  const cats = new Map();
  for (const e of entries) {
    if (!cats.has(e.category)) cats.set(e.category, { name: e.category, area: 0, count: 0, types: new Map() });
    const cat = cats.get(e.category);
    cat.area += e.area || 0;
    cat.count += e.count || 0;
    if (!cat.types.has(e.type)) cat.types.set(e.type, { name: e.type, area: 0, count: 0 });
    const type = cat.types.get(e.type);
    type.area += e.area || 0;
    type.count += e.count || 0;
  }
  let rows = [...cats.values()].map((cat) => ({
    key: cat.name,
    name: cat.name,
    area: cat.area,
    count: cat.count,
    children: [...cat.types.values()].sort((a, b) => b.area - a.area).map((t) => ({ key: cat.name + ':' + t.name, ...t }))
  }));
  rows = order ? rows.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name)) : rows.sort((a, b) => b.area - a.area);
  const totalArea = rows.reduce((a, r) => a + r.area, 0);
  const totalCount = rows.reduce((a, r) => a + r.count, 0);
  return withShares(rows, totalArea, totalCount).rows.map((r) => ({ ...r, farms: r.count })) ;
}

/* Province rows for the block that sits under every module's emirate summary. */
export function byProvince(farms, measures) {
  return PROVINCES.map((province) => {
    const members = farms.filter((f) => f.province === province.id);
    const row = { id: province.id, label: province.label, farms: members.length };
    for (const [key, fn] of Object.entries(measures)) row[key] = fn(members);
    return row;
  });
}

/* Rank and take the top N — the shape behind every "worst first" table. */
export function rank(records, scoreOf, { limit = Infinity, ascending = false } = {}) {
  return records
    .map((r) => ({ record: r, score: scoreOf(r) }))
    .filter((x) => x.score != null && !Number.isNaN(x.score))
    .sort((a, b) => (ascending ? a.score - b.score : b.score - a.score))
    .slice(0, limit)
    .map((x) => x.record);
}
