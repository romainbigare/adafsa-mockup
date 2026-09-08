/* Tree varieties, aggregated across a set of farms.
 *
 * Tree monitoring is read cultivar by cultivar — Khalas against Barhi, not palm
 * against fruit — so both the map and the change page need the count broken
 * that far down, with a year-by-year record behind it. One function, so the map
 * and the table can never name different varieties.
 *
 * Colour is a tint of the variety's own group, assigned in a fixed order so a
 * cultivar keeps its shade between the map, the legend and the chart. */

import { YEAR_COUNT } from '../../domain/periods.js';
import { categoryColor, tints } from '../../domain/palette.js';

/* Forest trees are left off the tree map on purpose: nothing names them, and a
 * third of a legend spent on one undifferentiated block was the objection. */
export const MAPPED_CATEGORIES = ['Date Palm', 'Fruit Trees'];

export function varietyTotals(farms, { categories = null } = {}) {
  const rows = new Map();
  for (const farm of farms) {
    for (const stand of farm.varieties || []) {
      if (categories && !categories.includes(stand.category)) continue;
      const key = `${stand.category}:${stand.name}`;
      if (!rows.has(key)) rows.set(key, { key, name: stand.name, category: stand.category, trees: 0, years: new Array(YEAR_COUNT).fill(0) });
      const row = rows.get(key);
      row.trees += stand.trees;
      for (let i = 0; i < YEAR_COUNT; i++) row.years[i] += stand.years[i] || 0;
    }
  }
  const out = [...rows.values()].sort((a, b) => b.trees - a.trees);
  const total = out.reduce((a, r) => a + r.trees, 0);
  return out.map((row) => ({ ...row, share: total ? (row.trees / total) * 100 : 0 }));
}

/* A stable colour per variety within its group. */
export function varietyPalette(rows) {
  const colours = new Map();
  for (const category of new Set(rows.map((r) => r.category))) {
    const members = rows.filter((r) => r.category === category);
    const shades = tints(categoryColor(category), members.length);
    members.forEach((row, i) => colours.set(row.key, shades[i]));
  }
  return (stand) => colours.get(`${stand.category}:${stand.name}`) || categoryColor(stand.category);
}
