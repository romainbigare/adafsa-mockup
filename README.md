# Wafra Dashboard — Map My Crop (mockup)

A static, **buildless** front-end mockup for a farm-monitoring platform (Abu Dhabi / Al Ain region). Two pages backed by placeholder data, served entirely from static files — no server, no build step, no npm.

- **Farms Overview** (`index.html`) — Leaflet map of all plots/crops/land-use, with clustering (shapes coloured by taxonomy value, clusters by majority value), a layers panel, viewport statistics, a live activity feed, and sortable/exportable Farms/Land Use/Crops/Trees tables (bottom sheet).
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
│   │   ├── ticker.js            # Wafra.ui.renderTicker() — shared bottom status bar
│   │   └── mapControls.js       # Wafra.ui.wireZoom / wireBasemap
│   │
│   ├── mock/                    # ALL placeholder/generated data — isolated (swap for a real API)
│   │   ├── metrics.js           #   dashboard per-feature metric values + colour scales
│   │   ├── news.js              #   dashboard live-feed items
│   │   └── farmAnalysis.js      #   farm RNG + heat-field noise + panel demo values
│   │
│   ├── dashboard/               # Farms Overview feature modules (share one state object)
│   │   ├── taxonomy.js          #   land-use / crop trees + palettes
│   │   ├── state.js             #   createState() — the single shared mutable state
│   │   ├── plotsLayer.js        #   streaming render, clustering, taxonomy colouring (shape = own value, cluster = majority value)
│   │   ├── viewportStats.js     #   Overview / Land Use / Crops / Trees panels
│   │   ├── layersPanel.js       #   layers panel + fit/clear controls
│   │   ├── dataTable.js         #   shared sortable/reorderable/exportable table factory
│   │   ├── farmTable.js         #   Farms tab (built on dataTable.js)
│   │   ├── categoryTables.js    #   Land Use / Crops / Trees tabs (built on dataTable.js)
│   │   └── liveBar.js           #   bottom-sheet tabs + live feed + collapse
│   │
│   ├── farmAnalysis/heatmap.js  # Farm Analysis canvas heatmap overlay + colour scales
│   │
│   └── pages/                   # one entry point per page — bootstraps + wires everything
│       ├── dashboard.js
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

## Notes

- **Tailwind is loaded from the Play CDN** (`cdn.tailwindcss.com`). That's ideal for a no-build mockup but is not intended for production; for a real deployment, compile Tailwind to a static stylesheet.
- **Two independent RNGs by design.** The dashboard uses a string-hash seeded RNG (`Wafra.random`); Farm Analysis uses its own `sin(seed*9999.123)` RNG (in `js/mock/farmAnalysis.js`). They are intentionally *not* unified — doing so would change the pre-existing pseudo-random visuals on each page.
- External resources (Tailwind, Google Fonts, Leaflet, Esri/OSM tiles, logo) load from their CDNs over HTTPS and require network access.
