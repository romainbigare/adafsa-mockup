# Project context — what this is and how we got here

A memory document. Not technical: the architecture is in `README.md`, the change list in
`docs/adafsa-redesign-scope.md`, and the review it came from in
`docs/adafsa-mockup-review.md`. This file holds the things that live in people's heads
and get lost — the client situation, the commercial shape, the decisions we made and
why, and what to be careful about next time someone picks this up.

Written July 2026 when the first redesign was complete. **Rewritten September 2026**,
after the review with Mark, which turned a good deal of it around.

---

## 1. What this repo is

A **personal redesign** of the platform MMC is building for ADAFSA, built as a working
mockup rather than a slide deck. It is not the production codebase and it is not
connected to any real data.

Two things live here:

1. **The platform itself** — twenty-two clickable pages, good enough to demo from a
   laptop.
2. **The case for it** — `presentation/`, plus the research behind it.

The mockup exists because the argument was easier to *show* than to describe. That
turned out to be right and is worth repeating: the deck's credibility comes almost
entirely from its screenshots being of a thing that runs. It is also how the review
itself was conducted — Mark walked the mockup, and the redesign came out of that walk.

## 2. The client and the product

- **Client:** ADAFSA — the Abu Dhabi agriculture and food-safety authority. Government.
- **Existing product:** "Map My Crop" (MMC), a farm-monitoring platform.
- **Scope on the ground:** roughly 500 farms in the survey we hold; 17,597 dunums.
  Mark speaks of 25,000 farms at emirate scale, so tables are designed for the larger
  number and demonstrated on the smaller one.
- **What the AI actually produces:** plot boundaries, crop-type classification, land-use
  classification, tree and palm detection and counts, plus the scored analyses.

The analysis is good. Nothing here questions the detections. The argument is about
**presentation** — whether a non-specialist can benefit from what the AI already knows.

## 3. Who actually uses it

Government officials: agriculture and food-safety administrators and inspectors.

The single most important fact about them: **they are not GIS analysts.** They are
comfortable with a computer. They will not compose a map from layers and they will not
read a spectral index.

**What the review changed about this.** We had them asking three questions — is anything
wrong, which farms need attention, what is happening on this farm. That was a designer's
model of a ministry. Mark's correction: a ministry tracks **production capacity**, not
plant health. Health is a local question and belongs at farm level. So the landing page
answers *what have we got and where*, and "which farms need attention" moved down one
level, into each module's ranked table.

Two things underneath everything survive unchanged:

- **"Can I quote this number?"** Figures end up in memos. Trust *is* the product.
- **"Show me on the map."** There is a real briefing moment. Don't lose the map — but
  the review was equally clear that there is a danger in too many of them.

## 4. The commercial picture

**The part most likely to be forgotten, so it is written down plainly.**

The contract is six analysis modules. These are line-items, not features we invented:

| Module | Share of contract fee |
|---|---|
| Palms & Fruit Trees (now Tree Monitoring) | 31.6% |
| Land Use & Structures | 21.0% |
| Crop Monitoring | 14.9% |
| Yield Forecast (now Yield Optimisation) | 12.6% |
| Irrigation Efficiency | 10.5% |
| Water Allocation (now Crop Water Calculator) | 9.4% |

Things that follow:

- **The fee split is commercially sensitive and is no longer anywhere in the code.**
  It used to weight a composite "overall health" score on the landing page. That score
  is gone — Mark's point was that MMC does not produce such a metric and we should not
  invent one — and the weighting went with it. Keep it out of anything the client sees.
- **Tree Monitoring is the hero module.** Nearly a third of the fee. When something has
  to be showcased, showcase that one.
- **The navigation is a commercial artifact.** The client sees the six things they are
  paying for listed down the side of the screen, each opening into its own sub-pages.
  Worth saying out loud in client meetings.
- **GITEX** came up as a demo venue; an **Azerbaijan producer demo** is also expected,
  showing the web platform live and the farmer app as slides, on anonymised Abu Dhabi
  data.
- **Arabic / RTL is a real requirement** and is still not built. The layout uses logical
  properties throughout so it mirrors, but the pass has not been done. With production
  about a month out this is the moment — retrofitting after the layout hardens is the
  expensive path.

## 5. What we found wrong with the platform as delivered

Verified against captured copies of the real production pages in `docs/design/`.

**The menu told you what the product thought it was for.** Farms, Farm Monitoring,
Violations, then seven entries of support and settings. The six analyses being sold
appeared nowhere. Support is one entry now, and violations are gone — ADAFSA agreed we
are not tracking them.

**The overview page never drew a conclusion**, and — as the review then established —
it was also answering the wrong question.

**There was no per-farm view.** The nearest thing worked like a scientific instrument:
choose a farm, choose a view, read satellite mission codes and cloud-cover percentages
across thirty dated captures.

**Nothing was linkable.** No view could be bookmarked, shared or pasted into an email,
and there was no export anywhere.

## 6. The design as it stands after the review

**The overview is an inventory, not a verdict.** Four large figures, a map of count
bubbles that break down as you zoom with no colour and no scoring, and the two
distribution tables Mark had already shown ADAFSA from the pilot — by dunum and by
farm, each opening from a category down to the crop.

**Modules are groups of pages.** Each of the six owns two or three sub-pages, and almost
every module has a change-tracking one. That took the navigation from eight entries to
about twenty-five, and it is what the review asked for in those words.

**Two page archetypes carry twenty of the twenty-two screens.** An inventory page —
figures, a map band, distribution tables, a farm table — and a change page, which has
no map at all: net movement, a trend line, four direction tabs and the farms behind the
movement. Building those two well was most of the work.

**Reporting is emirate, then province, then farm, everywhere.** Provinces matter for a
reason that is political as much as analytical.

**The map stopped being the interface.** The platform is a reading surface with maps in
it. That is a shell change as much as a content one: pages scroll.

Two rules held from the first design and still hold:

- **Every number comes from one place** — now enforced by a single `query()` the pages
  read through, and by tests.
- **Colour means one thing.** The status ramp appears only where something is judged;
  inventory pages colour by classification from a separately validated palette.

## 7. Decisions worth remembering

**"Depths" and the three-question model were superseded.** Not wrong, but built on a
premise the client did not share. If old documents talk about altitudes or depths, that
is this idea before the review corrected it.

**Canopy health is per farm, not per tree.** Mark's reasoning: these holdings are small,
share one water source and are managed as a unit, so the farm *is* the cluster. One
number for palms and one for fruit is enough. Our reading of "per tree cluster" should
be stated to MMC explicitly, since it is an interpretation.

**The over-allocation flag is raised against the month, not the season.** By the time a
season closes there is nothing left to do about it.

**Tier 3 structures may never arrive.** Pump rooms, filtration and desalination sit
together under one cover on these farms. The tier is modelled so it can appear; the page
says plainly that it has not.

**The taxonomy is a filter, not a mode.** It survived the review unchanged and Mark
liked it. Six categories now, in a fixed order, with forest trees added and the dash
gone from open field.

**MMC's farmer-facing leftovers are gone.** Soil moisture, weather, growth phase and the
irrigation scheduler are not our deliverables and we do not collect the data. They
belong in the farmer's application.

**A build step was considered and not taken.** Native ES modules serve statically from
GitHub Pages, so there is no toolchain to keep alive. The cost is that the app needs a
local server rather than a double-clicked file; `python3 -m http.server` covers the
laptop demo.

## 8. The presentation

`presentation/` holds the internal deck. **Its screenshots are of the previous design
and need regenerating.** The deck is built from a script rather than by hand, so the
wording lives in one place.

Tone rules, learned the hard way and still worth following:

- Write as if spoken. Short, full sentences.
- Sound like a calm professor investigating a situation, not a salesperson.
- No "it's not X, it's Y" constructions, no superlatives, no sales language.
- Few words per slide. Visuals and their annotations carry the argument.

## 9. Things to be careful about

- **All the scoring is placeholder.** Boundaries, crop parcels and land-use classes come
  from the survey; every score, count, forecast and history is generated in `src/mock/`.
  Never present a specific number as fact about a real farm.
- **Provinces are assigned by longitude**, not by a real boundary file.
- **The change pages assume history the live platform will not have** for its first two
  quarters.
- **Scale is unproven.** Everything is comfortable at 500 farms; the tables are paged
  for 25,000 but that has not been exercised.
- **The user questions were a synthesis, not a study** — and the review showed how far
  that can drift. A walkthrough with real ADAFSA staff is still the obvious next step,
  and a good thing to offer when the question is raised.

## 10. Where things live

| What | Where |
|---|---|
| The review that drove the redesign | `docs/adafsa-mockup-review.md` |
| The change list and page-by-page spec | `docs/adafsa-redesign-scope.md` |
| How the mockup runs and is structured | `README.md` |
| Evidence: captured production pages | `docs/design/` |
| The deck and the research behind it | `presentation/` |

The best appendix to any conversation about this project is five minutes of clicking
through it.
