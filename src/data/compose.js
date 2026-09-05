/* Joining the surveys into one farm record.
 *
 * Two surveys describe the same land. The crop survey names species but barely
 * measures the woody perennials; the land-use survey measures everything but
 * names no species. Reading both without a rule would count the palms twice, so
 * the rule from domain/taxonomy.js is applied here and only here:
 *
 *   field crops   → the crop survey
 *   date palms    → the land-use survey's palm stands
 *   fruit trees   → the crop survey, where the species are
 *   forest trees  → the land-use survey's other-tree stands
 *
 * Nothing in this file invents a number. Everything it produces is in the
 * source data. The fabricated figures live in src/mock/. */

import { CATEGORY_RENAME, FIELD_CATEGORIES, TREE_CATEGORIES } from '../domain/taxonomy.js';

const STRUCTURE_CATEGORIES = ['Structures', 'Protected Agriculture'];

/* Tier 3 asks the classifier to tell a pump room from a filtration unit from a
 * desalination skid. Those sit side by side under one cover on these farms, and
 * both sides of the review doubted it can be done from imagery. The platform
 * models the tier so it can appear later, and shows nothing until it does. */
export const TIER3_PENDING_TYPES = ['Irrigation & Utilities'];

export function composeFarm(record, dictionaries) {
  const { cropTypes, cropCategories, landTypes, landCategories } = dictionaries;

  const taxonomy = [];
  const landParcels = [];

  for (const [index, area] of record.crops) {
    const category = CATEGORY_RENAME[cropCategories[index]] || cropCategories[index];
    if (category === 'Date Palm') continue; // the land-use survey owns palm area
    taxonomy.push({ category, type: cropTypes[index], area });
  }

  for (const [index, area] of record.land) {
    const category = landCategories[index];
    const type = landTypes[index];
    landParcels.push({ category, type, area });
    if (category !== 'Open Agriculture') continue;
    if (type === 'Palm Trees') taxonomy.push({ category: 'Date Palm', type: 'Date Palm', area });
    if (type === 'Other Trees') taxonomy.push({ category: 'Forest Trees', type: 'Forest Trees', area });
  }

  const areaIn = (categories) =>
    taxonomy.filter((t) => categories.includes(t.category)).reduce((a, t) => a + t.area, 0);

  const fieldArea = areaIn(FIELD_CATEGORIES);
  const treeArea = areaIn(TREE_CATEGORIES);
  const cultivatedArea = fieldArea + treeArea;
  const fallowArea = landParcels.filter((p) => p.type === 'Fallow Land').reduce((a, p) => a + p.area, 0);
  const barrenArea = landParcels.filter((p) => p.type === 'Barren Land').reduce((a, p) => a + p.area, 0);

  const structures = landParcels
    .filter((p) => STRUCTURE_CATEGORIES.includes(p.category))
    .map((p) => ({
      tier1: p.category,
      tier2: p.type,
      tier3: TIER3_PENDING_TYPES.includes(p.type) ? null : undefined,
      area: p.area
    }));

  return {
    ...record,
    taxonomy,
    landParcels,
    structures,
    fieldArea,
    treeArea,
    cultivatedArea,
    /* A holding can carry overlapping parcels, so the share is capped rather
     * than allowed to read above a hundred per cent. */
    cultivatedShare: record.area ? Math.min(100, (cultivatedArea / record.area) * 100) : 0,
    fallowArea,
    fallowShare: record.area ? Math.min(100, (fallowArea / record.area) * 100) : 0,
    barrenArea,
    structureArea: structures.reduce((a, s) => a + s.area, 0),
    categories: [...new Set(taxonomy.map((t) => t.category))],
    types: [...new Set(taxonomy.map((t) => t.type))]
  };
}
