// Build presentation/adafsa-redesign-draft.pptx from the storyboard.
// Cover + 11 slides. Problem (1-2) -> framework (3) -> solution (4-11).
// Screenshot slides use a modern annotation: a soft floating card + a thin
// leader + a small ring marker at the target. Wireframe slides carry their
// own baked-in labels. Run: node build_deck.js
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");

const REPO = "/home/user/adafsa-mockup/presentation";
const A = (p) => `${REPO}/assets/${p}`;

const INK = "1F2937";
const MUTED = "6B7280";
const FOREST = "166534";
const FOREST_DARK = "0F2A1A";
const PAPER = "FAF9F6";
const LIGHT = "DCE9DF";
const WHITE = "FFFFFF";
const LINE = "AEB4BC";
const FONT = "Calibri";
const PW = 13.333, PH = 7.5;

const dims = {};
async function measure(path) {
  if (!dims[path]) {
    const m = await sharp(path).metadata();
    dims[path] = { w: m.width, h: m.height };
  }
  return dims[path];
}
async function fitImage(slide, path, box, opts = {}) {
  const { w: iw, h: ih } = await measure(path);
  const s = Math.min(box.w / iw, box.h / ih);
  const w = iw * s, h = ih * s;
  const x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
  slide.addImage({ path, x, y, w, h, ...opts });
  return { x, y, w, h };
}
function title(slide, text) {
  slide.addText(text, {
    x: 0.55, y: 0.35, w: 12.2, h: 0.55, fontFace: FONT, fontSize: 24,
    bold: true, color: INK, margin: 0,
  });
}

// Modern annotation: soft white card (rounded, soft shadow) + thin leader +
// ring marker at the target point (fx,fy fractions of the placed image rect).
// pos: { x, y, w, h, side: 'left'|'right'|'above'|'below', align }
function annotate(slide, rect, fx, fy, text, pos) {
  const ax = rect.x + fx * rect.w, ay = rect.y + fy * rect.h;
  const w = pos.w, h = pos.h || 0.85, x = pos.x, y = pos.y;
  const side = pos.side || "left";
  // leader FIRST (so the card sits above the line)
  let sx, sy;
  if (side === "left") { sx = x + w; sy = y + h / 2; }
  else if (side === "right") { sx = x; sy = y + h / 2; }
  else if (side === "above") { sx = x + w / 2; sy = y + h; }
  else { sx = x + w / 2; sy = y; } // below
  slide.addShape("line", {
    x: Math.min(sx, ax), y: Math.min(sy, ay),
    w: Math.abs(ax - sx), h: Math.abs(ay - sy),
    flipH: ax < sx, flipV: ay < sy,
    line: { color: LINE, width: 1 },
  });
  // ring marker: forest outer, white centre
  slide.addShape("ellipse", { x: ax - 0.07, y: ay - 0.07, w: 0.14, h: 0.14, fill: { color: FOREST } });
  slide.addShape("ellipse", { x: ax - 0.028, y: ay - 0.028, w: 0.056, h: 0.056, fill: { color: WHITE } });
  // the floating card
  slide.addText(text, {
    shape: "roundRect", rectRadius: 0.09, x, y, w, h,
    fill: { color: WHITE },
    shadow: { type: "outer", color: "8A8F98", blur: 9, offset: 3, angle: 90, opacity: 0.3 },
    fontFace: FONT, fontSize: 12, color: INK, align: pos.align || "left",
    valign: "middle", margin: 0.12, lineSpacingMultiple: 1.05,
  });
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Wafra design team";
  pres.title = "Farm dashboard redesign";

  // ---------- Cover ----------
  {
    const s = pres.addSlide();
    s.background = { color: FOREST_DARK };
    s.addImage({ path: A("new/alt1-situation.jpg"), x: 0, y: 0, w: PW, h: PH });
    s.addShape("rect", { x: 0, y: 0, w: PW, h: PH, fill: { color: "0B1F12", transparency: 16 } });
    s.addText("Farm dashboard redesign", {
      x: 0.9, y: 2.75, w: 12.2, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: WHITE, margin: 0,
    });
    s.addText("Preparing the platform for six analysis modules.", {
      x: 0.9, y: 3.75, w: 11.0, h: 0.5, fontFace: FONT, fontSize: 19, color: LIGHT, margin: 0,
    });
    s.addText("July 2026", { x: 0.9, y: 6.7, w: 5.0, h: 0.35, fontFace: FONT, fontSize: 12, color: "A9C4B0", margin: 0 });
    s.addNotes("The platform is growing from a handful of map layers to six analysis modules. Before building them in, I looked at how the current app is used, and what the layout should become. This is that walk-through. Everything shown is a working mockup.");
  }

  // ---------- 1 · Start with the menu ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Start with the menu");
    const r = await fitImage(s, A("current/current-app-nav-focus.jpg"), { x: 0.7, y: 1.15, w: 12.0, h: 6.05 });
    annotate(s, r, 0.055, 0.19, "Farms, Farm Monitoring, Violations. The names don't say which one answers a question.",
      { x: 3.6, y: 1.7, w: 3.6, h: 0.95, side: "right" });
    annotate(s, r, 0.045, 0.41, "Seven of the ten entries are support and settings. Half the menu is about the tool, not the farms.",
      { x: 3.6, y: 3.4, w: 3.6, h: 0.95, side: "right" });
    annotate(s, r, 0.06, 0.78, "The six analyses the client is buying appear nowhere here.",
      { x: 3.6, y: 5.35, w: 3.6, h: 0.75, side: "right" });
    s.addNotes("The menu tells you what a product thinks it is for. Read it top to bottom. Farms and Farm Monitoring sound alike, and neither says what question it answers. Then seven entries of support and settings. And the six analyses we are contracted to deliver are not here at all — the layout has no place for them. A small aside: these items are not even links, so nothing in this app can be bookmarked or shared.");
  }

  // ---------- 2 · Can it tell us whether anything is wrong? ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Can it tell us whether anything is wrong?");
    const r = await fitImage(s, A("current/current-app-overview.jpg"), { x: 3.2, y: 1.55, w: 9.2, h: 5.2 });
    annotate(s, r, 0.213, 0.2, "Six switches. You have to know what to ask for.",
      { x: 0.45, y: 1.95, w: 2.4, h: 0.8 });
    annotate(s, r, 0.29, 0.56, "Three counters count the inventory. They never say whether things are fine.",
      { x: 0.45, y: 3.55, w: 2.4, h: 1.0 });
    annotate(s, r, 0.25, 0.81, "Totals by category. No farm is named, nothing is ranked.",
      { x: 4.5, y: 6.95, w: 4.6, h: 0.55, side: "below", align: "center" });
    s.addNotes("The director's question on a Tuesday morning is simple: is anything wrong. Look for the answer. The counters count farms and hectares. The switches ask what you would like displayed. The tables total up categories, so no farm is named and nothing is ranked. The answer is not on this screen. The user has to assemble it.");
  }

  // ---------- 3 · The user's journey ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "The user's journey");
    await fitImage(s, A("diagrams/journeys-depth.png"), { x: 1.2, y: 1.05, w: 10.93, h: 6.1 });
    s.addNotes("Three people, three habits. A director glances in the morning and wants one thing: is anything wrong. An operator wants a list: which farms, worst first. An inspector wants everything about one farm. Same tool, three depths. The redesign takes each one seriously and gives it its own screen.");
  }

  // ---------- 4 · Proposed navigation ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Proposed navigation");
    await fitImage(s, A("diagrams/wireframe-nav.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("The proposal starts with the menu. Overview is the morning glance. The six modules are the questions, listed by name; each becomes a page, not a switch. Farm Analysis is the deep dive on one farm. The menu is the idea, and it lists exactly what the client is buying. Every level has its own address, so any view can be linked in a report or an email.");
  }

  // ---------- 5 · Three pages, three depths ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Three pages, three depths");
    await fitImage(s, A("diagrams/wireframe-three-pages.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("Each depth gets one page, and the three share one shape: the answer at the top or the side, the map in the middle, the detail below. Learn one and the other two feel familiar. Let us look at each in turn.");
  }

  // ---------- 6 · Depth 1 · The situation at a glance (wireframe) ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Depth 1 · The situation at a glance");
    await fitImage(s, A("diagrams/wireframe-overview.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("The morning page. The region's numbers and the band breakdown sit in one panel. The map has a single fixed lens, overall health, so nobody chooses a layer to see trouble. Six verdict cards answer for each module with a plain word. And a filter waits under the legend: tick a crop or a tree, and the map, the panel and the cards all narrow to those farms.");
  }

  // ---------- 7 · Depth 1 · Example ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Depth 1 · Example");
    const r = await fitImage(s, A("new/alt1-situation.jpg"), { x: 3.05, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.24, 0.18, "The region's numbers and bands, in one panel.",
      { x: 0.45, y: 1.6, w: 2.4, h: 0.8 });
    annotate(s, r, 0.29, 0.365, "The filter, waiting under the legend.",
      { x: 0.45, y: 3.2, w: 2.4, h: 0.7 });
    annotate(s, r, 0.5, 0.9, "Six cards, one status word each.",
      { x: 4.4, y: 6.85, w: 4.4, h: 0.5, side: "below", align: "center" });
    s.addNotes("The same page, built. When everything is fine it stays quiet — which is what makes the red days legible.");
  }

  // ---------- 8 · Depth 2 · The module in detail (wireframe) ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Depth 2 · The module in detail");
    await fitImage(s, A("diagrams/wireframe-module.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("Every module page has the same shape. The numbers on top, one legend, the map coloured by that question, the ranked list at the bottom with an export. The full crop and tree taxonomy is here as a filter: tick date palms, and the map, the counts and the ranking all narrow to farms growing date palms. Each module filters by the taxonomy it is about. The filter drives everything at once, so the numbers and the map can never disagree.");
  }

  // ---------- 9 · Depth 2 · Example ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Depth 2 · Example");
    const r = await fitImage(s, A("new/alt2-module-ier.jpg"), { x: 3.05, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.52, 0.05, "One question. These are its numbers.",
      { x: 0.45, y: 1.5, w: 2.4, h: 0.7 });
    annotate(s, r, 0.078, 0.375, "Switch module; the map stays where it was.",
      { x: 0.45, y: 3.15, w: 2.4, h: 0.8 });
    annotate(s, r, 0.5, 0.87, "Farms ranked worst first, ready to export.",
      { x: 4.4, y: 6.85, w: 4.4, h: 0.5, side: "below", align: "center" });
    s.addNotes("Irrigation efficiency, in the product. The ranked list is a civil servant's Monday morning. The other five modules are this same page with different content.");
  }

  // ---------- 10 · Depth 3 · The farm in detail (wireframe) ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Depth 3 · The farm in detail");
    await fitImage(s, A("diagrams/wireframe-farm.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("One farm. The map zooms to it and highlights it. The panel gives the system's conclusion in a sentence, then each module's reading for this farm. And it ends in an action: export the farm, or open the full analysis, which keeps the depth the old monitoring page offered — one level down, where it belongs.");
  }

  // ---------- 11 · Depth 3 · Example ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Depth 3 · Example");
    const r = await fitImage(s, A("new/alt3-farm-dossier.jpg"), { x: 0.5, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.88, 0.13, "The conclusion, in one sentence.",
      { x: 9.85, y: 1.6, w: 3.0, h: 0.7, side: "right" });
    annotate(s, r, 0.88, 0.38, "All six modules, for this one farm.",
      { x: 9.85, y: 3.2, w: 3.0, h: 0.7, side: "right" });
    annotate(s, r, 0.88, 0.86, "It ends with something to do.",
      { x: 9.85, y: 4.9, w: 3.0, h: 0.7, side: "right" });
    s.addNotes("The farm dossier, built. The back button walks the same path in reverse. Three questions, three depths, one step between them.");
  }

  const out = `${REPO}/adafsa-redesign-draft.pptx`;
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
})().catch((e) => { console.error(e); process.exit(1); });
