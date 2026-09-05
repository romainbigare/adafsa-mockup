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
import { provinceBlock } from '../../components/provinceBlock.js';
import { dataTable } from '../../components/dataTable.js';
import { bandBar } from '../../charts/bandBar.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { query, taxonomyTree } from '../../data/store.js';
import { EFFICIENCY, classify, distribution, colorFor } from '../../domain/bands.js';
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

export function render({ selection }) {
  const everything = query({});
  const zones = zoneAverages(everything);
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });

  const average = mean(farms, (farm) => farm.efficiency);
  const priority = farms.filter((farm) => (classify(EFFICIENCY, farm.efficiency)?.sev || 0) >= 3);
  const critical = farms.filter((farm) => classify(EFFICIENCY, farm.efficiency)?.id === 'critical');

  return {
    asOf: TODAY,
    rail: filterRail(taxonomyTree(), { scope: 'all', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: int(farms.length), label: 'Farms scored' },
        { value: average == null ? '—' : Math.round(average), label: 'Average efficiency score' },
        { value: int(priority.length), label: 'Flagged for priority intervention', tone: priority.length ? 'watch' : null },
        { value: int(critical.length), label: 'In the lowest band', tone: critical.length ? 'act' : null }
      ]),

      priority.length
        ? callout('watch', `${int(priority.length)} farms score poor or worse. Sorting the table below by score puts them at the top; the export takes the whole list rather than the page on screen.`)
        : callout('info', 'No farm in this selection scores below acceptable.'),

      section('How the scores divide', {}, bandBar(distribution(EFFICIENCY, farms, (farm) => farm.efficiency))),

      section('Where the weak scores are', { note: 'One of the few genuinely spatial questions here.', flush: true },
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

      section('Zone averages', { note: 'Zone means province. A farm is measured against its own.', flush: true },
        provinceBlock(farms, [
          { key: 'score', label: 'Average score', value: (set) => mean(set, (f) => f.efficiency), format: (v) => (v == null ? '—' : Math.round(v)) },
          { key: 'priority', label: 'Priority farms', value: (set) => set.filter((f) => (classify(EFFICIENCY, f.efficiency)?.sev || 0) >= 3).length, format: int }
        ])),

      section('Every farm', { note: 'Sort by score, or by distance from the province average.', flush: true },
        dataTable(farms, {
          selection,
          searchable: true,
          csvName: 'irrigation-efficiency',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'score', label: 'Score', align: 'num', defaultSort: true, defaultDir: 'asc', value: (f) => f.efficiency },
            { key: 'band', label: 'Band', value: (f) => classify(EFFICIENCY, f.efficiency)?.label || '—',
              cell: (f) => { const band = classify(EFFICIENCY, f.efficiency); return h('span', { class: 'chip', style: { background: band.color + '22', color: band.color } }, band.label); } },
            { key: 'zone', label: 'Province average', align: 'num', value: (f) => zones.get(f.province), cell: (f) => Math.round(zones.get(f.province)) },
            { key: 'delta', label: 'Against zone', align: 'num', value: (f) => f.efficiency - zones.get(f.province), cell: (f) => signed(f.efficiency - zones.get(f.province), 0) },
            { key: 'water', label: 'Water use', align: 'num', value: (f) => f.waterUsePct, cell: (f) => pct(f.waterUsePct) }
          ]
        })),

      intro('A breakdown by field office was also wanted. It waits on a mapping of farms to offices, which the survey does not yet carry.')
    ]
  };
}
