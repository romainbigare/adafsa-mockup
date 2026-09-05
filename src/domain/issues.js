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
      title: 'Using more water than allocated',
      detail: `Metered use is ${Math.round(farm.waterUsePct)}% of this month's allocation.`
        + (worst ? ` Most of the excess sits in ${worst.type}.` : ''),
      action: 'Confirm the meter reading, then discuss the irrigation schedule for the crop carrying the excess.'
    });
  } else if (farm.waterUsePct < 80) {
    issues.push({
      id: 'under-water',
      severity: 'watch',
      title: 'Irrigating below the modelled requirement',
      detail: `Metered use is ${Math.round(farm.waterUsePct)}% of this month's allocation, which usually shows up later as yield.`,
      action: 'Check whether the shortfall is a supply problem or a scheduling one.'
    });
  }

  const { base, now } = historyIndices(comparison);
  const before = farm.cultivationSeries[base] ?? 0;
  const after = farm.cultivationSeries[now] ?? 0;
  if (before - after > 0.5) {
    issues.push({
      id: 'fallow',
      severity: 'watch',
      title: 'Land has come out of production',
      detail: `${(before - after).toFixed(1)} dunums fewer than the comparison quarter.`,
      action: 'Ask whether the ground is resting between crops or has been abandoned.'
    });
  }

  const canopy = classify(CANOPY, farm.canopy);
  if (canopy && canopy.sev >= 2) {
    issues.push({
      id: 'canopy',
      severity: canopy.sev >= 3 ? 'act' : 'watch',
      title: `Canopy is ${canopy.label.toLowerCase()}`,
      detail: `The stand scores ${Math.round(farm.canopy)} against a healthy floor of 80.`,
      action: 'Inspect the stand for water stress, salinity or pest damage.'
    });
  }

  const efficiency = classify(EFFICIENCY, farm.efficiency);
  if (efficiency && efficiency.sev >= 3) {
    issues.push({
      id: 'efficiency',
      severity: efficiency.sev >= 4 ? 'act' : 'watch',
      title: `Irrigation efficiency is ${efficiency.label.toLowerCase()}`,
      detail: `Scoring ${farm.efficiency} against a province that averages higher.`,
      action: 'A site visit to look at the delivery system is usually what moves this score.'
    });
  }

  return issues.sort((a, b) => (a.severity === 'act' ? -1 : 1) - (b.severity === 'act' ? -1 : 1));
}

/* Farmer alerts are the subset a farmer would be told about — essentially over
 * consumption, with fallow ground as a slower second category. */
export const farmerAlerts = (farm) => openIssues(farm).filter((issue) => issue.id === 'water' || issue.id === 'fallow');
