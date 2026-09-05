/* A single stacked bar showing how a set divides across a band scale.
 *
 * Status colours, so it is only ever used where something is being judged.
 * Segments carry a two-pixel gap and the legend beneath names every band with
 * its count — the colour is never the only way to read it. */

import { h } from '../app/dom.js';
import { int, pct } from '../domain/format.js';

export function bandBar(rows, { total = null, showLegend = true } = {}) {
  const sum = total ?? rows.reduce((a, r) => a + r.count, 0);
  const bar = h('div', {
    style: { display: 'flex', gap: '2px', height: '14px', borderRadius: '4px', overflow: 'hidden', background: 'var(--none-bg)' }
  }, ...rows.filter((r) => r.count > 0).map((row) => h('span', {
    title: `${row.label}: ${int(row.count)}`,
    style: { width: `${(row.count / Math.max(1, sum)) * 100}%`, background: row.color }
  })));

  if (!showLegend) return bar;

  return h('div', { style: { display: 'grid', gap: '8px' } }, bar,
    h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '3px', fontSize: '12.5px' } },
      ...rows.map((row) => h('li', { style: { display: 'flex', alignItems: 'center', gap: '7px' } },
        h('span', { class: 'swatch', style: { background: row.color } }),
        h('span', { text: row.label }),
        h('span', { class: 'muted', style: { fontSize: '11.5px' }, text: row.range }),
        h('span', { class: 'tabular', style: { marginInlineStart: 'auto' }, text: int(row.count) }),
        h('span', { class: 'muted tabular', style: { minWidth: '44px', textAlign: 'end' }, text: pct(row.shareOfFarms) })))));
}
