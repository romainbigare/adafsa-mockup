/* Crop Monitoring — fallow land.
 *
 * Land Use reports fallow as a class of ground; this page owns the detection
 * and the movement — what has newly fallen out of production, and where. The
 * two link to each other rather than each keeping their own version. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { mapBand } from '../../components/mapBand.js';
import { provinceBlock } from '../../components/provinceBlock.js';
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
    asOf: TODAY,
    tools: [comparisonSelect(selection.comparison)],
    content: [
      figures([
        { value: int(fallowArea), unit: 'dun', label: 'Classified fallow' },
        { value: pct(holding ? (fallowArea / holding) * 100 : 0, 1), label: 'Of all holding area' },
        { value: int(withFallow.length), label: 'Farms carrying fallow land' },
        { value: int(shrinking.length), label: `Farms with less in production ${period.label}`, tone: shrinking.length ? 'watch' : null }
      ]),

      shrinking.length
        ? callout('watch', `${int(shrinking.length)} farms have taken land out of production since the comparison quarter, ${dec(net.lost, 0)} dunums in total. Newly abandoned ground is what generates a message to the farmer, so this list is the one worth working through.`)
        : callout('info', 'No farm has taken land out of production over this period.'),

      section('How much of each holding is in production', {},
        bandBar(bands)),

      section('Where the fallow ground is', { note: 'Coloured by how much of the holding is in production.', flush: true },
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

      section('By province', { flush: true }, provinceBlock(farms, [
        { key: 'fallow', label: 'Fallow (dun)', value: (set) => set.reduce((a, f) => a + f.fallowArea, 0), format: int },
        { key: 'share', label: 'Share of holding', value: (set) => {
            const area = set.reduce((a, f) => a + f.area, 0);
            return area ? (set.reduce((a, f) => a + f.fallowArea, 0) / area) * 100 : 0;
          }, format: (v) => pct(v, 1) }
      ])),

      section('Every farm', { note: 'Sort by the fallow column to work from the largest down.', flush: true },
        dataTable(farms, {
          selection,
          searchable: true,
          csvName: 'fallow-land',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'area', label: 'Holding (dun)', align: 'num', value: (f) => f.area, cell: (f) => dec(f.area, 1) },
            { key: 'fallow', label: 'Fallow (dun)', align: 'num', defaultSort: true, value: (f) => f.fallowArea, cell: (f) => dec(f.fallowArea, 1) },
            { key: 'inprod', label: 'In production', align: 'num', value: (f) => f.cultivatedShare, cell: (f) => pct(f.cultivatedShare) },
            { key: 'band', label: 'Status', value: (f) => classify(CULTIVATION, f.cultivatedShare)?.label || '—' },
            { key: 'move', label: `Change ${period.label} (dun)`, align: 'num',
              value: (f) => { const m = moves.find((x) => x.record.fid === f.fid); return m ? m.delta : 0; },
              cell: (f) => { const m = moves.find((x) => x.record.fid === f.fid); return m ? signed(m.delta, 1) : '—'; } }
          ]
        })),

      intro('Fallow ground also appears in Land Use as a class of land. This page owns the detection and the movement; that one reports the standing inventory.')
    ]
  };
}
