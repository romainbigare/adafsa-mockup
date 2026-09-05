/* Crop Water Calculator — seasonal water budget.
 *
 * The planning half of the module, and the one the review called an amazing
 * tool for policy design: if this many farms are authorised to grow tomatoes
 * over a three-month cycle, this is what it costs in water and this is what it
 * produces.
 *
 * Cubic metres per kilo is the number worth quoting, and it is searchable by
 * farm as well as reported by crop. Crop coverage sits here as a supporting
 * figure rather than a deliverable of its own. */

import { h } from '../../app/dom.js';
import { section, intro, infoPopover } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { barList } from '../../charts/barList.js';
import { columns as columnChart } from '../../charts/columns.js';
import { dataTable } from '../../components/dataTable.js';
import { query, cropRows } from '../../data/store.js';
import { FORMULA_NOTES, WATER_CATEGORIES, monthlyDemand } from '../../domain/waterModel.js';
import { CYCLE_MONTHS, monthlyCurve } from '../../domain/cropCalendar.js';
import { categoryColor, COMPARE } from '../../domain/palette.js';
import { int, dec, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY, MONTHS } from '../../domain/periods.js';

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const rows = cropRows(farms, { types: selection.types, categories: WATER_CATEGORIES });

  /* The policy table: one row per crop, with what the whole crop costs the
   * emirate over its cycle and what it returns. */
  const byCrop = new Map();
  for (const row of rows) {
    if (!byCrop.has(row.type)) {
      byCrop.set(row.type, {
        type: row.type, category: row.category, farms: new Set(),
        area: 0, water: 0, kilos: 0, cycle: CYCLE_MONTHS[row.category] || 12
      });
    }
    const crop = byCrop.get(row.type);
    crop.farms.add(row.farm.fid);
    crop.area += row.area;
    crop.water += row.seasonalWater;
    crop.kilos += row.expectedKg;
  }
  const crops = [...byCrop.values()].map((crop) => ({
    ...crop,
    farmCount: crop.farms.size,
    perKilo: crop.kilos > 0 ? crop.water / crop.kilos : null
  })).sort((a, b) => b.water - a.water);

  const water = crops.reduce((a, c) => a + c.water, 0);
  const kilos = crops.reduce((a, c) => a + c.kilos, 0);
  const area = crops.reduce((a, c) => a + c.area, 0);

  /* Crop coverage across the year — the supporting figure, as a chart rather
   * than a map. */
  const monthly = MONTHS.map((_, month) =>
    rows.reduce((total, row) => total + monthlyDemand(row.category, row.area * monthlyCurve(row.category, row.type)[month], month), 0));

  return {
    tools: [infoPopover('How this is worked out', 'Water model inputs', FORMULA_NOTES)],
    filterScope: 'all',
    content: [
      figures([
        { value: compact(water), unit: 'm³', label: 'Water for a full season', icon: 'water' },
        { value: compact(kilos / 1000), unit: 't', label: 'Expected harvest', icon: 'yieldup' },
        { value: kilos ? dec(water / kilos, 2) : '—', unit: 'm³/kg', label: 'Water for one kilo', icon: 'scale' },
        { value: int(area), unit: 'dun', label: 'Area planted', icon: 'crop' }
      ]),

      section('What each crop costs in water', { icon: 'calculator', note: 'One full growing season.', flush: true },
        dataTable(crops, {
          selection,
          csvName: 'seasonal-water-budget',
          columns: [
            { key: 'type', label: 'Crop', strong: true, value: (c) => c.type,
              cell: (c) => h('span', { class: 'bar-cell' }, h('span', { class: 'swatch', style: { background: categoryColor(c.category) } }), c.type) },
            { key: 'farms', label: 'Farms', align: 'num', value: (c) => c.farmCount, cell: (c) => int(c.farmCount) },
            { key: 'area', label: 'Dunums', align: 'num', value: (c) => c.area, cell: (c) => dec(c.area, 1) },
            { key: 'cycle', label: 'Season (months)', align: 'num', value: (c) => c.cycle },
            { key: 'water', label: 'Water needed (m³)', align: 'num', defaultSort: true, value: (c) => c.water, cell: (c) => int(c.water) },
            { key: 'kilos', label: 'Harvest (t)', align: 'num', value: (c) => c.kilos / 1000, cell: (c) => dec(c.kilos / 1000, 1) },
            { key: 'perkilo', label: 'Water per kilo (m³)', align: 'num', value: (c) => c.perKilo, cell: (c) => (c.perKilo == null ? '—' : dec(c.perKilo, 2)) }
          ]
        })),

      section('Water needed for one kilo', { icon: 'scale', half: true, note: 'Higher means thirstier.' },
        barList(crops.filter((c) => c.perKilo != null).sort((a, b) => b.perKilo - a.perKilo)
          .map((crop) => ({ label: crop.type, value: crop.perKilo, color: categoryColor(crop.category) })),
          { format: (v) => `${dec(v, 2)} m³/kg`, limit: 12 })),

      section('Water needed each month', { icon: 'calendar', half: true, note: 'Follows what the farms plant.' },
        columnChart(MONTHS, [{ label: 'Water demand (m³)', color: COMPARE.current, values: monthly }], { format: compact, half: true })),

      section('Water per kilo, by farm', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(farms.filter((farm) => farm.expectedKg > 0), {
          selection,
          searchable: true,
          csvName: 'water-per-kilo',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'water', label: 'Water per season (m³)', align: 'num', value: (f) => f.seasonalWater, cell: (f) => int(f.seasonalWater) },
            { key: 'kilos', label: 'Harvest (t)', align: 'num', value: (f) => f.expectedKg / 1000, cell: (f) => dec(f.expectedKg / 1000, 1) },
            { key: 'perkilo', label: 'Water per kilo (m³)', align: 'num', defaultSort: true, value: (f) => f.seasonalWater / f.expectedKg, cell: (f) => dec(f.seasonalWater / f.expectedKg, 2) }
          ]
        }))
    ]
  };
}
