/* The Overview.
 *
 * The review turned this page around completely: it is an inventory of
 * production capacity, not a report on health. A ministry tracks what is
 * growing and on how much land; whether a particular farm is struggling is a
 * local question and belongs at farm level.
 *
 * So: no composite score, no colour on the map, no verdict. Four large figures,
 * a map that answers "how many, and where", and underneath it the two
 * distribution tables that were already shown to ADAFSA from the pilot —
 * by dunum and by farm, each opening from a category down to the crop. */

import { h } from '../app/dom.js';
import { section, intro, callout } from '../components/section.js';
import { figures } from '../components/figures.js';
import { summaryTable, countFormat } from '../components/summaryTable.js';
import { filterRail, typeCounts } from '../components/filterRail.js';
import { mapBand } from '../components/mapBand.js';
import { provinceBlock } from '../components/provinceBlock.js';
import { query, taxonomyTree, taxonomyEntries, allFarms } from '../data/store.js';
import { taxonomyBreakdown } from '../domain/aggregate.js';
import { int, dec } from '../domain/format.js';
import { TODAY } from '../domain/periods.js';
import { monthlyCurve } from '../domain/cropCalendar.js';
import { regionById } from '../domain/regions.js';

export function render({ selection }) {
  const farms = query({ region: selection.region, types: selection.types });
  const entries = taxonomyEntries(farms, { types: selection.types });
  const breakdown = taxonomyBreakdown(entries);
  const month = TODAY.getUTCMonth();

  const dunums = farms.reduce((total, farm) => total + farm.area, 0);
  const cultivated = entries.reduce((total, farm) => total + farm.taxonomy.reduce((a, t) => a + t.area, 0), 0);
  const inSeason = new Set(
    entries.flatMap((farm) => farm.taxonomy)
      .filter((entry) => monthlyCurve(entry.category, entry.type)[month] > 0)
      .map((entry) => entry.type)
  ).size;

  const filtering = selection.types.size > 0;
  const regionName = regionById(selection.region).label;

  const rail = filterRail(taxonomyTree(), {
    scope: 'all',
    selected: selection.types,
    counts: typeCounts(query({ region: selection.region }))
  });

  const map = mapBand('overview', {
    mode: 'counts',
    farms,
    region: selection.region,
    size: null,
    note: 'Each bubble carries the number of farms. Zoom in and it breaks into smaller ones.'
  });

  return {
    asOf: TODAY,
    rail,
    content: [
      figures([
        { value: int(farms.length), label: filtering ? `Farms growing the selection in ${regionName}` : `Farms in ${regionName}` },
        { value: int(dunums), unit: 'dun', label: 'Total holding area' },
        { value: int(cultivated), unit: 'dun', label: 'Land in production' },
        { value: int(inSeason), label: 'Crops in the ground this month' }
      ]),

      section('Where the farms are', {
        note: 'Counts only — no scoring on this map.',
        flush: true
      }, h('div', { style: { padding: '0 16px 16px' } }, map)),

      section('By province', {
        note: 'Every figure on this page follows the selector in the header.',
        flush: true
      }, provinceBlock(farms, [
        { key: 'area', label: 'Holding (dun)', value: (set) => set.reduce((a, f) => a + f.area, 0), format: (v) => int(v) },
        { key: 'cultivated', label: 'In production (dun)', value: (set) => set.reduce((a, f) => a + f.cultivatedArea, 0), format: (v) => int(v) }
      ], { total: { farms: farms.length } })),

      section('Crop distribution by dunum', {
        note: 'Open a category to see the crops inside it.',
        flush: true
      }, summaryTable(breakdown.rows, {
        measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1), totalLabel: 'All land in production'
      })),

      section('Crop distribution by farm', {
        note: 'A farm growing three cereals counts once against cereals and once against each crop, so this column is not a total of farms.',
        flush: true
      }, summaryTable(breakdown.rows, {
        measure: 'farms', measureLabel: 'Farms', format: countFormat, totalLabel: 'Farms with land in production'
      })),

      section('Production', {}, 
        intro('Expected production by crop is a later addition. It was wanted in review and deferred until the measurement window is agreed — a season that spans a quarter boundary makes "this year" an ambiguous thing to report.'))
    ]
  };
}
