import { chromium } from 'playwright';
const [url, out, selector] = process.argv.slice(2);
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const b = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: '<-loopback>,localhost,127.0.0.1' } } : {});
const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(2600);
if (selector) { await p.click(selector); await p.waitForTimeout(500); }
await p.screenshot({ path: out });
await b.close();
