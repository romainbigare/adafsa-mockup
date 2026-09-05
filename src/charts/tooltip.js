/* One tooltip element per chart, shown on hover.
 *
 * An HTML chart is interactive by nature, so every plotted form here ships a
 * tooltip rather than making the reader guess at a value from an axis. */

import { h, clear } from '../app/dom.js';

export function attachTooltip(container) {
  const tip = h('div', { class: 'chart-tip', hidden: true });
  container.append(tip);

  return {
    show(x, y, title, rows) {
      clear(tip);
      tip.append(h('strong', { text: title }));
      for (const row of rows) {
        tip.append(h('div', { class: 'row' },
          row.color ? h('span', { class: 'swatch', style: { background: row.color } }) : null,
          h('span', { text: row.label }),
          h('b', { text: row.value })));
      }
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
      tip.hidden = false;
      container.classList.add('is-hovering');
    },
    hide() {
      tip.hidden = true;
      container.classList.remove('is-hovering');
    }
  };
}
