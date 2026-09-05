/* The crop taxonomy as a list of tick boxes.
 *
 * It appears in two places, both of them inside the filter bar: the panel
 * behind "All crops", where every group is open so a whole group or a single
 * variety can be reached in one movement, and the small panel behind a group
 * chip, which shows that group's varieties on their own.
 *
 * Everything is ticked when a page opens, so the filter shows what is being
 * counted rather than an empty list. Unticking narrows the map, the figures and
 * every table at the same moment. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { scopeTree } from '../domain/taxonomy.js';
import { setParams } from '../app/router.js';

const openGroups = new Set();
const scrollMemory = new Map();

/* "Nothing selected" and "not filtered yet" have to be different states, or the
 * None button would silently mean All. This sentinel matches no crop, so an
 * empty selection genuinely empties the page. */
export const NONE = '-';

export const scopeKeys = (tree, scope) => scopeTree(tree, scope).flatMap((c) => c.types.map((t) => t.key));

/* The set the page is actually counting: what was chosen, or everything. */
export const activeKeys = (tree, scope, selected) => {
  const keys = scopeKeys(tree, scope);
  return selected.size ? new Set([...selected].filter((k) => keys.includes(k))) : new Set(keys);
};

export function applySelection(tree, scope, next) {
  const keys = scopeKeys(tree, scope);
  setParams({
    types: next.size === keys.length ? null : next.size === 0 ? new Set([NONE]) : next,
    p: null
  });
}

/* A checkbox list of one category's varieties. */
function typeRows(category, active, onToggle) {
  return category.types.map((type) =>
    h('div', { class: 'tax-row' },
      h('label', { class: 'tax-label' },
        h('input', { type: 'checkbox', checked: active.has(type.key), onchange: (e) => onToggle([type.key], e.target.checked) }),
        h('span', { text: type.name }))));
}

/* The full tree. `only` narrows it to a single group, for a chip's own panel. */
export function cropFilter(tree, { scope = 'all', selected = new Set(), only = null, memoryKey = 'all' } = {}) {
  const visible = scopeTree(tree, scope).filter((c) => !only || c.name === only);
  const active = activeKeys(tree, scope, selected);
  const toggle = (list, on) => {
    const next = new Set(active);
    for (const key of list) on ? next.add(key) : next.delete(key);
    applySelection(tree, scope, next);
  };

  const body = h('div', { class: 'rail-body' });

  function draw() {
    body.replaceChildren(...visible.map((category) => {
      const categoryKeys = category.types.map((t) => t.key);
      const on = categoryKeys.filter((k) => active.has(k)).length;
      /* Inside a single-group panel there is nothing to fold away. */
      const isOpen = only ? true : openGroups.size ? openGroups.has(category.name) : true;
      const foldable = !only && category.types.length > 1;

      const box = h('input', {
        type: 'checkbox', checked: on === categoryKeys.length,
        onchange: (e) => toggle(categoryKeys, e.target.checked)
      });
      if (on > 0 && on < categoryKeys.length) box.indeterminate = true;

      return h('div', { class: 'tax-group' },
        only ? null : h('div', { class: 'tax-row tax-cat' },
          foldable
            ? h('button', {
                class: 'tax-toggle', 'aria-expanded': String(isOpen),
                'aria-label': `${isOpen ? 'Hide' : 'Show'} the crops in ${category.name}`,
                onclick: () => {
                  if (!openGroups.size) visible.forEach((c) => openGroups.add(c.name));
                  isOpen ? openGroups.delete(category.name) : openGroups.add(category.name);
                  draw();
                }
              }, icon('chevronDown', { size: 13 }))
            : h('span', { class: 'tax-toggle-spacer' }),
          h('label', { class: 'tax-label' }, box,
            h('span', { class: 'swatch', style: { background: category.color } }),
            h('span', { text: category.name }))),
        category.types.length > 1 && isOpen
          ? h('div', { class: only ? null : 'tax-types' }, ...typeRows(category, active, toggle))
          : null);
    }));
  }
  draw();

  body.addEventListener('scroll', () => scrollMemory.set(memoryKey, body.scrollTop));
  requestAnimationFrame(() => { body.scrollTop = scrollMemory.get(memoryKey) || 0; });

  const keys = only ? visible.flatMap((c) => c.types.map((t) => t.key)) : scopeKeys(tree, scope);
  return h('div', { class: 'rail-panel' },
    h('div', { class: 'rail-head' },
      h('h2', { text: only || 'All crops' }),
      h('div', { class: 'rail-actions' },
        h('button', { class: 'link', onclick: () => toggle(keys, true), text: 'All' }),
        h('button', { class: 'link', onclick: () => toggle(keys, false), text: 'None' }))),
    h('div', { class: 'rail-columns' }, h('span', { text: only ? 'Crop' : 'Crop group' })),
    body);
}
