# ADAFSA Agricultural Monitoring Platform — mockup

A clickable, static mockup of the platform ADAFSA is buying: six analysis modules, a
farm register, and the reporting that sits over them. Built to be reviewed and demoed
rather than deployed. **Every score, count, forecast and history on screen is
generated** — see [Real data and invented data](#real-data-and-invented-data).

## Running it

No build step, no dependencies, no install. The app is native ES modules served as
static files, so it needs a server rather than a double-clicked file:

```bash
python3 -m http.server 8137     # or: npm run serve
# then open http://localhost:8137/index.html
```

Deploying to GitHub Pages is a push: `.nojekyll` tells Pages to serve `src/`, `data/`
and `vendor/` verbatim. Nothing is compiled.

The only thing that needs a network is map tiles. Leaflet is vendored, so every
figure, table and chart works offline.

```bash
node test/all.js        # or: npm test — plain Node, no runner to install
node tools/smoke.mjs    # walks all 22 routes in a browser; needs Playwright
```

## What it contains

Twenty-two pages, in the order and under the names agreed in the review
(`docs/adafsa-mockup-review.md`, with the change list in
`docs/adafsa-redesign-scope.md`):

    Overview                        inventory of production capacity — not health
    Crop Monitoring                 crops & cultivated area · seasonal change · fallow land
    Tree Monitoring                 trees, species & varieties · canopy health · annual change
    Land Use & Structures           land use · structures · change tracking
    Irrigation Efficiency           efficiency scores · quarterly trend
    Crop Water Calculator           monthly demand & over-allocation · seasonal water budget
    Yield Optimisation              yield forecast · crop calendar
    Individual Farms                register · farm profile · corrective actions
    Support

Three ideas run through all of them.

**Reporting goes emirate, then province, then farm.** Each province answers to a
different person, so the region selector is in the header of every page and never
buried on one of them.

**Maps illustrate; they do not carry the argument.** A map appears where the question
is genuinely about a place. Change and trend pages have none — that was settled
directly in review, and the contributor tables name farms instead.

**Every number comes through one function.** Pages read their rows from
`query()` in `src/data/store.js`. With twenty-two screens a convention that figures
should agree would not have survived; a single call does.

## Architecture

```
index.html            the shell: nav column, sticky header, scrolling content
assets/css/           tokens, layout and components, chart styles
vendor/leaflet/       vendored, so only tiles need a network
data/
  attributes.js       GENERATED — the geometry-free farm table every page reads
  geo/                the survey polygons, imported only when a map mounts
tools/
  build-attributes.mjs   regenerates data/attributes.js from data/geo
  smoke.mjs              walks every route in a browser and reports console errors
src/
  app/       shell, two-level hash router, navigation model, page registry, DOM and icons
  domain/    pure logic — taxonomy, regions, bands, periods, aggregation, change,
             the crop calendar, the water model, the issue model, the palette
  data/      the survey join, the query API, lazy geometry
  charts/    hand-drawn SVG: bar lists, columns, trend lines, band bars
  components/ figures, summary tables, the farm table, filter rail, map band, change table
  pages/     one small file per screen
  mock/      everything invented — the swap-for-an-API boundary
```

**Routing and selection live in the URL.** `#/m/crop/change?region=alain&cmp=year`
carries the page, the province, the comparison period, the taxonomy selection, the
sort and the page number. Any view can be bookmarked or sent to a colleague. The
platform this replaces could not do that.

**Geometry is loaded only where it is drawn.** The three survey files total about
4.4 MB and most pages here have no map at all, so the counting facts are extracted
once into a 103 KB attribute table and the polygons sit behind a dynamic import.
Re-run `npm run build:data` after changing anything under `data/geo/`.

**Colour is checked rather than chosen.** `src/domain/palette.js` holds two palettes
with two jobs: a fixed, colour-vision-validated order for the six taxonomy categories,
and the status ramps in `src/domain/bands.js` for the places where something is being
judged. Nothing decorative borrows the status hues. Three identity hues sit below 3:1
against the page, so every legend and bar carries a visible label.

## Real data and invented data

**From the survey:** farm boundaries and areas, crop parcels with their species,
land-use classes and the structures on each holding. The join between the two surveys
is documented in `src/data/compose.js` — the rule that stops the palms being counted
twice.

**Invented, in `src/mock/`:** tree counts, canopy indices, efficiency scores, metered
water, yields, production, and all of the quarterly history. Values are seeded from the
farm's id, so a refresh never changes a number in front of a client, and each invented
figure is anchored to a measured area, so a holding with a lot of palm land has a lot of
palms. Replace `src/mock/` with an API client and the pages keep working.

Provinces are assigned by longitude. The real boundaries are not in this dataset, and
drawing approximate ones would look more authoritative than it is; the maps borrow real
administrative boundaries and roads from the tile provider instead.

## Notes for whoever picks this up

- **Arabic and right-to-left** is a real requirement for this client and is not built.
  The layout uses logical properties throughout and all copy sits in the page modules,
  so the work is a pass rather than a rewrite — but it is cheapest before the layout
  hardens further.
- **Tier 3 structures** (telling a pump room from a filtration or desalination unit)
  are modelled but deliberately not delivered; both sides of the review doubted the
  classifier can do it. The pages say so rather than showing an empty column.
- **Change pages depend on history the live platform will not have** for its first two
  quarters. They carry a designed empty state for exactly that.
- **The deck is generated from the mockup.** The screenshots in `presentation/` are of
  the previous design and need regenerating from these screens.
