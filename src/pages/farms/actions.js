/* Individual Farms — corrective actions.
 *
 * Page two of two. Each finding is stated as something to do rather than as a
 * reading to interpret, and the page ends in an action: print it, or take the
 * export to the visit.
 *
 * Farmer alerts are essentially over-consumption of water, with fallow ground
 * as a slower second category. That was the whole of the list in review. */

import { h } from '../../app/dom.js';
import { section, intro, callout } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { icon } from '../../app/icons.js';
import { farmById } from '../../data/store.js';
import { openIssues, farmerAlerts } from '../../domain/issues.js';
import { WATER_USE, classify } from '../../domain/bands.js';
import { int, dec, pct } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY, MONTHS } from '../../domain/periods.js';

function issueCard(issue) {
  const tone = issue.severity === 'act' ? 'chip-act' : 'chip-watch';
  return h('article', { class: 'issue' },
    h('div', { class: 'issue-head' },
      h('span', { class: `chip ${tone}` }, icon('alert', { size: 12 }), issue.severity === 'act' ? 'Act' : 'Watch'),
      h('h3', { text: issue.title })),
    h('p', { text: issue.detail }),
    h('p', { class: 'action' }, h('strong', { text: 'Suggested action: ' }), issue.action));
}

export function render({ place }) {
  const farm = farmById(place.farmId);
  if (!farm) {
    return { showRegion: false, content: h('div', { class: 'empty' }, h('strong', { text: 'No farm with that number.' })) };
  }

  const issues = openIssues(farm);
  const alerts = farmerAlerts(farm);
  const month = MONTHS[TODAY.getUTCMonth()];

  return {
    showRegion: false,
    asOf: TODAY,
    tools: [
      h('a', { class: 'btn', href: `#/farm/${farm.fid}` }, icon('chevron', { size: 14 }), h('span', { text: 'Farm profile' })),
      h('button', { class: 'btn', onclick: () => window.print() }, icon('print', { size: 14 }), h('span', { text: 'Print for a visit' }))
    ],
    content: [
      figures([
        { value: `#${farm.fid}`, label: farm.owner },
        { value: regionById(farm.province).label, label: 'Province' },
        { value: int(issues.length), label: 'Open items', tone: issues.some((i) => i.severity === 'act') ? 'act' : issues.length ? 'watch' : null },
        { value: int(alerts.length), label: 'Would reach the farmer' }
      ]),

      section('What needs attention', {
        note: issues.length ? 'Ordered with the most urgent first.' : null
      }, issues.length
        ? h('div', {}, ...issues.map(issueCard))
        : callout('info', 'Nothing on this holding is outside its expected range. No visit is indicated by the data.')),

      section('Water this month', { note: `Allocation and metered use for ${month}.` },
        h('div', {},
          h('p', { class: 'section-intro' },
            `Allocated ${int(farm.waterDemand)} m³, metered ${int(farm.waterActual)} m³ — ${pct(farm.waterUsePct)} of allocation, which reads as ${(classify(WATER_USE, farm.waterUsePct)?.label || 'no reading').toLowerCase()}.`),
          farm.overAllocated
            ? h('div', { style: { marginTop: '10px' } }, callout('act',
                'The over-allocation flag is raised against this month rather than the season. By the time a season closes there is nothing left to do about it, which is why the monthly figure is the one that carries the flag.'))
            : null)),

      section('What the farmer would be told', {},
        alerts.length
          ? h('ul', { style: { margin: 0, paddingInlineStart: '18px', display: 'grid', gap: '6px' } },
              ...alerts.map((alert) => h('li', {}, h('strong', { text: alert.title + '. ' }), alert.detail)))
          : intro('Nothing on this holding would generate a message to the farmer.')),

      intro('Inspectors already carry a tablet questionnaire that feeds a report generator. This sheet is shaped to be handed to that process later — a short list of findings, each with something to do about it.')
    ]
  };
}
