/* The taxonomy shape the review settled on: six categories in a fixed order,
 * the dash gone from open field, forest trees present. */
import { buildTaxonomy, CATEGORY_ORDER, FIELD_CATEGORIES, TREE_CATEGORIES, typeKey, splitKey, scopeTree, colorOfType } from '../src/domain/taxonomy.js';
import { is, ok, done } from './helpers.js';

is(CATEGORY_ORDER, ['Cereals', 'Fodder', 'Open Field', 'Date Palm', 'Fruit Trees', 'Forest Trees'], 'category order');
is(FIELD_CATEGORIES, ['Cereals', 'Fodder', 'Open Field'], 'field categories');
is(TREE_CATEGORIES, ['Date Palm', 'Fruit Trees', 'Forest Trees'], 'tree categories');

const tree = buildTaxonomy({
  cropTypes: ['Wheat', 'Tomato', 'Lemon'],
  cropCategories: ['Cereals', 'Open-Field Produce', 'Fruit Trees'],
  landTypes: ['Palm Trees', 'Other Trees', 'Warehouse'],
  landCategories: ['Open Agriculture', 'Open Agriculture', 'Structures']
});

is(tree.map((c) => c.name), ['Cereals', 'Open Field', 'Date Palm', 'Fruit Trees', 'Forest Trees'], 'empty categories drop out');
is(tree.find((c) => c.name === 'Open Field').types.map((t) => t.name), ['Tomato'], 'the dash is gone from open field');
is(tree.find((c) => c.name === 'Forest Trees').types.map((t) => t.name), ['Forest Trees'], 'forest trees join the taxonomy');
is(tree.find((c) => c.name === 'Date Palm').types.map((t) => t.name), ['Date Palm'], 'palms come from land use');

// A leaf name alone is ambiguous, so keys carry the category.
const key = typeKey('Open Field', 'Watermelon');
is(splitKey(key), { category: 'Open Field', type: 'Watermelon' }, 'keys round-trip');
ok(key !== typeKey('Fruit Trees', 'Watermelon'), 'the same leaf in two categories is two keys');

is(scopeTree(tree, 'field').map((c) => c.name), ['Cereals', 'Open Field'], 'a crop page offers no tree filters');
is(scopeTree(tree, 'tree').map((c) => c.name), ['Date Palm', 'Fruit Trees', 'Forest Trees'], 'a tree page offers no crop filters');
ok(colorOfType('Cereals', 'Something Unlisted') === '#d4a017', 'an unlisted type inherits its category colour');

done('taxonomy');
