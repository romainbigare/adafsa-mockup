/* Yield Optimisation — the crop calendar.
 *
 * Two bar charts for the crop you pick: dunums by month, and farms by month.
 * They read as a curve rather than a block, because a few growers plant early
 * and a few late — no tomatoes in August, six thousand farms of them in
 * September.
 *
 * There is no separate Abu Dhabi crop calendar to reconcile against. The crop
 * calendar is what the farms are doing, which is what this page draws. */

import { h } from '../../app/dom.js';
import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { columns as columnChart } from '../../charts/columns.js';
import { filterRail, typeCounts } from '../../components/filterRail.js';
import { query, taxonomyTree, cropRows } from '../../data/store.js';
import { monthlyCurve, windowFor, CYCLE_MONTHS } from '../../domain/cropCalendar.js';
import { categoryColor, COMPARE, INK } from '../../domain/palette.js';
import { int, dec } from '../../domain/format.js';
import { MONTHS, TODAY } from '../../domain/periods.js';

/* The strip above the charts: every crop in the selection against the twelve
 * months, so the shape of the year is legible before anything is picked. */
function calendarStrip(crops) {
  const month = TODAY.getUTCMonth();
  return h('div', { class: 'calendar-strip' },
    h('div', { class: 'months' }, h('span', {}), ...MONTHS.map((name, i) =>
      h('span', { style: { textAlign: 'center', fontWeight: i === month ? '700' : '400', color: i === month ? INK.primary : null }, text: name }))),
    ...crops.map((crop) => {
      const curve = monthlyCurve(crop.category, crop.type);
      return h('div', { class: 'band' },
        h('span', { class: 'label', title: crop.type, text: crop.type }),
        ...curve.map((weight) => h('span', {
          class: 'cell',
          title: weight > 0 ? `${crop.type} in the ground` : '',
          style: weight > 0 ? { background: categoryColor(crop.category), opacity: String(0.3 + weight * 0.7) } : {}
        })));
    }));
}

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const rows = cropRows(farms, { types: selection.types });

  const crops = [...new Map(rows.map((row) => [row.type, { type: row.type, category: row.category }])).values()]
    .sort((a, b) => a.category.localeCompare(b.category) || a.type.localeCompare(b.type));

  /* Dunums and farms by month, summed across whatever is selected. */
  const dunumsByMonth = MONTHS.map((_, month) => rows.reduce((total, row) => total + row.monthly[month], 0));
  const farmsByMonth = MONTHS.map((_, month) => {
    const ids = new Set();
    for (const row of rows) if (row.monthly[month] > 0.01) ids.add(row.farm.fid);
    return ids.size;
  });

  const picked = selection.types.size ? [...new Set(rows.map((row) => row.type))] : [];
  const heading = picked.length === 1 ? picked[0] : picked.length ? `${picked.length} selected crops` : 'every crop';
  const peak = MONTHS[dunumsByMonth.indexOf(Math.max(...dunumsByMonth))];
  const quiet = MONTHS[dunumsByMonth.indexOf(Math.min(...dunumsByMonth))];

  return {
    asOf: TODAY,
    rail: filterRail(taxonomyTree(), {
      scope: 'all', selected: selection.types, counts: typeCounts(all),
      note: 'Pick a crop to see its year on its own.'
    }),
    content: [
      figures([
        { value: int(crops.length), label: 'Crops in the selection' },
        { value: peak, label: 'Busiest month by area' },
        { value: quiet, label: 'Quietest month' },
        { value: int(Math.max(...farmsByMonth)), label: 'Farms growing at the peak' }
      ]),

      section(`Dunums by month — ${heading}`, { note: 'A curve rather than a block: a few growers plant early and a few late.' },
        columnChart(MONTHS, [{ label: 'Dunums in the ground', color: COMPARE.current, values: dunumsByMonth }], { format: (v) => dec(v, 0) })),

      section(`Farms by month — ${heading}`, {},
        columnChart(MONTHS, [{ label: 'Farms growing', color: categoryColor('Fodder'), values: farmsByMonth }], { format: int })),

      section('The year at a glance', { note: 'Every crop in the selection, month by month.' },
        crops.length
          ? calendarStrip(crops)
          : intro('No crops in the current selection.')),

      intro('Cycle lengths sit behind these curves: three months for an open-field vegetable, four for a cereal, and the whole year for fodder and the trees. They are what the seasonal water budget is costed on.')
    ]
  };
}
