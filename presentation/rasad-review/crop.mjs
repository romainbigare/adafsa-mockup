// Crops evidence pictures out of full-page screenshots of the RASAD mockup.
// usage: NODE_PATH=$(npm root -g) node crop.mjs <shots-dir>
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const shots = process.argv[2];
// [output, source, x, y, w, h, outWidth]
const CROPS = [
  ['header.png', '01-landing.png', 256, 0, 1184, 56, 1184],
  ['sync.png', '01-landing.png', 10, 790, 236, 70, 236],
  ['farm-page.png', '03-nav-farm.png', 0, 0, 1440, 4392, 300],
  ['telemetry-title.png', '03-nav-farm.png', 280, 890, 1136, 110, 900],
  ['passes.png', '04-nav-farm-monitoring.png', 297, 775, 1000, 170, 900],
  ['kpis.png', '04-nav-farm-monitoring.png', 280, 985, 1136, 165, 900],
  ['canopy-bar.png', '02-executive-full.png', 280, 1385, 1136, 90, 900],
  ['cluster-map.png', '02-executive-full.png', 280, 2300, 1136, 560, 900],
  ['ranking-row.png', '03-nav-farm.png', 280, 2570, 1136, 262, 900],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [out, src, x, y, w, h, ow] of CROPS) {
  const b64 = readFileSync(path.join(shots, src)).toString('base64');
  const s = ow / w;
  await page.setViewportSize({ width: Math.ceil(ow), height: Math.ceil(h * s) });
  await page.setContent(`<body style="margin:0;overflow:hidden"><img src="data:image/png;base64,${b64}"
    style="position:absolute;transform-origin:0 0;transform:scale(${s});left:${-x * s}px;top:${-y * s}px"></body>`);
  await page.waitForLoadState('load');
  await page.screenshot({ path: path.join('img', out) });
  console.log('wrote', out);
}
await browser.close();
