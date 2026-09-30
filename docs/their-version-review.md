# Review of the team's version ("RASAD")

**What:** a review of the other team's ADAFSA platform, and how it compares with this mockup.
**Their site:** https://remix-adafsa-geoportal-sovereign-agro-intelligenc-9719.ai.studio/
**Checked on:** 30 September 2026, in a real browser, every screen, English and Arabic, desktop and phone.
**Measured against:** Wafra Greentech quote MMC-ADAFSA-005 (20 July 2026, marked-up copy).
**Written for:** people who read English as a second language. Short sentences on purpose.

Screenshots are in `docs/their-version/`.

---

## 1. The short answer

- Their site **looks** very good. It looks like a real ADAFSA product. It has Arabic, a logo, exports and search.
- But **the numbers do not agree with each other**, and some do not agree with the contract.
- The farm map is **not a real map**. It is a drawing, and it shows place names from **India** for every farm (screenshot 02).
- Many buttons **do nothing**. Many labels say things are "live" or "connected" when nothing is behind them.
- The six things ADAFSA pays for (the six modules) are **not in the menu**. The menu is the same as the old MMC platform.
- It has only **15 farms** of real detail. The big totals (24,082 farms, 33 million trees) are typed in by hand.

**Our advice:** keep their look, their Arabic, their Reports page and their search. Replace their data layer, their map and their menu with ours. In 4 weeks this is possible, if they do not try to fix everything.

---

## 2. What their site has

One web address. No page has its own link. No login.

| Screen | What it shows |
|---|---|
| Executive View | Big numbers for the whole emirate: farms, fields, trees, cultivated / fallow / barren land, structures. Three tabs: Open Agriculture, Protected Agriculture, Structures. A tree-species table. A cluster map. |
| Farm | A "map" with layers, 4 number boxes, 3 share bars (land use, crop type, trees), 6 module cards, a ranking of 15 farms (top and low performers), CSV and GeoJSON buttons. |
| Farm Monitoring | One farm at a time. A "satellite map" with NDVI / NDWI / SAVI / True Colour switch, a strip of satellite passes (S1, S2, cloud %), 4 number boxes, a table of fields. |
| Reports | 6 tabs: Farm, Field, Structure, Date Cultivar, Crop, Water & Irrigation Quota. Each is a table with CSV export. One GeoJSON export. |
| Raise Ticket, Contact Us, Feedback, Account and Settings | Support forms. They do not send anything. |
| Header | Region menu, global farm search, EN / AR switch, notifications bell, user name. |

It is a front-end only. After the page loads, **no click asks a server for anything**. There is no data service and no API behind it.

---

## 3. The Good

Things they did well. Several of these we should copy.

1. **It looks official and finished.** ADAFSA logo, Arabic and English platform name, calm colours, one consistent style. A client will trust it on first sight.
2. **Arabic works.** The EN / AR switch turns the whole layout right-to-left. Menu and titles are translated. Nothing breaks the page width (screenshot 04). **We have not built this yet.** It is a contract need.
3. **The Executive View answers "what do we have and where".** Farms, fields, trees, cultivated area, fallow area, structures. This is the same idea Mark gave us: production capacity, not plant health.
4. **The Structures tab uses the contract's taxonomy.** Residential, Labour Housing, Machine Storage, Animal Enclosures and so on. It shows both hectares and dunums.
5. **A Reports page with exports.** Six tables, each with a CSV, plus GeoJSON. File names are clear. The contract asks for exports (Data Exchange Framework). We only have CSV on some tables, and no Reports page.
6. **Global search in the header.** Type a farm name or ID and see region, crop, area and IER in the list. We have search inside tables, but no search box for the whole platform.
7. **A clear "needs attention" list.** "Top performing" and "Low performing (attention needed)" with region chips. A manager understands this in one second.
8. **Data freshness is visible.** Each farm shows "latest satellite pass" and "next pass". The idea is right: a user must know how old a number is. (But see Bad 5: the dates are fake.)
9. **The 15 sample farms agree with themselves.** Farm 218 shows 726.5 t, IER 86 and 412.6 dunum on the Farm page, in Reports, in the GeoJSON and in Farm Monitoring.
10. **Fast and clean.** About 2.6 seconds to load. No errors in the browser console. No secret keys in the code.

---

## 4. The Bad

Things that are wrong but can be fixed.

1. **The six modules are not in the menu.** The menu is Executive / Farm / Farm Monitoring / Reports, then four support items. This is the old MMC menu we already criticised. ADAFSA pays for six modules. They must see them on the left of the screen. In their site the modules are only small cards in the middle of the Farm page.
2. **Farm Monitoring is built for a scientist, not an official.** Satellite codes (S1, S2, S3), cloud cover %, pass times to the second, NDVI / NDWI / SAVI switches. Our review found this exact problem in the old platform. Officials are not GIS analysts.
3. **No links to a view.** Every screen has the same web address. A user cannot bookmark a farm, or send a page to a colleague, or paste it in an email.
4. **Many controls do nothing.** The region menu changes only its own label. HRI Imagery, the Hectares setting, Log Out, map drag and map zoom do nothing. Enter in search does nothing. The IER, Crop and Yield "drill-downs" all open the same table. Ticket and Feedback send nothing (one shows a fake "Dispatched" number).
5. **"Live" claims with nothing behind them.** "System Sync: Connected", "100% Boundary Verified", "100% telemetry verified", "next acquisition in 5 days" (most of those dates were already in the past when we checked), notification times like "14m ago" written into the code. "18,442 bio-acoustic sensors active" and soil salinity in dS/m: the contract has no sensors and no soil salinity.
6. **The IER bands are not the contract bands.** Their site uses 4 words: Excellent, Good, Moderate, Low. The contract has 5: Excellent 90–100, Good 80–89, Acceptable 65–79, Poor 50–64, Critical below 50. Example: their IER 78 is "Good"; in the contract it is "Acceptable". There is no IER-65 subsidy list, which the contract names.
7. **Canopy health is NDVI %.** The contract defines the Canopy Health Index as NDRE×40% + EVI×35% + NDWI×25%. Their pages call NDVI "canopy health".
8. **The water rule is wrong.** Their site flags any negative balance as "overdraft". The contract flag is: estimated use is **more than 25% above** crop demand. One figure says "Net Balance −282 k-m³" and next to it "Within conservation target".
9. **Phone width does not work.** At phone size the side menu stays open and takes most of the screen (screenshot 05).
10. **Accessibility is weak.** No ARIA labels at all. Hundreds of text items at 10 px or smaller. Hard to read for many people, and a problem for a government site.
11. **Arabic is only partly done.** Some text stays English, coordinates are broken, dates are reversed.
12. **Exports are thin.** GeoJSON has only farm centre points, no boundaries. The land-use GeoJSON repeats one coordinate. "Export Farm Dossier" is a CSV with one row. No PDF, no Shapefile. All of these are in the contract.

---

## 5. The Ugly

Things that would hurt trust with ADAFSA if the client saw them. Fix these first.

1. **The farm map shows India.** On Farm Monitoring, every farm — in Al Dhafra, Al Ain or Abu Dhabi — sits among "Kothari Sugarcane Factory", "Sri Kailasanathar Temple", "Kattur" and "Mettuppatti". These are places in Tamil Nadu. They are written into the code. There is no satellite image; the NDVI / SAVI / True Colour switch changes only the label (screenshot 02). **If an ADAFSA official sees this, the demo is over.**
2. **The totals contradict each other.**
   - Farms: 24,082 (Executive) — 25,000 (Farm cards) — 494 (Farm number box) — 25,563 (contract).
   - Land: 268,800 ha in total, about 11 ha per farm. The contract says 89,470 ha and 3.5 ha per farm.
   - Palms: 27,995,584 palms on 24,100 ha. That is 1,161 palms per hectare. Real groves have about 100–150. Not possible.
   - Stressed and critical trees: 3.5 million on the Executive View, 6.54 million on the Farm page.
   - Structures: "54,320 units", and this count includes 4,120 km of roads.
3. **The same farm has different fields on different screens.** Farm 218 on Farm Monitoring: five fields, all exactly 82.5 dunum, all "145.3 tonnes". The same farm in the Field Report CSV: 148.2, 96.4, 84.6, 52.1 and 31.3 dunum.
4. **It gives irrigation advice.** Example: *"Increase pivot delivery by 12% between 19:00 – 04:00."* The contract sells Modules 4 and 6 **"without prescriptive irrigation advice"**. Farmer advisory is a Phase 2 item, with an extra charge. The screen promises something that is not sold.
5. **Sovereignty and security.**
   - The ADAFSA logo is loaded from a **newspaper's server** (`cdn1-m.alittihad.ae`). If that paper moves the file, the logo disappears. It also tells that server every time someone opens the platform.
   - It is hosted on a Google AI Studio "remix" address. The contract says data is hosted in the AWS UAE region. The name says "Sovereign" everywhere.
   - No login. Anyone with the link is "Dr. Tariq Al-Nuaimi, Senior Agronomist".
6. **Numbers look real but are invented, and nothing says so.** Our mockup says on the first page that scores are generated. Their site presents made-up numbers as "verified". Mark's rule: *"Can I quote this number?"* — a user will quote these, and they are wrong.

---

## 6. Side by side

| Topic | Their site | Our mockup | Better |
|---|---|---|---|
| Look and brand | Official, ADAFSA logo, bilingual name | Clean, plain, no ADAFSA branding | **Theirs** |
| Arabic / right-to-left | Works (partly translated) | Not built (layout is ready for it) | **Theirs** |
| Menu shows the six modules | No | Yes, each with 2–3 sub-pages | **Ours** |
| Landing page | Executive View: inventory numbers | Overview: inventory numbers, count map, two distribution tables | Same idea. Ours has checked numbers; theirs has the look |
| Numbers agree across pages | No (see Ugly 2 and 3) | Yes — one `query()` function, checked by tests | **Ours** |
| Real farm shapes | No — hand-drawn, India place names | Yes — 500 real survey farms, real map (Leaflet) | **Ours** |
| Number of farms with detail | 15 | 500 (tables built for 25,000) | **Ours** |
| Emirate → province → farm | Region chips on some lists; region menu does nothing | Everywhere, one filter bar | **Ours** |
| Crop / tree taxonomy filter | No | Yes — six groups, with varieties | **Ours** |
| Change over time (seasonal crops, annual trees, IER trend, structures) | No | Yes — change pages with a designed "waiting for history" state | **Ours** |
| Fallow land | One number | Three states (cultivated / resting < 1 year / resting > 1 year) | **Ours** |
| IER bands and IER-65 subsidy list | Wrong bands, no list | Contract bands exactly, subsidy list with CSV | **Ours** |
| Over-allocation rule (> 25%) | Wrong rule | Contract rule | **Ours** |
| Per-farm page | Scientist view (satellite codes, cloud %) | Plain farm profile and a list of findings | **Ours** |
| Links to a view | None | Every view has its own link | **Ours** |
| Global search | Yes, in header | Only inside tables | **Theirs** |
| Reports / exports page | Yes — 6 CSV tables + GeoJSON | No page; CSV on tables | **Theirs** (but add boundaries, PDF) |
| "Needs attention" list | Clear top / low lists | Ranked tables in each module | Both good. Theirs is quicker to read |
| Data freshness shown | Yes (fake dates) | No "as of" date | **Theirs** as an idea |
| Honest about invented data | No — says "verified" | Yes — says generated | **Ours** |
| Irrigation advice | Yes (against the contract) | No (only "what to check" for inspectors) | **Ours** |
| Phone width | Broken | Has phone-width layout rules (not tested in this review) | Probably ours |
| Colour and accessibility | Small text, no ARIA | Checked colour palette, labels on every colour | **Ours** |
| Support | Ticket, Contact, Feedback, Settings (none work) | One Support page | Theirs has more; none of it works |

---

## 7. What we should take from them

In order of value.

1. **Arabic / RTL.** Their switch and their Arabic text are a head start. Take the translations, and fix the parts they missed.
2. **The branding.** Logo lockup, bilingual platform name, the official look. Host the logo ourselves.
3. **A Reports page.** One place for all exports. Build it on our `query()` so exports match the screens. Add farm boundaries (GeoJSON), Shapefile and a PDF monthly summary, as the contract asks.
4. **Global farm search in the header.** Search by farm ID or name, jump to the farm profile.
5. **A freshness line on every page.** "Data as of 22 Sep 2026 · updated monthly". Use the contract's update rhythm per module (crops monthly, trees quarterly, IER weekly, water weekly/monthly). Only show real dates.
6. **The Structures breakdown in both ha and dunum**, as on their Executive View.
7. **The "top / low performers" cards** as a quick summary above our ranked tables.

---

## 8. What they should take from us

1. **The menu: six modules, each with its sub-pages.** This is a commercial point. ADAFSA must see what it pays for.
2. **One source for every number.** One data function, used by every page, with tests. This fixes all the contradictions in Ugly 2 and 3.
3. **Real farm shapes on a real map.** Use real boundaries and a real base map. Delete the drawn map and every India place name.
4. **Contract rules, exactly.** IER 5 bands and the IER-65 subsidy list. Over-allocation at > 25% above demand. Canopy Health Index as defined in the contract. Fallow land in three states.
5. **Links for every view.** Page, region, filters and farm in the web address.
6. **The farm profile, in plain words.** No satellite codes or cloud % for officials. Keep those for a hidden expert view if at all.
7. **Change pages** for seasonal crops, annual tree change and IER quarterly trend — all named in the contract.
8. **Honesty.** Remove "Connected", "Verified", sensors, soil salinity and every irrigation instruction. Say clearly when data is a demo.

---

## 9. What neither version has yet

The contract asks for these. Nobody shows them. Worth planning together.

- **Flood irrigation detection** (Module 4). It has its own accuracy target (82% at M3, 90% from M6).
- **Accuracy panel.** Payment depends on accuracy at M3, M6, M9, M12 on 20 farms. A small panel "target / measured / next survey" would show the contract's own scoreboard.
- **PDF monthly report** and **milestone accuracy reports**.
- **REST API** (JSON per farm) and **Shapefile** export.
- **Yield trend map** and **district production forecast** (Module 5).
- **Water per crop for tariffs** (Module 6) — ours shows water per crop, but not the tariff purpose.
- **User accounts and login.** The contract says the Service Provider gives ADAFSA staff accounts.
- **Tier 3 structures.** The marked-up quote now measures Tier 3. Our page says Tier 3 is not available. This must be settled with Mark.
- **Protected agriculture.** The marked-up quote struck it out. Their site has a full tab for it, and our Land Use page still shows greenhouses. Decide in or out.

---

## 10. A 4-week plan for them

They cannot do everything. This order fixes the things that break trust first, then the things the contract names.

**Week 1 — stop the damage (must do)**
- Remove the drawn India map and all Indian place names. Until a real map is ready, show a plain farm outline or no map.
- Remove fake live claims: "System Sync: Connected", "100% Boundary Verified", "telemetry verified", sensors, soil salinity, fake notification times, past "next pass" dates.
- Remove every irrigation instruction. Replace with neutral findings ("Water use 25% above demand").
- Host the ADAFSA logo themselves.
- Hide or remove buttons that do nothing (region menu until it works, Log Out, HRI Imagery, Hectares, fake ticket number).

**Week 2 — one set of numbers (must do)**
- Put every number behind one data source. Take ours (`src/data/store.js`, `query()`), or copy the idea.
- Use the contract's figures: 25,563 farms, about 35 dunum per farm. Make every total a sum of farm rows, not a typed number.
- Use the contract IER bands (5 bands) and add the IER-65 subsidy list. Use the > 25% over-allocation rule.

**Week 3 — the menu and the map (must do)**
- Change the menu to the six modules. Their Executive View becomes the Overview. Their Farm Monitoring becomes the farm profile, in plain words.
- Use real farm boundaries on a real map (Leaflet or similar), as in our mockup.
- Put the page and the selected farm in the web address.

**Week 4 — finish and polish (should do)**
- Reports page: add farm boundaries in GeoJSON and one PDF summary.
- Finish the Arabic (missing text, dates, coordinates).
- Phone width: let the side menu collapse.
- Raise small text to at least 12 px; add labels for screen readers.

**Later (after 4 weeks)**
- Change pages (seasonal, annual trees, IER trend). Flood detection. Accuracy panel. API. Login.

---

## 11. Questions to settle with Mark

1. Which version is the base for production? Our advice: our data layer and structure, their look and Arabic.
2. Tier 3 structures: in the contract now, or not? The two versions and the quote disagree.
3. Protected agriculture: in or out?
4. Module names: contract names ("Yield Forecast") or ours ("Yield Optimisation")? We recommend the contract names.
5. Who owns the Arabic translations, and who checks them?

---

## Notes on how this was checked

- Every screen was opened in Chromium at 1440 px wide and at phone width (390 px), in English and in Arabic. About 60 screenshots were taken.
- All exports were downloaded and compared with the screens.
- The place names, the logo address and the "System Sync" text were checked in their published code.
- Some drill-downs (Tree Health, Structures and Water Calculator cards) were not fully tested. Tablet widths and colour contrast were not measured with a tool.
