/* Individual Farms — the register.
 *
 * "I see the list of farms, I click on one farm and there's a breakdown for
 * that farm." Region filtering happens here on the page rather than as a level
 * of navigation above it, which is what was agreed.
 *
 * The table is paged. Five hundred farms are held here and tens of thousands
 * exist in the emirate; it should behave the same way at either size. */

import { h } from '../../app/dom.js';
import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { dataTable } from '../../components/dataTable.js';
import { mapBand } from '../../components/mapBand.js';
import { query } from '../../data/store.js';
import { EFFICIENCY, CANOPY, classify } from '../../domain/bands.js';
import { openIssues } from '../../domain/issues.js';
import { categoryColor } from '../../domain/palette.js';
import { int, dec, pct } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const flagged = farms.filter((farm) => openIssues(farm).length > 0);

  return {
    filterScope: 'all',
    content: [
      figures([
        { value: int(farms.length), label: `Farms in ${regionById(selection.region).label}`, icon: 'farms' },
        { value: int(farms.reduce((a, f) => a + f.area, 0)), unit: 'dun', label: 'Total farm area', icon: 'land' },
        { value: int(flagged.length), label: 'Farms needing attention', icon: 'alert', tone: flagged.length ? 'watch' : null },
        { value: int(farms.filter((f) => f.overAllocated).length), label: 'Using too much water', icon: 'water', tone: 'act' }
      ]),

      section('Where they are', { icon: 'pin', note: 'Click a bubble to zoom in.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('farm-register', {
          mode: 'counts', farms, region: selection.region, size: 'short'
        }))),

      section('All farms', {
        icon: 'table',
        note: 'Search by farm number or owner.',
        flush: true
      }, dataTable(farms, {
        selection,
        searchable: true,
        csvName: 'farm-register',
        hrefFor: (farm) => `#/farm/${farm.fid}`,
        columns: [
          { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
          { key: 'owner', label: 'Owner', value: (f) => f.owner },
          { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
          { key: 'area', label: 'Farm area (dun)', align: 'num', defaultSort: true, value: (f) => f.area, cell: (f) => dec(f.area, 1) },
          { key: 'crops', label: 'Main crops', wrap: true, value: (f) => f.crops.filter((c) => !c.former).sort((a, b) => b.area - a.area).slice(0, 3).map((c) => c.type).join(', ') || '—' },
          { key: 'trees', label: 'Trees', align: 'num', value: (f) => f.trees, cell: (f) => int(f.trees) },
          { key: 'ier', label: 'Water score', align: 'num', value: (f) => f.efficiency,
            cell: (f) => { const band = classify(EFFICIENCY, f.efficiency); return h('span', { class: 'bar-cell' }, h('span', { class: 'swatch', style: { background: band.color } }), String(f.efficiency)); } },
          { key: 'water', label: 'Water used', align: 'num', value: (f) => f.waterUsePct, cell: (f) => pct(f.waterUsePct) },
          { key: 'issues', label: 'To look at', align: 'num', value: (f) => openIssues(f).length, cell: (f) => int(openIssues(f).length) }
        ]
      }))
    ]
  };
}
