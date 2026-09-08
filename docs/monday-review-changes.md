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
3. Cereals and fodder move off this page into C2; C1 stays the summary with the map.

## C2 — Cereals and fodder *(new page)*

4. Two stacked column charts side by side: cereals on the left, fodder on the right, stacked by
   crop, six quarters, measured in dunums. Six quarters gives both a last-quarter and a
   last-year comparison.
5. The page carries cultivated area **and** seasonal change — both, not one or the other.
6. Table of crops in the shape of the pilot report: crop name and the area for each of the last
   six quarters.
7. Table of farms: owner, province, farm centre, then oldest to newest — 12 months ago,
   3 months ago, current, and the change against 12 months ago.
8. A farm row opens to show each of its crops, not only its main one.

## C3 — Open field crops *(new page)*

9. Left: area planted quarter by quarter, six quarters, for whatever the filter is showing. Not
   stacked — there are too many vegetables for that to read.
10. Right, when the filter is on everything: which crops moved, compared with the same quarter a
    year ago. Summer to summer shows nothing, and that is correct.
11. Right, when one crop is picked: the top twelve producers of that crop instead.
12. Same two tables as C2 — crops by quarter, then farms.
13. Seasonality is September to March. Summer vegetables are grown under cover and are out of
    scope.

## C4 — Fallow land

14. Remove the map. The farm centre tells a reader where a farm is.
15. Replace "planted / part planted / fallow" with three classes: **land under cultivation**,
    **fallow under 12 months** (awaiting cultivation), **fallow over 12 months** (unutilised).
16. Draw them as a stacked bar over the last six quarters, with the year-on-year change beside it.

## T1 — Tree count

17. Rename the page (above).
18. The map shows the number of farms while you are zoomed out, and breaks into smaller numbers
    as you zoom. Only at farm level does it draw the individual trees.
19. At farm level the trees are coloured by variety — the full classification, not the three
    groups. Forest trees are left off the map.
20. The four figures at the top keep "trees counted".

## T2 — Canopy health

21. Rename the page, and call the score the **canopy health index** everywhere.
22. Keep the map — it was going to be removed with the fallow map, then kept once the score
    became a farm average that aggregates by region and by farm centre as you zoom.

## T3 — Annual change

23. The chart runs year by year over three years, not quarter by quarter. Trees move slowly.
24. It follows the filter toggles: all trees, date palm, fruit trees, forest trees.
25. Beside it, the top three varieties that grew and the bottom three that shrank over the last
    twelve months, with the tree count and the percentage.
26. The table lists trees, not farms: variety, number of trees, share, and the comparison with
    one year and two years ago.
27. Olive trees sit with the fruit trees.

## Across the platform

28. A **farm centre** field on every farm — shown, searchable, and empty, because ADAFSA has not
    given us the data. It is there to show the platform can hold it.
29. Charts are not mirrored for Arabic in this version. The English layout is kept and only the
    words are translated.

## PowerPoint

30. **(deck)** Version 0.0.3.
31. **(deck)** Crop Monitoring now has four screens, C1–C4; the codes, the contents page and the
    section dividers follow.
32. **(deck)** The plain-English note under each renamed or rebuilt screen is rewritten.

---

## Left open — not applied

Five things the call raised and did not settle. Nothing below is in the mockup; each one
carries a suggestion for how to close it.

**1. The horizontal share bars in the summary tables.** Mark liked reading them and
distrusted them in the same breath: the longest bar fills the cell whether it stands for
82% or 100%, and the bar in the dunum table means something different from the bar in
the farms table. Romain said he would find another model.

*Suggestion.* Scale every bar against 100% rather than against the largest row, and draw
the remainder as a light track behind it, so a category at 82% visibly stops short. That
is one line of arithmetic and it removes the misreading. It also makes the two tables
mean the same thing, since both then read as a share of their own whole. The cost is
that a table of small shares looks empty — which is honest, and is what the numbers
beside the bars are for.

**2. What "part planted" counted.** The old middle band was land whose utilisation was
under a hundred per cent, and Romain was not sure the survey supports it. The three new
states sidestep the question rather than answering it.

*Suggestion.* Confirm with MMC whether a parcel's utilisation is reported at all. If it
is not, keep the three states as they are; if it is, "fallow under 12 months" can carry
the partial parcels honestly instead of rounding them into one side or the other.

**3. "Fallow over 12 months — that's a problem."** Mark said it and the conversation
moved on. It reads as a political concern rather than a design one: the number is a
finding about how ADAFSA's own land is used.

*Suggestion.* Ask Mark directly whether the figure should be shown at emirate level at
all, or only inside a farm's own page. The page is built so the band can be renamed or
folded into "fallow" with one edit, which is the right amount to have committed until
that is answered.

**4. Owner and manager contact details, and the service-centre hierarchy.** The
extension officer's Google Maps pins carry owner name, farm id and two phone numbers. We
deliberately did not ask ADAFSA for any of it, because a leak of that list would be
serious.

*Suggestion.* Model the fields and hold them empty, exactly as the farm centre is held
now, so the capability can be demonstrated without the data existing. If ADAFSA later
wants it populated, that is a separate conversation about handling personal data, and
worth having in writing before any of it is loaded.

**5. Farm-centre data.** Agreed as an empty field; where the data comes from is not
settled.

*Suggestion.* Ask for the farm-centre code alongside the farm id in the same handover.
It is not personal data, it is what their own officers organise the work by, and without
it neither the search nor the map's middle zoom level can do what was asked of them.
