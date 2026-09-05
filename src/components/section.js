/* Page furniture: a titled card with optional note and tools. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';

export function section(title, { note = null, tools = [], flush = false } = {}, ...content) {
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { text: title }),
      note ? h('span', { class: 'card-note', text: note }) : null,
      tools.length ? h('div', { class: 'card-tools' }, ...tools) : null),
    h('div', { class: ['card-body', flush ? 'flush' : null] }, ...content));
}

export const intro = (text) => h('p', { class: 'section-intro', text });

export function callout(kind, text, { title = null } = {}) {
  const glyph = kind === 'act' ? 'alert' : kind === 'watch' ? 'alert' : 'info';
  return h('div', { class: `callout callout-${kind}` }, icon(glyph),
    h('div', {}, title ? h('strong', { text: title }) : null, h('p', { text })));
}

export function emptyState(title, ...lines) {
  return h('div', { class: 'empty' }, h('strong', { text: title }), ...lines.map((line) =>
    typeof line === 'string' ? h('p', { text: line }) : line));
}

/* A small "how this is worked out" panel. The review put the model's formula
 * inputs behind one of these rather than on the page — they are parameters, not
 * deliverables. */
export function infoPopover(label, title, entries) {
  const panel = h('div', { class: 'popover', hidden: true },
    h('h3', { text: title }),
    h('dl', {}, ...entries.flatMap(([term, definition]) => [h('dt', { text: term }), h('dd', { text: definition })])));

  const button = h('button', {
    class: 'btn btn-sm', 'aria-expanded': 'false',
    onclick: () => {
      const open = panel.hidden;
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
    }
  }, icon('info', { size: 14 }), h('span', { text: label }));

  const host = h('span', { class: 'popover-host' }, button, panel);
  document.addEventListener('click', (event) => {
    if (!host.contains(event.target)) { panel.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  });
  return host;
}
