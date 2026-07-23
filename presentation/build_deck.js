// Build presentation/adafsa-redesign-draft.pptx from the storyboard.
// Cover + 8 slides. Visual-first: each content slide is one diagram or one
// annotated screenshot; annotations connect to the image with leader lines.
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
// contain-fit an image into a box, centered; returns the placed rect
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
// leader line from (x1,y1) to (x2,y2) with a small dot at the target end
function leader(slide, x1, y1, x2, y2) {
  slide.addShape("line", {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1,
    line: { color: MUTED, width: 1.25 },
  });
  slide.addShape("ellipse", { x: x2 - 0.05, y: y2 - 0.05, w: 0.1, h: 0.1, fill: { color: FOREST } });
}
// annotation: a short text label whose nearest edge connects to a fractional
// point (fx,fy) on the placed image rect
function annotate(slide, rect, fx, fy, label, pos) {
  const ax = rect.x + fx * rect.w, ay = rect.y + fy * rect.h;
  slide.addText(label.text, {
    x: pos.x, y: pos.y, w: pos.w, h: pos.h || 1.1, fontFace: FONT, fontSize: 12.5,
    color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.08,
    align: pos.align || "left",
  });
  // connect from the label edge facing the anchor
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

  // ---------- 2 · Current app vs the first question ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Can it tell us whether anything is wrong?");
    const r = await fitImage(s, A("current/current-app-wireframe.jpg"), { x: 3.2, y: 1.75, w: 9.6, h: 4.35 });
    annotate(s, r, 0.63, 0.33,
      { text: "The map shows what is where. It does not say what matters." },
      { x: 8.55, y: 0.98, w: 4.25, h: 0.55, side: "above" });
    annotate(s, r, 0.22, 0.30,
      { text: "Six switches. The user has to know what to ask for." },
      { x: 0.45, y: 2.2, w: 2.35 });
    annotate(s, r, 0.28, 0.63,
      { text: "Three counters count the inventory. They never say whether things are fine." },
      { x: 0.45, y: 4.0, w: 2.35 });
    s.addNotes("Here is today's screen. Put yourself in the director's chair on a Tuesday morning. The question is simple: is anything wrong. Now look for the answer. The counters count farms and hectares. The switches ask what you would like displayed. The map shows whatever you switch on. The answer to the first question is not on this screen. The user is left to assemble it.");
  }

  // ---------- 3 · Current app vs questions two and three ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Can it tell us which farms, and what to do?");
    const r = await fitImage(s, A("current/current-app-wireframe.jpg"), { x: 3.2, y: 1.75, w: 9.6, h: 4.35 });
    annotate(s, r, 0.215, 0.46,
      { text: "Two switches mention a single farm. A page about that farm does not exist." },
      { x: 0.45, y: 2.15, w: 2.35 });
    annotate(s, r, 0.08, 0.47,
      { text: "These menu items are not links. Nothing here can be bookmarked or shared." },
      { x: 0.45, y: 4.35, w: 2.35 });
    annotate(s, r, 0.35, 0.84,
      { text: "Totals by category. No farm names, no order of urgency." },
      { x: 4.5, y: 6.55, w: 5.2, h: 0.45, side: "below", align: "center" });
    s.addNotes("Second question: which farms need attention. The tables aggregate by category, so no farm is ever named and nothing is ranked. The Monday list cannot be produced here. Third question: what is happening on this farm. Two switches hint at a single farm, but there is no farm page anywhere in the app. And a small detail with large consequences: the menu items are not links, so no view can be bookmarked, shared, or sent in an email. With six modules arriving, each needing its own numbers and its own ranking, this layout has nowhere to put them.");
  }

  // ---------- 4 · The proposal, seen from the menu ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "The proposal, seen from the menu");
    await fitImage(s, A("diagrams/wireframe-nav.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("The proposal starts with the menu. Overview is the morning glance. The six modules are the questions, listed by name; each one becomes a page rather than a switch. Farm Analysis is the deep dive on one farm. The structure of the menu is the structure of the idea, and it also happens to list exactly what the client is buying. Each level is a page with its own address, so any view can be linked in a report or an email.");
  }

  // ---------- 5 · The shape of a module page ----------
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    title(s, "The shape of a module page");
    await fitImage(s, A("diagrams/wireframe-module.png"), { x: 0.9, y: 1.1, w: 11.53, h: 6.05 });
    s.addNotes("Every module page has the same shape. The numbers for the question sit on top. The map is coloured by that question and nothing else, with one legend. The farms that need attention are ranked at the bottom, worst first, and the list exports to a file. Learn this page once and you know all six modules. Switching module keeps the map where it was, so comparing questions over the same area is one click.");
  }

  // ---------- 6 · Altitude 1, in practice ----------
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 1, in practice");
    const r = await fitImage(s, A("new/alt1-situation.jpg"), { x: 3.05, y: 1.5, w: 8.9, h: 5.05 });
    annotate(s, r, 0.45, 0.03,
      { text: "One sentence: is anything wrong, and where." },
      { x: 0.45, y: 1.5, w: 2.35 });
    annotate(s, r, 0.70, 0.36,
      { text: "Colour marks where the problems are. Quiet areas stay quiet." },
      { x: 0.45, y: 3.25, w: 2.35 });
    annotate(s, r, 0.5, 0.9,
      { text: "Six tiles, one status word each. Each tile opens its module." },
      { x: 4.2, y: 6.8, w: 5.6, h: 0.45, side: "below", align: "center" });
    s.addNotes("This is the morning screen as built. The sentence at the top is written by the system from the module scores; today it reads that four areas need attention. The map carries one combined score, so trouble shows as colour without anyone choosing a layer. The six tiles answer for each module with a plain word. When everything is fine, this screen is quiet. That is deliberate: a calm screen is what makes the red days legible.");
  }

  // ---------- 7 · Altitude 2, in practice ----------
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
      { text: "Each farm takes the colour of its score." },
      { x: 0.45, y: 4.85, w: 2.35 });
    annotate(s, r, 0.5, 0.87,
      { text: "Farms ranked worst first, ready to export." },
      { x: 4.2, y: 6.8, w: 5.6, h: 0.45, side: "below", align: "center" });
    s.addNotes("One click down, into irrigation efficiency. The page belongs to that one question. Its numbers are on top, the map shows each farm coloured by its score, and the bottom holds the ranked list. That list is the Monday morning: worst farms first, with an export button. The other five modules are the same page with different content, so there is nothing new to learn.");
  }

  // ---------- 8 · Altitude 3, in practice ----------
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
    s.addNotes("And the last altitude: one farm. The map zooms to it, the panel gives the system's conclusion in a sentence, then each module's reading for this farm. At the bottom there is always something to do next: export the farm's data, or open the full analysis page. The back button walks the same path in reverse, farm to question to situation. That is the whole design. Three questions, three altitudes, one click between them.");
  }

  const out = `${REPO}/adafsa-redesign-draft.pptx`;
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
})().catch((e) => { console.error(e); process.exit(1); });
