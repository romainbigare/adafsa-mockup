/* Crop Monitoring — crops and cultivated area.
 *
 * The review left open whether crop location, crop-type classification and
 * cultivated area should be one sub-page or three. They are one here: they
 * describe the same parcels at the same moment, and three pages would each have
 * been thin. */

import { h } from '../../app/dom.js';
import { section } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { summaryTable, countFormat } from '../../components/summaryTable.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { mapBand } from '../../components/mapBand.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { dataTable } from '../../components/dataTable.js';
import { query, taxonomyTree, taxonomyEntries } from '../../data/store.js';
import { taxonomyBreakdown } from '../../domain/aggregate.js';
import { FIELD_CATEGORIES } from '../../domain/taxonomy.js';
import { categoryColor } from '../../domain/palette.js';
import { int, dec, pct } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

/* The field category holding most of a farm's cultivated land — what the map
 * colours a farm by. */
function dominantCategory(farm) {
  let best = null;
  for (const crop of farm.crops) {
    if (crop.former || !FIELD_CATEGORIES.includes(crop.category)) continue;
    if (!best || crop.area > best.area) best = crop;
  }
  return best?.category || null;
}

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const withField = farms.filter((farm) => dominantCategory(farm));
  const entries = taxonomyEntries(farms, { types: selection.types });
  const breakdown = taxonomyBreakdown(entries, { categories: FIELD_CATEGORIES });

  const cultivated = breakdown.totalArea;
  const meanShare = withField.length
    ? withField.reduce((total, farm) => total + (farm.fieldArea / farm.area) * 100, 0) / withField.length
    : 0;
  const cropCount = new Set(entries.flatMap((f) => f.taxonomy).filter((t) => FIELD_CATEGORIES.includes(t.category)).map((t) => t.type)).size;

  const legend = FIELD_CATEGORIES.map((name) => ({
    label: name,
    color: categoryColor(name),
    count: withField.filter((farm) => dominantCategory(farm) === name).length
  })).filter((entry) => entry.count > 0);

  return {
    rail: filterRail(taxonomyTree(), { scope: 'field', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: int(withField.length), label: 'Farms with field crops', icon: 'farms' },
        { value: int(cultivated), unit: 'dun', label: 'Area under field crops', icon: 'crop' },
        { value: int(cropCount), label: 'Different crops found', icon: 'layers' },
        { value: pct(meanShare), label: 'Average share of a farm', icon: 'ruler' }
      ]),

      section('Where the crops are', { icon: 'pin', note: 'Colour shows the main crop group.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('crop-inventory', {
          mode: 'category',
          farms: withField,
          region: selection.region,
          colorOf: (farm) => categoryColor(dominantCategory(farm)),
          labelOf: (farm) => `${dominantCategory(farm)} · ${dec(farm.fieldArea, 1)} dun`,
          legend,
          legendTitle: 'Main field crop',
          note: 'Click a farm to open it.'
        }))),

      section('By province', { icon: 'land', flush: true }, provinceBlock(farms, [
        { key: 'field', label: 'Crops (dun)', value: (set) => set.reduce((a, f) => a + f.fieldArea, 0), format: int },
        { key: 'share', label: 'Share of farm', value: (set) => {
            const area = set.reduce((a, f) => a + f.area, 0);
            return area ? (set.reduce((a, f) => a + f.fieldArea, 0) / area) * 100 : 0;
          }, format: (v) => pct(v) }
      ])),

      section('Area by crop', { icon: 'crop', half: true, note: 'Click a group to see its crops.', flush: true },
        summaryTable(breakdown.rows, { measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1), totalLabel: 'All field crops' })),

      section('Farms growing each crop', { icon: 'farms', half: true, note: 'A farm can grow several crops.', flush: true },
        summaryTable(breakdown.rows, { measure: 'farms', measureLabel: 'Farms', format: countFormat, totalLabel: 'Farms with field crops' })),

      section('Every farm', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(farms, {
          selection,
          searchable: true,
          csvName: 'crop-monitoring-farms',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'area', label: 'Farm area (dun)', align: 'num', value: (f) => f.area, cell: (f) => dec(f.area, 1) },
            { key: 'field', label: 'Crops (dun)', align: 'num', defaultSort: true, value: (f) => f.fieldArea, cell: (f) => dec(f.fieldArea, 1) },
            { key: 'share', label: 'Share', align: 'num', value: (f) => (f.area ? (f.fieldArea / f.area) * 100 : 0), cell: (f) => pct(f.area ? (f.fieldArea / f.area) * 100 : 0) },
            { key: 'crops', label: 'Crops', value: (f) => f.crops.filter((c) => !c.former && FIELD_CATEGORIES.includes(c.category)).map((c) => c.type).sort().join(', ') || '—' }
          ]
        }))
    ]
  };
}
