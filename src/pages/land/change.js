/* Land Use & Structures — change tracking.
 *
 * Formally a second-version item: the record does not go back far enough to
 * report against. The page is built now anyway, for the reason given in review
 * — when a structure does appear or disappear it needs to be known straight
 * away, even if there are only five of them. Building it now means the alert is
 * wired the day the history arrives.
 *
 * Both comparisons are offered. The review left open whether structures should
 * be reported quarter on quarter or year on year, so the page does not decide
 * on ADAFSA's behalf. */

import { h } from '../../app/dom.js';
import { section, intro, callout, emptyState } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { comparisonSelect } from '../../components/comparison.js';
import { directionTabs, contributorTable } from '../../components/changeTable.js';
import { trendLine } from '../../charts/trendLine.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { query } from '../../data/store.js';
import { movements, netMovement, trend, hasHistoryFor, contributors } from '../../domain/change.js';
import { COMPARE } from '../../domain/palette.js';
import { QUARTERS, comparisonById } from '../../domain/periods.js';
import { int, dec, signed } from '../../domain/format.js';

const countSeries = (farm) => farm.structureCountSeries;
const areaSeries = (farm) => farm.structureSeries;

export function render({ selection }) {
  const farms = query({ region: selection.region });
  const period = comparisonById(selection.comparison);

  if (!hasHistoryFor(selection.comparison)) {
    return {
      tools: [comparisonSelect(selection.comparison)],
      content: emptyState('Not enough history yet.',
        'Structures are captured once a quarter. This comparison needs more quarters than the record holds — it will fill in as they arrive.')
    };
  }

  const moves = movements(farms, countSeries, selection.comparison);
  const net = netMovement(moves);
  const areaMoves = movements(farms, areaSeries, selection.comparison);
  const areaNet = netMovement(areaMoves);
  const drawn = trend(farms, countSeries, { reduce: 'sum' });
  const movers = contributors(moves);

  return {
    tools: [comparisonSelect(selection.comparison)],
    content: [
      figures([
        { value: signed(net.net, 0), label: `Net structures ${period.label}`, tone: net.net < 0 ? 'watch' : null },
        { value: `+${int(net.gained)}`, label: 'Appeared' },
        { value: `−${int(net.lost)}`, label: 'Removed', tone: net.lost > 0 ? 'watch' : null },
        { value: signed(areaNet.net, 1), unit: 'dun', label: 'Net footprint' }
      ]),

      movers.length
        ? callout('watch', `${int(movers.length)} holdings changed their built footprint over this period. A handful of structures is still worth knowing about the week it happens, so this list is short by design rather than by accident.`)
        : callout('info', 'No holding changed its built footprint over this period.'),

      section('Structures across the record', { note: 'Every quarter the survey holds.' },
        trendLine(QUARTERS.map((q) => q.label), [
          { label: 'Structures counted', color: COMPARE.current, values: drawn.map((point) => point.value) }
        ], { format: int, zeroBased: false })),

      section('By province', { flush: true }, provinceBlock(farms, [
        { key: 'now', label: 'Structures now', value: (set) => set.reduce((a, f) => a + f.structures.length, 0), format: int },
        { key: 'net', label: `Net ${period.label}`, value: (set) => {
            const ids = new Set(set.map((f) => f.fid));
            return moves.filter((m) => ids.has(m.record.fid)).reduce((a, m) => a + m.delta, 0);
          }, format: (v) => signed(v, 0) }
      ])),

      section('Which holdings', {
        note: 'Counts, not footprint — a warehouse coming down reads the same size as one going up.',
        tools: [directionTabs(moves, selection.direction)],
        flush: true
      }, contributorTable(moves, selection, {
        direction: selection.direction,
        unit: 'no.',
        csvName: `structure-change-${selection.direction}`,
        nameOf: () => 'Structures'
      })),

      intro('Everything on this page is generated history. In the live platform these comparisons stay empty until two quarters of capture exist, and the page will say so rather than draw a chart of zeroes.')
    ]
  };
}
