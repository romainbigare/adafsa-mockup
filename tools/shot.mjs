import { chromium } from 'playwright';
const [url, out, full] = process.argv.slice(2);
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const b = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: '<-loopback>,localhost,127.0.0.1' } } : {});
const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(Number(process.env.WAIT || 2600));
await p.screenshot({ path: out, fullPage: full === 'full' });
await b.close();
