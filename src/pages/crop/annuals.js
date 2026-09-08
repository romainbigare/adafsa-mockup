/* Crop Monitoring — cereals and fodder.
 *
 * The crops that are in the ground all year, so the question is how much of
 * each and which way it is moving. Two stacked columns, six quarters wide:
 * cereals on the left, fodder on the right. Six quarters because that carries
 * both comparisons a reader wants — the quarter before, and the same quarter a
 * year ago.
 *
 * Stacking works here and only here: cereals are wheat and sorghum, fodder is
 * Rhodes grass, alfalfa and maize. Three or four bands, not forty. */

import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { stackedColumns } from '../../charts/stackedColumns.js';
import { query } from '../../data/store.js';
import { RECENT_QUARTERS, WINDOW_QUARTERS, QUARTERS } from '../../domain/periods.js';
import { categoryColor, tints } from '../../domain/palette.js';
import { int, dec, signed, signedPct } from '../../domain/format.js';
import { cropsOf, cropQuarterTable, farmMovementTable, change, at, NOW, LAST_YEAR } from './shared.js';

const CATEGORIES = ['Cereals', 'Fodder'];
const OFFSET = QUARTERS.length - WINDOW_QUARTERS;

/* One category's crops as bands of a stack, biggest at the bottom. */
function bandsFor(rows, category) {
  const byType = new Map();
  for (const row of rows) {
    if (row.category !== category) continue;
    if (!byType.has(row.type)) byType.set(row.type, new Array(QUARTERS.length).fill(0));
    const series = byType.get(row.type);
    for (let i = 0; i < QUARTERS.length; i++) series[i] += at(row.series, i);
  }
  const entries = [...byType.entries()]
    .filter(([, series]) => series.some((v) => v > 0.05))
    .sort((a, b) => b[1][NOW] - a[1][NOW]);
  const shades = tints(categoryColor(category), entries.length);
  return entries.map(([label, series], i) => ({
    label, color: shades[i], values: series.slice(OFFSET)
  }));
}

export function render({ selection }) {
  const farms = query({ region: selection.region, types: selection.types });
  const rows = farms.flatMap((farm) => cropsOf(farm, { categories: CATEGORIES, types: selection.types }));

  const totalAt = (index, category = null) => rows
    .filter((row) => !category || row.category === category)
    .reduce((total, row) => total + at(row.series, index), 0);

  const now = totalAt(NOW);
  const yearAgo = totalAt(LAST_YEAR);
  const growers = new Set(rows.filter((row) => at(row.series, NOW) > 0.05).map((row) => row.farm.fid)).size;
  const moved = change(yearAgo, now);
  const labels = RECENT_QUARTERS.map((quarter) => quarter.label);

  const panel = (category) => {
    const bands = bandsFor(rows, category);
    return section(category, {
      icon: 'crop', half: true,
      note: `${dec(totalAt(NOW, category), 1)} dunums now · ${bands.length} crop${bands.length === 1 ? '' : 's'}.`
    }, bands.length
      ? stackedColumns(labels, bands, { format: (v) => int(v), half: true, totalLabel: `All ${category.toLowerCase()}` })
      : intro(`Nothing in the current selection grows ${category.toLowerCase()}.`));
  };

  return {
    filterScope: 'field',
    content: [
      figures([
        { value: int(now), unit: 'dun', label: 'Cereals and fodder now', icon: 'crop' },
        { value: int(totalAt(NOW, 'Cereals')), unit: 'dun', label: 'Cereals', icon: 'crop' },
        { value: int(totalAt(NOW, 'Fodder')), unit: 'dun', label: 'Fodder', icon: 'crop' },
        { value: moved == null ? '—' : signedPct(moved), label: 'Change on a year ago', icon: 'trend', tone: moved != null && moved < 0 ? 'watch' : null },
        { value: int(growers), label: 'Farms growing them', icon: 'farms' }
      ]),

      panel('Cereals'),
      panel('Fodder'),

      section('Every crop, quarter by quarter', { icon: 'table', note: 'Dunums in the ground.', flush: true },
        cropQuarterTable(rows, selection, { csvName: 'cereals-fodder-by-quarter' })),

      section('Every farm', { icon: 'farms', note: 'Click a column title to sort.', flush: true },
        farmMovementTable(farms, selection, { categories: CATEGORIES, csvName: 'cereals-fodder-farms' }))
    ]
  };
}
