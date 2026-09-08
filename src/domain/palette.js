/* Colour, in one place.
 *
 * Four sets, four jobs, and nothing outside them. The platform was carrying a
 * dozen hand-picked hues doing overlapping work; this is the whole vocabulary
 * now.
 *
 *   Identity  — the six taxonomy categories. A fixed order, assigned once and
 *               never cycled, validated for colour-vision deficiency: the three
 *               field categories are safe against each other in any
 *               combination, and so are the three tree categories, which is all
 *               a module map ever shows at one time.
 *
 *   Status    — one five-step ramp, good to bad, shared by every band scale.
 *               Each scale takes the steps it needs. It appears only where
 *               something is being judged.
 *
 *   Sequential — one blue ramp for plain magnitude: map bubbles, single-series
 *               bars, density.
 *
 *   Direction — deliberately quiet. Change pages draw their bars in one neutral
 *               blue and let the signed number carry up or down, tinted just
 *               enough to scan. Gains and losses shouting in green and red made
 *               those pages read as alarms rather than as arithmetic.
 *
 * Three identity hues sit below 3:1 against the page, so every legend and bar
 * that uses them ships a visible label rather than relying on colour alone. */

export const CATEGORY_COLORS = {
  Cereals: '#eda100',
  Fodder: '#1baf7a',
  'Open Field': '#4a3aa7',
  'Date Palm': '#2a78d6',
  'Fruit Trees': '#e87ba4',
  'Forest Trees': '#008300'
};

/* The one status ramp. Every band scale in domain/bands.js draws from it. */
export const STATUS = {
  good: '#1a7f4b',
  fair: '#7fb069',
  watch: '#e0b02a',
  poor: '#dd7a3c',
  bad: '#c0392b'
};

export const SEQUENTIAL = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'];

/* How many members of a group get a band of their own in a stacked column
 * before the rest gather into one. Past five, a monochromatic ramp runs out of
 * steps a reader can tell apart. REST says "everything else" rather than
 * pretending to name it. */
export const SERIES_LIMIT = 5;
export const REST = '#9ca3af';

/* Change and comparison. `neutral` draws the bars; `up` and `down` tint only
 * the number beside them. */
export const COMPARE = {
  current: '#3987e5',
  previous: '#9ec5f4',
  neutral: '#6da7ec',
  up: '#1a7f4b',
  down: '#b0574a'
};

export const INK = { primary: '#111827', secondary: '#4b5563', muted: '#6b7280', grid: '#e5e7eb' };

export const NEUTRAL = '#9ca3af';

export const categoryColor = (name) => CATEGORY_COLORS[name] || NEUTRAL;

/* Land-use classes are their own small identity set — a different question from
 * the crop taxonomy, and never on screen beside it. */
export const LANDUSE_COLORS = {
  'Open Agriculture': '#1baf7a',
  'Protected Agriculture': '#2a78d6',
  Structures: '#eb6834',
  'Barren Land': '#b8a888'
};

export const landuseColor = (name) => LANDUSE_COLORS[name] || NEUTRAL;

/* Tints of one identity hue, for the members of a single category.
 *
 * A stacked column of cereals is wheat and sorghum — the same thing seen twice,
 * not two unrelated things — so they are drawn as steps of the cereal hue
 * rather than as new colours.
 *
 * The steps run across a fixed lightness range rather than around the base
 * colour, because a hue that happens to be dark or pale would otherwise give a
 * ramp with nowhere to go, and adjacent bands that cannot be told apart. The
 * saturation falls as the lightness rises, which is how a tint reads naturally
 * and adds a second difference between neighbours. Dark to light in a fixed
 * order, so a crop keeps its shade as long as the sort does, and every band
 * carries its name in the legend regardless. */
const RAMP = { from: 0.26, to: 0.80, fade: 0.34 };

export function tints(baseColor, count) {
  if (count <= 1) return [baseColor];
  const [h, s] = toHsl(baseColor);
  return Array.from({ length: count }, (_, i) => {
    const step = i / (count - 1);
    return fromHsl(h, s * (1 - RAMP.fade * step), RAMP.from + (RAMP.to - RAMP.from) * step);
  });
}

function toHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function fromHsl(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  };
  return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
