/* The searchable, sortable, exportable table.
 *
 * Every module ends in one of these: summary numbers first, then the long list
 * of farms with the ability to sort on any column — who has the worst score,
 * who lost the most, who is over-allocated. Sorting and paging are held in the
 * URL, so a colleague can be sent the exact view rather than instructions for
 * reproducing it.
 *
 * Paged rather than endless. The survey here holds five hundred farms; the
 * emirate holds tens of thousands, and the table should behave the same way at
 * both sizes. */

import { h, clear } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { int } from '../domain/format.js';
import { setParams } from '../app/router.js';

const PAGE_SIZE = 25;

export function dataTable(rows, {
  columns,
  selection,
  searchable = false,
  searchPlaceholder = 'Search farm or owner',
  searchOn = (row) => `${row.fid} ${row.owner}`,
  hrefFor = null,
  csvName = 'export',
  pageSize = PAGE_SIZE,
  emptyText = 'No rows match the current selection.',
  footNote = null
} = {}) {
  const sortKey = selection.sort || columns.find((c) => c.defaultSort)?.key || columns[0].key;
  const sortDir = selection.dir || (columns.find((c) => c.key === sortKey)?.defaultDir || 'desc');
  const column = columns.find((c) => c.key === sortKey) || columns[0];

  const term = (selection.search || '').trim().toLowerCase();
  const filtered = term ? rows.filter((row) => searchOn(row).toLowerCase().includes(term)) : rows;

  const sorted = [...filtered].sort((a, b) => {
    const av = column.value(a);
    const bv = column.value(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(selection.page || 1, pages);
  const slice = sorted.slice((page - 1) * pageSize, page * pageSize);

  const head = h('tr', {}, ...columns.map((col) => {
    const active = col.key === sortKey;
    return h('th', {
      class: [col.align === 'num' ? 'num' : null, 'sortable'],
      'aria-sort': active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none',
      title: `Sort by ${col.label}`,
      onclick: () => setParams({ sort: col.key, dir: active && sortDir === 'desc' ? 'asc' : 'desc', p: null })
    }, col.label, active ? h('span', { class: 'sort-mark', text: sortDir === 'asc' ? '▲' : '▼' }) : null);
  }));

  const body = h('tbody');
  if (!slice.length) {
    body.append(h('tr', {}, h('td', { colspan: columns.length, class: 'muted', text: emptyText })));
  }
  for (const row of slice) {
    const target = hrefFor ? hrefFor(row) : null;
    const tr = h('tr', {
      class: target ? 'is-clickable' : null,
      onclick: target ? () => { location.hash = target.replace(/^#/, '#'); } : null
    }, ...columns.map((col) => {
      const content = col.cell ? col.cell(row) : col.value(row);
      return h('td', { class: [col.align === 'num' ? 'num' : null, col.strong ? 'name' : null, col.wrap ? 'wrap' : null] },
        content instanceof Node ? content : String(content ?? '—'));
    }));
    body.append(tr);
  }

  const exportBtn = h('button', {
    class: 'btn btn-sm',
    onclick: () => exportCsv(sorted, columns, csvName)
  },
    icon('download', { size: 14 }), h('span', { text: 'Export CSV' }));

  const search = searchable
    ? h('input', {
        class: 'input', type: 'search', value: selection.search, placeholder: searchPlaceholder,
        style: { maxWidth: '260px' },
        oninput: (e) => { clearTimeout(search._t); search._t = setTimeout(() => setParams({ q: e.target.value, p: null }), 220); }
      })
    : null;

  const pager = h('div', { class: 'table-foot' },
    search,
    h('span', { class: search ? 'spacer' : null, text: sorted.length
      ? `${int((page - 1) * pageSize + 1)}–${int(Math.min(page * pageSize, sorted.length))} of ${int(sorted.length)}`
      : 'No rows' }),
    footNote ? h('span', { class: 'muted', text: footNote }) : null,
    h('span', { class: search ? null : 'spacer' }),
    h('button', { class: 'btn btn-sm', disabled: page <= 1, onclick: () => setParams({ p: page - 1 }) }, 'Previous'),
    h('button', { class: 'btn btn-sm', disabled: page >= pages, onclick: () => setParams({ p: page + 1 }) }, 'Next'),
    exportBtn);

  return h('div', {},
    h('div', { class: 'table-wrap' }, h('table', { class: 'grid' }, h('thead', {}, head), body)),
    pager);
}

/* The export carries every row the current sort and search produced, not only
 * the page on screen — the point of it is to take the whole answer away. */
function exportCsv(rows, columns, name) {
  const escape = (value) => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [columns.map((c) => escape(c.label)).join(',')];
  for (const row of rows) {
    lines.push(columns.map((c) => escape(c.csv ? c.csv(row) : c.value(row))).join(','));
  }
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = h('a', { href: url, download: `${name}.csv` });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Columns used by more than one page, so a farm reads the same way everywhere. */
export const farmColumns = {
  id: { key: 'fid', label: 'Farm', strong: true, value: (r) => r.fid, cell: (r) => `#${r.fid}` },
  owner: { key: 'owner', label: 'Owner', value: (r) => r.owner },
  province: { key: 'province', label: 'Province', value: (r) => r.provinceLabel || r.province },
  area: { key: 'area', label: 'Area (dun)', align: 'num', value: (r) => r.area, cell: (r) => r.area.toFixed(1) }
};
