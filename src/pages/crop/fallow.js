/* Crop Monitoring — fallow land.
 *
 * Land Use reports fallow as a class of ground; this page owns the detection
 * and the movement — what has newly fallen out of production, and where. The
 * two link to each other rather than each keeping their own version. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { mapBand } from '../../components/mapBand.js';
import { dataTable } from '../../components/dataTable.js';
import { bandBar } from '../../charts/bandBar.js';
import { comparisonSelect } from '../../components/comparison.js';
import { query } from '../../data/store.js';
import { CULTIVATION, classify, distribution, colorFor } from '../../domain/bands.js';
import { movements, netMovement } from '../../domain/change.js';
import { int, dec, pct, signed } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { comparisonById, TODAY } from '../../domain/periods.js';

const cultivationSeries = (farm) => farm.cultivationSeries;

export function render({ selection }) {
  const farms = query({ region: selection.region });
  const withFallow = farms.filter((farm) => farm.fallowArea > 0);
  const fallowArea = farms.reduce((total, farm) => total + farm.fallowArea, 0);
  const holding = farms.reduce((total, farm) => total + farm.area, 0);

  /* "Newly fallow" is a farm whose land in production has fallen over the
   * period — the flag that matters operationally, since it is what generates a
   * message to the farmer. */
  const moves = movements(farms, cultivationSeries, selection.comparison);
  const shrinking = moves.filter((move) => move.direction === 'decreased' || move.direction === 'stopped');
  const net = netMovement(moves);
  const period = comparisonById(selection.comparison);

  const bands = distribution(CULTIVATION, farms, (farm) => farm.cultivatedShare);

  return {
    tools: [comparisonSelect(selection.comparison)],
    content: [
      figures([
        { value: int(fallowArea), unit: 'dun', label: 'Fallow land', icon: 'land' },
        { value: pct(holding ? (fallowArea / holding) * 100 : 0, 1), label: 'Share of all farm area', icon: 'ruler' },
        { value: int(withFallow.length), label: 'Farms with fallow land', icon: 'farms' },
        { value: int(shrinking.length), label: `Farms planting less ${period.label}`, icon: 'arrowDown', tone: shrinking.length ? 'watch' : null }
      ]),

      shrinking.length
        ? callout('watch', `${int(shrinking.length)} farms are planting less than before — ${dec(net.lost, 0)} dunums in total.`)
        : callout('info', 'No farm is planting less than before.'),

      section('Land in production', { icon: 'crop', half: true, note: 'Share of each farm.' },
        bandBar(bands)),


      section('Where the fallow land is', { icon: 'pin', half: true, note: 'Colour shows land in production.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('crop-fallow', {
          mode: 'band',
          farms,
          region: selection.region,
          size: 'short',
          colorOf: (farm) => colorFor(CULTIVATION, farm.cultivatedShare),
          labelOf: (farm) => `${pct(farm.cultivatedShare)} in production · ${dec(farm.fallowArea, 1)} dun fallow`,
          legend: CULTIVATION.bands.map((band) => ({ label: band.label, color: band.color })),
          legendTitle: 'Land in production'
        }))),

      section('Every farm', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(farms, {
          selection,
          searchable: true,
          csvName: 'fallow-land',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'area', label: 'Farm area (dun)', align: 'num', value: (f) => f.area, cell: (f) => dec(f.area, 1) },
            { key: 'fallow', label: 'Fallow (dun)', align: 'num', defaultSort: true, value: (f) => f.fallowArea, cell: (f) => dec(f.fallowArea, 1) },
            { key: 'inprod', label: 'Planted', align: 'num', value: (f) => f.cultivatedShare, cell: (f) => pct(f.cultivatedShare) },
            { key: 'band', label: 'Status', value: (f) => classify(CULTIVATION, f.cultivatedShare)?.label || '—' },
            { key: 'move', label: `Change ${period.label} (dun)`, align: 'num',
              value: (f) => { const m = moves.find((x) => x.record.fid === f.fid); return m ? m.delta : 0; },
              cell: (f) => { const m = moves.find((x) => x.record.fid === f.fid); return m ? signed(m.delta, 1) : '—'; } }
          ]
        }))
    ]
  };
}
