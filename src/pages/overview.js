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
import { section } from '../components/section.js';
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
    note: 'Zoom in to split the bubbles.'
  });

  return {
    rail,
    content: [
      figures([
        { value: int(farms.length), label: filtering ? `Farms with these crops` : `Farms in ${regionName}`, icon: 'farms' },
        { value: int(dunums), unit: 'dun', label: 'Total farm area', icon: 'land' },
        { value: int(cultivated), unit: 'dun', label: 'Land in production', icon: 'crop' },
        { value: int(inSeason), label: 'Crops growing this month', icon: 'calendar' }
      ]),

      section('Where the farms are', {
        icon: 'pin',
        note: 'Bubbles show how many farms.',
        flush: true
      }, h('div', { style: { padding: '0 16px 16px' } }, map)),

      section('By province', {
        icon: 'land',
        note: 'Click a province name to open it.',
        flush: true
      }, provinceBlock(farms, [
        { key: 'area', label: 'Farm area (dun)', value: (set) => set.reduce((a, f) => a + f.area, 0), format: (v) => int(v) },
        { key: 'cultivated', label: 'In production (dun)', value: (set) => set.reduce((a, f) => a + f.cultivatedArea, 0), format: (v) => int(v) }
      ], { total: { farms: farms.length } })),

      section('Crops by area', {
        icon: 'crop', half: true,
        note: 'Click a group to see its crops.',
        flush: true
      }, summaryTable(breakdown.rows, {
        measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1), totalLabel: 'All land in production'
      })),

      section('Crops by number of farms', {
        icon: 'farms', half: true,
        note: 'A farm can grow several crops.',
        flush: true
      }, summaryTable(breakdown.rows, {
        measure: 'farms', measureLabel: 'Farms', format: countFormat, totalLabel: 'Farms with crops'
      }))
    ]
  };
}
