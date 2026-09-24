/* The bilingual tour deck says what the screens show.
 *
 * tools/tourdeck.mjs photographs the screens and places the markers; it cannot
 * tell whether the words beside them are still true. These checks can: every
 * point has a marker and a translation, every page the tour opens exists, and
 * the few figures the copy quotes from the sample data are the figures the
 * screens will show. A change to the data that makes a slide wrong fails here
 * instead of in front of a partner. */
import { COVER, SCREENS, CLOSING, EXAMPLE_FARM, ORCHARD_FARM } from '../tools/tour/content.mjs';
import { MODULES } from '../src/domain/modules.js';
import { ICON_NAMES } from '../src/app/icons.js';
import { allFarms, farmById } from '../src/data/store.js';
import { openIssues } from '../src/domain/issues.js';
import { CANOPY, worstCount } from '../src/domain/bands.js';
import { is, ok, done } from './helpers.js';

const LANGS = ['en', 'az'];

// ---------------------------------------------------------------- shape --
ok(SCREENS.length >= 4 && SCREENS.length <= 8, 'a short tour: a handful of screens');
is(new Set(SCREENS.map((s) => s.id)).size, SCREENS.length, 'screen ids are unique');
ok(SCREENS.some((s) => s.id === COVER.screen), 'the cover picture is one of the screens');

for (const screen of SCREENS) {
  for (const lang of LANGS) {
    const copy = screen[lang];
    ok(copy && copy.title && copy.intro, `${screen.id}: ${lang} has a title and an intro`);
    is(copy.points.length, screen.markers.length, `${screen.id}: every ${lang} point has a marker, and every marker a point`);
    ok(copy.points.every((p) => p.head && p.text), `${screen.id}: every ${lang} point has a heading and a line`);
  }
  ok(screen.markers.length >= 2 && screen.markers.length <= 4, `${screen.id}: two to four points, as in the reference deck`);
  ok(screen.markers.every((m) => typeof m.sel === 'string' && m.sel.length), `${screen.id}: every marker names an element`);
}

/* Room on the slide, in characters. The columns are 3.4 inches wide: two lines
 * of title, four of intro, one of heading and three of text per point. The
 * build does not check fit, so this is the guard against a translation that
 * runs into the next block. */
const LIMITS = { title: 40, intro: 150, head: 30, text: 100 };
for (const screen of SCREENS) {
  for (const lang of LANGS) {
    const copy = screen[lang];
    ok(copy.title.length <= LIMITS.title, `${screen.id}/${lang}: title fits two lines — "${copy.title}"`);
    ok(copy.intro.length <= LIMITS.intro, `${screen.id}/${lang}: intro fits four lines`);
    for (const p of copy.points) {
      ok(p.head.length <= LIMITS.head, `${screen.id}/${lang}: "${p.head}" fits one line`);
      ok(p.text.length <= LIMITS.text, `${screen.id}/${lang}: "${p.text}" fits three lines`);
    }
  }
}

for (const lang of LANGS) {
  ok(COVER[lang].title && COVER[lang].subtitle && COVER[lang].line, `the cover has its ${lang} lines`);
  ok(COVER.footnote[lang], `the cover footnote has its ${lang} half`);
  ok(CLOSING[lang].title && CLOSING[lang].next, `the closing page has its ${lang} lines`);
  ok(CLOSING.steps.every((s) => s[lang].head && s[lang].text), `every closing step has its ${lang} words`);
}
is(CLOSING.steps.length, 4, 'four steps, as in the reference deck');
is(CLOSING.steps.filter((s) => s.highlight).length, 1, 'one step stands out');
ok(CLOSING.steps.every((s) => ICON_NAMES.includes(s.icon)), 'every closing icon is in the app icon set');

// --------------------------------------------------------------- routes --
const farms = new Set(allFarms().map((f) => String(f.fid)));
for (const screen of SCREENS) {
  const route = screen.route;
  const module = route.match(/^#\/m\/([a-z]+)\/([a-z]+)$/);
  const farm = route.match(/^#\/farm\/(\d+)(\/actions)?$/);
  ok(route === '#/overview'
    || (module && MODULES.some((m) => m.key === module[1] && m.pages.some((p) => p.key === module[2])))
    || (farm && farms.has(farm[1])), `${screen.id}: ${route} is a page the app has`);
}

// ---------------------------------------------- what the copy promises --
const find = (id) => SCREENS.find((s) => s.id === id);
const says = (id, n, needle) => LANGS.every((lang) => find(id)[lang].points[n].text.includes(needle));

/* "Here: 6 farms have very stressed trees." */
const scored = allFarms().filter((f) => f.canopy != null);
const severe = worstCount(CANOPY, scored, (f) => f.canopy);
ok(severe > 0, 'some farms are in the lowest canopy band');
ok(says('health', 1, String(severe)), `the health slide quotes the ${severe} farms in the lowest band`);

/* The worked farm's first problem is its trees, in the worst band — the farm
 * slides say "the trees look very stressed" and point at it first. */
const example = farmById(EXAMPLE_FARM);
const issues = openIssues(example);
is(issues[0].id, 'canopy', 'the example farm\'s most urgent problem is its trees');
is(issues[0].severity, 'act', 'and it is in the band the copy calls very stressed');
ok(issues[0].action.includes('pests'), 'the suggested action names pests, as the slide says');

/* "Here the farm used only 70% of the water it is allowed." */
const used = Math.round(example.waterUsePct);
ok(issues.some((i) => i.id === 'under-water'), 'the example farm is short of water, the possible cause');
ok(says('actions', 3, String(used)), `the actions slide quotes the ${used}% the farm used`);

/* The orchard map shows a mix, or the colours say nothing. */
const orchard = farmById(ORCHARD_FARM);
ok(orchard.varieties.filter((v) => v.trees > 0).length >= 3, 'the orchard farm has at least three varieties');
ok(orchard.trees >= 200, 'and enough trees for the map to read as an orchard');

done('tour');
