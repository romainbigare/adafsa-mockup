/* Land Use & Structures — change tracking.
 *
 * Formally a second-version item: the record does not go back far enough to
 * report against. The page is built now anyway, for the reason given in review
 * — when a structure does appear or disappear it needs to be known straight
 * away, even if there are only five of them.
 *
 * It reads the way the crop change pages read, because it answers the same
 * question about a different thing: columns split by class, then the classes
 * themselves, then the farms behind them running oldest to newest.
 *
 * The columns are years rather than quarters. A building is a stock, not a
 * flow: it stands until somebody takes it down, and a quarter is not long
 * enough for anything to happen. So each column is where a year closes, and
 * the tables underneath keep the quarterly detail for anyone who wants it. */

import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { comparisonSelect } from '../../components/comparison.js';
import { stackedColumns } from '../../charts/stackedColumns.js';
import { barList } from '../../charts/barList.js';
import { quarterTable, farmQuarterTable, stackBands, at, change, NOW, LAST_YEAR } from '../../components/quarterTables.js';
import { query } from '../../data/store.js';
import { movements, netMovement, contributors } from '../../domain/change.js';
import { landuseColor, tints, SERIES_LIMIT, REST, COMPARE } from '../../domain/palette.js';
import { QUARTERS, YEARS, YEAR_END_INDICES, comparisonById } from '../../domain/periods.js';
import { int, dec, signed, signedPct } from '../../domain/format.js';

const countSeries = (farm) => farm.structureCountSeries;
const areaSeries = (farm) => farm.structureSeries;
const MOVERS = 3;

export function render({ selection }) {
  const farms = query({ region: selection.region, types: selection.types });
  const period = comparisonById(selection.comparison);

  const moves = movements(farms, countSeries, selection.comparison);
  const net = netMovement(moves);
  const areaNet = netMovement(movements(farms, areaSeries, selection.comparison));
  const movers = contributors(moves);

  /* Every structure class in the selection, with its own quarterly record. */
  const classes = new Map();
  for (const farm of farms) {
    for (const entry of farm.structureClasses) {
      if (!classes.has(entry.name)) classes.set(entry.name, { name: entry.name, group: 'Structures', series: new Array(QUARTERS.length).fill(0) });
      const row = classes.get(entry.name);
      for (let i = 0; i < QUARTERS.length; i++) row.series[i] += entry.series[i];
    }
  }
  const rows = [...classes.values()];
  const bands = stackBands(rows, {
    limit: SERIES_LIMIT,
    palette: (count) => tints(landuseColor('Structures'), count),
    rest: REST,
    restLabel: (n) => `${n} other classes`,
    indices: YEAR_END_INDICES
  });

  /* Which classes moved over the year — the panel the tree page carries too. */
  const moved = rows
    .map((row) => ({ ...row, delta: at(row.series, NOW) - at(row.series, LAST_YEAR) }))
    .filter((row) => row.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const grew = moved.filter((row) => row.delta > 0).slice(0, MOVERS);
  const shrank = moved.filter((row) => row.delta < 0).slice(0, MOVERS);

  return {
    filterScope: 'all',
    tools: [comparisonSelect(selection.comparison)],
    content: [
      figures([
        { value: signed(net.net, 0), label: `Net change ${period.label}`, icon: 'trend', tone: net.net < 0 ? 'watch' : null },
        { value: `+${int(net.gained)}`, label: 'New structures', icon: 'arrowUp' },
        { value: `−${int(net.lost)}`, label: 'Structures removed', icon: 'arrowDown', tone: net.lost > 0 ? 'watch' : null },
        { value: signed(areaNet.net, 1), unit: 'dun', label: 'Change in area covered', icon: 'ruler' }
      ]),

      movers.length
        ? callout('watch', `${int(movers.length)} farms built or removed something in this period.`)
        : callout('info', 'No farm built or removed anything in this period.'),

      section('Structures, year by year', { icon: 'trend', half: true, note: 'Counted at the close of each year, split by class.' },
        bands.length
          ? stackedColumns(YEARS.map(String), bands,
              { format: int, half: true, totalLabel: 'All structures' })
          : intro('Nothing built in this selection.')),

      section('Biggest movers', { icon: 'land', half: true, note: 'Over the last twelve months.' },
        grew.length || shrank.length
          ? barList([...grew, ...shrank].map((row) => {
              const pct = change(at(row.series, LAST_YEAR), at(row.series, NOW));
              return {
                label: row.name,
                value: Math.abs(row.delta),
                color: COMPARE.neutral,
                amount: `${signed(row.delta, 0)}${pct == null ? '' : ` · ${signedPct(pct)}`}`,
                amountColor: row.delta >= 0 ? COMPARE.up : COMPARE.down
              };
            }), { limit: MOVERS * 2 })
          : intro('No class moved over the year.')),

      section('Every class, quarter by quarter', { icon: 'table', note: 'How many were counted.', flush: true },
        quarterTable(rows, selection, {
          csvName: 'structures-by-quarter', nameLabel: 'Class', groupLabel: null,
          format: int, footNote: 'Counted, oldest quarter first.',
          emptyText: 'Nothing built in this selection.'
        })),

      section('Every farm', { icon: 'farms', note: 'Click a column title to sort.', flush: true },
        farmQuarterTable(farms, selection, {
          csvName: 'structure-change-farms',
          seriesOf: countSeries,
          childrenOf: (farm) => farm.structureClasses,
          format: int,
          footNote: 'Structures counted. Open a row to see the classes.',
          emptyText: 'No farm in this selection has structures.'
        }))
    ]
  };
}
