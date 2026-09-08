/* What the cereals-and-fodder page and the open-field page have in common.
 *
 * The tables themselves live in components/quarterTables.js — they are the
 * shape every change page in the platform uses now. What is here is the crop
 * adapter: which rows a page counts, and how a farm breaks into its crops. */

import { quarterTable, farmQuarterTable, at, change, NOW, LAST_QUARTER, LAST_YEAR } from '../../components/quarterTables.js';
import { QUARTERS } from '../../domain/periods.js';

/* Every crop row on a farm that belongs to this page, honouring the filter.
 * The row carries its farm, so a page can go from a crop back to the holding
 * that grows it without a second lookup. */
export const cropsOf = (farm, { categories, types }) =>
  farm.crops
    .filter((crop) => categories.includes(crop.category) && (!types || !types.size || types.has(crop.key)))
    .map((crop) => ({ ...crop, farm }));

/* Crop rows collapsed by type, so several farms growing tomatoes are one row. */
export function byCropType(rows) {
  const types = new Map();
  for (const row of rows) {
    if (!types.has(row.type)) types.set(row.type, { name: row.type, group: row.category, series: new Array(QUARTERS.length).fill(0) });
    const entry = types.get(row.type);
    for (let i = 0; i < QUARTERS.length; i++) entry.series[i] += at(row.series, i);
  }
  return [...types.values()].filter((entry) => entry.series.some((value) => value > 0.05));
}

export const cropQuarterTable = (rows, selection, options = {}) =>
  quarterTable(byCropType(rows), selection, { nameLabel: 'Crop', footNote: 'Dunums, oldest quarter first.', ...options });

export function farmMovementTable(farms, selection, { categories, csvName }) {
  const cropsFor = (farm) => cropsOf(farm, { categories, types: selection.types });
  return farmQuarterTable(farms, selection, {
    csvName,
    seriesOf: (farm) => {
      const crops = cropsFor(farm);
      return QUARTERS.map((_, i) => crops.reduce((total, crop) => total + at(crop.series, i), 0));
    },
    childrenOf: (farm) => cropsFor(farm).map((crop) => ({ name: crop.type, series: crop.series })),
    footNote: 'Dunums. Open a row to see each crop.',
    emptyText: 'No farm in this selection grows these crops.'
  });
}

export { at, change, NOW, LAST_QUARTER, LAST_YEAR };
