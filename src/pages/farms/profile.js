/* Individual Farms — the farm profile.
 *
 * Page one of two: basic statistics. What they are growing, the breakdown,
 * the trees, the structures, irrigation efficiency, water and yield.
 *
 * What is deliberately absent is as much the point as what is here. No weather,
 * no soil moisture, no growth phase, no water scheduler, no data confidence and
 * no violations. Those belong to the farmer's own product, not to a government
 * platform, and we do not collect most of them. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { mapBand } from '../../components/mapBand.js';
import { barList } from '../../charts/barList.js';
import { stackedColumns } from '../../charts/stackedColumns.js';
import { icon } from '../../app/icons.js';
import { farmById } from '../../data/store.js';
import { CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION, LAND_STATE, classify } from '../../domain/bands.js';
import { openIssues } from '../../domain/issues.js';
import { categoryColor } from '../../domain/palette.js';
import { int, dec, pct, signedPct, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { QUARTERS, RECENT_QUARTERS, WINDOW_QUARTERS, TODAY, MONTHS } from '../../domain/periods.js';

const OFFSET = QUARTERS.length - WINDOW_QUARTERS;
const LAND_SERIES = {
  cultivated: (farm) => farm.cultivationSeries,
  restingRecent: (farm) => farm.fallowRecentSeries,
  restingLong: (farm) => farm.fallowLongSeries
};

const chip = (band) => band
  ? h('span', { class: 'chip', style: { background: band.color + '22', color: band.color } }, band.label)
  : h('span', { class: 'chip chip-none' }, 'no reading');

const readout = (lines) => h('dl', { class: 'readout' }, ...lines.filter(Boolean).map(([term, value]) =>
  h('div', { class: 'line' }, h('dt', { text: term }), h('dd', {}, value))));

export function render({ place, selection }) {
  const farm = farmById(place.farmId);
  if (!farm) {
    return { showRegion: false, content: h('div', { class: 'empty' }, h('strong', { text: 'No farm with that number.' })) };
  }

  const issues = openIssues(farm);
  const crops = farm.crops.filter((crop) => !crop.former && crop.area > 0).sort((a, b) => b.area - a.area);
  const structures = new Map();
  for (const structure of farm.structures) structures.set(structure.tier2, (structures.get(structure.tier2) || 0) + 1);

  const month = MONTHS[TODAY.getUTCMonth()];

  return {
    showRegion: false,
    tools: [
      h('a', { class: 'btn', href: `#/farms` },
        icon('chevron', { size: 14 }), h('span', { text: 'Register' })),
      h('a', { class: 'btn btn-primary', href: `#/farm/${farm.fid}/actions` },
        icon('alert', { size: 14 }), h('span', { text: `What to do (${issues.length})` }))
    ],
    content: [
      figures([
        { value: `#${farm.fid}`, label: farm.owner, icon: 'farms' },
        { value: dec(farm.area, 1), unit: 'dun', label: regionById(farm.province).label, icon: 'land' },
        { value: farm.farmCentre || '—', label: 'Farm centre', icon: 'pin' },
        { value: pct(farm.cultivatedShare), label: 'Land in production', icon: 'crop' },
        { value: compact(farm.trees), label: 'Trees', icon: 'trees' },
        { value: int(issues.length), label: 'Needs attention', icon: 'alert', tone: issues.some((i) => i.severity === 'act') ? 'act' : issues.length ? 'watch' : null }
      ]),

      issues.length
        ? callout(issues.some((i) => i.severity === 'act') ? 'act' : 'watch',
            issues.map((issue) => issue.title).join(' · '),
            { title: 'Needs attention' })
        : callout('info', 'Nothing needs attention on this farm.'),

      section('Where it is', { icon: 'pin', half: true, flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand(`farm-${farm.fid}`, {
          mode: 'farm', farms: [farm], region: 'emirate', size: 'short'
        }))),

      section('What it grows now', { icon: 'crop', half: true, note: 'Area of each crop.' },
        crops.length
          ? barList(crops.map((crop) => ({ label: crop.type, value: crop.area, color: categoryColor(crop.category) })),
              { format: (v) => `${dec(v, 1)} dun`, limit: 14 })
          : intro('No crops found on this farm.')),

      section('Trees', { icon: 'trees', half: true, note: 'Every variety on this holding.' },
        farm.varieties.length
          ? h('div', {},
              readout([
                ['Date palms', int(farm.palms)],
                ['Fruit trees', int(farm.fruitTrees)],
                ['Forest trees', int(farm.forestTrees)],
                ['Palm canopy health index', farm.canopyPalms == null ? '—' : String(farm.canopyPalms)],
                ['Fruit tree canopy health index', farm.canopyFruit == null ? '—' : String(farm.canopyFruit)],
                ['Canopy health', chip(classify(CANOPY, farm.canopy))]
              ]),
              h('div', { style: { marginTop: '12px' } },
                barList([...farm.varieties].sort((a, b) => b.trees - a.trees).map((variety) => ({
                  label: variety.name, value: variety.trees, color: categoryColor(variety.category)
                })), { format: int, limit: 12 })))
          : intro('No trees found on this farm.')),

      section('Irrigation efficiency', { icon: 'water', half: true }, readout([
          ['Score', String(farm.efficiency)],
          ['Band', chip(classify(EFFICIENCY, farm.efficiency))],
          ['Last quarter', String(farm.efficiencySeries[QUARTERS.length - 2])],
          ['Change', signedPct(((farm.efficiency - farm.efficiencySeries[QUARTERS.length - 2]) / Math.max(1, farm.efficiencySeries[QUARTERS.length - 2])) * 100, 1)]
        ])),

      section('Structures', { icon: 'land', half: true },
        structures.size
          ? readout([...structures.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => [type, int(count)])
              .concat([['Area covered', `${dec(farm.structureArea, 2)} dun`]]))
          : intro('No structures found on this farm.')),

      section(`Water in ${month}`, { icon: 'water', note: 'What is allowed, and what was used.', flush: true },
        h('div', { class: 'card-body' },
          readout([
            ['Water allowed this month', `${int(farm.waterDemand)} m³`],
            ['Water used', `${int(farm.waterActual)} m³`],
            ['Compared with what is allowed', chip(classify(WATER_USE, farm.waterUsePct))],
            ['Water for a full season', `${int(farm.seasonalWater)} m³`],
            ['Expected harvest', `${dec(farm.expectedKg / 1000, 1)} t`],
            ['Water for one kilo', farm.expectedKg ? `${dec(farm.seasonalWater / farm.expectedKg, 2)} m³/kg` : '—']
          ]),
          crops.length
            ? h('div', { style: { marginTop: '14px' } },
                h('div', { class: 'table-wrap' }, h('table', { class: 'grid' },
                  h('thead', {}, h('tr', {},
                    h('th', { text: 'Crop' }), h('th', { class: 'num', text: 'Dunums' }),
                    h('th', { class: 'num', text: 'Allowed (m³)' }), h('th', { class: 'num', text: 'Used (m³)' }),
                    h('th', { class: 'num', text: 'Use' }), h('th', { class: 'num', text: 'Yield vs average' }))),
                  h('tbody', {}, ...crops.map((crop) => h('tr', {},
                    h('td', { class: 'name' }, h('span', { class: 'bar-cell' }, h('span', { class: 'swatch', style: { background: categoryColor(crop.category) } }), crop.type)),
                    h('td', { class: 'num', text: dec(crop.area, 1) }),
                    h('td', { class: 'num', text: int(crop.demandThisMonth) }),
                    h('td', { class: 'num', text: int(crop.actualThisMonth) }),
                    h('td', { class: 'num', text: pct(crop.usePct) }),
                    h('td', { class: 'num', text: crop.yieldDeviation == null ? '—' : signedPct(crop.yieldDeviation) }))))))) 
            : null)),

      /* The same three states the fallow page counts, on the holding they
       * belong to, so a farm's own page and the emirate page agree. */
      section('Land, quarter by quarter', { icon: 'trend', note: 'Dunums, in three states.' },
        stackedColumns(RECENT_QUARTERS.map((quarter) => quarter.label),
          LAND_STATE.map((state) => ({
            label: state.label,
            color: state.color,
            values: RECENT_QUARTERS.map((_, i) => LAND_SERIES[state.id](farm)[OFFSET + i] ?? 0)
          })),
          { format: (v) => dec(v, 1), totalLabel: 'All land on this farm' }))
    ]
  };
}
