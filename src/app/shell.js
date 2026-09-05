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
import { regionPanel } from '../components/regionPanel.js';

function navLink(entry, activeId, { child = false, section = false, expandable = false } = {}) {
  const params = currentParams();
  return h('a', {
    class: [child ? 'nav-child' : 'nav-top', section ? 'is-section' : null],
    href: href(entry.segments, params),
    'aria-current': entry.id === activeId ? 'page' : null,
    'aria-expanded': expandable ? String(section) : null
  },
    child ? null : icon(entry.icon, { size: 17 }),
    h('span', { class: 'nav-label', text: entry.label }),
    expandable ? h('span', { class: 'nav-chevron' }, icon('chevronDown', { size: 14 })) : null);
}

/* A module opens when you are inside it and closes when you leave, so the menu
 * stays short. The chevron says the entry has more underneath. */
export function renderNav(root, place) {
  clear(root);
  append(root, [
    h('div', { class: 'nav-brand' },
      h('strong', { text: 'ADAFSA' }),
      h('span', { text: 'Agricultural Monitoring Platform' })),
    h('ul', { class: 'nav-list' }, ...NAV.map((entry) => {
      const inSection = !!entry.children && entry.id === place?.navId;
      const item = h('li', { class: ['nav-item', entry.children ? 'has-children' : null, inSection ? 'is-open' : null] },
        navLink(entry, place?.navId, { section: inSection, expandable: !!entry.children }));
      if (inSection) {
        item.append(h('ul', { class: 'nav-sub' },
          ...entry.children.map((child) => h('li', {}, navLink(child, place?.childId, { child: true })))));
      }
      return item;
    })),
    h('div', { class: 'nav-foot' }, ...NAV_FOOTER.map((entry) => navLink(entry, place?.navId)))
  ]);
}

export function renderHeader(root, { place, tools = [] }) {
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
    tools.length ? h('div', { class: 'header-tools' }, ...tools) : null
  ]);
}

/* The rail carries the two filters that decide what the page counts: the region
 * always, and the crop filter when the page has one. A page that reports on a
 * single farm has neither, and gets the full width. */
export function renderBody(root, { content, rail, selection, showRegion = true }) {
  clear(root);
  const panels = [showRegion ? regionPanel(selection.region) : null, rail].filter(Boolean);
  root.classList.toggle('no-rail', panels.length === 0);
  if (panels.length) root.append(h('aside', { class: 'rail' }, ...panels));
  root.append(h('div', { class: 'page-content' }, content));
}

export const placeFor = (segments) => locate(segments);
