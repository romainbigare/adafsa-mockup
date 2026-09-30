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
5. **No clear levels of detail.** Our mockup always goes emirate → province → farm, and
   category → crop → variety, with the same filter bar on every page. In theirs, some
   lists have region chips, some have a region menu, some have nothing. The crop and tree
   taxonomy cannot be used as a filter.
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

## 8. Side by side

| Topic | Their mockup | Our mockup |
|---|---|---|
| Menu shows the six modules | No | Yes, each with 2–3 sub-pages |
| Information structure | One long Farm page mixing all levels | Two page types: "Now" (numbers, map, tables) and "Change" (trend, movers, farms) |
| Change over time | None | 10 time views: 6 quarters for crops, IER, yield; 3 years for trees and structures |
| Levels of detail | Mixed; no taxonomy filter | Emirate → province → farm, and category → crop → variety, on every page |
| Landing page | Executive View: inventory numbers | Overview: inventory numbers, count map, two distribution tables |
| Per-farm page | Scientist view (satellite codes, cloud %, indices) | Plain farm profile, plus a list of findings for an inspector visit |
| Field level | Yes (field table) | No |
| Satellite / index detail | Yes, up front | No — should be added one level deeper |
| IER bands, subsidy list, water rule | Not the contract ones | Contract bands, IER-65 list, > 25% rule |
| Arabic / right-to-left | Yes (partly translated) | Not built (layout is ready for it) |
| Global search | Yes, in header | Only inside tables |
| Reports / exports page | Yes, 6 tables | No page; CSV on every table |
| Data date shown | Yes, per farm | No |
| Link to share a view | No | Yes, every view has its own link |
| Visual style | Crowded, many colours, dark and light mixed, small text | Plain, one colour rule, few badges |
| Phone width | Menu covers the screen | Has phone-width layout rules |
| Support | Four pages (ticket, contact, feedback, settings) | One page |

---

## 9. What we should take from them

1. **Arabic / RTL.** Their switch and translations are a head start.
2. **A Reports page.** One place for all exports. Add farm boundaries (GeoJSON),
   Shapefile and a monthly PDF summary, as the contract asks.
3. **Global farm search in the header.** Farm ID or name, straight to the farm profile.
4. **A data date on every page.** "Data as of 22 Sep 2026 · updated monthly". Use the
   contract's rhythm per module: crops monthly, trees quarterly, structures monthly, IER
   weekly, yield monthly, water weekly/monthly.
5. **An expert layer at farm level.** A "Satellite detail" tab on our farm profile:
   image dates, the indices, and a field table. Closed by default.
6. **The "top / low performers" summary** as a short block above our ranked tables.

---

## 10. What they should take from us

1. **The menu: six modules, each with its sub-pages.** ADAFSA must see what it pays for.
2. **Time evolution** — section 7. A change page per module, and a change line under
   every big number.
3. **The page structure.** "Now" pages and "Change" pages, each short: figures → one
   chart or map → one table.
4. **One filter bar on every page.** Region, and the crop / tree taxonomy as chips that
   open into varieties.
5. **The plain farm profile** first, with the scientist view one level deeper.
6. **Contract rules, exactly.** IER 5 bands and the IER-65 subsidy list; the > 25%
   over-allocation rule; the Canopy Health Index; fallow land in three states.
7. **The visual rules** in section 6.
8. **A link for every view**, so a page can be sent to a colleague.

---

## 11. What neither version shows yet

The contract asks for these. Worth planning together.

- **Flood irrigation detection** (Module 4), with its own accuracy target.
- **An accuracy panel.** Payment depends on accuracy at M3, M6, M9 and M12 on 20 farms.
  "Target / measured / next survey" per module would show the contract's own scoreboard.
- **PDF monthly report** and **milestone accuracy reports**.
- **REST API** and **Shapefile** export.
- **Yield trend map** and **district production forecast** (Module 5).
- **Water per crop for tariffs** (Module 6): we show water per crop, but not the tariff
  purpose.
- **Canopy health over time**: neither version shows whether tree health is getting
  better or worse.
- **Water history**: neither version shows water use month after month.
