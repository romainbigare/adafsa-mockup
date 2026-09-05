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
import { provinceBlock } from '../../components/provinceBlock.js';
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
    asOf: TODAY,
    content: [
      figures([
        { value: palmMean == null ? '—' : Math.round(palmMean), label: 'Palm canopy index, average' },
        { value: fruitMean == null ? '—' : Math.round(fruitMean), label: 'Fruit canopy index, average' },
        { value: int(stressed.length), label: 'Farms showing stress', tone: stressed.length ? 'watch' : null },
        { value: int(severe), label: 'Farms in severe stress', tone: severe ? 'act' : null }
      ]),

      severe
        ? callout('act', `${int(severe)} farms sit in the lowest canopy band. These are the visits worth making first.`)
        : callout('info', 'No farm is in the lowest canopy band in this selection.'),

      section('Palm canopy', { note: `${int(withPalms.length)} farms carry palm stands.` },
        withPalms.length ? bandBar(distribution(CANOPY, withPalms, (f) => f.canopyPalms)) : intro('No palm stands here.')),

      section('Fruit tree canopy', { note: `${int(withFruit.length)} farms carry fruit stands.` },
        withFruit.length ? bandBar(distribution(CANOPY, withFruit, (f) => f.canopyFruit)) : intro('No fruit stands here.')),

      section('Where the stress is', { note: 'One score per farm, not per tree.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('trees-canopy', {
          mode: 'band',
          farms: scored,
          region: selection.region,
          size: 'short',
          colorOf: (farm) => colorFor(CANOPY, farm.canopy),
          labelOf: (farm) => `Canopy ${Math.round(farm.canopy)} · ${compact(farm.trees)} trees`,
          legend: CANOPY.bands.map((band) => ({ label: `${band.label} (${band.range})`, color: band.color })),
          legendTitle: 'Canopy health index'
        }))),

      section('By province', { flush: true }, provinceBlock(scored, [
        { key: 'palm', label: 'Palm index', value: (set) => mean(set.filter((f) => f.canopyPalms != null), (f) => f.canopyPalms), format: (v) => (v == null ? '—' : Math.round(v)) },
        { key: 'fruit', label: 'Fruit index', value: (set) => mean(set.filter((f) => f.canopyFruit != null), (f) => f.canopyFruit), format: (v) => (v == null ? '—' : Math.round(v)) },
        { key: 'stress', label: 'Farms stressed', value: (set) => set.filter((f) => (classify(CANOPY, f.canopy)?.sev || 0) >= 2).length, format: int }
      ])),

      section('Every farm with trees', { note: 'Sort by either index to find the stands under pressure.', flush: true },
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
            { key: 'palm', label: 'Palm index', align: 'num', defaultSort: true, defaultDir: 'asc', value: (f) => f.canopyPalms, cell: (f) => (f.canopyPalms == null ? '—' : f.canopyPalms) },
            { key: 'fruit', label: 'Fruit index', align: 'num', value: (f) => f.canopyFruit, cell: (f) => (f.canopyFruit == null ? '—' : f.canopyFruit) },
            { key: 'band', label: 'Status', value: (f) => classify(CANOPY, f.canopy)?.label || '—',
              cell: (f) => { const band = classify(CANOPY, f.canopy); return band ? h('span', { class: 'chip', style: { background: band.color + '22', color: band.color } }, band.label) : '—'; } }
          ]
        }))
    ]
  };
}
