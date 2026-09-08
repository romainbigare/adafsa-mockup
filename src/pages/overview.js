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
import { mapBand } from '../components/mapBand.js';
import { query, taxonomyEntries } from '../data/store.js';
import { taxonomyBreakdown } from '../domain/aggregate.js';
import { int, dec } from '../domain/format.js';
import { TODAY, QUARTERS } from '../domain/periods.js';
import { monthlyCurve } from '../domain/cropCalendar.js';
import { regionById } from '../domain/regions.js';

const NOW = QUARTERS.length - 1;
const LAST_YEAR = NOW - 4;

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

  /* Area now against the same quarter a year ago, per category and per crop.
   * The landing page stays an inventory; the extra column only says whether the
   * inventory is growing, which is the first question anyone asks of one. */
  const movement = new Map();
  for (const farm of farms) {
    for (const crop of farm.crops) {
      if (!selection.types.size || selection.types.has(crop.key)) {
        for (const key of [crop.category, `${crop.category}:${crop.type}`]) {
          const entry = movement.get(key) || { now: 0, before: 0 };
          entry.now += crop.series?.[NOW] ?? 0;
          entry.before += crop.series?.[LAST_YEAR] ?? 0;
          movement.set(key, entry);
        }
      }
    }
  }
  const movementOf = (row) => {
    const entry = movement.get(row.key);
    if (!entry || entry.before <= 0.05) return null;
    return ((entry.now - entry.before) / entry.before) * 100;
  };

  const filtering = selection.types.size > 0;
  const regionName = regionById(selection.region).label;

  const map = mapBand('overview', {
    mode: 'counts',
    farms,
    region: selection.region,
    size: null,
    note: 'Zoom in to split the bubbles.'
  });

  return {
    filterScope: 'all',
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


      section('Crops by area', {
        icon: 'crop', half: true,
        note: 'Click a group to see its crops.',
        flush: true
      }, summaryTable(breakdown.rows, {
        measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1),
        totalLabel: 'All land in production', movementOf
      })),

      section('Crops by number of farms', {
        icon: 'farms', half: true,
        note: 'A farm can grow several crops.',
        flush: true
      }, summaryTable(breakdown.rows, {
        measure: 'farms', measureLabel: 'Farms', format: countFormat, showTotal: false
      }))
    ]
  };
}
