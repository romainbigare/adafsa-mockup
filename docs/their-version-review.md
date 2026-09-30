# Review of the team's mockup ("RASAD")

**What:** a review of the other team's ADAFSA mockup, and how it compares with this mockup.
**Their mockup:** https://remix-adafsa-geoportal-sovereign-agro-intelligenc-9719.ai.studio/
**Checked on:** 30 September 2026, every screen, English and Arabic, desktop and phone width.
**Measured against:** Wafra Greentech quote MMC-ADAFSA-005 (20 July 2026, marked-up copy).
**Written for:** people who read English as a second language. Short sentences on purpose.

**What this review looks at.** Both versions are mockups. Numbers are invented and many
things are hard-coded, on both sides. That is fine. So this review does **not** judge the
data. It judges the user experience, the look, the layout, how the information is
organised, and the levels of detail — from the emirate down to one farm.

Screenshots are in `docs/their-version/`.

---

## 1. The short answer

- **The structure is the main problem.** The six modules ADAFSA pays for are not in the
  menu. Most content sits on one very long "Farm" page (screenshot 06).
- **There is no time.** A government official wants to know what is changing: more or
  less, better or worse, compared with last quarter and last year. Their mockup shows
  only "now". Our mockup has a change page in almost every module. This is the biggest
  gap (section 7).
- **No live filters, and no drill-down.** In our mockup, one filter bar on every page
  (region + crop / tree types) changes every number, chart, map and table at once, and
  you can go down from the emirate to a province to one farm, and from a crop group to one
  crop. Their mockup cannot answer a question like "how many farms grow tomatoes in Al
  Ain?" (section 8).
- **Mark already gave the answer to most of this.** His review of our first version asked
  for many of the same changes their mockup now needs (section 9).
- **The look is crowded and feels AI-made.** Too many colours, dark and light headers
  mixed, badges everywhere, very small text, and long "buzzword" titles (section 6).
- **Some things they did well**, and we should take them: Arabic, a Reports page,
  a global farm search, a clear "needs attention" list, and data dates on each farm.
- **Some content goes against the contract:** the IER bands, the canopy health measure,
  the water rule, and irrigation advice.

---

## 2. What their mockup has

| Screen | What it shows |
|---|---|
| Executive View | Big numbers for the emirate: farms, fields, trees, cultivated / fallow / barren land, structures. Three tabs: Open Agriculture, Protected Agriculture, Structures. A tree-species table. A cluster map. (screenshot 01) |
| Farm | One long page: a map with layers, 4 number boxes, water and yield boxes for one farm, 3 share bars (land use, crop type, trees), 6 module cards with one number each, a detail table, and a ranking of 15 farms as big cards. (screenshot 06) |
| Farm Monitoring | One farm: a satellite map with NDVI / NDWI / SAVI / True Colour, a strip of satellite passes (S1, S2, cloud %), 4 number boxes (health, yield, IER, water), a table of fields. (screenshot 02) |
| Reports | 6 tabs: Farm, Field, Structure, Date Cultivar, Crop, Water & Irrigation Quota. Each is a table with CSV export. (screenshot 03) |
| Raise Ticket, Contact Us, Feedback, Account and Settings | Four separate support pages. |
| Header | Region menu, global farm search, EN / AR switch, notifications, user name. |

---

## 3. The Good

1. **Arabic.** The EN / AR switch turns the whole layout right-to-left, and the menu and
   titles are translated (screenshot 04). We have not built this yet, and the contract
   needs it.
2. **The Executive View asks the right question.** Farms, fields, trees, cultivated area,
   fallow area, structures: "what do we have and where". This is the same idea Mark gave
   us — production capacity, not plant health.
3. **The Structures tab follows the contract's taxonomy.** Residential, Labour Housing,
   Machine Storage, Animal Enclosures and so on.
4. **A Reports page.** One place with six tables to export. The contract asks for exports
   (Data Exchange Framework). We have CSV on our tables, but no Reports page.
5. **A global farm search in the header.** Type a farm name or ID, see region, crop, area
   and IER, and open the farm. We only have search inside tables.
6. **A clear "needs attention" list.** "Top performing" and "Low performing (attention
   needed)", with region chips. Easy to understand in one second.
7. **Data dates on each farm.** "Latest satellite pass" and "next pass". The idea is
   right: a user must know how old a number is. We show no date at all.
8. **A field-level table and short-period water.** One farm split into its fields, and
   water demand per day, week and month. We have no field level, and our water is
   monthly and seasonal only. These belong in an expert layer (see Bad 2).

---

## 4. The Bad

1. **The six modules are not in the menu.** The menu is Executive / Farm / Farm
   Monitoring / Reports, then four support items. This is the old MMC menu. ADAFSA pays
   for six modules and must see them on the left of the screen. In their mockup the
   modules are only small cards in the middle of the Farm page, with one number each.
2. **Farm Monitoring is built for a scientist, not an official.** Satellite codes (S1,
   S2, S3), cloud cover %, pass times to the second, NDVI / NDWI / SAVI switches. An
   official does not read these. **But we do need these metrics somewhere.** Put them one
   level deeper: the farm page opens in plain words first (what it grows, trees, water,
   efficiency, what changed), and a "Satellite detail" tab holds the passes, the indices
   and the field table for the expert.
3. **No time evolution.** See section 7.
4. **One page does too much.** The Farm page is about 5,400 pixels tall. It mixes an
   emirate map, one farm's water and yield, share bars, six module cards, a table and a
   ranking of 15 big cards. There is no clear order from big picture to detail. A user
   does not know where to look first.
5. **No live filters and no clear levels of detail.** In theirs, some lists have region
   chips, some have a region menu, some have nothing. The crop and tree types cannot be
   used as a filter. See section 8.
6. **The IER bands are not the contract bands.** They use 4 words: Excellent, Good,
   Moderate, Low. The contract has 5: Excellent 90–100, Good 80–89, Acceptable 65–79,
   Poor 50–64, Critical below 50. Their IER 78 shows as "Good"; in the contract it is
   "Acceptable". There is no IER-65 subsidy list, which the contract names.
7. **Canopy health is NDVI %.** The contract defines the Canopy Health Index as
   NDRE × 40% + EVI × 35% + NDWI × 25%. Use the contract name and the contract
   definition.
8. **The water rule is wrong.** They flag any negative balance as "overdraft". The
   contract flag is: estimated use **more than 25% above** crop demand. Also, one figure
   says "Net Balance −282 k-m³" with "Within conservation target" next to it.
9. **Phone width does not work.** At phone size the side menu stays open and takes most
   of the screen (screenshot 05).
10. **Text is too small.** Hundreds of text items are 10 px or smaller. Many people cannot
    read them. Minimum 12 px, and 14 px for normal text.
11. **Rankings as big cards.** 15 farms shown as 15 large cards, each with its own dark
    button. This does not work for 25,000 farms. A sortable table is shorter and easier
    to scan.

---

## 5. The Ugly — remove these

1. **Words that claim things nothing supports.** "System Sync: Connected", "100% Boundary
   Verified", "100% telemetry verified", "100% registered holdings", "Master inventory
   surveyed", "18,442 RPW Bio-Acoustic Sensors Active", "Sentinel-2 10m Calibrated".
   These sound like AI filler. Officials will ask what they mean, and nobody can answer.
   Delete them.
2. **Features that are not in the contract.** Acoustic sensors and root-zone salinity
   (dS/m) are not sold. Do not show them.
3. **Irrigation advice.** Example: *"Increase pivot delivery by 12% between 19:00 –
   04:00."* The contract sells Modules 4 and 6 **"without prescriptive irrigation
   advice"**. Farmer advisory is a Phase 2 item, with an extra charge. Replace with a
   neutral finding, for example "Water use 30% above crop demand this month".
4. **Buzzword titles.** "Sovereign Ops", "Global Portfolio Metrics", "Operations Domain &
   Interactive Deep Dives", "Farm-Specific Water Demand & Sovereign Yield Telemetry",
   "Farm Performance & Agronomic Ranking Intelligence", "Sovereign Agricultural Reports &
   Telemetry Audits". An official wants "Water", "Yield", "Reports". Use short, plain
   titles.

---

## 6. Pointers to clean up the look

Their pages feel crowded and AI-made. The fixes are simple and mostly about taking
things away.

1. **One header style.** Today some sections have a dark teal header (Executive View,
   Farm Monitoring) and others are white cards. Pick one: white cards on a light grey
   page. Use dark only for the side menu, if at all.
2. **Few colours, and each colour means one thing.** Today green, teal, blue, orange,
   yellow, purple and red all appear on one screen. The small caption under each number
   has its own colour (green, blue, orange, purple) that means nothing. Rule: text is
   dark grey; one brand colour for actions and selection; a status ramp (green → red)
   **only** where something is judged (IER band, canopy band, over-allocation);
   category colours only for crop and land types, in one fixed order.
3. **Fewer badges and pills.** "112,400 plots", "Share 76.1%", "84.2%", "Optimal",
   "Advisory Active" — almost every number sits in a coloured pill. Keep a pill only for
   a status. Plain numbers are easier to read.
4. **Fewer icons.** Every section starts with an icon in a tinted square, then a title,
   then a grey subtitle. This is the typical AI template look. Keep icons in the menu
   only.
5. **One font.** Monospace is used for coordinates, dates, scientific names and captions.
   It makes the page look technical. Use one font; show numbers with tabular figures.
6. **One unit.** Many figures show hectares and dunums side by side. The contract uses
   dunum. Show dunum; put hectares in the export or a tooltip.
7. **No tiny capitals.** Many labels are 9–10 px, upper-case and letter-spaced. Use
   normal sentence case at 12–13 px.
8. **Short pages with a clear order.** Each page: 3–5 big numbers → one chart or map →
   one table. If a page needs more, it is two pages.
9. **Say it once.** The same number appears several times in different places (for
   example tree totals on the hero, the tree split bar, the species card and the species
   table). Show each number once, where it belongs.
10. **Tables over cards for lists.** A list of farms is a table: sortable, searchable,
    paged, with CSV.

Our mockup follows these rules (`src/domain/palette.js` holds the colour rules; the page
archetypes are in `docs/adafsa-redesign-scope.md` §4). They can reuse both.

---

## 7. Time evolution — the biggest gap

### Why it matters

A ministry does not only ask "what do we have". It asks **"is it going up or down, and
where?"** Is palm cultivation growing? Is fodder falling? Are farms irrigating better
than last year? Is more land left fallow? These are the questions that go into a memo or
a briefing. The contract asks for them too: *Seasonal Change Report* (Module 1), *Annual
Change Detection* (Module 2), *Quarter-on-Quarter Trend* (Module 4).

Their mockup shows only "now". The only time element is the satellite-pass strip on one
farm, which is about image dates, not about change.

### What our mockup shows over time

We compare in two ways only: **vs last quarter** and **vs last year**. Crops use a
window of **6 quarters** (the smallest window with both a last-quarter and a last-year
reading). Trees and structures change slowly, so they use **3 years**.

| Our page | What it shows over time | Window |
|---|---|---|
| Crop Monitoring — Cereals and fodder | Area per crop, stacked by quarter; change on a year ago; table of every crop by quarter; table of every farm (12 months ago → 3 months ago → now) | 6 quarters |
| Crop Monitoring — Open field crops | Area per crop by quarter; "which crops moved" (gains and losses); top producers of one crop; switch: vs last quarter / vs last year | 6 quarters |
| Crop Monitoring — Fallow land | Land in three states (cultivated, resting under a year, resting over a year) by quarter; change on a year ago per state | 6 quarters |
| Tree Monitoring — Annual change | Trees per group by year; biggest risers and fallers by variety; every variety vs 1 and 2 years ago | 3 years |
| Land Use & Structures — Change tracking | New, removed and net structures; structures per class by year; biggest movers; every farm before and now | 3 years, quarters in tables |
| Irrigation Efficiency — Trend | Average score by quarter, one line per province; farms that got worse / better; biggest drop | 6 quarters |
| Crop Water — Season budget | Water needed each month of the year, per crop group | 12 months |
| Yield — Forecast | Harvest per crop by quarter, vs a year ago | 6 quarters |
| Yield — Crop calendar | When each crop is in the ground, month by month; current month marked | 12 months |
| Farm profile | The farm's land in three states by quarter; irrigation score vs last quarter | 6 quarters |

Every one of these goes from emirate → province → farm, and from category → crop.

### How to fit it into their mockup

Two rules, so it stays simple:

1. **Every big number carries its change.** Under each figure on the Executive View and
   on each module card: a small line "▲ +3.2% vs last year" and a tiny trend line. The
   official sees the direction without opening anything. Clicking it opens the module's
   change page.
2. **Each module gets a "Change" page next to its "Now" page.** Same filters, same
   levels of detail. No map on change pages — a chart over time, the biggest movers, and
   a table of the farms behind the movement.

Concretely:

| Their place | Add |
|---|---|
| Executive View — cultivated area | Change vs last year; link to Crop Monitoring change pages |
| Executive View — fallow land | Split into three states (resting under a year / over a year), with change vs last year |
| Executive View — trees | 3-year trend; link to Tree annual change |
| Executive View — structures | "+n new / −n removed vs last year"; link to Change tracking |
| IER ranking | Province average, "vs province", and a "who got worse" list; a quarterly trend line per province |
| Water card | Used vs allowed this month (with the > 25% rule); monthly demand over the year |
| Yield card | Harvest by quarter vs last year; yield vs the crop average |
| Farm Monitoring (one farm) | A "what changed" block at the top: land cultivated by quarter, IER vs last quarter, trees vs last year |
| Everywhere | A switch: vs last quarter / vs last year |

### A note on empty history

The live platform will have no history for its first two quarters. A change page must
then say plainly "Not enough history yet — first comparison in Q1 2027", and not show an
empty chart. Our IER trend page has this state; every change page needs it.

---

## 8. Live filters and drill-down

### What our mockup does

**One filter bar, on every page, and it is live.** It sits under the page title. It has:

- a **region** menu: the whole emirate, or one of the three provinces (Abu Dhabi, Al Ain,
  Al Dhafra), plus a place for the farm centre;
- one **chip per crop or tree group**, in a fixed order: cereals, fodder, open field,
  date palm, fruit trees, forest trees. Click the name to turn the group on or off. Click
  the small arrow to open the group and pick single crops or varieties (for example only
  tomatoes, or only Khalas palms).

When the user changes a filter, **everything on the page changes together**: the big
numbers, the charts, the map and every table. Nothing needs a "search" or "apply" button.
The filter is also kept in the page link, so a filtered view can be sent to a colleague
exactly as it is.

Each page shows **only the filters that change its answer**. The cereals page offers
cereals and fodder; the tree change page offers palms and fruit trees; the fallow page
has no crop filter at all. A switch that changes nothing is worse than no switch.

**Drill-down, in two directions:**

- **By place:** emirate → province → farm centre → farm. On the maps, bubbles show the
  number of farms and split into smaller bubbles as you zoom in; on the tree map you see
  single trees, coloured by variety, once you are inside a farm. On the canopy and IER
  maps, a bubble shows the average of the farms under it, on the same colour scale at
  every zoom.
- **By type:** crop group → crop → farm. Summary tables open from a group (cereals) to
  its crops (wheat, barley). Farm tables open a row to show every crop on that farm. Every
  farm name opens the farm's own page.

This answers the everyday questions in two clicks: *"How many farms grow tomatoes in Al
Ain, and on how many dunums?"* — pick Al Ain, open "open field", pick tomatoes. *"Which
farms in Al Dhafra stopped growing fodder?"* — the cereals and fodder page, Al Dhafra,
fodder, sort the farm table by change.

### What their mockup does

- Region chips on some lists, a region menu in the header, nothing on other screens.
- No crop or tree filter. Share bars and tables show all types at once.
- No drill-down from a group to a crop, or from a crop to the farms that grow it.
- Filters are not kept in the link.

### What to change

1. Put **one filter bar** under the title of every page: region + crop / tree groups.
2. Make it **move everything on the page** at once.
3. Let each chip **open into crops and varieties**.
4. Make every summary row **open into its parts**, and every farm name **open the farm**.
5. Keep the filter **in the link**.

---

## 9. What Mark's reviews already tell us

Mark reviewed our first mockup in a long call (`docs/adafsa-mockup-review.md`), then
walked the next version screen by screen (`docs/monday-review-changes.md`). Many of his
comments were about the same problems their mockup has now. They are the best guide for
what to change, because they come from the person who speaks to ADAFSA. Times in
brackets point into the call transcript.

### Menu and structure

- **Support is one button, not half the menu.** *"More than half of these navigation
  buttons are about support"* [00:00:06]. Their menu has four support entries (Raise
  Ticket, Contact Us, Feedback, Account and Settings). Merge them into one "Support".
- **Three levels: overview → modules → individual farm** [00:04:27, 00:13:29]. Each level
  has its own page layout.
- **The agreed menu order:** Overview → Crop Monitoring → Tree Monitoring → Land Use &
  Structures → Irrigation Efficiency → Crop Water Calculator → Yield Optimisation →
  Individual Farms [00:15:51]. Their mockup should use the same names and order, so the
  two versions speak the same language to ADAFSA.
- **Each module is a group of sub-pages**, and almost every module has a **change
  tracking** sub-page [00:51:04, 00:54:27].
- **No violations** — ADAFSA agreed they are not tracked [00:00:06].

### The first page

- **Inventory, not health.** *"As a ministry or an agency, they want to track production
  capacity, not necessarily health. Health comes under farm-level analytics"* [00:35:31].
  Their Executive View is mostly inventory — good — but it also has an emirate-wide
  "Canopy Health & Vigor" bar, and the Farm page ranks farms by health first. Move health
  to the module and farm levels.
- **The map shows counts, with no colour.** Bubbles with the number of farms that split as
  you zoom, *"forget about the colours"* [00:26:31]. Their cluster map uses red bubbles,
  which reads as an alarm. Add province borders and major roads [00:32:13].
- **Two summary tables: crops by dunum, and crops by number of farms**, each opening from
  a group to a crop [00:26:54, 00:40:25]. *"Tomato season is starting, someone very quickly
  wants to know how many farmers are growing tomatoes this year and what's the size. You
  go to the home page for that"* [00:39:52]. Their Executive View has a tree species table
  but no crop table like this.
- **Province is political.** Each province is run by a member of the royal family, and
  *"sometimes they'd like the results for Al Ain, or the results for Al Dhafra"*
  [00:17:24]. The region choice must work on every page.
- **The taxonomy is a filter** [00:23:53]: cereals, fodder, open field, date palm, fruit
  trees, forest trees, in that order [00:37:37].

### Maps

- **Fewer maps.** *"There's a danger in too many maps. It's hard data"* [00:57:00]. No map
  on change pages, no yield map, no fallow map. Their mockup puts a large map on the
  Executive View, the Farm page and Farm Monitoring.
- **The tree map shows species only inside a farm** — every farm is a mix, so colouring a
  province by one species would be invented (Monday review, T1).

### Change over time

- **Change tracking on every module**, as hard numbers and a list of farms, not a map
  [00:54:27, 00:56:29].
- **Seasonal crop change:** *"who's growing tomatoes, what has increased, what has
  decreased from last year… give me the list of farms that have stopped growing tomatoes
  and grew them before"* [00:47:47].
- **IER trend:** *"I'd rather have a trend line. Raw numbers. And then list for me the
  farms that deteriorated"* [01:01:36] — last quarter's score, this quarter's score, and
  the change, sortable.
- **Structures:** even if only five structures change, *"they need to know right away"*
  [00:59:47].
- **No week-to-week comparison** — too small a change to mean anything [00:23:07]. We use
  last quarter and last year.

### Module by module

- **Trees:** count, species and variety on one page; **canopy health is one number per
  farm**, one for palms and one for fruit trees [00:57:22]; annual change on its own page.
- **Fallow land has three states:** cultivated; resting under 12 months; resting over 12
  months (Monday review, C4). Their mockup has one fallow number.
- **Irrigation efficiency:** score, band, and zone average, where **zone = province**
  [01:02:16]; a sortable table to find *"every farm in Al Ain that's flagged for priority
  intervention"* [01:00:16].
- **Yield:** no map. Per crop: the average yield and the share of farms below it, then
  farms ranked [01:03:50]. A **crop calendar** by month [01:04:50]. Production forecast
  at **province** level [01:03:50].
- **Water, in two pairs** [01:18:28 – 01:23:47]:
  1. *Operational:* monthly water demand → water per crop → **over-allocation flag,
     raised against the month** (by the end of the season it is too late to act).
  2. *Planning:* seasonal water budget per crop — *"an amazing tool for policy design"* —
     with **m³ per kilo** of harvest.
  Their mockup shows daily, weekly and monthly demand against a quota, but not the
  per-crop view, the monthly flag or the season budget.
- **Fruit trees are part of the water module**; forest trees are not [01:22:11].

### The farm page

- **Two pages per farm:** basic stats (crops, breakdown, irrigation efficiency), then
  corrective actions [01:25:24]. Mark's example: *"I'm the inspector, I'm going to visit
  my five farms… I get the profile, the list of issues"* [00:18:09].
- **No MMC farmer content.** Soil moisture, weather, crop growth phase and irrigation
  schedules are *"too much for government. It's not our deliverables. It'll be in the
  farmer app"* [01:27:36]. Their Farm Monitoring and advisories have exactly this kind of
  content (root-zone salinity, "increase pivot delivery between 19:00 and 04:00"). The
  satellite detail can stay one level deeper for experts (Bad 2), but the farmer advice
  must go.
- **Dates, not clock times.** Mark asked why the page showed "08:42". *"It would be more
  of a date than a time in real life"* [00:36:21]. Their pass times to the second
  ("05:25:47") are the same thing.
- **Farm centre next to every farm.** ADAFSA officers search by farm centre. Show the
  column and the filter even while the data is not there yet (Monday review, item 30).

### Things Mark removed — not gaps

- **Flood irrigation detection** — *"It was a mistake, it needs to be taken out"*
  [01:02:36].
- **Accuracy figures** — measured by sampling, outside the platform [00:53:56, 01:07:26].
- **The yield trend map** — *"I would rather not put the map. If they want it, we'll put
  it back in"* [01:02:57].
- **Structures tier 3** (pump room vs filtration vs desalination) — doubtful; tier 2 for
  the October rollout [00:30:24].

---

## 10. Side by side

| Topic | Their mockup | Our mockup |
|---|---|---|
| Menu shows the six modules | No | Yes, each with 2–4 sub-pages |
| Support in the menu | Four entries | One entry |
| Information structure | One long Farm page mixing all levels | Two page types: "Now" (numbers, map, tables) and "Change" (trend, movers, farms) |
| Change over time | None | 10 time views: 6 quarters for crops, IER, yield; 3 years for trees and structures |
| Filters | Region on some lists; no crop or tree filter | One live filter bar on every page: region + crop / tree groups, opening into varieties |
| Drill-down | None | Emirate → province → farm centre → farm; group → crop → farm; every farm opens its page |
| Landing page | Executive View: inventory numbers, plus an emirate health bar | Overview: inventory only, count map, crops by dunum and by farm |
| Maps | Large map on three screens | Only where the question is "where"; none on change pages |
| Per-farm page | Scientist view (satellite codes, cloud %, indices, farmer advice) | Plain farm profile, then a list of findings for an inspector visit |
| Field level | Yes (field table) | No |
| Satellite / index detail | Yes, up front | No — should be added one level deeper |
| IER bands, subsidy list, water rule | Not the contract ones | Contract bands, IER-65 list, > 25% rule |
| Fallow land | One number | Three states over 6 quarters |
| Water | Daily / weekly / monthly demand vs quota | Monthly demand and flag per crop; season budget and m³ per kilo |
| Arabic / right-to-left | Yes (partly translated) | Not built (layout is ready for it) |
| Global search | Yes, in header | Only inside tables |
| Reports / exports page | Yes, 6 tables | No page; CSV on every table |
| Data date shown | Yes, per farm | No |
| Link to share a view | No | Yes, every view and filter has its own link |
| Visual style | Crowded, many colours, dark and light mixed, small text | Plain, one colour rule, few badges |
| Phone width | Menu covers the screen | Has phone-width layout rules |

---

## 11. What we should take from them

1. **Arabic / RTL.** Their switch and translations are a head start.
2. **A Reports page.** One place for all exports. Add farm boundaries (GeoJSON),
   Shapefile and a monthly PDF summary, as the contract asks.
3. **Global farm search in the header.** Farm ID or name, straight to the farm profile.
4. **A data date on every page.** "Data as of 22 Sep 2026 · updated monthly" — a date,
   not a clock time. Use the contract's rhythm per module: crops monthly, trees
   quarterly, structures monthly, IER weekly, yield monthly, water weekly/monthly.
5. **An expert layer at farm level.** A "Satellite detail" tab on our farm profile:
   image dates, the indices, and a field table. Closed by default.
6. **The "top / low performers" summary** as a short block above our ranked tables.

---

## 12. What they should take from us

1. **The menu: six modules, each with its sub-pages,** in the order Mark agreed, and one
   Support entry.
2. **Time evolution** — section 7. A change page per module, and a change line under
   every big number.
3. **Live filters and drill-down** — section 8. One filter bar on every page that moves
   everything at once; emirate → province → farm; group → crop → farm.
4. **The page structure.** "Now" pages and "Change" pages, each short: figures → one
   chart or map → one table.
5. **An inventory first page**, with the two crop tables (by dunum, by farm) and a
   count-only map.
6. **The plain farm profile** first, with corrective actions on a second page, and the
   scientist view one level deeper. No farmer advice.
7. **Contract rules, exactly.** IER 5 bands and the IER-65 subsidy list; the > 25%
   over-allocation rule, raised against the month; the Canopy Health Index, one number
   per farm for palms and one for fruit trees; fallow land in three states.
8. **The visual rules** in section 6.
9. **A link for every view**, so a page can be sent to a colleague.

---

## 13. What neither version shows yet

The contract asks for these, and Mark did not remove them. Worth planning together.

- **Monthly PDF report** (plus Excel / CSV), as the Data Exchange Framework says.
- **REST API** (JSON per farm) and **Shapefile / GeoJSON** exports with farm boundaries.
- **Water per crop for tariffs** (Module 6): we show water per crop, but not the tariff
  purpose.
- **Canopy health over time:** neither version shows whether tree health is getting
  better or worse.
- **Water history:** neither version shows water use month after month.
- **Crop production on the first page:** Mark wants it later — *"the next table they'd
  like to see is the crop production"* [00:42:15] — once the measuring window is agreed.
