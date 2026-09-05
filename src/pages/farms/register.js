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
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { query, taxonomyTree } from '../../data/store.js';
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
    asOf: TODAY,
    rail: filterRail(taxonomyTree(), { scope: 'all', selected: selection.types, counts: typeCounts(all) }),
    content: [
      figures([
        { value: int(farms.length), label: `Farms in ${regionById(selection.region).label}` },
        { value: int(farms.reduce((a, f) => a + f.area, 0)), unit: 'dun', label: 'Holding area' },
        { value: int(flagged.length), label: 'With something open', tone: flagged.length ? 'watch' : null },
        { value: int(farms.filter((f) => f.overAllocated).length), label: 'Over-allocated on water', tone: 'act' }
      ]),

      section('Where they are', { note: 'Click a bubble to zoom, or a farm to open it.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('farm-register', {
          mode: 'counts', farms, region: selection.region, size: 'short'
        }))),

      section('The register', {
        note: 'Search by farm number or owner. Sort on any column.',
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
          { key: 'area', label: 'Holding (dun)', align: 'num', defaultSort: true, value: (f) => f.area, cell: (f) => dec(f.area, 1) },
          { key: 'crops', label: 'Main crops', value: (f) => f.crops.filter((c) => !c.former).sort((a, b) => b.area - a.area).slice(0, 3).map((c) => c.type).join(', ') || '—' },
          { key: 'trees', label: 'Trees', align: 'num', value: (f) => f.trees, cell: (f) => int(f.trees) },
          { key: 'ier', label: 'Efficiency', align: 'num', value: (f) => f.efficiency,
            cell: (f) => { const band = classify(EFFICIENCY, f.efficiency); return h('span', { class: 'bar-cell' }, h('span', { class: 'swatch', style: { background: band.color } }), String(f.efficiency)); } },
          { key: 'water', label: 'Water use', align: 'num', value: (f) => f.waterUsePct, cell: (f) => pct(f.waterUsePct) },
          { key: 'issues', label: 'Open', align: 'num', value: (f) => openIssues(f).length, cell: (f) => int(openIssues(f).length) }
        ]
      })),

      intro('Field inspectors already carry a tablet questionnaire that feeds a report generator. Feeding a farm’s figures into that tablet is a later step, and the export on the corrective-actions page is shaped with it in mind.')
    ]
  };
}
