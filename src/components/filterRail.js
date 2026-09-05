/* The crop filter.
 *
 * Groups are closed to begin with, so the rail is a short list of six lines
 * rather than a wall of forty. A chevron opens a group; the tick box selects
 * the whole of it without opening anything.
 *
 * Everything is ticked when a page opens, so the rail shows what is being
 * counted rather than an empty list. Unticking narrows the map, the figures and
 * every table at the same moment.
 *
 * Which groups are open, and where the list is scrolled, both survive a
 * re-render: the page redraws on every tick, and a list that closed itself or
 * jumped to the top each time would be unusable. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { scopeTree } from '../domain/taxonomy.js';
import { setParams } from '../app/router.js';
import { int } from '../domain/format.js';

const scrollMemory = new Map();
const openGroups = new Set();

/* "Nothing selected" and "not filtered yet" have to be different states, or the
 * None button would silently mean All. This sentinel matches no crop, so an
 * empty selection genuinely empties the page. */
const NONE = '-';

export function filterRail(tree, { scope = 'all', selected = new Set(), counts = null, note = null } = {}) {
  const visible = scopeTree(tree, scope);
  const keys = visible.flatMap((category) => category.types.map((type) => type.key));
  const active = selected.size ? new Set([...selected].filter((key) => keys.includes(key))) : new Set(keys);

  const apply = (next) => setParams({
    types: next.size === keys.length ? null : next.size === 0 ? new Set([NONE]) : next,
    p: null
  });
  const toggle = (list, on) => {
    const next = new Set(active);
    for (const key of list) on ? next.add(key) : next.delete(key);
    apply(next);
  };

  const body = h('div', { class: 'rail-body' });

  function draw() {
    body.replaceChildren(...visible.map((category) => {
      const categoryKeys = category.types.map((type) => type.key);
      const on = categoryKeys.filter((key) => active.has(key)).length;
      const isOpen = openGroups.has(category.name);
      const hasTypes = category.types.length > 1;

      const box = h('input', {
        type: 'checkbox', checked: on === categoryKeys.length,
        onchange: (e) => toggle(categoryKeys, e.target.checked)
      });
      if (on > 0 && on < categoryKeys.length) box.indeterminate = true;

      const chevron = hasTypes
        ? h('button', {
            class: 'tax-toggle', 'aria-expanded': String(isOpen),
            'aria-label': `${isOpen ? 'Hide' : 'Show'} the crops in ${category.name}`,
            onclick: () => { isOpen ? openGroups.delete(category.name) : openGroups.add(category.name); draw(); }
          }, icon('chevronDown', { size: 13 }))
        : h('span', { class: 'tax-toggle-spacer' });

      return h('div', { class: 'tax-group' },
        h('div', { class: 'tax-row tax-cat' },
          chevron,
          h('label', { class: 'tax-label' }, box,
            h('span', { class: 'swatch', style: { background: category.color } }),
            h('span', { text: category.name })),
          counts ? h('span', { class: 'count', text: int(categoryKeys.reduce((a, k) => a + (counts.get(k) || 0), 0)) }) : null),
        hasTypes && isOpen
          ? h('div', { class: 'tax-types' }, ...category.types.map((type) =>
              h('div', { class: 'tax-row' },
                h('label', { class: 'tax-label' },
                  h('input', { type: 'checkbox', checked: active.has(type.key), onchange: (e) => toggle([type.key], e.target.checked) }),
                  h('span', { text: type.name })),
                counts ? h('span', { class: 'count', text: int(counts.get(type.key) || 0) }) : null)))
          : null);
    }));
  }
  draw();

  const memoryKey = `rail:${scope}`;
  body.addEventListener('scroll', () => scrollMemory.set(memoryKey, body.scrollTop));
  requestAnimationFrame(() => { body.scrollTop = scrollMemory.get(memoryKey) || 0; });

  return h('div', { class: 'rail-panel' },
    h('div', { class: 'rail-head' },
      h('h2', { text: 'Crops' }),
      h('div', { class: 'rail-actions' },
        h('button', { class: 'link', onclick: () => apply(new Set(keys)), text: 'All' }),
        h('button', { class: 'link', onclick: () => apply(new Set()), text: 'None' }))),
    h('div', { class: 'rail-columns' },
      h('span', { text: 'Crop group' }),
      counts ? h('span', { text: 'Farms' }) : null),
    body,
    note ? h('p', { class: 'rail-note', text: note }) : null);
}

/* How many farms grow each type, for the counts beside the boxes. */
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
