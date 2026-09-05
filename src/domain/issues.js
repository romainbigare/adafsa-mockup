/* What is open on a farm.
 *
 * The corrective-actions page is the second of the two farm pages, and this is
 * what fills it. The review settled the list: over-consumption of water and
 * newly fallow ground, with canopy stress alongside them. Violations are not
 * tracked and data confidence is not reported.
 *
 * Pure logic, so the register and the farm page cannot disagree about how many
 * things are open on a farm. */

import { CANOPY, EFFICIENCY, classify } from './bands.js';
import { historyIndices } from './periods.js';

const OVER_ALLOCATION_THRESHOLD = 125;

export function openIssues(farm, { comparison = 'quarter' } = {}) {
  const issues = [];

  if (farm.waterUsePct > OVER_ALLOCATION_THRESHOLD) {
    const worst = [...farm.crops]
      .filter((crop) => !crop.former && crop.demandThisMonth > 0)
      .sort((a, b) => (b.actualThisMonth - b.demandThisMonth) - (a.actualThisMonth - a.demandThisMonth))[0];
    issues.push({
      id: 'water',
      severity: 'act',
      title: 'Using more water than allowed',
      detail: `This farm used ${Math.round(farm.waterUsePct)}% of the water allowed this month.`
        + (worst ? ` Most of the extra water went to ${worst.type}.` : ''),
      action: 'Check the meter reading, then talk to the farmer about watering that crop.'
    });
  } else if (farm.waterUsePct < 80) {
    issues.push({
      id: 'under-water',
      severity: 'watch',
      title: 'Using less water than the crops need',
      detail: `This farm used only ${Math.round(farm.waterUsePct)}% of the water allowed this month. The harvest usually suffers.`,
      action: 'Find out whether the water supply is short, or the watering times are wrong.'
    });
  }

  const { base, now } = historyIndices(comparison);
  const before = farm.cultivationSeries[base] ?? 0;
  const after = farm.cultivationSeries[now] ?? 0;
  if (before - after > 0.5) {
    issues.push({
      id: 'fallow',
      severity: 'watch',
      title: 'Less land is planted than before',
      detail: `${(before - after).toFixed(1)} dunums less than the quarter we are comparing with.`,
      action: 'Ask if the land is resting between crops, or has been left.'
    });
  }

  const canopy = classify(CANOPY, farm.canopy);
  if (canopy && canopy.sev >= 2) {
    issues.push({
      id: 'canopy',
      severity: canopy.sev >= 3 ? 'act' : 'watch',
      title: `Trees look ${canopy.label.toLowerCase()}`,
      detail: `The trees score ${Math.round(farm.canopy)} out of 100. Healthy trees score 80 or more.`,
      action: 'Visit the trees and look for lack of water, salt in the soil, or pests.'
    });
  }

  const efficiency = classify(EFFICIENCY, farm.efficiency);
  if (efficiency && efficiency.sev >= 3) {
    issues.push({
      id: 'efficiency',
      severity: efficiency.sev >= 4 ? 'act' : 'watch',
      title: `Watering is ${efficiency.label.toLowerCase()}`,
      detail: `This farm scores ${farm.efficiency}, below the average for its province.`,
      action: 'Visit the farm and look at the pipes, drippers and watering times.'
    });
  }

  return issues.sort((a, b) => (a.severity === 'act' ? -1 : 1) - (b.severity === 'act' ? -1 : 1));
}

/* Farmer alerts are the subset a farmer would be told about — essentially over
 * consumption, with fallow ground as a slower second category. */
export const farmerAlerts = (farm) => openIssues(farm).filter((issue) => issue.id === 'water' || issue.id === 'fallow');
