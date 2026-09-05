/* Page furniture: a titled card.
 *
 * `half` puts the card in one column of a two-column grid, so a narrow chart
 * does not stretch across the whole page. `icon` is a quiet glyph beside the
 * title — enough to tell one card from another at a glance. */

import { h } from '../app/dom.js';
import { icon as glyph } from '../app/icons.js';

export function section(title, options = {}, ...content) {
  const { note = null, tools = [], flush = false, half = false, icon = null } = options;
  return h('section', { class: ['card', half ? 'half' : null] },
    h('div', { class: 'card-head' },
      icon ? glyph(icon, { size: 15 }) : null,
      h('h2', { text: title }),
      note ? h('span', { class: 'card-note', text: note }) : null,
      tools.length ? h('div', { class: 'card-tools' }, ...tools) : null),
    h('div', { class: ['card-body', flush ? 'flush' : null] }, ...content));
}

export const intro = (text) => h('p', { class: 'section-intro', text });

export function callout(kind, text, { title = null } = {}) {
  return h('div', { class: `callout callout-${kind}` }, glyph(kind === 'info' ? 'info' : 'alert'),
    h('div', {}, title ? h('strong', { text: title }) : null, h('p', { text })));
}

export function emptyState(title, ...lines) {
  return h('div', { class: 'empty' }, h('strong', { text: title }), ...lines.map((line) =>
    typeof line === 'string' ? h('p', { text: line }) : line));
}

/* A small "how this is worked out" panel for the model's inputs. */
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
  }, glyph('info', { size: 14 }), h('span', { text: label }));

  const host = h('span', { class: 'popover-host' }, button, panel);
  document.addEventListener('click', (event) => {
    if (!host.contains(event.target)) { panel.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  });
  return host;
}
