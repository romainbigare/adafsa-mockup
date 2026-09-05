/* SVG helpers. */

export const NS = 'http://www.w3.org/2000/svg';

export function s(tag, attrs = {}, ...children) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'text') node.textContent = String(value);
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) if (child) node.append(child);
  return node;
}

/* An axis that frames the data rather than the origin.
 *
 * An average that moves between 84 and 86 drawn from zero is a flat line, which
 * tells the reader nothing. This pads either side of the range and rounds the
 * ends to something quotable. */
export function niceRange(min, max, ticks = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
  let span = max - min;
  if (span <= 0) span = Math.abs(max) * 0.2 || 1;
  const pad = span * 0.45;
  const step = niceStep((span + pad * 2) / ticks);
  const low = Math.floor((min - pad) / step) * step;
  const high = Math.ceil((max + pad) / step) * step;
  const out = [];
  for (let v = low; v <= high + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return { min: low, max: high, ticks: out };
}

function niceStep(raw) {
  const magnitude = 10 ** Math.floor(Math.log10(Math.abs(raw) || 1));
  return ([1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((v) => v >= raw) || magnitude * 10);
}

/* A "nice" upper bound and a small number of ticks, so an axis reads in round
 * numbers rather than in whatever the maximum happened to be. */
export function niceScale(max, ticks = 4) {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] };
  const raw = max / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((v) => v >= raw) || magnitude * 10;
  const top = Math.ceil(max / step) * step;
  const out = [];
  for (let v = 0; v <= top + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return { max: top, ticks: out };
}
