/* Colour, in one place.
 *
 * Two palettes, two jobs, never mixed:
 *
 *   Identity  — the six taxonomy categories. A fixed order, assigned once and
 *               never cycled. Validated for colour-vision deficiency: the three
 *               field categories are safe against each other in any combination,
 *               and so are the three tree categories, which is what a module map
 *               ever shows at one time. All six together clear the adjacent-pair
 *               gates, for stacked bars and legends.
 *
 *   Status    — the band ramps in domain/bands.js. Green means fine, amber means
 *               watch, red means act, everywhere, and nothing decorative borrows
 *               those hues.
 *
 * Three identity hues sit below 3:1 against the page, so every chart and legend
 * that uses them ships a visible label beside the swatch rather than relying on
 * the colour alone. That is the relief rule, and it is why no legend here is a
 * bare row of squares.
 *
 * Type-level charts (dunums by crop) are magnitude rather than identity, so they
 * draw in a single hue — their parent category's — instead of inventing a
 * fortieth colour nobody could tell apart. */

export const CATEGORY_COLORS = {
  Cereals: '#eda100',
  Fodder: '#1baf7a',
  'Open Field': '#4a3aa7',
  'Date Palm': '#2a78d6',
  'Fruit Trees': '#e87ba4',
  'Forest Trees': '#008300'
};

/* Two series compared against each other — this period and the one before it. */
export const COMPARE = { current: '#2a78d6', previous: '#9ec5f4', gain: '#1baf7a', loss: '#e34948' };

/* A single-hue ramp for magnitude, light to dark. Used for bubble weight and
 * for the one-series bar charts. */
export const SEQUENTIAL = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'];

export const INK = { primary: '#111827', secondary: '#4b5563', muted: '#6b7280', grid: '#e5e7eb' };

export const NEUTRAL = '#9ca3af';

export const categoryColor = (name) => CATEGORY_COLORS[name] || NEUTRAL;

/* Land-use classes are their own small identity set, distinct from the crop
 * taxonomy because they answer a different question. */
export const LANDUSE_COLORS = {
  'Open Agriculture': '#1baf7a',
  'Protected Agriculture': '#2a78d6',
  Structures: '#eb6834',
  'Barren Land': '#b8a888'
};

export const landuseColor = (name) => LANDUSE_COLORS[name] || NEUTRAL;
