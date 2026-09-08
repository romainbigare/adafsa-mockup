/* Crop Monitoring — open-field crops.
 *
 * The seasonal half. Vegetables go in around September and come out by March.
 * The columns are split by crop, in tints of the open-field hue, so a quarter
 * shows what made it up rather than only how big it was. There are eighteen
 * crops in the survey and a stack of eighteen tints is a colour chart nobody
 * can read, so the ones that fill the season stand on their own and the tail
 * gathers into one band — which is the shape the pilot report found too, ten
 * crops covering ninety per cent.
 *
 * The panel beside it changes with the filter, which is the arrangement the
 * review arrived at. Looking at everything, the useful question is which crops
 * moved — measured against the same quarter a year ago, because summer against
 * winter is only the season talking. Looking at one crop, that panel has
 * nothing to say, so it becomes the list of who grows the most of it. */

import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { stackedColumns } from '../../charts/stackedColumns.js';
import { barList } from '../../charts/barList.js';
import { comparisonSelect } from '../../components/comparison.js';
import { query } from '../../data/store.js';
import { RECENT_QUARTERS, WINDOW_QUARTERS, QUARTERS, comparisonById, historyIndices } from '../../domain/periods.js';
import { COMPARE, categoryColor, tints, NEUTRAL } from '../../domain/palette.js';
import { int, dec, signed, signedPct } from '../../domain/format.js';
import { cropsOf, cropQuarterTable, farmMovementTable, change, at, NOW, LAST_YEAR } from './shared.js';

const CATEGORIES = ['Open Field'];
const OFFSET = QUARTERS.length - WINDOW_QUARTERS;
const TOP_PRODUCERS = 12;
/* How many crops get a band of their own before the rest gather into one. */
const STACK_BANDS = 9;

export function render({ selection }) {
  /* Year-on-year unless the reader says otherwise: a vegetable compared with
   * last quarter is mostly being compared with the summer. */
  const comparison = selection.comparisonSet || 'year';
  const { now, base } = historyIndices(comparison);
  const period = comparisonById(comparison);

  const farms = query({ region: selection.region, types: selection.types });
  const rows = farms.flatMap((farm) => cropsOf(farm, { categories: CATEGORIES, types: selection.types }));

  const planted = new Set(rows.filter((row) => at(row.series, NOW) > 0.05).map((row) => row.type));
  /* One crop picked means one crop on screen — that is the switch. */
  const single = planted.size === 1 ? [...planted][0] : null;

  const totalAt = (index) => rows.reduce((total, row) => total + at(row.series, index), 0);
  const area = totalAt(NOW);
  const growers = new Set(rows.filter((row) => at(row.series, NOW) > 0.05).map((row) => row.farm.fid)).size;
  const moved = change(totalAt(LAST_YEAR), area);

  /* One band per crop, biggest first, with the tail gathered so the stack stays
   * readable. Every band is named in the legend, so the tints never have to be
   * told apart on their own. */
  const byType = new Map();
  for (const row of rows) {
    if (!byType.has(row.type)) byType.set(row.type, new Array(QUARTERS.length).fill(0));
    const series = byType.get(row.type);
    for (let i = 0; i < QUARTERS.length; i++) series[i] += at(row.series, i);
  }
  const ranked = [...byType.entries()]
    .filter(([, series]) => series.some((v) => v > 0.05))
    .sort((a, b) => b[1][NOW] - a[1][NOW]);
  const named = ranked.slice(0, STACK_BANDS);
  const tail = ranked.slice(STACK_BANDS);
  const shades = tints(categoryColor('Open Field'), named.length);
  const bands = named.map(([label, series], i) => ({
    label, color: shades[i], values: series.slice(OFFSET)
  }));
  if (tail.length) {
    bands.push({
      label: `${tail.length} other crops`,
      color: NEUTRAL,
      values: RECENT_QUARTERS.map((_, i) => tail.reduce((total, [, series]) => total + series[OFFSET + i], 0))
    });
  }

  /* Which crops moved, netted over the chosen comparison. */
  const byCrop = new Map();
  for (const row of rows) {
    const delta = at(row.series, now) - at(row.series, base);
    byCrop.set(row.type, (byCrop.get(row.type) || 0) + delta);
  }
  const movers = [...byCrop.entries()]
    .map(([label, value]) => ({ label, value }))
    .filter((crop) => Math.abs(crop.value) > 0.05)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  /* Or, with one crop chosen, who grows the most of it. */
  const producers = new Map();
  for (const row of rows) {
    const value = at(row.series, NOW);
    if (value <= 0.05) continue;
    producers.set(row.farm, (producers.get(row.farm) || 0) + value);
  }
  const top = [...producers.entries()]
    .map(([farm, value]) => ({ label: `#${farm.fid} · ${farm.owner}`, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_PRODUCERS);

  const rightPanel = single
    ? section(`Top producers of ${single.toLowerCase()}`, { icon: 'farms', half: true, note: 'Dunums in the ground now.' },
        top.length ? barList(top, { format: (v) => dec(v, 1) + ' dun', color: categoryColor('Open Field'), limit: TOP_PRODUCERS })
          : intro('Nobody in this selection grows it.'))
    : section('Which crops moved', { icon: 'crop', half: true, note: `Gain or loss in dunums, ${period.label}.` },
        movers.length
          ? barList(movers.map((crop) => ({
              label: crop.label,
              value: Math.abs(crop.value),
              amount: signed(crop.value, 1) + ' dun',
              amountColor: crop.value >= 0 ? COMPARE.up : COMPARE.down,
              color: COMPARE.neutral
            })), { limit: 12 })
          : intro('No crop moved over this period.'));

  return {
    tools: [comparisonSelect(comparison)],
    filterScope: 'field',
    content: [
      figures([
        { value: int(area), unit: 'dun', label: 'Open field now', icon: 'crop' },
        { value: int(planted.size), label: 'Crops in the ground', icon: 'layers' },
        { value: int(growers), label: 'Farms growing them', icon: 'farms' },
        { value: moved == null ? '—' : signedPct(moved), label: 'Change on a year ago', icon: 'trend', tone: moved != null && moved < 0 ? 'watch' : null }
      ]),

      section('Area planted, quarter by quarter', { icon: 'trend', half: true, note: single ? `Dunums of ${single.toLowerCase()}.` : 'Dunums in the ground, split by crop.' },
        bands.length
          ? stackedColumns(RECENT_QUARTERS.map((quarter) => quarter.label), bands,
              { format: (v) => int(v), half: true, totalLabel: 'All open field' })
          : intro('Nothing in the current selection is planted.')),

      rightPanel,

      section('Every crop, quarter by quarter', { icon: 'table', note: 'Dunums in the ground.', flush: true },
        cropQuarterTable(rows, selection, { csvName: 'open-field-by-quarter' })),

      section('Every farm', { icon: 'farms', note: 'Click a column title to sort.', flush: true },
        farmMovementTable(farms, selection, { categories: CATEGORIES, csvName: 'open-field-farms' }))
    ]
  };
}
