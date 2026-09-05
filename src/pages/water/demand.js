/* Crop Water Calculator — monthly demand and over-allocation.
 *
 * Three of the module's deliverables are really one thought and share a page: a
 * budget, a breakdown of it by crop, and a flag. The flag is raised against the
 * month, never the season — by the time a season closes it is too late for
 * anyone to act on it.
 *
 * The model's coefficients sit behind the "how this is worked out" panel. They
 * are parameters rather than deliverables, which is where the review put them. */

import { h } from '../../app/dom.js';
import { section, intro, callout, infoPopover } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { bandBar } from '../../charts/bandBar.js';
import { barList } from '../../charts/barList.js';
import { provinceBlock } from '../../components/provinceBlock.js';
import { dataTable } from '../../components/dataTable.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { query, taxonomyTree, cropRows } from '../../data/store.js';
import { WATER_USE, classify, distribution } from '../../domain/bands.js';
import { FORMULA_NOTES } from '../../domain/waterModel.js';
import { COMPARE, categoryColor } from '../../domain/palette.js';
import { int, dec, pct, m3, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY, MONTHS } from '../../domain/periods.js';

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const withDemand = farms.filter((farm) => farm.waterDemand > 0);
  const flagged = withDemand.filter((farm) => farm.overAllocated);

  const demand = withDemand.reduce((total, farm) => total + farm.waterDemand, 0);
  const actual = withDemand.reduce((total, farm) => total + farm.waterActual, 0);
  const excess = withDemand.reduce((total, farm) => total + Math.max(0, farm.waterActual - farm.waterDemand), 0);
  const month = MONTHS[TODAY.getUTCMonth()];

  /* Where the excess sits, by crop — the answer to "it is the citrus trees". */
  const rows = cropRows(withDemand, { types: selection.types });
  const byCrop = new Map();
  for (const row of rows) {
    const over = Math.max(0, row.actualThisMonth - row.demandThisMonth);
    if (!byCrop.has(row.type)) byCrop.set(row.type, { label: row.type, category: row.category, value: 0 });
    byCrop.get(row.type).value += over;
  }
  const worst = [...byCrop.values()].filter((c) => c.value > 1).sort((a, b) => b.value - a.value);

  return {
    asOf: TODAY,
    tools: [infoPopover('How this is worked out', 'Water model inputs', FORMULA_NOTES)],
    rail: filterRail(taxonomyTree(), { scope: 'all', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: compact(demand), unit: 'm³', label: `Allocated for ${month}` },
        { value: compact(actual), unit: 'm³', label: 'Metered use' },
        { value: int(flagged.length), label: 'Farms over-allocated', tone: flagged.length ? 'act' : null },
        { value: compact(excess), unit: 'm³', label: 'Used above allocation', tone: excess > 0 ? 'watch' : null }
      ]),

      flagged.length
        ? callout('act', `${int(flagged.length)} farms are running above 125% of this month's allocation. Opening a farm shows which of its crops the excess sits in — the flag says that a farm is over, the per-crop split says where.`)
        : callout('info', 'No farm is above its allocation this month.'),

      section('Use against allocation', { note: 'Measured against this month, not the season.' },
        bandBar(distribution(WATER_USE, withDemand, (farm) => farm.waterUsePct))),

      section('Where the excess sits, by crop', { note: `Cubic metres above allocation this month.` },
        worst.length
          ? barList(worst.map((crop) => ({ label: crop.label, value: crop.value, color: categoryColor(crop.category) })), { format: compact, limit: 12 })
          : intro('Nothing is running above allocation in the current selection.')),

      section('By province', { flush: true }, provinceBlock(withDemand, [
        { key: 'demand', label: 'Allocated (m³)', value: (set) => set.reduce((a, f) => a + f.waterDemand, 0), format: compact },
        { key: 'actual', label: 'Metered (m³)', value: (set) => set.reduce((a, f) => a + f.waterActual, 0), format: compact },
        { key: 'flag', label: 'Over-allocated', value: (set) => set.filter((f) => f.overAllocated).length, format: int }
      ])),

      section('Every farm', { note: 'Sort by variance to work from the largest overrun down.', flush: true },
        dataTable(withDemand, {
          selection,
          searchable: true,
          csvName: 'water-demand',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'demand', label: 'Allocated (m³)', align: 'num', value: (f) => f.waterDemand, cell: (f) => int(f.waterDemand) },
            { key: 'actual', label: 'Metered (m³)', align: 'num', value: (f) => f.waterActual, cell: (f) => int(f.waterActual) },
            { key: 'variance', label: 'Variance (m³)', align: 'num', defaultSort: true, value: (f) => f.waterActual - f.waterDemand, cell: (f) => int(f.waterActual - f.waterDemand) },
            { key: 'use', label: 'Use', align: 'num', value: (f) => f.waterUsePct, cell: (f) => pct(f.waterUsePct) },
            { key: 'band', label: 'Status', value: (f) => classify(WATER_USE, f.waterUsePct)?.label || '—',
              cell: (f) => { const band = classify(WATER_USE, f.waterUsePct); return h('span', { class: 'chip', style: { background: band.color + '22', color: band.color } }, band.label); } },
            { key: 'perdunum', label: 'm³ / dunum', align: 'num', value: (f) => (f.cultivatedArea ? f.waterDemand / f.cultivatedArea : null), cell: (f) => (f.cultivatedArea ? dec(f.waterDemand / f.cultivatedArea, 0) : '—') }
          ]
        }))
    ]
  };
}
