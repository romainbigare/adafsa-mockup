/* Support — one page, reached from one entry in the navigation.
 *
 * In the platform this replaces, more than half the menu was support and
 * settings. It is one link now. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';

export function render() {
  return {
    showRegion: false,
    content: [
      h('div', { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', { text: 'Getting help' })),
        h('div', { class: 'card-body' },
          h('p', { class: 'section-intro' },
            'Questions about a figure on any page, a farm that looks wrong, or a report you need and cannot find go to the platform team. Every page can be linked to directly — copying the address from the browser is the quickest way to point at what you are looking at.'))),
      h('div', { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', { text: 'About the figures on this build' })),
        h('div', { class: 'card-body' },
          h('div', { class: 'callout callout-info' }, icon('info'),
            h('div', {},
              h('p', { text: 'This is a design mockup. Farm boundaries, crop parcels and land-use classes come from the survey; every score, count, forecast and history is generated. No number here describes a real farm.' })))))
    ]
  };
}
