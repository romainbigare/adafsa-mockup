/* Vertical columns over a fixed set of buckets — the twelve months of a crop
 * calendar, or the eight quarters of a change page.
 *
 * One or two series. Two get a legend and are drawn side by side with a two
 * pixel gap, never stacked on top of each other and never on two y-scales. */

import { h } from '../app/dom.js';
import { s, niceScale } from './svg.js';
import { attachTooltip } from './tooltip.js';
import { INK } from '../domain/palette.js';

const W = 720;
const H = 190;
const PAD = { top: 10, right: 8, bottom: 26, left: 46 };

export function columns(labels, series, { format = (v) => String(Math.round(v)), height = H } = {}) {
  const container = h('figure', { class: 'chart' });
  const plotW = W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const scale = niceScale(Math.max(...series.flatMap((set) => set.values.map((v) => v || 0))));

  if (series.length > 1) {
    container.append(h('div', { class: 'chart-legend' }, ...series.map((set) =>
      h('span', {}, h('span', { class: 'swatch', style: { background: set.color } }), h('span', { text: set.label })))));
  }

  const svg = s('svg', { viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': series.map((x) => x.label).join(' and ') });
  const y = (value) => PAD.top + plotH - (value / scale.max) * plotH;

  const grid = s('g', { class: 'grid' });
  const axis = s('g', { class: 'axis' });
  for (const tick of scale.ticks) {
    grid.append(s('line', { x1: PAD.left, x2: W - PAD.right, y1: y(tick), y2: y(tick) }));
    axis.append(s('text', { x: PAD.left - 8, y: y(tick) + 4, 'text-anchor': 'end', text: format(tick) }));
  }
  svg.append(grid, axis);

  const slot = plotW / labels.length;
  const barW = Math.max(3, (slot - 6) / series.length - 2);
  const marks = s('g', {});
  const tip = attachTooltip(container);

  labels.forEach((label, i) => {
    const groupX = PAD.left + slot * i + 3;
    series.forEach((set, j) => {
      const value = set.values[i] || 0;
      const barH = Math.max(value > 0 ? 2 : 0, (value / scale.max) * plotH);
      marks.append(s('rect', {
        class: 'mark', x: groupX + j * (barW + 2), y: PAD.top + plotH - barH,
        width: barW, height: barH, rx: Math.min(4, barW / 2), fill: set.color
      }));
    });
    /* One hit target per bucket, wider than the bars themselves. */
    const hit = s('rect', { x: PAD.left + slot * i, y: PAD.top, width: slot, height: plotH, fill: 'transparent' });
    hit.addEventListener('pointerenter', () => {
      const box = container.getBoundingClientRect();
      const svgBox = svg.getBoundingClientRect();
      const px = ((PAD.left + slot * (i + 0.5)) / W) * svgBox.width + (svgBox.left - box.left);
      tip.show(px, svgBox.top - box.top + (y(Math.max(...series.map((set) => set.values[i] || 0))) / height) * svgBox.height,
        label, series.map((set) => ({ label: set.label, value: format(set.values[i] || 0), color: set.color })));
    });
    hit.addEventListener('pointerleave', () => tip.hide());
    marks.append(hit);

    if (labels.length <= 12 || i % 2 === 0) {
      svg.append(s('text', { class: 'axis-label', x: PAD.left + slot * (i + 0.5), y: height - 8, 'text-anchor': 'middle', 'font-size': 11, fill: INK.muted, text: label }));
    }
  });

  svg.append(marks);
  svg.append(s('line', { x1: PAD.left, x2: W - PAD.right, y1: PAD.top + plotH, y2: PAD.top + plotH, stroke: INK.grid }));
  container.append(svg);
  return container;
}
