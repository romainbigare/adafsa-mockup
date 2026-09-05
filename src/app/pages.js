/* Route to page module.
 *
 * Written out rather than built from a template so the import paths are static
 * and the browser resolves them directly. Each page module exports
 * `render(context)` and returns an element. */

const PAGES = {
  overview: () => import('../pages/overview.js'),
  'crop/inventory': () => import('../pages/crop/inventory.js'),
  'crop/change': () => import('../pages/crop/change.js'),
  'crop/fallow': () => import('../pages/crop/fallow.js'),
  'trees/inventory': () => import('../pages/trees/inventory.js'),
  'trees/canopy': () => import('../pages/trees/canopy.js'),
  'trees/change': () => import('../pages/trees/change.js'),
  'land/landuse': () => import('../pages/land/landuse.js'),
  'land/structures': () => import('../pages/land/structures.js'),
  'land/change': () => import('../pages/land/change.js'),
  'ier/scores': () => import('../pages/ier/scores.js'),
  'ier/trend': () => import('../pages/ier/trend.js'),
  'water/demand': () => import('../pages/water/demand.js'),
  'water/budget': () => import('../pages/water/budget.js'),
  'yield/forecast': () => import('../pages/yield/forecast.js'),
  'yield/calendar': () => import('../pages/yield/calendar.js'),
  farms: () => import('../pages/farms/register.js'),
  'farms/profile': () => import('../pages/farms/profile.js'),
  'farms/actions': () => import('../pages/farms/actions.js'),
  support: () => import('../pages/support.js')
};

export const loadPage = (key) => (PAGES[key] ? PAGES[key]() : null);
export const knownPages = () => Object.keys(PAGES);
