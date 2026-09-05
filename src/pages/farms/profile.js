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
import { trendLine } from '../../charts/trendLine.js';
import { icon } from '../../app/icons.js';
import { farmById } from '../../data/store.js';
import { CANOPY, EFFICIENCY, WATER_USE, YIELD_DEVIATION, classify } from '../../domain/bands.js';
import { openIssues } from '../../domain/issues.js';
import { categoryColor, COMPARE } from '../../domain/palette.js';
import { int, dec, pct, signedPct, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { QUARTERS, TODAY, MONTHS } from '../../domain/periods.js';

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
    asOf: TODAY,
    tools: [
      h('a', { class: 'btn', href: `#/farms` }, icon('chevron', { size: 14 }), h('span', { text: 'Register' })),
      h('a', { class: 'btn btn-primary', href: `#/farm/${farm.fid}/actions` },
        icon('alert', { size: 14 }), h('span', { text: `Corrective actions (${issues.length})` }))
    ],
    content: [
      figures([
        { value: `#${farm.fid}`, label: farm.owner },
        { value: dec(farm.area, 1), unit: 'dun', label: `Holding · ${regionById(farm.province).label}` },
        { value: pct(farm.cultivatedShare), label: 'In production' },
        { value: compact(farm.trees), label: 'Trees standing' },
        { value: int(issues.length), label: 'Open items', tone: issues.some((i) => i.severity === 'act') ? 'act' : issues.length ? 'watch' : null }
      ]),

      issues.length
        ? callout(issues.some((i) => i.severity === 'act') ? 'act' : 'watch',
            issues.map((issue) => issue.title).join(' · '),
            { title: 'What is open on this farm' })
        : callout('info', 'Nothing is open on this farm at the moment.'),

      h('div', { class: 'dossier-grid' },
        section('Where it is', { flush: true },
          h('div', { style: { padding: '0 16px 16px' } }, mapBand(`farm-${farm.fid}`, {
            mode: 'farm', farms: [farm], region: 'emirate', size: 'short'
          }))),
        section('What it grows now', {},
          crops.length
            ? barList(crops.map((crop) => ({ label: crop.type, value: crop.area, color: categoryColor(crop.category) })),
                { format: (v) => `${dec(v, 1)} dun`, limit: 14 })
            : intro('No standing crop detected on this holding.'))),

      h('div', { class: 'dossier-grid' },
        section('Trees', {}, readout([
          ['Date palms', int(farm.palms)],
          ['Fruit trees', int(farm.fruitTrees)],
          ['Forest trees', int(farm.forestTrees)],
          farm.cultivar ? ['Main cultivar', farm.cultivar] : null,
          ['Palm canopy index', farm.canopyPalms == null ? '—' : String(farm.canopyPalms)],
          ['Fruit canopy index', farm.canopyFruit == null ? '—' : String(farm.canopyFruit)],
          ['Canopy status', chip(classify(CANOPY, farm.canopy))]
        ])),

        section('Irrigation efficiency', {}, readout([
          ['Score', String(farm.efficiency)],
          ['Band', chip(classify(EFFICIENCY, farm.efficiency))],
          ['Last quarter', String(farm.efficiencySeries[QUARTERS.length - 2])],
          ['Movement', signedPct(((farm.efficiency - farm.efficiencySeries[QUARTERS.length - 2]) / Math.max(1, farm.efficiencySeries[QUARTERS.length - 2])) * 100, 1)]
        ])),

        section('Structures', {},
          structures.size
            ? readout([...structures.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => [type, int(count)])
                .concat([['Built footprint', `${dec(farm.structureArea, 2)} dun`]]))
            : intro('No structures detected on this holding.'))),

      section(`Water — ${month}`, { note: 'Allocation against metered use, and where the difference sits.', flush: true },
        h('div', { class: 'card-body' },
          readout([
            ['Allocated this month', `${int(farm.waterDemand)} m³`],
            ['Metered use', `${int(farm.waterActual)} m³`],
            ['Use against allocation', chip(classify(WATER_USE, farm.waterUsePct))],
            ['Water over a full cycle', `${int(farm.seasonalWater)} m³`],
            ['Expected production', `${dec(farm.expectedKg / 1000, 1)} t`],
            ['Water per kilo', farm.expectedKg ? `${dec(farm.seasonalWater / farm.expectedKg, 2)} m³/kg` : '—']
          ]),
          crops.length
            ? h('div', { style: { marginTop: '14px' } },
                h('div', { class: 'table-wrap' }, h('table', { class: 'grid' },
                  h('thead', {}, h('tr', {},
                    h('th', { text: 'Crop' }), h('th', { class: 'num', text: 'Dunums' }),
                    h('th', { class: 'num', text: 'Allocated (m³)' }), h('th', { class: 'num', text: 'Metered (m³)' }),
                    h('th', { class: 'num', text: 'Use' }), h('th', { class: 'num', text: 'Yield vs average' }))),
                  h('tbody', {}, ...crops.map((crop) => h('tr', {},
                    h('td', { class: 'name' }, h('span', { class: 'bar-cell' }, h('span', { class: 'swatch', style: { background: categoryColor(crop.category) } }), crop.type)),
                    h('td', { class: 'num', text: dec(crop.area, 1) }),
                    h('td', { class: 'num', text: int(crop.demandThisMonth) }),
                    h('td', { class: 'num', text: int(crop.actualThisMonth) }),
                    h('td', { class: 'num', text: pct(crop.usePct) }),
                    h('td', { class: 'num', text: crop.yieldDeviation == null ? '—' : signedPct(crop.yieldDeviation) }))))))) 
            : null)),

      section('Land in production, quarter by quarter', {},
        trendLine(QUARTERS.map((q) => q.label), [
          { label: 'Dunums in production', color: COMPARE.current, values: farm.cultivationSeries }
        ], { format: (v) => dec(v, 1), zeroBased: false })),

      intro('Crop health readings, soil moisture, weather and the irrigation scheduler are deliberately not here. They belong in the farmer’s own application; this platform reports what the survey measures.')
    ]
  };
}
