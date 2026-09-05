/* The application shell: navigation, page header, and the mount the pages
 * render into.
 *
 * Pages return a small object rather than a bare element — content, an optional
 * filter rail, and any header tools — so the furniture stays in the same place
 * on every screen and a page never has to build its own header. */

import { h, clear, append } from './dom.js';
import { icon } from './icons.js';
import { NAV, NAV_FOOTER, locate } from './nav.js';
import { href, currentParams } from './router.js';
import { regionSelect } from '../components/regionSelect.js';
import { asOfDate } from '../domain/format.js';
import { TODAY } from '../domain/periods.js';

function navLink(entry, activeId, isChild = false) {
  const params = currentParams();
  return h('a', {
    href: href(entry.segments, params),
    'aria-current': entry.id === activeId ? 'page' : null
  }, isChild ? null : icon(entry.icon, { size: 17 }), h('span', { text: entry.label }));
}

export function renderNav(root, place) {
  clear(root);
  append(root, [
    h('div', { class: 'nav-brand' },
      h('strong', { text: 'ADAFSA' }),
      h('span', { text: 'Agricultural Monitoring Platform' })),
    h('ul', { class: 'nav-list' }, ...NAV.map((entry) => {
      const item = h('li', { class: 'nav-item' }, navLink(entry, place?.navId));
      const open = entry.children && entry.id === place?.navId;
      if (open) {
        item.append(h('ul', { class: 'nav-sub' },
          ...entry.children.map((child) => h('li', {}, navLink(child, place?.childId, true)))));
      }
      return item;
    })),
    h('div', { class: 'nav-foot' }, ...NAV_FOOTER.map((entry) => navLink(entry, place?.navId)))
  ]);
}

export function renderHeader(root, { place, selection, tools = [], asOf = TODAY, showRegion = true }) {
  clear(root);
  append(root, [
    h('button', {
      class: 'btn nav-toggle',
      'aria-label': 'Menu',
      onclick: () => document.body.classList.toggle('nav-open')
    }, icon('menu')),
    h('div', { class: 'page-title' },
      place?.eyebrow ? h('div', { class: 'eyebrow', text: place.eyebrow }) : null,
      h('h1', { text: place?.title || '' })),
    h('div', { class: 'header-tools' },
      ...tools,
      showRegion ? regionSelect(selection.region) : null,
      h('span', { class: 'as-of', title: 'Date of the most recent satellite pass' },
        icon('clock', { size: 13 }), ' ', asOfDate(asOf)))
  ]);
}

export function renderBody(root, { content, rail }) {
  clear(root);
  root.classList.toggle('no-rail', !rail);
  if (rail) root.append(h('aside', { class: 'rail' }, rail));
  root.append(h('div', { class: 'page-content' }, content));
}

export const placeFor = (segments) => locate(segments);
