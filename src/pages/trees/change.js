/* Tree Monitoring — annual change.
 *
 * Year by year over three years, not quarter by quarter: a tree does not move
 * fast enough for a quarter to say anything, and reading four quarters of noise
 * as a trend is how a page misleads a reader who trusts it.
 *
 * Forest trees are not on this page at all — not in the chart, not in the
 * table, not in the filter. Nothing names them, nobody plants them as a crop,
 * and a page about how the planting is moving has nothing to say about a stand
 * of windbreak.
 *
 * The chart follows the filter rather than splitting into pages of its own.
 *
 * Beside it, the three varieties that grew most and the three that shrank most
 * over the last twelve months. Below, the trees themselves — the review was
 * explicit that this page lists varieties, not farms. */

import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { dataTable } from '../../components/dataTable.js';
import { stackedColumns } from '../../charts/stackedColumns.js';
import { barList } from '../../charts/barList.js';
import { query } from '../../data/store.js';
import { ORCHARD_CATEGORIES } from '../../domain/taxonomy.js';
import { COMPARE, categoryColor } from '../../domain/palette.js';
import { YEARS, YEAR_COUNT } from '../../domain/periods.js';
import { int, pct, signedInt, signedPct, compact } from '../../domain/format.js';
import { varietyTotals, varietyPalette } from './varieties.js';

const NOW = YEAR_COUNT - 1;
const LAST_YEAR = YEAR_COUNT - 2;
const MOVERS = 3;

/* Which tree groups the filter has left on screen. With everything ticked the
 * chart carries both groups; with one ticked it is that group. */
function selectedCategories(selection) {
  if (!selection.types.size) return ORCHARD_CATEGORIES;
  const chosen = ORCHARD_CATEGORIES.filter((category) =>
    [...selection.types].some((key) => key.startsWith(category + ':')));
  return chosen.length ? chosen : ORCHARD_CATEGORIES;
}

export function render({ selection }) {
  const farms = query({ region: selection.region, types: selection.types });
  const categories = selectedCategories(selection);
  const rows = varietyTotals(farms, { categories });
  const colourOf = varietyPalette(rows);

  const totalIn = (year) => rows.reduce((total, row) => total + row.years[year], 0);
  const now = totalIn(NOW);
  const before = totalIn(LAST_YEAR);
  const net = now - before;
  const moved = before > 0 ? (net / before) * 100 : null;

  const withMovement = rows
    .map((row) => ({ ...row, delta: row.years[NOW] - row.years[LAST_YEAR] }))
    .map((row) => ({
      ...row,
      moved: row.years[LAST_YEAR] > 0 ? (row.delta / row.years[LAST_YEAR]) * 100 : null,
      moved2: row.years[0] > 0 ? ((row.years[NOW] - row.years[0]) / row.years[0]) * 100 : null
    }));

  const grew = withMovement.filter((row) => row.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, MOVERS);
  const shrank = withMovement.filter((row) => row.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, MOVERS);

  const moverRow = (row) => ({
    label: row.name,
    value: Math.abs(row.delta),
    color: colourOf(row),
    amount: `${signedInt(row.delta)} trees${row.moved == null ? '' : ` · ${signedPct(row.moved)}`}`,
    amountColor: row.delta >= 0 ? COMPARE.up : COMPARE.down
  });

  const label = categories.length === ORCHARD_CATEGORIES.length ? 'Palms and fruit trees' : categories.join(', ');

  /* One band per tree group, in the group's own colour. Date palms dominate, so
   * the stack is mostly one band — which is the fact, and the reader can lift
   * the others out with the toggles above. */
  const groupBands = categories
    .map((category) => ({
      label: category,
      color: categoryColor(category),
      values: YEARS.map((_, i) => rows.filter((r) => r.category === category).reduce((a, r) => a + r.years[i], 0))
    }))
    .filter((band) => band.values.some((v) => v > 0));

  return {
    filterScope: 'orchard',
    content: [
      figures([
        { value: compact(now), label: 'Palms and fruit trees', icon: 'trees' },
        { value: signedInt(net), label: 'Change on a year ago', icon: 'trend', tone: net < 0 ? 'watch' : null },
        { value: moved == null ? '—' : signedPct(moved), label: 'Change as a share', icon: 'trend' },
        { value: int(rows.length), label: 'Varieties counted', icon: 'layers' }
      ]),

      section('Trees, year by year', { icon: 'trend', half: true, note: `${label}, over three years.` },
        groupBands.length
          ? stackedColumns(YEARS.map(String), groupBands, { format: compact, half: true, totalLabel: 'All counted here' })
          : intro('No trees in the current selection.')),

      section('Biggest movers', { icon: 'trees', half: true, note: 'Over the last twelve months.' },
        grew.length || shrank.length
          ? barList([...grew, ...shrank].map(moverRow), { limit: MOVERS * 2 })
          : intro('No variety moved over the year.')),

      section('Every variety', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(withMovement, {
          selection,
          searchable: true,
          searchPlaceholder: 'Search a variety',
          searchOn: (row) => `${row.name} ${row.category}`,
          csvName: 'tree-varieties',
          emptyText: 'No trees in the current selection.',
          footNote: 'Tree counts, oldest year first.',
          columns: [
            { key: 'name', label: 'Variety', strong: true, value: (r) => r.name },
            { key: 'group', label: 'Group', value: (r) => r.category },
            { key: 'trees', label: 'Trees', align: 'num', defaultSort: true, value: (r) => r.trees, cell: (r) => int(r.trees) },
            { key: 'share', label: 'Share', align: 'num', value: (r) => r.share, cell: (r) => pct(r.share, 1) },
            /* Against one year ago and against two — the comparison asked for,
             * rather than a column of raw counts per year that leaves the
             * reader to do the subtraction. */
            { key: 'moved', label: 'vs a year ago', align: 'num',
              value: (r) => r.moved, cell: (r) => (r.moved == null ? 'new' : signedPct(r.moved)) },
            { key: 'moved2', label: 'vs two years ago', align: 'num',
              value: (r) => r.moved2, cell: (r) => (r.moved2 == null ? 'new' : signedPct(r.moved2)) }
          ]
        }))
    ]
  };
}
