/* The region selector.
 *
 * It sits in the header of every page rather than on one of them. Each province
 * is run by a different member of the royal family and they ask for their own
 * figures, so "which province" is a question the platform should never make
 * anyone go looking for. */

import { h } from '../app/dom.js';
import { REGIONS } from '../domain/regions.js';
import { setParams } from '../app/router.js';

export function regionSelect(current) {
  return h('label', { class: 'region-select' },
    h('span', { class: 'visually-hidden', text: 'Region' }),
    h('select', {
      class: 'select',
      onchange: (e) => setParams({ region: e.target.value, p: null })
    }, ...REGIONS.map((region) => h('option', { value: region.id, selected: region.id === current, text: region.label })))
  );
}
