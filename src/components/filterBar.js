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
import { cropFilter, activeKeys, scopeKeys, applySelection } from './cropFilter.js';
import { deckMark } from '../app/deckMark.js';

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
      'aria-label': 'Region',
      ...deckMark({ note: 'Narrows every figure on the page to one province' }),
      onchange: (e) => setParams({ region: e.target.value, p: null })
    }, ...REGIONS.map((r) => h('option', { value: r.id, selected: r.id === current, text: r.label }))));
}

/* One chip per group: the name toggles the whole group, the chevron opens it. */
function groupChip(tree, scope, selected, category) {
  const categoryKeys = category.types.map((t) => t.key);
  const active = activeKeys(tree, scope, selected);
  const on = categoryKeys.filter((k) => active.has(k)).length;
  const all = on === categoryKeys.length;

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
    h('span', { text: category.name }));

  const chip = h('span', { class: ['chip-toggle', all ? 'is-on' : on ? 'is-part' : 'is-off'] }, main);

  if (category.types.length > 1) {
    const opener = h('button', {
      class: 'chip-more',
      title: `Choose crops in ${category.name}`, 'aria-label': `Choose crops in ${category.name}`,
      ...deckMark({ note: 'Opens the crops inside this group, one tick box each' })
    }, icon('chevronDown', { size: 12 }));
    chip.append(withPanel(opener, cropFilter(tree, {
      scope, selected, only: category.name, memoryKey: 'group:' + category.name
    })));
  }
  return chip;
}

export function filterBar({ tree, scope = null, selection, showRegion = true }) {
  const bar = h('div', { class: 'filter-bar' });
  if (showRegion) bar.append(regionField(selection.region));
  if (!scope || !tree) return bar;

  const groups = scopeTree(tree, scope);
  const keys = scopeKeys(tree, scope);
  const active = activeKeys(tree, scope, selection.types);
  const filtering = active.size !== keys.length;

  for (const category of groups) bar.append(groupChip(tree, scope, selection.types, category));

  /* The whole taxonomy in one panel. Each chip already opens its own group, so
   * this is the second route rather than the first. */
  const allButton = h('button', {
    class: ['btn', filtering ? 'is-active' : null],
    title: filtering ? `Choose individual crops — ${active.size} of ${keys.length} on` : 'Choose individual crops',
    ...deckMark({ note: 'Opens the whole crop list, every group expanded' })
  }, icon('filter', { size: 14 }), h('span', { text: 'All crops' }));
  bar.append(withPanel(allButton, cropFilter(tree, { scope, selected: selection.types, memoryKey: 'all:' + scope })));

  /* The chips already say what is on, so the only thing worth adding is a way
   * back to everything. */
  if (filtering) {
    bar.append(h('button', {
      class: 'link bar-clear',
      onclick: () => setParams({ types: null, p: null }),
      text: 'Show all'
    }));
  }
  return bar;
}
