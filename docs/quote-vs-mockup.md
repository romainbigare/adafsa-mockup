# The quote and the mockup, side by side

Read against **Wafra Greentech Price Quotation MMC-ADAFSA-005, 20 July 2026**
(the marked-up copy, so the green insertions and red deletions are taken as the
current position). Twenty screens, six modules.

The purpose here is narrow: where does the mockup say something the quote does
not, and where does the quote promise something the mockup does not show. It is
a checklist for the next review, not a criticism of either document.

---

## 1. What already lines up

These are worth stating, because they are the parts nobody needs to reopen.

| Quote | Mockup |
| --- | --- |
| IER bands: Excellent 90–100, Good 80–89, Acceptable 65–79, Poor 50–64, Critical < 50 | Identical, same edges, same labels (`src/domain/bands.js`) |
| Over-allocation flag: estimated use exceeds crop demand by **> 25 %** | "Over-allocated" band at **> 125 %** of demand — the same rule |
| Average farm size 35 dunum | 500 survey farms over 17,597 dunum — 35.2 dunum each |
| Structure Tier 2 list: Residential, Labor Housing, Machine Storage, Water Storage, Roads, Warehouses, Commercial, Animal Enclosures, Irrigation & Utilities | All nine present in the land data |
| Fruit species: olive, citrus, mango, guava, fig, pomegranate, lime | All present in the crop taxonomy |
| Cultivated area reported **per farm and per crop type** | Both, on C1 |
| Seasonal change as new or abandoned cultivation | C2, split four ways: started, stopped, planted more, planted less |
| Fallow land detection | C3 |
| Annual tree change vs prior year | T3 |
| Canopy health as a score per tree **cluster** | T2 scores the farm, and says so |
| Zone (sub-zone) averages for IER | I1 compares each farm to its province |
| Quarter-on-quarter IER trend | I2 |
| Seasonal water budget per farm and per crop type | W2 |
| All outputs at farm level, by ADAFSA farm ID | F1 → F2 → F3 |

---

## 2. Different words for the same thing

The mockup's navigation and the quote's module list do not use the same names.
Worth deciding which set is the official one before this is shown again, because
ADAFSA will read the contract and the screen side by side.

| Quote (module) | Mockup (navigation) |
| --- | --- |
| Module 1 — Seasonal Crop Monitoring | **Crop Monitoring** |
| Module 2 — Date Palm & Fruit Tree Monitoring | **Tree Monitoring** |
| Module 3 — Agricultural Structure Detection | **Land Use & Structures** |
| Module 4 — Irrigation Efficiency Rating (IER) Score | **Irrigation Efficiency** |
| Module 5 — Yield Forecast / Yield Forecasting | **Yield Optimisation** |
| Module 6 — Crop Water Allocation Calculator | **Crop Water Calculator** |

Two of these carry a real difference of meaning, not just of length:

- **"Yield Optimisation" promises more than "Yield Forecast".** The quote sells a
  forecast and a deviation flag. Optimisation implies advice on how to do better,
  which is a Phase 2 item. Recommend renaming the module to **Yield Forecast**.
- **"Land Use & Structures" is wider than "Agricultural Structure Detection".**
  See §3 — the quote's marked-up taxonomy has narrowed to structures only.

Smaller wording notes:

- The quote says **IER Score**; the mockup's pages say "score" and "band" without
  the letters IER. Using the contract term once per page would help.
- The quote writes areas in **dunum** throughout (hectares struck out). The
  mockup uses dunum. Consistent — keep it that way.
- The quote's Module 5 unit is **tonnes/dunum**; the mockup's Y1 column reads
  **t/dun**. Same thing, but spelling it out once would be kinder.

---

## 3. In the quote, not on a screen

Ordered by how much they matter.

### a. Tier 3 structure classification
The markup moves the Module 3 accuracy metric from **Tier 2 to Tier 3**, and the
pricing table from "3-tier" to "**Tier 3 taxonomy**", with targets of 65 % at M3
rising to 87 % at M12. The mockup's L2 page says the opposite in plain sight:
*"Tier 2 gives the type of each structure. Tier 3 … is not available yet."*
This is the sharpest contradiction in the set. Either the screen is out of date
or the quote commits to something the platform does not intend to do.

### b. Protected agriculture has been struck out
The quote's Tier 1 rows **Open Agriculture** and **Protected Agriculture** are
both deleted, leaving only **Structures**. Open agriculture is fine — Modules 1
and 2 cover it. But greenhouses, shade houses, poly/glass houses, hydroponics
and open sheds now appear nowhere in the quote, while the mockup's L1 Land use
page still shows Greenhouse, Shade House and Open Shed as land classes.
Either they come back into the taxonomy, or they come off the screen.

### ~~c. Subsidy-eligible filter (IER 65)~~ — built
A named Module 4 deliverable: *"List of farms above IER 65 threshold — eligible
for continued subsidy consideration."* **Now on I1**: a headline figure for the
count, and three tabs over the farm table — all farms, keeps subsidy (65+),
below the line — with Export CSV giving whichever list is showing. The threshold
is the bottom edge of the Acceptable band, so the page and the contract cannot
drift apart.

### d. Flood irrigation detection
Also Module 4, with its own accuracy target (82 % at M3, 90 % from M6):
*"SAR + NDWI surface water detection cross-checked against rainfall — no rain +
water = flagged event."* Absent from the mockup.

### e. Yield trend map
Module 5 deliverable: *"Farm-level yield deviation from sub-zone average — flag
underperformers."* The mockup computes the deviation and shows it as numbers,
but the map was deliberately dropped in the design review. Worth reopening, since
the quote names it as a map.

### f. Consolidated production forecast, by district
Module 5: *"District-level seasonal production estimate … supports ADAFSA food
security planning."* The by-province table was removed from the pages in an
earlier round. Some district or province rollup needs to return.

### g. Reports, exports and the API
The Data Exchange Framework promises, from the Service Provider to ADAFSA:

- Monthly summary reports — **PDF + Excel/CSV**
- Milestone accuracy reports — **PDF**, at M3, M6, M9, M12
- GIS layer exports — **GeoJSON / Shapefile**, quarterly
- A **REST API**, per-farm output in JSON

The mockup offers a CSV export on tables. No report, no GIS export, no API or
account screens. A single "Reports and exports" screen would cover all four.

### h. Nothing shows measured accuracy
Payment is tied to accuracy at M3, M6, M9 and M12, measured on 20 farms chosen
by ADAFSA. The platform never mentions accuracy or confidence anywhere. A small
panel — target, measured, when next surveyed — would put the contract's own
scoreboard in front of the client. This is a suggestion, not a gap in scope.

### i. Water allocation per crop, for tariff
Module 6: *"Differentiated water demand per crop type — supports ADAFSA tariff
calculation for network water supplied to farms."* W2 shows water per crop, but
never the tariff purpose. A column header or a note would connect them.

### j. Reporting frequency is never shown
The quote fixes a cadence per module: crops monthly, trees quarterly, structures
monthly, IER weekly, yield monthly, water weekly/monthly. The mockup shows no
"as of" date or update frequency anywhere — a "last updated" line was removed
early on. Something small, per page, would be honest and would match the table.

### k. Date palm cultivars
The Module 2 target is species and variety accuracy for the **top 20 date palm
cultivars**. The mockup generates 14. Cosmetic, but it will be counted.

### l. Forest tree species
The quote names ghaf, sidr, acacia, casuarina, cedar, eucalyptus and tamarisk.
The mockup keeps "Forest Trees" as a single type with no species underneath,
while it does break fruit trees down. Worth matching.

---

## 4. On a screen, not in the quote

### a. Y2 Crop calendar
A whole screen. The quote mentions a crop calendar only in passing — *"phased by
Abu Dhabi crop calendar"* under Crop Coverage — as an input to the model, not as
an output. The screen is useful, so this is a case for adding a line to the
quote rather than removing the page.

### b. Water per kilo (m³/kg) on W2
Water productivity is not a Module 6 deliverable. It is a good number for a
policy conversation, and it is derived from two things that are in scope
(seasonal water, expected yield), so it is defensible — but it is an addition.

### c. F3 Corrective actions, and the "no advice" line
Modules 4 and 6 are both sold *"without prescriptive irrigation advice"* /
*"without prescriptive irrigation scheduling"*. F3 prints a **Suggested action**
per finding — for example, *"Find out whether the water supply is short, or the
watering times are wrong."* That is advice to an ADAFSA inspector about what to
investigate, not a watering schedule for a farmer, so it is probably on the right
side of the line. It is worth being able to say that sentence out loud in the
meeting before someone else says it first.

### d. L3 Change tracking for structures
The quote's Module 3 deliverables do not include a structure change report — only
detection and classification. The mockup builds the page and says it is waiting
for two quarters of history. Either add it to the quote or mark it as Phase 2.

### e. The mockup shows 500 farms
The contract covers **25,563 registered farms** (plus a 5 % buffer) over
**894,700 dunum**. The mockup runs on the 500-farm survey sample and says 500 on
the first screen. Nothing is wrong with that for a design mockup, but the numbers
on screen will be read as the platform's numbers. One line on the Overview —
"showing 500 farms from the pilot survey" — would prevent a misunderstanding.

---

## 5. Suggested order of work

1. Settle the Tier 2 / Tier 3 question (§3a) — it is the only outright
   contradiction.
2. Decide whether protected agriculture is in or out (§3b).
3. Add the flood irrigation flag (§3d) — a named deliverable with its own
   accuracy target. The subsidy filter (§3c) is done.
4. Rename **Yield Optimisation** to **Yield Forecast** (§2).
5. Bring back a district rollup and the yield trend map (§3e, §3f).
6. Add one "Reports and exports" screen (§3g).
7. Everything else is wording, and can travel with the next round.
