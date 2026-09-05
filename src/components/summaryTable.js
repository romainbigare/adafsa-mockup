/* The distribution table: a category row that opens into its types.
 *
 * This is the table the review kept coming back to — the one already shown to
 * ADAFSA from the pilot. Click a category and it breaks down into the crops
 * inside it, with dunums or farms and the percentage of the whole.
 *
 * It answers to the page's filters but not to the map: panning never changes
 * these numbers. That was settled explicitly — the map is interactive, the
 * tables below it are fixed. */

import { h, clear } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { int, dec, pct } from '../domain/format.js';
import { categoryColor } from '../domain/palette.js';

export function summaryTable(rows, {
  measure = 'area',
  measureLabel = 'Dunums',
  format = (v) => dec(v, 1),
  totalLabel = 'All categories',
  colorOf = (row) => categoryColor(row.name),
  emptyText = 'Nothing in the current selection.'
} = {}) {
  const open = new Set();
  const shareKey = measure === 'area' ? 'areaShare' : 'farmShare';
  const total = rows.reduce((a, r) => a + (r[measure] || 0), 0);
  const peak = Math.max(1, ...rows.map((r) => r[measure] || 0));

  const body = h('tbody');
  const table = h('table', { class: 'grid' },
    h('thead', {}, h('tr', {},
      h('th', { text: 'Category' }),
      h('th', { class: 'num', text: measureLabel }),
      h('th', { class: 'num', text: 'Share' }),
      h('th', { style: { width: '20%' }, text: '' }))),
    body,
    h('tfoot', {}, h('tr', {},
      h('td', { text: totalLabel }),
      h('td', { class: 'num', text: format(total) }),
      h('td', { class: 'num', text: '100%' }),
      h('td', {}))));

  function draw() {
    clear(body);
    if (!rows.length) {
      body.append(h('tr', {}, h('td', { colspan: 4, class: 'muted', text: emptyText })));
      return;
    }
    for (const row of rows) {
      const expanded = open.has(row.key);
      const hasChildren = (row.children || []).length > 0;
      body.append(h('tr', {},
        h('td', { class: 'name' },
          hasChildren
            ? h('button', {
                class: 'disclose', 'aria-expanded': String(expanded),
                'aria-label': `${expanded ? 'Hide' : 'Show'} the crops inside ${row.name}`,
                onclick: () => { expanded ? open.delete(row.key) : open.add(row.key); draw(); }
              }, icon('chevron', { size: 13 }))
            : h('span', { style: { display: 'inline-block', width: '19px' } }),
          h('span', { class: 'swatch', style: { background: colorOf(row), marginInlineEnd: '7px' } }),
          row.name),
        h('td', { class: 'num', text: format(row[measure] || 0) }),
        h('td', { class: 'num', text: pct(row[shareKey] || 0, 1) }),
        h('td', {}, h('span', { class: 'bar-cell' },
          h('span', { class: 'track' },
            h('span', { class: 'fill', style: { width: `${((row[measure] || 0) / peak) * 100}%`, background: colorOf(row) } }))))));

      if (!expanded) continue;
      for (const child of row.children) {
        body.append(h('tr', { class: 'row-child' },
          h('td', { text: child.name }),
          h('td', { class: 'num', text: format(child[measure] || 0) }),
          h('td', { class: 'num muted', text: pct(child[shareKey] || 0, 1) }),
          h('td', {})));
      }
    }
  }

  draw();
  return h('div', { class: 'table-wrap' }, table);
}

export const countFormat = (v) => int(v);
