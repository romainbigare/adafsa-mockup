/* The change page's lower half: four direction tabs over a contributor table.
 *
 * "Give me the list of farms that have stopped growing tomatoes, or grew them
 * before, or have increased" was the request almost word for word. The tabs are
 * that sentence. */

import { h } from '../app/dom.js';
import { DIRECTIONS, contributors } from '../domain/change.js';
import { dataTable } from './dataTable.js';
import { dec, signed, signedPct } from '../domain/format.js';
import { setParams } from '../app/router.js';
import { regionById } from '../domain/regions.js';

export function directionTabs(moves, active) {
  const counts = moves.reduce((acc, move) => { acc[move.direction] = (acc[move.direction] || 0) + 1; return acc; }, {});
  return h('div', { class: 'segmented' }, ...DIRECTIONS.map((direction) => h('button', {
    'aria-pressed': String(direction.id === active),
    'aria-label': `${direction.label} (${counts[direction.id] || 0})`,
    title: direction.hint,
    onclick: () => setParams({ dir1: direction.id, p: null })
  }, `${direction.label} (${counts[direction.id] || 0})`)));
}

export function contributorTable(moves, selection, {
  direction = null,
  unit = 'dun',
  csvName = 'change',
  label = 'Area',
  nameOf = (move) => move.record.type || '—'
} = {}) {
  const rows = contributors(moves, { direction });
  return dataTable(rows, {
    selection,
    searchable: true,
    searchOn: (move) => `${move.record.farm?.fid ?? move.record.fid} ${move.record.farm?.owner ?? move.record.owner} ${nameOf(move)}`,
    hrefFor: (move) => `#/farm/${move.record.farm?.fid ?? move.record.fid}`,
    csvName,
    emptyText: 'No farms moved in this direction over the period.',
    columns: [
      { key: 'fid', label: 'Farm', strong: true, value: (m) => m.record.farm?.fid ?? m.record.fid, cell: (m) => `#${m.record.farm?.fid ?? m.record.fid}` },
      { key: 'owner', label: 'Owner', value: (m) => m.record.farm?.owner ?? m.record.owner },
      { key: 'province', label: 'Province', value: (m) => regionById(m.record.farm?.province ?? m.record.province).label },
      { key: 'what', label: 'Crop', value: nameOf },
      { key: 'before', label: `Before (${unit})`, align: 'num', value: (m) => m.before, cell: (m) => dec(m.before, 1) },
      { key: 'after', label: `Now (${unit})`, align: 'num', value: (m) => m.after, cell: (m) => dec(m.after, 1) },
      { key: 'delta', label: 'Change', align: 'num', defaultSort: true, value: (m) => Math.abs(m.delta), cell: (m) => signed(m.delta, 1) },
      { key: 'pct', label: 'Change %', align: 'num', value: (m) => (m.pct == null ? null : Math.abs(m.pct)), cell: (m) => (m.pct == null ? 'new' : signedPct(m.pct)) }
    ]
  });
}

