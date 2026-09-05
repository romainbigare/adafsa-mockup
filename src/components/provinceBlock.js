/* The province table that sits under every module's emirate summary.
 *
 * Reporting runs emirate, then province, then farm on every page. Each province
 * is answerable to a different person, so the middle level is never optional. */

import { h } from '../app/dom.js';
import { byProvince } from '../domain/aggregate.js';
import { int } from '../domain/format.js';
import { href, currentParams, paramsFor } from '../app/router.js';
import { currentRoute } from '../app/router.js';

export function provinceBlock(farms, columns, { total = null } = {}) {
  const measures = Object.fromEntries(columns.map((col) => [col.key, col.value]));
  const rows = byProvince(farms, measures);
  const segments = currentRoute().segments;

  return h('div', { class: 'table-wrap' }, h('table', { class: 'grid' },
    h('thead', {}, h('tr', {},
      h('th', { text: 'Province' }),
      h('th', { class: 'num', text: 'Farms' }),
      ...columns.map((col) => h('th', { class: 'num', text: col.label })))),
    h('tbody', {}, ...rows.map((row) => h('tr', {},
      h('td', { class: 'name' }, h('a', {
        href: href(segments, paramsFor({ region: row.id, p: null }, currentParams())),
        text: row.label
      })),
      h('td', { class: 'num', text: int(row.farms) }),
      ...columns.map((col) => h('td', { class: 'num', text: col.format(row[col.key]) }))))),
    h('tfoot', {}, h('tr', {},
      h('td', { text: 'Abu Dhabi Emirate' }),
      h('td', { class: 'num', text: int(total?.farms ?? farms.length) }),
      ...columns.map((col) => h('td', { class: 'num', text: col.format(col.value(farms)) }))))));
}
