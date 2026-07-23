# Storyboard — Farm dashboard redesign

**Purpose.** Walk the room through the redesign the way an investigation unfolds: how
people actually use the tool, where today's screens fall short, and what the new layout
does about it.
**Audience.** Internal. Your boss, possibly other leads.
**Length.** A cover and ten slides. Problem statement first (1–4), then the solution
(5–10). Fifteen minutes.

**Voice rules for every word on screen and in notes.** Short, full sentences, written as
you would say them. No sales language, no superlatives, no "it's not X, it's Y"
constructions. Slides carry few words; the visuals and their annotations do the work.
Each annotation is one or two sentences, connected to the exact spot on the image with a
thin leader line.

Assets live in `assets/`. The deck is `adafsa-redesign-draft.pptx`; regenerate with
`node build_deck.js`.

---

## Cover — Farm dashboard redesign

- **Visual:** the Altitude 1 screenshot (`new/alt1-situation.jpg`), full-bleed, darkened.
- **Text:** "Farm dashboard redesign" and one line: "Preparing the platform for six
  analysis modules."
- **Notes:** "The platform is growing from a handful of map layers to six analysis
  modules. Before building them in, I wanted to look carefully at how the current app is
  used, and what the layout should become. This is that walk-through. Everything shown
  is a working mockup."

# Problem statement

## Slide 1 — Three questions, three altitudes

- **Visual:** `diagrams/journeys-altitudes.png`. Unchanged.
- **Notes:** "Watch how the officials actually use a tool like this, and three habits
  appear. A director glances at it in the morning and wants one thing: is anything
  wrong. An operator sits down on Monday and wants a list: which farms, worst first. An
  inspector prepares a visit and wants everything about one farm. Three questions, asked
  at three depths. I've been calling these altitudes. The whole redesign follows from
  taking them seriously."

## Slide 2 — Start with the menu

- **Visual:** `current/current-app-nav-focus.jpg` — the real screenshot of the live app,
  with everything except the navigation column faded. Annotations:
  1. → the top sections (Farms · Farm Monitoring · Violations): "Farms, Farm Monitoring,
     Violations. Which one answers a question? The names do not say."
  2. → the SUPPORT block: "Seven of the ten entries are support and settings. Half the
     menu is about the tool, not the farms."
  3. → the empty space at the bottom of the nav: "And the six analyses the client is
     buying appear nowhere in this menu."
- **Notes:** "This is the real app, and I have faded everything except the menu, because
  the menu tells you what a product thinks it is for. Read it top to bottom. Farms and
  Farm Monitoring sound alike, and neither name says what question it answers.
  Violations sits alone under Analytics. Then seven entries of support and settings.
  A small detail worth knowing: these items are not links, so nothing in this app can be
  bookmarked or shared. And the six analyses we are contracted to deliver are not in
  this menu, because the layout has no place for them."

## Slide 3 — Can it tell us whether anything is wrong?

- **Visual:** `current/current-app-overview.jpg` — the real overview page, annotated:
  1. → the Map Layers switches: "Six switches. The user has to know what to ask for."
  2. → the three counters: "Three counters count the inventory. They never say whether
     things are fine."
  3. → the distribution tables: "Totals by category. No farm names, no order of
     urgency."
  4. → the map: "The map shows what is where. It does not say what matters."
- **Notes:** "Now the overview page itself, as captured. Put yourself in the director's
  chair on a Tuesday morning. The question is simple: is anything wrong. Look for the
  answer. The counters count farms and hectares. The switches ask what you would like
  displayed. The tables total up categories, so no farm is ever named and nothing is
  ranked. The answer to the first question is not on this screen, and the Monday list
  cannot be produced here either. The user is left to assemble both."

## Slide 4 — Can it tell us what is happening on a farm?

- **Visual:** `current/current-monitoring-wireframe.jpg` — a wireframe of the live Farm
  Monitoring page, rebuilt from its captured DOM. Annotations (final wording set from
  the DOM audit):
  1. → the selection controls: the user must pick a farm, a field and an index by hand
     before anything appears.
  2. → the imagery/chart area: the page shows spectral indices over time; reading them
     requires knowing what the index means.
  3. → the page as a whole: there is no conclusion anywhere; the page ends where the
     official's question begins.
- **Notes:** "The closest thing to a farm page today is Farm Monitoring. It works like
  an instrument. Choose a farm and a map view; nothing has a default. Then find a usable
  image by reading satellite mission codes and cloud-cover percentages across thirty
  dated captures. Then a long scroll of readings: weather, soil moisture, growth phase,
  degree days. That is a remote-sensing analyst's workflow. Even where the page does
  conclude something, the water scheduler's proceed-with-irrigation call, the reasoning
  sits in a collapsed panel of raw technical fields. Our users' question is what is
  happening on this farm, and whether someone should go there. The data to answer it is
  all here. The conclusion is not."

# The solution

## Slide 5 — The proposal, seen from the menu

- **Visual:** `diagrams/wireframe-nav.png`. Unchanged: Overview answers altitude 1, the
  six modules answer altitude 2, Farm Analysis answers altitude 3.
- **Notes:** "The proposal starts where the problem started, with the menu. Overview is
  the morning glance. The six modules are the questions, listed by name; each one
  becomes a page rather than a switch. Farm Analysis is the deep dive on one farm. The
  structure of the menu is the structure of the idea, and it also lists exactly what the
  client is buying. Each level is a page with its own address, so any view can be linked
  in a report or an email."

## Slide 6 — Three pages, three altitudes

- **Visual:** `diagrams/wireframe-three-pages.png` — three mini wireframes side by side,
  one per altitude: the Overview (stats panel, map, six verdict tiles), a module page
  (numbers, map, ranked table), Farm Analysis (the single-farm deep dive). Each with its
  altitude icon and one line beneath.
- **Notes:** "Each altitude gets one page, and the three pages share one shape: the
  answer at the top or the side, the map in the middle, the detail below. The Overview
  answers the morning question. A module page answers one question in depth. Farm
  Analysis holds everything about one farm. Learn one page and the other two feel
  familiar."

## Slide 7 — The shape of a module page

- **Visual:** `diagrams/wireframe-module.png` — updated: the FILTERING panel now sits
  under the legend. Six labels on leader lines:
  - "The numbers for this question."
  - "One legend. The same colours everywhere."
  - "The map, coloured by this question only."
  - "Farms ranked worst first."
  - "The list can leave the app as a file."
  - "Tick a crop or a tree type. The map and every number narrow together."
- **Notes:** "Every module page has the same shape. The numbers on top, one legend, the
  map coloured by that question, the ranked list at the bottom with an export. One
  addition since the last review: the full crop and tree taxonomy is back in the
  product, as a filter. Tick date palms, and the map, the counts and the ranking all
  narrow to farms growing date palms. Each module filters by the taxonomy it is about.
  The filter drives everything at once, so the numbers and the map can never disagree."

## Slide 8 — Altitude 1, in practice

- **Visual:** `new/alt1-situation.jpg` — the redesigned overview, annotated:
  1. → the left stats panel: "The region's numbers and bands, in one panel."
  2. → the map: "One fixed lens: overall health. Colour marks where the problems are."
  3. → the FILTERING panel (minimised, under the legend): "A filter waits here. Pick
     crops or trees, and the whole page narrows to those farms."
  4. → the verdict tiles: "Six tiles, one status word each. Each tile opens its module."
- **Notes:** "The morning screen, as built today. The left panel carries the region's
  numbers and the band breakdown. The map has one fixed lens, overall health, so nobody
  chooses a layer to see trouble. The six tiles answer for each module with a plain
  word and a small chart of the bands. And the filter sits quietly under the legend:
  open it, tick a crop, and the map, the panel and the tiles all follow. When
  everything is fine this screen is quiet, and that is deliberate."

## Slide 9 — Altitude 2, in practice

- **Visual:** `new/alt2-module-ier.jpg` — the module page, annotated (unchanged set):
  1. → the KPI strip: "The page holds one question. These are its numbers."
  2. → the module list in the nav: "Changing module changes the question. The map stays
     where it was."
  3. → the coloured map: "Colour follows the score, from the region glow down to each
     farm."
  4. → the attention list: "Farms ranked worst first, ready to export."
- **Notes:** "One click down, into irrigation efficiency. The page belongs to that one
  question. Its numbers are on top, each farm is coloured by its score, and the bottom
  holds the ranked list with an export button. That list is the Monday morning. The
  filter works here too, scoped to what the module is about: Crop Monitoring filters by
  field crops, Palms by trees. The other five modules are this same page with different
  content, so there is nothing new to learn."

## Slide 10 — Altitude 3, in practice

- **Visual:** `new/alt3-farm-dossier.jpg` — the farm dossier, annotated (unchanged set):
  1. → the highlighted boundary: "The farm, highlighted in place."
  2. → the verdict line in the drawer: "The system's conclusion, in one sentence."
  3. → the module rows: "All six modules, for this one farm."
  4. → the buttons: "It ends with something to do: export, or open the full analysis."
- **Notes:** "And the last altitude: one farm. The map zooms to it, the panel gives the
  system's conclusion in a sentence, then each module's reading for this farm. At the
  bottom there is always something to do next: export the farm's data, or open the full
  analysis page, which keeps the depth the monitoring page offered, one level down where
  it belongs. The back button walks the same path in reverse. That is the whole design.
  Three questions, three altitudes, one click between them."

---

## Background material (not slides)

Kept in `notes/` for questions and follow-up: the audit of the current app extracted
from its captured DOM, including the Farm Monitoring appendix (`current-app-audit.md`),
the fuller analysis of user questions (`user-questions.md`), the design rationale on one
page (`redesign-rationale.md`), and prepared answers to likely objections
(`objections.md`). Deeper still: `docs/design/ux-review-proposals.md` and
`docs/design/proposal-combined-plan.md`. The live mockup opens from `index.html` with no
build and no server.
