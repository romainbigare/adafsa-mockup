# Storyboard — "From map viewer to decision tool"

**Deck:** Why the ADAFSA farm-monitoring dashboard needs a redesign — and what the new design is.
**Audience:** internal — your boss (and possibly other leads). Not the client. Speaker notes carry the internal detail (effort, risks, contract context); slide bodies stay client-safe in case the deck travels.
**Length:** 19 slides, ~20–25 min + questions.
**Narrative arc:** *Context → Users → Current app → Why it breaks (esp. with 6 modules) → The idea (altitude) → The design (3 walkthroughs) → Trust → Process → Continuity & fixes → Plan → Ask.*

Asset paths below are relative to `presentation/`. Diagrams exist as SVG (crisp, editable) and PNG (drop into PowerPoint directly) in `assets/diagrams/`.

---

## Slide 1 — Title

- **Headline:** From map viewer to decision tool
- **Subtitle:** Redesigning the farm-monitoring dashboard for the six-module programme
- **Visual:** full-bleed `assets/new/alt1-situation.jpg`, dimmed 40%, title over it.
- **Speaker notes:** One sentence of framing: "We're about to triple the analytical content of the platform — six modules instead of a handful of map layers. I want to show you why the current layout can't carry that, and the redesign that can. Everything you'll see runs today as a clickable mockup on placeholder data."

## Slide 2 — The one-slide version

- **Goal:** the boss can stop listening after this slide and still make the decision.
- **On slide (three columns):**
  1. **Why now** — The client programme grows from 3 map layers to **6 analysis modules** (crop monitoring, palms & fruit trees, land use & structures, irrigation efficiency, yield forecast, water allocation). The current UI is a single map with mutually exclusive layer toggles and flat tables — it cannot present 6 competing analyses, and it answers none of our users' actual questions directly.
  2. **What we propose** — One dashboard, **three altitudes**: a *Situation* screen that says in one sentence whether the region is OK; a *Question* screen per module with a ranked "who needs attention" list; a *Farm* dossier that ends in an action. Same screen grammar at every level; every number from one audited source.
  3. **What it takes** — The interactive mockup is **already built and tested** (this deck's screenshots are from it). Productising the layout is ~5 staged milestones, each independently demoable; the data layer was built to swap from mock to the real API without touching the screens.
- **Speaker notes:** "The short version: the redesign is not a cosmetic refresh. It's the information architecture the six-module contract requires. And it's de-risked — you're looking at screenshots of a working mockup, not Figma."

## Slide 3 — What the platform does today

- **Goal:** ground everyone in the same facts before criticising anything.
- **On slide:**
  - AI analysis over **~500 farms** in the Al Ain region: plot boundaries, crop types, land use, tree/palm detection — ~17k dunums, ~3,300 fields, thousands of classified features.
  - Delivered through a web dashboard: satellite map + data layers + tables. (Visual right: `assets/current/current-app-wireframe.jpg` — wireframe of the live "Farms Overview" page; the raw production DOM is captured in the repo and audited in `notes/current-app-audit.md`.)
  - Users: **government officials** — agriculture & food-safety administrators. They are not GIS analysts.
- **Speaker notes:** "The AI side is strong — the detections and classifications are the product. The question of this deck is only: does the *screen* let a non-technical official benefit from them? Data volumes for scale: 500 farm boundaries, ~2,400 crop polygons, ~5,300 land-use polygons rendered client-side today."

## Slide 4 — Meet the user: five questions, one requirement

- **Goal:** establish the evaluation criteria *before* showing the gap — so the criticism that follows looks like measurement, not taste.
- **On slide:** the five questions officials bring to this tool (full analysis in `notes/user-questions.md`):
  1. **"Is the region OK today?"** — the glance. Asked daily, answered in seconds or not at all.
  2. **"Which farms need attention, worst first?"** — the Monday-morning work list.
  3. **"What exactly is wrong at this farm — and what do we do?"** — the case file.
  4. **"Show me X on the map"** — the briefing/demo moment (minister walks in).
  5. **"Can I quote this number?"** — every figure may end up in a memo or a meeting.
  - **The requirement under all five: trust.** One contradicted number and the tool is dead for this audience.
- **Visual:** `assets/diagrams/questions-vs-apps.png` (used again on slide 6 — here show just the questions column, or build it in two steps).
- **Speaker notes:** "Note what's *not* on the list: 'let me compose a custom map from layers.' That's a GIS analyst's question. Our users' questions are all *answers-first*: they want the tool to have already done the looking."

## Slide 5 — The current app: one map, seven switches, no answers

- **Goal:** a factual tour, not a caricature. (Facts inventoried in `notes/current-app-audit.md`.)
- **On slide:**
  - Visual left: `assets/current/current-app-wireframe.jpg` (wireframe of the live app; `assets/current/mockup-of-current-layout.jpg` is the same layout reproduced in high fidelity if a richer visual is preferred).
  - Callouts (numbered dots on the visual), each backed by the DOM audit:
    1. **Layer toggles** — High Res Image, Land Use, Crop Type, Tree Type, Single-Farm Land Use, Single-Farm Tree Type — six independent switches in a fixed 260px column over one shared map (fixed at 450px tall). The user must know what to ask for.
    2. **Three counters** — `No. of Farms 494 · No. of Fields 3,331 · Area 17,236 dunums`. Inventory, not status: they never change colour, never say "fine" or "not fine".
    3. **Flat distribution tables** — area by land-use class, tree counts by type. Portfolio-wide aggregates: no farm identities, no ranking, and **no export of any kind exists in the app**.
    4. **No routes** — the sidebar items aren't even links (bare list items, client-state only): nothing can be bookmarked, shared, or deep-linked. No verdict, no legend, no per-farm view anywhere.
- **Speaker notes:** "This is a competent *map viewer*. Every element answers 'what is where?' Nothing answers 'is it OK?', 'who's worst?', or 'what should happen next?' — the three questions our users actually ask. Every claim on this slide is verified against the captured production DOM, not our impression of it (`notes/current-app-audit.md`) — including two details worth quoting: the two tables label the same percentage column two different ways ('Farm Area (%)' vs 'Percentage of Area (%)'), and the page ships with no language or direction attribute at all — Arabic today means the browser's translate widget. Also worth saying plainly: nothing here is *wrong*; it's built for a different user than the one we have."

## Slide 6 — Score the current app against the five questions

- **Goal:** the gap, made undeniable in one visual.
- **On slide:** `assets/diagrams/questions-vs-apps.png` — the five questions × (current app / redesign) matrix. Current column: ✗ ✗ ✗ ~ ~. Redesign column: the screen that answers each.
- **Key line under the matrix:** *"The current app makes the user do the analysis: pick layers, read tables, form a judgement. The AI already formed a judgement — the UI just never says it."*
- **Speaker notes:** Walk one row: "'Which farms need attention?' Today: toggle a layer, stare at 500 polygons, no ranking exists — the official simply cannot produce the Monday work list from this screen. In the redesign it's one click: every module page has a ranked, exportable attention list." On "quote this number": "today's stats are static counters, they're probably fine — but there's no single source; the moment we add computed scores, contradictions appear unless we architect against them (more on slide 13)."

## Slide 7 — The breaking point: six modules do not fit in a layer list

- **Goal:** the *why now*. Even someone fond of the current UI must see it can't take the new contract.
- **On slide:**
  - Visual: `assets/diagrams/module-scaling.png` — left, the current sidebar/toggle stack with six *more* toggles grafted on (12+ switches, several meaningless in combination); right, the redesign's answer (modules become navigation).
  - Bullets:
    - Six modules ≠ six more layers: irrigation scores, yield forecasts and water allocation are *scored analyses* with bands, KPIs and rankings — a toggle can show their colour wash, but not their *content*.
    - All six compete for one map: the current panel is a flat stack of independent switches with no grouping, search or arbitration — "Irrigation ON, Yield ON" is a state the model can't meaningfully resolve.
    - The mechanical projection (from the audit, replicating the app's own established pattern): **12–18 toggles** in the same fixed 260px column, **8 search-and-paginate tables** in 4 stacked rows, up to ~21 KPI cards — all on one unpaginated scrolling page, because the app has no tabs, no routes, no per-module screens to absorb the growth.
- **Speaker notes:** "This is the actual trigger for the redesign. The projection isn't a strawman — it's the app's *own* extension pattern (each data type today = one toggle + one paired table, with 'Single Farm' variants doubling the toggles) applied six more times. The moment the contract said 'six modules', the single-workspace model was over."

## Slide 8 — The design idea: information has altitudes

- **Goal:** the conceptual heart of the deck. Spend time here.
- **On slide:**
  - Visual: `assets/diagrams/altitude-model.png` — three stacked levels:
    - **Altitude 1 — the Situation** · "Is anything red?" · verdict sentence + region map + six calm status tiles · *the glance*
    - **Altitude 2 — the Question** · "Which farms, how bad?" · one module owns the map; KPIs, legend, ranked list · *the work list*
    - **Altitude 3 — the Farm** · "What exactly, what next?" · dossier: AI's verdict, per-module status, actions · *the case file*
  - **Law of the design (print it big):** *Users descend by clicking; every descent trades reassurance for density.*
- **Speaker notes:** "The five questions aren't equal — they live at different depths. The glance needs one sentence; the work list needs a ranked table; the case file needs everything about one farm. The old app forced every user to the same altitude: ground level, raw layers, regardless of what they came to ask. The redesign gives each question its own altitude, and the click path *is* the org chart: the director stays at 1, the analyst lives at 2, the inspector lands at 3. Nobody's screen is cluttered by someone else's question — that's how we 'minimise inputs' without dumbing anything down: complexity is buried a click down, not deleted."

## Slide 9 — One screen grammar, three altitudes

- **Goal:** show the design is *systematic* — three screens but one thing to learn.
- **On slide:**
  - Visual: `assets/diagrams/screen-grammar.png` — the layout skeleton: **verdict on top · the world (map) in the centre · the answer (ranked list) docked below · navigation on the left edge** — annotated at all three altitudes.
  - Line: *"The furniture never moves; only the altitude changes. Learn the screen once, use it everywhere."*
- **Speaker notes:** "This is what makes three screens cheaper to learn than one screen with twelve toggles. Verdict, map, answer, nav — same places at every level. It's also deliberately symmetric, which matters later for Arabic mirroring. And it's honest architecture: each zone is one component owned by one module in the code."

## Slide 10 — Altitude 1: the Situation *(walkthrough 1 of 3)*

- **On slide:** `assets/new/alt1-situation.jpg` full-width, callouts:
  1. **The verdict sentence** — plain language, module names in full, never truncated: the single most load-bearing element in the app. The five-second test, passed at the door.
  2. **The map glows where the problem is** — coloured by *overall criticality* (a weighted roll-up of all six modules); clusters take the **worst** band present, with a red "N need attention" badge — problems survive aggregation instead of averaging away.
  3. **Six calm status tiles** — status word first (*On track · Watch · Needs attention*), one supporting line. OK tiles stay quiet; only trouble gets colour. Each tile is a door to its module.
- **Secondary visual (inset, optional):** `assets/new/alt1-hover-breakdown.jpg` — hover any farm: per-module breakdown.
- **Speaker notes:** "Compare to the old landing: three counters and a toggle list. Here the first paint answers question 1 in one sentence, and *calm is a feature* — when nothing is wrong the screen is quiet, so when something is red it actually means something. The composite score is fee-weighted across modules under the hood; on screen it's just 'overall criticality' — complexity in the code, not the UI."

## Slide 11 — Altitude 2: the Question *(walkthrough 2 of 3)*

- **On slide:** `assets/new/alt2-module-ier.jpg` main, `assets/new/alt2-module-water.jpg` small beside it; callouts:
  1. **One module owns the map** — one subject, one legend, one colouring. No mixed states, ever.
  2. **KPI strip** — the module's headline numbers, straight from the shared registry.
  3. **Flip the question in place** — switching modules (via the module nav — B's "dial" idea, implemented as navigation) keeps the map viewport; KPIs, legend and list swap. "Same farms, different question" is one click. (This is why two screenshots: same viewport, irrigation → water.)
  4. **The attention list** — the answer, docked below: farms ranked worst-first, exportable to CSV. A civil servant's Monday morning in one click.
- **Also show (small):** `assets/new/alt2-layers-mode.jpg` — the old layer browser still exists for power users, but opening it visibly *pauses* the module chrome ("Map Layers active — module data paused") instead of contradicting it.
- **Speaker notes:** "This is where the six modules actually live — each gets the full template: KPIs, legend, ranked list, deep-linkable URL (officials can paste `#/m/water` into an email). Adding module seven is a registry entry, not a design project. And note the layers panel: we didn't delete the GIS power — we demoted it from *the* interface to *a* tool, and made its mode explicit."

## Slide 12 — Altitude 3: the Farm *(walkthrough 3 of 3)*

- **On slide:** `assets/new/alt3-farm-dossier.jpg` main; callouts:
  1. **The AI's verdict, one sentence** — worst finding first, plain band names, real values.
  2. **Per-module status list** — all six modules for this farm, each a link back up to its module page.
  3. **Every journey ends in an action** — export the farm's data, or open the full Farm Analysis workspace (`assets/new/farm-analysis.jpg` as a small inset — the deep-dive page with heatmaps, weather, soil, scheduling already exists).
- **Speaker notes:** "Question 3 was 'what exactly is wrong, and what do we do?' — this screen is that case file. Note the ending: the old app's dead end was a table; here the last click is always an action. Back button walks the exact path back up — Farm → Question → Situation. That's the full altitude descent: sentence → list → dossier, each level one click from the last."

## Slide 13 — Why officials will trust it: two contracts

- **Goal:** trust as *architecture*, not intention — this is the most defensible engineering slide.
- **On slide:** `assets/diagrams/contracts.png` two panels:
  - **The number contract.** Every figure on every screen — verdicts, KPIs, tiles, legends, dossiers — comes from **one audited module registry**. No component computes its own counts. *The same quantity can never appear with two values or two scales.* Enforced by automated tests.
  - **The colour contract.** **Red = needs action. Amber = watch. Green = fine.** Everywhere — tiles, map, clusters, chips, badges. No decorative red, no module-specific meanings. Enforced by shared tokens + tests.
- **Cautionary tale (small, bottom):** during prototyping, one screen said "223 farms critical" while its own module page said "Critical: 105" (223 was "poor *or worse*"). Caught in review, fixed *structurally* — that class of bug is now impossible, not just absent.
- **Speaker notes:** "For this audience trust *is* the product: an official who quotes 223 in a meeting and gets corrected to 105 by their own analyst never opens the dashboard again. We found exactly that bug in our own prototype — which is why the fix is architectural: one source of numbers, tested (`node test/all.js` — registry, verdict, scales, severity all covered). And this bug class isn't hypothetical: the *production* page already labels the same percentage column two different ways in its two tables ('Farm Area (%)' vs 'Percentage of Area (%)'). Say this sentence to the boss verbatim: numbers on two screens can no longer disagree, *by construction*."

## Slide 14 — Six modules become navigation, not toggles

- **Goal:** close the loop on slide 7 — show the scaling problem *solved*.
- **On slide:** `assets/diagrams/ia-before-after.png` — before: one screen, 12+ toggles, mutually exclusive states, tables stacked below. After: the route tree — `#/overview` → six `#/m/<module>` pages (one template) → `#/farm/<id>`.
  - Bullets:
    - The sidebar now *sells what the client bought*: six modules, by name. Click the thing you paid for, see the thing you paid for.
    - One module-page template reused six times → consistent UX and O(1) design cost per new module.
    - Deep links for every level — pasteable into reports, emails, WhatsApp.
- **Speaker notes:** "The mutual-exclusivity problem didn't get fixed — it got *dissolved*: it became navigation. And there's a commercial point: the old UI hides the six modules behind identical toggles; the new nav literally lists the contract line-items down the left edge."

## Slide 15 — How we got here (we didn't guess)

- **Goal:** show rigour; pre-empt "is this just taste?"
- **On slide:** three thumbnails with one-line verdicts (shots in `assets/process/`):
  - **A — Module hub** (`a-1-overview.jpg`): best first-glance scorecard. *Kept: the six-tile Home, the module-page template.*
  - **A2 — Map-led** (`a2-1-overview.jpg`, `a2-2-colourby-ier.jpg`): the demo-room "our region live from space" moment. *Kept: map-first landing, colour-by.*
  - **B — One dial** (`b-2-water.jpg`): switch analyses in place without losing your map position. *Kept: the dial, the ranked-tab defaults. Retired: its no-summary landing.*
  - Line: *Three full layouts built, driven in a real browser, reviewed hands-on (1600×900 and phone width), then **combined**: A's clarity + A2's landing + B's dial.*
- **Speaker notes:** "Full review with screenshots and a must-fix list is in the repo (`docs/design/ux-review-proposals.md`). We also stress-tested each with the five questions from slide 4 — B famously could never answer 'is the region OK?', which is why its landing died and its best interaction survived inside A2's pages. The combined design isn't a compromise; it's a harvest."

## Slide 16 — What we're *not* throwing away

- **Goal:** defuse the "risky rewrite" objection.
- **On slide:**
  - Same map engine, same satellite basemaps, same data pipeline — the AI outputs don't change.
  - The GIS layer browser survives (as an explicit mode), the data table survives (as ranked, sortable, exportable lists), the Farm Analysis deep-dive page survives untouched.
  - The mock/data boundary is an API seam: screens read one data interface; swapping placeholder for production data touches **two folders**, zero screens.
  - Buildless static front-end (no build step, no server dependency) — deploys anywhere, demos from a laptop, works offline from a file.
- **Speaker notes:** "This is a re-architecture of *navigation and presentation*, not of data or analysis. Retraining cost is low precisely because of slide 9 — one grammar. And the mockup runs from a double-clicked HTML file — worth remembering for client meetings with hostile Wi-Fi."

## Slide 17 — Quality debt we retired on the way

- **Goal:** show the review had teeth; these are credibility-killers in front of a client.
- **On slide (two columns of quick wins, past tense):**
  - Dead map controls (unclickable zoom/basemap rail) — fixed.
  - A stray default-blue pin floating in the Gulf — eliminated (centroid validation).
  - Duplicate farm IDs in tables — deduplicated.
  - "223 critical" vs "105 critical" — the number contract (slide 13).
  - Truncated headlines ("223 farms criti…") — layout rules that never truncate the verdict.
  - Jargon pass: "IER" → "Irrigation efficiency score", "dun" → "dunums", plain band names; all copy in one strings file — **which is also the Arabic seam** (the production page has no `lang`/`dir` attribute at all; Arabic today means the browser's translate widget).
  - Mobile/tablet minimum: collapsible rail nav, scrollable KPI strip — officials *will* open this on an iPad (`assets/new/mobile-situation.jpg` inset).
- **Speaker notes:** "Each of these is small; any of them could have torched a demo. A sharp official *will* ask what the pin in the sea is. The strings file matters strategically: English-only today, but every label passes through one place, and the new CSS uses direction-neutral properties — so Arabic/RTL is a fill-in, not a rebuild."

## Slide 18 — Plan: five milestones, each demoable

- **On slide (table):**
  | # | Scope | Outcome you can click |
  |---|---|---|
  | M1 | Debt payoff: controls, markers, scales, rollup honesty, test runner | Current mockup, credible |
  | M2 | Situation screen: verdict, tiles, home legend, worst-band clusters | Altitude 1 live |
  | M3 | Dial + layers-mode state + activity bell | Altitude 2 complete |
  | M4 | Farm dossier: route, drawer, actions | Altitude 3 live |
  | M5 | Language pass, mobile minimum, RTL-ready CSS | Client-demo ready |
  - Status line: **the mockup in this deck already implements M1–M5 on placeholder data**; the tests (`node test/all.js`) pin the contracts. Next phase = wire real data behind the seam + client demo script.
- **Speaker notes:** "Give rough effort verbally (the original plan sized this at ~7 working days of front-end, done). The acceptance test is worth quoting: the final QA is a *scripted demo walkthrough* — load → verdict reads correctly → click the amber tile → numbers agree → flip the dial → open a dossier → export. If that story tells itself without the presenter touching anything else, the architecture works — for a GITEX booth and for a Tuesday-morning official alike."

## Slide 19 — The ask

- **On slide:**
  1. **Endorse the three-altitude architecture** as the target for the six-module release.
  2. **Green-light real-data wiring** behind the existing mock seam (needs API/data-team time).
  3. **Schedule the client walkthrough** using the scripted demo arc; Arabic/RTL spike before the layout hardens.
  - Closing line: *"The AI already knows which farms need attention. The redesign is the difference between the client having to dig for that — and being told."*
- **Speaker notes:** Decisions you actually need today: architecture endorsement and the data-team allocation. Offer the live mockup for a hands-on session after the meeting — it runs from a laptop, no install. Anticipated objections and answers are in `notes/objections.md`.

---

## Appendix slides (have ready, don't present)

- **A1 — Current-app inventory detail** — from `notes/current-app-audit.md` (exact toggles, tables, labels).
- **A2 — The five questions, full analysis** — `notes/user-questions.md` table.
- **A3 — Review findings list** — the must-fix list from `docs/design/ux-review-proposals.md`.
- **A4 — Test coverage** — what `test/*.test.js` pins (registry, verdict, scales, severity, dossier, strings).
- **A5 — Mobile shots** — `assets/new/mobile-situation.jpg`, `assets/new/mobile-module.jpg`.
- **A6 — Farm Analysis page** — `assets/new/farm-analysis.jpg` full-size.
- **A7 — Live demo** — open `index.html`: no build, no server, no install.
