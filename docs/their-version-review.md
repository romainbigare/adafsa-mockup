# Review of the RASAD mockup

The written companion to `presentation/RASAD_Wafra_Review.pdf`. The PDF is the short,
visual version to share with the team. This file keeps the detail behind it.

**What:** a review of the other team's ADAFSA mockup.
**Their mockup:** https://remix-adafsa-geoportal-sovereign-agro-intelligenc-9719.ai.studio/
**Checked on:** 30 September 2026, every screen, English and Arabic, desktop and phone width.
**Measured against:** Wafra Greentech quote MMC-ADAFSA-005 (20 July 2026, marked-up copy).
**Written for:** readers of English as a second language. Short sentences on purpose.

Both versions are mockups. Numbers are invented and some parts are hard-coded, on both
sides. That is fine, so this review does not judge the data. It looks at the user
experience, the layout, how the information is organised, and the levels of detail.

Screenshots are in `docs/their-version/`. The PDF source and its build script are in
`presentation/rasad-review/`.

---

## 1. The short version

The mockup already has a clear identity, a good first question (what do we have, and where?),
Arabic, a Reports page and a search box. The suggestions below build on those. They fall into
8 points, in the same order as the PDF:

1. **Give the six modules a place in the menu.**
2. **Separate the levels of detail** (emirate, module, one farm).
3. **Keep the Executive View focused** on capacity.
4. **Let the filters reach every page.**
5. **Add the direction of travel** (change over time).
6. **Write the farm page for an inspector.**
7. **Align the scores with the contract.**
8. **Use a calmer visual language.**

Then one idea that ties them together: **work from a common page frame.**

---

## 2. What works well, and is worth keeping

- **Arabic.** The EN / AR switch turns the whole layout right-to-left, and the menu and titles
  are translated. This is a contract need, and it is ahead of where our own mockup stands.
- **The first question.** The Executive View opens with farms and cultivated and fallow land:
  production capacity, not plant health. That is the right question for an agency.
- **A clear identity.** The ADAFSA lockup, a bilingual name and a steady green.
- **A Reports page.** One place with six tables to export. The contract asks for exports.
- **A search box in the header.** Type a farm name or ID and open the farm.
- **A "needs attention" list.** Top performing and low performing farms, with region chips.
- **A date on the data.** "Latest satellite pass" shows a user how old a number is.
- **Field level and short-period water.** One farm split into its fields, and water demand
  per day, week and month. These are useful for specialists, and have a place one level
  deeper (point 3.6).

---

## 3. The eight points

### 3.1 Give the six modules a place in the menu

**Found.** The menu has 8 items. Executive View, Farm, Farm Monitoring and Reports carry the
work, and 4 are support links. The 6 contract modules are reached through cards on the Farm
page, with one number each, so a module has no page of its own.

**Suggestion.** Give each module its own entry, with a small group of pages under it. The
existing screens keep their place: Executive View at the top, Farm Monitoring as the page for
one farm, Reports for exports. The 4 support links share one Support entry at the foot.

| Module | Pages | What is measured and shown |
|---|---|---|
| Crop Monitoring | Crops and area | Crop location and type. Cultivated area per farm and per crop, in dunums. |
| | Seasonal change | New and abandoned cultivation against the same season last year. |
| | Fallow land | Land ready for cultivation but not planted, per farm. Resting under or over 12 months. |
| Tree Monitoring | Tree count | Tree location and count. Species and variety: date palm cultivars, fruit, forest trees. |
| | Canopy health | Canopy Health Index per farm, palms and fruit trees apart. Farms under stress. |
| | Annual change | New plantings, removals and canopy loss against last year. |
| Land Use & Structures | Land use | Open and protected agriculture, structures and barren land, as area and share. |
| | Structures | Count and footprint by type: housing, storage, animal enclosures, utilities. |
| Irrigation Efficiency | Scores | IER score and band per farm, province averages, farms above the subsidy line of 65. |
| | Trend | Score by quarter. Farms that improved and farms that fell. |
| Crop Water Calculator | Monthly demand | Water demand per farm and per crop, in m³ per dunum. Farms more than 25% over demand. |
| | Season budget | Water per crop over its growing season, and per kilo harvested. |
| Yield Optimisation | Yield forecast | Tonnes per dunum per farm and crop. Farms below the crop average. Production by province. |
| | Crop calendar | When each crop is in the ground, month by month. |

### 3.2 Separate the levels of detail

**Found.** The Farm page holds a lot of useful content: land use, crop and tree shares, the 6
module cards and a ranking of farms. It is about 5,400 pixels tall, and it moves between the
whole emirate, one farm picked from a menu, and a list of 15 farms.

**Suggestion.** Keep the existing screens and give each one a single level. Almost everything
already has a home, so the work is mostly moving blocks.

| On the Farm page today | Moves to |
|---|---|
| Map, emirate figures, share bars | Executive View |
| 6 module cards and their detail tables | The 6 module pages, each card grown into a page |
| Ranking by health, yield, IER and water | Each module's farm table, as sortable rows |
| Water and yield for one farm | Farm Monitoring |

A table of rows (instead of 15 large cards) can be sorted, searched and exported, and it
still works at 25,000 farms.

### 3.3 Keep the Executive View focused

**Found.** The page leads with the right numbers, then holds a great deal more: fields, trees,
a tree split, barren land, structures, a tree species table, a canopy health bar, a dark header
card, three tabs and a map with its own layer panel. The dark card pulls the eye away from
everything below it. The tabs sit halfway down on the right, and switching between them moves
the page, so the reader loses their place.

**Suggestion.** Give the page one question: what do we have, and where? Four figures, one map
that counts farms, and two short crop tables whose rows open into their crops. Everything
else moves to the module that owns it, where it gets more room. The header card takes the same
light style as the rest of the page, and the tabs are replaced by the module pages.

| Stays on the Executive View | Finds a home in a module |
|---|---|
| Farms, farm area, land in production, crops growing this month | Tree count, tree split and species table → Tree Monitoring |
| One map of farm counts, in a neutral colour | Canopy health bar → Tree Monitoring |
| Crops by area, and crops by number of farms | Barren land, protected agriculture, structures → Land Use & Structures |
| | Field count → Land Use & Structures |
| | Farm and field boundaries → the farm page |

### 3.4 Let the filters reach every page

**Found.** The header has a region menu, which is the right place for it. Some lists add
region chips of their own, and there is no filter for crop or tree type, so share bars and
tables always show every type at once. Lists do not open from a crop group to its crops, or
from a crop to the farms that grow it, so "how many farms grow tomatoes in Al Ain?" has no
answer on any screen.

**Suggestion.** Build on the header. Next to the region menu, add a second menu for crop and
tree types. The groups come in a fixed order (cereals, fodder, open field, date palm, fruit
trees, forest trees), and each opens into its crops or varieties.

Both menus apply to the whole page: every figure, chart, map and table changes together, with
no apply button. The choice is kept in the page link and stays when somebody moves to another
page. Summary rows open into their parts, and every farm name opens the farm.

Two ways to go down:

- **By place:** emirate → province → farm centre → farm.
- **By type:** crop group → crop or variety → farms that grow it → farm.

Each page offers only the filters that change its answer. A switch that moves nothing is worse
than no switch.

### 3.5 Add the direction of travel

**Found.** Every number describes today. No figure says whether it went up or down since last
quarter or last year, there is no chart over time, and no list of the farms that changed. For
an agency, the direction is often the point: is fodder shrinking, is more land left fallow,
are farms irrigating better than a year ago? The contract names a seasonal change report,
annual tree change and a quarterly irrigation trend.

**Suggestion.** Two changes that work together:

- Every existing figure shows how much it changed, with a small trend line. One switch picks
  the comparison: last quarter or last year.
- Every module gets a Change view, as a page or a tab: a chart over time, the biggest movers,
  and the farms behind the movement, oldest to newest.

Crops, irrigation and yield use **6 quarters**, the shortest window that holds both a
last-quarter and a last-year reading. Trees and structures use **3 years**, because they change
slowly. Change views carry no map. Until there is enough history, the page says so plainly.

| Place in their mockup | What to add |
|---|---|
| Executive View, cultivated area | Change vs last year; link to the Crop Monitoring change pages |
| Executive View, fallow land | Three states (cultivated, resting under a year, resting over a year), with change vs last year |
| Executive View, trees | 3-year trend; link to Tree annual change |
| Executive View, structures | "+n new, −n removed vs last year"; link to structure change |
| IER ranking | Province average, "vs province", a "who got worse" list, a quarterly trend per province |
| Water card | Used vs allowed this month (the 25% rule); monthly demand across the year |
| Yield card | Harvest by quarter vs last year; yield vs the crop average |
| Farm Monitoring | A "what changed" block: land cultivated by quarter, IER vs last quarter, trees vs last year |

### 3.6 Write the farm page for an inspector

**Found.** Farm Monitoring brings a lot together for one farm, which is a good base. It opens
on satellite codes (S1, S2, S3), cloud cover to two decimals, pass times to the second, and
NDVI, NDWI and SAVI switches. These help a specialist. An inspector preparing a visit wants
three things: what the farm grows, how it is doing, and what to check. The farm cards also
give instructions to the farmer, such as "Increase pivot delivery by 12% between 19:00 and
04:00". Watering times, soil salinity and weather belong in the farmer's own app. The contract
presents Modules 4 and 6 without prescriptive irrigation advice.

**Suggestion.** Keep the page and change the order.

- **Profile:** the 4 figures already there, what the farm grows, its trees, what changed since
  last quarter.
- **What to check:** neutral findings, most important first, with a print button. For example
  "Water use 32% above crop demand this month", in place of a watering instruction.
- **Satellite detail:** the satellite strip, the indices and the field table, for the
  specialists who need them.

Nothing is lost. It moves one level deeper.

### 3.7 Align the scores with the contract

**Found.** A score needs one scale everywhere, or the same farm gets two verdicts.

| | Today | Contract |
|---|---|---|
| Irrigation efficiency | 4 bands: Excellent, Good, Moderate, Low (78 is "Good") | 5 bands: Excellent 90–100, Good 80–89, Acceptable 65–79, Poor 50–64, Critical below 50 (78 is "Acceptable") |
| Canopy health | NDVI percentage | Canopy Health Index = NDRE × 40% + EVI × 35% + NDWI × 25% |
| Water | Overdraft when the balance goes below zero | Over-allocation when use is more than 25% above crop demand |

Each one drives a real decision: who keeps a subsidy, which trees are stressed, which farm
uses too much water.

**Suggestion.** Define each score once, as the contract does, and let every screen read that
one definition: the name, the band edges, the words and the colours. Add a line at 65 for the
subsidy, with a list of the farms on each side. Give the Canopy Health Index one number per
farm, worked out separately for palms and fruit trees. Flag over-allocation each month, broken
down by crop, so it shows where the water goes.

### 3.8 Use a calmer visual language

**Found.** The product has a clear identity. On a single screen, though, green, teal, blue,
orange, yellow, purple and red all appear, often with no meaning: the small caption under each
figure has its own colour. Dark teal headers sit next to white cards. Almost every number is in
a coloured pill, every section opens with an icon in a tinted square, and many labels are
capitals at 9 or 10 pixels. Titles are long and abstract, and some lines make claims that
nothing on screen supports. When every part of a page is loud, the eye has nowhere to rest.

**Suggestion.** A short set of rules that every screen follows.

| Rule | In practice |
|---|---|
| Page | White cards on a light grey page. One header style. |
| Colour | Grey text. One green for actions and selection. |
| Status | The 5-step ramp (green to red), only where something is judged. |
| Crop groups | One colour each, in a fixed order. |
| Type | One font. 12 px at least. Sentence case. |
| Pills | For a status only. Icons in the menu only. |
| Unit | Dunum everywhere. Hectares in the export. |

| Title today | Suggested |
|---|---|
| Farm-Specific Water Demand & Sovereign Yield Telemetry | Water and yield |
| Farm Performance & Agronomic Ranking Intelligence | Farm ranking |
| Operations Domain & Interactive Deep Dives | Land use |
| Sovereign Agricultural Reports & Telemetry Audits | Reports |
| System Sync: Connected | Data as of 22 Sep 2026 |
| 100% Boundary Verified, sensor counts | Remove: a claim stays only if someone can explain it and give it a date |

---

## 4. A common page frame

Each screen has been designed on its own, so each brings its own layout, boxes and colours.
One shared frame settles most of the 8 points at once, and makes each new page cheaper to
build. Part of it exists already: the header holds the region menu, the search box, the
English and Arabic switch and the account.

- **Top bar:** the region and crop menus side by side, one search box for farms, the language
  switch and the account. A choice made here stays when somebody moves between pages.
- **Menu on the left:** the Executive View, the 6 modules, Farm Monitoring and Reports, with
  Support at the foot.
- **Context line** under the bar: the selection, the number of farms, the area and the date of
  the data, so somebody always knows what they are looking at and how fresh it is. Use the
  contract's rhythm: crops monthly, trees quarterly, structures monthly, IER weekly, yield
  monthly, water weekly or monthly. Show a date, not a clock time.
- **The page:** a strip of figures, a chart or a map, and a table. A new module becomes a set
  of figures, one chart and one table, rather than another page to design.

Because the frame is one piece, it also turns right-to-left for Arabic as one piece.

---

## 5. Ideas to bring across from their mockup

1. **Arabic and right-to-left.** Their switch and translations are a head start.
2. **A Reports page.** One place for all exports. Add farm boundaries (GeoJSON), Shapefile and
   a monthly PDF summary, as the contract asks.
3. **A search box in the header.** Farm ID or name, straight to the farm profile.
4. **A date on every page**, as in the context line above.
5. **An expert layer at farm level**: the Satellite detail tab in 3.6.
6. **The top and low performers summary**, as a short block above the ranked tables.

---

## 6. Not shown by either version yet

The contract asks for these, and they are worth planning together.

- **A monthly PDF report** (plus Excel or CSV), as the Data Exchange Framework says.
- **A REST API** (JSON per farm) and **Shapefile or GeoJSON** exports with farm boundaries.
- **Water per crop for tariffs** (Module 6): water per crop is shown, but not the tariff use.
- **Canopy health over time:** neither version shows whether tree health is improving.
- **Water history:** neither version shows water use month after month.
- **Crop production on the first page:** a good later step, once the measuring window is agreed.
