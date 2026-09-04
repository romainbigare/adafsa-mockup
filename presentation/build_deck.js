// Build presentation/adafsa-redesign-draft.pptx
// 15 slides: cover · current-solution critique (2) · the two steps (2) ·
// the three level layouts (4) · the journey · live demo · appendix diagrams (4).
// Every annotation is a native PowerPoint shape so the text stays editable.
// Run: node build_deck.js
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
const BLUE = "4F6FD6";   // highlight boxes on the critique slides
const AMBER = "F0B03C";  // hand-drawn style arrows
const ARROW_GREEN = "4E7C2F";
const FONT = "Calibri";
const PW = 13.333, PH = 7.5;
const DEMO_URL = "https://romainbigare.github.io/adafsa-mockup/#/overview";

const dims = {};
async function measure(path) {
  if (!dims[path]) { const m = await sharp(path).metadata(); dims[path] = { w: m.width, h: m.height }; }
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
function titleBlock(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.55, y: 0.3, w: 12.2, h: 0.5, fontFace: FONT, fontSize: 25, bold: true, color: INK, margin: 0,
  });
  if (subtitle) slide.addText(subtitle, {
    x: 0.55, y: 0.82, w: 12.2, h: 0.4, fontFace: FONT, fontSize: 15, color: INK, margin: 0,
  });
}
let PAGE = 1;
function pageNum(slide) {
  PAGE += 1;
  slide.addText(String(PAGE), {
    x: 12.5, y: 6.95, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10, color: MUTED, align: "right", margin: 0,
  });
}
// native annotation: soft card + thin leader + ring marker
function annotate(slide, rect, fx, fy, text, pos) {
  const ax = rect.x + fx * rect.w, ay = rect.y + fy * rect.h;
  const w = pos.w, h = pos.h || 0.85, x = pos.x, y = pos.y;
  const side = pos.side || "left";
  let sx, sy;
  if (side === "left") { sx = x + w; sy = y + h / 2; }
  else if (side === "right") { sx = x; sy = y + h / 2; }
  else if (side === "above") { sx = x + w / 2; sy = y + h; }
  else { sx = x + w / 2; sy = y; }
  slide.addShape("line", {
    x: Math.min(sx, ax), y: Math.min(sy, ay), w: Math.abs(ax - sx), h: Math.abs(ay - sy),
    flipH: ax < sx, flipV: ay < sy, line: { color: LINE, width: 1 },
  });
  slide.addShape("ellipse", { x: ax - 0.07, y: ay - 0.07, w: 0.14, h: 0.14, fill: { color: FOREST } });
  slide.addShape("ellipse", { x: ax - 0.028, y: ay - 0.028, w: 0.056, h: 0.056, fill: { color: WHITE } });
  slide.addText(text, {
    shape: "roundRect", rectRadius: 0.06, x, y, w, h,
    fill: { color: WHITE }, line: { color: "E8EAE6", width: 1 },
    shadow: { type: "outer", color: "8A8F98", blur: 8, offset: 2, angle: 90, opacity: 0.22 },
    fontFace: FONT, fontSize: pos.fs || 11.5, color: INK, align: pos.align || "left",
    bold: !!pos.bold, valign: "middle", margin: pos.margin != null ? pos.margin : 0.09,
    lineSpacingMultiple: 1.04,
  });
}
// map a point in a 1600x900 diagram viewBox onto the placed image rect
function sx2in(rect, x) { return rect.x + (x / 1600) * rect.w; }
function sy2in(rect, y) { return rect.y + (y / 900) * rect.h; }
function annotateAt(slide, rect, a) {
  annotate(slide, rect, a.tx / 1600, a.ty / 900, a.text, {
    x: sx2in(rect, a.cx), y: sy2in(rect, a.cy),
    w: (a.cw / 1600) * rect.w + 0.14, h: (a.ch / 900) * rect.h + 0.12,
    side: a.side || "right", align: "left", fs: 10.5, margin: 0.07,
  });
}

const OVERVIEW_ANN = [
  { tx: 406, ty: 230, cx: 1000, cy: 150, cw: 330, ch: 62, text: "The region's numbers and a composite health metric" },
  { tx: 770, ty: 350, cx: 1000, cy: 280, cw: 340, ch: 62, text: "Map shows critical health areas through heat map" },
  { tx: 406, ty: 551, cx: 1000, cy: 410, cw: 360, ch: 86, text: "The taxonomy becomes alive : filtering through the different taxonomy surfaces updated metrics." },
  { tx: 575, ty: 626, cx: 1000, cy: 590, cw: 340, ch: 62, text: "Six cards, one status word each. Each opens its module." },
];
const MODULE_ANN = [
  { tx: 918, ty: 199, cx: 1000, cy: 149, cw: 300, ch: 42, text: "The numbers for this module." },
  { tx: 516, ty: 330, cx: 1000, cy: 257, cw: 300, ch: 64, text: "One legend and one chart at a glance, to quickly understand numbers" },
  { tx: 516, ty: 468, cx: 1000, cy: 367, cw: 320, ch: 88, text: "Tick a crop or a tree type. The map and every number update together." },
  { tx: 840, ty: 522, cx: 1000, cy: 489, cw: 280, ch: 64, text: "Map of farm boundaries + heatmap" },
  { tx: 904, ty: 614, cx: 1000, cy: 593, cw: 280, ch: 64, text: "Export, customise columns, sort, reorder, etc" },
  { tx: 920, ty: 686, cx: 1000, cy: 712, cw: 300, ch: 42, text: "Table with farms ranked worst first." },
];
const FARM_ANN = [
  { tx: 436, ty: 350, cx: 280, cy: 45, cw: 360, ch: 42, side: "above", text: "The farm, highlighted on the map." },
  { tx: 972, ty: 258, cx: 1060, cy: 180, cw: 320, ch: 64, text: "The system's conclusion, in one sentence." },
  { tx: 972, ty: 444, cx: 1060, cy: 268, cw: 320, ch: 64, text: "Every module's reading for this one farm." },
  { tx: 972, ty: 637, cx: 1060, cy: 356, cw: 320, ch: 88, text: "It ends in an action: export, or open the full analysis." },
];

const LEVELS = [
  { icon: "icon-1.png", name: "Level 1 : The general overview", q: "“Is anything wrong today?”",
    sup: "A quick look, first thing in the morning. Or engagement from high-level officials.",
    navName: "Level 1 : The general situation", navSub: "Outlining the current situation in the region",
    stepName: "Overview", bullets: ["Composite health metric", "Composite health heat map", "Summary card for all 6 modules"],
    mini: "mini-overview.png", box: [0.132, 0.195] },
  { icon: "icon-2.png", name: "Level 2 : The modules", q: "“Which farms need attention in terms of irrigation?”",
    sup: "A ranked list to work through during the week.",
    navName: "Level 2 : The modules", navSub: "Responding to specific questions",
    stepName: "A module", bullets: ["Per module summary scores", "Per module health map", "Per module ranked table of farms"],
    mini: "mini-module.png", box: [0.316, 0.634] },
  { icon: "icon-3.png", name: "Level 3 : The farm", q: "“What is happening on this farm?”",
    sup: "The full picture, all the metrics and scans.",
    navName: "Level 3 : The farm", navSub: "Showing what happens on each farm",
    stepName: "Farm Analysis", bullets: ["Per farm scores", "Per farm analytics", "Per farm suggestions"],
    mini: "mini-farm.png", box: [0.740, 0.778] },
];

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Wafra";
  pres.title = "ADAFSA Platform - UX / UI Review";

  // ---------- 1 · Cover ----------
  {
    const s = pres.addSlide();
    s.background = { color: FOREST_DARK };
    s.addImage({ path: A("new/alt1-situation.jpg"), x: 0, y: 0, w: PW, h: PH });
    s.addShape("rect", { x: 0, y: 0, w: PW, h: PH, fill: { color: "0B1F12", transparency: 22 } });
    s.addShape("roundRect", { rectRadius: 0.08, x: 0.85, y: 0.7, w: 2.5, h: 0.95, fill: { color: WHITE } });
    s.addImage({ path: A("brand/wafra-logo.png"), x: 1.05, y: 0.86, w: 2.1, h: 0.63 });
    s.addText("ADAFSA Platform - UX / UI Review", {
      x: 0.9, y: 2.85, w: 12.2, h: 0.9, fontFace: FONT, fontSize: 38, bold: true, color: WHITE, margin: 0,
    });
    s.addText("Preparing the platform for six analysis modules.", {
      x: 0.9, y: 3.85, w: 11.0, h: 0.5, fontFace: FONT, fontSize: 19, color: LIGHT, margin: 0,
    });
    s.addText("July 2026", { x: 0.9, y: 6.7, w: 5.0, h: 0.35, fontFace: FONT, fontSize: 12, color: "A9C4B0", margin: 0 });
  }

  // ---------- 2 · Analysis of Current Solution — navigation ----------
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleBlock(s, "Analysis of Current Solution", "Confusing navigation");
    const r = await fitImage(s, A("current/current-app-nav-focus.jpg"), { x: 0.7, y: 1.35, w: 11.9, h: 5.5 });
    // blue box around the sidebar
    s.addShape("roundRect", {
      rectRadius: 0.02, x: r.x + 0.004 * r.w, y: r.y + 0.02 * r.h, w: 0.142 * r.w, h: 0.96 * r.h,
      fill: { type: "none" }, line: { color: BLUE, width: 1.75 },
    });
    annotate(s, r, 0.055, 0.20, "Farms, Farm Monitoring, Enterprise Information. The navigation and categories are not clear yet. They could also do more to follow a natural user behaviour.",
      { x: 3.15, y: 1.75, w: 3.9, h: 1.2, side: "right" });
    annotate(s, r, 0.045, 0.43, "Seven of the ten entries are support and settings. Half the menu is about the tool, not the farms. This needs to be reduced.",
      { x: 3.15, y: 3.55, w: 3.9, h: 1.05, side: "right" });
    annotate(s, r, 0.06, 0.80, "The six analyses the client is buying appear nowhere here. This will need to be integrated in a mindful way.",
      { x: 3.15, y: 5.3, w: 3.9, h: 1.0, side: "right" });
    pageNum(s);
  }

  // ---------- 3 · Analysis of Current Solution — page morphology ----------
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleBlock(s, "Analysis of Current Solution", "Page morphology - very low density of information");
    const r = await fitImage(s, A("current/current-app-overview-map.jpg"), { x: 3.55, y: 1.5, w: 8.9, h: 5.0 });
    s.addShape("roundRect", {
      rectRadius: 0.02, x: r.x + 0.135 * r.w, y: r.y + 0.02 * r.h, w: 0.858 * r.w, h: 0.96 * r.h,
      fill: { type: "none" }, line: { color: BLUE, width: 1.75 },
    });
    annotate(s, r, 0.215, 0.19, "Six switches. No information is shown on the map by default. Why High Res Image is in that list ? What's the difference between Tree Type and Single Farm Tree Type ?",
      { x: 0.4, y: 1.95, w: 2.9, h: 1.35 });
    annotate(s, r, 0.30, 0.55, "Three counters count the inventory. They never say whether things are fine. Little information is shown for a large area taken.",
      { x: 0.55, y: 3.75, w: 2.75, h: 1.15 });
    annotate(s, r, 0.25, 0.80, "Totals by category. No ranking, no sense of what is being monitored or how well we are doing.",
      { x: 1.5, y: 6.6, w: 4.4, h: 0.75, side: "below", align: "center" });
    annotate(s, r, 0.60, 0.16, "The map only shows farm boundaries, which requires a high level of zoom, appearing empty at landing. We can encode more interesting information on a map.",
      { x: 9.5, y: 0.45, w: 3.4, h: 1.2, side: "above" });
    pageNum(s);
  }

  // ---------- 4 · Step 1 — navigation pane ----------
  {
    const s = pres.addSlide(); s.background = { color: PAPER };
    titleBlock(s, "Step 1 : A better use of the navigation pane", "Split the navigation pane into 3 technical levels");
    const nf = await fitImage(s, A("diagrams/navframe.png"), { x: 0.5, y: 1.6, w: 4.9, h: 4.3 });
    s.addText("Each entry in the menu answers at one level.", {
      x: nf.x, y: nf.y + nf.h + 0.15, w: nf.w, h: 0.3, fontFace: FONT, fontSize: 10.5, color: MUTED, align: "center", margin: 0,
    });
    // three level chips, connected back to the nav frame
    const navY = [0.164, 0.475, 0.759]; // fractions down the nav frame
    LEVELS.forEach((L, i) => {
      const y = 1.85 + i * 1.72;
      s.addImage({ path: A(`diagrams/${L.icon}`), x: 6.05, y: y - 0.06, w: 0.62, h: 0.59 });
      s.addText([
        { text: L.navName, options: { bold: true, color: INK, fontSize: 13.5, breakLine: true } },
        { text: L.navSub, options: { color: INK, fontSize: 12 } },
      ], { x: 6.85, y: y - 0.06, w: 3.6, h: 0.8, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.06 });
      const ax = nf.x + nf.w * 0.33, ay = nf.y + nf.h * navY[i];
      s.addShape("line", { x: Math.min(ax, 6.0), y: Math.min(ay, y + 0.22), w: Math.abs(6.0 - ax), h: Math.abs(y + 0.22 - ay), flipH: 6.0 < ax, flipV: (y + 0.22) < ay, line: { color: LINE, width: 1 } });
      s.addShape("ellipse", { x: ax - 0.055, y: ay - 0.055, w: 0.11, h: 0.11, fill: { color: FOREST } });
    });
    // "what it could look like" + the real sidebar
    s.addText("💡", { x: 10.35, y: 0.95, w: 0.5, h: 0.4, fontFace: FONT, fontSize: 20, margin: 0 });
    s.addText("What it could look like", { x: 10.85, y: 0.98, w: 2.3, h: 0.35, fontFace: FONT, fontSize: 13, color: INK, margin: 0 });
    await fitImage(s, A("new/sidebar-real.jpg"), { x: 10.85, y: 1.5, w: 1.7, h: 5.2 });
    pageNum(s);
  }

  // ---------- 5 · Step 2 — layout for each level ----------
  {
    const s = pres.addSlide(); s.background = { color: PAPER };
    titleBlock(s, "Step 2 : A thoughtful layout for each level", "Maximising information per pixel and attention span");
    const nf = await fitImage(s, A("diagrams/navframe.png"), { x: 0.35, y: 1.9, w: 3.7, h: 3.4 });
    const navY = [0.164, 0.475, 0.759];
    LEVELS.forEach((L, i) => {
      const y = 1.55 + i * 1.85;
      s.addImage({ path: A(`diagrams/${L.icon}`), x: 4.75, y: y, w: 0.58, h: 0.55 });
      s.addText(L.stepName, { x: 4.35, y: y + 0.58, w: 1.4, h: 0.3, fontFace: FONT, fontSize: 11.5, bold: true, color: INK, align: "center", margin: 0 });
      s.addText(L.bullets.map((b, j) => ({ text: "-  " + b, options: { breakLine: j < L.bullets.length - 1 } })), {
        x: 5.95, y: y - 0.02, w: 3.3, h: 1.1, fontFace: FONT, fontSize: 12, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.18,
      });
      const ax = nf.x + nf.w * 0.33, ay = nf.y + nf.h * navY[i];
      s.addShape("line", { x: Math.min(ax, 4.7), y: Math.min(ay, y + 0.28), w: Math.abs(4.7 - ax), h: Math.abs(y + 0.28 - ay), flipH: 4.7 < ax, flipV: (y + 0.28) < ay, line: { color: LINE, width: 1 } });
      s.addShape("ellipse", { x: ax - 0.055, y: ay - 0.055, w: 0.11, h: 0.11, fill: { color: FOREST } });
      s.addImage({ path: A(`diagrams/${L.mini}`), x: 9.7, y: y - 0.18, w: 1.7, h: 1.7 });
    });
    pageNum(s);
  }

  // ---------- 6 · Level 1 layout ----------
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleBlock(s, "Level 1 layout : Overview page", "A composite health metric on the map, 6 verdict cards for the 6 modules");
    const r = await fitImage(s, A("new/alt1-situation.jpg"), { x: 0.5, y: 1.5, w: 8.9, h: 5.1 });
    const C = { x: 9.6, w: 3.35, side: "right" };
    annotate(s, r, 0.245, 0.135, "The region's numbers and a composite health metric", { ...C, y: 1.6, h: 0.75 });
    annotate(s, r, 0.72, 0.30, "Map shows critical health areas through heat map", { ...C, y: 2.6, h: 0.75 });
    annotate(s, r, 0.29, 0.365, "The taxonomy becomes alive : filtering through the different taxonomy surfaces updated metrics.", { ...C, y: 3.6, h: 1.05 });
    annotate(s, r, 0.63, 0.90, "Six cards, one status word each. Each opens its module.", { ...C, y: 4.95, h: 0.8 });
    pageNum(s);
  }

  // ---------- 7 · Level 2 layout — module view ----------
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleBlock(s, "Level 2 layout : The module view", "Full sorted data table, high-level metrics and taxonomy as filter");
    const r = await fitImage(s, A("new/alt2-module-ier.jpg"), { x: 0.5, y: 1.5, w: 8.6, h: 5.1 });
    const C = { x: 9.35, w: 3.6, side: "right" };
    annotate(s, r, 0.60, 0.045, "The numbers for this module.", { ...C, y: 1.5, h: 0.55 });
    annotate(s, r, 0.245, 0.235, "One legend and one chart at a glance, to quickly understand numbers", { ...C, y: 2.2, h: 0.9 });
    annotate(s, r, 0.245, 0.367, "Tick a crop or a tree type. The map and every number update together.", { ...C, y: 3.25, h: 0.8 });
    annotate(s, r, 0.60, 0.45, "Map of farm boundaries + heatmap", { ...C, y: 4.2, h: 0.65 });
    annotate(s, r, 0.933, 0.683, "Export, customise columns, sort, reorder, etc", { ...C, y: 5.0, h: 0.7 });
    annotate(s, r, 0.431, 0.822, "Table with farms ranked worst first.", { ...C, y: 5.85, h: 0.6 });
    pageNum(s);
  }

  // ---------- 8 · Level 2 layout — zooming in ----------
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleBlock(s, "Level 2 layout : Zooming in", "Single farm metrics included");
    const r = await fitImage(s, A("new/alt3-farm-dossier.jpg"), { x: 0.5, y: 1.5, w: 8.6, h: 5.1 });
    // hand-drawn style pointers
    s.addShape("rightArrow", { x: r.x + 0.30 * r.w, y: r.y + 0.52 * r.h, w: 0.85, h: 0.45, fill: { color: AMBER }, rotate: 305 });
    s.addShape("rightArrow", { x: r.x + 0.56 * r.w, y: r.y + 0.52 * r.h, w: 0.85, h: 0.45, fill: { color: AMBER } });
    s.addShape("rightArrow", { x: r.x + 0.26 * r.w, y: r.y + 0.80 * r.h, w: 0.85, h: 0.45, fill: { color: AMBER }, rotate: 195 });
    const C = { x: 9.35, w: 3.6, side: "right" };
    annotate(s, r, 0.845, 0.185, "To the point summary", { ...C, y: 1.55, h: 0.55 });
    annotate(s, r, 0.845, 0.29, "All module metrics for this farm", { ...C, y: 2.45, h: 0.6 });
    annotate(s, r, 0.50, 0.30, "The farm is highlighted in the view", { ...C, y: 3.4, h: 0.6 });
    annotate(s, r, 0.845, 0.87, "Navigate to Level 3", { ...C, y: 4.6, h: 0.6, bold: true });
    pageNum(s);
  }

  // ---------- 9 · Level 3 layout ----------
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleBlock(s, "Level 3 layout : The full farm analytics", "All metrics and scans accessible per farm");
    await fitImage(s, A("new/farm-analysis-water.jpg"), { x: 1.05, y: 1.5, w: 11.2, h: 5.4 });
    pageNum(s);
  }

  // ---------- 10 · We follow the user's journey ----------
  {
    const s = pres.addSlide(); s.background = { color: PAPER };
    titleBlock(s, "We follow the user's journey", "Split the app into three distinct technical levels");
    const X = 4.35;
    LEVELS.forEach((L, i) => {
      const y = 1.75 + i * 1.75;
      s.addImage({ path: A(`diagrams/${L.icon}`), x: X, y: y, w: 0.66, h: 0.63 });
      s.addText([
        { text: L.name, options: { bold: true, color: INK, fontSize: 14, breakLine: true } },
        { text: L.q, options: { italic: true, color: FOREST, fontSize: 12.5, breakLine: true } },
        { text: L.sup, options: { color: MUTED, fontSize: 11 } },
      ], { x: X + 0.95, y: y - 0.04, w: 6.4, h: 1.05, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.06 });
      if (i < 2) {
        s.addShape("downArrow", { x: X + 0.16, y: y + 0.82, w: 0.34, h: 0.78, fill: { color: ARROW_GREEN } });
        s.addText("one level deeper", { x: X + 0.68, y: y + 1.05, w: 1.7, h: 0.3, fontFace: FONT, fontSize: 9.5, color: MUTED, margin: 0 });
      }
    });
    pageNum(s);
  }

  // ---------- 11 · See live demo ----------
  {
    const s = pres.addSlide(); s.background = { color: PAPER };
    s.addText("🌍", { x: 4.05, y: 3.15, w: 1.0, h: 0.9, fontFace: FONT, fontSize: 40, align: "center", margin: 0 });
    s.addText("See live demo", {
      x: 5.15, y: 3.2, w: 4.5, h: 0.8, fontFace: FONT, fontSize: 32, color: "1155CC", underline: true,
      hyperlink: { url: DEMO_URL }, margin: 0, valign: "middle",
    });
    pageNum(s);
  }

  // ---------- 12 · Extra divider ----------
  {
    const s = pres.addSlide(); s.background = { color: PAPER };
    s.addText("💼", { x: 4.9, y: 3.0, w: 0.7, h: 0.6, fontFace: FONT, fontSize: 24, align: "center", margin: 0 });
    s.addText("Extra", { x: 5.7, y: 3.0, w: 2.5, h: 0.6, fontFace: FONT, fontSize: 26, color: INK, margin: 0, valign: "middle" });
    s.addText("Diagrams for the New Proposal", {
      x: 2.5, y: 3.7, w: 8.3, h: 0.7, fontFace: FONT, fontSize: 26, color: INK, align: "center", margin: 0,
    });
    pageNum(s);
  }

  // ---------- 13-15 · Proposal diagrams ----------
  const DIAGRAMS = [
    { sub: "Level 1 - Overview", img: "wireframe-overview.png", ann: OVERVIEW_ANN, box: LEVELS[0].box },
    { sub: "Level 2 - Module View", img: "wireframe-module.png", ann: MODULE_ANN, box: LEVELS[1].box },
    { sub: "Level 2b - Farm Analysis", img: "wireframe-farm.png", ann: FARM_ANN, box: LEVELS[2].box },
  ];
  for (const D of DIAGRAMS) {
    const s = pres.addSlide(); s.background = { color: PAPER };
    titleBlock(s, "Proposal Diagrams", D.sub);
    const np = await fitImage(s, A("diagrams/nav-panel.png"), { x: 0.45, y: 1.55, w: 1.55, h: 4.6 });
    // green highlight around the relevant nav group
    const by0 = np.y + D.box[0] * np.h, by1 = np.y + D.box[1] * np.h;
    s.addShape("roundRect", {
      rectRadius: 0.12, x: np.x + 0.05 * np.w, y: by0 - 0.05, w: np.w * 0.9, h: (by1 - by0) + 0.12,
      fill: { type: "none" }, line: { color: FOREST, width: 1.5 },
    });
    const r = await fitImage(s, A(`diagrams/${D.img}`), { x: 2.25, y: 1.2, w: 10.6, h: 5.85 });
    // connector from the highlighted nav group into the page wireframe
    const ax = np.x + np.w * 0.96, ay = (by0 + by1) / 2;
    const bx = r.x + 0.145 * r.w, by = r.y + 0.42 * r.h;
    s.addShape("line", { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay), flipH: bx < ax, flipV: by < ay, line: { color: LINE, width: 1 } });
    s.addShape("ellipse", { x: ax - 0.055, y: ay - 0.055, w: 0.11, h: 0.11, fill: { color: FOREST } });
    D.ann.forEach((a) => annotateAt(s, r, a));
    pageNum(s);
  }

  const out = `${REPO}/adafsa-redesign-draft.pptx`;
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out, "slides:", PAGE);
})().catch((e) => { console.error(e); process.exit(1); });
