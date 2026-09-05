/* Screenshot a route, optionally after clicking something first.
 *   node tools/clickshot.mjs <url> <out.png> [selector]
 */
import { chromium } from 'playwright';
const [url, out, selector] = process.argv.slice(2);
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: '<-loopback>,localhost,127.0.0.1' } } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2400);
if (selector) { await page.click(selector); await page.waitForTimeout(450); }
await page.screenshot({ path: out });
await browser.close();
