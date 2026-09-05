/* Tree Monitoring — annual change.
 *
 * Planted and removed, as numbers. The review was explicit that this page does
 * not need a map: "I don't think a map for annual change detection — they just
 * need hard data." The contributor table names the farms instead. */

import { h } from '../../app/dom.js';
import { section, intro, emptyState } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { comparisonSelect } from '../../components/comparison.js';
import { directionTabs, contributorTable } from '../../components/changeTable.js';
import { trendLine } from '../../charts/trendLine.js';
import { barList } from '../../charts/barList.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { query, taxonomyTree, cropRows } from '../../data/store.js';
import { movements, netMovement, trend, hasHistoryFor } from '../../domain/change.js';
import { TREE_CATEGORIES } from '../../domain/taxonomy.js';
import { COMPARE, categoryColor } from '../../domain/palette.js';
import { QUARTERS, comparisonById } from '../../domain/periods.js';
import { int, dec, signed, compact } from '../../domain/format.js';

const treeSeries = (farm) => farm.treeSeries;
const standSeries = (row) => row.series;

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const period = comparisonById(selection.comparison);

  if (!hasHistoryFor(selection.comparison)) {
    return {
      tools: [comparisonSelect(selection.comparison)],
      content: emptyState('Not enough history yet.', 'This comparison reaches further back than the survey record goes.')
    };
  }

  const treeMoves = movements(farms.filter((f) => f.trees > 0), treeSeries, selection.comparison);
  const treeNet = netMovement(treeMoves);
  const drawn = trend(farms, treeSeries, { reduce: 'sum' });

  /* Stand area movement, so the change can be broken down by species — the
   * "sub-click for citrus or pomegranate" the review asked for. */
  const stands = cropRows(farms, { types: selection.types, categories: TREE_CATEGORIES, includeFormer: true });
  const standMoves = movements(stands, standSeries, selection.comparison);
  const bySpecies = new Map();
  for (const move of standMoves) {
    const key = move.record.type;
    if (!bySpecies.has(key)) bySpecies.set(key, { label: key, category: move.record.category, value: 0 });
    bySpecies.get(key).value += move.delta;
  }
  const movers = [...bySpecies.values()].filter((s) => Math.abs(s.value) > 0.05).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return {
    tools: [comparisonSelect(selection.comparison)],
    rail: filterRail(taxonomyTree(), { scope: 'tree', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: signed(treeNet.net, 0), label: `Net trees ${period.label}`, tone: treeNet.net < 0 ? 'watch' : null },
        { value: `+${compact(treeNet.gained)}`, label: 'Trees planted' },
        { value: `−${compact(treeNet.lost)}`, label: 'Trees removed', tone: treeNet.lost > treeNet.gained ? 'watch' : null },
        { value: int(treeNet.counts.increased + treeNet.counts.decreased), label: 'Farms whose count moved' }
      ]),

      section('Tree count across the record', { note: 'Every quarter held, for the current selection.' },
        trendLine(QUARTERS.map((q) => q.label), [
          { label: 'Trees counted', color: COMPARE.current, values: drawn.map((point) => point.value) }
        ], { format: compact, zeroBased: false })),

      section('Which stands moved', { note: `Net change in standing area, ${period.label}.` },
        movers.length
          ? barList(movers.map((entry) => ({
              label: entry.label, value: Math.abs(entry.value),
              amount: signed(entry.value, 1) + ' dun',
              color: entry.value >= 0 ? COMPARE.gain : COMPARE.loss
            })), { limit: 12 })
          : intro('No stand moved by a measurable amount over this period.')),

      section('By province', { flush: true }, provinceBlock(farms, [
        { key: 'now', label: 'Trees now', value: (set) => set.reduce((a, f) => a + f.trees, 0), format: int },
        { key: 'net', label: `Net ${period.label}`, value: (set) => {
            const ids = new Set(set.map((f) => f.fid));
            return treeMoves.filter((m) => ids.has(m.record.fid)).reduce((a, m) => a + m.delta, 0);
          }, format: (v) => signed(v, 0) }
      ])),

      section('Which farms', {
        note: 'Standing area by species, so a movement can be traced to a farm.',
        tools: [directionTabs(standMoves, selection.direction)],
        flush: true
      }, contributorTable(standMoves, selection, { direction: selection.direction, csvName: `tree-change-${selection.direction}` }))
    ]
  };
}
