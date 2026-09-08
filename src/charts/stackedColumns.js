/* Stacked columns over a fixed set of buckets.
 *
 * The review asked for this by name and set its limits at the same time:
 * stacking only reads when a group has three or four members, so it is used for
 * cereals and for fodder, where it does, and never for open-field vegetables,
 * where forty crops would turn one column into a colour chart nobody can read.
 *
 * Every band carries its own colour and its own legend entry; the tooltip gives
 * the whole column, band by band, with the total on top — which is the reading
 * a stack is bad at and a number is good at. */

import { h } from '../app/dom.js';
import { s, niceScale } from './svg.js';
import { attachTooltip } from './tooltip.js';
import { INK } from '../domain/palette.js';

const H = 210;
const PAD = { top: 10, right: 8, bottom: 26, left: 52 };

export function stackedColumns(labels, series, {
  format = (v) => String(Math.round(v)),
  height = H,
  half = false,
  totalLabel = 'Total'
} = {}) {
  const W = half ? 440 : 720;
  const container = h('figure', { class: 'chart' });
  const plotW = W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const totals = labels.map((_, i) => series.reduce((a, set) => a + (set.values[i] || 0), 0));
  const scale = niceScale(Math.max(...totals, 0));

  container.append(h('div', { class: 'chart-legend' }, ...series.map((set) =>
    h('span', {}, h('span', { class: 'swatch', style: { background: set.color } }), h('span', { text: set.label })))));

  const svg = s('svg', { viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': series.map((x) => x.label).join(', ') });
  const y = (value) => PAD.top + plotH - (value / scale.max) * plotH;

  const grid = s('g', { class: 'grid' });
  const axis = s('g', { class: 'axis' });
  for (const tick of scale.ticks) {
    grid.append(s('line', { x1: PAD.left, x2: W - PAD.right, y1: y(tick), y2: y(tick) }));
    axis.append(s('text', { x: PAD.left - 8, y: y(tick) + 4, 'text-anchor': 'end', text: format(tick) }));
  }
  svg.append(grid, axis);

  const slot = plotW / labels.length;
  const barW = Math.min(46, Math.max(6, slot - 14));
  const marks = s('g', {});
  const tip = attachTooltip(container);

  labels.forEach((label, i) => {
    const x = PAD.left + slot * i + (slot - barW) / 2;
    let base = 0;
    series.forEach((set) => {
      const value = set.values[i] || 0;
      if (value <= 0) return;
      const top = y(base + value);
      const bottom = y(base);
      marks.append(s('rect', {
        class: 'mark', x, y: top, width: barW, height: Math.max(1, bottom - top), fill: set.color
      }));
      base += value;
    });

    const hit = s('rect', { x: PAD.left + slot * i, y: PAD.top, width: slot, height: plotH, fill: 'transparent' });
    hit.addEventListener('pointerenter', () => {
      const box = container.getBoundingClientRect();
      const svgBox = svg.getBoundingClientRect();
      const px = ((PAD.left + slot * (i + 0.5)) / W) * svgBox.width + (svgBox.left - box.left);
      /* Read top band first, so the tooltip runs the same way as the stack. */
      const lines = series.map((set) => ({ label: set.label, value: format(set.values[i] || 0), color: set.color })).reverse();
      tip.show(px, svgBox.top - box.top + (y(totals[i]) / height) * svgBox.height, label,
        [{ label: totalLabel, value: format(totals[i]) }, ...lines]);
    });
    hit.addEventListener('pointerleave', () => tip.hide());
    marks.append(hit);

    svg.append(s('text', {
      class: 'axis-label', x: PAD.left + slot * (i + 0.5), y: height - 8,
      'text-anchor': 'middle', 'font-size': 11, fill: INK.muted, text: label
    }));
  });

  svg.append(marks);
  svg.append(s('line', { x1: PAD.left, x2: W - PAD.right, y1: PAD.top + plotH, y2: PAD.top + plotH, stroke: INK.grid }));
  container.append(svg);
  return container;
}
