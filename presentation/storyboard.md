# Storyboard — ADAFSA Platform · UX / UI Review

**Deck:** `adafsa-redesign-draft.pptx` — 15 slides. Regenerate with `node build_deck.js`.
**Arc:** critique the current platform first, then propose the redesign in two steps and
three levels, close on the journey and a live demo. Wireframes sit in an appendix.

**Voice.** Short, spoken sentences. No sales language. Visuals carry the argument;
annotations are one sentence each, on a soft card joined to the image by a thin leader
and a ring marker. Every annotation is a native PowerPoint shape, so all text is editable.

**Word choice.** The three depths are called **Levels**. The farm dossier is **Level 2b**;
**Level 3** is the full Farm Analysis page.

---

## 1 · Cover
Wafra logo on a white card, title **"ADAFSA Platform - UX / UI Review"**, subtitle
"Preparing the platform for six analysis modules.", July 2026, over the darkened Level 1
screenshot. No page number.

## 2 · Analysis of Current Solution — *Confusing navigation*
The real app with everything but the sidebar faded, a blue box round the menu. Three notes:
the section names don't say what they answer; seven of ten entries are support and
settings; the six analyses being bought appear nowhere.

## 3 · Analysis of Current Solution — *Page morphology - very low density of information*
The overview page with the map fully loaded, blue box round the content. Four notes: six
switches with nothing shown by default; three counters that never say whether things are
fine; totals with no ranking; and a map carrying only boundaries.

## 4 · Step 1 : A better use of the navigation pane
*Split the navigation pane into 3 technical levels.* The nav wireframe, each group joined
to its level (general situation / modules / farm), with the real sidebar beside it under
"What it could look like".

## 5 · Step 2 : A thoughtful layout for each level
*Maximising information per pixel and attention span.* Nav on the left, the three levels
with what each page carries, and a mini wireframe of each page on the right.

## 6 · Level 1 layout : Overview page
*A composite health metric on the map, 6 verdict cards for the 6 modules.* Real screenshot,
four notes — the region's numbers, the heat map, the taxonomy filter, the six cards.

## 7 · Level 2 layout : The module view
*Full sorted data table, high-level metrics and taxonomy as filter.* Six notes — the
module's numbers, one legend and chart, the crop/tree filter, the boundary + heat map,
the export controls, the worst-first table.

## 8 · Level 2 layout : Zooming in
*Single farm metrics included.* The farm dossier with amber pointers. Four notes, ending
on **Navigate to Level 3** (bold).

## 9 · Level 3 layout : The full farm analytics
*All metrics and scans accessible per farm.* The Farm Analysis page on Crop Water
Allocation. No annotations — the page speaks for itself.

## 10 · We follow the user's journey
*Split the app into three distinct technical levels.* The three levels with icons, green
arrows and "one level deeper" between them. Closes the argument.

## 11 · See live demo
Links to `https://romainbigare.github.io/adafsa-mockup/#/overview`.

## 12 · Extra — Diagrams for the New Proposal
Divider.

## 13–15 · Proposal Diagrams — *Level 1 - Overview · Level 2 - Module View · Level 2b - Farm Analysis*
The page wireframes, each with the nav panel beside it and a green box round the nav group
it belongs to. Same annotations as the matching layout slide.

---

## Background material (`notes/`)
The audit of the current app from its captured DOM, the user-question analysis, the design
rationale, and prepared answers to objections. The mockup opens from `index.html`.
