/* The crop and tree taxonomy — the rules, not the data.
 *
 * The tree itself is built from the dictionaries in data/attributes.js by
 * buildTaxonomy(), so adding a crop to the survey adds it to the platform
 * without anyone editing a list here. What this file fixes is the things the
 * data cannot know: the order the categories are read in, their display names,
 * their colours, and which dataset owns each category's area.
 *
 * Decisions from the review are encoded here:
 *   - Six categories, in this order: cereals, fodder, open field, then the
 *     three tree groups.
 *   - "Open-Field Produce" reads as "Open Field" (the dash goes).
 *   - Forest trees join the taxonomy as a third tree group.
 *   - Dual-named crops keep their first name (handled at generation time).
 */

export const CATEGORY_RENAME = { 'Open-Field Produce': 'Open Field' };

/* Which dataset carries each tree category's area.
 *
 * The crops survey names species but barely measures the woody perennials; the
 * land-use survey measures them properly but does not name species. So palms
 * and forest trees take their area from land use, fruit trees from the crops
 * survey where the species detail lives. Reading both would double-count. */
export const TREE_AREA_SOURCE = {
  'Date Palm': { dataset: 'land', type: 'Palm Trees' },
  'Fruit Trees': { dataset: 'crops' },
  'Forest Trees': { dataset: 'land', type: 'Other Trees' }
};

export const CATEGORIES = [
  { name: 'Cereals', kind: 'field', color: '#d4a017' },
  { name: 'Fodder', kind: 'field', color: '#4c9a2a' },
  { name: 'Open Field', kind: 'field', color: '#8e44ad' },
  { name: 'Date Palm', kind: 'tree', color: '#7b4b2a' },
  { name: 'Fruit Trees', kind: 'tree', color: '#e67e22' },
  { name: 'Forest Trees', kind: 'tree', color: '#2f7d4f' }
];

export const CATEGORY_ORDER = CATEGORIES.map((c) => c.name);
export const FIELD_CATEGORIES = CATEGORIES.filter((c) => c.kind === 'field').map((c) => c.name);
export const TREE_CATEGORIES = CATEGORIES.filter((c) => c.kind === 'tree').map((c) => c.name);

export const categoryMeta = (name) => CATEGORIES.find((c) => c.name === name);
export const isTreeCategory = (name) => TREE_CATEGORIES.includes(name);

/* Per-type colours. Anything not listed inherits its category's colour, so the
 * map and the charts never fall back to grey. */
export const TYPE_COLORS = {
  Barley: '#c9b870', Quinoa: '#b7472a', Wheat: '#e0a82e',
  Alfalfa: '#5aa02c', Corn: '#f2c811', 'Rhodes Grass': '#9acd32', Sorghum: '#a0522d', 'Sudan Grass': '#2e8b57',
  Beans: '#558b2f', Cabbage: '#26a69a', Cantaloupe: '#e8943a', Capsicum: '#e74c3c', Coriander: '#cddc39',
  Cucumber: '#4caf50', Eggplant: '#6a1b9a', Garlic: '#d7cca3', Lettuce: '#aed581', Okra: '#827717',
  Onion: '#c2569e', Potato: '#c8a165', Radish: '#e03b5b', Spinach: '#1b5e20', 'Sweet Potato': '#e07b39',
  Tomato: '#ff6347', Watermelon: '#3e7c3a', Zucchini: '#33691e',
  'Date Palm': '#7b4b2a',
  Avocado: '#5c8a2e', Banana: '#f4d03f', 'Dragon Fruit': '#c72c6b', Fig: '#7b466a', Guava: '#de8aa0',
  Lemon: '#f2e22e', Lime: '#a8d44a', Mandarin: '#ed8b16', Mango: '#f0932b', Olive: '#6b8e23',
  Pomegranate: '#9b1b30', Strawberry: '#e63946', 'Tahiti Lime': '#7cb342',
  'Forest Trees': '#2f7d4f'
};

export const colorOfType = (category, type) => TYPE_COLORS[type] || categoryMeta(category)?.color || '#9ca3af';

/* A leaf name alone is ambiguous — watermelon is both an open-field crop and,
 * in other surveys, a fruit. Selections are keyed by category and type. */
export const SEP = '→';
export const typeKey = (category, type) => category + SEP + type;
export const splitKey = (key) => {
  const i = key.indexOf(SEP);
  return { category: key.slice(0, i), type: key.slice(i + 1) };
};

/* Build the display tree from the generated dictionaries.
 *
 * `cropTypes`/`cropCategories` and `landTypes`/`landCategories` are parallel
 * arrays out of data/attributes.js. Forest trees have no species detail, so the
 * category carries a single self-named type. */
export function buildTaxonomy({ cropTypes = [], cropCategories = [], landTypes = [], landCategories = [] } = {}) {
  const byCategory = new Map(CATEGORY_ORDER.map((name) => [name, new Set()]));

  cropTypes.forEach((type, i) => {
    const name = CATEGORY_RENAME[cropCategories[i]] || cropCategories[i];
    if (byCategory.has(name)) byCategory.get(name).add(type);
  });

  /* Land-use "Other Trees" is the forest-tree stand; palms come through with a
   * single type of their own name. */
  landTypes.forEach((type, i) => {
    const category = landCategories[i];
    if (category !== 'Open Agriculture') return;
    if (type === 'Other Trees') byCategory.get('Forest Trees').add('Forest Trees');
    if (type === 'Palm Trees') byCategory.get('Date Palm').add('Date Palm');
  });

  return CATEGORIES.map((category) => ({
    name: category.name,
    kind: category.kind,
    color: category.color,
    types: [...byCategory.get(category.name)]
      .sort((a, b) => a.localeCompare(b))
      .map((type) => ({ name: type, color: colorOfType(category.name, type), key: typeKey(category.name, type) }))
  })).filter((c) => c.types.length);
}

/* Which slice of the taxonomy a page filters by. A crop page offering tree
 * filters, or the reverse, is noise. */
export const SCOPES = { field: FIELD_CATEGORIES, tree: TREE_CATEGORIES, all: CATEGORY_ORDER };

export function scopeTree(tree, scope = 'all') {
  const allowed = SCOPES[scope] || SCOPES.all;
  return tree.filter((c) => allowed.includes(c.name));
}
