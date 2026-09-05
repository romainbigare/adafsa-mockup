/* The six contract modules and the sub-pages inside them.
 *
 * This is the shape of the product. The navigation, the router and the page
 * loader all read it, so a module gains a page by gaining an entry here and a
 * file under src/pages/<module>/.
 *
 * Names and order come from the review:
 *   crop monitoring · tree monitoring · land use and structures ·
 *   irrigation efficiency · crop water calculator · yield optimisation
 *
 * `scope` is the slice of the taxonomy the module's filter rail offers.
 * `kind` on a page is its archetype — 'inventory' pages may carry a map,
 * 'change' pages are hard data and carry none. */

export const MODULES = [
  {
    key: 'crop',
    label: 'Crop Monitoring',
    icon: 'grass',
    scope: 'field',
    blurb: 'What is growing, on how much land, and how that has moved since last season.',
    pages: [
      { key: 'inventory', label: 'Crops & cultivated area', kind: 'inventory' },
      { key: 'change', label: 'Seasonal change', kind: 'change' },
      { key: 'fallow', label: 'Fallow land', kind: 'inventory' }
    ]
  },
  {
    key: 'trees',
    label: 'Tree Monitoring',
    icon: 'park',
    scope: 'tree',
    blurb: 'Date palms, fruit trees and forest stands — counts, species, canopy condition.',
    pages: [
      { key: 'inventory', label: 'Trees, species & varieties', kind: 'inventory' },
      { key: 'canopy', label: 'Canopy health', kind: 'inventory' },
      { key: 'change', label: 'Annual change', kind: 'change' }
    ]
  },
  {
    key: 'land',
    label: 'Land Use & Structures',
    icon: 'home_work',
    scope: 'all',
    blurb: 'The standing inventory: how land is used and what is built on it.',
    pages: [
      { key: 'landuse', label: 'Land use', kind: 'inventory' },
      { key: 'structures', label: 'Structures', kind: 'inventory' },
      { key: 'change', label: 'Change tracking', kind: 'change' }
    ]
  },
  {
    key: 'ier',
    label: 'Irrigation Efficiency',
    icon: 'water_drop',
    scope: 'all',
    blurb: 'How efficiently each farm irrigates, against its own province.',
    pages: [
      { key: 'scores', label: 'Efficiency scores', kind: 'inventory' },
      { key: 'trend', label: 'Quarterly trend', kind: 'change' }
    ]
  },
  {
    key: 'water',
    label: 'Crop Water Calculator',
    icon: 'opacity',
    scope: 'all',
    blurb: 'What each farm should be using this month, what it is using, and what a crop costs in water.',
    pages: [
      { key: 'demand', label: 'Monthly demand & over-allocation', kind: 'change' },
      { key: 'budget', label: 'Seasonal water budget', kind: 'change' }
    ]
  },
  {
    key: 'yield',
    label: 'Yield Optimisation',
    icon: 'agriculture',
    scope: 'all',
    blurb: 'Expected production by crop, and when each crop is in the ground.',
    pages: [
      { key: 'forecast', label: 'Yield forecast', kind: 'change' },
      { key: 'calendar', label: 'Crop calendar', kind: 'change' }
    ]
  }
];

export const moduleByKey = (key) => MODULES.find((m) => m.key === key) || null;

export function pageByKey(moduleKey, pageKey) {
  const module = moduleByKey(moduleKey);
  if (!module) return null;
  return module.pages.find((p) => p.key === pageKey) || null;
}

/* A module opens on its first sub-page, so no module ever shows a screen that
 * is only a menu. */
export const defaultPageOf = (moduleKey) => moduleByKey(moduleKey)?.pages[0]?.key || null;

export const allRoutes = () =>
  MODULES.flatMap((m) => m.pages.map((p) => ({ module: m.key, page: p.key, label: p.label, kind: p.kind })));
