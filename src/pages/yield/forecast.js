/* Yield Optimisation — yield forecast.
 *
 * No map. "I would rather not put the map. If they want it, we'll put it back
 * in" — so the page is built around the table instead: the average yield for a
 * crop, the share of farms below it, and a ranking that reads from either end.
 *
 * The production forecast is given at province level. The proposal says
 * "district"; nobody could say what a district is here, so it is read as
 * province until ADAFSA settles it. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { barList } from '../../charts/barList.js';
import { bandBar } from '../../charts/bandBar.js';
import { dataTable } from '../../components/dataTable.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { query, taxonomyTree, cropRows } from '../../data/store.js';
import { YIELD_DEVIATION, classify, distribution } from '../../domain/bands.js';
import { categoryColor } from '../../domain/palette.js';
import { int, dec, pct, signedPct, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const rows = cropRows(farms, { types: selection.types }).filter((row) => row.cropAverage);

  const byCrop = new Map();
  for (const row of rows) {
    if (!byCrop.has(row.type)) byCrop.set(row.type, { type: row.type, category: row.category, rows: [], area: 0, kilos: 0 });
    const crop = byCrop.get(row.type);
    crop.rows.push(row);
    crop.area += row.area;
    crop.kilos += row.expectedKg;
  }
  const crops = [...byCrop.values()].map((crop) => {
    const average = crop.rows[0].cropAverage;
    const below = crop.rows.filter((row) => row.tonnesPerDunum < average).length;
    return { ...crop, average, farms: crop.rows.length, below, belowShare: crop.rows.length ? (below / crop.rows.length) * 100 : 0 };
  }).sort((a, b) => b.kilos - a.kilos);

  const production = rows.reduce((total, row) => total + row.expectedKg, 0);
  const belowAverage = rows.filter((row) => row.yieldDeviation < 0).length;
  const wellBelow = rows.filter((row) => classify(YIELD_DEVIATION, row.yieldDeviation)?.id === 'well_below').length;

  return {
    rail: filterRail(taxonomyTree(), { scope: 'all', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: compact(production / 1000), unit: 't', label: 'Expected harvest', icon: 'yieldup' },
        { value: int(rows.length), label: 'Crops planted', icon: 'crop' },
        { value: pct(rows.length ? (belowAverage / rows.length) * 100 : 0), label: 'Below the crop average', icon: 'arrowDown' },
        { value: int(wellBelow), label: 'Far below the average', icon: 'alert', tone: wellBelow ? 'watch' : null }
      ]),

      section('Average yield by crop', {
        icon: 'yieldup',
        note: 'And how many farms are below it.',
        flush: true
      }, dataTable(crops, {
        selection,
        csvName: 'yield-by-crop',
        columns: [
          { key: 'type', label: 'Crop', strong: true, value: (c) => c.type,
            cell: (c) => h('span', { class: 'bar-cell' }, h('span', { class: 'swatch', style: { background: categoryColor(c.category) } }), c.type) },
          { key: 'farms', label: 'Plantings', align: 'num', value: (c) => c.farms, cell: (c) => int(c.farms) },
          { key: 'area', label: 'Dunums', align: 'num', value: (c) => c.area, cell: (c) => dec(c.area, 1) },
          { key: 'avg', label: 'Average (t/dun)', align: 'num', value: (c) => c.average, cell: (c) => dec(c.average, 2) },
          { key: 'production', label: 'Expected harvest (t)', align: 'num', defaultSort: true, value: (c) => c.kilos / 1000, cell: (c) => dec(c.kilos / 1000, 1) },
          { key: 'below', label: 'Farms below', align: 'num', value: (c) => c.belowShare, cell: (c) => `${int(c.below)} · ${pct(c.belowShare)}` }
        ]
      })),

      section('Against the crop average', { icon: 'ruler', half: true, note: 'How the plantings compare.' },
        bandBar(distribution(YIELD_DEVIATION, rows, (row) => row.yieldDeviation, (row) => row.area))),

      section('Expected harvest by province', {
        icon: 'land', half: true,
        flush: true
      }, provinceBlock(farms, [
        { key: 'production', label: 'Expected harvest (t)', value: (set) => {
            const ids = new Set(set.map((f) => f.fid));
            return rows.filter((r) => ids.has(r.farm.fid)).reduce((a, r) => a + r.expectedKg, 0) / 1000;
          }, format: (v) => dec(v, 1) },
        { key: 'below', label: 'Farms below', value: (set) => {
            const ids = new Set(set.map((f) => f.fid));
            return rows.filter((r) => ids.has(r.farm.fid) && r.yieldDeviation < 0).length;
          }, format: int }
      ])),

      section('Biggest crops by harvest', { icon: 'yieldup', note: 'Expected tonnes.' },
        barList(crops.slice(0, 12).map((crop) => ({ label: crop.type, value: crop.kilos / 1000, color: categoryColor(crop.category) })),
          { format: (v) => `${dec(v, 1)} t` })),

      section('Every planting', {
        icon: 'table',
        note: 'Click a column title to sort.',
        flush: true
      }, dataTable(rows, {
        selection,
        searchable: true,
        searchOn: (row) => `${row.farm.fid} ${row.farm.owner} ${row.type}`,
        hrefFor: (row) => `#/farm/${row.farm.fid}`,
        csvName: 'yield-forecast',
        columns: [
          { key: 'fid', label: 'Farm', strong: true, value: (r) => r.farm.fid, cell: (r) => `#${r.farm.fid}` },
          { key: 'owner', label: 'Owner', value: (r) => r.farm.owner },
          { key: 'province', label: 'Province', value: (r) => regionById(r.farm.province).label },
          { key: 'crop', label: 'Crop', value: (r) => r.type },
          { key: 'area', label: 'Dunums', align: 'num', value: (r) => r.area, cell: (r) => dec(r.area, 1) },
          { key: 'yield', label: 'Yield (t/dun)', align: 'num', value: (r) => r.tonnesPerDunum, cell: (r) => dec(r.tonnesPerDunum, 2) },
          { key: 'avg', label: 'Crop average', align: 'num', value: (r) => r.cropAverage, cell: (r) => dec(r.cropAverage, 2) },
          { key: 'dev', label: 'vs average', align: 'num', defaultSort: true, defaultDir: 'asc', value: (r) => r.yieldDeviation, cell: (r) => signedPct(r.yieldDeviation) },
          { key: 'band', label: 'Status', value: (r) => classify(YIELD_DEVIATION, r.yieldDeviation)?.label || '—' }
        ]
      }))
    ]
  };
}
