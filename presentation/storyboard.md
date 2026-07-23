# Storyboard — Farm dashboard redesign

**Purpose.** Walk the room through the redesign the way an investigation unfolds: how
people actually use the tool, where today's screen falls short, and what the new layout
does about it.
**Audience.** Internal. Your boss, possibly other leads.
**Length.** A cover and eight slides. Ten to fifteen minutes.

**Voice rules for every word on screen and in notes.** Short, full sentences, written
as you would say them. No sales language, no superlatives, no "it's not X, it's Y"
constructions. Slides carry few words; the visuals and their annotations do the work.
Each annotation is one or two sentences, connected to the exact spot on the image with
a thin leader line.

Assets referenced below live in `assets/`. The draft deck built from this storyboard is
`adafsa-redesign-draft.pptx` (regenerate with `node build_deck.js`).

---

## Cover — Farm dashboard redesign

- **Visual:** the Altitude 1 screenshot (`new/alt1-situation.jpg`), full-bleed, darkened.
- **Text:** "Farm dashboard redesign" and one line: "Preparing the platform for six
  analysis modules."
- **Notes:** "The platform is growing from a handful of map layers to six analysis
  modules. Before building them in, I wanted to look carefully at how the current app
  is used, and what the layout should become. This is that walk-through. Everything
  shown is a working mockup."

## Slide 1 — Three questions, three altitudes

- **Visual:** `diagrams/journeys-altitudes.png`. One light diagram, three bands, an icon
  each, generous padding. Nothing else on the slide.
- **Content of the diagram:**
  - Altitude 1 — the situation. "Is anything wrong today?" A quick look, first thing in
    the morning.
  - Altitude 2 — the question. "Which farms need attention?" A ranked list to work
    through during the week.
  - Altitude 3 — the farm. "What is happening on this farm?" The full picture, before a
    visit or a call.
  - Between bands: "one click".
- **Notes:** "Watch how the officials actually use a tool like this, and three habits
  appear. A director glances at it in the morning and wants one thing: is anything
  wrong. An operator sits down on Monday and wants a list: which farms, worst first.
  An inspector prepares a visit and wants everything about one farm. Three questions,
  asked at three depths. I've been calling these altitudes. The whole redesign follows
  from taking them seriously."

## Slide 2 — Can it tell us whether anything is wrong?

- **Visual:** the current app (`current/current-app-wireframe.jpg`), large and centred,
  with three annotations connected by leader lines:
  1. → the three counters: "Three counters count the inventory. They never say whether
     things are fine."
  2. → the Map Layers switches: "Six switches. The user has to know what to ask for."
  3. → the map: "The map shows what is where. It does not say what matters."
- **Notes:** "Here is today's screen. Put yourself in the director's chair on a Tuesday
  morning. The question is simple: is anything wrong. Now look for the answer. The
  counters count farms and hectares. The switches ask what you would like displayed.
  The map shows whatever you switch on. The answer to the first question is not on this
  screen. The user is left to assemble it."

## Slide 3 — Can it tell us which farms, and what to do?

- **Same treatment as slide 2**, second set of observations:
  1. → the two distribution tables: "Totals by category. No farm names, no order of
     urgency."
  2. → the "Single Farm" switches: "Two switches mention a single farm. A page about
     that farm does not exist."
  3. → the sidebar: "These menu items are not links. Nothing here can be bookmarked or
     shared."
- **Notes:** "Second question: which farms need attention. The tables aggregate by
  category, so no farm is ever named and nothing is ranked. The Monday list cannot be
  produced here. Third question: what is happening on this farm. Two switches hint at a
  single farm, but there is no farm page anywhere in the app. And a small detail with
  large consequences: the menu items are not links, so no view can be bookmarked,
  shared, or sent in an email. With six modules arriving, each needing its own numbers
  and its own ranking, this layout has nowhere to put them."

## Slide 4 — The proposal, seen from the menu

- **Visual:** `diagrams/wireframe-nav.png`. A wireframe of the new app with the left
  navigation drawn in detail, connected to the three altitude icons: Overview answers
  altitude 1, the six modules answer altitude 2, Farm Analysis answers altitude 3.
  One line under the diagram: "Each entry in the menu answers at one altitude."
- **Notes:** "The proposal starts with the menu. Overview is the morning glance. The
  six modules are the questions, listed by name; each one becomes a page rather than a
  switch. Farm Analysis is the deep dive on one farm. The structure of the menu is the
  structure of the idea, and it also happens to list exactly what the client is buying.
  Each level is a page with its own address, so any view can be linked in a report or
  an email."

## Slide 5 — The shape of a module page

- **Visual:** `diagrams/wireframe-module.png`. A wireframe of one module page, five
  labels on leader lines:
  - "The numbers for this question."
  - "One legend. The same colours everywhere."
  - "The map, coloured by this question only."
  - "Farms ranked worst first."
  - "The list can leave the app as a file."
- **Notes:** "Every module page has the same shape. The numbers for the question sit on
  top. The map is coloured by that question and nothing else, with one legend. The
  farms that need attention are ranked at the bottom, worst first, and the list exports
  to a file. Learn this page once and you know all six modules. Switching module keeps
  the map where it was, so comparing questions over the same area is one click."

## Slide 6 — Altitude 1, in practice

- **Visual:** `new/alt1-situation.jpg`, annotated:
  1. → the verdict bar: "One sentence: is anything wrong, and where."
  2. → the map: "Colour marks where the problems are. Quiet areas stay quiet."
  3. → the tile strip: "Six tiles, one status word each. Each tile opens its module."
- **Notes:** "This is the morning screen as built. The sentence at the top is written
  by the system from the module scores; today it reads that four areas need attention.
  The map carries one combined score, so trouble shows as colour without anyone
  choosing a layer. The six tiles answer for each module with a plain word. When
  everything is fine, this screen is quiet. That is deliberate: a calm screen is what
  makes the red days legible."

## Slide 7 — Altitude 2, in practice

- **Visual:** `new/alt2-module-ier.jpg`, annotated:
  1. → the KPI strip: "The page holds one question. These are its numbers."
  2. → the module list in the nav: "Changing module changes the question. The map
     stays where it was."
  3. → the coloured plots: "Each farm takes the colour of its score."
  4. → the attention list: "Farms ranked worst first, ready to export."
- **Notes:** "One click down, into irrigation efficiency. The page belongs to that one
  question. Its numbers are on top, the map shows each farm coloured by its score, and
  the bottom holds the ranked list. That list is the Monday morning: worst farms first,
  with an export button. The other five modules are the same page with different
  content, so there is nothing new to learn."

## Slide 8 — Altitude 3, in practice

- **Visual:** `new/alt3-farm-dossier.jpg`, annotated:
  1. → the highlighted boundary: "The farm, highlighted in place."
  2. → the verdict line in the drawer: "The system's conclusion, in one sentence."
  3. → the module rows: "All six modules, for this one farm."
  4. → the buttons: "It ends with something to do: export, or open the full analysis."
- **Notes:** "And the last altitude: one farm. The map zooms to it, the panel gives the
  system's conclusion in a sentence, then each module's reading for this farm. At the
  bottom there is always something to do next: export the farm's data, or open the full
  analysis page. The back button walks the same path in reverse, farm to question to
  situation. That is the whole design. Three questions, three altitudes, one click
  between them."

---

## Background material (not slides)

Kept in `notes/` for questions and follow-up: the audit of the current app extracted
from its captured DOM (`current-app-audit.md`), the fuller analysis of user questions
(`user-questions.md`), the design rationale on one page (`redesign-rationale.md`), and
prepared answers to likely objections (`objections.md`). Deeper still:
`docs/design/ux-review-proposals.md` and `docs/design/proposal-combined-plan.md`.
The live mockup opens from `index.html` with no build and no server.
