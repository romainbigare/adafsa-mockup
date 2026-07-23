# Storyboard — Farm dashboard redesign

**Purpose.** Show the current app failing the questions people actually bring to it, name
those questions as three depths, then walk the redesign that answers each one.
**Audience.** Internal. Your boss, possibly other leads.
**Length.** A cover and eleven slides. Problem first (1–2), the framework (3), the
solution (4–11). Fifteen minutes.

**Voice.** Short, full sentences, written as you would say them. No sales language.
Visuals do the work; annotations are one sentence each, connected to the exact spot with
a thin leader line and a small ring marker, in a soft floating card.

**Word choice.** The three levels are "depths", not "altitudes".

Assets live in `assets/`. The deck is `adafsa-redesign-draft.pptx`; regenerate with
`node build_deck.js`.

---

## Cover — Farm dashboard redesign

- **Visual:** the Depth 1 screenshot (`new/alt1-situation.jpg`), full-bleed, darkened.
- **Text:** "Farm dashboard redesign" · "Preparing the platform for six analysis modules."
- **Notes:** "The platform is growing from a handful of map layers to six analysis
  modules. Before building them in, I looked at how the current app is used, and what the
  layout should become. This is that walk-through. Everything shown is a working mockup."

# The current app

## Slide 1 — Start with the menu

- **Visual:** `current/current-app-nav-focus.jpg` — the real screenshot with everything
  except the navigation faded. Modern annotations:
  1. → the top sections: "Farms, Farm Monitoring, Violations. The names don't say which
     one answers a question."
  2. → the SUPPORT block: "Seven of the ten entries are support and settings. Half the
     menu is about the tool, not the farms."
  3. → the empty lower nav: "The six analyses the client is buying appear nowhere here."
- **Notes:** "The menu tells you what a product thinks it is for. Read it top to bottom.
  Farms and Farm Monitoring sound alike, and neither says what question it answers. Then
  seven entries of support and settings. And the six analyses we are contracted to
  deliver are not here at all — the layout has no place for them. A small aside: these
  items are not even links, so nothing in this app can be bookmarked or shared."

## Slide 2 — Can it tell us whether anything is wrong?

- **Visual:** `current/current-app-overview.jpg` — the real overview page. Modern
  annotations:
  1. → the Map Layers switches: "Six switches. You have to know what to ask for."
  2. → the three counters: "Three counters count the inventory. They never say whether
     things are fine."
  3. → the distribution tables: "Totals by category. No farm is named, nothing is
     ranked."
- **Notes:** "The director's question on a Tuesday morning is simple: is anything wrong.
  Look for the answer. The counters count farms and hectares. The switches ask what you
  would like displayed. The tables total up categories, so no farm is named and nothing
  is ranked. The answer is not on this screen. The user has to assemble it."

# The user's journey

## Slide 3 — The user's journey

- **Visual:** `diagrams/journeys-depth.png`. One light diagram, three bands with the new
  depth icons, generous padding.
  - Depth 1 — the situation. "Is anything wrong today?" A quick look, first thing in the
    morning.
  - Depth 2 — the question. "Which farms need attention?" A ranked list for the week.
  - Depth 3 — the farm. "What is happening on this farm?" The full picture, before a
    visit or a call.
  - Between bands: "one level deeper".
- **Notes:** "Three people, three habits. A director glances in the morning and wants one
  thing: is anything wrong. An operator wants a list: which farms, worst first. An
  inspector wants everything about one farm. Same tool, three depths. The redesign takes
  each one seriously and gives it its own screen."

# The proposal

## Slide 4 — Proposed navigation

- **Visual:** `diagrams/wireframe-nav.png` — the new navigation, with space between the
  three groups, each mapped to a depth: Overview → Depth 1, the six modules → Depth 2,
  Farm Analysis → Depth 3. Line beneath: "Each entry in the menu answers at one depth."
- **Notes:** "The proposal starts with the menu. Overview is the morning glance. The six
  modules are the questions, listed by name; each becomes a page, not a switch. Farm
  Analysis is the deep dive on one farm. The menu is the idea, and it lists exactly what
  the client is buying. Every level has its own address, so any view can be linked in a
  report or an email."

## Slide 5 — Three pages, three depths

- **Visual:** `diagrams/wireframe-three-pages.png` — three mini wireframes with the new
  icons, one per depth: the Overview, a module page, Farm Analysis.
- **Notes:** "Each depth gets one page, and the three share one shape: the answer at the
  top or the side, the map in the middle, the detail below. Learn one and the other two
  feel familiar. Let us look at each in turn."

## Slide 6 — Depth 1 · The situation at a glance

- **Visual:** `diagrams/wireframe-overview.png` — the Overview page anatomy, annotated
  in the diagram: the stats-and-bands panel, the filter under the legend, the map on one
  fixed lens, and the six verdict cards.
- **Notes:** "The morning page. The region's numbers and the band breakdown sit in one
  panel. The map has a single fixed lens, overall health, so nobody chooses a layer to
  see trouble. Six verdict cards answer for each module with a plain word. And a filter
  waits under the legend: tick a crop or a tree, and the map, the panel and the cards all
  narrow to those farms."

## Slide 7 — Depth 1 · Example

- **Visual:** `new/alt1-situation.jpg`, a few modern annotations:
  1. → the stats panel: "The region's numbers and bands, in one panel."
  2. → the FILTERING bar: "The filter, waiting under the legend."
  3. → the verdict cards: "Six cards, one status word each."
- **Notes:** "The same page, built. When everything is fine it stays quiet — which is what
  makes the red days legible."

## Slide 8 — Depth 2 · The module in detail

- **Visual:** `diagrams/wireframe-module.png` — the module page anatomy, annotated: the
  numbers, one legend, the map on this question only, the ranked list, the export, and the
  taxonomy filter.
- **Notes:** "Every module page has the same shape. The numbers on top, one legend, the
  map coloured by that question, the ranked list at the bottom with an export. The full
  crop and tree taxonomy is here as a filter: tick date palms, and the map, the counts and
  the ranking all narrow to farms growing date palms. Each module filters by the taxonomy
  it is about. The filter drives everything at once, so the numbers and the map can never
  disagree."

## Slide 9 — Depth 2 · Example

- **Visual:** `new/alt2-module-ier.jpg`, modern annotations:
  1. → the KPI strip: "One question. These are its numbers."
  2. → the module list in the nav: "Switch module; the map stays where it was."
  3. → the attention list: "Farms ranked worst first, ready to export."
- **Notes:** "Irrigation efficiency, in the product. The ranked list is a civil servant's
  Monday morning. The other five modules are this same page with different content."

## Slide 10 — Depth 3 · The farm in detail

- **Visual:** `diagrams/wireframe-farm.png` — the farm page anatomy, annotated: the
  highlighted plot on the map, the one-sentence conclusion, the six module readings, and
  the actions.
- **Notes:** "One farm. The map zooms to it and highlights it. The panel gives the
  system's conclusion in a sentence, then each module's reading for this farm. And it ends
  in an action: export the farm, or open the full analysis, which keeps the depth the old
  monitoring page offered — one level down, where it belongs."

## Slide 11 — Depth 3 · Example

- **Visual:** `new/alt3-farm-dossier.jpg`, modern annotations:
  1. → the verdict line: "The conclusion, in one sentence."
  2. → the module rows: "All six modules, for this one farm."
  3. → the buttons: "It ends with something to do."
- **Notes:** "The farm dossier, built. The back button walks the same path in reverse.
  Three questions, three depths, one step between them."

---

## Background material (not slides)

Kept in `notes/`: the audit of the current app from its captured DOM, including the Farm
Monitoring appendix (`current-app-audit.md`); the fuller user-questions analysis
(`user-questions.md`); the one-page rationale (`redesign-rationale.md`); and prepared
answers to objections (`objections.md`). The live mockup opens from `index.html`, no build.
