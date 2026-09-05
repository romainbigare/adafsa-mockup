/* The row of headline figures at the top of a page. */

import { h } from '../app/dom.js';
import { icon as glyph } from '../app/icons.js';

export function figures(items) {
  return h('div', { class: 'figures' }, ...items.filter(Boolean).map((item) => h('div', {
    class: ['figure', item.tone === 'act' ? 'is-alert' : item.tone === 'watch' ? 'is-watch' : null]
  },
    h('div', { class: 'label' }, item.icon ? glyph(item.icon, { size: 13 }) : null, h('span', { text: item.label })),
    h('div', { class: 'value' }, item.value, item.unit ? h('span', { class: 'unit', text: item.unit }) : null))));
}
