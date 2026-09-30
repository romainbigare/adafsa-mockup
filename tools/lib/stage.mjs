/* The stage both deck builders photograph the platform on.
 *
 * A local server for the app, a relay for its map tiles, and a browser pointed
 * at the two. tools/screendeck.mjs and tools/tourdeck.mjs differ in what they
 * photograph and how they typeset it; how the app gets onto a screen is the
 * same for both, and lives here so it cannot drift between them.
 */

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TILES = join(ROOT, '.tile-cache');       // survives the build; a second run is offline

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf'
};

/* Esri serves JPEG, OpenStreetMap serves PNG, and the cache keeps bytes rather
 * than headers. The first two bytes say which. */
const tileType = (b) => (b[0] === 0x89 && b[1] === 0x50 ? 'image/png' : 'image/jpeg');

/* MAP TILES COME THROUGH HERE, NOT THROUGH THE BROWSER.
 *
 * A page photographed without its basemap is a page with a white hole where
 * the map should be, and that is how it prints. The browser cannot reach the
 * tile servers from inside the build, but this process can, so it fetches each
 * tile and hands it back over plain HTTP on localhost. Tiles are kept in
 * .tile-cache, so a second build draws its maps without a network at all.
 *
 * Only the deck builds use this. The published site keeps the real tile URLs. */
export async function openStage({ viewport, scale = 2, storage = {} }) {
  const tileStats = { hit: 0, fetched: 0, failed: 0 };
  const tileFailures = [];
  const inFlight = new Map();

  async function tile(url) {
    const key = createHash('sha1').update(url).digest('hex');
    const file = join(TILES, `${key}.bin`);
    try {
      const cached = await readFile(file);
      tileStats.hit++;
      return cached;
    } catch { /* not cached yet */ }
    if (inFlight.has(url)) return inFlight.get(url);
    const job = (async () => {
      const res = await fetch(url, { headers: { 'user-agent': 'adafsa-mockup screendeck' } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const body = Buffer.from(await res.arrayBuffer());
      await writeFile(file, body);
      tileStats.fetched++;
      return body;
    })();
    inFlight.set(url, job);
    try { return await job; } finally { inFlight.delete(url); }
  }

  const server = createServer(async (req, res) => {
    const [path, search = ''] = req.url.split('?');
    if (path === '/__tiles') {
      const url = new URLSearchParams(search).get('u');
      try {
        const body = await tile(url);
        res.writeHead(200, { 'content-type': tileType(body), 'cache-control': 'no-store' });
        res.end(body);
      } catch (e) {
        tileStats.failed++;
        tileFailures.push(e.message);
        res.writeHead(502); res.end();
      }
      return;
    }
    try {
      const file = join(ROOT, decodeURIComponent(path) === '/' ? 'index.html' : decodeURIComponent(path));
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await mkdir(TILES, { recursive: true });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  /* A machine may carry a Chromium that predates this Playwright; pointing at it
   * is cheaper than downloading a second copy. */
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    ...(proxy ? { proxy: { server: proxy, bypass: '<-loopback>,localhost,127.0.0.1' } } : {})
  });
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.addInitScript((relay) => { globalThis.ADAFSA_TILE_RELAY = relay; }, `http://127.0.0.1:${port}/__tiles`);
  /* Browser preferences the app would otherwise remember from a person — the
   * narrow menu, for one — set before the first page draws. */
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, storage);

  /* Fifty unattended renders without this, and a screen that throws halfway
   * through is photographed mid-collapse with nobody the wiser until it prints. */
  const problems = [];
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/ERR_/i.test(text)) return;                    // network, not the app
    problems.push(text);
  });

  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!globalThis.adafsa);

  return {
    page,
    problems,
    tileStats,
    tileFailures,
    /* Navigate and wait for the page to say it has finished drawing. */
    async go(route) {
      await page.evaluate((r) => globalThis.adafsa.go(r), route);
      await page.waitForFunction(
        (r) => document.documentElement.dataset.deckReady === '1' && location.hash === r,
        route
      );
    },
    settleTiles: (options) => settleTiles(page, options),
    async close() {
      await browser.close();
      server.close();
    }
  };
}

/* A map is photographed when it has stopped arriving, not on a hopeful timer.
 * Leaflet marks each tile element as loaded, so the page can say when the last
 * one landed; a map that never finishes gives up after a few seconds rather
 * than stalling the build. */
export async function settleTiles(page, { timeout = 9000 } = {}) {
  if (!await page.evaluate(() => !!document.querySelector('.leaflet-container'))) return;
  const until = Date.now() + timeout;
  let steady = 0;
  let last = -1;
  while (Date.now() < until) {
    const { loaded, pending } = await page.evaluate(() => ({
      loaded: document.querySelectorAll('.leaflet-tile-loaded').length,
      pending: document.querySelectorAll('.leaflet-tile:not(.leaflet-tile-loaded)').length
    }));
    if (loaded && !pending && loaded === last) steady++; else steady = 0;
    if (steady >= 2) return;
    last = loaded;
    await page.waitForTimeout(220);
  }
}

/* Refuse to build on a capture problem rather than print it. Both builders
 * end their capture phase through here. */
export function stopOnProblems({ problems, tileFailures }) {
  if (problems.length) {
    console.error(`${problems.length} console error(s) while capturing:`);
    for (const p of problems.slice(0, 8)) console.error(`  ${p}`);
    process.exit(1);
  }
  if (tileFailures.length) {
    console.error(`${tileFailures.length} map tile(s) could not be fetched; the maps would print with holes:`);
    for (const f of tileFailures.slice(0, 5)) console.error(`  ${f}`);
    process.exit(1);
  }
}
