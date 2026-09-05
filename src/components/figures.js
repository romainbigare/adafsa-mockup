/* The row of headline figures at the top of a page.
 *
 * Deliberately large. In review the same question — "where is the total?" — was
 * asked four times of a screen that already carried the total, which is a
 * question about size as much as about placement. */

import { h } from '../app/dom.js';

export function figures(items) {
  return h('div', { class: 'figures' }, ...items.filter(Boolean).map((item) => h('div', {
    class: ['figure', item.tone === 'act' ? 'is-alert' : item.tone === 'watch' ? 'is-watch' : null]
  },
    h('div', { class: 'value' }, item.value, item.unit ? h('span', { class: 'unit', text: item.unit }) : null),
    h('div', { class: 'label', text: item.label }),
    item.note ? h('div', { class: 'note', text: item.note }) : null)));
}
