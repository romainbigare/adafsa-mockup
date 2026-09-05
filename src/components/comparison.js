/* The comparison selector every change page carries.
 *
 * Quarter-on-quarter is the default. Year-on-year is offered because the review
 * wanted both and did not settle which — for structures in particular, where
 * the question was left open. */

import { h } from '../app/dom.js';
import { COMPARISONS } from '../domain/periods.js';
import { setParams } from '../app/router.js';
import { deckMark } from '../app/deckMark.js';

export function comparisonSelect(current) {
  return h('div', { class: 'segmented', role: 'group', 'aria-label': 'Comparison period' },
    ...COMPARISONS.map((option) => h('button', {
      'aria-pressed': String(option.id === current),
      ...deckMark({ note: 'Compares against last quarter or against last year' }),
      onclick: () => setParams({ cmp: option.id, p: null })
    }, option.label)));
}
