/* Crop Monitoring — fallow land.
 *
 * Three states, not two. Land that is being farmed; land resting less than a
 * year, which is waiting for its next crop; and land resting more than a year,
 * which is simply not being used. The middle one is a season and the last one
 * is a question for ADAFSA, so they are never added together here.
 *
 * No map. A reader who wants to know where a farm is reads its farm centre,
 * and the ranked table below names every holding. */

import { section, callout } from '../../components/section.js';
import { h } from '../../app/dom.js';
import { figures } from '../../components/figures.js';
import { dataTable, farmColumns } from '../../components/dataTable.js';
import { stackedColumns } from '../../charts/stackedColumns.js';
import { barList } from '../../charts/barList.js';
import { query } from '../../data/store.js';
import { LAND_STATE, landState } from '../../domain/bands.js';
import { RECENT_QUARTERS, WINDOW_QUARTERS, QUARTERS } from '../../domain/periods.js';
import { COMPARE } from '../../domain/palette.js';
import { int, dec, pct, signed, signedPct } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';

const OFFSET = QUARTERS.length - WINDOW_QUARTERS;
const NOW = QUARTERS.length - 1;
const YEAR_AGO = NOW - 4;

const SERIES_OF = {
  cultivated: (farm) => farm.cultivationSeries,
  restingRecent: (farm) => farm.fallowRecentSeries,
  restingLong: (farm) => farm.fallowLongSeries
};

export function render({ selection }) {
  /* No crop filter here. The page counts land, not what is grown on it, so a
   * crop toggle would narrow the farms without changing the question — and a
   * reader who ticked one would be looking at a different number under the same
   * heading. */
  const farms = query({ region: selection.region });

  const totalAt = (state, index) =>
    farms.reduce((total, farm) => total + (SERIES_OF[state](farm)?.[index] ?? 0), 0);

  const bands = LAND_STATE.map((state) => ({
    label: state.label,
    color: state.color,
    values: RECENT_QUARTERS.map((_, i) => totalAt(state.id, OFFSET + i))
  }));

  const holding = farms.reduce((total, farm) => total + farm.area, 0);
  const longNow = totalAt('restingLong', NOW);
  const recentNow = totalAt('restingRecent', NOW);
  const unutilised = farms.filter((farm) => farm.fallowLong > 0.05);

  /* The year-on-year movement of each state, which is the number the review
   * asked to sit beside the stack. */
  const movement = LAND_STATE.map((state) => {
    const before = totalAt(state.id, YEAR_AGO);
    const after = totalAt(state.id, NOW);
    return {
      label: state.label,
      value: Math.abs(after - before),
      amount: `${signed(after - before, 1)} dun`,
      amountColor: after >= before ? COMPARE.up : COMPARE.down,
      color: state.color,
      moved: before > 0.05 ? ((after - before) / before) * 100 : null
    };
  });

  return {
    content: [
      figures([
        { value: int(longNow), unit: 'dun', label: 'Fallow over 12 months', icon: 'land', tone: longNow ? 'watch' : null },
        { value: int(recentNow), unit: 'dun', label: 'Fallow under 12 months', icon: 'land' },
        { value: pct(holding ? ((longNow + recentNow) / holding) * 100 : 0, 1), label: 'Share of all farm area', icon: 'ruler' },
        { value: int(unutilised.length), label: 'Farms with unused land', icon: 'farms', tone: unutilised.length ? 'watch' : null }
      ]),

      unutilised.length
        ? callout('watch', `${int(unutilised.length)} farms hold land that has been resting for more than a year — ${dec(longNow, 0)} dunums in total.`)
        : callout('info', 'No farm holds land that has been resting for more than a year.'),

      section('Land over the last six quarters', { icon: 'crop', half: true, note: 'Dunums, in three states.' },
        stackedColumns(RECENT_QUARTERS.map((quarter) => quarter.label), bands, {
          format: (v) => int(v), half: true, totalLabel: 'All farm land'
        })),

      section('Change on a year ago', { icon: 'trend', half: true, note: 'Dunums gained or lost in each state.' },
        barList(movement.map((row) => ({
          ...row,
          amount: `${row.amount}${row.moved == null ? '' : ` · ${signedPct(row.moved)}`}`
        })), { limit: LAND_STATE.length })),

      section('Every farm', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(farms, {
          selection,
          searchable: true,
          csvName: 'fallow-land',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            farmColumns.centre,
            { key: 'planted', label: 'Under cultivation', align: 'num', value: (f) => f.cultivatedArea, cell: (f) => dec(f.cultivatedArea, 1) },
            { key: 'recent', label: 'Fallow < 12 months', align: 'num', value: (f) => f.fallowRecent, cell: (f) => dec(f.fallowRecent, 1) },
            { key: 'long', label: 'Fallow > 12 months', align: 'num', defaultSort: true, value: (f) => f.fallowLong, cell: (f) => dec(f.fallowLong, 1) },
            { key: 'state', label: 'Mostly', value: (f) => landState(f)?.label || '—',
              cell: (f) => { const state = landState(f); return state ? h('span', { class: 'chip', style: { background: state.color + '22', color: state.color } }, state.label) : '—'; } }
          ]
        }))
    ]
  };
}
