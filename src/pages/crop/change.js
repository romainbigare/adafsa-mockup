/* Crop Monitoring — seasonal change.
 *
 * The sub-page the review asked for by name. It answers one sentence: give me
 * the farms that started growing this, or stopped, or grew, or shrank. Hard
 * data and no map — that was settled explicitly. */

import { h } from '../../app/dom.js';
import { section, intro, emptyState } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { comparisonSelect } from '../../components/comparison.js';
import { directionTabs, contributorTable } from '../../components/changeTable.js';
import { trendLine } from '../../charts/trendLine.js';
import { barList } from '../../charts/barList.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { query, taxonomyTree, cropRows } from '../../data/store.js';
import { movements, netMovement, trend, hasHistoryFor } from '../../domain/change.js';
import { FIELD_CATEGORIES, categoryMeta } from '../../domain/taxonomy.js';
import { COMPARE, categoryColor } from '../../domain/palette.js';
import { QUARTERS, comparisonById, historyIndices } from '../../domain/periods.js';
import { int, dec, signed, signedPct } from '../../domain/format.js';

const seriesOf = (row) => row.series;

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const rows = cropRows(farms, { types: selection.types, categories: FIELD_CATEGORIES, includeFormer: true });
  const moves = movements(rows, seriesOf, selection.comparison);
  const net = netMovement(moves);
  const period = comparisonById(selection.comparison);
  const direction = selection.direction;

  if (!hasHistoryFor(selection.comparison)) {
    return {
      tools: [comparisonSelect(selection.comparison)],
      rail: filterRail(taxonomyTree(), { scope: 'field', selected: selection.types, counts: typeCounts(all) }),
      content: emptyState('Not enough history yet.',
        'This comparison needs more quarters than the survey has collected. It will fill in as the record grows.')
    };
  }

  const drawn = trend(rows, seriesOf, { reduce: 'sum' });
  const { base, now } = historyIndices(selection.comparison);

  /* Which crops moved, by net dunums — the shape of the season in one glance. */
  const byCrop = new Map();
  for (const move of moves) {
    const key = move.record.type;
    if (!byCrop.has(key)) byCrop.set(key, { label: key, category: move.record.category, value: 0 });
    byCrop.get(key).value += move.delta;
  }
  const movers = [...byCrop.values()].filter((c) => Math.abs(c.value) > 0.05).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const provinceNet = (set) => {
    const ids = new Set(set.map((f) => f.fid));
    return moves.filter((m) => ids.has(m.record.farm.fid)).reduce((a, m) => a + m.delta, 0);
  };

  return {
    tools: [comparisonSelect(selection.comparison)],
    rail: filterRail(taxonomyTree(), { scope: 'field', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: signed(net.net, 1), unit: 'dun', label: `Net change ${period.label}`, icon: 'trend', tone: net.net < 0 ? 'watch' : null },
        { value: `+${dec(net.gained, 1)}`, unit: 'dun', label: 'New land planted', icon: 'arrowUp' },
        { value: `−${dec(net.lost, 1)}`, unit: 'dun', label: 'Land no longer planted', icon: 'arrowDown', tone: net.lost > net.gained ? 'watch' : null },
        { value: int(net.counts.started + net.counts.stopped), label: 'Farms that started or stopped', icon: 'farms' }
      ]),

      section('Area planted, quarter by quarter', {
        icon: 'trend', note: 'Dunums in the ground.'
      }, trendLine(QUARTERS.map((q) => q.label), [
        { label: 'Field crops (dunums)', color: COMPARE.current, values: drawn.map((point) => point.value) }
      ], { format: (v) => int(v) })),

      section('Which crops moved', { icon: 'crop', half: true, note: 'Gain or loss in dunums.' },
        movers.length
          ? barList(movers.map((crop) => ({
              label: crop.label,
              value: Math.abs(crop.value),
              amount: signed(crop.value, 1) + ' dun',
              color: crop.value >= 0 ? COMPARE.gain : COMPARE.loss
            })), { limit: 12 })
          : intro('No crop changed over this period.')),

      section('By province', { icon: 'land', half: true, flush: true }, provinceBlock(farms, [
        { key: 'net', label: `Net change (dun)`, value: provinceNet, format: (v) => signed(v, 1) },
        { key: 'now', label: 'Now (dun)', value: (set) => {
            const ids = new Set(set.map((f) => f.fid));
            return moves.filter((m) => ids.has(m.record.farm.fid)).reduce((a, m) => a + m.after, 0);
          }, format: (v) => int(v) }
      ])),

      section('Which farms', {
        icon: 'table',
        note: 'Pick a movement to see the farms.',
        tools: [directionTabs(moves, direction)],
        flush: true
      }, h('div', { style: { padding: '0 0 0' } },
        contributorTable(moves, selection, { direction, csvName: `crop-change-${direction}` })))
    ]
  };
}
