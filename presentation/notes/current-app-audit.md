# Current app audit — what's on screen today

**Source of truth:** `docs/design/current_website` — a raw DOM capture (114,049 characters, one line) of the production app, product name **"Map My Crop"**, taken while its "Farms Overview" page (the default/landing page) was open. Cross-checked against `mockups/original.jpg` (wireframe of the same screen). All quotes below are exact strings pulled from the DOM unless noted.

Page `<title>`: `Map My Crop`
Meta description: `Map My Crop revolutionizes agriculture with advanced imagery and AI, optimizing yields and promoting sustainability for farmers, enterprises, and governments globally.`
Framework fingerprint: Next.js static export (`__NEXT_DATA__` → `"page":"/","buildId":"J7CWxvwUfyienK48m-jV4","nextExport":true,"autoExport":true`), Material‑UI (`MuiDataGrid`, `MuiSvgIcon`, …) for the tables, and OpenLayers (`ol-viewport`, `ol-layers`, `<canvas>`) for the map.
On-screen page heading: `<h1>Farms Overview</h1>`.

---

## 1. Inventory (factual)

### Navigation
Sidebar `<nav>` grouped under four `<h4>` sub-headings, each item an `<li>` (not an `<a href>` — see §2):

- **FARM MANAGEMENT**
  - `Farms` — id `sidebar_Farms`, class includes `sidebaractiveClass` (i.e. this is the currently active/selected item, consistent with the page being "Farms Overview")
  - `Farm Monitoring` — id `sidebar_Farm Monitoring`
  - `Enterprise Information` — id `sidebar_Enterprise Information`
- **ANALYTICS & INSIGHTS** (label rendered as `" ANALYTICS & INSIGHTS"`, leading space in the DOM)
  - `Violations` — id `sidebar_Violations`. This is the only nav item with a trailing chevron-down `<svg>` icon next to it, hinting at an expandable submenu — but no submenu items are present anywhere in this DOM capture.
- **SUPPORT**
  - `Raise Ticket`
  - `FAQ`
  - `Status`
  - `Contact Us`
  - `Feedback`
  - (5 items — the wireframe compresses these to "Raise Ticket · FAQ" / "Status · Contact Us"; the live DOM has one more item, `Feedback`, that the wireframe omits)
- **SETTINGS**
  - `Account and Settings` (wireframe shortens this to "Account")
  - `Logout`

No breadcrumbs, no top search bar, no user-avatar/profile menu, no notification bell are present anywhere in the captured DOM (`grep` for notification/avatar/profile/breadcrumb returns nothing).

### The map and its layer system
The map card is titled **"Map Layers"** and sits in a fixed 260px-wide left column next to the map canvas (map card overall `style="height: 450px;"`, fixed). It lists exactly **6 toggles**, each built as `<label><span>{name}</span><button class="...rounded-full...">` — a custom switch component, **not** a native `<input type=checkbox>` or `<input type=radio>` and **not** grouped in a `<form>` or `fieldset`. There is no `role="switch"` or `aria-checked` on any of them.

| Layer (exact label) | Default state in this capture | Toggle CSS signature |
|---|---|---|
| `High Res Image` | **ON** | `bg-[#6D9300]` (green), thumb `translate-x-5` |
| `Land Use` | OFF | `bg-gray-300`, thumb `translate-x-1` |
| `Crop Type` | OFF | `bg-gray-300`, thumb `translate-x-1` |
| `Tree Type` | OFF | `bg-gray-300`, thumb `translate-x-1` |
| `Single Farm Land Use` | OFF | `bg-gray-300`, thumb `translate-x-1` |
| `Single Farm Tree Type` | OFF | `bg-gray-300`, thumb `translate-x-1` |

Exclusivity: cannot be structurally confirmed or denied from a static DOM snapshot — the six toggles are independent buttons, not a radio group, so nothing in the markup itself *prevents* stacking multiple layers on. What is verifiable is that in this captured state only one layer (`High Res Image`, the base imagery) is on and the other five are off, i.e. the panel behaves as a single-selection picker in practice even though it isn't built as one.

Below the toggle list: two buttons — `Clear All` and `Fit To Selection` (the latter styled as the primary green CTA).

Map controls (all icon-only buttons, stacked top-right of the map, `aria-describedby` pointing to rc-tooltip elements — only one tooltip text was actually captured in this DOM snapshot):
- An icon button with a 4-way "expand/contract corners" glyph (no tooltip text captured)
- An icon button with a crosshair/target glyph (no tooltip text captured)
- A stacked **`+` / `−`** zoom pair (MUI `AddIcon` / `RemoveIcon`)
- An icon button with a 3-layer stack glyph — tooltip text captured verbatim: **`"Show background map"`**
- A separate floating pin/`PlaceIcon` button, top-right, isolated from the other four

Clicking the "Show background map" control reveals a base-map switcher row (currently `hidden`/`opacity-0` in this DOM) with 4 labelled thumbnails:
`Street`, `Google` (marked default-active via class `btnBaseMapActive`), `Terrain`, `High Resolution`.

The rendered map surface itself is an OpenLayers canvas (`<canvas width="1156" height="808">`) — i.e. tiled imagery, not a vector basemap with clickable farm features exposed in this markup.

### KPI/stat surfaces
Three cards in a `grid-cols-3` row, each `cursor-pointer` with a hover highlight, but no href/route captured for what clicking them does:

| Label (exact) | Value (exact) | Icon (MUI testid) |
|---|---|---|
| `No. of Farms` | `494` | `GridOnIcon` |
| `No. of Fields` | `3,331` | `GrassIcon` |
| `Area` | `17,236` + unit label `dunums` | `LandscapeIcon` |

All three values match the wireframe exactly.

### Tables
Two tables in a `grid-cols-2` row, both built on MUI `DataGrid` (`role="grid"`), each with its own search box, sortable column headers, and a pagination footer (`Rows per page: 10`, prev/next arrows disabled because everything fits on one page).

**`Area Distribution by Land Use`** — search box placeholder `Search by class`. `aria-colcount="4" aria-rowcount="5"` (4 data rows + 1 header row). Column headers (exact `aria-label` / visible text, `data-field` in parentheses):

| Class (`classes`) | No of Farms (`noOfFarms`) | Area (dunums) (`area`) | Farm Area (%) (`percentage`) |
|---|---|---|---|
| Open Agriculture | 490 | 12,295.1 | 71.3% |
| Barren Land | 396 | 3,412.4 | 19.8% |
| Protected Agriculture | 458 | 982.8 | 5.7% |
| Structures | 150 | 518.5 | 3% |

**`Tree Distribution`** — search box placeholder `Search by tree type`. `aria-colcount="4" aria-rowcount="5"`. Column headers (exact):

| Tree Type (`treeType`) | No of Trees (`noOfTrees`) | Area (dunums) (`area`) | Percentage of Area (%) (`percentage`) |
|---|---|---|---|
| Date Palm | 137,812 | 2,822.1 | 16.1% |
| Fruit Trees | 462 | 23.9 | 0.1% |
| Forest Trees | 9,905 | 372.2 | 2.1% |
| Olive | 941 | 26.8 | 0.1% |

Note: the wireframe labels these columns simply "Farms"/"Trees", "Area (dun)", "%" — the live DOM's actual header strings are longer/more formal ("No of Farms", "Area (dunums)", "Farm Area (%)", "Percentage of Area (%)" — and inconsistent with each other: one table says "Farm Area (%)", the other "Percentage of Area (%)" for the equivalent column).

### Controls (consolidated)
- Map: pan/expand icon, locate/target icon, zoom `+`/`−`, background-map switcher (Street / Google / Terrain / High Resolution), a place-pin icon button
- Layers panel: `Clear All`, `Fit To Selection`
- Per-table: text search input, column-header sort buttons, column-header "..." menu button, rows-per-page selector (default `10`), prev/next page buttons
- Sidebar: collapse/expand toggle (`side-menu-button`), mobile hamburger menu (`mobile-menu-button`, only shown below the `lg` breakpoint)
- No export, download, print, or CSV/PDF control exists anywhere in the DOM (`grep` for export/download/csv/print/pdf returns nothing beyond an unrelated `.pdf`-less match).

---

## 2. Interaction model

The whole "Farms Overview" experience is **one single page** (`<main id="content">`) with no internal tabs, accordions, or step wizard: heading → map card with layer toggle panel → 3 KPI cards → 2 data tables, all stacked vertically and reached by scrolling. There is exactly one map instance on the page, and every layer toggle acts on that same shared map — there is no per-layer or per-module map.

Sidebar navigation items are `<li>` elements with `cursor-pointer`, not `<a>` tags. The only real `href` attributes in the whole DOM point to `#` (the mobile logo links) or to static assets (fonts, icons, `_next/static/...` build files) — there are **no internal route hrefs**. Combined with the Next.js `__NEXT_DATA__` payload showing a single static-exported `"page":"/"`, this indicates section switching is handled by client-side state, not by real URLs — i.e. **no hash routes, no deep links**: a user cannot bookmark or share a link to "Farm Monitoring" or to a filtered/zoomed map state; navigating away and back returns to this same default view.

Data is read, not queried or drilled into: the two tables are flat, paginated, single-level grids scoped to the whole portfolio (all 494 farms aggregated into 4 land-use classes / 4 tree types) — there is no row-level click-through to a single farm's own breakdown captured anywhere in the DOM (no per-row link, no modal trigger, no `onClick`-bearing anchor). The KPI cards are `cursor-pointer` with a hover affordance, but no destination is recorded in the static markup, so what (if anything) they link to cannot be verified from this source.

In short: the interaction model is **toggle a layer on the shared map, read the resulting imagery, and separately read two static aggregate tables below it** — there is no evidence in the DOM of filtering, cross-highlighting between the map and the tables, or navigating from an aggregate number down to an individual farm.

---

## 3. What the current app does NOT have (verified absences)

All of the following were checked by searching the full DOM text (case-insensitive) and confirming zero matches, or matches only in unrelated contexts as noted:

- **No aggregate score or status/verdict rollup.** No numeric or categorical "score", "health", "verdict", "risk", or "flag" field appears anywhere. The only DOM hit for "status" is the sidebar link `Status` under SUPPORT (a system-status/uptime page link, not a per-farm status).
- **No ranked "worst farms" list.** No occurrence of "rank", "ranking", or "worst" anywhere in the DOM.
- **No per-farm summary/dossier view.** No farm-detail panel, modal, or route is present; the two tables are portfolio-wide aggregates by class/tree-type, not by individual farm; no "profile" or "dossier" markup exists.
- **No legend tied to a score.** No `legend`-labelled element exists at all in the DOM (only the generic "Map Layers" panel heading, which is a layer picker, not a legend).
- **No plain-language status words** ("needs attention", "good", "at risk", etc.) — none found.
- **No Arabic/RTL support.** The `<html>` tag carries only `style="height: 100%;"` — **no `lang` attribute and no `dir` attribute at all**. The only `dir="ltr"` attributes in the whole document belong to a Google Translate browser-extension widget (`goog-gt-*` / `VIpgJd-*` classes) that was injected into the page by the browser, not by the app — i.e. the only way this page can be read in Arabic today is by using the browser's own translate feature, not a native language switch built into the product.
- **Mobile layout: partially present, not absent.** A mobile hamburger header (`<header ... lg:hidden>` with a `mobile-menu-button`) and a collapsible sidebar (`sidebar_sidebarlefttoogle`, Tailwind `lg:`/`md:` breakpoints) do exist, so it would be inaccurate to claim there is *no* responsive behaviour at all. However, the core data surfaces are pixel-fixed regardless of viewport: the map card is `style="height: 450px;"`, the layers panel is a fixed `w-[260px]` column, and each data table's scroll area is fixed at `width: 600px` (4 columns × 150px each) — none of these adapt to a narrow screen, so on mobile the map/layers/tables would require horizontal/vertical scrolling inside fixed-size boxes rather than reflowing.

---

## 4. Jargon and labels

User-facing strings that assume the reader already knows the domain/data model, quoted exactly as rendered:

- `Single Farm Land Use` / `Single Farm Tree Type` — the distinction between an aggregate "Land Use" layer and its "Single Farm" counterpart is not explained anywhere in the UI; a user has to already understand that the map has two different modes (portfolio-wide vs. one-farm) to know which toggle to pick.
- `dunums` — the area unit on the `Area` KPI card and both table headers is given with no definition or tooltip.
- `Farm Area (%)` vs. `Percentage of Area (%)` — the two tables use two different phrasings for what is presumably the same kind of figure (share of total area), inconsistent even within the same page.
- `Fit To Selection` — assumes the user knows layer toggling constitutes a "selection" that can be "fit" (zoomed to extent); no explanatory copy.
- `Clear All` — clear all *what*, specifically, is left implicit (presumably layer selections).
- `Classes` / `Class` (table column, land-use categories: `Open Agriculture`, `Barren Land`, `Protected Agriculture`, `Structures`) — presented as a flat list with no definitions of what distinguishes e.g. "Open Agriculture" from "Protected Agriculture".
- `High Res Image` — abbreviation, no expansion, and its relationship to the separate `High Resolution` base-map thumbnail option (in the hidden base-map switcher) is not clarified — there appear to be two different, similarly-named "high resolution" controls in different parts of the map UI (the `High Res Image` layer toggle, and the `High Resolution` basemap thumbnail).
- Five of the map's control icons (pan/expand, locate/target, and the place-pin button) carry no visible text label at all — only an SVG glyph and an `aria-describedby` id whose tooltip text was not present in this DOM capture, meaning a first-time user has only an icon to go on.

---

## 5. Scaling problem

The client contract is expanding from the current layer set to **six analysis modules**: Crop Monitoring, Palms & Fruit Trees, Land Use & Structures, Irrigation Efficiency, Yield Forecast, Water Allocation.

The current UI's only mechanism for adding a new kind of information is: **(a)** add another switch to the "Map Layers" list, and **(b)** add another paired data table below the KPI cards — that is the entire pattern established by the existing `Land Use`/`Area Distribution by Land Use` and `Tree Type`/`Tree Distribution` pairs. Applying that same, already-shipped pattern mechanically to 6 new modules:

- **Map Layers panel:** goes from 6 toggles to a **minimum of 12** if each new module gets just one toggle, or **up to 18** if each follows the existing precedent of also shipping a "Single Farm" variant (as `Land Use` and `Tree Type` already do) — all inside the same fixed **260px-wide** column that currently holds 6 rows. There is no grouping, search, or collapse mechanism in the current layers panel to manage a longer list — it is a flat, unpaginated `<div>` stack.
- **Data tables:** goes from 2 tables to a **minimum of 8** (one aggregate table per module, mirroring the existing pair), each bringing its own search box, 4-column header row, and pagination footer, all placed in the existing `grid-cols-2` layout — meaning **4 stacked rows of table-pairs** below the map instead of the current 1 row.
- **KPI cards:** if each module gets its own stat-card row like the current 3 (`No. of Farms`/`No. of Fields`/`Area`), that is **up to 18 more cards** (6 modules × 3), extending the existing `grid-cols-3` grid substantially.
- **Page length:** because the page is a single scrolling `<main>` with no tabs, accordion, or per-module routing (§2), all of the above stacks vertically on **one page**: a user would scroll past up to 18 layer toggles, then up to ~21 KPI cards, then up to 8 separate search-and-paginate data tables (16 individual column-header rows total) to get through what today is already three screen-fuls of content (map+layers, 3 KPI cards, 2 tables).
- **Basemap-independent imagery:** each module's own imagery (e.g. irrigation-efficiency maps, yield-forecast maps) would need to slot into the same single shared OpenLayers canvas via more entries in the same flat toggle list, since the DOM shows only one map instance on the page and no per-module map/frame structure exists to route new imagery into.

None of this requires speculation about what the six new modules *should* look like — it is the direct, mechanical consequence of replicating the exact toggle-panel-plus-paired-table pattern this page already uses, at 6x–9x the current scale, with no navigation, search, or grouping affordances in the current DOM to absorb that growth.

---

## Appendix — the Farm Monitoring page

**Source:** `docs/design/current_website-monitoring`, a raw DOM capture (211,990 characters, one line) of the same production app with the sidebar's `Farm Monitoring` item active (`id="sidebar_Farm Monitoring"` carries `sidebaractiveClass`). Captured 23 Jul 2026, 11:35 (matches the on-screen "Last Updated Time"). On-screen page heading: `<h1>Farm Information</h1>` — but unlike the Farms Overview page, this `<h1>` sits roughly a third of the way down the page, under the map and imagery carousel, not at the top; the very top of `<main>` goes straight into the farm/map-view pickers and the map with no page title above them at all. One sidebar discrepancy versus the Farms Overview capture: this DOM has only `Farms` and `Farm Monitoring` under FARM MANAGEMENT — `Enterprise Information` (present and `id`-tagged in the earlier capture) has zero matches here (`grep -c "Enterprise"` → 0); the wireframe still renders it, matching the shared-sidebar assumption documented in §1, but its absence from this specific capture is a genuine, unexplained DOM difference worth flagging rather than silently papering over.

**Controls, top of page (overlaid on the map):** a `Choose Farm` combobox (Headless UI, text input + chevron button, value empty in this capture) and a `Choose Map View` combobox, plus a disabled toggle switch (`role="switch"`, `disabled`, `aria-checked="false"`) whose only label is a hover `title="Basic Indices"` — a control that exists in the DOM but cannot be operated in this state.

**The map:** one OpenLayers canvas, same technology as the Farms Overview map. Controls stacked at top-right, each an `<img>` with a real `alt`/`aria-label` this time: `Fullscreen` ("View map in full screen"), `Zoom In`, `Zoom Out`, `zoom-to-location`, `scout-icon`, plus two more icon buttons with `aria-describedby` tooltips — one captured verbatim as `Show layers list`, the other not captured (same "one tooltip captured, rest blank" pattern as the Farms Overview audit). A separate `Opacity` icon (MUI `OpacityIcon`) sits below those. A pill button labelled `Legend` (`data-testid="map-legend-toggle-btn"`) floats bottom-right of the map. Unlike the Farms Overview capture, **no basemap switcher** (`Street`/`Google`/`Terrain`/`High Resolution`) exists anywhere in this DOM — verified by grep: zero hits for `Street`, `Terrain`, `High Resolution`, `btnBaseMapActive`; the only `Google` hits are the Google Translate widget and Google Fonts links, not app markup. One map info-popup was captured open, showing the exact fields `Label -`, `Range -`, `Area -`, `Info -` with values `Good Vegetation` / `0.35 to 0.40` / `0.0365 (ha)` / `Good vegetative growth with moderate coverage.`

**Imagery/date carousel** below the map: a multi-select (`react-select`, `id="satellite-select"`) showing the currently-chosen satellite codes as plain text `S7, S3, S1, S2, S5` (no option list present in this closed-state capture); a native `type="range"` **Cloud Cover** slider labelled `0%` / `Cloud Cover` / `100%`; and a `slick`-carousel (Previous/Next arrow buttons, text `Previous`/`Next`) of roughly 30 individual capture "chips", each showing a satellite code (`S1`–`S7`), a timestamp (`dd-Mon-yyyy hh:mm:ss`), and a percentage badge (cloud-cover %, ranging `0.00%` to `12.41%` in this capture).

**`Farm Information` stat row** — 8 cards, icon + label + value, exact labels: `Crop Growth` (`Excellent crop-growth`, score `94.50`), `Irrigation Efficiency Score` (`No Data`), `Total Area` (`74.21 dunums`), `Crop Name` (`Alfalfa`), `Crop Age` (`34 days`), `Yield Forecast` (`1.31 tons/acre`), `Tillage Type` (`Conservation Tillage`), `Watering Method` (`Sprinkler Irrigation`).

**`Current Weather` card:** heading + `Last Updated Time: 23 Jul 2026, 11:35` + a `Refresh` icon button (MUI `RefreshIcon`, three of these appear on this page — Current Weather, Day Forecast, Volumetric Soil Moisture — all built from the same `custom-button` component). A hero panel shows `30.30 °C`, `Thursday, 11:35`, `Clear`, `0 mm`; ten metric cards read `Rain`, `Current Rain (Beta)`, `Humidity`, `Vapor Deficit`, `UV Index`, `Clouds`, `Wind Speed`, `Wind Degree`, `Pressure`, `Dew Point Temperature`. A separate nowcast panel reads `No precipitation for at least 120 min` / `Expected forecast for the next 2 hours`, a ~120-minute bar timeline axis-labelled `Now`/`30 min`/`60 min`/`90 min`/`120 min`, and a legend row repeating the same sentence with a range `0–119 min`.

**`Advisory` card** (heading has an `AI` badge with a CSS shimmer animation) shows only the empty-state copy: `No advisories currently exist for this farm. Please check again later or select a different farm.` — no advisory content of any kind was present in this capture. **`Day Forecast`** card: `Refresh` button + a `Select Parameter` combobox + an empty `echarts` canvas (chart renders nothing in this DOM snapshot — the underlying data was not part of the static capture).

**`Crop Rotation` card:** an `Add Crop` button and a list of crop entries, each `<crop name> - Season 2026` with `<date> (sowing)` / `<date> (harvesting)` (one entry has harvesting `N/A`), and a `See More` link (`id="CropRotation_SeeMore_btn"`). **`Volumetric Soil Moisture & Temperature` card:** a `Refresh` button, label `Moisture Deficit - 156.2mm`, and a soil-profile graphic flanked by four depth bands (`0 - 7 cm`, `7 - 28 cm`, `28 - 100 cm`, `100 - 289 cm`) each carrying a moisture % on one side and a temperature °C on the other.

**`Crop Growth Phase` card** shows only an empty-state message: `The crop growth phase data is currently being processed. Please check back later or try again after some time.` **`Water Scheduler (Beta)` card** is the densest module on the page: a field-id hash, `Default · Clay Loam`, a status pill `🟠 HIGH`; a `SOIL WATER TANK - 0% full` gauge with `0%` / `60% target` / `100%` labels and three mini-stats `Root Zone Now`, `Target Fill`, `Water Needed`; a three-column row `Water Stress` (`60%`, `High stress`) / `Act Within` (`3 days`) / `Water Deficit` (`119 mm`, `0% now vs 60% target`); a `Proceed with irrigation` row with a `YES` pill; and a collapsed (`<details>`, no `open` attribute) `SAFETY CHECKS & TECHNICAL DETAILS >` panel holding roughly 20 raw key/value engineering fields (`Field Id`, `Priority`, `Urgency Hours`, `P1 Stress Score`, `P2 Fill Pct`, `P2 Safety Message`, `Mobile Summary`, `Is Waterlogged`, `Is Flood Risk`, `Is Conflicting`, etc.) — collapsed by default in the DOM, i.e. hidden from a first-time viewer unless they know to click it.

**`Growing Degree Day` card:** heading + a `Download chart` icon button (`id="Download_GDD_btn"`) + an empty `echarts` canvas, plus an inert (`display:none`-equivalent, no trigger fired) modal skeleton with a `Close modal` button that is not visible in the rendered page.

**`Multigraph` card:** two comboboxes (`Choose Map View`, `Choose Type`), two native `type="date"` inputs labelled `From Date` / `To Date`, and an empty `echarts` canvas.

**Bottom of page:** a premium upsell banner — `Premium Services` / `Get More Features and Insights with Premium Access` / `Upgrade Now` button (`id="Upgrade_btn"`).

**How a user operates this page:** pick a farm and a map-view layer from the two top comboboxes (or leave them on their placeholder text, as captured), read the map and the imagery-date carousel, then scroll down through a strictly linear, single-column-of-rows sequence of independent cards — stat row → weather → advisory → day-forecast → crop-rotation → soil-moisture → crop-growth-phase → water-scheduler → growing-degree-day → multigraph → upsell. Nothing on the page cross-links: selecting a date chip, a satellite code, or a layer is not shown (in this static capture) to filter or update any of the cards below it, and there is no tab, accordion, or in-page anchor nav to jump between the ten-plus cards — only linear scrolling, same interaction model as the Farms Overview page (§2 above).

**Verified absences (same method — full-text, case-insensitive grep, zero hits unless noted):** no export/download/CSV/print control anywhere except the one chart-specific `Download chart` button on Growing Degree Day (`export`/`csv`/`pdf` hits are all Next.js build metadata or an unrelated CSS library, not UI); no native `<select>` element on the page (every dropdown is a Headless UI combobox or a `react-select`, confirmed — `grep -c "<select"` → 0); no basemap switcher (see above); no row-level or module-level "compare farms" feature (`grep -i compare` → 0 hits); no aggregate health/risk score for the *page* as a whole (only the per-farm `Crop Growth` score and the `Water Scheduler`'s `HIGH` stress badge — both farm-specific, not portfolio-wide); the `SAFETY CHECKS & TECHNICAL DETAILS` panel is collapsed by default, so none of its ~20 raw fields are visible without a click that this static DOM capture does not record as having happened.
