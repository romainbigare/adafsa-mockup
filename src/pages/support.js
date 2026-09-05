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
        h('div', { class: 'card-head' }, icon('support', { size: 15 }), h('h2', { text: 'Getting help' })),
        h('div', { class: 'card-body' },
          h('p', { class: 'section-intro' },
            'Ask the platform team about any figure, farm or report. To point at what you are looking at, copy the address from your browser and send it — every page has its own link.'))),
      h('div', { class: 'card' },
        h('div', { class: 'card-head' }, icon('info', { size: 15 }), h('h2', { text: 'About this version' })),
        h('div', { class: 'card-body' },
          h('div', { class: 'callout callout-info' }, icon('info'),
            h('div', {},
              h('p', { text: 'This is a design mockup. Farm outlines, crop parcels and land types come from the survey. Scores, counts and forecasts are made up for the demo.' })))))
    ]
  };
}
