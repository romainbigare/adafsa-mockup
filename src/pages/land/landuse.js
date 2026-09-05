/* Land Use & Structures — land use.
 *
 * The standing inventory of how ground is used. This is the one page where the
 * full class palette earns its keep, and the one map that draws real parcel
 * boundaries rather than a marker per farm — the classification *is* the
 * analysis here. */

import { h } from '../../app/dom.js';
import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { summaryTable } from '../../components/summaryTable.js';
import { mapBand } from '../../components/mapBand.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { dataTable } from '../../components/dataTable.js';
import { query, landClasses } from '../../data/store.js';
import { classBreakdown } from '../../domain/aggregate.js';
import { landuseColor } from '../../domain/palette.js';
import { int, dec, pct } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

const CLASS_ORDER = ['Open Agriculture', 'Protected Agriculture', 'Structures', 'Barren Land'];

/* The class covering most of a holding — what a dot is coloured by before the
 * parcel outlines come in. */
function dominantClass(farm) {
  const totals = new Map();
  for (const parcel of farm.landParcels) totals.set(parcel.category, (totals.get(parcel.category) || 0) + parcel.area);
  return [...totals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Barren Land';
}

export function render({ selection }) {
  const farms = query({ region: selection.region });

  /* Parcels on the farms in view, so the page follows the region selector. The
   * survey-wide totals are shown alongside for the emirate view. */
  const parcels = farms.flatMap((farm) => farm.landParcels.map((parcel) => ({ ...parcel, fid: farm.fid })));
  const rows = classBreakdown(parcels, { order: CLASS_ORDER });
  const total = rows.reduce((a, r) => a + r.area, 0);
  const areaOf = (name) => rows.find((r) => r.name === name)?.area || 0;
  const fallow = parcels.filter((p) => p.type === 'Fallow Land').reduce((a, p) => a + p.area, 0);

  return {
    asOf: TODAY,
    content: [
      figures([
        { value: int(total), unit: 'dun', label: 'Land classified' },
        { value: int(areaOf('Open Agriculture')), unit: 'dun', label: 'Open agriculture' },
        { value: int(areaOf('Protected Agriculture') + areaOf('Structures')), unit: 'dun', label: 'Built and protected' },
        { value: int(fallow), unit: 'dun', label: 'Fallow ground' },
        { value: int(areaOf('Barren Land')), unit: 'dun', label: 'Barren' }
      ]),

      section('The classified survey', { note: 'Real parcel boundaries, coloured by class.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('land-landuse', {
          mode: 'parcels',
          farms,
          region: selection.region,
          size: 'tall',
          parcels: true,
          parcelColor: (parcel) => landuseColor(parcel.category),
          farmColor: (farm) => landuseColor(dominantClass(farm)),
          labelOf: (farm) => `${dominantClass(farm)} · ${dec(farm.area, 1)} dun`,
          legend: CLASS_ORDER.map((name) => ({ label: name, color: landuseColor(name) })),
          legendTitle: 'Land use class',
          note: null
        }))),

      section('By province', { flush: true }, provinceBlock(farms, [
        { key: 'open', label: 'Open ag. (dun)', value: (set) => set.flatMap((f) => f.landParcels).filter((p) => p.category === 'Open Agriculture').reduce((a, p) => a + p.area, 0), format: int },
        { key: 'built', label: 'Built (dun)', value: (set) => set.reduce((a, f) => a + f.structureArea, 0), format: (v) => dec(v, 1) },
        { key: 'fallow', label: 'Fallow (dun)', value: (set) => set.reduce((a, f) => a + f.fallowArea, 0), format: int }
      ])),

      section('Area by class', { note: 'Open a class to see the types inside it.', flush: true },
        summaryTable(rows, {
          measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1),
          totalLabel: 'All classified land', colorOf: (row) => landuseColor(row.name)
        })),

      section('Every farm', { flush: true },
        dataTable(farms, {
          selection,
          searchable: true,
          csvName: 'land-use',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'area', label: 'Holding (dun)', align: 'num', defaultSort: true, value: (f) => f.area, cell: (f) => dec(f.area, 1) },
            { key: 'prod', label: 'In production', align: 'num', value: (f) => f.cultivatedShare, cell: (f) => pct(f.cultivatedShare) },
            { key: 'fallow', label: 'Fallow (dun)', align: 'num', value: (f) => f.fallowArea, cell: (f) => dec(f.fallowArea, 1) },
            { key: 'barren', label: 'Barren (dun)', align: 'num', value: (f) => f.barrenArea, cell: (f) => dec(f.barrenArea, 1) },
            { key: 'built', label: 'Built (dun)', align: 'num', value: (f) => f.structureArea, cell: (f) => dec(f.structureArea, 2) }
          ]
        })),

      intro('Fallow ground is reported here as a class of land. Crop Monitoring owns its detection and its movement from season to season.')
    ]
  };
}
