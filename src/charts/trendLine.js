/* A trend line over the quarters.
 *
 * The review asked for a line and hard numbers where the question is "has this
 * improved", and specifically not a map. Markers appear on hover with a
 * crosshair, so any point can be read exactly. */

import { h } from '../app/dom.js';
import { s, niceScale, niceRange } from './svg.js';
import { attachTooltip } from './tooltip.js';
import { INK } from '../domain/palette.js';

const W = 720;
const H = 210;
const PAD = { top: 12, right: 14, bottom: 26, left: 48 };

export function trendLine(labels, series, { format = (v) => String(Math.round(v)), height = H, zeroBased = true } = {}) {
  const container = h('figure', { class: 'chart' });
  const plotW = W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const values = series.flatMap((set) => set.values.filter((v) => v != null));
  const scale = zeroBased
    ? { min: 0, ...niceScale(Math.max(...values, 1)) }
    : niceRange(Math.min(...values), Math.max(...values));
  const y = (value) => PAD.top + plotH - ((value - scale.min) / (scale.max - scale.min)) * plotH;
  const x = (i) => PAD.left + (plotW / Math.max(1, labels.length - 1)) * i;

  if (series.length > 1) {
    container.append(h('div', { class: 'chart-legend' }, ...series.map((set) =>
      h('span', {}, h('span', { class: 'swatch', style: { background: set.color } }), h('span', { text: set.label })))));
  }

  const svg = s('svg', { viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': series.map((set) => set.label).join(' and ') });
  const grid = s('g', { class: 'grid' });
  const axis = s('g', { class: 'axis' });
  for (const tick of scale.ticks.filter((t) => t >= scale.min && t <= scale.max)) {
    grid.append(s('line', { x1: PAD.left, x2: W - PAD.right, y1: y(tick), y2: y(tick) }));
    axis.append(s('text', { x: PAD.left - 8, y: y(tick) + 4, 'text-anchor': 'end', text: format(tick) }));
  }
  svg.append(grid, axis);

  labels.forEach((label, i) => {
    svg.append(s('text', { x: x(i), y: height - 8, 'text-anchor': 'middle', 'font-size': 11, fill: INK.muted, text: label }));
  });

  for (const set of series) {
    const path = set.values.map((value, i) => (value == null ? null : `${i && set.values[i - 1] != null ? 'L' : 'M'}${x(i)} ${y(value)}`)).filter(Boolean).join(' ');
    svg.append(s('path', { class: 'line-mark', d: path, stroke: set.color }));
  }

  const crosshair = s('line', { class: 'crosshair', y1: PAD.top, y2: PAD.top + plotH, x1: 0, x2: 0, opacity: 0 });
  const dots = s('g', {});
  svg.append(crosshair, dots);

  const tip = attachTooltip(container);
  const hit = s('rect', { x: PAD.left, y: PAD.top, width: plotW, height: plotH, fill: 'transparent' });
  hit.addEventListener('pointermove', (event) => {
    const box = svg.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const index = Math.max(0, Math.min(labels.length - 1, Math.round(((ratio * W) - PAD.left) / (plotW / Math.max(1, labels.length - 1)))));
    crosshair.setAttribute('x1', x(index));
    crosshair.setAttribute('x2', x(index));
    crosshair.setAttribute('opacity', 1);
    dots.replaceChildren(...series.filter((set) => set.values[index] != null).map((set) =>
      s('circle', { class: 'dot', cx: x(index), cy: y(set.values[index]), r: 5, fill: set.color })));
    const containerBox = container.getBoundingClientRect();
    tip.show((x(index) / W) * box.width + (box.left - containerBox.left), box.top - containerBox.top + (y(Math.max(...series.map((set) => set.values[index] ?? 0))) / height) * box.height,
      labels[index], series.map((set) => ({ label: set.label, value: set.values[index] == null ? '—' : format(set.values[index]), color: set.color })));
  });
  hit.addEventListener('pointerleave', () => {
    crosshair.setAttribute('opacity', 0);
    dots.replaceChildren();
    tip.hide();
  });
  svg.append(hit);
  svg.append(s('line', { x1: PAD.left, x2: W - PAD.right, y1: PAD.top + plotH, y2: PAD.top + plotH, stroke: INK.grid }));

  container.append(svg);
  return container;
}
