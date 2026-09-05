/* The filter bar.
 *
 * One strip under the page header carrying everything that decides what the
 * page is counting: the region, and a chip for each crop group. It replaced a
 * left-hand column that cost a fifth of the screen on every page and stood
 * mostly empty on the pages with three groups.
 *
 * A group chip does two things, because both are wanted often. Clicking its
 * name turns the whole group on or off. Clicking its chevron opens that group's
 * varieties, so a single crop can be unticked without touching the rest. The
 * "All crops" button opens the whole taxonomy with every group already open. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { REGIONS } from '../domain/regions.js';
import { scopeTree } from '../domain/taxonomy.js';
import { setParams } from '../app/router.js';
import { int } from '../domain/format.js';
import { cropFilter, activeKeys, scopeKeys, applySelection } from './cropFilter.js';

/* A button with a panel underneath it, closing on a click elsewhere. */
function withPanel(button, panel) {
  const box = h('div', { class: 'filter-pop', hidden: true }, panel);
  const host = h('span', { class: 'popover-host' }, button, box);
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = box.hidden;
    for (const other of document.querySelectorAll('.filter-pop')) if (other !== box) other.hidden = true;
    box.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!host.contains(event.target)) { box.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  });
  return host;
}

function regionField(current) {
  return h('label', { class: 'inline-field', title: 'Region' },
    h('span', { class: 'visually-hidden', text: 'Region' }),
    h('select', {
      class: 'select',
      onchange: (e) => setParams({ region: e.target.value, p: null })
    }, ...REGIONS.map((r) => h('option', { value: r.id, selected: r.id === current, text: r.label }))));
}

/* One chip per group: the name toggles the whole group, the chevron opens it. */
function groupChip(tree, scope, selected, counts, category) {
  const categoryKeys = category.types.map((t) => t.key);
  const active = activeKeys(tree, scope, selected);
  const on = categoryKeys.filter((k) => active.has(k)).length;
  const all = on === categoryKeys.length;
  const farms = counts ? categoryKeys.reduce((a, k) => a + (counts.get(k) || 0), 0) : null;

  const main = h('button', {
    class: 'chip-main',
    'aria-pressed': String(all),
    title: all ? `Hide ${category.name}` : `Show ${category.name}`,
    onclick: () => {
      const next = new Set(active);
      for (const key of categoryKeys) all ? next.delete(key) : next.add(key);
      applySelection(tree, scope, next);
    }
  },
    h('span', { class: 'swatch', style: { background: category.color } }),
    h('span', { text: category.name }),
    farms != null ? h('span', { class: 'chip-count', text: int(farms) }) : null);

  const chip = h('span', { class: ['chip-toggle', all ? 'is-on' : on ? 'is-part' : 'is-off'] }, main);

  if (category.types.length > 1) {
    const opener = h('button', { class: 'chip-more', title: `Choose crops in ${category.name}`, 'aria-label': `Choose crops in ${category.name}` },
      icon('chevronDown', { size: 12 }));
    chip.append(withPanel(opener, cropFilter(tree, {
      scope, selected, counts, only: category.name, memoryKey: 'group:' + category.name
    })));
  }
  return chip;
}

export function filterBar({ tree, scope = null, selection, counts = null, showRegion = true }) {
  const bar = h('div', { class: 'filter-bar' });
  if (showRegion) bar.append(regionField(selection.region));
  if (!scope || !tree) return bar;

  const groups = scopeTree(tree, scope);
  const keys = scopeKeys(tree, scope);
  const active = activeKeys(tree, scope, selection.types);
  const filtering = active.size !== keys.length;

  for (const category of groups) bar.append(groupChip(tree, scope, selection.types, counts, category));

  /* The whole taxonomy in one panel. Each chip already opens its own group, so
   * this is the second route rather than the first, and it stays an icon to
   * keep six groups and the region on one line. */
  const allButton = h('button', {
    class: ['btn', 'map-square', filtering ? 'is-active' : null],
    title: filtering ? `Choose crops — ${int(active.size)} of ${int(keys.length)} on` : 'Choose individual crops',
    'aria-label': 'Choose individual crops'
  }, icon('filter', { size: 15 }));
  bar.append(withPanel(allButton, cropFilter(tree, { scope, selected: selection.types, counts, memoryKey: 'all:' + scope })));

  if (filtering) {
    bar.append(h('span', { class: 'bar-state', text: `${int(active.size)} of ${int(keys.length)} crops` }));
    bar.append(h('button', {
      class: 'link bar-clear',
      onclick: () => setParams({ types: null, p: null }),
      text: 'Show all'
    }));
  }
  return bar;
}
