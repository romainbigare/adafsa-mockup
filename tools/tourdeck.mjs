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
 * The look is the Wafra farm-app deck: a spaced green label over each
 * language, a bold title, a short intro, then up to four numbered points; dark
 * green number discs with a white ring, on the picture and beside the points
 * alike. The cover and the closing page are that deck's too.
 *
 * The device is not. That deck shows a phone app, standing tall between its
 * two text columns; this is a website, and it is shown as it looks on a
 * laptop — 1280 × 800, with the menu folded to its narrow column of icons so
 * the page gets the width. A laptop lies on its side, so the page is arranged
 * around it: both titles across the top, English on the left and Azerbaijani
 * on the right, the laptop in the middle, and each language's numbered points
 * down its own side.
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
import { NAV_COMPACT_KEY } from '../src/app/navPrefs.js';
import { COVER, SCREENS, CLOSING } from './tour/content.mjs';

const WORK = join(ROOT, '.deck-work', 'tour');
const outFlag = process.argv.indexOf('--out');
const OUT = join(ROOT, outFlag > -1 ? process.argv[outFlag + 1] : 'docs/ADAFSA_Platform_Tour_EN_AZ.pptx');

/* A common laptop screen, in CSS pixels. */
const VIEW = { width: 1280, height: 800 };
const SCALE = 2;
const SHOT_Q = 0.92;
const MIN_INK = 0.04;              // below this a "screenshot" is a blank sheet, and the build stops

/* The laptop, in CSS pixels around the screen: the lid's bezel, a slightly
 * deeper chin, the base that sticks out either side, and room for its shadow. */
const LID = { side: 14, top: 20, chin: 22, r: 16 };
const BASE = { h: 16, overhang: 60 };
const SHADOW = 12;
const FRAME = {
  w: VIEW.width + LID.side * 2 + BASE.overhang * 2,
  h: VIEW.height + LID.top + LID.chin + BASE.h + SHADOW
};
const SCREEN_AT = { x: BASE.overhang + LID.side, y: LID.top };

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

// ------------------------------------------------------------------ layout --
/* Inches, on a 13.33 × 7.5 slide. Worked out here, before capture, because the
 * marker spacing check needs to know how large a disc lands on the screen. */
const W = 13.333, H = 7.5;
const MARGIN = 0.55;
const SIDE_W = 2.25;               // each language's column of points
const GUTTER = 0.25;
const LAPTOP_W = W - MARGIN * 2 - SIDE_W * 2 - GUTTER * 2;
const LAPTOP_H = LAPTOP_W * (FRAME.h / FRAME.w);
const LAPTOP_X = (W - LAPTOP_W) / 2;
const BAND_BOTTOM = 2.15;          // the titles and intros sit above this
const LAPTOP_Y = BAND_BOTTOM + (7.0 - BAND_BOTTOM - LAPTOP_H) / 2;
const DISC = 0.25;
/* Two discs closer than a disc and a bit, in screen pixels, touch. */
const MARKER_GAP = (DISC * 1.12) / (LAPTOP_W / FRAME.w);

// ------------------------------------------------------------------ capture --
await mkdir(WORK, { recursive: true });
/* The narrow menu is set the way a person would set it — through the
 * preference the website itself remembers — so the screens show a state the
 * website really has. */
const stage = await openStage({ viewport: VIEW, scale: SCALE, storage: { [NAV_COMPACT_KEY]: '1' } });
const { page } = stage;

/* The laptop is drawn into the pixels, as the phone was in the reference: a
 * picture prints the same everywhere, a PowerPoint effect does not. The paper
 * colour behind it is passed in, because the cover sits it on a tinted panel. */
async function frame(src, out, paper) {
  const b64 = (await readFile(src)).toString('base64');
  const shot = await page.evaluate(async ({ data, scale, lid, base, shadow, frameW, frameH, at, paper, quality }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const k = scale;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * k;
    canvas.height = frameH * k;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const lidX = base.overhang * k;
    const lidW = (frameW - base.overhang * 2) * k;
    const lidH = (frameH - base.h - shadow) * k;
    const baseY = lidH;
    const baseH = base.h * k;

    /* A soft shadow on the table under the base. */
    ctx.save();
    ctx.filter = `blur(${5 * k}px)`;
    ctx.fillStyle = 'rgba(15, 23, 20, 0.28)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, baseY + baseH + 1 * k, canvas.width / 2 - 26 * k, 5 * k, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* The lid: a dark bezel, rounder at the top than where it meets the base. */
    ctx.fillStyle = '#141c19';
    ctx.beginPath(); ctx.roundRect(lidX, 0, lidW, lidH, [lid.r * k, lid.r * k, 4 * k, 4 * k]); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.roundRect(lidX + k, k, lidW - 2 * k, lidH - 2 * k, [lid.r * k - k, lid.r * k - k, 3 * k, 3 * k]); ctx.stroke();
    ctx.fillStyle = '#2b3833';
    ctx.beginPath(); ctx.arc(canvas.width / 2, (lid.top / 2) * k, 2.4 * k, 0, Math.PI * 2); ctx.fill();

    /* The base: brushed aluminium, a notch to open it by. */
    const metal = ctx.createLinearGradient(0, baseY, 0, baseY + baseH);
    metal.addColorStop(0, '#eceff1');
    metal.addColorStop(0.45, '#d3d8db');
    metal.addColorStop(1, '#9aa1a6');
    ctx.fillStyle = metal;
    ctx.beginPath(); ctx.roundRect(0, baseY, canvas.width, baseH, [2 * k, 2 * k, 9 * k, 9 * k]); ctx.fill();
    ctx.fillStyle = '#b3babe';
    ctx.beginPath(); ctx.roundRect(canvas.width / 2 - 75 * k, baseY, 150 * k, 5 * k, [0, 0, 5 * k, 5 * k]); ctx.fill();

    /* The screen. */
    ctx.save();
    ctx.beginPath(); ctx.roundRect(at.x * k, at.y * k, img.width, img.height, 3 * k); ctx.clip();
    ctx.drawImage(img, at.x * k, at.y * k);
    ctx.restore();

    const px = ctx.getImageData(at.x * k, at.y * k, img.width, img.height).data;
    let inked = 0, seen = 0;
    for (let i = 0; i < px.length; i += 4 * 37) {
      seen++;
      if (px[i] < 246 || px[i + 1] < 246 || px[i + 2] < 246) inked++;
    }
    return { data: canvas.toDataURL('image/jpeg', quality).split(',')[1], ink: inked / seen };
  }, {
    data: b64, scale: SCALE, lid: LID, base: BASE, shadow: SHADOW,
    frameW: FRAME.w, frameH: FRAME.h, at: SCREEN_AT, paper, quality: SHOT_Q
  });
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  return shot.ink;
}

/* Put a map where the slide needs it. A farm is framed close enough for its
 * trees to be drawn; `fitFarms` frames every holding on the map, which is
 * tighter than the page's own opening view. */
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
      /* `ink` measures the words rather than their box: a figure's number sits
       * in a box as wide as its card, and "beside the number" means beside the
       * digits. */
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = m.ink ? range.getBoundingClientRect() : el.getBoundingClientRect();
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
  await page.mouse.move(VIEW.width - 2, VIEW.height - 2);   // no hover state in the picture
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
const TOTAL = SCREENS.length + 2;
const BAND_W = W / 2 - MARGIN - 0.2;
const LANGS = [
  { lang: 'en', label: 'ENGLISH', bandX: MARGIN, sideX: MARGIN },
  { lang: 'az', label: 'AZƏRBAYCANCA', bandX: W / 2 + 0.2, sideX: LAPTOP_X + LAPTOP_W + GUTTER }
];

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Wafra Greentech';
pres.title = 'Plant health, crops and orchards — a short tour';

const text = (s, value, options) => s.addText(value, { fontFace: FONT, margin: 0, isTextBox: true, ...options });

/* The numbered disc, on the picture and beside the points alike. */
const disc = (s, n, x, y) => text(s, String(n), {
  shape: pres.shapes.OVAL, x, y, w: DISC, h: DISC,
  fill: { color: DEEP }, line: { color: WHITE, width: 1.25 },
  fontSize: 10, bold: true, color: WHITE, align: 'center', valign: 'middle'
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
  const PANEL_X = 7.3;
  s.addShape(pres.shapes.RECTANGLE, { x: PANEL_X, y: 0, w: W - PANEL_X, h: H, fill: { color: PANEL }, line: { color: PANEL } });
  const cover = SCREENS.find((sc) => sc.id === COVER.screen);
  const coverW = W - PANEL_X - 0.5;
  const coverH = coverW * (FRAME.h / FRAME.w);
  s.addImage({ path: cover.coverFile, x: PANEL_X + 0.25, y: (H - coverH) / 2, w: coverW, h: coverH });

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
  s.addImage({ path: screen.file, x: LAPTOP_X, y: LAPTOP_Y, w: LAPTOP_W, h: LAPTOP_H });

  /* Viewport pixels to slide inches: through the frame, then to scale. */
  screen.at.forEach((p, i) => {
    const x = LAPTOP_X + ((SCREEN_AT.x + p.x) / FRAME.w) * LAPTOP_W;
    const y = LAPTOP_Y + ((SCREEN_AT.y + p.y) / FRAME.h) * LAPTOP_H;
    disc(s, i + 1, x - DISC / 2, y - DISC / 2);
  });

  /* Points start level with the top of the screen and share the height the
   * laptop takes, so the two sides and the picture read as one block. */
  const count = screen.en.points.length;
  const top = LAPTOP_Y + (SCREEN_AT.y / FRAME.h) * LAPTOP_H;
  const pitch = Math.min(1.2, (7.0 - top) / count);
  for (const side of LANGS) {
    const copy = screen[side.lang];
    text(s, side.label, {
      x: side.bandX, y: 0.5, w: BAND_W, h: 0.26, fontSize: 10, bold: true, color: LABEL, charSpacing: 2, valign: 'middle'
    });
    text(s, copy.title, { x: side.bandX, y: 0.8, w: BAND_W, h: 0.5, fontSize: 24, bold: true, color: INK, valign: 'top' });
    text(s, copy.intro, { x: side.bandX, y: 1.34, w: BAND_W, h: 0.64, fontSize: 14, color: BODY, valign: 'top' });
    copy.points.forEach((point, i) => {
      const y = top + i * pitch;
      disc(s, i + 1, side.sideX, y);
      text(s, [
        { text: point.head, options: { fontSize: 13, bold: true, color: INK, breakLine: true, paraSpaceAfter: 2 } },
        { text: point.text, options: { fontSize: 11.5, color: BODY } }
      ], { x: side.sideX + 0.36, y: y + 0.005, w: SIDE_W - 0.36, h: pitch - 0.08, valign: 'top' });
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

  /* A closing line under the cards, when the deck has one to say. */
  if (CLOSING.en.next) {
    text(s, [
      { text: CLOSING.en.next, options: { fontSize: 15, bold: true, color: WHITE, breakLine: true } },
      { text: CLOSING.az.next, options: { fontSize: 14, color: PALE } }
    ], { x: 0.75, y: 6.3, w: 10.5, h: 0.75, valign: 'top' });
  }
  s.addNotes(`${CLOSING.en.title}\n${CLOSING.az.title}`);
  pageNumber(s, TOTAL, PALE);
}

await mkdir(dirname(OUT), { recursive: true });
await pres.writeFile({ fileName: OUT });
if (!process.argv.includes('--keep')) await rm(WORK, { recursive: true, force: true });
console.log(`${TOTAL} slides -> ${OUT.replace(ROOT + '/', '')}`);
console.log(`  ${SCREENS.length} screens at ${VIEW.width}×${VIEW.height} on a laptop, narrow menu, ${SCREENS.reduce((n, s) => n + s.markers.length, 0)} markers`);
console.log(`  ${stage.tileStats.hit + stage.tileStats.fetched} map tiles served (${stage.tileStats.fetched} fetched, ${stage.tileStats.hit} from .tile-cache)`);
