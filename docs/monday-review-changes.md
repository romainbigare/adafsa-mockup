# Monday review — agreed changes (ADAFSA platform only)

Source: `monday-review.md`, the walkthrough from **[00:00:45]** to **[01:10:30]**. Everything
after that is the Wafra farmer app and the "compare plans" slide, which belong to another
project. Where the call changed its mind, only the last agreement is recorded here.

Items marked **(deck)** are PowerPoint changes rather than screen changes.

---

## Navigation and naming

| Was | Is |
|---|---|
| Crop Monitoring · Crops and area | Crops and area summary |
| Crop Monitoring · Seasonal change | split into **Cereals and fodder** + **Open field crops** |
| Crop Monitoring · Fallow land | unchanged, now the fourth page |
| Tree Monitoring · Trees and species | **Tree count** |
| Tree Monitoring · Tree health | **Canopy health** |
| Tree Monitoring · Annual change | unchanged |

The intermediate suggestions "crops and area broad categories" and "trees and species summary"
were both superseded later in the call.

## C1 — Crops and area summary

1. Rename the page (above).
2. "Farms growing each crop" has no total and no 100% line — a farm grows several crops, so
    the column cannot add up. The dunum table keeps its total.
3. The share bars run against a hundred per cent rather than against the largest row, so a
    category holding 82% visibly stops short of the cell and the two tables mean the same
    thing. `[00:11:28]`, closed after the call.
4. Cereals and fodder move off this page into C2; C1 stays the summary with the map.

## C2 — Cereals and fodder *(new page)*

5. Two stacked column charts side by side: cereals on the left, fodder on the right, stacked by
    crop, six quarters, measured in dunums. Six quarters gives both a last-quarter and a
    last-year comparison.
6. The page carries cultivated area **and** seasonal change — both, not one or the other.
7. Table of crops in the shape of the pilot report: crop name and the area for each of the last
    six quarters, with its share of what is planted and its movement — "a simplified table per
    produce, percentage and change". `[00:35:03]`, `[00:35:09]`
8. Table of farms: owner, province, farm centre, then oldest to newest — 12 months ago,
    3 months ago, current, and the change against 12 months ago. Four columns, old to new, so
    the row reads the same way as the chart above it. `[00:39:05]`, `[00:45:26]`
9. A farm row opens to show each of its crops, not only its main one.

## C3 — Open field crops *(new page)*

10. Left: area planted quarter by quarter, six quarters, for whatever the filter is showing. Not
    stacked — there are too many vegetables for that to read.
11. Right, when the filter is on everything: which crops moved, compared with the same quarter a
    year ago. Summer to summer shows nothing, and that is correct.
12. Right, when one crop is picked: the top twelve producers of that crop instead.
13. Same two tables as C2 — crops by quarter, then farms.
14. Seasonality is September to March. Summer vegetables are grown under cover and are out of
    scope.

## C4 — Fallow land

15. Remove the map. The farm centre tells a reader where a farm is.
16. Replace "planted / part planted / fallow" with three classes: **land under cultivation**,
    **fallow under 12 months** (awaiting cultivation), **fallow over 12 months** (unutilised).
17. Draw them as a stacked bar over the last six quarters, with the year-on-year change beside it.

## T1 — Tree count

18. Rename the page (above).
19. The map shows the number of farms while you are zoomed out, and breaks into smaller numbers
    as you zoom. Only at farm level does it draw the individual trees.
20. At farm level the trees are coloured by variety — the full classification, not the three
    groups. Forest trees are left off the map.
21. The four figures at the top keep "trees counted".

## T2 — Canopy health

22. Rename the page, and call the score the **canopy health index** everywhere.
23. Keep the map — it was going to be removed with the fallow map, then kept once the score
    became a farm average.
24. The map reads the index at whatever altitude you are looking from: a bubble carries the
    mean of the farms under it and takes the colour that mean would take on a single farm,
    breaking into smaller bubbles as you zoom. "The canopy health index for the region, for
    the farm centre, and then for the farm." `[00:54:29]`, `[00:55:30]`

## T3 — Annual change

25. The chart runs year by year over three years, not quarter by quarter. Trees move slowly.
26. It follows the filter toggles: all trees, date palm, fruit trees, forest trees.
27. Beside it, the top three varieties that grew and the bottom three that shrank over the last
    twelve months, with the tree count and the percentage.
28. The table lists trees, not farms: variety, number of trees, share of all trees, and the
    comparison with one year ago and two years ago — comparisons, not a column of raw counts
    per year. `[01:09:29]`, `[01:10:06]`
29. Olive trees sit with the fruit trees.

## Across the platform

30. A **farm centre** on every farm, in two places: a column after Province wherever a farm is
    listed, and a filter control beside the region. Both are present and switched off, because
    ADAFSA has given us farm ids and coordinates only. Officers search by farm centre, so the
    control has to be visible to say the platform holds it. `[00:36:04]`, `[00:37:24]`
31. Charts are not mirrored for Arabic in this version. The English layout is kept and only the
    words are translated.
32. The **"All crops" button is gone from the filter bar.** Every crop it reached is reachable
    through its own group's chevron. Asked for after the call, not in it.

## PowerPoint

33. **(deck)** Version 0.0.3.
34. **(deck)** Crop Monitoring now has four screens, C1–C4; the codes, the contents page and the
    section dividers follow.
35. **(deck)** The plain-English note under each renamed or rebuilt screen is rewritten.

---

## After the walkthrough

Changes asked for once the mockup had been walked again. None of these are in the
transcript.

- **C3** — the columns are split by crop, in tints of the open-field hue. Nine crops carry a
  band of their own and the tail gathers into one, because a stack of eighteen tints is a
  colour chart nobody can read. Every band is named in the legend.
- **T1** — the caption under "Where the trees are" follows the map: *Numbers of farms growing
  trees* while zoomed out, *Trees and their variety* once you are inside a holding. The dots
  keep their variety colouring; canopy health stays on T2, where the review put it.
- **T1 (deck)** — the second picture on the T1 page is the same screen zoomed into a farm,
  headed "ZOOMED IN", rather than the part that scrolled off. The deck now supports that on
  any screen that declares it.
- **T2** — the crop toggles are back, and every figure, band and table on the page answers to
  them.
- **T3** — the year-by-year columns are stacked by tree group in each group's own colour,
  rather than one blue bar.
- **L2** — the tier 2 / tier 3 banner is gone from the top of the screen. The tier is still
  modelled and the table still counts what is waiting for it.
- **Y2** — the two monthly bar charts are gone; the matrix is the page. The four figures
  already carry the busiest and the quietest month, which is what the charts were read for.
- A defect found while doing this: the class breakdown named its count column after working
  out the shares, so the Share column on L2's "Number of each type" read 0.0% under a total of
  100%. Fixed, with a test.

---

## Left open — not applied

Four things the call raised and did not settle. Nothing below is in the mockup; each one
carries a suggestion for how to close it. The share bars were the fifth and have since
been settled — they now run against a hundred per cent, with the remainder in grey.

**1. What "part planted" counted.** The old middle band was land whose utilisation was
under a hundred per cent, and Romain was not sure the survey supports it. The three new
states sidestep the question rather than answering it.

*Suggestion.* Confirm with MMC whether a parcel's utilisation is reported at all. If it
is not, keep the three states as they are; if it is, "fallow under 12 months" can carry
the partial parcels honestly instead of rounding them into one side or the other.

**2. "Fallow over 12 months — that's a problem."** Mark said it and the conversation
moved on. It reads as a political concern rather than a design one: the number is a
finding about how ADAFSA's own land is used.

*Suggestion.* Ask Mark directly whether the figure should be shown at emirate level at
all, or only inside a farm's own page. The page is built so the band can be renamed or
folded into "fallow" with one edit, which is the right amount to have committed until
that is answered.

**3. Owner and manager contact details, and the service-centre hierarchy.** The
extension officer's Google Maps pins carry owner name, farm id and two phone numbers. We
deliberately did not ask ADAFSA for any of it, because a leak of that list would be
serious.

*Suggestion.* Model the fields and hold them empty, exactly as the farm centre is held
now, so the capability can be demonstrated without the data existing. If ADAFSA later
wants it populated, that is a separate conversation about handling personal data, and
worth having in writing before any of it is loaded.

**4. Farm-centre data.** Agreed as an empty field; where the data comes from is not
settled.

*Suggestion.* Ask for the farm-centre code alongside the farm id in the same handover.
It is not personal data, it is what their own officers organise the work by, and without
it neither the search nor the map's middle zoom level can do what was asked of them.
