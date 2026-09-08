/* The filter bar.
 *
 * One strip under the page header carrying everything that decides what the
 * page is counting: the region, and a chip for each crop group. It replaced a
 * left-hand column that cost a fifth of the screen on every page and stood
 * mostly empty on the pages with three groups.
 *
 * A group chip does two things, because both are wanted often. Clicking its
 * name turns the whole group on or off. Clicking its chevron opens that group's
 * varieties, so a single crop can be unticked without touching the rest.
 *
 * There was a second button offering the whole taxonomy in one panel. It is
 * gone: every crop it reached is reachable through its own group's chevron, and
 * two routes to the same list is one more than the bar can carry. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { REGIONS } from '../domain/regions.js';
import { scopeTree } from '../domain/taxonomy.js';
import { setParams } from '../app/router.js';
import { cropFilter, activeKeys, scopeKeys, applySelection } from './cropFilter.js';

/* WHICH PANEL IS OPEN IS REMEMBERED, NOT THE ELEMENT.
 *
 * Ticking a crop changes the selection, which redraws the page, which builds a
 * new filter bar. If "open" lived in the panel, every tick would shut it and
 * unticking three crops would be three trips through the chevron. So the bar
 * remembers the key of the open panel and the new one opens itself. */
let openPanel = null;
let closerBound = false;

function bindCloser() {
  if (closerBound) return;
  closerBound = true;
  document.addEventListener('click', (event) => {
    /* A click inside any popover — including the tick box whose redraw just
     * replaced this very element — is not a click elsewhere. */
    if (event.target.closest?.('.popover-host')) return;
    if (openPanel === null) return;
    openPanel = null;
    for (const box of document.querySelectorAll('.filter-pop')) box.hidden = true;
    for (const btn of document.querySelectorAll('.popover-host [aria-expanded="true"]')) {
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.body.click();
  });
}

/* A button with a panel underneath it, closing on a click elsewhere. */
function withPanel(button, panel, key) {
  bindCloser();
  const shown = openPanel === key;
  const box = h('div', { class: 'filter-pop', hidden: !shown }, panel);
  const host = h('span', { class: 'popover-host' }, button, box);
  button.setAttribute('aria-expanded', String(shown));
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = box.hidden;
    for (const other of document.querySelectorAll('.filter-pop')) if (other !== box) other.hidden = true;
    box.hidden = !open;
    openPanel = open ? key : null;
    button.setAttribute('aria-expanded', String(open));
  });
  return host;
}

function regionField(current) {
  return h('label', { class: 'inline-field', title: 'Region' },
    h('span', { class: 'visually-hidden', text: 'Region' }),
    h('select', {
      class: 'select',
      'aria-label': 'Region',
      onchange: (e) => setParams({ region: e.target.value, p: null })
    }, ...REGIONS.map((r) => h('option', { value: r.id, selected: r.id === current, text: r.label }))));
}

/* One chip per group: the name toggles the whole group, the chevron opens it. */
/* Farm centre — offered, and switched off.
 *
 * ADAFSA groups its holdings under farm centres and its officers search by
 * them; we asked for farm ids and coordinates and nothing else. Showing the
 * control disabled says both things at once: the platform is built to filter by
 * it, and the data has not arrived. Hiding it would say only the second, and
 * only to whoever thought to ask. */
function farmCentreField() {
  const select = h('select', {
    class: 'select', disabled: true, 'aria-label': 'Farm centre',
    title: 'Farm centres are not in the data ADAFSA has provided yet.'
  }, h('option', { text: 'All farm centres' }));
  return h('label', { class: 'inline-field is-disabled', title: 'Farm centres are not in the data ADAFSA has provided yet.' },
    h('span', { class: 'visually-hidden', text: 'Farm centre' }),
    select);
}

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
      title: `Choose crops in ${category.name}`, 'aria-label': `Choose crops in ${category.name}`
    }, icon('chevronDown', { size: 12 }));
    const key = 'group:' + category.name;
    chip.append(withPanel(opener, cropFilter(tree, {
      scope, selected, only: category.name, memoryKey: key
    }), key));
  }
  return chip;
}

export function filterBar({ tree, scope = null, selection, showRegion = true }) {
  const bar = h('div', { class: 'filter-bar' });
  /* Region and farm centre are one question — where — so they sit together
   * behind a single hairline, apart from the crops. */
  if (showRegion) bar.append(h('div', { class: 'filter-where' }, regionField(selection.region), farmCentreField()));
  if (!scope || !tree) return bar;

  const groups = scopeTree(tree, scope);
  const keys = scopeKeys(tree, scope);
  const active = activeKeys(tree, scope, selection.types);
  const filtering = active.size !== keys.length;

  for (const category of groups) bar.append(groupChip(tree, scope, selection.types, category));

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
