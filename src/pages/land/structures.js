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
import { provinceBlock } from '../../components/provinceBlock.js';
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
    asOf: TODAY,
    content: [
      figures([
        { value: int(structures.length), label: 'Structures detected' },
        { value: int(built.length), label: 'Farms carrying structures' },
        { value: dec(totalArea, 1), unit: 'dun', label: 'Built footprint' },
        { value: int(rows.length), label: 'Tier 1 classes' }
      ]),

      callout('info', `Tier 2 — the type of each structure — is what the survey classifies today and what the October rollout targets. Tier 3, separating a pump room from a filtration or desalination unit, is not delivered: on these holdings they sit together under one cover. ${int(pending.length)} irrigation utilities are waiting on it.`),

      section('Where the structures are', { note: 'Sized by how many structures a holding carries.', flush: true },
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

      section('By province', { flush: true }, provinceBlock(farms, [
        { key: 'count', label: 'Structures', value: (set) => set.reduce((a, f) => a + f.structures.length, 0), format: int },
        { key: 'area', label: 'Footprint (dun)', value: (set) => set.reduce((a, f) => a + f.structureArea, 0), format: (v) => dec(v, 1) }
      ])),

      section('Tier 1 and tier 2', { note: 'Open a class to see the types inside it.', flush: true },
        summaryTable(rows, {
          measure: 'area', measureLabel: 'Footprint (dun)', format: (v) => dec(v, 2),
          totalLabel: 'All structures', colorOf: (row) => landuseColor(row.name)
        })),

      section('Count by type', { flush: true },
        summaryTable(rows, {
          measure: 'farms', measureLabel: 'Structures', format: int,
          totalLabel: 'All structures', colorOf: (row) => landuseColor(row.name)
        })),

      section('Every farm', { flush: true },
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
            { key: 'built', label: 'Footprint (dun)', align: 'num', value: (f) => f.structureArea, cell: (f) => dec(f.structureArea, 2) },
            { key: 'types', label: 'Types', value: (f) => [...new Set(f.structures.map((s) => s.tier2))].sort().join(', ') },
            { key: 'pending', label: 'Awaiting tier 3', align: 'num', value: (f) => f.structures.filter((s) => s.tier3 === null).length, cell: (f) => int(f.structures.filter((s) => s.tier3 === null).length) }
          ]
        }))
    ]
  };
}
