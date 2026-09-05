/* Band scales — how a number becomes a status word and a colour.
 *
 * The colour contract, restated for this design: the red/amber/green ramp is
 * only ever used where something is being judged (irrigation, water, canopy,
 * cultivation). Inventory pages colour by classification instead, from the
 * taxonomy palette, and never borrow this ramp. Keeping those apart is what
 * lets a red dot mean one thing across the whole platform.
 *
 * `sev` is attention severity, 0 (fine) upwards. It is stated rather than
 * inferred from array order, because some scales run good-bad-good. */

export const UNKNOWN_COLOR = '#9ca3af';

const scale = (key, label, bands) => ({ key, label, bands, worstSev: Math.max(...bands.map((b) => b.sev)) });

export const CULTIVATION = scale('cultivation', 'Cultivated share', [
  { id: 'cultivated', label: 'Cultivated', range: '≥ 66%', color: '#1a9850', sev: 0, test: (v) => v >= 66 },
  { id: 'partial', label: 'Partially fallow', range: '33–66%', color: '#fee08b', sev: 1, test: (v) => v >= 33 && v < 66 },
  { id: 'fallow', label: 'Fallow', range: '< 33%', color: '#d9a441', sev: 2, test: (v) => v < 33 }
]);

export const CANOPY = scale('canopy', 'Canopy health index', [
  { id: 'healthy', label: 'Healthy', range: '≥ 80', color: '#1a9850', sev: 0, test: (v) => v >= 80 },
  { id: 'fair', label: 'Fair', range: '65–79', color: '#91cf60', sev: 1, test: (v) => v >= 65 && v < 80 },
  { id: 'stressed', label: 'Stressed', range: '50–64', color: '#fee08b', sev: 2, test: (v) => v >= 50 && v < 65 },
  { id: 'severe', label: 'Severe stress', range: '< 50', color: '#d73027', sev: 3, test: (v) => v < 50 }
]);

export const EFFICIENCY = scale('efficiency', 'Irrigation efficiency', [
  { id: 'excellent', label: 'Excellent', range: '90–100', color: '#1a9850', sev: 0, test: (v) => v >= 90 },
  { id: 'good', label: 'Good', range: '80–89', color: '#91cf60', sev: 1, test: (v) => v >= 80 && v < 90 },
  { id: 'acceptable', label: 'Acceptable', range: '65–79', color: '#fee08b', sev: 2, test: (v) => v >= 65 && v < 80 },
  { id: 'poor', label: 'Poor', range: '50–64', color: '#fc8d59', sev: 3, test: (v) => v >= 50 && v < 65 },
  { id: 'critical', label: 'Critical', range: '< 50', color: '#d73027', sev: 4, test: (v) => v < 50 }
]);

/* Water use against the modelled monthly demand. The over-allocation flag is
 * raised here, against the month rather than the season — by the time a season
 * closes it is too late for anyone to act on it. */
export const WATER_USE = scale('waterUse', 'Use against demand', [
  { id: 'under', label: 'Under-irrigated', range: '< 80%', color: '#e08214', sev: 2, test: (v) => v < 80 },
  { id: 'onplan', label: 'On plan', range: '80–105%', color: '#1a9850', sev: 0, test: (v) => v >= 80 && v < 105 },
  { id: 'excess', label: 'Mild excess', range: '105–125%', color: '#fee08b', sev: 1, test: (v) => v >= 105 && v <= 125 },
  { id: 'over', label: 'Over-allocated', range: '> 125%', color: '#b30000', sev: 3, test: (v) => v > 125 }
]);

export const YIELD_DEVIATION = scale('yieldDeviation', 'Against the crop average', [
  { id: 'above', label: 'Above average', range: '≥ +10%', color: '#1a9850', sev: 0, test: (v) => v >= 10 },
  { id: 'ontrack', label: 'Around average', range: '−10% to +10%', color: '#a6d96a', sev: 0, test: (v) => v >= -10 && v < 10 },
  { id: 'below', label: 'Below average', range: '−25% to −10%', color: '#fdae61', sev: 2, test: (v) => v >= -25 && v < -10 },
  { id: 'well_below', label: 'Well below average', range: '< −25%', color: '#d73027', sev: 3, test: (v) => v < -25 }
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
