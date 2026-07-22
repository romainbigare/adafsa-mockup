# Proposal Combined — implementation plan

**Branch to create:** `proposal-combined`, branched from `origin/proposal-a2-map-led`
(commit `f66073d`). A2 already contains all of Proposal A (`00bbd0a`), so the module-page
template, router, registry, scorecards and taxonomy browser come for free. Proposal B is
**not** merged; we port two small things from it by hand (pill CSS, the news bell) and
re-implement its "dial" as pure navigation. `proposal-b-one-dial` can be retired once this
branch demos well.

**Companion docs:** `ux-review-proposals.md` (findings this plan resolves) and the
"three altitudes" architecture rationale (summarised below so this doc stands alone).

**Conventions that bind every task below** (from the repo architecture + CLAUDE.md):
buildless classic scripts (`(function (W) { ... })(window.Wafra)`), everything works over
`file://`, script order in `index.html` is the dependency graph, **no backward
compatibility** — delete freely, and **every new pure module ships with a plain-Node test
file** runnable as `node test/<file>.test.js`.

---

## 1. The experience model (what we're building, in one page)

Three altitudes, one screen grammar. Every screen keeps the same furniture in the same
place: **verdict at the top, the world (map) in the centre, the answer (ranked list)
docked at the bottom, navigation on the left edge.** Users descend by clicking; every
descent trades reassurance for density.

```
#/overview            ALTITUDE 1 — THE SITUATION
                      "Is anything red?" Verdict sentence + region map with
                      problem glow + six calm status tiles. Glancer's screen.
        │ click a tile / a glowing cluster
        ▼
#/m/<key>             ALTITUDE 2 — THE QUESTION
                      One module owns the map. KPI strip, module dial (switch
                      question in place, map viewport preserved), one legend,
                      Attention list + Band summary. Operator's screen.
        │ click an attention row
        ▼
#/farm/<fid>          ALTITUDE 3 — THE FARM
                      Dossier drawer over the zoomed map: the AI's verdict
                      sentence, per-module status, facts, actions. Every
                      journey ends in an action, not a table.
```

Two contracts enforced everywhere, and tested:

- **Number contract.** Every number on screen comes from `moduleRegistry` (rollups, KPIs,
  band shares). No component computes its own counts. The same quantity may never appear
  with two different values or two different scales.
- **Colour contract.** Red only ever means "needs action", amber "watch", green "fine",
  grey "no data / neutral". Band palettes stay as they are (they follow this), but no
  decorative use of the semantic colours anywhere else. Add semantic tokens to
  `assets/css/tokens.css` (`--status-ok/-warn/-critical/-neutral`) and use them for chips,
  glows and badges.

---

## 2. Routes and navigation

`js/dashboard/router.js` (already exists) — extend, don't rewrite:

| Route | Screen | Notes |
|---|---|---|
| `#/overview` | Situation | Default route (unchanged). |
| `#/m/<key>` | Module page | Unchanged, plus the dial (§4.2). |
| `#/farm/<fid>` | Farm dossier | **New — currently parsed but falls back to overview.** Opens as a drawer *over the module map*; remembers `state.activeModule` so the map context stays. Direct deep-link with no prior module defaults to the farm's worst module. |

Behavioural rules:

- Browser Back always does the obvious thing (hash routing already gives us this — keep
  it; never `replaceState` away a step the user took).
- Module→module navigation must **not** move the map (verify: the single persistent
  Leaflet map already survives route changes; only `#/overview` re-fits bounds).
- `Escape` closes the topmost overlay (dossier → layers panel → news popover), never
  navigates.
- The sidebar (A2's: Overview + six modules + Farm Analysis) stays exactly as is — it is
  the one piece of furniture that never changes meaning.

---

## 3. Altitude 1 — the Situation screen (`#/overview`)

Replaces A2's current overview layout. Same framed map idea, three fixes: a verdict, a
legend, and calm tiles.

### Layout (top to bottom)

1. **Verdict bar** (new, full width above the map frame): one plain-language sentence +
   meta. Examples: *"All six areas are normal."* / *"2 of 6 areas need attention —
   Irrigation Efficiency, Water Allocation."* Right-aligned meta: `500 farms · 17,597
   dunums · last scan 08:35`. The sentence is the single most load-bearing UI element in
   the app: no jargon, module names in full, never truncated.
2. **Region map** (existing `.map-framed`, height 55%): all farm boundaries, coloured by
   the *default attention module* (§3.1), clusters coloured **worst-band** (§6.1) so
   problems glow through aggregation. Floating on it:
   - top-left: verdict-echo chip (count of farms in the worst band, e.g. `105 farms
     critical` — from the registry, so it can never disagree with the module page);
   - top-right: `Colour by` select (existing) — **default changes**, see §3.1;
   - bottom-left: **legend** (shared component, §6.2) with an `All farms` scope chip.
3. **Status tile strip** (replaces the mini-card grid): six tiles, one per module, in a
   `repeat(6, minmax(170px, 1fr))` grid (wraps 3×2 below ~1100px — never truncates).
   Tile anatomy: module name (full, two lines allowed) · status chip · headline number on
   its own line (two lines allowed). **Calm by default:** OK tiles are white/neutral with
   a small green chip; warn tiles get an amber left border + amber chip; a critical
   rollup (new third status kind) gets red. No band strips on tiles at this altitude —
   the tile answers OK/not-OK and is a door, nothing more. Remove the dead whitespace:
   the strip hugs its content; the map takes the rest.

### 3.1 Default "Colour by" + `situation.js` (new)

New file `js/dashboard/situation.js` — pure model + render, testable:

```js
W.dashboard.situation = {
  // rollups = moduleRegistry.regionRollups(farms)
  verdict(rollups),            // -> { sentence, warnKeys: ['ier','water'], kind: 'ok'|'warn' }
  pickDefaultModule(rollups),  // -> module key: first warn module by feePct desc; else hero ('palms')
  render(state)                // renders verdict bar + tiles, wires colour-by
};
```

`pickDefaultModule` is why the landing map shows *today's problem* with zero
configuration: colour-by defaults to the worst-status module, so first paint is already
differentiated colour (fixes the all-green "Colour by: Structures" landing).

### Interactions

| Action | Result |
|---|---|
| Click a tile | `#/m/<key>` |
| Click a glowing cluster / any cluster | `#/m/<activeColourBy>` with the map already zoomed one step into that cluster (`cluster.getBounds()` fit, then navigate — the persistent map keeps the zoom) |
| Change Colour by | Recolour map + swap legend + update verdict-echo chip. No navigation. |
| Click verdict sentence's module name(s) | `#/m/<key>` (make the warn module names links) |

---

## 4. Altitude 2 — the module page (`#/m/<key>`)

The A/A2 template survives intact (KPI strip · map · legend · Attention/Band-summary
sheet). Three changes:

### 4.1 KPI strip
Unchanged structurally. Content fixes from the review are part of this plan: one scale
per module (§7.2) and registry-only numbers.

### 4.2 The dial (B's best idea, re-implemented as navigation)

A module-switcher pill row docked directly under the KPI strip, left-aligned: six pills
(icon + `shortLabel`), active pill = current route. **Implementation is six `<a
href="#/m/<key>">` elements** — no new state, no JS beyond render + active-class; the
router does the work and the persistent map preserves the viewport, which is exactly B's
"spatial continuity" feature. Port `.view-pill` CSS from `proposal-b-one-dial`
`assets/css/components.css` (lines ~237–250) into a fixed `grid-template-columns:
repeat(6, auto)` row — **no flex-wrap** (that's what made B's "Water" pill balloon).
Below `md`, the row becomes `overflow-x: auto`.

Drop B's seventh "Farms" baseline view — Altitude 1 *is* the plain-boundaries view.

### 4.3 Layers mode gets an honest visual state

When `state.taxonomyView` is active (Map Layers panel open), the module chrome currently
keeps asserting module facts over a taxonomy map. Fix: add `body.layers-mode` while
active →

- KPI strip and bottom sheet: `opacity: .35; pointer-events: none`, plus a floating
  badge over the sheet: `Map Layers active — module data paused · [Return to
  <Module>]` (the button = existing `tax-close` behaviour);
- bottom sheet auto-collapses on entering layers mode, restores on exit;
- the module legend hides while the panel is open (the panel *is* the legend then).

`js/dashboard/taxonomyLayers.js` already brokers enter/exit (`ensurePlots`); hook the
class toggle there.

### Interactions (delta only)

| Action | Result |
|---|---|
| Click dial pill | `#/m/<other>` — map viewport untouched, KPIs/legend/tables swap |
| Click attention row | `#/farm/<fid>` (replaces direct `selectFarm` — the dossier calls `selectFarm` itself, §5) |
| Click band-summary row | Ghost-highlight that band's farms on the map (existing `selectGroup`) — unchanged |
| Open Map Layers | §4.3 state; close returns everything |

---

## 5. Altitude 3 — the farm dossier (`#/farm/<fid>`) — new

New file `js/dashboard/farmDossier.js` + a drawer container in `index.html`.

**Layout:** right-side drawer (~380px, full height, `glass-panel`), over the module map.
Map behaviour on open: `plotsLayer.selectFarm(state, feature)` (existing zoom + cyan
pulse), with `paddingBottomRight` adjusted so the farm centres in the *visible* map area
left of the drawer.

**Content, top to bottom:**

1. **Header:** `Farm #452` · owner · area in dunums · close ✕.
2. **The AI's verdict** (one sentence, built not templated-per-module):
   *"Stressed palm canopy (score 50); irrigation Acceptable; water use Efficient."*
   Rule: worst-band module first, then the other scored modules in severity order;
   plain band labels; formatted values in the module's display scale.
3. **Per-module status list:** six rows — icon, module name, band chip (band colour),
   formatted value. Rows are links to `#/m/<key>` (drawer closes, module page opens,
   farm stays highlighted).
4. **Actions (the ending):**
   - `Open Farm Analysis` → `farm-analysis.html` (v1: plain link. Wiring fid-selection
     into the Farm Analysis mock is a stretch goal — its dataset is 3 demo farms; do
     not block on it, do not fake it: label the button `Open Farm Analysis (demo)` if
     the fid can't carry over);
   - `Export farm (CSV)` → reuse `dataTable` CSV writer for this one row across all
     module columns;
   - `Back to list` → closes drawer (`history.back()`).

**Model (pure, testable):**

```js
W.dashboard.farmDossier = {
  model(feature),   // -> { fid, owner, area, verdictSentence, rows: [{key,label,band,value,color}] }
  open(state, fid), close(state), render(state)
};
```

`model()` reads only `moduleRegistry` (`bandOf`, `valueOf`, `format`, severity order) —
number contract holds by construction.

---

## 6. Shared component work

### 6.1 Worst-band cluster colouring + marker fixes (`js/dashboard/plotsLayer.js`)

- Replace `majorityColor` *when a module is active* with **worst-band colouring**: a new
  pure helper `worstColor(state, markers)` — resolve each member's band via the active
  module, pick the highest-severity band present; tie-break by count. Taxonomy views
  (Map Layers) keep majority colouring (there, "most common type" is the honest answer).
  Add a **count badge** for critical members (small red dot + count at the bubble's top
  right) when ≥1 member is in the worst band and the bubble itself isn't red.
- **Singleton markers:** replace the default blue `L.marker` icon with the same
  `divIcon` used for clusters (count `1`, band/taxonomy colour). One code path for 1..n.
- **Centroid validation:** compute the dataset bbox during load; a feature whose centroid
  falls outside it (the farm in the Gulf) keeps its table rows but gets no map marker,
  and logs a console warning with the fid. (Root-causing the geometry is the data team's
  job; the UI must simply never show a pin in the sea.)
- Extract the icon-colour decision into `W.dashboard.plotsLayer.clusterColor(state,
  members)` so it's unit-testable without Leaflet.

### 6.2 One legend component (`js/dashboard/legend.js`, new)

`modulePage.js` and B's `viewSelector.js` contain near-identical legend builders, and the
Situation map needs a third copy — extract once:

```js
W.dashboard.legend.render(el, module, features, { scope: 'view'|'all' })
```

Renders band strip + rows + shares. The `scope` option prints a visible chip — `In view`
or `All farms` — in the legend header (fixes the silently-diverging percentages).
Module page uses `scope:'view'` (as today); Situation uses `scope:'all'`; the Band
Summary tab header gains a matching `All farms` chip.

### 6.3 News bell (`js/dashboard/newsBell.js`, ported from B)

- Position: **top-right corner of the map area** (`right-4 top-4`), *not* in the zoom
  stack, *not* vertically centred (B's placement collided with the bottom sheet).
- Container gets `pointer-events-auto` (see §7.1).
- Popover opens down-left; `Escape` and outside-click close.
- Fix `js/mock/news.js`: no consecutive duplicates, ≥8 distinct templates, strictly
  increasing mock timestamps.

### 6.4 Scorecard (`js/dashboard/scorecard.js`)

Add a third size, `'status'`, per §3 tile anatomy (calm, two-line-capable, no band
strip). Keep `'big'` (unused on this branch but harmless) and delete `'mini'` once the
Situation strip lands. Add `statusKind: 'critical'` support (chip + border styles).

---

## 7. Fixes folded in from the UX review (all mandatory)

### 7.1 Pointer-events dead rail
Every floating control container inside the `pointer-events-none` layer gets
`pointer-events-auto` (module chrome already has it on A2; audit `#/overview` overlays,
news bell, dossier drawer). Add a smoke test to the QA checklist: every visible button
must respond at 1600×900 and 1280×800.

### 7.2 One scale per module (registry)
`moduleRegistry.js`: each module's `format()` must emit values in the same numeric space
as its `bands[].range` strings. Concretely: palms canopy displays as a 0–100 score
everywhere (KPI `Avg health 73`, attention column `50`, dossier `score 50`) — not `0.73`
/ `0.50`. Add `test/formatScale.test.js`: for a spread of mock farms, parse each module's
band range strings and assert the *formatted* `valueOf` parses back into its assigned
band's numeric interval — this pins the contract generically for all six modules.

### 7.3 Rollup honesty
`ier.rollup()`: headline becomes `"223 farms poor or worse"` (or count only Critical —
either is fine, the label and the number must match; keep the KPI strip's separate
`Critical 105` and `Poor or worse 223` tiles as they are). Sweep the other five rollups
for the same class of mismatch (yield's "Underperforming", water's "over-allocated") and
assert each headline's number is reproducible from `bandOf` counts in
`test/moduleRegistry.test.js`.

### 7.4 Mock-data credibility
- Duplicate fids: during `metrics.prepareFarmMetrics` (or loader), reassign duplicates
  deterministically (`fid` collision → next free id) so tables never show two `#53`s.
- `last scan` placeholder on the verdict bar meta: reuse B's mock times
  (`last-scan` / `last-ai-update` generators) rather than `—`.

### 7.5 Jargon pass + strings file (i18n readiness, not i18n)
New `js/ui/strings.js`: a flat `W.strings = { key: 'English text' }` consumed by the new
components (verdict, tiles, dossier, legend chips, empty states). Not a translation
system — just the discipline that makes Arabic a fill-in later. While creating it, apply
the plain-language pass: `IER` → "Irrigation efficiency score", `dun` → "dunums" (first
use per screen), "Counts from M6" → "Counting starts month 6", band names reviewed with
the domain expert. **RTL readiness rule for all new CSS:** use logical properties
(`margin-inline-start`, `inset-inline-end`…) and no direction-baked gradients; the
symmetric grammar (centre map, docked panels) is designed to mirror — don't break that
with hard-coded `left:`/`right:` where a logical property exists.

### 7.6 Loading feel
- Full-screen blur + spinner: **first load only.** Subsequent dataset swaps (Map Layers
  enter/exit) use the small corner toast (`Loading 5,320 features…`) with the map left
  interactive. The staged reveal (tiles → boundaries streaming in) is the "satellite
  coming online" moment — keep it visible, never behind a blur.
- Overlay-draw for taxonomy (drawing taxonomy polygons *over* the retained plots
  snapshot instead of swapping datasets) is the right end state for 25k farms — file it
  as a follow-up ticket, not this branch.

### 7.7 Mobile/tablet minimum (one day, not a redesign)
- Hamburger button (top-left, all screens `<md`) toggling the sidebar as an overlay.
- KPI strip + dial: `overflow-x: auto`.
- Legend collapsed to a chip by default `<md`; tap expands.
- Right-rail controls: visible `<md` (drop `hidden`), tightened to 32px.
- Dossier drawer becomes a bottom sheet `<md`.

---

## 8. index.html — script order for new files

Insert into the existing chain (order matters):

```
js/dashboard/modules.js
js/dashboard/moduleRegistry.js        (modified §7.2/7.3)
js/dashboard/plotsLayer.js            (modified §6.1)
js/dashboard/taxonomyLayers.js        (modified §4.3)
js/dashboard/dataTable.js
js/dashboard/attentionList.js
js/dashboard/legend.js                ← NEW (before modulePage/situation)
js/dashboard/scorecard.js             (modified §6.4)
js/dashboard/modulePage.js            (modified §4)
js/dashboard/farmDossier.js           ← NEW
js/dashboard/situation.js             ← NEW (replaces pages/overview.js render logic)
js/dashboard/newsBell.js              ← NEW
js/ui/strings.js                      ← NEW (load early, right after namespace/config)
js/pages/overview.js                  (slimmed: delegates to situation.js)
js/dashboard/router.js                (modified §2)
js/pages/dashboard.js
```

---

## 9. Tests (required by CLAUDE.md — plain Node, one file each)

Existing suites keep passing (`moduleRegistry`, `modules`, `scorecard`,
`taxonomyLayers`). New:

| File | Asserts |
|---|---|
| `test/situation.test.js` | verdict sentence for 0/1/2/6 warn modules; `pickDefaultModule` fee-weight order + hero fallback; sentence never contains keys/jargon tokens |
| `test/farmDossier.test.js` | `model()` orders modules worst-first; verdict sentence uses formatted values; every row's colour comes from the band |
| `test/clusterColor.test.js` | `clusterColor`: worst-band wins over majority when a module is active; majority for taxonomy; neutral for empty; badge condition |
| `test/formatScale.test.js` | §7.2 generic band/format coherence for all six modules |
| `test/strings.test.js` | every string key referenced in new components exists; no orphan keys |
| `test/all.js` | runner that spawns `node` per `*.test.js` file and exits non-zero on any failure — **because `node --test test/` mis-parses these plain scripts** (verified during the review); CI and humans run `node test/all.js` |

---

## 10. Milestones (each independently demoable)

| # | Scope | Size |
|---|---|---|
| M1 | Branch off A2 · pointer-events audit · marker/centroid fixes · registry scale + rollup fixes · mock-data fixes · `test/all.js` | ~1–1.5 d |
| M2 | `legend.js` extraction · Situation screen (verdict, tiles, default colour-by, home legend) · worst-band clusters + badges | ~2 d |
| M3 | Dial on module pages · layers-mode dim state · news bell port | ~1 d |
| M4 | Farm dossier (route, drawer, model, actions) | ~1.5–2 d |
| M5 | Strings/jargon pass · mobile minimum · RTL-readiness sweep of new CSS | ~1–1.5 d |

M1 is pure debt-payoff and can ship to the existing proposal branches too if they stay
alive for comparison demos.

## 11. Acceptance — the demo arc is the test

Final QA is a scripted walkthrough, in one unbroken run at 1600×900 and on an iPad
width, with mock data:

1. **Load** → staged satellite reveal; verdict sentence reads correctly; exactly the
   warn tiles are non-white; map glows where the problem is. *(Screenshot-worthy: yes.)*
2. **Click the amber Irrigation tile** → module page; KPI `Critical 105`; Home said
   poor-or-worse `223`; **no number on any screen disagrees with any other**.
3. **Flip the dial to Water** → map recolours in place, viewport identical, legend and
   tables follow. Flip back — same.
4. **Click attention row #1** → dossier opens, map zooms to the farm beside the drawer,
   verdict sentence names the worst band first.
5. **Export / Open Farm Analysis** → the session ends on an action. Browser Back walks
   the exact path in reverse, and `Escape` peels overlays in order.
6. Every visible control responds to a click (§7.1); no default-blue pin exists
   anywhere on any zoom level; all `node test/all.js` suites green.

If step 1–5 tells the story without the presenter touching anything else, the
architecture is doing its job — for GITEX and for the Tuesday-morning official alike.
