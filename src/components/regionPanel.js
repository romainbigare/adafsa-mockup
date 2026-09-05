/* The region selector.
 *
 * It sits at the top of the filter rail rather than in the page header, beside
 * the crop filter, because the two do the same job: they decide which farms the
 * page is counting. Splitting them across two corners of the screen made the
 * region look like a setting rather than a filter. */

import { h } from '../app/dom.js';
import { REGIONS } from '../domain/regions.js';
import { setParams } from '../app/router.js';

export function regionPanel(current) {
  return h('div', { class: 'rail-panel rail-panel--fixed' },
    h('div', { class: 'rail-head' }, h('h2', { text: 'Region' })),
    h('div', { class: 'rail-pad' },
      h('label', { class: 'visually-hidden', for: 'region-select', text: 'Region' }),
      h('select', {
        id: 'region-select',
        class: 'select',
        style: { width: '100%' },
        onchange: (e) => setParams({ region: e.target.value, p: null })
      }, ...REGIONS.map((region) => h('option', { value: region.id, selected: region.id === current, text: region.label })))));
}
