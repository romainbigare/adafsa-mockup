/* Build a printable screen deck from the running platform.
 *
 *   node tools/screendeck.mjs [--out docs/ADAFSA_Platform_Screens.pptx]
 *
 * Everything on the pages is read out of the live app: the screen list, the
 * sections, the titles, the speaker notes and even the wordmark. Nothing is
 * maintained twice, so nothing drifts.
 *
 * The deck exists to be printed, written on and handed back, which decides the
 * layout:
 *   - One screen per page, so a comment has something to attach to.
 *   - Nothing is ever drawn on top of a screenshot. The numbered discs sit in
 *     the margin above and beside it; the key is underneath.
 *   - The right-hand column carries the context — the rest of a scrolling
 *     screen, and what the small buttons do.
 *   - Everything is given room. A full page is a page nobody writes on.
 *
 * The technique is from the Wafra farm-app deck; the geometry is not. That app
 * is a phone in the left third of the page with two thirds of white beside it.
 * This one is a 1440-wide desktop platform, so the screenshot takes the width
 * and the annotations go around it.
 *
 * All capture finishes before any typesetting begins — the browser is closed
 * before pptxgenjs is instantiated — so a capture problem never surfaces as a
 * layout problem.
 */

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import pptxgen from 'pptxgenjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = join(ROOT, '.deck-work');
const outFlag = process.argv.indexOf('--out');
const OUT = join(ROOT, outFlag > -1 ? process.argv[outFlag + 1] : 'docs/ADAFSA_Platform_Screens.pptx');

const VIEW = { width: 1440, height: 980 };
const SCALE = 2;
const HIDDEN_ENOUGH = 1 / 6;      // below this, a screen is "all there" and gets no tail shot
const SHOT_PX = 2000;             // 6.75" wide on paper — about 296 dpi
const TAIL_PX = 1040;             // 3.04" wide — about 342 dpi
const CORNER = 0.007;             // corner radius as a share of image width — deliberately small

// ---------------------------------------------------------------- serving --
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf'
};
const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = join(ROOT, url === '/' ? 'index.html' : url);
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

// ---------------------------------------------------------------- browser --
await mkdir(WORK, { recursive: true });
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch(
  proxy ? { proxy: { server: proxy, bypass: '<-loopback>,localhost,127.0.0.1' } } : {}
);
const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: SCALE });

/* Fifty unattended renders without this, and a screen that throws halfway
 * through is photographed mid-collapse with nobody the wiser until it prints. */
const problems = [];
page.on('pageerror', (e) => problems.push(e.message));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  if (/tile\.openstreetmap|arcgisonline|ERR_/i.test(text)) return;   // network, not the app
  problems.push(text);
});

await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => !!globalThis.adafsa);

// ------------------------------------------------- structure, from the app --
const { sections } = await page.evaluate(async () => {
  const { SCREENS, SCREEN_GROUPS, DECK_OMIT } = await globalThis.adafsa.deck();
  const omit = new Set(DECK_OMIT);
  const keep = (ids) => ids.filter((id) => SCREENS[id] && !omit.has(id));
  const pick = (s, group) => ({ id: s.id, title: s.title, note: s.note, route: s.route, group });

  const out = SCREEN_GROUPS
    .map((g) => ({ name: g.name, screens: keep(g.ids).map((id) => pick(SCREENS[id], g.name)) }))
    .filter((g) => g.screens.length);

  /* Anything registered but ungrouped still gets a page rather than being
   * silently dropped — the only way out of the deck is to say so in DECK_OMIT. */
  const listed = new Set([...out.flatMap((g) => g.screens.map((s) => s.id)), ...omit]);
  const rest = Object.values(SCREENS).filter((s) => !listed.has(s.id)).map((s) => pick(s, 'Other'));
  if (rest.length) out.push({ name: 'Other', screens: rest });

  return { sections: out };
});

const screens = sections.flatMap((s) => s.screens);
const firstFiling = new Map();
for (const s of screens) if (!firstFiling.has(s.id)) firstFiling.set(s.id, s);
const DISTINCT = firstFiling.size;

// ------------------------------------------------------------- image tools --
/* The browser is already open and has a canvas, which beats a dependency.
 * The rounded corner is baked in here rather than asked of PowerPoint: its
 * own image rounding is a circular crop, not a radius. */
async function shrink(src, out, width, { mime = 'image/png', round = true } = {}) {
  const b64 = (await readFile(src)).toString('base64');
  const small = await page.evaluate(async ({ data, width, mime, round, corner }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.round((width * img.height) / img.width);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';                       // JPEG has no alpha, and the paper is white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const r = round ? Math.max(2, Math.round(width * corner)) : 0;
    if (r) {
      ctx.beginPath();
      ctx.roundRect(0.5, 0.5, canvas.width - 1, canvas.height - 1, r);
      ctx.save();
      ctx.clip();
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (r) {
      ctx.restore();
      ctx.strokeStyle = '#e5e7eb';                   // a hairline, so it reads as an object on paper
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(0.5, 0.5, canvas.width - 1, canvas.height - 1, r);
      ctx.stroke();
    }
    return canvas.toDataURL(mime, 0.86).split(',')[1];
  }, { data: b64, width, mime, round, corner: CORNER });
  await writeFile(out, Buffer.from(small, 'base64'));
}

// ------------------------------------------------------------------ capture --
const clip = { x: 0, y: 0, width: VIEW.width, height: VIEW.height };
const RATIO = VIEW.height / VIEW.width;

for (const screen of screens) {
  /* A second filing of the same screen borrows the first one's photographs
   * rather than taking them again — same route, same app, same picture. */
  const twin = firstFiling.get(screen.id);
  if (twin !== screen && twin.file) {
    Object.assign(screen, { file: twin.file, hidden: twin.hidden, tail: twin.tail, marks: twin.marks });
    continue;
  }

  await page.evaluate((route) => globalThis.adafsa.go(route), screen.route);
  await page.waitForFunction(
    (route) => document.documentElement.dataset.deckReady === '1' && location.hash === route,
    screen.route
  );
  await page.waitForTimeout(900);                    // map tiles and the first paint of the charts
  await page.evaluate(() => window.scrollTo(0, 0));

  const measure = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollHeight > window.innerHeight ? 1 - window.innerHeight / doc.scrollHeight : 0;
  });
  screen.hidden = measure;

  const raw = join(WORK, `${screen.id}-raw.png`);
  await page.screenshot({ path: raw, clip });
  screen.file = join(WORK, `${screen.id}.png`);
  await shrink(raw, screen.file, SHOT_PX);

  /* The marks are read at the same scroll position the screenshot was taken at,
   * and only for what the screenshot actually shows. */
  screen.marks = await page.evaluate(() => {
    const seen = [];
    /* ONE MARKER PER KIND OF CONTROL. Every column heading in a table carries
     * the same note; eight discs saying one thing is worse than one. */
    const already = new Set();
    for (const el of document.querySelectorAll('[data-deck-to], [data-deck-note]')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      if (cy < 4 || cy > window.innerHeight - 4) continue;    // below the fold points at nothing
      /* Keyed on what the disc would SAY, not on which element says it: two
       * column headings sort the same way and deserve one entry between them. */
      const key = `${el.dataset.deckTo ?? ''}|${el.dataset.deckNote ?? ''}`;
      if (already.has(key)) continue;
      already.add(key);
      const label = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '')
        .trim().replace(/\s+/g, ' ');
      /* A DISC WITH NOTHING TO SAY IS WORSE THAN NO DISC. */
      if (!label) continue;
      seen.push({
        to: el.dataset.deckTo ?? null,
        note: el.dataset.deckNote ?? null,
        label: label.slice(0, 46),
        x: cx / window.innerWidth,
        y: cy / window.innerHeight
      });
    }
    return seen.sort((a, b) => a.y - b.y || a.x - b.x);
  });

  if (screen.hidden >= HIDDEN_ENOUGH) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(320);
    const tailRaw = join(WORK, `${screen.id}-tail-raw.png`);
    await page.screenshot({ path: tailRaw, clip });
    screen.tail = join(WORK, `${screen.id}-tail.jpg`);
    await shrink(tailRaw, screen.tail, TAIL_PX, { mime: 'image/jpeg' });
    await page.evaluate(() => window.scrollTo(0, 0));
  }
}

/* The wordmark, photographed out of the running app over a white stage of its
 * own — an element screenshot otherwise picks up whatever sits behind it. */
const brand = { path: join(WORK, 'brand.png'), ratio: 3 };
{
  const rect = await page.evaluate(() => {
    const stage = document.createElement('div');
    stage.id = 'deck-brand-stage';
    stage.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;display:flex;align-items:flex-start;';
    const box = document.createElement('div');
    box.id = 'deck-brand';
    box.style.cssText = 'padding:8px 16px;background:#fff;';
    box.innerHTML = document.querySelector('.nav-brand').innerHTML;
    box.querySelector('strong').style.cssText = 'display:block;font-size:64px;letter-spacing:-.02em;line-height:1.1;';
    box.querySelector('span').style.cssText = 'display:block;font-size:19px;color:#6b7280;margin-top:6px;';
    stage.append(box);
    document.body.append(stage);
    const r = box.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  const brandRaw = join(WORK, 'brand-raw.png');
  await page.locator('#deck-brand').screenshot({ path: brandRaw });
  await shrink(brandRaw, brand.path, 900, { round: false });
  await page.evaluate(() => document.getElementById('deck-brand-stage')?.remove());
  brand.ratio = rect.w / rect.h;
}

await browser.close();
server.close();

if (problems.length) {
  console.error(`${problems.length} console error(s) while capturing:`);
  for (const p of problems.slice(0, 8)) console.error(`  ${p}`);
  process.exit(1);
}

// ------------------------------------------------------- plan, then numbers --
const plan = [{ kind: 'cover' }, { kind: 'contents' }];
for (const section of sections) {
  plan.push({ kind: 'section', section });
  for (const screen of section.screens) plan.push({ kind: 'screen', screen, section });
}
plan.forEach((p, i) => { p.page = i + 1; });
for (const p of plan) if (p.kind === 'screen') p.screen.page = p.page;

const pageOf = new Map();
for (const p of plan) if (p.kind === 'screen' && !pageOf.has(p.screen.id)) pageOf.set(p.screen.id, p.page);
const byId = new Map(screens.map((s) => [s.id, s]));

/* A marker aiming at a screen that is not in the deck sends the reviewer
 * looking for a page that does not exist. */
for (const screen of screens) {
  screen.marks = (screen.marks ?? []).filter((m) => !m.to || pageOf.has(m.to)).slice(0, 8);
  screen.marks = screen.marks.map((m) => ({ ...m }));   // per filing, or one page moves the other's discs
}

// -------------------------------------------------------------- typesetting --
/* Everything is given room. The page is A4 landscape and holds one screenshot,
 * so the temptation is to fill it; a printed page that is full is a printed
 * page nobody writes on. The gutters below are wider than they need to be on
 * purpose. */
const W = 11.69, H = 8.27;
const MARGIN = 0.62;
const FONT = 'Calibri';

const SHOT_X = MARGIN, SHOT_Y = 1.78, SHOT_W = 6.75;
const SHOT_H = SHOT_W * RATIO;
const DISC_D = 0.26;
const DISC_TOP_Y = SHOT_Y - DISC_D - 0.12;
const DISC_RIGHT_X = SHOT_X + SHOT_W + 0.16;
const COL_X = SHOT_X + SHOT_W + 0.66;
const COL_W = W - MARGIN - COL_X;
const FOOT_Y = 7.72;

const NOTE_Y = SHOT_Y + SHOT_H + 0.14;

/* Barely there, just enough for the screenshot to sit ON the page rather than
 * in it. A function rather than a constant on purpose: pptxgenjs converts the
 * shadow to EMU IN PLACE, so a single shared object is multiplied again on
 * every slide that uses it and the twentieth shadow comes out astronomical. */
const softShadow = () => ({ type: 'outer', color: '94A3B8', opacity: 0.28, blur: 10, offset: 2.5, angle: 90 });

const WAFRA = join(ROOT, 'assets/brand/wafra-logo.png');
const WAFRA_RATIO = 133 / 416;                 // the file's own proportions

const INK = '111827', MUTED = '4B5563', FAINT = '9CA3AF';
const BRAND = '15803D', DEEP = '14532D', PALE = 'BBF7D0', PAPER = 'FFFFFF';

const pres = new pptxgen();
pres.defineLayout({ name: 'A4', width: W, height: H });
pres.layout = 'A4';
pres.author = 'Wafra Greentech';
pres.title = 'ADAFSA Agricultural Monitoring Platform — screens';

const footer = (s, page, { onDark = false } = {}) => {
  const colour = onDark ? PALE : FAINT;
  s.addText('ADAFSA Agricultural Monitoring Platform  ·  design mockup', {
    x: MARGIN, y: FOOT_Y, w: 6.5, h: 0.26, fontFace: FONT, fontSize: 9, color: colour, margin: 0
  });
  s.addText(String(page), {
    x: W - MARGIN - 1.2, y: FOOT_Y, w: 1.2, h: 0.26,
    fontFace: FONT, fontSize: 9, color: colour, align: 'right', margin: 0
  });
};

for (const item of plan) {
  const s = pres.addSlide();

  // ------------------------------------------------------------------ cover --
  if (item.kind === 'cover') {
    s.background = { color: PAPER };
    const brandH = 0.92;
    s.addImage({ path: brand.path, x: MARGIN, y: 1.05, w: brandH * brand.ratio, h: brandH });
    /* One line, and roomy on purpose: the reader may not have Calibri, and a
     * substituted face sets wider. */
    s.addText('The platform, screen by screen', {
      x: MARGIN, y: 2.72, w: 10.45, h: 0.95, fontFace: FONT, fontSize: 40, bold: true, color: INK, valign: 'top', margin: 0
    });
    const stat = (x, value, label) => {
      s.addText(value, { x, y: 4.42, w: 2.6, h: 0.9, fontFace: FONT, fontSize: 50, bold: true, color: INK, margin: 0 });
      s.addText(label, { x, y: 5.29, w: 2.6, h: 0.32, fontFace: FONT, fontSize: 11, bold: true, color: BRAND, charSpacing: 1.6, margin: 0 });
    };
    stat(MARGIN, String(DISTINCT), 'SCREENS');
    stat(MARGIN + 2.75, String(sections.length), 'SECTIONS');
    stat(MARGIN + 5.5, String(plan.length), 'PAGES');
    const wafraW = 1.75;
    s.addImage({
      path: WAFRA, x: W - MARGIN - wafraW, y: 6.72, w: wafraW, h: wafraW * WAFRA_RATIO
    });
    footer(s, item.page);
    continue;
  }

  // --------------------------------------------------------------- contents --
  if (item.kind === 'contents') {
    s.background = { color: PAPER };
    s.addText('Contents', {
      x: MARGIN, y: 0.62, w: 6, h: 0.5, fontFace: FONT, fontSize: 24, bold: true, color: INK, margin: 0
    });

    const COLS = 3, GAP = 0.45, TOP = 1.4, LINE = 0.235;
    const colW = (W - MARGIN * 2 - GAP * (COLS - 1)) / COLS;
    const blocks = sections.map((sec) => [{ heading: sec.name }, ...sec.screens.map((sc) => ({ screen: sc }))]);
    const target = Math.ceil(blocks.flat().length / COLS);

    const columns = [[]];
    for (const block of blocks) {
      const col = columns[columns.length - 1];
      /* A section is never split across two columns; even column lengths matter
       * less than that. */
      if (col.length && col.length + block.length > target && columns.length < COLS) columns.push([]);
      columns[columns.length - 1].push(...block);
    }

    columns.forEach((col, ci) => {
      const x = MARGIN + ci * (colW + GAP);
      col.forEach((line, li) => {
        const y = TOP + li * LINE;
        if (line.heading) {
          s.addText(line.heading.toUpperCase(), {
            x, y: y + 0.04, w: colW, h: LINE, fontFace: FONT, fontSize: 8,
            bold: true, color: BRAND, charSpacing: 1.4, valign: 'middle', margin: 0
          });
          return;
        }
        s.addText(line.screen.id, {
          x, y, w: 0.42, h: LINE, fontFace: FONT, fontSize: 8.5, bold: true, color: INK, valign: 'middle', margin: 0
        });
        s.addText(line.screen.title, {
          x: x + 0.44, y, w: colW - 0.86, h: LINE, fontFace: FONT, fontSize: 8.5, color: MUTED, valign: 'middle', margin: 0
        });
        s.addText(String(line.screen.page), {
          x: x + colW - 0.4, y, w: 0.4, h: LINE, fontFace: FONT, fontSize: 8.5,
          color: FAINT, align: 'right', valign: 'middle', margin: 0
        });
      });
    });
    footer(s, item.page);
    continue;
  }

  // -------------------------------------------------------- section divider --
  if (item.kind === 'section') {
    const nth = sections.indexOf(item.section) + 1;
    s.background = { color: DEEP };
    /* Not the section's own name again — where you are in the deck, which the
     * title underneath cannot tell you. */
    s.addText(`SECTION ${nth} OF ${sections.length}`, {
      x: MARGIN, y: 3.0, w: 9.0, h: 0.4, fontFace: FONT, fontSize: 12,
      bold: true, color: PALE, charSpacing: 2.2, margin: 0
    });
    s.addText(item.section.name, {
      x: MARGIN, y: 3.44, w: 10.0, h: 1.05, fontFace: FONT, fontSize: 44, bold: true, color: PAPER, margin: 0
    });
    const count = item.section.screens.length;
    s.addText(`${count} screen${count === 1 ? '' : 's'}  ·  ${item.section.screens.map((sc) => sc.id).join(' · ')}`, {
      x: MARGIN, y: 4.6, w: 10.0, h: 0.4, fontFace: FONT, fontSize: 11, color: PALE, margin: 0
    });
    footer(s, item.page, { onDark: true });
    continue;
  }

  // ------------------------------------------------------------ screen page --
  const { screen, section } = item;
  s.background = { color: PAPER };

  s.addText(section.name.toUpperCase(), {
    x: MARGIN, y: 0.46, w: 8.0, h: 0.26, fontFace: FONT, fontSize: 10,
    bold: true, color: BRAND, charSpacing: 1.6, margin: 0
  });
  s.addText([
    { text: screen.id, options: { bold: true, color: INK } },
    { text: '  ·  ', options: { bold: false, color: FAINT } },
    { text: screen.title, options: { bold: true, color: INK } }
  ], { x: MARGIN, y: 0.78, w: 9.5, h: 0.5, fontFace: FONT, fontSize: 24, margin: 0 });

  s.addImage({ path: screen.file, x: SHOT_X, y: SHOT_Y, w: SHOT_W, h: SHOT_H, shadow: softShadow() });

  if (screen.hidden >= HIDDEN_ENOUGH) {
    /* Rounded to the nearest 5%, because "about 63%" implies a precision the
     * number does not have — and stated as the share that IS shown, which is
     * the harder half to misread. */
    s.addText(`Scrolls · about ${Math.round((1 - screen.hidden) * 20) * 5}% of this screen is shown above`, {
      x: SHOT_X, y: NOTE_Y, w: SHOT_W, h: 0.22,
      fontFace: FONT, fontSize: 8, italic: true, color: FAINT, margin: 0
    });
  }

  // The rest of a scrolling screen, in the right column.
  let keyY = SHOT_Y;
  if (screen.tail) {
    s.addText('THE REST OF THIS SCREEN', {
      x: COL_X, y: SHOT_Y, w: COL_W, h: 0.2,
      fontFace: FONT, fontSize: 8, bold: true, color: FAINT, charSpacing: 1.2, margin: 0
    });
    const tailH = COL_W * RATIO;
    s.addImage({ path: screen.tail, x: COL_X, y: SHOT_Y + 0.30, w: COL_W, h: tailH, shadow: softShadow() });
    keyY = SHOT_Y + 0.30 + tailH + 0.46;
  }

  // The discs, in the margin — never on the picture.
  const marks = screen.marks ?? [];
  if (marks.length) {
    const top = marks.filter((m) => m.y < 0.16);
    const side = marks.filter((m) => m.y >= 0.16);
    const placed = new Map();
    let lastX = -Infinity;
    top.forEach((m) => {
      const wanted = SHOT_X + m.x * SHOT_W - DISC_D / 2;
      const x = Math.max(SHOT_X, Math.max(wanted, lastX + DISC_D + 0.04));
      lastX = x;
      placed.set(m, { x, y: DISC_TOP_Y });
    });
    let lastY = -Infinity;
    side.forEach((m) => {
      const wanted = SHOT_Y + m.y * SHOT_H - DISC_D / 2;
      const y = Math.min(SHOT_Y + SHOT_H - DISC_D, Math.max(wanted, lastY + DISC_D + 0.04));
      lastY = y;
      placed.set(m, { x: DISC_RIGHT_X, y });
    });
    marks.forEach((m, i) => {
      const at = placed.get(m);
      s.addText(String(i + 1), {
        shape: pres.ShapeType.ellipse, x: at.x, y: at.y, w: DISC_D, h: DISC_D,
        fill: { color: BRAND }, line: { color: PAPER, width: 1 },
        fontFace: FONT, fontSize: 8.5, bold: true, color: PAPER,
        align: 'center', valign: 'middle', margin: 0
      });
    });

    // The key that makes the discs mean anything.
    s.addText('WHAT THE SMALL CONTROLS DO', {
      x: COL_X, y: keyY, w: COL_W, h: 0.2,
      fontFace: FONT, fontSize: 8, bold: true, color: FAINT, charSpacing: 1.2, margin: 0
    });
    /* Roomy while the room lasts. A screen with eight marked controls and a
     * tall second shot above the key closes up rather than losing its last
     * entries off the bottom of the page. */
    const listTop = keyY + 0.32;
    const LINE_H = Math.max(0.30, Math.min(0.46, (FOOT_Y - 0.16 - listTop) / marks.length));
    marks.forEach((m, i) => {
      const y = listTop + i * LINE_H;
      if (y + LINE_H > FOOT_Y - 0.1) return;              // never run into the footer
      s.addText(String(i + 1), {
        shape: pres.ShapeType.ellipse, x: COL_X, y: y + 0.02, w: 0.2, h: 0.2,
        fill: { color: BRAND }, line: { color: PAPER, width: 0.5 },
        fontFace: FONT, fontSize: 7.5, bold: true, color: PAPER,
        align: 'center', valign: 'middle', margin: 0
      });
      const target = m.to ? pageOf.get(m.to) : null;
      s.addText([
        { text: m.label, options: { bold: true, color: INK } },
        ...(m.to
          ? [{ text: `  →  ${m.to} ${byId.get(m.to)?.title ?? ''}`, options: { color: BRAND, bold: true } },
             ...(target ? [{ text: `  (page ${target})`, options: { color: FAINT } }] : [])]
          : [{ text: `  —  ${m.note}`, options: { color: MUTED } }])
      ], {
        x: COL_X + 0.28, y, w: COL_W - 0.28, h: LINE_H,
        fontFace: FONT, fontSize: 7.5, color: MUTED, valign: 'top', lineSpacing: 9, margin: 0
      });
    });
  }

  s.addNotes(`${screen.id} — ${screen.title}\n\n${screen.note}`
    + (marks.length ? `\n\n${marks.map((m, i) => `${i + 1}. ${m.label}${m.to ? ` → ${m.to}` : ` — ${m.note}`}`).join('\n')}` : '')
    + (screen.hidden >= HIDDEN_ENOUGH
        ? `\n\nThe screenshot shows ${Math.round((1 - screen.hidden) * 100)}% of this screen; the rest is in the smaller shot beside it.`
        : ''));

  footer(s, item.page);
}

await mkdir(dirname(OUT), { recursive: true });
await pres.writeFile({ fileName: OUT });
await rm(WORK, { recursive: true, force: true });

const scrolling = screens.filter((s) => s.hidden >= HIDDEN_ENOUGH).length;
const marked = screens.filter((s) => (s.marks ?? []).length).length;
const discs = screens.reduce((n, s) => n + (s.marks ?? []).length, 0);
console.log(`${plan.length} slides -> ${OUT.replace(ROOT + '/', '')}`);
console.log(`  cover, contents, ${sections.length} section dividers, ${screens.length} screen pages (${DISTINCT} screens)`);
console.log(`  ${scrolling} screens carry a "scrolls" note and a second shot of the rest`);
console.log(`  ${discs} small controls marked in the margin across ${marked} screens`);
