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
    tools: [
      h('a', { class: 'btn', href: `#/farm/${farm.fid}` }, icon('chevron', { size: 14 }), h('span', { text: 'Farm profile' })),
      h('button', { class: 'btn', onclick: () => window.print() }, icon('print', { size: 14 }), h('span', { text: 'Print for a visit' }))
    ],
    content: [
      figures([
        { value: `#${farm.fid}`, label: farm.owner, icon: 'farms' },
        { value: regionById(farm.province).label, label: 'Province', icon: 'land' },
        { value: int(issues.length), label: 'Things to look at', icon: 'alert', tone: issues.some((i) => i.severity === 'act') ? 'act' : issues.length ? 'watch' : null },
        { value: int(alerts.length), label: 'Alerts for the farmer', icon: 'water' }
      ]),

      section('What needs attention', {
        icon: 'alert',
        note: issues.length ? 'Most urgent first.' : null
      }, issues.length
        ? h('div', {}, ...issues.map(issueCard))
        : callout('info', 'Everything on this farm is within its normal range.')),

      section(`Water in ${month}`, { icon: 'water', half: true },
        h('p', { class: 'section-intro' },
          `Allowed ${int(farm.waterDemand)} m³, used ${int(farm.waterActual)} m³ — ${pct(farm.waterUsePct)} of the allowance.`)),

      section('What the farmer would be told', { icon: 'support', half: true },
        alerts.length
          ? h('ul', { style: { margin: 0, paddingInlineStart: '18px', display: 'grid', gap: '6px' } },
              ...alerts.map((alert) => h('li', {}, h('strong', { text: alert.title + '. ' }), alert.detail)))
          : intro('Nothing would be sent to the farmer.'))
    ]
  };
}
