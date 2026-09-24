/* Build the bilingual tour deck — English and Azerbaijani, side by side.
 *
 *   node tools/tourdeck.mjs [--out docs/ADAFSA_Platform_Tour_EN_AZ.pptx] [--keep]
 *
 * --keep leaves the photographs in .deck-work/tour for a look.
 *
 * A short deck for partners rather than a review copy: a few screens, each
 * with what it is in plain words, in both languages, and small numbered
 * markers on the picture that match the numbered points beside it.
 *
 * The look is the Wafra farm-app deck, followed closely: English on the left,
 * the screen in a device frame in the middle, Azerbaijani on the right; a
 * spaced green label over each column, a two-line title, a short intro, then
 * up to four numbered points; dark green number discs with a white ring, on
 * the picture and beside the points alike. The cover and the closing page are
 * that deck's too.
 *
 * The one thing that could not be copied is the device. That deck shows a
 * phone app; this is a website. A desktop screenshot shrunk into the middle
 * column would be unreadable, so the website is photographed as it really
 * draws at tablet width — its own narrow layout, not a crop — and framed as a
 * tablet. The middle column is wider than the phone's to hold it, and the two
 * text columns give up that width.
 *
 * The words and the marker anchors live in tools/tour/content.mjs. Markers are
 * placed by finding their element on the page at capture time, so they follow
 * the layout rather than a hand-measured position.
 *
 * All capture finishes before any typesetting begins, as in screendeck.mjs.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import pptxgen from 'pptxgenjs';
import { ROOT, openStage, stopOnProblems } from './lib/stage.mjs';
import { COVER, SCREENS, CLOSING } from './tour/content.mjs';

const WORK = join(ROOT, '.deck-work', 'tour');
const outFlag = process.argv.indexOf('--out');
const OUT = join(ROOT, outFlag > -1 ? process.argv[outFlag + 1] : 'docs/ADAFSA_Platform_Tour_EN_AZ.pptx');

/* Under 760 CSS pixels the website folds its menu away and takes the full
 * width, which is the layout that reads at this size. The height gives the
 * frame roughly the proportions of a tablet held upright. */
const VIEW = { width: 720, height: 1030 };
const SCALE = 2;                   // about 330 dpi at the size it is printed
const BEZEL = 18;                  // CSS pixels of dark frame around the screen
const OUTER_R = 40;
const INNER_R = 22;
const SHOT_Q = 0.92;
const MIN_INK = 0.04;              // below this a "screenshot" is a blank sheet, and the build stops
const FRAME = { w: VIEW.width + BEZEL * 2, h: VIEW.height + BEZEL * 2 };
const MARKER_GAP = 50;             // CSS pixels between marker centres; a disc is about 44 across

// ----------------------------------------------------------------- palette --
/* Read off the reference deck, not chosen here. */
const FONT = 'Calibri';
const INK = '0D1411';
const BODY = '4A5852';
const LABEL = '1B7350';
const DEEP = '114230';
const CARD = '145C40';
const PANEL = 'EEF7F2';
const PALE = 'BDE0D0';
const SOFT = '8EC9AE';
const QUIET = '5F6D66';
const WHITE = 'FFFFFF';
const BEZEL_INK = '#141c19';

// ------------------------------------------------------------------ capture --
await mkdir(WORK, { recursive: true });
const stage = await openStage({ viewport: VIEW, scale: SCALE });
const { page } = stage;

/* The tablet frame and its shadowless dark bezel are baked into the pixels,
 * as the phone was in the reference: a picture prints the same everywhere,
 * a PowerPoint effect does not. The paper colour behind the rounded corners is
 * passed in, because the cover sits the frame on a tinted panel. */
async function frame(src, out, paper) {
  const b64 = (await readFile(src)).toString('base64');
  const shot = await page.evaluate(async ({ data, scale, bezel, outerR, innerR, paper, ink, quality }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const b = bezel * scale;
    const w = img.width + b * 2;
    const h = img.height + b * 2;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, outerR * scale); ctx.fill();
    /* A lighter rim, as the phone had, so the frame reads as an object. */
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath(); ctx.roundRect(scale, scale, w - 2 * scale, h - 2 * scale, outerR * scale - scale); ctx.stroke();
    /* The camera. */
    ctx.fillStyle = '#2b3833';
    ctx.beginPath(); ctx.arc(w / 2, b / 2, 2.6 * scale, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.roundRect(b, b, img.width, img.height, innerR * scale); ctx.clip();
    ctx.drawImage(img, b, b);
    ctx.restore();

    const px = ctx.getImageData(b, b, img.width, img.height).data;
    let inked = 0, seen = 0;
    for (let i = 0; i < px.length; i += 4 * 37) {
      seen++;
      if (px[i] < 246 || px[i + 1] < 246 || px[i + 2] < 246) inked++;
    }
    return { data: canvas.toDataURL('image/jpeg', quality).split(',')[1], ink: inked / seen };
  }, { data: b64, scale: SCALE, bezel: BEZEL, outerR: OUTER_R, innerR: INNER_R, paper, ink: BEZEL_INK, quality: SHOT_Q });
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  return shot.ink;
}

/* Put a map where the slide needs it. A farm is framed close enough for its
 * trees to be drawn; `fitFarms` frames every holding on the map, which at
 * tablet width is tighter than the page's own opening view. */
async function placeMap(spec) {
  if (!spec) return;
  await page.evaluate(async ({ id, farm, zoom, fitFarms }) => {
    const { farmById, allFarms } = await import('/src/data/store.js');
    const map = await globalThis.adafsa.map(id);
    if (!map) throw new Error(`no map "${id}" on this page`);
    if (farm != null) {
      const holding = farmById(farm);
      map.setView([holding.lat, holding.lng], zoom, { animate: false });
    } else if (fitFarms) {
      const points = allFarms().map((f) => [f.lat, f.lng]);
      map.fitBounds(window.L.latLngBounds(points), { padding: [14, 14], animate: false });
    }
  }, spec);
  await stage.settleTiles();
  await page.waitForTimeout(1800);                  // the tree dots are drawn after the move
}

/* Where each marker goes, in viewport pixels, read off the element it names. */
async function measure(markers) {
  return page.evaluate((markers) => {
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const find = (sel, text, root = document) =>
      [...root.querySelectorAll(sel)].find((el) => visible(el) && (!text || el.textContent.includes(text))) || null;
    const along = (edge, start, size, names) =>
      typeof edge === 'number' ? start + edge * size : start + size * names[edge];
    return markers.map((m) => {
      const root = m.within ? find(m.within.sel, m.within.text) : document;
      const el = root && find(m.sel, m.text, root);
      if (!el) return { missing: `${m.sel}${m.text ? ` containing "${m.text}"` : ''}` };
      const r = el.getBoundingClientRect();
      const x = m.x ?? 'left';
      const dx = m.dx ?? (x === 'left' ? -8 : 0);
      return {
        x: along(x, r.left, r.width, { left: 0, center: 0.5, right: 1 }) + dx,
        y: along(m.y ?? 'middle', r.top, r.height, { top: 0, middle: 0.5, bottom: 1 }) + (m.dy || 0)
      };
    });
  }, markers);
}

const failures = [];
for (const screen of SCREENS) {
  await stage.go(screen.route);
  await page.waitForTimeout(500);                    // the first paint of the charts
  await stage.settleTiles();
  await placeMap(screen.map);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  screen.at = await measure(screen.markers);
  screen.at.forEach((p, i) => {
    const where = `${screen.id}, marker ${i + 1}`;
    if (p.missing) failures.push(`${where}: nothing on the page matches ${p.missing}`);
    else if (p.x < 0 || p.x > VIEW.width || p.y < 0 || p.y > VIEW.height) {
      failures.push(`${where}: lands off the screen at ${Math.round(p.x)}, ${Math.round(p.y)}`);
    }
  });
  /* Two discs closer than this touch, and a reader cannot tell which is which. */
  screen.at.forEach((p, i) => screen.at.slice(i + 1).forEach((q, j) => {
    if (!p.missing && !q.missing && Math.hypot(p.x - q.x, p.y - q.y) < MARKER_GAP) {
      failures.push(`${screen.id}: markers ${i + 1} and ${i + j + 2} overlap`);
    }
  }));

  const raw = join(WORK, `${screen.id}-raw.png`);
  await page.screenshot({ path: raw });
  screen.file = join(WORK, `${screen.id}.jpg`);
  screen.ink = await frame(raw, screen.file, '#ffffff');
  if (screen.id === COVER.screen) {
    screen.coverFile = join(WORK, `${screen.id}-cover.jpg`);
    await frame(raw, screen.coverFile, `#${PANEL}`);
  }
}

/* The closing page's icons, drawn from the app's own icon set so the deck and
 * the website speak with one set of glyphs. */
async function glyph(name, colour, px = 256) {
  const data = await page.evaluate(async ({ name, colour, px }) => {
    const { icon } = await import('/src/app/icons.js');
    const svg = icon(name, { size: px });
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('stroke', colour);
    svg.style.color = colour;
    const markup = svg.outerHTML.replaceAll('currentColor', colour);
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(markup)}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = px; canvas.height = px;
    canvas.getContext('2d').drawImage(img, 0, 0, px, px);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { name, colour, px });
  return `image/png;base64,${data}`;
}
const icons = {};
for (const step of CLOSING.steps) icons[step.icon] = await glyph(step.icon, '#ffffff');
icons.forward = await glyph('chevron', `#${SOFT}`);

await stage.close();
stopOnProblems(stage);

if (failures.length) {
  console.error('markers that could not be placed:');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
const blank = SCREENS.filter((s) => s.ink < MIN_INK);
if (blank.length) {
  console.error(`screens photographed blank: ${blank.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

// -------------------------------------------------------------- typesetting --
const W = 13.333, H = 7.5;
const MARGIN = 0.55;
const GUTTER = 0.35;
const IMG_H = 6.6, IMG_Y = 0.45;
const IMG_W = IMG_H * (FRAME.w / FRAME.h);
const IMG_X = (W - IMG_W) / 2;
const COL_W = IMG_X - GUTTER - MARGIN;
const COLUMNS = [
  { lang: 'en', label: 'ENGLISH', x: MARGIN },
  { lang: 'az', label: 'AZƏRBAYCANCA', x: IMG_X + IMG_W + GUTTER }
];
const DISC = 0.27;
const TOTAL = SCREENS.length + 2;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Wafra Greentech';
pres.title = 'Plant health, crops and orchards — a short tour';

const text = (s, value, options) => s.addText(value, { fontFace: FONT, margin: 0, isTextBox: true, ...options });

/* The numbered disc, on the picture and beside the points alike. */
const disc = (s, n, x, y) => text(s, String(n), {
  shape: pres.shapes.OVAL, x, y, w: DISC, h: DISC,
  fill: { color: DEEP }, line: { color: WHITE, width: 1.25 },
  fontSize: 10.5, bold: true, color: WHITE, align: 'center', valign: 'middle'
});

const pageNumber = (s, n, colour = QUIET) => text(s, `${n} / ${TOTAL}`, {
  x: W - MARGIN - 1.0, y: 7.08, w: 1.0, h: 0.25, fontSize: 9, color: colour, align: 'right', valign: 'middle'
});

const WAFRA = join(ROOT, 'assets/brand/wafra-logo.png');
const WAFRA_RATIO = 416 / 133;                     // the file's own proportions

// ------------------------------------------------------------------- cover --
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  const PANEL_X = 8.1;
  s.addShape(pres.shapes.RECTANGLE, { x: PANEL_X, y: 0, w: W - PANEL_X, h: H, fill: { color: PANEL }, line: { color: PANEL } });
  const cover = SCREENS.find((sc) => sc.id === COVER.screen);
  const coverH = 6.1;
  const coverW = coverH * (FRAME.w / FRAME.h);
  s.addImage({ path: cover.coverFile, x: PANEL_X + (W - PANEL_X - coverW) / 2, y: (H - coverH) / 2, w: coverW, h: coverH });

  const logoH = 0.57;
  s.addImage({ path: WAFRA, x: 0.75, y: 0.68, w: logoH * WAFRA_RATIO, h: logoH });

  const TEXT_W = PANEL_X - 0.75 - 0.35;
  [['en', 'ENGLISH', 1.95], ['az', 'AZƏRBAYCANCA', 4.15]].forEach(([lang, label, top]) => {
    const copy = COVER[lang];
    text(s, label, { x: 0.75, y: top, w: TEXT_W, h: 0.28, fontSize: 10.5, bold: true, color: LABEL, charSpacing: 2, valign: 'middle' });
    text(s, copy.title, { x: 0.75, y: top + 0.34, w: TEXT_W, h: 0.55, fontSize: 27, bold: true, color: DEEP, valign: 'top' });
    text(s, copy.subtitle, { x: 0.75, y: top + 0.98, w: TEXT_W, h: 0.36, fontSize: 17, color: INK, valign: 'middle' });
    text(s, copy.line, { x: 0.75, y: top + 1.38, w: TEXT_W, h: 0.36, fontSize: 13, color: BODY, valign: 'middle' });
  });
  text(s, [
    { text: COVER.footnote.en, options: { breakLine: true } },
    { text: COVER.footnote.az }
  ], { x: 0.75, y: 6.7, w: TEXT_W, h: 0.42, fontSize: 9.5, italic: true, color: QUIET, valign: 'top' });
  s.addNotes(`${COVER.en.title}\n${COVER.en.subtitle}\n\n${COVER.az.title}\n${COVER.az.subtitle}`);
}

// ----------------------------------------------------------------- screens --
SCREENS.forEach((screen, index) => {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addImage({ path: screen.file, x: IMG_X, y: IMG_Y, w: IMG_W, h: IMG_H });

  /* Viewport pixels to slide inches: through the bezel, then to scale. */
  screen.at.forEach((p, i) => {
    const x = IMG_X + ((BEZEL + p.x) / FRAME.w) * IMG_W;
    const y = IMG_Y + ((BEZEL + p.y) / FRAME.h) * IMG_H;
    disc(s, i + 1, x - DISC / 2, y - DISC / 2);
  });

  const count = screen.en.points.length;
  const pitch = count <= 3 ? 1.12 : 0.975;
  for (const column of COLUMNS) {
    const copy = screen[column.lang];
    text(s, column.label, {
      x: column.x, y: 0.55, w: COL_W, h: 0.26, fontSize: 10, bold: true, color: LABEL, charSpacing: 2, valign: 'middle'
    });
    text(s, copy.title, { x: column.x, y: 0.86, w: COL_W, h: 0.9, fontSize: 24, bold: true, color: INK, valign: 'top' });
    text(s, copy.intro, { x: column.x, y: 1.82, w: COL_W, h: 1.05, fontSize: 14, color: BODY, valign: 'top' });
    copy.points.forEach((point, i) => {
      const y = 3.065 + i * pitch;
      disc(s, i + 1, column.x + 0.005, y);
      text(s, [
        { text: point.head, options: { fontSize: 13.5, bold: true, color: INK, breakLine: true, paraSpaceAfter: 2 } },
        { text: point.text, options: { fontSize: 12, color: BODY, paraSpaceAfter: 2 } }
      ], { x: column.x + 0.42, y: y + 0.005, w: COL_W - 0.42, h: pitch - 0.08, valign: 'top' });
    });
  }

  const notes = (copy) => [copy.title, copy.intro, ...copy.points.map((p, i) => `${i + 1}. ${p.head} — ${p.text}`)].join('\n');
  s.addNotes(`${notes(screen.en)}\n\n${notes(screen.az)}`);
  pageNumber(s, index + 2);
});

// ----------------------------------------------------------------- closing --
{
  const s = pres.addSlide();
  s.background = { color: DEEP };
  text(s, CLOSING.en.title, { x: 0.75, y: 0.6, w: 11.8, h: 0.62, fontSize: 32, bold: true, color: WHITE, valign: 'middle' });
  text(s, CLOSING.az.title, { x: 0.75, y: 1.22, w: 11.8, h: 0.5, fontSize: 22, color: PALE, valign: 'middle' });

  const CARD_W = 2.643, STEP = 3.063, TOP = 2.15;
  CLOSING.steps.forEach((step, i) => {
    const x = 0.75 + i * STEP;
    const lit = !!step.highlight;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: TOP, w: CARD_W, h: 3.8, rectRadius: 0.14,
      fill: { color: lit ? PANEL : CARD }, line: { color: lit ? PANEL : CARD }
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.3, y: TOP + 0.32, w: 0.74, h: 0.74,
      fill: { color: lit ? DEEP : LABEL }, line: { color: lit ? DEEP : LABEL }
    });
    s.addImage({ data: icons[step.icon], x: x + 0.47, y: TOP + 0.49, w: 0.4, h: 0.4 });
    text(s, String(i + 1), {
      x: x + 2.023, y: TOP + 0.3, w: 0.35, h: 0.4, fontSize: 20, bold: true, color: lit ? LABEL : SOFT, align: 'right', valign: 'middle'
    });
    const head = lit ? INK : WHITE;
    const body = lit ? BODY : PALE;
    text(s, [
      { text: step.en.head, options: { fontSize: 15, bold: true, color: head, breakLine: true } },
      { text: step.en.text, options: { fontSize: 12, color: body } }
    ], { x: x + 0.3, y: TOP + 1.25, w: 2.043, h: 1.0, valign: 'top' });
    text(s, [
      { text: step.az.head, options: { fontSize: 14, bold: true, color: head, breakLine: true } },
      { text: step.az.text, options: { fontSize: 12, color: body } }
    ], { x: x + 0.3, y: TOP + 2.5, w: 2.043, h: 1.15, valign: 'top' });
    if (i < CLOSING.steps.length - 1) {
      s.addImage({ data: icons.forward, x: x + CARD_W + 0.06, y: TOP + 1.75, w: 0.3, h: 0.3 });
    }
  });

  text(s, [
    { text: CLOSING.en.next, options: { fontSize: 15, bold: true, color: WHITE, breakLine: true } },
    { text: CLOSING.az.next, options: { fontSize: 14, color: PALE } }
  ], { x: 0.75, y: 6.3, w: 10.5, h: 0.75, valign: 'top' });
  s.addNotes(`${CLOSING.en.title}\n${CLOSING.az.title}`);
  pageNumber(s, TOTAL, PALE);
}

await mkdir(dirname(OUT), { recursive: true });
await pres.writeFile({ fileName: OUT });
if (!process.argv.includes('--keep')) await rm(WORK, { recursive: true, force: true });
console.log(`${TOTAL} slides -> ${OUT.replace(ROOT + '/', '')}`);
console.log(`  ${SCREENS.length} screens at ${VIEW.width}×${VIEW.height}, ${SCREENS.reduce((n, s) => n + s.markers.length, 0)} markers`);
console.log(`  ${stage.tileStats.hit + stage.tileStats.fetched} map tiles served (${stage.tileStats.fetched} fetched, ${stage.tileStats.hit} from .tile-cache)`);
