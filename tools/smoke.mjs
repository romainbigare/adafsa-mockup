/* Walks every route in a real browser and reports anything the console
 * complains about. Not part of the app — a development check.
 *
 * Needs Playwright available to node (globally installed is fine):
 *   node tools/smoke.mjs [baseUrl] [screenshotDir]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:8137';
const shots = process.argv[3] || null;
if (shots) mkdirSync(shots, { recursive: true });

const ROUTES = [
  ['overview', '#/overview'],
  ['overview-filtered', '#/overview?region=alain&types=Open%20Field%3ATomato'],
  ['crop-inventory', '#/m/crop/inventory'],
  ['crop-change', '#/m/crop/change'],
  ['crop-fallow', '#/m/crop/fallow'],
  ['trees-inventory', '#/m/trees/inventory'],
  ['trees-canopy', '#/m/trees/canopy'],
  ['trees-change', '#/m/trees/change'],
  ['land-landuse', '#/m/land/landuse'],
  ['land-structures', '#/m/land/structures'],
  ['land-change', '#/m/land/change'],
  ['ier-scores', '#/m/ier/scores'],
  ['ier-trend', '#/m/ier/trend'],
  ['water-demand', '#/m/water/demand'],
  ['water-budget', '#/m/water/budget'],
  ['yield-forecast', '#/m/yield/forecast'],
  ['yield-calendar', '#/m/yield/calendar'],
  ['farms-register', '#/farms'],
  ['farm-profile', '#/farm/4'],
  ['farm-actions', '#/farm/4/actions'],
  ['support', '#/support']
];

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: '<-loopback>,localhost,127.0.0.1' } } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

const problems = [];
page.on('console', (message) => {
  if (message.type() !== 'error') return;
  const text = message.text();
  if (/tile\.openstreetmap|arcgisonline|unpkg|ERR_/i.test(text)) return; // network, not the app
  problems.push({ route: current, text });
});
page.on('pageerror', (error) => problems.push({ route: current, text: String(error) }));

let current = '';
for (const [name, hash] of ROUTES) {
  current = name;
  await page.goto(base + '/index.html' + hash, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  const heading = await page.locator('.page-title h1').first().textContent().catch(() => '(none)');
  const empty = await page.locator('.page-content').first().evaluate((el) => el.textContent.trim().length).catch(() => 0);
  console.log(`${empty > 200 ? 'ok  ' : 'THIN'} ${name.padEnd(20)} ${String(heading).slice(0, 42).padEnd(44)} ${empty} chars`);
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: false });
}

await browser.close();

if (problems.length) {
  console.log(`\n${problems.length} console problem(s):`);
  for (const p of problems.slice(0, 25)) console.log(`  [${p.route}] ${p.text.slice(0, 300)}`);
  process.exit(1);
}
console.log('\nno console errors');
