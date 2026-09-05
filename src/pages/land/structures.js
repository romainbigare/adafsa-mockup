/* Land Use & Structures — structures.
 *
 * Tiers, as the contract describes them: tier 1 is the broad class, tier 2 the
 * type, and tier 3 the sub-classification of an irrigation utility. Tier 2 is
 * the October target and is what the survey delivers today.
 *
 * Tier 3 asks the classifier to tell a pump room from a filtration unit from a
 * desalination skid. On these farms those sit side by side under one cover, and
 * both sides of the review doubted it can be done from imagery. The tier is
 * modelled so it can appear the day it arrives, and the page says plainly that
 * it has not. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { summaryTable } from '../../components/summaryTable.js';
import { mapBand } from '../../components/mapBand.js';
import { dataTable } from '../../components/dataTable.js';
import { query } from '../../data/store.js';
import { classBreakdown } from '../../domain/aggregate.js';
import { TIER3_PENDING_TYPES } from '../../data/compose.js';
import { landuseColor, SEQUENTIAL } from '../../domain/palette.js';
import { int, dec } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

export function render({ selection }) {
  const farms = query({ region: selection.region });
  const built = farms.filter((farm) => farm.structures.length > 0);
  const structures = farms.flatMap((farm) => farm.structures.map((s) => ({ category: s.tier1, type: s.tier2, area: s.area, count: 1 })));
  const rows = classBreakdown(structures);
  const totalArea = structures.reduce((a, s) => a + s.area, 0);
  const pending = structures.filter((s) => TIER3_PENDING_TYPES.includes(s.type));

  const peak = Math.max(1, ...built.map((farm) => farm.structures.length));

  return {
    content: [
      figures([
        { value: int(structures.length), label: 'Structures found', icon: 'land' },
        { value: int(built.length), label: 'Farms with structures', icon: 'farms' },
        { value: dec(totalArea, 1), unit: 'dun', label: 'Area covered', icon: 'ruler' },
        { value: int(rows.length), label: 'Main classes', icon: 'layers' }
      ]),

      callout('info', `Tier 2 gives the type of each structure. Tier 3, which splits irrigation buildings further, is not available yet — ${int(pending.length)} of them are waiting for it.`),

      section('Where the structures are', { icon: 'pin', note: 'Bigger dots have more structures.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('land-structures', {
          mode: 'category',
          farms: built,
          region: selection.region,
          size: 'short',
          colorOf: (farm) => SEQUENTIAL[Math.min(SEQUENTIAL.length - 1, 1 + Math.floor((farm.structures.length / peak) * 4))],
          labelOf: (farm) => `${int(farm.structures.length)} structures · ${dec(farm.structureArea, 2)} dun`,
          legend: [{ label: 'Few structures', color: SEQUENTIAL[1] }, { label: 'Many', color: SEQUENTIAL[5] }],
          legendTitle: 'Structures per holding'
        }))),


      section('Area by structure type', { icon: 'land', half: true, note: 'Click a class to see its types.', flush: true },
        summaryTable(rows, {
          measure: 'area', measureLabel: 'Footprint (dun)', format: (v) => dec(v, 2),
          totalLabel: 'All structures', colorOf: (row) => landuseColor(row.name)
        })),

      section('Number of each type', { icon: 'table', half: true, note: 'How many were found.', flush: true },
        summaryTable(rows, {
          measure: 'farms', measureLabel: 'Structures', format: int,
          totalLabel: 'All structures', colorOf: (row) => landuseColor(row.name)
        })),

      section('Every farm', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(built, {
          selection,
          searchable: true,
          csvName: 'structures',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'count', label: 'Structures', align: 'num', defaultSort: true, value: (f) => f.structures.length, cell: (f) => int(f.structures.length) },
            { key: 'built', label: 'Area covered (dun)', align: 'num', value: (f) => f.structureArea, cell: (f) => dec(f.structureArea, 2) },
            { key: 'types', label: 'Types', value: (f) => [...new Set(f.structures.map((s) => s.tier2))].sort().join(', ') },
            { key: 'pending', label: 'Waiting for tier 3', align: 'num', value: (f) => f.structures.filter((s) => s.tier3 === null).length, cell: (f) => int(f.structures.filter((s) => s.tier3 === null).length) }
          ]
        }))
    ]
  };
}
