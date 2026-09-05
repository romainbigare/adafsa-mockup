/* Irrigation Efficiency — quarterly trend.
 *
 * "I'd rather have a trend line. Raw numbers. And then to list for me the farms
 * that deteriorated." A map of who improved was considered and rejected as
 * confusing, so there is none here. */

import { h } from '../../app/dom.js';
import { section, intro, callout, emptyState } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { comparisonSelect } from '../../components/comparison.js';
import { trendLine } from '../../charts/trendLine.js';
import { dataTable } from '../../components/dataTable.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { query } from '../../data/store.js';
import { movements, trend, hasHistoryFor } from '../../domain/change.js';
import { EFFICIENCY, classify } from '../../domain/bands.js';
import { mean } from '../../domain/aggregate.js';
import { PROVINCES, regionById } from '../../domain/regions.js';
import { COMPARE, CATEGORY_COLORS } from '../../domain/palette.js';
import { QUARTERS, comparisonById } from '../../domain/periods.js';
import { int, signed, signedPct } from '../../domain/format.js';

const seriesOf = (farm) => farm.efficiencySeries;
const PROVINCE_COLORS = ['#2a78d6', '#e87ba4', '#008300'];

export function render({ selection }) {
  const farms = query({ region: selection.region });
  const period = comparisonById(selection.comparison);

  if (!hasHistoryFor(selection.comparison)) {
    return { tools: [comparisonSelect(selection.comparison)], content: emptyState('Not enough history yet.', 'This comparison reaches further back than the record goes.') };
  }

  const moves = movements(farms, seriesOf, selection.comparison);
  const moveOf = new Map(moves.map((move) => [move.record.fid, move]));
  const fell = moves.filter((move) => move.delta < -0.5).sort((a, b) => a.delta - b.delta);
  const rose = moves.filter((move) => move.delta > 0.5);
  const now = mean(farms, (farm) => farm.efficiency);
  const before = mean(moves, (move) => move.before);

  const emirate = trend(farms, seriesOf, { reduce: 'mean' });
  const series = [{ label: 'Selection average', color: COMPARE.current, values: emirate.map((point) => point.value) }];
  if (selection.region === 'emirate') {
    PROVINCES.forEach((province, index) => {
      const set = farms.filter((farm) => farm.province === province.id);
      series.push({ label: province.label, color: PROVINCE_COLORS[index], values: trend(set, seriesOf, { reduce: 'mean' }).map((p) => p.value) });
    });
    series.shift();
  }

  return {
    tools: [comparisonSelect(selection.comparison)],
    content: [
      figures([
        { value: now == null ? '—' : Math.round(now), label: 'Average score now' },
        { value: signed((now || 0) - (before || 0), 1), label: `Movement ${period.label}`, tone: (now || 0) < (before || 0) ? 'watch' : null },
        { value: int(fell.length), label: 'Farms that deteriorated', tone: fell.length ? 'watch' : null },
        { value: int(rose.length), label: 'Farms that improved' }
      ]),

      fell.length
        ? callout('watch', `${int(fell.length)} farms scored lower than they did in the comparison quarter. The largest fall was ${signed(fell[0].delta, 1)} points, at farm #${fell[0].record.fid}.`)
        : callout('info', 'No farm scored materially lower than in the comparison quarter.'),

      section('Average efficiency by quarter', {
        note: selection.region === 'emirate' ? 'One line per province.' : 'The selected province.'
      }, trendLine(QUARTERS.map((q) => q.label), series, { format: (v) => Math.round(v), zeroBased: false })),

      section('By province', { flush: true }, provinceBlock(farms, [
        { key: 'now', label: 'Average now', value: (set) => mean(set, (f) => f.efficiency), format: (v) => (v == null ? '—' : Math.round(v)) },
        { key: 'fell', label: 'Deteriorated', value: (set) => set.filter((f) => (moveOf.get(f.fid)?.delta ?? 0) < -0.5).length, format: int }
      ])),

      section('Every farm, quarter against quarter', {
        note: 'Last quarter, this quarter, and the movement in points and per cent.',
        flush: true
      }, dataTable(farms, {
        selection,
        searchable: true,
        csvName: 'efficiency-trend',
        hrefFor: (farm) => `#/farm/${farm.fid}`,
        columns: [
          { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
          { key: 'owner', label: 'Owner', value: (f) => f.owner },
          { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
          { key: 'before', label: `Score ${period.id === 'year' ? 'a year ago' : 'last quarter'}`, align: 'num', value: (f) => moveOf.get(f.fid)?.before ?? null, cell: (f) => Math.round(moveOf.get(f.fid)?.before ?? 0) },
          { key: 'after', label: 'Score now', align: 'num', value: (f) => f.efficiency },
          { key: 'delta', label: 'Points', align: 'num', defaultSort: true, defaultDir: 'asc', value: (f) => moveOf.get(f.fid)?.delta ?? 0, cell: (f) => signed(moveOf.get(f.fid)?.delta ?? 0, 1) },
          { key: 'pct', label: 'Per cent', align: 'num', value: (f) => moveOf.get(f.fid)?.pct ?? null, cell: (f) => signedPct(moveOf.get(f.fid)?.pct ?? 0, 1) },
          { key: 'band', label: 'Band now', value: (f) => classify(EFFICIENCY, f.efficiency)?.label || '—' }
        ]
      })),

      intro('Sorted ascending, the points column puts the biggest falls at the top; sorting the score column instead puts the worst absolute scores there. Both were asked for.')
    ]
  };
}
