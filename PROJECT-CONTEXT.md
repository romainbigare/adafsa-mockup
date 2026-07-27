# Project context — what this is and how we got here

A memory document. Not technical: the architecture is described in `README.md` and the
design reasoning in `docs/design/`. This file holds the things that live in people's
heads and get lost — the client situation, the commercial shape, the decisions we made
and why, and what to be careful about next time someone picks this up.

Written July 2026, at the point where the redesign mockup is complete on placeholder
data and the internal presentation has been drafted.

---

## 1. What this repo is

A **personal redesign** of an existing production webapp, built as a working mockup
rather than a slide deck. It is not the production codebase and it is not connected to
any real data — every number on screen is generated.

Two things live here:

1. **The redesign itself** — a clickable mockup of the proposed dashboard, good enough
   to demo from a laptop.
2. **The case for it** — `presentation/`, an internal deck arguing why the redesign is
   necessary, plus the research behind it.

The mockup exists because the argument was easier to *show* than to describe. That
turned out to be the right call and is worth repeating: the deck's credibility comes
almost entirely from the fact that its screenshots are of a thing that runs.

## 2. The client and the product

- **Client:** ADAFSA — the Abu Dhabi agriculture and food-safety authority. Government.
- **Existing product:** "Map My Crop", a farm-monitoring platform.
- **Scope on the ground:** roughly 500 farms in the Al Ain region. The live app reports
  494 farms, 3,331 fields, 17,236 dunums. Our mock data uses 500 farms / 17,597 dunums.
- **What the AI actually produces:** plot boundaries, crop-type classification, land-use
  classification, tree and palm detection and counts, plus the scored analyses below.

The analysis is genuinely good. Nothing in this project questions the quality of the
detections. The entire argument is about **presentation** — whether a non-specialist can
benefit from what the AI already knows.

## 3. Who actually uses it

Government officials. Agriculture and food-safety administrators and inspectors.

The single most important fact about them: **they are not GIS analysts.** They are
comfortable with a computer. They are not going to compose a map from layers, and they
will not read a spectral index. Every design argument in this project traces back to
that one sentence.

They ask three questions, at three different depths:

1. **"Is anything wrong today?"** — a glance, first thing in the morning. Seconds.
2. **"Which farms need attention?"** — a ranked list to work through during the week.
3. **"What is happening on this farm?"** — the full picture, before a visit or a call.

Two more that sit underneath everything:

- **"Can I quote this number?"** Figures end up in memos and meetings. For this
  audience, trust *is* the product. One contradicted number and the tool is dead.
- **"Show me on the map."** There is a real briefing moment — a superior walks in,
  sometimes with an iPad. The map is the emotional part of the product; don't lose it.

## 4. The commercial picture

**This is the part most likely to be forgotten, so it is written down plainly.**

The contract is expanding from a handful of map layers to **six analysis modules**.
These are contract line-items, not features we invented:

| Module | Share of contract fee |
|---|---|
| Palms & Fruit Trees | 31.6% |
| Land Use & Structures | 21.0% |
| Crop Monitoring | 14.9% |
| Yield Forecast | 12.6% |
| Irrigation Efficiency | 10.5% |
| Water Allocation | 9.4% |

Things that follow from this, and that matter:

- **The fee split is commercially sensitive.** It was deliberately removed from every
  client-facing surface (see the commit "Remove contract-fee percentage from all
  client-facing UI"). It still exists internally, because it weights the composite
  "overall health" score — a module worth a third of the contract should pull harder on
  the landing map than one worth a tenth. **Keep it out of anything the client sees.**
- **Palms is the hero module.** Nearly a third of the fee. When something has to be
  showcased, showcase that one.
- **The navigation is a commercial artifact.** The old menu hides the modules behind
  identical checkboxes. The new left-hand menu lists all six by name. The client sees
  the things they are paying for, listed down the side of the screen. This was a
  deliberate choice and it is worth saying out loud in client meetings.
- **The expansion is the reason for the redesign.** Not taste. The old single-screen,
  layer-toggle model has nowhere to put six scored analyses, each of which needs its own
  numbers, its own legend and its own ranking. That is the "why now".

Other commercial notes:

- **GITEX** came up as a demo venue. The design was sanity-checked against "does this
  tell its story on a booth screen without the presenter touching anything."
- **Arabic / RTL is a real requirement**, not a nice-to-have, for a Gulf government
  client. It is *not* built. It was prepared for (all user-facing text passes through
  one place; the layout is symmetric so it mirrors) and deliberately deferred. The
  recommendation on record is to do an RTL pass **before the layout hardens**, because
  retrofitting it later is the expensive path. The current production app has no
  language or direction setting at all — Arabic today means the browser's translate
  widget.
- **The mockup runs from a double-clicked file.** No install, no server, no network
  dependency beyond map tiles. This was a deliberate choice and it has real value in
  client meetings with hostile Wi-Fi.

## 5. What we found wrong with the current app

All of this was verified against captured copies of the real production pages, held in
`docs/design/`. It is evidence, not impression — which is what makes it usable in front
of a boss or a client.

**The menu tells you what the product thinks it is for.** Read it top to bottom: Farms,
Farm Monitoring, Violations, then seven entries of support and settings. Half the menu
is about the tool rather than the farms. The names don't say which one answers a
question. And the six analyses being sold appear nowhere in it.

**The overview page never draws a conclusion.** Three counters (farms, fields, area)
count inventory and never say whether things are fine. Six layer switches ask the user
what they would like displayed — which assumes they already know what to ask for. Two
tables total up categories, so no individual farm is ever named and nothing is ever
ranked. The Monday-morning work list cannot be produced from this screen at all.

**There is no per-farm view.** Two switches mention a "single farm", but no page about a
farm exists. The nearest thing, Farm Monitoring, works like a scientific instrument:
choose a farm, choose a view, then find a usable image by reading satellite mission
codes and cloud-cover percentages across about thirty dated captures, then scroll a long
page of readings. Even where it does reach a conclusion — the water scheduler's
"proceed with irrigation" call — the reasoning sits in a collapsed panel of raw
engineering fields.

**Nothing is linkable.** The menu items are not links. No view can be bookmarked, shared
or pasted into an email. There is also no export of any kind anywhere in the app.

**Small credibility problems.** The two tables label the same percentage column two
different ways. Several map controls are icon-only with no labels.

## 6. The design idea we landed on

**Three depths.** Each of the three user questions gets its own screen, and users move
between them by clicking. Every step down trades reassurance for density.

- **Depth 1 — the situation.** The Overview. One sentence's worth of answer: a region
  map on a single fixed lens (overall health), a panel of regional numbers and bands,
  and six verdict cards that each lead with a plain status word. Calm when things are
  fine, which is precisely what makes the bad days legible.
- **Depth 2 — the question.** One module owns the page. Its numbers, one legend, the map
  coloured by that question only, and a ranked worst-first list at the bottom that
  exports to a file. Six modules, one template.
- **Depth 3 — the farm.** The dossier. The system's conclusion in one sentence, every
  module's reading for that farm, and an ending that is an action rather than a table.

**Everything else follows from that.** The navigation is the idea made visible. The
modules stopped being toggles and became pages. Deep links exist at every level.

Two rules were treated as non-negotiable:

- **Every number comes from one place.** No screen computes its own counts. This exists
  because prototyping produced a real contradiction — one screen said "223 farms
  critical" while its own module page said "Critical: 105" (223 was "poor or worse").
  For a government audience that is fatal, so the fix was structural rather than
  editorial. Worth retelling; it lands well.
- **Colour means one thing.** Red is "needs action", amber "watch", green "fine",
  everywhere, with no decorative use.

## 7. Decisions worth remembering

**"Depths", not "altitudes".** The concept was originally called altitudes. Renamed
because depth reads more naturally for going *into* detail. If old documents say
altitude, it is the same idea.

**Three proposals were built, then combined.** Full working layouts — a module-first
hub, a map-led hub, and a single-workspace "one dial" version — were built, driven in a
browser and reviewed hands-on before anything was chosen. The shipped design keeps the
first's clarity, the second's map-first landing, and the third's ability to switch
questions without losing your place on the map. The third's landing screen was retired
because it could never answer "is the region OK?". Keeping this history matters: it is
the answer to "is this just your taste?".

**The taxonomy became a filter, not a mode.** Originally the full crop and tree taxonomy
lived behind a mode toggle — you switched the map out of analysis and into taxonomy
browsing, which meant the screen contradicted itself. That was replaced with a filtering
panel, minimised by default, that narrows the working set of farms by crop or tree type.
Each module filters by the taxonomy it is about. The filter moves the map *and* every
number together. This is a better answer commercially too: the full taxonomy is
expensive analysis, and now it has a daily use rather than being a novelty view.

**The old power tools were demoted, not deleted.** The layer browser, the data tables
and the deep single-farm analysis page all still exist. They stopped being the interface
and became tools inside it. This is the answer to "isn't this a risky rewrite" — the
underlying data and analysis are untouched.

**One screen grammar.** The furniture stays in the same places at every depth, so there
is one thing to learn rather than three.

## 8. The presentation

`presentation/` holds an internal deck for Romain's boss: eleven slides, arguing the
redesign. Structure: the current app's failings (2 slides), the user's journey (1), then
the proposal — navigation, the three pages, and each depth as a wireframe followed by a
real screenshot.

**Tone rules, learned the hard way over several drafts.** These were explicit
instructions and the deck was rewritten twice to meet them:

- Write as if spoken. Short, full sentences.
- Sound like a calm professor investigating a situation, not a salesperson.
- No "it's not X, it's Y" constructions, no superlatives, no sales language.
- Few words per slide. Visuals and their annotations carry the argument.
- Skip the technical and the obvious — nobody in the room cares which bugs were fixed.

The deck is regenerated from a script rather than hand-built, so the wording lives in
one place and rebuilds stay consistent. All annotation text is native and editable in
PowerPoint.

Background research that did not make the slides is kept in `presentation/notes/` — the
audit of the current app, the user-question analysis, the design rationale, and prepared
answers to likely objections. That last one is worth reading before any meeting.

## 9. Things to be careful about

- **All data is placeholder.** Farm names, owners, scores, weather — everything is
  generated. Never present a specific number as fact about a real farm.
- **There is a known visual bug:** a red glow sits over the Gulf on the overview heat
  map, caused by a farm whose centroid is out at sea in the mock data. A sharp-eyed
  official will ask about it. Worth fixing before any external demo.
- **The captured production pages in `docs/design/` cannot be re-rendered.** They were
  saved without absolute asset paths, so opening them shows unstyled markup. The real
  screenshot and the rebuilt wireframes in `presentation/assets/` are what to use.
- **Scale is unproven.** Everything works comfortably at 500 farms. Larger regions were
  considered in the design but not tested.
- **The user questions are a synthesis, not a study.** They come from reasoning about
  the client's role rather than from interviews with actual ADAFSA staff. This is an
  honest weakness. A structured walkthrough with real users is the obvious next step and
  a good thing to offer when the question is raised.

## 10. Where things live

| What | Where |
|---|---|
| The deck, slide by slide, with speaker notes | `presentation/storyboard.md` |
| The deck itself | `presentation/adafsa-redesign-draft.pptx` |
| Research behind the deck | `presentation/notes/` |
| Evidence: captured production pages | `docs/design/` |
| The review comparing the three proposals | `docs/design/ux-review-proposals.md` |
| How the mockup runs | `README.md` |

The mockup opens by double-clicking `index.html`. The best appendix to any conversation
about this project is five minutes of clicking through it.
