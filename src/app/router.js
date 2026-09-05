/* Routing and selection, both held in the URL.
 *
 * Region, the taxonomy selection and the comparison period live in the hash
 * alongside the route, so any view can be bookmarked, pasted into an email or
 * opened in a second tab. The production platform could do none of that, and it
 * was one of the findings in the audit; it would be a shame to rebuild it.
 *
 *   #/m/crop/change?region=alain&cmp=year&types=...
 *
 * Navigation pushes a history entry. Changing a filter replaces one, so the
 * back button steps between pages rather than through every tick of a checkbox.
 */

import { DEFAULT_REGION, regionById } from '../domain/regions.js';
import { DEFAULT_COMPARISON, comparisonById } from '../domain/periods.js';

const listeners = new Set();

export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#/, '') || '/overview';
  const [path, search = ''] = raw.split('?');
  return {
    segments: path.split('/').filter(Boolean),
    params: new URLSearchParams(search)
  };
}

export function href(segments, params = currentParams()) {
  const query = params.toString();
  return '#/' + segments.filter(Boolean).join('/') + (query ? '?' + query : '');
}

export const currentRoute = () => parseHash();
export const currentParams = () => parseHash().params;

/* The selection every page reads. Unknown values fall back rather than throw,
 * so a stale bookmark opens on something sensible instead of an error. */
export function selection(params = currentParams()) {
  const types = (params.get('types') || '').split('~').filter(Boolean);
  return {
    region: regionById(params.get('region') || DEFAULT_REGION).id,
    types: new Set(types),
    comparison: comparisonById(params.get('cmp') || DEFAULT_COMPARISON).id,
    search: params.get('q') || '',
    sort: params.get('sort') || '',
    direction: params.get('dir1') || 'increased',
    dir: params.get('dir') || '',
    subsidy: params.get('sub') || '',
    page: Math.max(1, Number(params.get('p') || 1))
  };
}

/* Only non-default values are written, so a plain link stays a plain link. */
export function paramsFor(patch, base = currentParams()) {
  const params = new URLSearchParams(base);
  for (const [key, value] of Object.entries(patch)) {
    const empty = value == null || value === '' || (value instanceof Set && value.size === 0);
    if (empty) params.delete(key);
    else if (value instanceof Set) params.set(key, [...value].join('~'));
    else params.set(key, String(value));
  }
  if (params.get('region') === DEFAULT_REGION) params.delete('region');
  if (params.get('cmp') === DEFAULT_COMPARISON) params.delete('cmp');
  return params;
}

export function setParams(patch, { replace = true } = {}) {
  const next = href(parseHash().segments, paramsFor(patch));
  if (replace) {
    history.replaceState(null, '', next);
    notify();
  } else {
    location.hash = next;
  }
}

export function go(segments, params) {
  location.hash = href(segments, params ?? new URLSearchParams());
}

export const onRouteChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const notify = () => listeners.forEach((fn) => fn(parseHash()));

export function start() {
  window.addEventListener('hashchange', notify);
  if (!location.hash) history.replaceState(null, '', '#/overview');
  notify();
}
