/* The navigation model.
 *
 * The order is the one agreed in review, and the modules are named as the
 * client will hear them named. Support collapses to a single entry at the
 * bottom — it was more than half the old menu.
 *
 * A module's sub-pages appear underneath it when it is the section you are in,
 * which is how the question was put in the review: "is there a sub-menu called
 * seasonal change report?" */

import { MODULES } from '../domain/modules.js';

const ICONS = { crop: 'crop', trees: 'trees', land: 'land', ier: 'water', water: 'calculator', yield: 'yieldup' };

export const NAV = [
  { id: 'overview', label: 'Overview', icon: 'overview', segments: ['overview'] },
  ...MODULES.map((module) => ({
    id: module.key,
    label: module.label,
    icon: ICONS[module.key] || 'overview',
    segments: ['m', module.key, module.pages[0].key],
    children: module.pages.map((page) => ({
      id: `${module.key}/${page.key}`,
      label: page.label,
      segments: ['m', module.key, page.key]
    }))
  })),
  { id: 'farms', label: 'Individual Farms', icon: 'farms', segments: ['farms'] }
];

export const NAV_FOOTER = [{ id: 'support', label: 'Support', icon: 'support', segments: ['support'] }];

/* Which navigation entry a route belongs to, and what to write in the header.
 * Farm pages sit under Individual Farms rather than inventing a section. */
export function locate(segments) {
  const [first, second, third] = segments;
  if (first === 'm') {
    const module = MODULES.find((m) => m.key === second);
    if (!module) return null;
    const page = module.pages.find((p) => p.key === third) || module.pages[0];
    return { navId: module.key, childId: `${module.key}/${page.key}`, eyebrow: module.label, title: page.label, pageKey: `${module.key}/${page.key}`, module, page };
  }
  if (first === 'farm') {
    const tail = segments[2] === 'actions' ? 'actions' : 'profile';
    return { navId: 'farms', eyebrow: 'Individual Farms', title: tail === 'actions' ? 'Corrective actions' : 'Farm profile', pageKey: `farms/${tail}`, farmId: second };
  }
  if (first === 'farms') return { navId: 'farms', eyebrow: 'Individual Farms', title: 'Farm register', pageKey: 'farms' };
  if (first === 'support') return { navId: 'support', eyebrow: '', title: 'Support', pageKey: 'support' };
  return { navId: 'overview', eyebrow: '', title: 'Overview', pageKey: 'overview' };
}
