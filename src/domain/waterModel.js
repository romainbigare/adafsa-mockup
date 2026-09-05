/* The water and yield coefficients behind the calculator.
 *
 * These are the "formula inputs" the review put behind a more-info panel rather
 * than on the page: model parameters, not deliverables. They are placeholder
 * figures chosen to sit in a believable range for the Gulf, and the panel says
 * so wherever they surface.
 *
 * Water is expressed as cubic metres per dunum per month, which is how the
 * monthly demand deliverable is defined; yield as tonnes per dunum per cycle. */

export const WATER_PER_DUNUM_MONTH = {
  Cereals: 120,
  Fodder: 220,
  'Open Field': 150,
  'Date Palm': 180,
  'Fruit Trees': 160,
  'Forest Trees': 90
};

export const YIELD_TONNES_PER_DUNUM = {
  Cereals: 0.5,
  Fodder: 8.0,
  'Open Field': 4.0,
  'Date Palm': 1.0,
  'Fruit Trees': 1.5,
  'Forest Trees': 0
};

/* Evapotranspiration through the year, as a multiplier on the base rate. Summer
 * in Abu Dhabi roughly doubles a crop's demand over winter. */
export const ET_BY_MONTH = [0.62, 0.70, 0.85, 1.05, 1.25, 1.40, 1.45, 1.42, 1.25, 1.02, 0.80, 0.66];

/* The module covers field crops, palms and fruit trees. Forest stands are
 * outside it — the proposal never brings them into the water calculation, and
 * they produce nothing to weigh, so a figure per kilo would be meaningless. */
export const WATER_CATEGORIES = ['Cereals', 'Fodder', 'Open Field', 'Date Palm', 'Fruit Trees'];

export const FORMULA_NOTES = [
  ['Monthly water demand', 'crop area × the crop’s base rate × the month’s ET multiplier'],
  ['Base rate', 'cubic metres per dunum per month, by crop category'],
  ['ET multiplier', 'the month’s evapotranspiration against the annual mean'],
  ['Seasonal water budget', 'monthly demand summed across the crop’s growing cycle'],
  ['Cubic metres per kilo', 'seasonal water for the crop ÷ its expected production'],
  ['Over-allocation', 'metered use above 125% of the month’s demand']
];

export const monthlyDemand = (category, dunums, month) =>
  dunums * (WATER_PER_DUNUM_MONTH[category] || 0) * ET_BY_MONTH[month];

/* Water across a whole cycle, walking the months from the crop's peak so a
 * three-month vegetable is costed on the months it is actually in the ground. */
export function seasonalDemand(category, dunums, cycleMonths, startMonth) {
  let total = 0;
  for (let i = 0; i < cycleMonths; i++) total += monthlyDemand(category, dunums, (startMonth + i) % 12);
  return total;
}

export const expectedProductionKg = (category, dunums) => dunums * (YIELD_TONNES_PER_DUNUM[category] || 0) * 1000;

export const cubicMetresPerKilo = (water, kilos) => (kilos > 0 ? water / kilos : null);
