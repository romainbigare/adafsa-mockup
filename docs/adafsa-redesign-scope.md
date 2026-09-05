# ADAFSA platform — redesign scope

**Status:** proposal for review. Nothing in here is built yet.
**Sources:** `docs/adafsa-mockup-review.md` (full working transcript, 1h 35m, plus its
seven decision boxes), read end to end — not only the boxes. Items that appear in the
transcript but *not* in any decision box are gathered in §17 so nothing is quietly lost.
**Current mockup:** `index.html` + `farm-analysis.html`, described in `README.md`.

---

## 1. What actually changed in the review

Three shifts sit underneath every item below. Reading them first makes the rest
predictable.

**The overview stopped being a health screen and became an inventory screen.** Mark's
reasoning: a ministry tracks production capacity, not plant health; health is a local,
farm-level concern. This one sentence removes the composite "overall health" score, the
coloured heat map on the landing page, and the six verdict tiles — the whole spine of the
current Altitude 1. What replaces it is stock: how many farms, how many dunums, of what,
where.

**Modules stopped being pages and became groups of pages.** Each of the six contract
modules now owns a small set of sub-pages, one per deliverable or per pair of related
deliverables, with a change-tracking sub-page almost everywhere. The navigation grows
from eight entries to roughly twenty-five.

**The map stopped being the interface and became an illustration inside it.** Maps stay
where they answer "where?", shrink everywhere else, and disappear entirely from change
and trend pages. Mark was explicit: "There's a danger in too many maps. It's hard data."
The consequence is architectural — the product becomes a reporting application that
contains maps, rather than a map application with panels floating over it. Pages scroll.

A fourth thing worth naming, because it changes the story we tell rather than the code:
the question *"is anything wrong today?"* no longer has a home on the landing page. It
now lives one level down, inside each scored module's ranked table, and on the farm's
corrective-actions page. The three depths survive; the top one changes meaning.

---

## 2. Global decisions

### 2.1 Naming

| Current | New | Source |
|---|---|---|
| Farms Overview / Overview | **Overview** | unchanged |
| Crop Monitoring | **Crop Monitoring** | unchanged (covers field crops) |
| Palms & Fruit Trees | **Tree Monitoring** | [00:10:40] |
| Land Use & Structures | **Land Use & Structures** | unchanged, kept as one item |
| Irrigation Efficiency | **Irrigation Efficiency** | unchanged |
| Water Allocation | **Crop Water Calculator** | [00:14:36] |
| Yield Forecast | **Yield Optimisation** | [00:11:46] — marketing framing |
| Farm Analysis | **Individual Farms** | [00:18:02] |

Taxonomy naming, from [00:29:23] and [00:37:37]:

- `Open-Field Produce` → **Open Field** (drop the dash).
- Dual-named crops take their first name only (e.g. "Eggplant", not "Eggplant/Brinjal").
- Coffee is removed — it is a Saudi crop.
- **Forest Trees** is added as a third tree category.
- Trees are three categories: Date Palm, Fruit Trees (one flat group), Forest Trees.

### 2.2 Navigation order

    Overview
    Crop Monitoring
    Tree Monitoring
    Land Use & Structures
    Irrigation Efficiency
    Crop Water Calculator
    Yield Optimisation
    Individual Farms
    ─────────────────────
    Support            (single footer item)

Support collapses from seven entries to one. Violations is removed everywhere.

### 2.3 Two filters, present on nearly every page

**Region.** Abu Dhabi Emirate / Abu Dhabi / Al Ain / Al Dhafra. Mark's reason is
political as much as analytical: each province is run by a different member of the royal
family and they ask for their own numbers. The transcript asks for this "wherever
appropriate on the regional analysis" — so it belongs on the overview *and* every module
page, not the overview alone.

**Taxonomy.** The left-hand crop/tree tree, scoped to whatever the page is about. It
already works this way in the mockup and Mark liked it. "Search" in his vocabulary means
filtering through this tree, confirmed at [01:06:19].

Both filters drive every number on the page at once — map, headline figures and tables
together. This is the existing number contract and it holds.

### 2.4 Reporting levels

Every module page reports at three levels, in this order down the page: **emirate →
province → farm**. Summary numbers first, then a long searchable farm list. This shape
repeats often enough to be a component rather than a habit.

### 2.5 Removed outright

- Violations tracking (agreed with ADAFSA that we do not track them).
- Flood-irrigation detection — "was a mistake, it needs to be taken out" [01:02:36].
- The composite **overall health** score and its map lens, along with the fee weighting
  behind it. Romain: MMC does not produce such a metric, so we should not invent one.
  A welcome side effect — the commercially sensitive fee split leaves the codebase.
- Accuracy / confidence percentages on module pages. Validation is done offline and is
  not a platform deliverable [00:53:56].
- Data confidence on the farm page [01:25:24].
- All MMC farmer-facing leftovers: soil moisture, temperature, weather, crop growth
  phase, water schedule, and the canvas heat map. "Too much for government. It's not our
  deliverables. It'll be in the farmer app" [01:27:36].
- The layers-mode toggle as a *mode*. The taxonomy is a filter; land use gets real pages.

---

## 3. Proposed sitemap

Twenty-two content pages. Module landing = its first sub-page, so no module ever shows a
menu-only screen.

    Overview                                    #/overview

    Crop Monitoring                             #/m/crop
      Crops & cultivated area                   #/m/crop/inventory      map
      Seasonal change                           #/m/crop/change         no map
      Fallow land                               #/m/crop/fallow         small map

    Tree Monitoring                             #/m/trees
      Trees, species & varieties                #/m/trees/inventory     map
      Canopy health                             #/m/trees/canopy        small map
      Annual change                             #/m/trees/change        no map

    Land Use & Structures                       #/m/land
      Land use                                  #/m/land/landuse        map
      Structures                                #/m/land/structures     map
      Change tracking                           #/m/land/change         no map · v2

    Irrigation Efficiency                       #/m/ier
      Efficiency scores                         #/m/ier/scores          small map
      Quarterly trend                           #/m/ier/trend           no map

    Crop Water Calculator                       #/m/water
      Monthly demand & over-allocation          #/m/water/demand        no map
      Seasonal water budget                     #/m/water/budget        no map

    Yield Optimisation                          #/m/yield
      Yield forecast                            #/m/yield/forecast      no map
      Crop calendar                             #/m/yield/calendar      no map

    Individual Farms                            #/farms
      Farm register                             #/farms                 small map
      Farm profile                              #/farm/<id>
      Corrective actions                        #/farm/<id>/actions

    Support                                     #/support

**Navigation behaviour.** The sidebar shows the eight top-level entries; the active
module expands to reveal its sub-pages and collapses when you leave. Mark asked the
question in exactly those terms — "is there a sub-menu called seasonal change report?" —
so the sub-pages should be visible in the nav rather than hidden behind in-page tabs.
An alternative (tabs in the page header) is noted in §18 as an open choice.

---

## 4. Two page archetypes

Almost every screen below is one of two shapes. Building these two well is most of the
work; the modules then cost very little each.

### Archetype A — Inventory page (a map is allowed)

    ┌─ Header ────────────────────────────────────────────────────────────┐
    │  Module ▸ Sub-page          [Region ▾]        As of 12 Aug 2026     │
    ├─ Headline figures ──────────────────────────────────────────────────┤
    │   Large numerals, 4–6 of them, responding to both filters           │
    ├──────────┬──────────────────────────────────────────────────────────┤
    │ Taxonomy │  MAP — 40–50% of the viewport height, never full-bleed   │
    │  filter  │  boundaries · major roads · basemap switch · zoom        │
    │ (sticky) ├──────────────────────────────────────────────────────────┤
    │          │  SUMMARY TABLES — by category, expandable to type        │
    │          │  one table by dunum, one by farm, both with percentages  │
    │          ├──────────────────────────────────────────────────────────┤
    │          │  FARM TABLE — every farm, sortable columns, CSV export   │
    └──────────┴──────────────────────────────────────────────────────────┘

The page scrolls. The map is interactive; the tables below it are *fixed* — they answer
to the two filters but not to map panning. Mark said this plainly at [00:39:02] and it
resolves an ambiguity in the current mockup, where the legend switches between "In view"
and "All farms".

### Archetype B — Change / trend page (no map)

    ┌─ Header ────────────────────────────────────────────────────────────┐
    │  Module ▸ Change      [Region ▾]   [vs last quarter ▾]              │
    ├─ Net movement ──────────────────────────────────────────────────────┤
    │   Gained · Lost · Net, at emirate level, then a province row set    │
    ├──────────┬──────────────────────────────────────────────────────────┤
    │ Taxonomy │  TREND CHART — the only graphic on the page              │
    │  filter  ├──────────────────────────────────────────────────────────┤
    │          │  DIRECTION TABS  Started · Stopped · Increased · Decreased│
    │          │  CONTRIBUTOR TABLE — farms ranked by size of change,     │
    │          │  before / after / delta, sortable, CSV export            │
    └──────────┴──────────────────────────────────────────────────────────┘

Mark was firm that change detection needs hard data rather than geography [00:56:29].
Romain's instinct was the opposite, and the note is worth keeping: if the client asks
"where is that?", the contributor table's rows link straight to the farm, which is a
cheaper answer than a map.

---

## 5. Overview — `#/overview`

**Mindset:** inventory and production capacity. No health, no colour, no verdict.

### Layout, top to bottom

1. **Header.** Title, region selector, and "Last satellite update: *date*". The current
   mockup shows a clock time (08:42); Mark queried it and Romain agreed a date is more
   honest [00:36:17].
2. **Headline figures** — four large numerals, filter-responsive. Mark specified two:
   **farm count** and **dunums**. The other two are open (§18); the strongest candidates
   are *cultivated dunums* and *crops in season this month*. These need to be visibly
   larger than in the current mockup — Mark asked "where's the total?" four separate
   times [00:32:36 → 00:35:05], which is a sizing problem as much as a placement one.
3. **Map**, roughly half the viewport height. Bubbles carrying farm counts, breaking down
   as you zoom, in the manner of Google Maps [00:03:53]. Country, emirate and province
   boundaries. Major highways only. Basemap / map-type buttons on the map itself. **No
   colour coding and no legend** [00:32:33].
4. **Crop distribution by dunum** — a table of the six categories (Cereals, Fodder, Open
   Field, Date Palm, Fruit Trees, Forest Trees) with dunums and percentage, each row
   expanding to the individual crops inside it.
5. **Crop distribution by farm** — the same table, counting farms.
6. *(Later)* Crop production. Agreed as desirable, deferred; the measurement window is
   unclear because of seasonality [00:42:36].

The left rail carries the full crop and tree taxonomy and filters everything above.

### Content notes

- The two tables are the ones Mark presented to ADAFSA from the pilot and that they
  responded well to. They are the reason he pushed back on stripping the overview: "those
  tables I showed them, they like them. That is the summation" [00:40:08].
- The worked example to design against: *tomato season is starting, someone wants to know
  how many farmers are growing tomatoes this year and at what size* — answerable from the
  home page without a search [00:39:52].
- Fallow land does not appear here; it belongs to land use and crop monitoring
  [00:38:07].

---

## 6. Crop Monitoring — `#/m/crop`

Deliverables in scope: crop location, crop type classification, cultivated area
(per farm and per crop type), quarterly crop change, and flagging of new and abandoned
cultivation against the UAE seasonal baseline.

### 6.1 Crops & cultivated area — `#/m/crop/inventory` · Archetype A

- **Headline figures:** farms cultivating, cultivated dunums, distinct crops detected,
  average cultivated share.
- **Map:** parcels coloured by crop category, with the taxonomy filter narrowing them.
- **Summary tables:** cultivated area by category → crop, by dunum and by farm.
- **Farm table:** farm, owner, province, total dunums, cultivated dunums, cultivated
  share, crops grown. Sortable, exportable.

Mark left open whether crop location, crop classification and cultivated area are one
sub-page or three [00:48:41]. **Recommendation: one.** They describe the same objects at
the same moment, and three pages would each be thin. Flagged in §18.

### 6.2 Seasonal change — `#/m/crop/change` · Archetype B

The sub-page Mark asked for by name. Comparison is against the same season last year.

- **Net movement:** dunums and farms gained, lost, net — emirate, then per province.
- **Trend chart:** cultivated dunums for the selected crop, by month, this year against
  last.
- **Direction tabs:** farms that *started*, *stopped*, *increased*, *decreased* the
  selected crop. This is the interaction he described almost verbatim at [00:48:27].
- **Contributor table:** farm, province, crop, dunums last year, dunums now, delta and
  percentage change.

### 6.3 Fallow land — `#/m/crop/fallow`

- Fallow dunums today, change from last year, share of agricultural land — emirate then
  province.
- A small map is defensible here since fallow land is a place; keep it modest.
- Farm table: fallow dunums per farm, share of holding, and how long it has been fallow.
- "Newly abandoned" is the flag that matters operationally and drives farmer alerts.

**Overlap to resolve:** fallow appears both as a land-cover class in Land Use and as a
detection deliverable here. Recommendation in §18 — Land Use reports the *class*, Crop
Monitoring owns the *detection and change*.

---

## 7. Tree Monitoring — `#/m/trees`

The largest module by contract share, and the one to showcase in any demo.

### 7.1 Trees, species & varieties — `#/m/trees/inventory` · Archetype A

Mark confirmed tree location, tree count, and species/variety classification belong
together on one page, with a map, colour-coded by species or variety [00:55:16].

- **Headline figures:** total trees, date palms, fruit trees, forest trees, cultivars
  identified.
- **Map:** tree points or clusters coloured by species; the variety level available for
  date palms.
- **Summary tables:** trees by category → species → variety, by count and by farm count.
- **Farm table:** farm, province, palms, fruit trees, forest trees, dominant cultivar.

### 7.2 Canopy health — `#/m/trees/canopy`

The important correction from the review: **canopy health is per farm, not per tree**
[00:57:22]. Mark's reasoning is sound — the farms here are small, share one water source,
and are managed as a unit, so the farm *is* the cluster. Two numbers are enough: one for
palms and one for fruit trees.

- Emirate and province averages for both numbers, with the band distribution.
- Farm table: farm, province, palm canopy index, fruit canopy index, band, tree count.
- A small map is acceptable; it is the one place where seeing a cluster of stressed farms
  has operational value.

### 7.3 Annual change — `#/m/trees/change` · Archetype B, no map

- Trees planted and trees removed, gain / loss / net — emirate, then province.
- Breakdown by species, expandable to variety ("sub-click for citrus or pomegranate"
  [00:54:27]).
- Contributor table: which farms produced the change.

---

## 8. Land Use & Structures — `#/m/land`

Static inventory. Mark called it exactly that and it is why the two stay joined
[00:15:06].

### 8.1 Land use — `#/m/land/landuse` · Archetype A

- **Headline figures:** total mapped dunums, open agriculture, protected agriculture,
  structures, barren, fallow.
- **Map:** land-use classes — the one place the full class palette earns its keep.
- **Summary tables:** area and share by class, by dunum and by farm.

### 8.2 Structures — `#/m/land/structures` · Archetype A

- **Tiers.** Tier 1 and tier 2 are in scope; **tier 2 is the October rollout target**.
  Tier 3 — telling a fertigation unit from a filtration unit from a pump room from a
  desalination unit — is doubtful and both parties said so. Design the page so tier 3
  can appear as a further expansion of a tier 2 row, and so its absence is invisible.
- **Headline figures:** structures detected, by tier.
- **Summary tables:** counts and area by structure type, expandable.
- **Farm table:** farm, province, total structure area, structures by type, and the
  change columns below.

### 8.3 Change tracking — `#/m/land/change` · Archetype B, v2

Formally a version-two item because we lack history [00:59:09]. But structures are
captured quarterly, so the moment two quarters exist this page works. Mark's operational
point matters more than the volume: "when it does happen they need to know. So it may be
only five structures, but they need to know right away" [00:59:47]. That argues for
building the page now, showing it empty-with-explanation until history accumulates, and
wiring the alert. Whether the comparison is quarter-on-quarter, year-on-year or both is
open (§18).

---

## 9. Irrigation Efficiency — `#/m/ier`

Deliverables: IE score, IE band classification, zone average, quarter-to-quarter trend.
**Zone means the three provinces** [01:02:16]. A field-office breakdown (~40 offices) is
wanted eventually but no farm-to-office mapping exists, so it is deferred.

### 9.1 Efficiency scores — `#/m/ier/scores` · Archetype A, modest map

- **Headline figures:** farms scored, emirate average, farms in the lowest band, farms
  flagged for priority intervention.
- **Zone averages:** a compact three-row block — Abu Dhabi, Al Ain, Al Dhafra — each with
  its average score and band distribution.
- **Map:** kept small, farms coloured by band. This is one of the few genuinely spatial
  questions in the platform.
- **Farm table:** farm, province, score, band, distance from its zone average. Sortable
  to answer Mark's own query: *every farm in Al Ain flagged for priority intervention*
  [01:00:16].

### 9.2 Quarterly trend — `#/m/ier/trend` · Archetype B, no map

Mark was explicit that a map of *who improved* confuses more than it explains, and that
he would rather have a trend line and raw numbers [01:01:36].

- **Trend chart:** emirate and per-province average score by quarter.
- **Farm table:** farm, province, last quarter's score, this quarter's score, delta in
  points and in percent. Sortable both ways, so the biggest fallers and the worst
  absolute scores are each one click away [01:01:51].

---

## 10. Crop Water Calculator — `#/m/water`

The most tangled module in the review, and the decision box resolves it well: six listed
items are really **two pairs plus two parameters**. Two sub-pages follow directly.

### 10.1 Monthly demand & over-allocation — `#/m/water/demand`

The operational trio, on one page, because they are one thought: a budget, a breakdown,
and a flag.

- **Monthly water demand** — per farm, a roughly 30-day forecast in m³ and m³/dunum,
  derived from ET actuals and crop growth stage. This is the allocation.
- **Water allocation per crop** — the same demand split by crop within the farm. This is
  what tells you *where* a farm is over-consuming.
- **Over-allocation flag** — raised against the **monthly** demand, never the seasonal
  budget. Mark's reasoning: by the time a season closes it is too late to act
  [01:13:16]. The flag also surfaces on the farm's corrective-actions page.

Layout: headline figures (farms in demand, total m³ allocated this month, farms flagged,
total over-consumption) → emirate and province roll-up → farm table with baseline m³,
actual m³, variance, flag state → expanding a farm row reveals its per-crop split.

No map. Add a **"how this is calculated"** link opening the formula inputs in a small
panel — Mark and Romain agreed these are model parameters rather than deliverables, but
worth showing [01:21:05].

### 10.2 Seasonal water budget — `#/m/water/budget`

The planning half, and Mark's own words: "an amazing tool for policy design" [01:22:45].

- The central table: for a chosen crop — number of farms, dunums, expected production,
  total water over the growing cycle. The question it answers is whether authorising N
  more farms to grow tomatoes is affordable in water.
- **Cubic metres per kilo of production** as a derived column, and searchable by farm
  [01:23:39]. This was Mark's addition and it is the most quotable number in the module.
- **Crop coverage** sits here as a supporting figure — surveyed area by crop — rather
  than as a deliverable in its own right.
- **Fruit trees must be included** in this module; the proposal mentions them sixteen
  times [01:22:13]. Forest trees are not covered.
- "Phased by Abu Dhabi crop calendar" needs no separate artefact — the crop calendar
  *is* the farm calendar [01:21:34].

Mark floated a per-crop, per-month view of total consumption across Abu Dhabi with a
daily average, and called it "a simple map" [01:19:02]. Read in context he is describing
a chart. Flagged in §18.

---

## 11. Yield Optimisation — `#/m/yield`

One metric, and Mark asked for the map to go: "I would rather not put the map. If they
want it, we'll put it back in" [01:02:57].

### 11.1 Yield forecast — `#/m/yield/forecast` · no map

- **Top table:** for the selected crop — average yield, and the percentage of farms below
  that average. This is the framing Mark asked for directly [01:03:50].
- **Production forecast at province level.** The proposal says "district"; nobody knows
  what a district is here, so it is read as province until ADAFSA says otherwise.
- **Farm table:** farm, province, crop, dunums, forecast yield, deviation from the crop
  average. Rankable highest, lowest, and below-average.

### 11.2 Crop calendar — `#/m/yield/calendar` · no map

Mark's design, described precisely at [01:04:50]. Pick a crop from the taxonomy and see:

- A **12-month bar chart of dunums** dedicated to that crop.
- A **12-month bar chart of farms** growing it.

Both read as a bell curve rather than a hard start and finish — a handful of farms plant
early. Totals, not averages [01:05:48]. A simplified colour-coded calendar strip across
all crops sits above the two charts as an orientation device.

---

## 12. Individual Farms — `#/farms`

### 12.1 Farm register — `#/farms`

Mark's mental model: "I see the list of 25,000 farms, I click on one farm and there's a
breakdown for that farm" [00:48:41]. Region filtering happens on the page rather than as
a nav level above it [00:19:37].

- Region and taxonomy filters, plus a free-text search on farm ID and owner.
- A table of every farm: ID, owner, province, dunums, main crops, IE band, water flag,
  open issues. Sortable on every column, exportable.
- A small map beside it, so a selected row shows where the farm is.

### 12.2 Farm profile — `#/farm/<id>` — page 1, basic stats

Mark: "For each farm there are two pages: one is basic stats… and the second page is on
corrective actions" [01:25:24].

- **Header:** farm ID, owner, province, total dunums, and the farm outline on a small map.
- **What they are growing now** — crops with dunums and share. *What they grew last year*
  is acknowledged as valuable but too early for this version [01:28:16].
- **Trees** — palm count, fruit tree count, and the two canopy health numbers.
- **Structures** — tier inventory for the holding.
- **Irrigation efficiency** — score, band, comparison with the zone average, and the
  quarter-on-quarter delta.
- **Water** — monthly demand against actual use, the per-crop split, and m³/kg.
- **Yield** — forecast per crop against the crop average.

Nothing else. No weather, no soil moisture, no growth phase, no water scheduler, no data
confidence, no violations.

### 12.3 Corrective actions — `#/farm/<id>/actions` — page 2

- **Critical issues**, each stated as a finding with a location, a start date and a
  suggested action: over-consumption of water (by crop), newly abandoned or fallow land,
  canopy stress.
- **Farmer alerts** are essentially over-water-consumption alerts, with fallow land as a
  slower second category [01:27:53].
- Ends in an action: export or print the sheet for an inspector visit.
- **Roadmap note, not this version:** field inspectors already carry a tablet
  questionnaire that feeds an AI report generator. Mark expects this page to eventually
  feed into that tablet [00:18:33]. Worth designing the export around that future.

### 12.4 `farm-analysis.html` is retired

Its per-farm map and outline logic move into the farm profile. Its weather, soil,
growth-phase, water-scheduler and heat-map panels are deleted — they are MMC's
farmer-facing product, not ours, and we do not collect the underlying data.

---

## 13. Shared components

Building these once is what keeps twenty-two pages affordable.

| Component | Where it appears | Notes |
|---|---|---|
| **Region selector** | every page | Emirate + three provinces. Drives every number. |
| **Taxonomy filter** | every page except farm pages | Scoped per page; multi-select; the existing panel, promoted from a minimised drawer to a permanent left rail. |
| **Headline figure row** | every page | 4–6 large numerals, filter-responsive. |
| **Expandable summary table** | inventory pages, overview | Category row → type rows, with count/area and percentage. New — this is the component Mark kept asking for. |
| **Farm table** | almost every page | Sortable columns, column chooser, CSV export. Extends the existing `dataTable`. Needs paging or virtualisation for 25,000 rows. |
| **Change table** | every change/trend page | Before / after / delta / % with direction tabs. New. |
| **Trend chart** | change and trend pages | Line by quarter, grouped bars by month. New — no charting exists today. |
| **Map** | inventory pages only | Boundaries, major roads, basemap switcher, count bubbles or classified parcels. Shrinks to a band rather than a full-bleed canvas. |
| **"As of" stamp** | every page | A date, per module. |
| **No-history state** | change pages | An honest, designed empty state until quarters accumulate. |

Two conventions to restate now that health has left the overview:

- **The number contract holds.** Every figure comes from one aggregation layer. With
  twenty-two pages instead of eight, this matters more than before, not less.
- **The colour contract needs restating.** Colour now carries two meanings in different
  places: *classification* on inventory maps (crop, species, land-use class) and *status*
  on the scored modules (irrigation, water, canopy). Keeping them apart — categorical
  palettes on inventory pages, the red/amber/green ramp only where something is being
  judged — is the rule to write down.

---

## 14. Data the mockup does not yet have

Most of the new pages are blocked on data shape rather than on layout. This is the part
to start early, because everything else waits on it.

| Needed | For | Notes |
|---|---|---|
| **Province per farm** | every page | Not in `data/plots.js`. Derive by point-in-polygon against province boundaries, or assign in the mock generator. |
| **Emirate / province / country boundaries** | overview and inventory maps | New geometry, small. |
| **Major highways** | overview map | A labelled or hybrid basemap may cover this more cheaply than a highway layer. |
| **Quarterly history** | every change and trend page | At least five quarters per farm per scored module. None exists today. |
| **Annual history** | tree and structures change | Two years minimum. |
| **Month-by-month crop presence** | crop calendar, seasonal change | Per farm, per crop, per month. |
| **Yield per crop per farm** | yield module | Plus a crop average to measure deviation against. |
| **Water numbers** | water module | Monthly demand m³, actual use m³, per-crop split, seasonal budget, production kg → m³/kg. |
| **Tree split** | tree module | Palms / fruit / forest as separate counts, plus species and variety, plus two canopy indices per farm. |
| **Structure tiers** | structures | Tier 1 and 2 counts and areas per farm; tier 3 modelled but shown only if it materialises. |
| **Revised taxonomy** | everywhere | Add Forest Trees, rename Open Field, single names, drop coffee. |
| **Per-module "as of" date** | every page | A date rather than a clock time. |

A note on scale. The mockup carries 500 farms; Mark speaks of 25,000. The two are not in
conflict — 500 is the current ADAFSA pilot — but tables, clustering and export should be
designed for the larger number and demonstrated on the smaller one.

---

## 15. Architecture

The current build is a buildless, three-page app: classic scripts sharing one
`window.Wafra` namespace, 4.4 MB of geometry attached as globals, and absolutely
positioned glass panels floating over a full-bleed Leaflet map. It was a good fit for
three map-led screens. It is a poor fit for twenty-two mostly-tabular scrolling pages,
and the fit gets worse with every module added.

Since the only hard requirement is that the result is a static site on GitHub Pages,
here is what I would change.

### 15.1 The shape of the app

**From map-with-panels to document-with-maps.** The page shell today is
`h-screen overflow-hidden` with children positioned absolutely over the map. Nearly every
new page scrolls and has a map occupying a band rather than the whole canvas. That is a
new shell: a fixed sidebar, a sticky page header carrying the two filters, and a normal
scrolling content column.

**Two-level routing.** `#/m/<module>/<subpage>`, with the module's first sub-page as its
default. The current router hides and shows a small number of fixed DOM blocks; with
twenty-two pages each page should own its own mount, render into it and tear down.

**Selection lives in the URL.** Region, taxonomy selection and comparison period belong
in the hash alongside the route. The audit of the production app found that nothing was
linkable, and it would be a shame to reproduce that.

### 15.2 Proposed source layout

    src/
      app/          shell, router, page registry, sidebar, header, filters chrome
      domain/       pure logic, no DOM — taxonomy, regions, bands, metrics, aggregation
      data/         one query API over the datasets; lazy geometry loading
      charts/       small SVG renderers: bar, grouped bar, line, stacked bar
      components/   summary table, farm table, change table, map, figure row, empty state
      pages/        one small file per screen (22 of them)
      mock/         the generators — the single swap-for-a-real-API boundary
    public/         index.html, css, static assets
    data/           datasets, split per layer

Four separations worth making explicit:

1. **Model apart from presentation.** `moduleRegistry.js` currently holds band scales,
   value extraction, severity ranking, KPI labels, formatting and summary copy in one
   422-line file. Split it: `domain/metrics` (values), `domain/bands` (scales and
   colours), `domain/aggregate` (roll-ups by region, category and period), and let each
   page own its own wording.
2. **One query layer.** Every page asks the same function for its rows —
   `query({ region, taxonomy, module, level, period })`. That is what actually enforces
   the number contract once there are twenty-two screens; a convention will not survive
   that many pages, an API will.
3. **Geometry apart from attributes.** Today every page loads 4.4 MB of polygons. Most
   new pages have no map at all. Split the datasets into a small attribute table
   (numbers, classes, IDs) and separate geometry files loaded only when a map mounts.
   This is the single largest performance and simplicity win available.
4. **The mock boundary stays sacred.** Everything fabricated lives in `src/mock/` and
   nothing else knows it is fabricated. That property is the reason this mockup can
   become a real front end rather than being thrown away.

### 15.3 Build and hosting

**Recommendation: introduce a small build, keep the output static and offline-capable.**
A single dev dependency (esbuild) bundling ES modules into one classic IIFE script, plus
Tailwind compiled to a static stylesheet instead of the Play CDN. GitHub Pages serves the
output directory; a Pages action runs the build. Authoring gets small files and real
imports, and because the bundle is an IIFE rather than an ES module, the result still
opens from a double-clicked file — which is worth protecting, since demoing from a laptop
on hostile conference Wi-Fi has genuinely mattered on this project.

The alternative — staying entirely buildless — remains workable if we would rather not
add tooling: the same folder structure works with classic scripts and an ordered script
list. The cost is a growing `<script>` manifest and no import graph to catch mistakes. I
would take the build, but it is a reversible decision either way.

Two smaller calls in the same area:

- **Charts without a library.** Roughly two hundred lines of SVG helpers cover every
  chart in this document: bars, grouped bars, lines, stacked bars. That avoids a CDN
  dependency, keeps the offline property, and stays testable.
- **Arabic / RTL.** Still not built, still prepared for. With production about a month
  out, this is the moment to decide, because retrofitting after the layout hardens is the
  expensive path — and the layout is about to harden.

### 15.4 What deleting buys us

Removing the composite score, the heat layer, the layers-mode machinery and the farm
analysis panels takes out roughly a thousand lines before a single new page is written.
The known visual bug — the red glow over the Gulf from a farm whose mock centroid sits at
sea — disappears with the heat layer.

### 15.5 Tests

The existing plain-Node runner stays; it suits pure domain code well. Tests for
`composite`, `situation`, `heatLayer` and `taxonomyLayers` retire with their subjects.
New coverage should follow the domain split: region assignment, category and type
aggregation, period-over-period change, band classification, water derivations, and the
crop calendar's month buckets.

---

## 16. Deletion checklist

- `js/dashboard/heatLayer.js` — the overview heat map.
- The `COMPOSITE` model, `compositeScore`, the fee weighting and `feePct` throughout.
- `js/dashboard/situation.js` verdict tiles, and the six-tile strip in `index.html`.
- `js/dashboard/taxonomyLayers.js` layers *mode* (the taxonomy browsing survives as land
  use pages and as the filter).
- `farm-analysis.html` and `js/pages/farmAnalysis.js`, `js/farmAnalysis/heatmap.js`,
  `js/mock/farmAnalysis.js` — weather, soil, growth phase, water scheduler, heat map.
- Violations, flood-irrigation detection, accuracy percentages, data confidence.
- The multi-entry support menu.
- Tests: `composite.test.js`, `situation.test.js`, `heatLayer.test.js`,
  `taxonomyLayers.test.js`.
- **To decide:** the activity/news bell (`js/dashboard/newsBell.js`, `js/mock/news.js`).
  It never came up in the review and it is not tied to a deliverable. §18.

---

## 17. In the transcript but not in the decision boxes

The boxes are accurate, but they compress. These are the things a reader working only
from the boxes would lose. Timestamps index back into the transcript.

**Scope-changing**

1. **Region filtering belongs on every module page, not only the overview** [00:17:24].
   The overview box mentions the province selector; Mark's instruction was broader —
   "wherever appropriate, on the regional analysis". Every module summary is emirate,
   then province.
2. **Individual Farms needs a register before a farm** [00:18:19, 00:19:37]. Mark asked
   whether a region menu sits above individual farms; the answer was to filter on the
   page. That implies a searchable list page, which no box names.
3. **The overview must scroll** [00:26:31, 00:38:09, 00:40:25]. Mark says "if I scroll
   down" three times. The current shell is a fixed-height, non-scrolling map canvas. This
   is a shell rewrite hiding inside a content decision.
4. **The tables below the map are fixed; the map is interactive** [00:39:02]. This
   settles a real ambiguity in the current mockup, whose legend toggles between "In view"
   and "All farms".
5. **Scale: 25,000 farms, not 500** [00:21:27, 00:48:41]. The mock carries 500. Tables,
   clustering and export should be designed against the larger figure.

**Unresolved tensions the boxes read as settled**

6. **Irrigation Efficiency and Crop Water Calculator** — Mark said "let's combine them"
   [00:12:38] and then, in the final ordering, kept them separate [00:13:59]. The box
   records only the separate outcome. Worth one sentence of confirmation.
7. **Fallow land sits in two modules.** Romain places it on land use [00:38:07]; Mark
   makes fallow detection a crop-monitoring sub-page [00:50:16]. Both are reasonable and
   they need a boundary drawn.
8. **The yield map is removed provisionally** — "if they want it, we'll put it back in"
   [01:02:57]. Worth building the page so the map can return cheaply.
9. **Crop coverage was described as "a simple map"** [01:19:02] while everything around
   it describes a per-crop, per-month chart. Read as a chart here; confirm.

**Detail that changes the build**

10. **The "last scan" clock should be a date** [00:36:17].
11. **Maps need explicit map-type buttons** — none exist in the mockup, and Romain said
    so on the call [00:24:51].
12. **The satellite basemap hides borders and streets**; Mark asked for them back, major
    highways only [00:24:36].
13. **Totals need to be visibly bigger.** Mark asked "where's the total?" four times
    across [00:32:36]–[00:35:05]; Romain's own read was that the numbers need to be
    larger, not merely present.
14. **Rolling four weeks, never week-on-week**, wherever a short comparison window is
    used [00:23:07].
15. **Taxonomy hygiene** — drop coffee, take the first of any dual name, add forest trees
    [00:29:32, 00:30:19].
16. **Formula inputs behind a "more info" pop-up** rather than on the page [01:21:05].
17. **m³/kg should be searchable by farm**, not only reported as an average [01:12:11].
18. **Structures changes must raise an alert, not merely appear in a table** — five
    structures matter and they matter immediately [00:59:47].
19. **Tier 3 structures are physically doubtful.** Pump room, desalination and filtration
    units are co-located and covered; Romain believes MMC made an error [00:31:12].
    Design so tier 3's absence is invisible.
20. **"What they grew last year" is explicitly out of this version** on the farm page
    [01:28:16], while "what they are growing now" is in.

**Framing and delivery, outside the UI**

21. **The PowerPoint is generated from the mockup** [00:52:01]. The screenshot pipeline
    is part of the deliverable — a redesign that breaks it costs us the review artefact.
22. **The Azerbaijan producer demo is roughly ten days out** [01:32:38], showing the web
    platform live and the farmer app as slides, on anonymised Abu Dhabi data. The mockup
    cannot be mid-surgery on that date.
23. **Mark's guidance on how to talk to MMC** [00:01:18]: give prescriptive advice —
    "merge these three into one button" — rather than a list of observations. That shapes
    the document going to MMC on Monday.
24. **Crop monitoring is really classification** [00:07:51]. Mark noticed it and let the
    name stand; useful to know when writing client-facing copy.
25. **Land use was examined as a separate top-level item and deliberately kept joined**
    to structures [00:08:25]–[00:11:00]. Worth knowing the option was tested.
26. **Canopy health "per tree cluster" is being interpreted as "per farm"** [00:57:22].
    That is our reading of MMC's deliverable, not their wording, and it should be stated
    to them explicitly.
27. **Field offices (~40) are deferred because no farm-to-office mapping exists**
    [01:02:16] — a data gap rather than a design choice, and one someone could close.
28. **Crop production on the overview is deferred because the measurement window is
    unclear**, not because it lacks value [00:42:36].
29. **The inspector tablet** already runs a questionnaire feeding an AI report generator,
    and Mark expects the farm page to feed it eventually [00:18:33]. Worth shaping the
    farm export around.

---

## 18. Open questions

**For Mark**

1. Crop location, crop classification and cultivated area — one sub-page or three?
   *Recommendation: one.* They describe the same objects at the same moment.
2. Which two figures join farm count and dunums in the overview's four headline slots?
   *Suggestion: cultivated dunums, and crops in season this month.*
3. Structures change — quarter-on-quarter, year-on-year, or both?
   *Recommendation: both, with quarter as the default view.*
4. Fallow land — land use, crop monitoring, or both?
   *Recommendation: Land Use reports the class; Crop Monitoring owns detection and
   change; each links to the other.*
5. Irrigation Efficiency and Crop Water Calculator — confirm they stay separate.
6. Crop coverage — a per-crop, per-month chart rather than a map?
7. Does the overview map carry any colour at all, or bubbles and boundaries only?
   *Reading the transcript literally: bubbles and boundaries only.*
8. Tier 3 structures — proceed showing tier 1 and 2 only, with tier 3 appearing later if
   MMC delivers it?

**For us**

9. Keep or drop the activity/news bell? It is unrelated to any deliverable.
10. Sub-pages in the sidebar (recommended, and how Mark framed the question) or as tabs in
    the page header?
11. Small build step, or stay entirely buildless? *Recommendation: small build.* §15.3.
12. Arabic / RTL — decide now, before the layout hardens, with production a month away.
13. Design target of 500 farms or 25,000?
14. Does the double-click-to-run property still matter enough to protect? *I think yes,
    and the recommended build keeps it.*

---

## 19. Suggested sequencing

Two tracks, because two different things are due at two different times. The document to
MMC needs structure and content, not a finished mockup; the demo needs a mockup that
runs.

**Track 1 — what Monday needs (structure only)**
- New navigation, names and order.
- The removals: violations, flood irrigation, health composite, MMC leftovers.
- A rough layout stub for each of the twenty-two pages: header, filters, the figures it
  will carry, the tables it will carry. Deliberately unfinished.
- Regenerate the deck from those stubs.

This is close to what Romain promised on the call, and it is enough for Mark to review
the *mindset* of each page, which is what the last review turned out to be about.

**Track 2 — the build, in the order that unblocks the most**
1. **Data foundations.** Province assignment, quarterly and annual history, monthly crop
   presence, water and yield numbers, revised taxonomy. Invisible, and everything waits
   on it.
2. **The shell.** Scrolling layout, two-level router, region and taxonomy filters in one
   selection object, serialised into the URL.
3. **The two archetypes** as real components, plus the summary table, the change table
   and the chart helpers.
4. **Overview**, rebuilt as inventory.
5. **Crop Monitoring**, complete, as the pattern-setter — it is the module Mark discussed
   most and its three sub-pages exercise both archetypes.
6. **Tree Monitoring**, next, because it is the largest module and the one to demo.
7. The remaining three modules through the template.
8. **Individual Farms** — register, profile, corrective actions — and retire
   `farm-analysis.html`.
9. Regenerate the deck.

The demo in ten days falls somewhere around step 5. Keeping every step independently
demoable matters more than usual for that reason.

---

## 20. Risks worth naming early

- **The change and trend pages have no data to stand on.** Roughly a third of the new
  pages are period-over-period comparisons and we hold a single snapshot. The mock
  generator can fabricate history convincingly, but it should be honest about being a
  simulation, and the real platform will show empty change pages for its first two
  quarters. That is a client-expectation conversation, not only an engineering one.
- **Twenty-two pages is a large surface for a month.** The two archetypes are what make
  it feasible. If the archetypes drift into bespoke pages, the schedule goes.
- **Tier 3 structures may never arrive**, and part of the October rollout narrative leans
  on structures. Better to design as though it will not.
- **The demo window overlaps the rebuild.** Keeping `main` demo-ready while the redesign
  lands on a branch is worth the small overhead.
- **Arabic decided late is Arabic decided expensively.** The layout is about to set.
- **The mockup is the argument.** Its credibility comes from running. A long period where
  it is half-migrated costs us the thing that has been working.
