/* The taxonomy filter.
 *
 * A permanent rail rather than a drawer, because narrowing to a crop is the
 * most common thing anyone does here. Ticking a type narrows the map, the
 * headline figures and every table on the page at the same moment, so no two
 * parts of a screen can disagree about what is being counted.
 *
 * Nothing ticked means everything, so a page never opens on an empty screen. */

import { h } from '../app/dom.js';
import { scopeTree } from '../domain/taxonomy.js';
import { setParams } from '../app/router.js';
import { int } from '../domain/format.js';

export function filterRail(tree, { scope = 'all', selected = new Set(), counts = null, note = null } = {}) {
  const visible = scopeTree(tree, scope);
  const keys = visible.flatMap((category) => category.types.map((type) => type.key));
  const anyOn = keys.some((key) => selected.has(key));

  const update = (next) => setParams({ types: next.size === keys.length ? null : next, p: null });

  const toggle = (list, on) => {
    const next = new Set(selected.size ? selected : []);
    for (const key of list) on ? next.add(key) : next.delete(key);
    update(next);
  };

  const row = (label, key, on, { bold = false, count = null } = {}) =>
    h('label', { class: ['tax-row', bold ? null : null] },
      h('input', { type: 'checkbox', checked: on, onchange: (e) => toggle(Array.isArray(key) ? key : [key], e.target.checked) }),
      h('span', { text: label }),
      count != null ? h('span', { class: 'count', text: int(count) }) : null);

  const groups = visible.map((category) => {
    const categoryKeys = category.types.map((t) => t.key);
    const allOn = categoryKeys.every((key) => selected.has(key));
    return h('div', { class: 'tax-group' },
      h('div', { class: 'tax-cat' },
        h('label', { class: 'tax-row', style: { fontWeight: 600 } },
          h('input', { type: 'checkbox', checked: anyOn && allOn, onchange: (e) => toggle(categoryKeys, e.target.checked) }),
          h('span', { class: 'swatch', style: { background: category.color } }),
          h('span', { text: category.name }),
          counts ? h('span', { class: 'count', text: int(categoryKeys.reduce((a, k) => a + (counts.get(k) || 0), 0)) }) : null)),
      category.types.length > 1
        ? h('div', { class: 'tax-types' }, ...category.types.map((type) =>
            row(type.name, type.key, anyOn ? selected.has(type.key) : false, { count: counts ? counts.get(type.key) || 0 : null })))
        : null);
  });

  return h('div', { class: 'rail-panel' },
    h('div', { class: 'rail-head' },
      h('h2', { text: 'Filter by crop' }),
      h('div', { class: 'rail-actions' },
        h('button', { class: 'link', onclick: () => update(new Set(keys)), text: 'All' }),
        h('button', { class: 'link', onclick: () => update(new Set()), text: 'Clear' }))),
    h('div', { class: 'rail-body' }, ...groups),
    h('p', { class: 'rail-note', text: note || (anyOn ? 'Filtering the whole page.' : 'Nothing ticked — showing everything.') }));
}

/* How many farms grow each type, for the counts beside the checkboxes. */
export function typeCounts(farms) {
  const counts = new Map();
  for (const farm of farms) {
    for (const crop of farm.crops) {
      if (crop.former || !crop.area) continue;
      counts.set(crop.key, (counts.get(crop.key) || 0) + 1);
    }
  }
  return counts;
}
