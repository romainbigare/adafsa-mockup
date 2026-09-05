/* What the screen deck is allowed to know about the app.
 *
 * The screen list and the sections are both derived from
 * domain/modules.js, so a module gaining a sub-page gains a deck page with
 * nothing here to edit. Only the one-line notes are written by hand, and they
 * become the speaker notes on each slide.
 *
 * Read by tools/screendeck.mjs through the handle main.js hangs on globalThis.
 */

import { MODULES } from '../domain/modules.js';

/* A short code per module, printed on the page and used in cross-references. */
const CODE = { crop: 'C', trees: 'T', land: 'L', ier: 'I', water: 'W', yield: 'Y' };

/* One sentence per screen: what it is for, in the words someone would use to
 * describe it out loud. */
const NOTES = {
  'crop/inventory': 'What is growing and on how much land. The map colours each farm by the crop group covering most of it; the two tables underneath open from a group down to the individual crop.',
  'crop/change': 'What moved since the comparison quarter. Gains and losses are reported apart from each other, and the four tabs answer the question the page exists for: who started, who stopped, who grew and who shrank.',
  'crop/fallow': 'Land that has fallen out of production. The figure that matters operationally is the last one — farms planting less than before, because that is what generates a message to the farmer.',
  'trees/inventory': 'Date palms, fruit trees and forest stands. The largest module by contract share, and the one to show first. Species and varieties break down underneath the map.',
  'trees/canopy': 'Tree health scored per farm rather than per tree. The holdings here are small, share one water source and are managed as a unit, so the farm is the cluster. One score for palms, one for fruit trees.',
  'trees/change': 'Trees planted and trees removed, as numbers. No map — the review was explicit that this question needs hard data, and the table names the farms instead.',
  'land/landuse': 'The standing inventory of how ground is used. Zoom in and the map draws the real parcel outlines; before that each holding is a dot coloured by the class covering most of it.',
  'land/structures': 'What is built on the land. Tier 2 — the type of each structure — is what the survey delivers and what the October rollout targets. The page says plainly that tier 3 is not available yet.',
  'land/change': 'Structures appearing and disappearing. Formally a second-version item, built now so the alert is wired the day two quarters of history exist.',
  'ier/scores': 'How efficiently each farm irrigates, measured against its own province rather than the emirate. The table answers the question as it was asked: every farm in Al Ain flagged for attention.',
  'ier/trend': 'Whether scores are moving. A trend line and hard numbers, and deliberately no map — a map of who improved was considered and rejected as confusing.',
  'water/demand': 'What each farm is allowed this month and what it actually used. The over-allocation flag is raised against the month, never the season: by the time a season closes there is nothing left to do about it.',
  'water/budget': 'What a crop costs the emirate in water over a full growing season, and what it returns. Cubic metres per kilo is the number worth quoting in a policy conversation.',
  'yield/forecast': 'Expected production by crop, the average yield, and how many farms sit below it. No map here either — it was dropped in review and can come back if ADAFSA asks.',
  'yield/calendar': 'When each crop is in the ground. The curve comes from each holding planting on its own schedule, which is why it rises and falls rather than switching on and off.'
};

const moduleScreens = MODULES.flatMap((module) =>
  module.pages.map((page, i) => ({
    id: CODE[module.key] + (i + 1),
    title: page.label,
    section: module.label,
    route: `#/m/${module.key}/${page.key}`,
    note: NOTES[`${module.key}/${page.key}`] || module.blurb
  })));

/* The screens that are not module sub-pages. Farm 4 is the worked example: a
 * real holding from the survey with palms, three crops and something open. */
const otherScreens = [
  {
    id: 'OV', title: 'Overview', section: 'Overview', route: '#/overview',
    note: 'The landing page, and an inventory rather than a verdict. A ministry tracks production capacity; whether one farm is struggling is a local question and belongs at farm level. Count bubbles, no scoring, and the two distribution tables already shown to ADAFSA from the pilot.'
  },
  {
    id: 'F1', title: 'Farm register', section: 'Individual Farms', route: '#/farms',
    note: 'Every farm, searchable by number or owner and sortable on any column. Paged, because the survey holds five hundred and the emirate holds tens of thousands.'
  },
  {
    id: 'F2', title: 'Farm profile', section: 'Individual Farms', route: '#/farm/4',
    note: 'Page one of two for a farm: what it grows, its trees, its structures, its efficiency score and its water. What is absent matters as much — no weather, no soil moisture, no scheduler. Those belong in the farmer’s own application.'
  },
  {
    id: 'F3', title: 'Corrective actions', section: 'Individual Farms', route: '#/farm/4/actions',
    note: 'Page two: every finding stated as something to do rather than a reading to interpret, and an ending that is an action — print it and take it to the visit.'
  },
  {
    id: 'S1', title: 'Support', section: 'Support', route: '#/support',
    note: 'One page, reached from one entry in the menu. In the platform this replaces, more than half the menu was support and settings.'
  }
];

export const SCREENS = Object.fromEntries(
  [...otherScreens, ...moduleScreens].map((s) => [s.id, s])
);


/* Sections, in page order. They follow the navigation, because that is the
 * order anyone reviewing the platform will walk it in. */
export const SCREEN_GROUPS = [
  { name: 'Overview', ids: ['OV'] },
  ...MODULES.map((module) => ({
    name: module.label,
    ids: module.pages.map((_, i) => CODE[module.key] + (i + 1))
  })),
  { name: 'Individual Farms', ids: ['F1', 'F2', 'F3'] },
  { name: 'Support', ids: ['S1'] }
];

/* Screens the printed review skips. A deck decision, stated once and out loud
 * rather than by quietly leaving something out of the list. */
export const DECK_OMIT = [];
