/* When each crop is in the ground.
 *
 * The review settled a question here: there is no separate "Abu Dhabi crop
 * calendar" artefact to reconcile against — the crop calendar *is* what the
 * farms are doing. So this file holds the growing windows, and the calendar
 * page reads them rather than a second source.
 *
 * A window is not a hard start and a hard finish. A few growers plant early and
 * a few late, so each window is rendered as a curve that rises and falls, which
 * is what Mark expected to see: no tomatoes in August, six thousand farms of
 * them in September.
 *
 * Months are 0-indexed. A window may wrap the year end. */

export const CYCLE_MONTHS = { Cereals: 4, Fodder: 12, 'Open Field': 3, 'Date Palm': 12, 'Fruit Trees': 12, 'Forest Trees': 12 };

/* Category defaults. Field crops in the Gulf run through the cool months;
 * fodder and the trees are in the ground all year. */
const CATEGORY_WINDOW = {
  Cereals: { from: 10, to: 3 },
  Fodder: null,
  'Open Field': { from: 9, to: 3 },
  'Date Palm': null,
  'Fruit Trees': null,
  'Forest Trees': null
};

/* The crops whose season is well enough known to be worth stating. Everything
 * else inherits its category. */
const TYPE_WINDOW = {
  Tomato: { from: 8, to: 2 },
  Cucumber: { from: 9, to: 2 },
  Eggplant: { from: 8, to: 1 },
  Capsicum: { from: 9, to: 2 },
  Lettuce: { from: 10, to: 2 },
  Spinach: { from: 10, to: 1 },
  Cabbage: { from: 10, to: 1 },
  Cantaloupe: { from: 1, to: 4 },
  Watermelon: { from: 1, to: 4 },
  Potato: { from: 10, to: 2 },
  Onion: { from: 10, to: 3 },
  Garlic: { from: 9, to: 2 },
  Radish: { from: 10, to: 1 },
  Coriander: { from: 10, to: 1 },
  Okra: { from: 2, to: 6 },
  Beans: { from: 9, to: 1 },
  Zucchini: { from: 9, to: 1 },
  'Sweet Potato': { from: 2, to: 6 },
  Strawberry: { from: 9, to: 2 },
  Barley: { from: 10, to: 2 },
  Wheat: { from: 10, to: 3 },
  Quinoa: { from: 10, to: 2 }
};

export const windowFor = (category, type) =>
  TYPE_WINDOW[type] !== undefined ? TYPE_WINDOW[type] : CATEGORY_WINDOW[category] ?? null;

const inWindow = (month, { from, to }) => (from <= to ? month >= from && month <= to : month >= from || month <= to);

/* Twelve weights, one per month, peaking in the middle of the window and
 * tapering at both ends. A crop with no window (a perennial or a tree) is in
 * the ground all year and reads flat. */
export function monthlyCurve(category, type) {
  const win = windowFor(category, type);
  if (!win) return Array(12).fill(1);

  const length = ((win.to - win.from + 12) % 12) + 1;
  const curve = Array(12).fill(0);
  for (let i = 0; i < 12; i++) {
    if (!inWindow(i, win)) continue;
    const position = ((i - win.from + 12) % 12) / Math.max(1, length - 1);
    /* A raised cosine: zero-ish at the shoulders, one at the peak. The floor
     * keeps the early and late growers visible rather than rounding them away. */
    curve[i] = 0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, Math.max(0, position)));
  }
  return curve;
}

export const peakMonthOf = (category, type) => {
  const curve = monthlyCurve(category, type);
  return curve.indexOf(Math.max(...curve));
};

export const isInSeason = (category, type, month) => monthlyCurve(category, type)[month] > 0;
