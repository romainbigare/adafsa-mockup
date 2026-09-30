// Render the RASAD Wafra Review to PDF with the preinstalled Chromium.
//   NODE_PATH=$(npm root -g) node build.mjs
// Fonts and the logo are shared with ../review, so the output matches the house style.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'RASAD_Wafra_Review.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + path.join(here, 'review.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('wrote', out);
