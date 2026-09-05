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
