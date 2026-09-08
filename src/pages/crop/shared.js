/* The two halves the cereals-and-fodder page and the open-field page have in
 * common.
 *
 * Both were settled together in the review and were asked to read the same way
 * below the charts: a table of crops shaped like the pilot report, and under it
 * a table of farms running oldest to newest — twelve months ago, three months
 * ago, now, and the year-on-year change. Written once so the two pages cannot
 * drift apart. */

import { dataTable, farmColumns } from '../../components/dataTable.js';
import { RECENT_QUARTERS, WINDOW_QUARTERS, QUARTERS } from '../../domain/periods.js';
import { dec, pct, signedPct } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';

/* Positions in the eight-quarter record: now, one quarter back, four back. */
const NOW = QUARTERS.length - 1;
const LAST_QUARTER = NOW - 1;
const LAST_YEAR = NOW - 4;

export const at = (series, index) => series?.[index] ?? 0;

/* Every crop row on a farm that belongs to this page, honouring the filter.
 * The row carries its farm, so a page can go from a crop back to the holding
 * that grows it without a second lookup. */
export const cropsOf = (farm, { categories, types }) =>
  farm.crops
    .filter((crop) => categories.includes(crop.category) && (!types || !types.size || types.has(crop.key)))
    .map((crop) => ({ ...crop, farm }));

const sumAt = (crops, index) => crops.reduce((total, crop) => total + at(crop.series, index), 0);

export const change = (before, after) => (before > 0.05 ? ((after - before) / before) * 100 : null);

/* Crop by crop, over the window. The shape of the table ADAFSA has already been
 * shown: the crop's name, then one column per quarter, then the movement. */
export function cropQuarterTable(rows, selection, { csvName = 'crops-by-quarter' } = {}) {
  const byType = new Map();
  for (const row of rows) {
    if (!byType.has(row.type)) byType.set(row.type, { type: row.type, category: row.category, series: new Array(QUARTERS.length).fill(0) });
    const entry = byType.get(row.type);
    for (let i = 0; i < QUARTERS.length; i++) entry.series[i] += at(row.series, i);
  }
  const crops = [...byType.values()].filter((c) => c.series.some((v) => v > 0.05));
  /* "A simplified table per produce, percentage and change" — the share is of
   * what is in the ground now, so the column adds to a hundred. */
  const plantedNow = crops.reduce((total, crop) => total + crop.series[NOW], 0);

  const quarterColumns = RECENT_QUARTERS.map((quarter, i) => {
    const index = QUARTERS.length - WINDOW_QUARTERS + i;
    return {
      key: `q${index}`, label: quarter.label, align: 'num',
      value: (c) => c.series[index], cell: (c) => dec(c.series[index], 1)
    };
  });

  return dataTable(crops, {
    selection,
    csvName,
    searchable: false,
    emptyText: 'Nothing planted in this selection.',
    footNote: 'Dunums, oldest quarter first.',
    columns: [
      { key: 'type', label: 'Crop', strong: true, defaultSort: true, value: (c) => c.type },
      { key: 'group', label: 'Group', value: (c) => c.category },
      ...quarterColumns,
      { key: 'share', label: 'Share', align: 'num',
        value: (c) => (plantedNow ? (c.series[NOW] / plantedNow) * 100 : 0),
        cell: (c) => pct(plantedNow ? (c.series[NOW] / plantedNow) * 100 : 0, 1) },
      { key: 'yoy', label: 'vs a year ago', align: 'num',
        value: (c) => change(c.series[LAST_YEAR], c.series[NOW]),
        cell: (c) => { const v = change(c.series[LAST_YEAR], c.series[NOW]); return v == null ? 'new' : signedPct(v); } }
    ]
  });
}

/* Farm by farm, oldest to newest — twelve months ago, three months ago, now,
 * and the movement against the year. Old to new, so the row reads the same way
 * as the chart above it. */
export function farmMovementTable(farms, selection, { categories, csvName = 'farms-by-quarter' } = {}) {
  const rows = farms
    .map((farm) => {
      const crops = cropsOf(farm, { categories, types: selection.types });
      return {
        farm,
        crops,
        year: sumAt(crops, LAST_YEAR),
        quarter: sumAt(crops, LAST_QUARTER),
        now: sumAt(crops, NOW)
      };
    })
    .filter((row) => row.year > 0.05 || row.now > 0.05);

  return dataTable(rows, {
    selection,
    searchable: true,
    csvName,
    searchOn: (r) => `${r.farm.fid} ${r.farm.owner}`,
    hrefFor: (r) => `#/farm/${r.farm.fid}`,
    emptyText: 'No farm in this selection grows these crops.',
    footNote: 'Dunums. Open a row to see each crop.',
    expand: (r) => r.crops
      .filter((crop) => at(crop.series, LAST_YEAR) > 0.05 || at(crop.series, NOW) > 0.05)
      .sort((a, b) => at(b.series, NOW) - at(a.series, NOW))
      .map((crop) => {
        const moved = change(at(crop.series, LAST_YEAR), at(crop.series, NOW));
        return ['', crop.type, '', '', dec(at(crop.series, LAST_YEAR), 1), dec(at(crop.series, LAST_QUARTER), 1),
          dec(at(crop.series, NOW), 1), moved == null ? 'new' : signedPct(moved)];
      }),
    columns: [
      { key: 'fid', label: 'Farm', strong: true, value: (r) => r.farm.fid, cell: (r) => `#${r.farm.fid}` },
      { key: 'owner', label: 'Owner', value: (r) => r.farm.owner },
      { key: 'province', label: 'Province', value: (r) => regionById(r.farm.province).label },
      farmColumns.centre,
      { key: 'year', label: '12 months ago', align: 'num', value: (r) => r.year, cell: (r) => dec(r.year, 1) },
      { key: 'quarter', label: '3 months ago', align: 'num', value: (r) => r.quarter, cell: (r) => dec(r.quarter, 1) },
      { key: 'now', label: 'Current', align: 'num', defaultSort: true, value: (r) => r.now, cell: (r) => dec(r.now, 1) },
      { key: 'yoy', label: 'vs a year ago', align: 'num',
        value: (r) => change(r.year, r.now),
        cell: (r) => { const v = change(r.year, r.now); return v == null ? 'new' : signedPct(v); } }
    ]
  });
}

export { NOW, LAST_QUARTER, LAST_YEAR };
