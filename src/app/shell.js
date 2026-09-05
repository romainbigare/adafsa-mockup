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
import { filterBar } from '../components/filterBar.js';

function navLink(entry, { child = false, expandable = false } = {}) {
  return h('a', {
    class: child ? 'nav-child' : 'nav-top',
    href: href(entry.segments, currentParams()),
    'aria-expanded': expandable ? 'false' : null
  },
    child ? null : icon(entry.icon, { size: 17 }),
    h('span', { class: 'nav-label', text: entry.label }),
    expandable ? h('span', { class: 'nav-chevron' }, icon('chevronDown', { size: 14 })) : null);
}

/* THE MENU IS BUILT ONCE AND THEN ONLY CHANGES STATE.
 *
 * A module's pages are always in the DOM, folded away by a grid row that goes
 * from nothing to its own height. Rebuilding the list on every page change
 * would put the new menu straight into its final shape with nothing to
 * animate, and the group would appear to jump. Built once, the fold has
 * somewhere to travel from.
 *
 * The group heading is never marked as the current page — only the page you
 * are on carries that. The heading is a heading; the open chevron already says
 * which module you are inside. */
let menu = null;

function buildNav(root) {
  clear(root);
  const items = NAV.map((entry) => {
    const link = navLink(entry, { expandable: !!entry.children });
    const li = h('li', { class: ['nav-item', entry.children ? 'has-children' : null] }, link);
    const children = (entry.children || []).map((child) => ({ entry: child, link: navLink(child, { child: true }) }));
    if (children.length) {
      li.append(h('div', { class: 'nav-fold' },
        h('ul', { class: 'nav-sub' }, ...children.map((c) => h('li', {}, c.link)))));
    }
    return { entry, li, link, children };
  });
  const footer = NAV_FOOTER.map((entry) => ({ entry, link: navLink(entry) }));

  append(root, [
    h('div', { class: 'nav-brand' },
      h('strong', { text: 'ADAFSA' }),
      h('span', { text: 'Agricultural Monitoring Platform' })),
    h('ul', { class: 'nav-list' }, ...items.map((i) => i.li)),
    h('div', { class: 'nav-foot' }, ...footer.map((f) => f.link))
  ]);
  return { root, items, footer };
}

const mark = (link, current) => {
  if (current) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
};

export function renderNav(root, place) {
  if (!menu || menu.root !== root || !root.firstChild) menu = buildNav(root);
  const params = currentParams();

  for (const item of menu.items) {
    const here = item.entry.id === place?.navId;
    const open = here && !!item.children.length;
    item.li.classList.toggle('is-open', open);
    item.link.href = href(item.entry.segments, params);
    if (item.children.length) item.link.setAttribute('aria-expanded', String(open));
    mark(item.link, here && !item.children.length);
    for (const child of item.children) {
      child.link.href = href(child.entry.segments, params);
      mark(child.link, here && child.entry.id === place?.childId);
    }
  }
  for (const entry of menu.footer) {
    entry.link.href = href(entry.entry.segments, params);
    mark(entry.link, entry.entry.id === place?.navId);
  }
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

/* The filters live in one strip under the page header: the region always, and
 * the crop groups when the page has them. A page about a single farm has
 * neither, and the strip disappears. */
export function renderBody(root, { content, selection, showRegion = true, tree = null, filterScope = null }) {
  clear(root);
  const strip = document.getElementById('filter-strip');
  clear(strip);
  if (showRegion || filterScope) {
    strip.append(filterBar({ tree, scope: filterScope, selection, showRegion }));
  }
  root.append(h('div', { class: 'page-content' }, content));
}

export const placeFor = (segments) => locate(segments);
