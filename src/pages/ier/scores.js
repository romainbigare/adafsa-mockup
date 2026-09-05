/* Irrigation Efficiency — scores.
 *
 * Score, band and zone average. Zone means the three provinces; the field-office
 * breakdown that was also wanted needs a mapping of farms to offices that does
 * not exist yet, so it waits.
 *
 * The question the page is built to answer, in the words it was asked in: every
 * farm in Al Ain flagged for priority intervention. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { mapBand } from '../../components/mapBand.js';
import { dataTable } from '../../components/dataTable.js';
import { bandBar } from '../../charts/bandBar.js';
import { query } from '../../data/store.js';
import { EFFICIENCY, classify, distribution, colorFor, SUBSIDY_SCORE, keepsSubsidy } from '../../domain/bands.js';
import { setParams } from '../../app/router.js';
import { mean } from '../../domain/aggregate.js';
import { PROVINCES, regionById } from '../../domain/regions.js';
import { int, signed, pct } from '../../domain/format.js';
import { TODAY } from '../../domain/periods.js';

/* A farm is judged against its own province rather than the emirate — the
 * conditions differ enough that a single average would flatter one and punish
 * another. */
function zoneAverages(all) {
  const zones = new Map();
  for (const province of PROVINCES) {
    zones.set(province.id, mean(all.filter((farm) => farm.province === province.id), (farm) => farm.efficiency));
  }
  return zones;
}

/* Three views of one table. The count sits in the tab, because the number of
 * farms that keep their subsidy is the answer as often as the list is. */
const VIEWS = [
  { id: '', label: 'All farms', keep: () => true },
  { id: 'in', label: `Keeps subsidy (${SUBSIDY_SCORE}+)`, keep: (f) => keepsSubsidy(f.efficiency) },
  { id: 'out', label: 'Below the line', keep: (f) => !keepsSubsidy(f.efficiency) }
];

function subsidyTabs(current, counts) {
  return h('div', { class: 'segmented', role: 'group', 'aria-label': 'Which farms to list' },
    ...VIEWS.map((view) => h('button', {
      'aria-pressed': String(view.id === current),
      onclick: () => setParams({ sub: view.id || null, p: null })
    }, `${view.label} (${int(counts[view.id])})`)));
}

export function render({ selection }) {
  const everything = query({});
  const zones = zoneAverages(everything);
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });

  const average = mean(farms, (farm) => farm.efficiency);
  const priority = farms.filter((farm) => (classify(EFFICIENCY, farm.efficiency)?.sev || 0) >= 3);
  const critical = farms.filter((farm) => classify(EFFICIENCY, farm.efficiency)?.id === 'critical');
  const eligible = farms.filter((farm) => keepsSubsidy(farm.efficiency));

  const view = VIEWS.find((v) => v.id === selection.subsidy) || VIEWS[0];
  const counts = Object.fromEntries(VIEWS.map((v) => [v.id, farms.filter(v.keep).length]));
  const listed = farms.filter(view.keep);

  return {
    filterScope: 'all',
    content: [
      figures([
        { value: int(farms.length), label: 'Farms scored', icon: 'farms' },
        { value: average == null ? '—' : Math.round(average), label: 'Average score', icon: 'ruler' },
        { value: int(eligible.length), label: `Keeps subsidy (${SUBSIDY_SCORE}+)`, icon: 'check' },
        { value: int(priority.length), label: 'Need attention', icon: 'alert', tone: priority.length ? 'watch' : null },
        { value: int(critical.length), label: 'In the lowest band', icon: 'alert', tone: critical.length ? 'act' : null }
      ]),

      priority.length
        ? callout('watch', `${int(priority.length)} farms score poor or worse.`)
        : callout('info', 'No farm scores below acceptable.'),

      section('Scores', { icon: 'ruler', half: true, note: 'Farms in each band.' },
        bandBar(distribution(EFFICIENCY, farms, (farm) => farm.efficiency))),


      section('Where the weak scores are', { icon: 'pin', half: true, note: 'Colour shows the score band.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('ier-scores', {
          mode: 'band',
          farms,
          region: selection.region,
          size: 'short',
          colorOf: (farm) => colorFor(EFFICIENCY, farm.efficiency),
          labelOf: (farm) => `Score ${farm.efficiency} · ${classify(EFFICIENCY, farm.efficiency)?.label}`,
          legend: EFFICIENCY.bands.map((band) => ({ label: `${band.label} (${band.range})`, color: band.color })),
          legendTitle: 'Efficiency score'
        }))),

      section('Every farm', {
        icon: 'table',
        note: view.id ? 'Export CSV gives this list.' : 'Click a column title to sort.',
        flush: true,
        tools: [subsidyTabs(view.id, counts)]
      },
        dataTable(listed, {
          selection,
          searchable: true,
          csvName: view.id === 'in' ? 'subsidy-eligible-farms' : view.id === 'out' ? 'below-subsidy-line' : 'irrigation-efficiency',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'score', label: 'Score', align: 'num', defaultSort: true, defaultDir: 'asc', value: (f) => f.efficiency },
            { key: 'band', label: 'Band', value: (f) => classify(EFFICIENCY, f.efficiency)?.label || '—',
              cell: (f) => { const band = classify(EFFICIENCY, f.efficiency); return h('span', { class: 'chip', style: { background: band.color + '22', color: band.color } }, band.label); } },
            { key: 'zone', label: 'Province average', align: 'num', value: (f) => zones.get(f.province), cell: (f) => Math.round(zones.get(f.province)) },
            { key: 'delta', label: 'vs province', align: 'num', value: (f) => f.efficiency - zones.get(f.province), cell: (f) => signed(f.efficiency - zones.get(f.province), 0) },
            { key: 'water', label: 'Water used', align: 'num', value: (f) => f.waterUsePct, cell: (f) => pct(f.waterUsePct) }
          ]
        }))
    ]
  };
}
