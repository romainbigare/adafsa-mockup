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
  'crop/inventory': 'Shows what is planted and where. The numbers: farms with field crops, the area under them, how many different crops, and the average share of a farm. (Module 1: crop location, crop type, cultivated area.)',
  'crop/change': 'What changed since last season: net change, new land planted, land no longer planted, and how many farms started or stopped. Four tabs list those farms. (Module 1: seasonal change report.)',
  'crop/fallow': 'Land that can be farmed but has nothing on it: how much, what share of all farm area, how many farms have some, and how many are planting less than before. (Module 1: fallow land detection.)',
  'trees/inventory': 'Counts the trees: the total, date palms, fruit trees, forest trees, and how many palm varieties were found. Species break down under the map. (Module 2: tree location, count, species and variety.)',
  'trees/canopy': 'A health score for each farm\u2019s trees, read from the satellite: average palm score, average fruit tree score, farms with stressed trees, and farms in the lowest band. (Module 2: canopy health index.)',
  'trees/change': 'Trees since last year: net change, trees planted, trees removed, and how many farms changed. Numbers, not a map \u2014 the table names the farms. (Module 2: annual change detection.)',
  'land/landuse': 'How the land is used: land mapped, open farmland, buildings and greenhouses, fallow land and bare ground. Zoom in and the map draws the real shape of each piece of land.',
  'land/structures': 'What is built on the farms: structures found, farms with structures, area covered, and the main classes. Houses, sheds, water tanks, pens, roads, pump rooms. (Module 3: structure detection.)',
  'land/change': 'Buildings that are new and buildings that are gone: net change, new structures, structures removed, and the change in area covered. It needs two quarters of data first.',
  'ier/scores': 'A water score from 0 to 100 for every farm: farms scored, the average, how many keep their subsidy at 65 or more, how many need attention, and how many are in the lowest band. (Module 4: IER score, band and subsidy list.)',
  'ier/trend': 'Are the scores moving? The average score now, the change since last quarter or last year, how many farms got worse and how many improved. A line, and no map. (Module 4: quarter-on-quarter trend.)',
  'water/demand': 'Water this month: how much each farm is allowed, how much it used, how many farms use too much, and how much extra they used. (Module 6: monthly water demand and over-allocation flag.)',
  'water/budget': 'Water over a whole season: the total water needed, the harvest expected from it, the water for one kilo of food, and the area planted. (Module 6: seasonal water budget.)',
  'yield/forecast': 'What the harvest should be: expected tonnes, crops planted, how many farms are below the average for their crop, and how many are far below it. (Module 5: seasonal yield estimate.)',
  'yield/calendar': 'When each crop is in the ground: crops selected, the busiest month, the quietest month, and how many farms are planting at the busiest time.'
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
    note: 'The first page. Four numbers at the top: how many farms, their total area, how much land is in production, and how many crops are growing this month. The map shows where the farms are, and the two tables below split every crop group by the land it covers and by how many farms grow it.'
  },
  {
    id: 'F1', title: 'Farm register', section: 'Individual Farms', route: '#/farms',
    note: 'The list of every farm: how many, their total area, how many need attention, and how many use too much water. Search by number or owner, sort any column, open one farm.'
  },
  {
    id: 'F2', title: 'Farm profile', section: 'Individual Farms', route: '#/farm/4',
    note: 'One farm on one page: the owner, the province, land in production, the tree count, and how many things need attention. Below that: crops, trees, water score and buildings. All six modules meet here.'
  },
  {
    id: 'F3', title: 'Corrective actions', section: 'Individual Farms', route: '#/farm/4/actions',
    note: 'What is wrong on this farm and what to do: things to look at, and alerts that would go to the farmer. Each one is written as an action, not as a number to work out. Print it and take it to the visit.'
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
