/* A horizontal bar list — magnitude, one series.
 *
 * A bar per row with its value written beside it, so the reading never depends
 * on the colour. Used wherever the question is "how much of each", which in
 * this platform is most of the time. */

import { h } from '../app/dom.js';

export function barList(rows, { format = (v) => String(v), color = '#2a78d6', max = null, limit = 12 } = {}) {
  const shown = rows.slice(0, limit);
  const top = max ?? Math.max(1, ...shown.map((r) => r.value || 0));

  return h('div', { class: 'bar-list' }, ...shown.map((row) => h('div', { class: 'row' },
    h('span', { class: 'name' },
      row.color ? h('span', { class: 'swatch', style: { background: row.color } }) : null,
      h('span', { text: row.label, title: row.label })),
    h('span', { class: 'track' },
      h('span', { class: 'fill', style: { width: `${Math.max(1.5, ((row.value || 0) / top) * 100)}%`, background: row.color || color } })),
    h('span', { class: 'amount', text: row.amount ?? format(row.value) })
  )));
}
