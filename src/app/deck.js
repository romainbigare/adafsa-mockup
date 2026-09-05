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

/* What each screen is, in plain words.
 *
 * These are printed on the slide and read out loud, so they are written for a
 * reader whose English is a second or third language: short sentences, common
 * words, one idea at a time. Each one says what the screen shows and what it is
 * for, and names the contract deliverable behind it where that helps. */
const NOTES = {
  'crop/inventory': 'Shows what is planted on every farm and how much land each crop takes. The map gives each farm the colour of its main crop. (Module 1: crop location, crop type, cultivated area.)',
  'crop/change': 'Shows what changed since the last season. Four tabs: farms that started a crop, stopped a crop, planted more, or planted less. (Module 1: seasonal change report.)',
  'crop/fallow': 'Shows land that can be farmed but has nothing growing on it now. The last number is the one to act on — farms that plant less than before. (Module 1: fallow land detection.)',
  'trees/inventory': 'Counts the trees on every farm: date palms, fruit trees and forest trees. It also gives the species and the varieties. (Module 2: tree location, tree count, species and variety.)',
  'trees/canopy': 'Gives every farm a health score for its trees, read from the satellite. The score is for the whole farm, not for one tree. Palms and fruit trees are scored apart. (Module 2: canopy health index.)',
  'trees/change': 'Shows how many trees were planted and how many were removed since last year. Numbers, not a map — the table names the farms. (Module 2: annual change detection.)',
  'land/landuse': 'Shows how the land is used on every farm: fields, palms, other trees, greenhouses, buildings and empty land. Zoom in and the map draws the real shape of each piece of land.',
  'land/structures': 'Shows what is built on the farms: houses, labour housing, sheds, water tanks, animal pens, roads and pump rooms. It gives the type of each one. (Module 3: structure detection.)',
  'land/change': 'Shows buildings that are new and buildings that are gone. It needs two quarters of data before it can show anything.',
  'ier/scores': 'Gives every farm a score from 0 to 100 for how well it waters its crops, and a band for that score. The tabs list the farms at 65 or more, which keep their subsidy. (Module 4: IER score, band and subsidy list.)',
  'ier/trend': 'Shows whether the scores are getting better or worse over time. A line and hard numbers, and no map on purpose. (Module 4: quarter-on-quarter trend.)',
  'water/demand': 'Shows how much water each farm should use this month and how much it really used. Farms using far more than they need are flagged. (Module 6: monthly water demand and over-allocation flag.)',
  'water/budget': 'Shows how much water a crop needs for a whole season, and how much food it gives back for that water. Useful when deciding what to grow. (Module 6: seasonal water budget.)',
  'yield/forecast': 'Shows how much each crop should produce, the average for each dunum, and how many farms are below that average. (Module 5: seasonal yield estimate.)',
  'yield/calendar': 'Shows when each crop is in the ground, month by month. Every farm plants at its own time, so the curve rises and falls.'
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
    note: 'The first page. It shows how many farms there are, how much land they cover, and where they are. Open a module on the left to go deeper.'
  },
  {
    id: 'F1', title: 'Farm register', section: 'Individual Farms', route: '#/farms',
    note: 'The list of every farm. Search by farm number or owner, sort on any column, and open one farm. Every result in the contract is given per farm.'
  },
  {
    id: 'F2', title: 'Farm profile', section: 'Individual Farms', route: '#/farm/4',
    note: 'One farm on one page: where it is, what it grows, its trees, its water score, its water use and its buildings. All six modules meet here.'
  },
  {
    id: 'F3', title: 'Corrective actions', section: 'Individual Farms', route: '#/farm/4/actions',
    note: 'Says what is wrong on this farm and what to do about it. Each problem is written as an action, not as a number to work out. Print the page and take it to the farm visit.'
  },
  {
    id: 'S1', title: 'Support', section: 'Support', route: '#/support',
    note: 'Where to ask for help, and a note on what is real data and what is made up in this mockup. One page — in the old platform, more than half the menu was support and settings.'
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
