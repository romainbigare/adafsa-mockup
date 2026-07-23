// Build presentation/adafsa-redesign-draft.pptx from the storyboard + assets.
// Run: node build_deck.js   (from this directory; paths below are absolute)
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const fs = require("fs");

const REPO = "/home/user/adafsa-mockup/presentation";
const A = (p) => `${REPO}/assets/${p}`;

// ---------- palette / typography ----------
const INK = "1F2937";
const MUTED = "6B7280";
const FOREST = "166534";
const FOREST_DARK = "0F2A1A"; // dark slide bg
const PAPER = "FAF9F6"; // matches diagram bg
const CARD = "F1F6F2"; // light green tint for cards
const RED = "D73027";
const AMBER = "D97706";
const GREEN = "1A9850";
const WHITE = "FFFFFF";
const LIGHT = "DCE9DF"; // light green text on dark
const FONT = "Calibri";

const PW = 13.333, PH = 7.5;

// ---------- helpers ----------
const dims = {}; // path -> {w,h}
async function measure(path) {
  if (!dims[path]) {
    const m = await sharp(path).metadata();
    dims[path] = { w: m.width, h: m.height };
  }
  return dims[path];
}
// contain-fit an image into a box, centered; returns placed rect
async function fitImage(slide, path, box, opts = {}) {
  const { w: iw, h: ih } = await measure(path);
  const s = Math.min(box.w / iw, box.h / ih);
  const w = iw * s, h = ih * s;
  const x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
  slide.addImage({ path, x, y, w, h, ...opts });
  return { x, y, w, h };
}
function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.55, y: 0.32, w: PW - 1.1, h: 0.75, fontFace: FONT, fontSize: 30,
    bold: true, color: INK, margin: 0, ...opts,
  });
}
function circleNum(slide, n, x, y, fill = FOREST, d = 0.34) {
  slide.addText(String(n), {
    shape: "ellipse", x, y, w: d, h: d, fill: { color: fill },
    color: WHITE, bold: true, fontSize: 13, fontFace: FONT, align: "center", margin: 0,
  });
}
// numbered callout: circle + bold header + body
function callout(slide, n, x, y, w, head, body, color = FOREST) {
  circleNum(slide, n, x, y + 0.02, color);
  slide.addText(
    [
      { text: head, options: { bold: true, color: INK, fontSize: 13.5, breakLine: true } },
      { text: body, options: { color: MUTED, fontSize: 11.5 } },
    ],
    { x: x + 0.46, y: y - 0.06, w: w - 0.46, h: 1.3, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.04 }
  );
}
function chip(slide, text, x, y, w, fill, color = WHITE, h = 0.32, fontSize = 11) {
  slide.addText(text, {
    shape: "roundRect", rectRadius: 0.16, x, y, w, h, fill: { color: fill },
    color, bold: true, fontSize, fontFace: FONT, align: "center", margin: 0,
  });
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Wafra design team";
  pres.title = "From map viewer to decision tool";

  // ============ S1 — Title ============
  {
    const s = pres.addSlide();
    s.background = { color: FOREST_DARK };
    const im = await measure(A("new/alt1-situation.jpg"));
    // full-bleed cover: image is 16:9, slide is 16:9 → exact fit
    s.addImage({ path: A("new/alt1-situation.jpg"), x: 0, y: 0, w: PW, h: PH });
    s.addShape("rect", { x: 0, y: 0, w: PW, h: PH, fill: { color: "0B1F12", transparency: 16 } });
    s.addText("From map viewer to decision tool", {
      x: 0.9, y: 2.55, w: 12.2, h: 1.1, fontFace: FONT, fontSize: 40, bold: true, color: WHITE, margin: 0,
    });
    s.addText("Redesigning the farm-monitoring dashboard for the six-module programme", {
      x: 0.9, y: 3.7, w: 11.0, h: 0.6, fontFace: FONT, fontSize: 20, color: LIGHT, margin: 0,
    });
    s.addText("ADAFSA farm analytics · internal design review · July 2026", {
      x: 0.9, y: 6.6, w: 9.0, h: 0.4, fontFace: FONT, fontSize: 13, color: "A9C4B0", margin: 0,
    });
    s.addNotes("Framing: we're about to triple the analytical content of the platform — six modules instead of a handful of map layers. This deck shows why the current layout can't carry that, and the redesign that can. Everything shown runs today as a clickable mockup on placeholder data — the background of this slide is a real screenshot of it.");
  }

  // ============ S2 — The one-slide version ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "The one-slide version");
    const cards = [
      { head: "Why now", body: "The programme grows from 3 map layers to 6 analysis modules — crop monitoring, palms & fruit trees, land use & structures, irrigation efficiency, yield forecast, water allocation.\n\nThe current UI is one map with mutually exclusive layer toggles and flat tables. It cannot present six competing analyses — and it answers none of our users' actual questions directly." },
      { head: "What we propose", body: "One dashboard, three altitudes:\n\n• the Situation — one sentence: is the region OK?\n• the Question — per module: ranked “who needs attention”\n• the Farm — a dossier that ends in an action\n\nSame screen grammar at every level; every number from one audited source." },
      { head: "What it takes", body: "The interactive mockup is already built and tested — this deck's screenshots are taken from it.\n\nProductising = five staged milestones, each independently demoable. The data layer was built to swap from mock to the real API without touching the screens." },
    ];
    cards.forEach((c, i) => {
      const x = 0.55 + i * 4.18;
      s.addShape("roundRect", { rectRadius: 0.08, x, y: 1.35, w: 3.95, h: 5.3, fill: { color: CARD }, line: { color: "DDE7DF", width: 1 } });
      circleNum(s, i + 1, x + 0.3, 1.68);
      s.addText(c.head, { x: x + 0.78, y: 1.6, w: 3.0, h: 0.5, fontFace: FONT, fontSize: 17, bold: true, color: FOREST, margin: 0 });
      s.addText(c.body, { x: x + 0.3, y: 2.35, w: 3.38, h: 4.1, fontFace: FONT, fontSize: 12.5, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.06 });
    });
    s.addNotes("The short version: this is not a cosmetic refresh — it's the information architecture the six-module contract requires. And it's de-risked: you're looking at screenshots of a working mockup, not Figma. If you remember one slide, it's this one.");
  }

  // ============ S3 — What the platform does today ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "What the platform does today");
    s.addText(
      [
        { text: "AI analysis over ~500 farms in the Al Ain region", options: { bold: true, color: INK, breakLine: true } },
        { text: "Plot boundaries, crop types, land use, tree & palm detection — ~17k dunums, ~3,300 fields, thousands of classified features.\n", options: { color: MUTED, breakLine: true } },
        { text: "Delivered through a web dashboard", options: { bold: true, color: INK, breakLine: true } },
        { text: "Satellite map + data layers + tables (wireframe right; the production DOM is captured and audited in the repo).\n", options: { color: MUTED, breakLine: true } },
        { text: "Used by government officials", options: { bold: true, color: INK, breakLine: true } },
        { text: "Agriculture & food-safety administrators. They are not GIS analysts.", options: { color: MUTED } },
      ],
      { x: 0.55, y: 1.5, w: 4.9, h: 5.2, fontFace: FONT, fontSize: 14, margin: 0, valign: "top", lineSpacingMultiple: 1.12, paraSpaceAfter: 8 }
    );
    await fitImage(s, A("current/current-app-wireframe.jpg"), { x: 5.7, y: 1.4, w: 7.1, h: 5.4 });
    s.addText("Wireframe of the live “Farms Overview” page (see notes/current-app-audit.md)", {
      x: 5.7, y: 6.9, w: 7.1, h: 0.3, fontFace: FONT, fontSize: 10.5, italic: true, color: MUTED, margin: 0, align: "center",
    });
    s.addNotes("Ground everyone in the same facts before criticising anything. The AI side is strong — detections and classifications are the product. The question of this deck is only: does the screen let a non-technical official benefit from them? Scale for reference: 500 farm boundaries, ~2,400 crop polygons, ~5,300 land-use polygons rendered client-side today.");
  }

  // ============ S4 — Five questions ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Meet the user: five questions, one requirement");
    const qs = [
      ["Is the region OK today?", "The daily glance — answered in seconds, or not at all."],
      ["Which farms need attention, worst first?", "The Monday-morning work list."],
      ["What exactly is wrong at this farm — and what do we do?", "The case file before an inspection visit."],
      ["Show me X on the map", "The briefing moment — a superior walks in, sometimes with an iPad."],
      ["Can I quote this number?", "Every figure may end up in a memo or a meeting."],
    ];
    qs.forEach((q, i) => {
      const y = 1.5 + i * 1.02;
      circleNum(s, i + 1, 0.6, y);
      s.addText(
        [
          { text: q[0], options: { bold: true, color: INK, fontSize: 16, breakLine: true } },
          { text: q[1], options: { color: MUTED, fontSize: 12 } },
        ],
        { x: 1.15, y: y - 0.08, w: 7.3, h: 0.95, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.05 }
      );
    });
    s.addShape("roundRect", { rectRadius: 0.08, x: 8.85, y: 1.5, w: 3.9, h: 5.0, fill: { color: FOREST } });
    s.addText(
      [
        { text: "The requirement under all five:\n", options: { color: LIGHT, fontSize: 14, breakLine: true } },
        { text: "TRUST\n", options: { color: WHITE, bold: true, fontSize: 34, breakLine: true } },
        { text: "One contradicted number and the tool is dead for this audience.", options: { color: LIGHT, fontSize: 14 } },
      ],
      { x: 9.15, y: 2.3, w: 3.3, h: 3.4, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.15 }
    );
    s.addNotes("Establish the evaluation criteria BEFORE showing the gap — so what follows reads as measurement, not taste. Note what's NOT on the list: 'let me compose a custom map from layers'. That's a GIS analyst's question. Our users' questions are answers-first: they want the tool to have already done the looking. Full analysis in notes/user-questions.md.");
  }

  // ============ S5 — The current app ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "The current app: one map, six switches, no answers");
    await fitImage(s, A("current/current-app-wireframe.jpg"), { x: 0.55, y: 1.45, w: 7.55, h: 5.3 });
    const co = [
      ["Layer toggles", "Six independent switches in a fixed 260px column over one shared map (fixed 450px tall). The user must know what to ask for."],
      ["Three counters", "494 farms · 3,331 fields · 17,236 dunums. Inventory, not status — they never say “fine” or “not fine”."],
      ["Flat aggregate tables", "Land-use area, tree counts. No farm identities, no ranking — and no export of any kind exists in the app."],
      ["No routes at all", "Sidebar items aren't even links. Nothing can be bookmarked or shared. No verdict, no legend, no per-farm view."],
    ];
    co.forEach((c, i) => callout(s, i + 1, 8.4, 1.55 + i * 1.32, 4.45, c[0], c[1]));
    s.addText("Every claim verified against the captured production DOM — notes/current-app-audit.md", {
      x: 0.55, y: 6.95, w: 8.0, h: 0.3, fontFace: FONT, fontSize: 10.5, italic: true, color: MUTED, margin: 0,
    });
    s.addNotes("A factual tour, not a caricature. This is a competent MAP VIEWER: every element answers 'what is where?'. Nothing answers 'is it OK?', 'who's worst?', 'what next?'. Quotable audit details: the two tables label the same percentage column two different ways ('Farm Area (%)' vs 'Percentage of Area (%)'); the page ships no lang/dir attribute at all, so Arabic today means the browser's translate widget. Say plainly: nothing here is wrong — it's built for a different user than the one we have.");
  }

  // ============ S6 — Questions matrix (diagram) ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    await fitImage(s, A("diagrams/questions-vs-apps.png"), { x: 0.25, y: 0.15, w: PW - 0.5, h: PH - 0.3 });
    s.addNotes("Walk one row end-to-end: 'Which farms need attention?' Today — toggle a layer, stare at 500 polygons; no ranking exists; the official cannot produce the Monday work list at all. In the redesign it's one click. On 'can I quote this number': today's counters are static so they happen to be consistent — but the moment computed scores arrive, per-widget computation guarantees contradictions unless we architect against them (slide on that shortly). The production page already labels the same % column two different ways.");
  }

  // ============ S7 — Breaking point (diagram) ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    await fitImage(s, A("diagrams/module-scaling.png"), { x: 0.25, y: 0.1, w: PW - 0.5, h: PH - 0.55 });
    s.addText("The projection is the app's own extension pattern (one toggle + one paired table per data type), applied six more times.", {
      x: 0.55, y: 7.05, w: 12.2, h: 0.35, fontFace: FONT, fontSize: 12, italic: true, color: MUTED, margin: 0, align: "center",
    });
    s.addNotes("This is the actual trigger for the redesign — the WHY NOW. The projection isn't a strawman: 12–18 toggles in the same fixed 260px column, 8 search-and-paginate tables, up to ~21 KPI cards, all on one unpaginated scrolling page, because the app has no tabs, routes or per-module screens to absorb growth. Six modules are scored analyses with bands, KPIs and rankings — a toggle can show their colour wash, but not their content. The moment the contract said 'six modules', the single-workspace model was over.");
  }

  // ============ S8 — Altitude model (diagram) ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    await fitImage(s, A("diagrams/altitude-model.png"), { x: 0.25, y: 0.15, w: PW - 0.5, h: PH - 0.3 });
    s.addNotes("The conceptual heart of the deck — spend time here. The five questions live at different depths: the glance needs a sentence; the work list needs a ranked table; the case file needs everything about one farm. The old app forced everyone to ground level — raw layers — regardless of their question. The redesign gives each question its own altitude, and the click path IS the org chart: director stays at 1, analyst lives at 2, inspector lands at 3. Complexity is buried a click down, not deleted.");
  }

  // ============ S9 — Screen grammar (diagram) ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    await fitImage(s, A("diagrams/screen-grammar.png"), { x: 0.25, y: 0.15, w: PW - 0.5, h: PH - 0.3 });
    s.addNotes("What makes three screens cheaper to learn than one screen with twelve toggles: the furniture never moves. Verdict on top, the world in the centre, the answer docked below, navigation on the left — at every altitude. It's also deliberately symmetric, which matters for Arabic mirroring later. And it's honest architecture: each zone is one component owned by one module in the code.");
  }

  // ============ S10 — Altitude 1 walkthrough ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 1 — the Situation", { color: FOREST });
    await fitImage(s, A("new/alt1-situation.jpg"), { x: 0.55, y: 1.4, w: 8.35, h: 5.6 });
    const co = [
      ["The verdict sentence", "Plain language, module names in full, never truncated. The five-second test, passed at the door."],
      ["Problems glow through aggregation", "Map coloured by overall criticality (weighted roll-up of all six modules); clusters take the worst band present, with red “N need attention” badges."],
      ["Six calm status tiles", "Status word first: On track · Watch · Needs attention. OK tiles stay quiet — only trouble gets colour. Each tile is a door to its module."],
    ];
    co.forEach((c, i) => callout(s, i + 1, 9.2, 1.55 + i * 1.75, 3.7, c[0], c[1]));
    s.addNotes("Compare with the old landing: three counters and a toggle list. Here the first paint answers 'is the region OK?' in one sentence. Calm is a feature: when nothing is wrong the screen is quiet, so red actually means something. The composite score is fee-weighted across modules under the hood; on screen it's just 'overall criticality' — complexity in the code, not the UI. Hovering any farm or cluster shows the per-module breakdown.");
  }

  // ============ S11 — Altitude 2 walkthrough ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 2 — the Question", { color: FOREST });
    await fitImage(s, A("new/alt2-module-ier.jpg"), { x: 0.55, y: 1.3, w: 7.4, h: 4.16 });
    const r1 = await fitImage(s, A("new/alt2-module-water.jpg"), { x: 0.55, y: 5.55, w: 3.6, h: 1.5 });
    const r2 = await fitImage(s, A("new/alt2-layers-mode.jpg"), { x: 4.35, y: 5.55, w: 3.6, h: 1.5 });
    s.addText("same viewport, new question (water)", {
      x: 0.55, y: 7.1, w: 3.6, h: 0.28, fontFace: FONT, fontSize: 9.5, italic: true, color: MUTED, margin: 0, align: "center",
    });
    s.addText("the layer browser — an explicit mode", {
      x: 4.35, y: 7.1, w: 3.6, h: 0.28, fontFace: FONT, fontSize: 9.5, italic: true, color: MUTED, margin: 0, align: "center",
    });
    const co = [
      ["One module owns the map", "One subject, one legend, one colouring. No mixed states, ever."],
      ["KPI strip", "The module's headline numbers — straight from the shared registry."],
      ["Flip the question in place", "Switching modules keeps the map viewport; KPIs, legend and list swap. “Same farms, different question” is one click in the nav."],
      ["The attention list", "Farms ranked worst-first, exportable to CSV. A civil servant's Monday morning in one click."],
    ];
    co.forEach((c, i) => callout(s, i + 1, 8.35, 1.4 + i * 1.42, 4.5, c[0], c[1]));
    s.addNotes("This is where the six modules actually live — each gets the full template: KPIs, legend, ranked list, and a deep-linkable URL (officials can paste #/m/water into an email). Adding module seven is a registry entry, not a design project. The layers panel: we didn't delete the GIS power — we demoted it from THE interface to A tool, and made its mode explicit ('Map Layers active — module data paused').");
  }

  // ============ S12 — Altitude 3 walkthrough ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Altitude 3 — the Farm", { color: FOREST });
    await fitImage(s, A("new/alt3-farm-dossier.jpg"), { x: 0.55, y: 1.35, w: 8.0, h: 4.5 });
    const fa = await fitImage(s, A("new/farm-analysis.jpg"), { x: 0.55, y: 5.95, w: 3.4, h: 1.35 });
    s.addText("← “Open Farm Analysis”: the existing deep-dive page (heatmaps, weather, soil, scheduling)", {
      x: 4.1, y: 6.35, w: 4.2, h: 0.6, fontFace: FONT, fontSize: 9.5, italic: true, color: MUTED, margin: 0,
    });
    const co = [
      ["The AI's verdict, one sentence", "Worst finding first, plain band names, real values in the module's own scale."],
      ["Per-module status", "All six modules for this farm — each row links back up to its module page."],
      ["Every journey ends in an action", "Export the farm's data, or open Farm Analysis. The last click is never a dead end."],
    ];
    co.forEach((c, i) => callout(s, i + 1, 8.9, 1.5 + i * 1.7, 4.0, c[0], c[1]));
    s.addNotes("Question 3 was 'what exactly is wrong, and what do we do?' — this is that case file. The old app's dead end was a table; here the last click is always an action. Browser Back walks the exact path back up: Farm → Question → Situation. That's the full altitude descent: a sentence, a work list, a case file — each one click from the last.");
  }

  // ============ S13 — Two contracts (diagram) ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    await fitImage(s, A("diagrams/contracts.png"), { x: 0.25, y: 0.2, w: PW - 0.5, h: PH - 0.4 });
    s.addNotes("Trust as architecture, not intention. For this audience trust IS the product: an official who quotes 223 in a meeting and gets corrected to 105 by their own analyst never opens the dashboard again. We found exactly that bug in our own prototype — the fix is architectural: one source of numbers, enforced by tests (node test/all.js — registry, verdict, scales, severity). This bug class isn't hypothetical: the PRODUCTION page already labels the same percentage column two different ways. Verbatim line for the room: numbers on two screens can no longer disagree, by construction.");
  }

  // ============ S14 — Modules become navigation (diagram) ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    await fitImage(s, A("diagrams/ia-before-after.png"), { x: 0.25, y: 0.1, w: PW - 0.5, h: PH - 0.75 });
    s.addText("The sidebar now sells what the client bought: six modules, by name. One template ×6 · deep links at every level · module #7 = a registry entry.", {
      x: 0.7, y: 6.95, w: 11.9, h: 0.4, fontFace: FONT, fontSize: 12.5, italic: true, color: INK, margin: 0, align: "center",
    });
    s.addNotes("Close the loop on the breaking-point slide: the mutual-exclusivity problem didn't get fixed — it got DISSOLVED: it became navigation. Commercial point worth making: the old UI hides the six contract line-items behind identical checkboxes; the new nav literally lists them by name down the left edge. Click the thing you paid for, see the thing you paid for.");
  }

  // ============ S15 — How we got here ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "How we got here — we didn't guess");
    const cols = [
      { img: "process/a-1-overview.jpg", head: "A — Module hub", body: "Best first-glance scorecard.\nKept: the six-tile Home, the module-page template." },
      { img: "process/a2-2-colourby-ier.jpg", head: "A2 — Map-led", body: "The “our region, live from space” landing.\nKept: map-first Home, colour-by." },
      { img: "process/b-2-water.jpg", head: "B — One dial", body: "Switch analyses in place, viewport preserved.\nKept: the dial. Retired: its no-summary landing." },
    ];
    for (let i = 0; i < cols.length; i++) {
      const x = 0.55 + i * 4.18;
      await fitImage(s, A(cols[i].img), { x, y: 1.45, w: 3.95, h: 2.5 });
      s.addText(cols[i].head, { x, y: 4.1, w: 3.95, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: FOREST, margin: 0 });
      s.addText(cols[i].body, { x, y: 4.5, w: 3.95, h: 1.3, fontFace: FONT, fontSize: 12, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.08 });
    }
    s.addText("Three full layouts built, driven hands-on in a real browser (desktop + phone width), reviewed, then combined: A's clarity + A2's landing + B's dial.", {
      x: 0.55, y: 6.1, w: 12.2, h: 0.6, fontFace: FONT, fontSize: 13, italic: true, color: INK, margin: 0,
    });
    s.addNotes("Pre-empts 'is this just taste?'. The full review with screenshots and a must-fix list is in the repo (docs/design/ux-review-proposals.md). Each proposal was stress-tested against the five questions — B famously could never answer 'is the region OK?', which is why its landing died and its best interaction (the dial) survived inside the module pages. The combined design isn't a compromise; it's a harvest.");
  }

  // ============ S16 — What we're not throwing away ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "What we're not throwing away");
    const items = [
      ["Same engine, same data", "Same map engine, same satellite basemaps, same data pipeline. The AI outputs don't change at all."],
      ["The power tools survive", "The GIS layer browser (as an explicit mode), sortable tables (now ranked + exportable), the Farm Analysis deep-dive page — untouched."],
      ["An API seam, ready", "Screens read one data interface. Swapping placeholder for production data touches two folders — and zero screens."],
      ["Buildless & portable", "Static front-end: no build step, no server dependency. Deploys anywhere, demos from a laptop, runs from a file."],
    ];
    items.forEach((it, i) => {
      const x = 0.55 + (i % 2) * 6.25, y = 1.6 + Math.floor(i / 2) * 2.6;
      s.addShape("roundRect", { rectRadius: 0.08, x, y, w: 5.95, h: 2.25, fill: { color: CARD }, line: { color: "DDE7DF", width: 1 } });
      s.addText("✓", {
        shape: "ellipse", x: x + 0.3, y: y + 0.3, w: 0.4, h: 0.4, fill: { color: GREEN },
        color: WHITE, bold: true, fontSize: 15, fontFace: FONT, align: "center", margin: 0,
      });
      s.addText(
        [
          { text: it[0] + "\n", options: { bold: true, color: INK, fontSize: 15, breakLine: true } },
          { text: it[1], options: { color: MUTED, fontSize: 12.5 } },
        ],
        { x: x + 0.9, y: y + 0.25, w: 4.8, h: 1.8, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.08 }
      );
    });
    s.addNotes("Defuses the 'risky rewrite' objection. This is a re-architecture of navigation and presentation — not of data or analysis. Retraining cost is low because of the single screen grammar. And the mockup runs from a double-clicked HTML file — remember that for client meetings with hostile Wi-Fi.");
  }

  // ============ S17 — Quality debt retired ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Quality debt we retired on the way");
    const fixes = [
      ["Dead map controls", "zoom/basemap rail didn't respond to clicks — fixed"],
      ["A blue pin floating in the Gulf", "bad farm centroid — eliminated with validation"],
      ["Duplicate farm IDs in tables", "mock-data quirk — deduplicated"],
      ["“223 critical” vs “Critical: 105”", "the number contract, structurally enforced"],
      ["Truncated headlines", "“223 farms criti…” — layout rules that never truncate the verdict"],
      ["Jargon everywhere", "“IER” → “Irrigation efficiency score”, “dun” → “dunums”; all copy in one strings file — which is also the Arabic seam"],
      ["No mobile layout", "collapsible rail nav, scrollable KPI strip — officials will open this on an iPad"],
    ];
    fixes.forEach((f, i) => {
      const y = 1.5 + i * 0.78;
      s.addText("✓", {
        shape: "ellipse", x: 0.6, y: y + 0.01, w: 0.3, h: 0.3, fill: { color: GREEN },
        color: WHITE, bold: true, fontSize: 11, fontFace: FONT, align: "center", margin: 0,
      });
      s.addText(
        [
          { text: f[0] + " — ", options: { bold: true, color: INK } },
          { text: f[1], options: { color: MUTED } },
        ],
        { x: 1.05, y: y - 0.06, w: 8.2, h: 0.72, fontFace: FONT, fontSize: 12.5, margin: 0, valign: "top", lineSpacingMultiple: 1.02 }
      );
    });
    await fitImage(s, A("new/mobile-situation.jpg"), { x: 9.7, y: 1.5, w: 3.1, h: 5.4 });
    s.addText("the Situation screen at phone width", { x: 9.7, y: 6.98, w: 3.1, h: 0.3, fontFace: FONT, fontSize: 10, italic: true, color: MUTED, align: "center", margin: 0 });
    s.addNotes("Each of these is small; any of them could have torched a demo — a sharp official WILL ask what the pin in the sea is. The strings file matters strategically: English-only today, but every label passes through one place and new CSS is direction-neutral, so Arabic/RTL is a fill-in, not a rebuild (the production page ships no lang/dir attribute at all).");
  }

  // ============ S18 — Plan ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "The plan: five milestones, each one demoable");
    const rows = [
      [
        { text: "#", options: { bold: true, color: WHITE, fill: { color: FOREST } } },
        { text: "Scope", options: { bold: true, color: WHITE, fill: { color: FOREST } } },
        { text: "Outcome you can click", options: { bold: true, color: WHITE, fill: { color: FOREST } } },
      ],
      ["M1", "Debt payoff: dead controls, markers, value scales, rollup honesty, test runner", "The mockup, credible"],
      ["M2", "Situation screen: verdict, status tiles, home legend, worst-band clusters", "Altitude 1 live"],
      ["M3", "The dial + layers-mode pause state + activity bell", "Altitude 2 complete"],
      ["M4", "Farm dossier: route, drawer, verdict model, actions", "Altitude 3 live"],
      ["M5", "Plain-language pass, mobile minimum, RTL-ready CSS", "Client-demo ready"],
    ];
    s.addTable(rows, {
      x: 0.55, y: 1.5, w: 12.23, colW: [0.9, 8.13, 3.2],
      fontFace: FONT, fontSize: 13, color: INK, valign: "middle",
      border: { type: "solid", color: "E2E0DA", pt: 1 },
      rowH: 0.62, margin: 0.08,
    });
    s.addShape("roundRect", { rectRadius: 0.08, x: 0.55, y: 5.6, w: 12.23, h: 1.25, fill: { color: CARD }, line: { color: "DDE7DF", width: 1 } });
    s.addText(
      [
        { text: "Status: the mockup in this deck already implements M1–M5 on placeholder data, ", options: { bold: true, color: INK } },
        { text: "with automated tests pinning the contracts (node test/all.js). Next phase: wire real data behind the existing seam + the scripted client demo.", options: { color: MUTED } },
      ],
      { x: 0.85, y: 5.78, w: 11.6, h: 0.9, fontFace: FONT, fontSize: 13, margin: 0, valign: "middle", lineSpacingMultiple: 1.1 }
    );
    s.addNotes("Give rough effort verbally — the plan sized this at about seven working days of front-end, which is DONE (on mock data). The acceptance test is worth quoting: final QA is a scripted walkthrough — load, verdict reads correctly, click the amber tile, numbers agree everywhere, flip the dial, open a dossier, export. If that story tells itself without the presenter touching anything else, the architecture works — for a GITEX booth and for a Tuesday-morning official alike.");
  }

  // ============ S19 — The ask ============
  {
    const s = pres.addSlide();
    s.background = { color: FOREST_DARK };
    s.addText("The ask", { x: 0.9, y: 0.7, w: 8, h: 0.8, fontFace: FONT, fontSize: 34, bold: true, color: WHITE, margin: 0 });
    const asks = [
      ["Endorse the three-altitude architecture", "as the target for the six-module release."],
      ["Green-light real-data wiring", "behind the existing mock seam — needs API / data-team time."],
      ["Schedule the client walkthrough", "using the scripted demo arc; Arabic/RTL spike before the layout hardens."],
    ];
    asks.forEach((a, i) => {
      const y = 1.9 + i * 1.25;
      circleNum(s, i + 1, 0.95, y, "1A9850", 0.42);
      s.addText(
        [
          { text: a[0] + " ", options: { bold: true, color: WHITE, fontSize: 19 } },
          { text: a[1], options: { color: LIGHT, fontSize: 16 } },
        ],
        { x: 1.6, y: y - 0.08, w: 10.8, h: 1.0, fontFace: FONT, margin: 0, valign: "top", lineSpacingMultiple: 1.08 }
      );
    });
    s.addText("“The AI already knows which farms need attention.\nThe redesign is the difference between the client having to dig for that — and being told.”", {
      x: 0.95, y: 5.7, w: 11.4, h: 1.2, fontFace: FONT, fontSize: 17, italic: true, color: "CFE3D5", margin: 0, lineSpacingMultiple: 1.15,
    });
    s.addNotes("Decisions actually needed today: the architecture endorsement and the data-team allocation. Offer the live mockup for a hands-on session after the meeting — it runs from a laptop, no install. Anticipated objections and prepared answers: notes/objections.md.");
  }

  // ============ Appendix ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    title(s, "Appendix — have ready, don't present");
    const items = [
      ["A1  Current-app inventory", "notes/current-app-audit.md — exact toggles, tables, labels, verified absences"],
      ["A2  The five questions, full analysis", "notes/user-questions.md"],
      ["A3  UX-review findings & must-fix list", "docs/design/ux-review-proposals.md"],
      ["A4  Test coverage of the contracts", "test/*.test.js — registry, verdict, scales, severity, dossier, strings"],
      ["A5  Mobile shots", "assets/new/mobile-situation.jpg · mobile-module.jpg"],
      ["A6  Farm Analysis deep-dive page", "assets/new/farm-analysis.jpg"],
      ["A7  Live demo", "open index.html — no build, no server, no install"],
    ];
    items.forEach((it, i) => {
      const y = 1.55 + i * 0.75;
      s.addText(
        [
          { text: it[0] + "  —  ", options: { bold: true, color: FOREST } },
          { text: it[1], options: { color: MUTED } },
        ],
        { x: 0.7, y, w: 11.9, h: 0.6, fontFace: FONT, fontSize: 14, margin: 0 }
      );
    });
    s.addNotes("Pointers only — each of these exists in the presentation/ folder or the repo and can be pulled up live if a question goes deep.");
  }

  const out = `${REPO}/adafsa-redesign-draft.pptx`;
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
})().catch((e) => { console.error(e); process.exit(1); });
