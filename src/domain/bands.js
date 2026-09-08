/* Band scales — how a number becomes a status word and a colour.
 *
 * Every scale here draws from the one status ramp in domain/palette.js rather
 * than picking its own greens and reds, so the same shade means the same thing
 * on every page. The ramp appears only where something is being judged;
 * inventory pages colour by classification from the taxonomy palette and never
 * borrow it.
 *
 * `sev` is attention severity, 0 (fine) upwards. It is stated rather than
 * inferred from array order, because some scales run good-bad-good. */

import { STATUS, NEUTRAL } from './palette.js';

export const UNKNOWN_COLOR = NEUTRAL;

const scale = (key, label, bands) => ({ key, label, bands, worstSev: Math.max(...bands.map((b) => b.sev)) });

/* Land, in the three states the review settled on: what is being farmed, what
 * has been resting for less than a year and is waiting for a crop, and what has
 * been resting for more than a year and is simply not being used. The middle
 * one is a season; the last one is a policy question, which is why they are
 * counted apart. */
export const LAND_STATE = [
  { id: 'cultivated', label: 'Under cultivation', color: STATUS.good },
  { id: 'restingRecent', label: 'Fallow under 12 months', color: STATUS.watch },
  { id: 'restingLong', label: 'Fallow over 12 months', color: STATUS.poor }
];

export const landStateColor = (id) => LAND_STATE.find((s) => s.id === id)?.color || NEUTRAL;

/* A farm reads as whichever of the three covers most of it — no thresholds to
 * argue about, and it moves with the data. */
export function landState(farm) {
  const parts = [
    ['cultivated', farm.cultivatedArea || 0],
    ['restingRecent', farm.fallowRecent || 0],
    ['restingLong', farm.fallowLong || 0]
  ].sort((a, b) => b[1] - a[1]);
  if (!parts[0][1]) return null;
  return LAND_STATE.find((s) => s.id === parts[0][0]);
}

export const CANOPY = scale('canopy', 'Canopy health index', [
  { id: 'healthy', label: 'Healthy', range: '≥ 80', color: STATUS.good, sev: 0, test: (v) => v >= 80 },
  { id: 'fair', label: 'Fair', range: '65–79', color: STATUS.fair, sev: 1, test: (v) => v >= 65 && v < 80 },
  { id: 'stressed', label: 'Stressed', range: '50–64', color: STATUS.watch, sev: 2, test: (v) => v >= 50 && v < 65 },
  { id: 'severe', label: 'Very stressed', range: '< 50', color: STATUS.bad, sev: 3, test: (v) => v < 50 }
]);

export const EFFICIENCY = scale('efficiency', 'Irrigation efficiency', [
  { id: 'excellent', label: 'Excellent', range: '90–100', color: STATUS.good, sev: 0, test: (v) => v >= 90 },
  { id: 'good', label: 'Good', range: '80–89', color: STATUS.fair, sev: 1, test: (v) => v >= 80 && v < 90 },
  { id: 'acceptable', label: 'Acceptable', range: '65–79', color: STATUS.watch, sev: 2, test: (v) => v >= 65 && v < 80 },
  { id: 'poor', label: 'Poor', range: '50–64', color: STATUS.poor, sev: 3, test: (v) => v >= 50 && v < 65 },
  { id: 'critical', label: 'Critical', range: '< 50', color: STATUS.bad, sev: 4, test: (v) => v < 50 }
]);

/* The subsidy line, from the contract: a farm scoring 65 or better — acceptable
 * or above — stays on the list ADAFSA keeps for continued subsidy. It is the
 * band edge, not a second number, so the two can never disagree. */
export const SUBSIDY_SCORE = 65;
export const keepsSubsidy = (score) => score != null && score >= SUBSIDY_SCORE;

/* Water use against the modelled monthly demand. The over-allocation flag is
 * raised here, against the month rather than the season — by the time a season
 * closes it is too late for anyone to act on it. */
export const WATER_USE = scale('waterUse', 'Use against demand', [
  { id: 'under', label: 'Below plan', range: '< 80%', color: STATUS.poor, sev: 2, test: (v) => v < 80 },
  { id: 'onplan', label: 'On plan', range: '80–105%', color: STATUS.good, sev: 0, test: (v) => v >= 80 && v < 105 },
  { id: 'excess', label: 'Slightly over', range: '105–125%', color: STATUS.watch, sev: 1, test: (v) => v >= 105 && v <= 125 },
  { id: 'over', label: 'Over-allocated', range: '> 125%', color: STATUS.bad, sev: 3, test: (v) => v > 125 }
]);

export const YIELD_DEVIATION = scale('yieldDeviation', 'Against the crop average', [
  { id: 'above', label: 'Above average', range: '≥ +10%', color: STATUS.good, sev: 0, test: (v) => v >= 10 },
  { id: 'ontrack', label: 'Around average', range: '−10% to +10%', color: STATUS.fair, sev: 0, test: (v) => v >= -10 && v < 10 },
  { id: 'below', label: 'Below average', range: '−25% to −10%', color: STATUS.poor, sev: 2, test: (v) => v >= -25 && v < -10 },
  { id: 'well_below', label: 'Well below average', range: '< −25%', color: STATUS.bad, sev: 3, test: (v) => v < -25 }
]);

export function classify(scaleDef, value) {
  if (value == null || Number.isNaN(value)) return null;
  return scaleDef.bands.find((b) => b.test(value)) || null;
}

export const colorFor = (scaleDef, value) => classify(scaleDef, value)?.color || UNKNOWN_COLOR;
export const labelFor = (scaleDef, value) => classify(scaleDef, value)?.label || '—';

/* Counts, area and mean per band, in band order. Rows with no value are left
 * out of every total rather than counted as zero. */
export function distribution(scaleDef, records, valueOf, areaOf = (r) => r.area || 0) {
  const rows = scaleDef.bands.map((b) => ({ ...b, count: 0, area: 0, sum: 0 }));
  const index = new Map(scaleDef.bands.map((b, i) => [b.id, i]));
  let scored = 0;
  let totalArea = 0;
  for (const record of records) {
    const value = valueOf(record);
    const band = classify(scaleDef, value);
    if (!band) continue;
    const row = rows[index.get(band.id)];
    row.count += 1;
    row.area += areaOf(record);
    row.sum += value;
    scored += 1;
    totalArea += areaOf(record);
  }
  return rows.map((r) => ({
    id: r.id, label: r.label, range: r.range, color: r.color, sev: r.sev,
    count: r.count,
    area: r.area,
    mean: r.count ? r.sum / r.count : null,
    shareOfFarms: scored ? (r.count / scored) * 100 : 0,
    shareOfArea: totalArea ? (r.area / totalArea) * 100 : 0
  }));
}

/* How many records sit in the scale's worst band — the number that drives an
 * alert rather than a chart. */
export function worstCount(scaleDef, records, valueOf) {
  return records.reduce((n, r) => {
    const band = classify(scaleDef, valueOf(r));
    return n + (band && band.sev === scaleDef.worstSev ? 1 : 0);
  }, 0);
}
