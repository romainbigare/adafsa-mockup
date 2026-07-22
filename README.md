# Wafra Dashboard — Map My Crop (mockup)

A static, **buildless** front-end mockup for a farm-monitoring platform (Abu Dhabi / Al Ain region). Two pages backed by placeholder data, served entirely from static files — no server, no build step, no npm.

- **Farms Overview** (`index.html`) — **Proposal Combined.** Synthesises the three layout proposals into one experience built around **three altitudes**, sharing one screen grammar (verdict on top, map in the centre, ranked list docked below, nav on the left edge):
  - **Altitude 1 — the Situation** (`#/overview`): the glancer's screen. A plain-language **verdict** ("4 of 6 areas need attention — …"), the region map coloured by today's worst problem (chosen automatically) with red "N need attention" badges so problems glow through aggregation, and six **calm** status tiles (green ok · amber warn · red critical).
  - **Altitude 2 — the Question** (`#/m/<key>`): one module owns the map. KPI strip, a **dial** to switch modules in place (map viewport preserved), one legend, and a ranked attention list. Opening **Map Layers** visibly *pauses* the module chrome instead of contradicting it.
  - **Altitude 3 — the Farm** (`#/farm/<fid>`): a dossier drawer over the zoomed, highlighted farm — the AI's verdict in one sentence, per-module status, and an exit that ends in an **action** (export / open Farm Analysis).

  Two contracts hold throughout, enforced by tests: the **number contract** (every figure comes from `moduleRegistry`, so no two screens disagree) and the **colour contract** (red = needs action, amber = watch, green = fine — everywhere, including cluster badges).
- **Farm Analysis** (`farm-analysis.html`) — per-farm view with a canvas heatmap (growth / irrigation / phenology / density), weather, soil, growth-phase, water-scheduler and advisory panels.

> The data is **placeholder**. See [Data & the mock boundary](#data--the-mock-boundary).

## Running it

**Just open it.** Double-click any of the three `.html` files, or open them via `file://` in a browser. Everything (including the ~4.4 MB of geometry) loads through plain `<script>` tags, so no local server is required.

**Optional local server** (mirrors GitHub Pages exactly):

```bash
python3 -m http.server 8137
# then visit http://localhost:8137/index.html
```

**Deploy to GitHub Pages:** push to your repo and enable Pages on the branch root. The included `.nojekyll` file tells Pages to serve `assets/`, `js/`, and `data/` verbatim (no Jekyll processing). No build step runs.

## Architecture

Because the app must open over `file://` (where browsers block `fetch`, `XMLHttpRequest`, and ES-module `import`), it deliberately uses **classic scripts sharing one global namespace** instead of a module bundler. Every JS file is an IIFE that reads/attaches to `window.Wafra`:

```js
(function (W) {
  "use strict";
  W.geo = { mercatorToLatLng, /* ... */ };
})(window.Wafra);
```

The datasets are likewise plain scripts that assign `window.WafraData.*` — so they load over `file://` and GitHub Pages identically, with no `fetch`.

```
warfa-dashboard/
├── index.html                  # Farms Overview — thin skeleton (mounts + ordered <script>s)
├── farm-analysis.html          # Farm Analysis — thin skeleton
│
├── assets/
│   ├── tailwind-config.js       # shared Tailwind config (brand palette, fonts)
│   └── css/
│       ├── tokens.css           # design tokens (CSS custom properties)
│       ├── base.css             # body + typography utilities + scrollbars
│       ├── components.css       # glass-panel, markers, panels, table, drawer, …
│       └── leaflet.css          # Leaflet popup/attribution/cluster overrides
│
├── js/
│   ├── namespace.js             # window.Wafra = {} — must load first
│   ├── config.js                # Wafra.config — map defaults, tiles, nav, ticker
│   ├── lib/
│   │   ├── geo.js               # Wafra.geo — Web-Mercator→lat/lng, rings, centroid, area
│   │   ├── color.js             # Wafra.color — TYPE_COLORS, lerpColor, interpolateStops
│   │   └── random.js            # Wafra.random — deterministic seeded RNG (dashboard)
│   ├── data/loader.js           # Wafra.data.get(name) / .features(name) — reads window.WafraData
│   ├── map/createMap.js         # Wafra.map.create() — Leaflet map + basemaps + toggle
│   ├── ui/
│   │   ├── sidebar.js           # Wafra.ui.renderSidebar() — shared left nav
│   │   ├── strings.js           # Wafra.str() — user-facing copy in one place (i18n seam)
│   │   ├── ticker.js            # Wafra.ui.renderTicker() — shared bottom status bar
│   │   └── mapControls.js       # Wafra.ui.wireZoom / wireBasemap
│   │
│   ├── mock/                    # ALL placeholder/generated data — isolated (swap for a real API)
│   │   ├── metrics.js           #   dashboard per-feature metric values + colour scales + per-farm module metrics (prepareFarmMetrics)
│   │   ├── news.js              #   dashboard live-feed items
│   │   └── farmAnalysis.js      #   farm RNG + heat-field noise + panel demo values
│   │
│   ├── dashboard/               # Farms Overview feature modules (share one state object)
│   │   ├── taxonomy.js          #   land-use / crop trees + palettes
│   │   ├── state.js             #   createState() — the single shared mutable state
│   │   ├── modules.js           #   3 banded farm modules (IER / Yield / Water) + per-band severity (sev)
│   │   ├── moduleRegistry.js    #   the SIX contract modules as one model; tri-state status + criticalCount
│   │   ├── scorecard.js         #   module card component (big / mini / status tile) — tri-state chip
│   │   ├── legend.js            #   one legend, scope-aware (In view / All farms)
│   │   ├── attentionList.js     #   ranked per-module farm table helpers (metric labels)
│   │   ├── plotsLayer.js        #   streaming render, clustering; band-coloured dots + red "N critical" badges
│   │   ├── dataTable.js         #   shared sortable/reorderable/exportable table factory
│   │   ├── modulePage.js        #   Altitude 2 — module-page template (KPI strip + dial + legend + attention)
│   │   ├── situation.js         #   Altitude 1 — the Situation: verdict + calm status tiles + default colour-by
│   │   ├── farmDossier.js       #   Altitude 3 — the farm dossier drawer (verdict + module status + actions)
│   │   ├── newsBell.js          #   activity feed bell (top-right; click / outside / Escape)
│   │   ├── taxonomyLayers.js    #   Map Layers browser; pauses module chrome in "layers mode"
│   │   └── router.js            #   hash router (#/overview, #/m/<key>, #/farm/<fid>); drives the single map
│   │
│   ├── farmAnalysis/heatmap.js  # Farm Analysis canvas heatmap overlay + colour scales
│   │
│   └── pages/                   # one entry point per page — bootstraps + wires everything
│       ├── dashboard.js         #   creates the map once, wires chrome + mobile nav, hands off to the router
│       ├── overview.js          #   thin seam — delegates Home rendering to situation.js
│       └── farmAnalysis.js
│
├── data/                        # placeholder GeoJSON, wrapped as window.WafraData globals
│   ├── plots.js                 #   500 plot features
│   ├── crops.js                 #   2,425 crop features
│   ├── landuse.js               #   5,320 land-use features
│   └── farms.js                 #   3 farms (Farm Analysis)
│
├── .nojekyll                    # GitHub Pages: serve subfolders as-is
└── README.md
```

### Script load order (per page)

`Tailwind CDN → assets/tailwind-config.js → assets/css/*` (in `<head>`), then at the end of `<body>`: `Leaflet (+ markercluster on the dashboard) → js/namespace.js → js/config.js → js/lib/* → js/data/loader.js → js/map/createMap.js → js/ui/* → data/*.js → js/mock/* → feature modules → js/pages/<page>.js`. Order matters (later files depend on earlier `Wafra.*`), and each page's `<script>` list encodes it.

## Data & the mock boundary

Everything under **`data/`** (geometry) and **`js/mock/`** (generated metrics, weather, per-farm timestamps, news, heat-fields) is placeholder. To wire up a real backend, replace those two locations:

- Swap `data/*.js` for real data (either keep the `window.WafraData.* = {...}` global form, or reintroduce `fetch()` in `js/data/loader.js` if you no longer need `file://` support).
- Replace the generators in `js/mock/*` with real API calls. The feature/page modules consume them through `Wafra.mock.*` / `Wafra.data.*`, so nothing else needs to change.

## Tests

Pure logic (the registry, band/severity model, the Situation verdict, the farm dossier, the news generator, the strings seam) is unit-tested with **plain Node — no build, no npm**:

```bash
node test/all.js        # runs every test/*.test.js in a fresh node, fails loudly
```

Run the runner, **not** `node --test test/` — the suites are plain assertion scripts (`node test/<file>.test.js`), which `node --test` mis-parses. `test/all.js` is what CI should call.

## Notes

- **Tailwind is loaded from the Play CDN** (`cdn.tailwindcss.com`). That's ideal for a no-build mockup but is not intended for production; for a real deployment, compile Tailwind to a static stylesheet.
- **Two independent RNGs by design.** The dashboard uses a string-hash seeded RNG (`Wafra.random`); Farm Analysis uses its own `sin(seed*9999.123)` RNG (in `js/mock/farmAnalysis.js`). They are intentionally *not* unified — doing so would change the pre-existing pseudo-random visuals on each page.
- External resources (Tailwind, Google Fonts, Leaflet, Esri/OSM tiles, logo) load from their CDNs over HTTPS and require network access.
