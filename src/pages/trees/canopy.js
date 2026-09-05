/* Tree Monitoring — canopy health.
 *
 * The important correction from the review: canopy health is scored per farm,
 * not per tree. The holdings here are small, share one water source and are
 * managed as a unit, so the farm is the cluster. Two numbers are enough — one
 * for palms and one for fruit trees. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { mapBand } from '../../components/mapBand.js';
import { dataTable } from '../../components/dataTable.js';
import { bandBar } from '../../charts/bandBar.js';
import { query } from '../../data/store.js';
import { CANOPY, classify, distribution, colorFor, worstCount } from '../../domain/bands.js';
import { mean } from '../../domain/aggregate.js';
import { int, dec, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

export function render({ selection }) {
  const farms = query({ region: selection.region });
  const withPalms = farms.filter((farm) => farm.canopyPalms != null);
  const withFruit = farms.filter((farm) => farm.canopyFruit != null);
  const scored = farms.filter((farm) => farm.canopy != null);

  const palmMean = mean(withPalms, (farm) => farm.canopyPalms);
  const fruitMean = mean(withFruit, (farm) => farm.canopyFruit);
  const stressed = scored.filter((farm) => (classify(CANOPY, farm.canopy)?.sev || 0) >= 2);
  const severe = worstCount(CANOPY, scored, (farm) => farm.canopy);

  return {
    content: [
      figures([
        { value: palmMean == null ? '—' : Math.round(palmMean), label: 'Average palm score', icon: 'trees' },
        { value: fruitMean == null ? '—' : Math.round(fruitMean), label: 'Average fruit tree score', icon: 'trees' },
        { value: int(stressed.length), label: 'Farms with stressed trees', icon: 'alert', tone: stressed.length ? 'watch' : null },
        { value: int(severe), label: 'Farms in the lowest band', icon: 'alert', tone: severe ? 'act' : null }
      ]),

      severe
        ? callout('act', `${int(severe)} farms are in the lowest band. Visit these first.`)
        : callout('info', 'No farm is in the lowest band.'),

      section('Palm trees', { icon: 'trees', half: true, note: `${int(withPalms.length)} farms have palms.` },
        withPalms.length ? bandBar(distribution(CANOPY, withPalms, (f) => f.canopyPalms)) : intro('No palms here.')),

      section('Fruit trees', { icon: 'trees', half: true, note: `${int(withFruit.length)} farms have fruit trees.` },
        withFruit.length ? bandBar(distribution(CANOPY, withFruit, (f) => f.canopyFruit)) : intro('No fruit trees here.')),

      section('Where the stressed trees are', { icon: 'pin', note: 'One score per farm.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('trees-canopy', {
          mode: 'band',
          farms: scored,
          region: selection.region,
          size: 'short',
          colorOf: (farm) => colorFor(CANOPY, farm.canopy),
          labelOf: (farm) => `Health ${Math.round(farm.canopy)} · ${compact(farm.trees)} trees`,
          legend: CANOPY.bands.map((band) => ({ label: `${band.label} (${band.range})`, color: band.color })),
          legendTitle: 'Tree health score'
        }))),


      section('Every farm with trees', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(scored, {
          selection,
          searchable: true,
          csvName: 'canopy-health',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'trees', label: 'Trees', align: 'num', value: (f) => f.trees, cell: (f) => int(f.trees) },
            { key: 'palm', label: 'Palm score', align: 'num', defaultSort: true, defaultDir: 'asc', value: (f) => f.canopyPalms, cell: (f) => (f.canopyPalms == null ? '—' : f.canopyPalms) },
            { key: 'fruit', label: 'Fruit tree score', align: 'num', value: (f) => f.canopyFruit, cell: (f) => (f.canopyFruit == null ? '—' : f.canopyFruit) },
            { key: 'band', label: 'Status', value: (f) => classify(CANOPY, f.canopy)?.label || '—',
              cell: (f) => { const band = classify(CANOPY, f.canopy); return band ? h('span', { class: 'chip', style: { background: band.color + '22', color: band.color } }, band.label) : '—'; } }
          ]
        }))
    ]
  };
}
