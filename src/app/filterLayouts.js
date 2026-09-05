/* Four placements for the filters, so one can be chosen from the real screens
 * rather than from a description. Pick with ?layout= on any route:
 *
 *   rail    the left column as built (the default)
 *   bar     a horizontal strip under the page header
 *   button  one Filters button in the header, opening a panel
 *   slim    an icon rail that expands over the content
 *
 * Whichever wins, the other three come out. This file is the only place they
 * differ; the filter itself is the same component in all four. */

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { regionPanel } from '../components/regionPanel.js';
import { REGIONS } from '../domain/regions.js';
import { scopeTree } from '../domain/taxonomy.js';
import { setParams, currentParams } from './router.js';

export const VARIANTS = ['rail', 'bar', 'button', 'slim'];

export function layoutVariant() {
  const asked = currentParams().get('layout');
  return VARIANTS.includes(asked) ? asked : 'rail';
}

/* A compact region control for the layouts that have no rail to put one in. */
function regionControl(current) {
  return h('label', { class: 'inline-field' },
    h('span', { text: 'Region' }),
    h('select', {
      class: 'select', onchange: (e) => setParams({ region: e.target.value, p: null })
    }, ...REGIONS.map((r) => h('option', { value: r.id, selected: r.id === current, text: r.label }))));
}

/* Category chips: the level people actually filter at most of the time, with
 * the full tree one click further in. */
function categoryChips(tree, scope, selected) {
  const visible = scopeTree(tree, scope);
  const keys = visible.flatMap((c) => c.types.map((t) => t.key));
  const active = selected.size ? new Set([...selected].filter((k) => keys.includes(k))) : new Set(keys);

  return visible.map((category) => {
    const categoryKeys = category.types.map((t) => t.key);
    const on = categoryKeys.filter((k) => active.has(k)).length;
    const all = on === categoryKeys.length;
    return h('button', {
      class: ['chip-toggle', all ? 'is-on' : on ? 'is-part' : null],
      'aria-pressed': String(all),
      onclick: () => {
        const next = new Set(active);
        for (const key of categoryKeys) all ? next.delete(key) : next.add(key);
        setParams({ types: next.size === keys.length ? null : next.size === 0 ? new Set(['-']) : next, p: null });
      }
    }, h('span', { class: 'swatch', style: { background: category.color } }), h('span', { text: category.name }));
  });
}

/* A button that opens a panel below it. */
function popover(label, count, panel) {
  const box = h('div', { class: 'filter-pop', hidden: true }, panel);
  const button = h('button', { class: 'btn', 'aria-expanded': 'false', onclick: (e) => {
    e.stopPropagation();
    const open = box.hidden;
    box.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  } }, icon('filter', { size: 14 }), h('span', { text: label }),
    count != null ? h('span', { class: 'chip chip-none', text: String(count) }) : null);
  const host = h('span', { class: 'popover-host' }, button, box);
  document.addEventListener('click', (event) => {
    if (!host.contains(event.target)) { box.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  });
  return host;
}

const activeCount = (tree, scope, selected) => {
  const keys = scopeTree(tree, scope).flatMap((c) => c.types.map((t) => t.key));
  return selected.size ? [...selected].filter((k) => keys.includes(k)).length : keys.length;
};

/* Places the filters and returns { aside, strip } for the shell to mount. */
export function placeFilters(root, { variant, rail, selection, showRegion, tree, scope }) {
  const aside = [];
  let strip = null;

  if (variant === 'rail') {
    if (showRegion) aside.push(regionPanel(selection.region));
    if (rail) aside.push(rail);
  }

  if (variant === 'bar') {
    strip = h('div', { class: 'filter-bar' },
      showRegion ? regionControl(selection.region) : null,
      rail ? h('span', { class: 'bar-label', text: 'Crops' }) : null,
      ...(rail && tree ? categoryChips(tree, scope, selection.types) : []),
      rail ? popover('All crops', activeCount(tree, scope, selection.types), rail) : null);
  }

  if (variant === 'button') {
    strip = h('div', { class: 'filter-bar filter-bar--right' },
      showRegion ? regionControl(selection.region) : null,
      rail ? popover('Filter crops', activeCount(tree, scope, selection.types), rail) : null);
  }

  if (variant === 'slim') {
    const drawer = h('div', { class: 'slim-drawer', hidden: true },
      showRegion ? regionPanel(selection.region) : null, rail);
    const toggle = h('button', {
      class: 'slim-toggle', title: 'Filters', 'aria-label': 'Filters', 'aria-expanded': 'false',
      onclick: (e) => {
        e.stopPropagation();
        const open = drawer.hidden;
        drawer.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
      }
    }, icon('filter', { size: 17 }));
    const holder = h('aside', { class: 'rail-slim' }, toggle, drawer);
    document.addEventListener('click', (event) => {
      if (!holder.contains(event.target)) { drawer.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
    });
    aside.push(holder);
  }

  return { aside, strip };
}
