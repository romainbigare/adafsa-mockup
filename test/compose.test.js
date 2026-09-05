/* The join rule that stops the palms being counted twice. */
import { composeFarm } from '../src/data/compose.js';
import { is, ok, done } from './helpers.js';

const dictionaries = {
  cropTypes: ['Wheat', 'Date Palm', 'Lemon'],
  cropCategories: ['Cereals', 'Date Palm', 'Fruit Trees'],
  landTypes: ['Palm Trees', 'Other Trees', 'Warehouse', 'Fallow Land', 'Greenhouse', 'Irrigation & Utilities'],
  landCategories: ['Open Agriculture', 'Open Agriculture', 'Structures', 'Open Agriculture', 'Protected Agriculture', 'Structures']
};

const farm = composeFarm(
  { fid: 1, owner: 'A', area: 100, lat: 24, lng: 55, province: 'alain', hasPalms: true,
    crops: [[0, 10], [1, 5], [2, 3]], land: [[0, 40], [1, 6], [2, 2], [3, 8], [4, 1], [5, 0.5]] },
  dictionaries
);

const palm = farm.taxonomy.filter((t) => t.category === 'Date Palm');
is(palm.length, 1, 'palms appear once');
is(palm[0].area, 40, 'palm area comes from the land survey, not the crop survey');
is(farm.taxonomy.find((t) => t.category === 'Fruit Trees').area, 3, 'fruit trees keep their species-level area');
is(farm.taxonomy.find((t) => t.category === 'Forest Trees').area, 6, 'forest stands come from the land survey');
is(farm.fieldArea, 10, 'field area counts only the field categories');
is(farm.treeArea, 49, 'tree area counts all three tree groups');
is(farm.cultivatedArea, 59);
is(farm.fallowArea, 8, 'fallow is a land-use class');

is(farm.structures.length, 3, 'structures span both built categories');
is(farm.structureArea, 3.5);
ok(farm.structures.find((s) => s.tier2 === 'Irrigation & Utilities').tier3 === null, 'tier 3 is modelled as pending, not absent');
ok(farm.structures.find((s) => s.tier2 === 'Warehouse').tier3 === undefined, 'other types have no tier 3 to wait for');

const overlapping = composeFarm(
  { fid: 2, owner: 'B', area: 10, lat: 24, lng: 55, province: 'alain', hasPalms: false, crops: [[0, 40]], land: [] },
  dictionaries
);
is(overlapping.cultivatedShare, 100, 'overlapping parcels never read above a hundred per cent');

done('compose');
