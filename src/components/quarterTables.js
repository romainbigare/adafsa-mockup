/* The two tables the review settled on for a change page, written once.
 *
 * The first is the shape of the pilot report: one row per thing counted — a
 * crop, a structure class — with a column per quarter, its share of the total
 * and its movement. The second is the farms behind it, running oldest to newest
 * so the row reads the same way as the chart above it: twelve months ago, three
 * months ago, now, and the change against the year.
 *
 * Both were agreed for crop monitoring and both apply anywhere the platform
 * counts a thing over quarters, so neither belongs to one page. */

import { h } from '../app/dom.js';
import { dataTable, farmColumns } from './dataTable.js';
import { RECENT_QUARTERS, WINDOW_QUARTERS, QUARTERS } from '../domain/periods.js';
import { dec, pct, signedPct } from '../domain/format.js';
import { regionById } from '../domain/regions.js';

/* Positions in the eight-quarter record. */
export const NOW = QUARTERS.length - 1;
export const LAST_QUARTER = NOW - 1;
export const LAST_YEAR = NOW - 4;
const OFFSET = QUARTERS.length - WINDOW_QUARTERS;

export const at = (series, index) => series?.[index] ?? 0;

export const change = (before, after) => (before > 0.05 ? ((after - before) / before) * 100 : null);

const quarterColumns = (format) => RECENT_QUARTERS.map((quarter, i) => {
  const index = OFFSET + i;
  return {
    key: `q${index}`, label: quarter.label, align: 'num',
    value: (row) => at(row.series, index), cell: (row) => format(at(row.series, index))
  };
});

/* One row per thing counted, six quarters wide, with its share and its
 * movement. `rows` are { name, group, series }. */
export function quarterTable(rows, selection, {
  csvName = 'by-quarter',
  nameLabel = 'Crop',
  groupLabel = 'Group',
  format = (v) => dec(v, 1),
  footNote = 'Oldest quarter first.',
  emptyText = 'Nothing in this selection.'
} = {}) {
  const total = rows.reduce((sum, row) => sum + at(row.series, NOW), 0);
  return dataTable(rows, {
    selection,
    csvName,
    searchable: false,
    emptyText,
    footNote,
    columns: [
      { key: 'name', label: nameLabel, strong: true, defaultSort: true, value: (row) => row.name },
      ...(groupLabel ? [{ key: 'group', label: groupLabel, value: (row) => row.group }] : []),
      ...quarterColumns(format),
      { key: 'share', label: 'Share', align: 'num',
        value: (row) => (total ? (at(row.series, NOW) / total) * 100 : 0),
        cell: (row) => pct(total ? (at(row.series, NOW) / total) * 100 : 0, 1) },
      { key: 'yoy', label: 'vs a year ago', align: 'num',
        value: (row) => change(at(row.series, LAST_YEAR), at(row.series, NOW)),
        cell: (row) => { const v = change(at(row.series, LAST_YEAR), at(row.series, NOW)); return v == null ? 'new' : signedPct(v); } }
    ]
  });
}

/* The farms behind it, oldest to newest. `childrenOf` returns the parts of a
 * farm's total — its crops, its structure classes — so a row opens rather than
 * reducing a holding to one number. */
export function farmQuarterTable(farms, selection, {
  seriesOf,
  childrenOf = () => [],
  csvName = 'farms-by-quarter',
  format = (v) => dec(v, 1),
  footNote = 'Open a row to see the parts.',
  emptyText = 'No farm in this selection.'
} = {}) {
  const rows = farms
    .map((farm) => {
      const series = seriesOf(farm) || [];
      return { farm, series, year: at(series, LAST_YEAR), quarter: at(series, LAST_QUARTER), now: at(series, NOW) };
    })
    .filter((row) => row.year > 0.05 || row.now > 0.05);

  return dataTable(rows, {
    selection,
    searchable: true,
    csvName,
    searchOn: (row) => `${row.farm.fid} ${row.farm.owner}`,
    hrefFor: (row) => `#/farm/${row.farm.fid}`,
    emptyText,
    footNote,
    expand: (row) => childrenOf(row.farm)
      .filter((part) => at(part.series, LAST_YEAR) > 0.05 || at(part.series, NOW) > 0.05)
      .sort((a, b) => at(b.series, NOW) - at(a.series, NOW))
      .map((part) => {
        const moved = change(at(part.series, LAST_YEAR), at(part.series, NOW));
        return ['', part.name, '', '', format(at(part.series, LAST_YEAR)), format(at(part.series, LAST_QUARTER)),
          format(at(part.series, NOW)), moved == null ? 'new' : signedPct(moved)];
      }),
    columns: [
      { key: 'fid', label: 'Farm', strong: true, value: (r) => r.farm.fid, cell: (r) => `#${r.farm.fid}` },
      { key: 'owner', label: 'Owner', value: (r) => r.farm.owner },
      { key: 'province', label: 'Province', value: (r) => regionById(r.farm.province).label },
      farmColumns.centre,
      { key: 'year', label: '12 months ago', align: 'num', value: (r) => r.year, cell: (r) => format(r.year) },
      { key: 'quarter', label: '3 months ago', align: 'num', value: (r) => r.quarter, cell: (r) => format(r.quarter) },
      { key: 'now', label: 'Current', align: 'num', defaultSort: true, value: (r) => r.now, cell: (r) => format(r.now) },
      { key: 'yoy', label: 'vs a year ago', align: 'num',
        value: (r) => change(r.year, r.now),
        cell: (r) => { const v = change(r.year, r.now); return v == null ? 'new' : signedPct(v); } }
    ]
  });
}

/* The bands of a stacked column chart: the biggest few named, the tail in one
 * grey band, over the six-quarter window. `entries` are { name, series }. */
export function stackBands(entries, { limit, palette, rest, restLabel = (n) => `${n} others` }) {
  const ranked = [...entries]
    .filter((entry) => entry.series.some((value) => value > 0.05))
    .sort((a, b) => at(b.series, NOW) - at(a.series, NOW));
  const named = ranked.slice(0, limit);
  const tail = ranked.slice(limit);
  const bands = named.map((entry, i) => ({
    label: entry.name, color: palette[i], values: entry.series.slice(OFFSET)
  }));
  if (tail.length) {
    bands.push({
      label: restLabel(tail.length),
      color: rest,
      values: RECENT_QUARTERS.map((_, i) => tail.reduce((sum, entry) => sum + at(entry.series, OFFSET + i), 0))
    });
  }
  return bands;
}
