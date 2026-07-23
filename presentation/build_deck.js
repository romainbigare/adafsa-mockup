// Build presentation/adafsa-redesign-draft.pptx from the storyboard.
// Cover + 10 slides: problem statement (1-4), solution (5-10). Visual-first:
// one diagram or one annotated image per slide; annotations connect to the
// image with leader lines. Run: node build_deck.js
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
function leader(slide, x1, y1, x2, y2) {
  slide.addShape("line", {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1,
    line: { color: MUTED, width: 1.25 },
  });
  slide.addShape("ellipse", { x: x2 - 0.05, y: y2 - 0.05, w: 0.1, h: 0.1, fill: { color: FOREST } });
}
function annotate(slide, rect, fx, fy, label, pos) {
  const ax = rect.x + fx * rect.w, ay = rect.y + fy * rect.h;
  const boxed = pos.boxFill
    ? { fill: { color: WHITE }, line: { color: "E2E0DA", width: 1 }, margin: 0.08 }
    : { margin: 0 };
  slide.addText(label.text, {
    x: pos.x, y: pos.y, w: pos.w, h: pos.h || 1.1, fontFace: FONT, fontSize: 12.5,
    color: INK, valign: "top", lineSpacingMultiple: 1.08,
    align: pos.align || "left", ...boxed,
  });
  let lx, ly;
  if (pos.side === "right") { lx = pos.x - 0.08; ly = pos.y + 0.12; }
  else if (pos.side === "below") { lx = pos.x + (pos.w / 2); ly = pos.y - 0.08; }
  else if (pos.side === "above") { lx = pos.x + (pos.w / 2); ly = pos.y + (pos.h || 1.1) + 0.06; }
  else { lx = pos.x + pos.w + 0.08; ly = pos.y + 0.12; } // label left of image
  leader(slide, lx, ly, ax, ay);
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
    s.addText("July 2026", {
      x: 0.9, y: 6.7, w: 5.0, h: 0.35, fontFace: FONT, fontSize: 12, color: "A9C4B0", margin: 0,
    });
    s.addNotes("The platform is growing from a handful of map layers to six analysis modules. Before building them in, I wanted to look carefully at how the current app is used, and what the layout should become. This is that walk-through. Everything shown is a working mockup.");
  }

  // ---------- 1 · Three questions, three altitudes ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Three questions, three altitudes");
    await fitImage(s, A("diagrams/journeys-altitudes.png"), { x: 1.2, y: 1.05, w: 10.93, h: 6.1 });
    s.addNotes("Watch how the officials actually use a tool like this, and three habits appear. A director glances at it in the morning and wants one thing: is anything wrong. An operator sits down on Monday and wants a list: which farms, worst first. An inspector prepares a visit and wants everything about one farm. Three questions, asked at three depths. I've been calling these altitudes. The whole redesign follows from taking them seriously.");
  }

  // ---------- 2 · Start with the menu ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Start with the menu");
    const r = await fitImage(s, A("current/current-app-nav-focus.jpg"), { x: 0.7, y: 1.15, w: 12.0, h: 6.05 });
    annotate(s, r, 0.055, 0.19,
      { text: "Farms, Farm Monitoring, Violations. Which one answers a question? The names do not say." },
      { x: 3.6, y: 1.75, w: 3.6, h: 0.95, side: "right", boxFill: true });
    annotate(s, r, 0.045, 0.41,
      { text: "Seven of the ten entries are support and settings. Half the menu is about the tool, not the farms." },
      { x: 3.6, y: 3.45, w: 3.6, h: 0.95, side: "right", boxFill: true });
    annotate(s, r, 0.06, 0.78,
      { text: "And the six analyses the client is buying appear nowhere in this menu." },
      { x: 3.6, y: 5.35, w: 3.6, h: 0.75, side: "right", boxFill: true });
    s.addNotes("This is the real app, and I have faded everything except the menu, because the menu tells you what a product thinks it is for. Read it top to bottom. Farms and Farm Monitoring sound alike, and neither name says what question it answers. Violations sits alone under Analytics. Then seven entries of support and settings. A small detail worth knowing: these items are not links, so nothing in this app can be bookmarked or shared. And the six analyses we are contracted to deliver are not in this menu, because the layout has no place for them.");
  }

  // ---------- 3 · Can it tell us whether anything is wrong? ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Can it tell us whether anything is wrong?");
    const r = await fitImage(s, A("current/current-app-overview.jpg"), { x: 3.2, y: 1.55, w: 9.2, h: 5.2 });
    annotate(s, r, 0.615, 0.27,
      { text: "The map shows what is where. It does not say what matters." },
      { x: 8.55, y: 0.98, w: 4.25, h: 0.55, side: "above" });
    annotate(s, r, 0.213, 0.2,
      { text: "Six switches. The user has to know what to ask for." },
      { x: 0.45, y: 2.0, w: 2.35 });
    annotate(s, r, 0.29, 0.56,
      { text: "Three counters count the inventory. They never say whether things are fine." },
      { x: 0.45, y: 3.7, w: 2.35 });
    annotate(s, r, 0.25, 0.81,
      { text: "Totals by category. No farm names, no order of urgency." },
      { x: 4.4, y: 6.95, w: 5.2, h: 0.45, side: "below", align: "center" });
    s.addNotes("Now the overview page itself, as captured. Put yourself in the director's chair on a Tuesday morning. The question is simple: is anything wrong. Look for the answer. The counters count farms and hectares. The switches ask what you would like displayed. The tables total up categories, so no farm is ever named and nothing is ranked. The answer to the first question is not on this screen, and the Monday list cannot be produced here either. The user is left to assemble both.");
  }

  // ---------- 4 · Can it tell us what is happening on a farm? ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Can it tell us what is happening on a farm?");
    // the full page as a tall strip: its length is part of the argument
    const strip = await fitImage(s, A("current/current-monitoring-wireframe.jpg"), { x: 3.55, y: 1.3, w: 2.9, h: 5.9 });
    const top = await fitImage(s, A("current/current-monitoring-top.jpg"), { x: 6.9, y: 1.45, w: 5.9, h: 2.6 });
    s.addText("the top of the page, closer", {
      x: 6.9, y: 4.08, w: 5.9, h: 0.25, fontFace: FONT, fontSize: 10.5, italic: true, color: MUTED, margin: 0, align: "center",
    });
    const adv = await fitImage(s, A("current/current-monitoring-advisory.jpg"), { x: 6.9, y: 4.55, w: 3.4, h: 2.5 });
    annotate(s, strip, 0.5, 0.03,
      { text: "First, choices: a farm, a view, a capture. Nothing appears until they are made." },
      { x: 0.45, y: 1.75, w: 2.6 });
    annotate(s, strip, 0.5, 0.45,
      { text: "Then instruments: weather, soil moisture, growth phases, degree days. Eight panels of readings on one page." },
      { x: 0.45, y: 3.5, w: 2.6 });
    annotate(s, adv, 0.5, 0.25,
      { text: "The one panel named like an answer asks the user to check back later." },
      { x: 10.55, y: 4.9, w: 2.35, side: "right" });
    s.addNotes("The closest thing to a farm page today is Farm Monitoring. It works like an instrument. Choose a farm and a map view; nothing has a default. Then find a usable image by reading satellite mission codes and cloud-cover percentages across thirty dated captures. Then a long scroll of readings: weather, soil moisture, growth phase, degree days. That is a remote-sensing analyst's workflow. Even where the page does conclude something, the water scheduler's proceed-with-irrigation call, the reasoning sits in a collapsed panel of raw technical fields. Our users' question is what is happening on this farm, and whether someone should go there. The data to answer it is all here. The conclusion is not.");
  }

  // ---------- 5 · The proposal, seen from the menu ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "The proposal, seen from the menu");
    await fitImage(s, A("diagrams/wireframe-nav.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("The proposal starts where the problem started, with the menu. Overview is the morning glance. The six modules are the questions, listed by name; each one becomes a page rather than a switch. Farm Analysis is the deep dive on one farm. The structure of the menu is the structure of the idea, and it also lists exactly what the client is buying. Each level is a page with its own address, so any view can be linked in a report or an email.");
  }

  // ---------- 6 · Three pages, three altitudes ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "Three pages, three altitudes");
    await fitImage(s, A("diagrams/wireframe-three-pages.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("Each altitude gets one page, and the three pages share one shape: the answer at the top or the side, the map in the middle, the detail below. The Overview answers the morning question. A module page answers one question in depth. Farm Analysis holds everything about one farm. Learn one page and the other two feel familiar.");
  }

  // ---------- 7 · The shape of a module page ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "The shape of a module page");
    await fitImage(s, A("diagrams/wireframe-module.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("Every module page has the same shape. The numbers on top, one legend, the map coloured by that question, the ranked list at the bottom with an export. One addition since the last review: the full crop and tree taxonomy is back in the product, as a filter. Tick date palms, and the map, the counts and the ranking all narrow to farms growing date palms. Each module filters by the taxonomy it is about. The filter drives everything at once, so the numbers and the map can never disagree.");
  }

  // ---------- 8 · Altitude 1, in practice ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 1, in practice");
    const r = await fitImage(s, A("new/alt1-situation.jpg"), { x: 3.05, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.24, 0.18,
      { text: "The region's numbers and bands, in one panel." },
      { x: 0.45, y: 1.6, w: 2.35 });
    annotate(s, r, 0.29, 0.365,
      { text: "A filter waits here. Pick crops or trees, and the whole page narrows to those farms." },
      { x: 0.45, y: 3.15, w: 2.35 });
    annotate(s, r, 0.55, 0.43,
      { text: "One fixed lens: overall health. Colour marks where the problems are." },
      { x: 0.45, y: 4.85, w: 2.35 });
    annotate(s, r, 0.5, 0.9,
      { text: "Six tiles, one status word each. Each tile opens its module." },
      { x: 4.2, y: 6.8, w: 5.6, h: 0.45, side: "below", align: "center" });
    s.addNotes("The morning screen, as built today. The left panel carries the region's numbers and the band breakdown. The map has one fixed lens, overall health, so nobody chooses a layer to see trouble. The six tiles answer for each module with a plain word and a small chart of the bands. And the filter sits quietly under the legend: open it, tick a crop, and the map, the panel and the tiles all follow. When everything is fine this screen is quiet, and that is deliberate.");
  }

  // ---------- 9 · Altitude 2, in practice ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 2, in practice");
    const r = await fitImage(s, A("new/alt2-module-ier.jpg"), { x: 3.05, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.52, 0.05,
      { text: "The page holds one question. These are its numbers." },
      { x: 0.45, y: 1.5, w: 2.35 });
    annotate(s, r, 0.078, 0.375,
      { text: "Changing module changes the question. The map stays where it was." },
      { x: 0.45, y: 3.1, w: 2.35 });
    annotate(s, r, 0.42, 0.5,
      { text: "Colour follows the score, from the region glow down to each farm." },
      { x: 0.45, y: 4.85, w: 2.35 });
    annotate(s, r, 0.5, 0.87,
      { text: "Farms ranked worst first, ready to export." },
      { x: 4.2, y: 6.8, w: 5.6, h: 0.45, side: "below", align: "center" });
    s.addNotes("One click down, into irrigation efficiency. The page belongs to that one question. Its numbers are on top, each farm is coloured by its score, and the bottom holds the ranked list with an export button. That list is the Monday morning. The filter works here too, scoped to what the module is about: Crop Monitoring filters by field crops, Palms by trees. The other five modules are this same page with different content, so there is nothing new to learn.");
  }

  // ---------- 10 · Altitude 3, in practice ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 3, in practice");
    const r = await fitImage(s, A("new/alt3-farm-dossier.jpg"), { x: 0.5, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.88, 0.13,
      { text: "The system's conclusion, in one sentence." },
      { x: 9.85, y: 1.6, w: 3.0, side: "right" });
    annotate(s, r, 0.88, 0.38,
      { text: "All six modules, for this one farm." },
      { x: 9.85, y: 3.15, w: 3.0, side: "right" });
    annotate(s, r, 0.88, 0.86,
      { text: "It ends with something to do: export, or open the full analysis." },
      { x: 9.85, y: 4.85, w: 3.0, side: "right" });
    annotate(s, r, 0.47, 0.32,
      { text: "The farm, highlighted in place." },
      { x: 1.6, y: 6.8, w: 3.6, h: 0.45, side: "below", align: "center" });
    s.addNotes("And the last altitude: one farm. The map zooms to it, the panel gives the system's conclusion in a sentence, then each module's reading for this farm. At the bottom there is always something to do next: export the farm's data, or open the full analysis page, which keeps the depth the monitoring page offered, one level down where it belongs. The back button walks the same path in reverse. That is the whole design. Three questions, three altitudes, one click between them.");
  }

  const out = `${REPO}/adafsa-redesign-draft.pptx`;
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
})().catch((e) => { console.error(e); process.exit(1); });
