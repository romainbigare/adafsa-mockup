# Asset manifest

One line per file: what it shows → suggested slide use (slide numbers refer to `../storyboard.md`).

## current/ — the "before"

- `current-app-wireframe.jpg` — wireframe of the live production "Farms Overview" page (layer toggles, three KPI counters, two distribution tables). Note: this is a cleaned-up wireframe rendition, not a raw screenshot — the raw production DOM is `docs/design/current_website`, audited in `../notes/current-app-audit.md`. Bottom caption sliver cropped out. → slides 2, 3.
- `mockup-of-current-layout.jpg` — high-fidelity mockup reproducing the current app's GIS-workspace layout (toggle stack over satellite map, flat table below). → alternative "before" visual.
- *(No direct render of the production DOM exists: the capture has only root-relative asset URLs, so it renders unstyled — attempted and discarded.)*

## new/ — the redesign (screenshots of the working mockup, 1600×900 @2×)

- `alt1-situation.jpg` — Altitude 1: verdict sentence, criticality heat map with legend, six status tiles. → cover (background), slide 6.
- `alt1-hover-breakdown.jpg` — Altitude 1 with a farm's per-module breakdown tooltip open. → spare.
- `alt2-module-ier.jpg` — Altitude 2, Irrigation Efficiency: KPI strip, legend, coloured boundaries, ranked attention list, Export CSV. → slide 7.
- `alt2-module-water.jpg` — Altitude 2, Water Allocation, same viewport (demonstrates in-place module switching). → spare.
- `alt2-layers-mode.jpg` — the taxonomy layer browser open over a module page (the GIS power tool as an explicit mode). → spare.
- `alt3-farm-dossier.jpg` — Altitude 3: farm dossier drawer — AI verdict sentence, six-module status, actions. → slide 8.
- `farm-analysis.jpg` — the existing Farm Analysis deep-dive page (heatmap, weather, soil, scheduler). → spare.
- `mobile-situation.jpg` / `mobile-module.jpg` — Altitudes 1 and 2 at phone width (390×844 @3×). → spare.

## diagrams/ — slide diagrams (SVG source + PNG @2× for PowerPoint)

Used by the deck:

- `journeys-altitudes.(svg|png)` — the three questions and altitudes, with icons. → slide 1.
- `wireframe-nav.(svg|png)` — the new navigation, mapped to the three altitudes. → slide 4.
- `wireframe-module.(svg|png)` — the anatomy of a module page. → slide 5.

Earlier argument diagrams, kept as background material (denser, from a previous
iteration of the deck):

- `altitude-model.(svg|png)` — the three-altitude model with routes and descent arrows.
- `screen-grammar.(svg|png)` — the four-zone screen grammar + per-altitude mini-skeletons.
- `questions-vs-apps.(svg|png)` — user questions × current app × redesign matrix.
- `module-scaling.(svg|png)` — today's layer panel with six modules grafted on.
- `contracts.(svg|png)` — the number contract and the colour contract.
- `ia-before-after.(svg|png)` — one cramped screen vs. the route tree.

## process/ — the three prototyped layout proposals

- `a-1-overview.jpg` — Proposal A: six-card region scorecard Home. → background.
- `a-2-palms.jpg` — Proposal A: module-page template (Palms). → spare.
- `a-5-farm-selected.jpg` — Proposal A: attention-row click zooms to the farm (the review's best interaction). → spare.
- `a-7-mobile-module.jpg` — Proposal A at phone width (the mobile gap, since fixed). → spare.
- `a2-1-overview.jpg` — Proposal A2: map-led Home. → background.
- `a2-2-colourby-ier.jpg` — Proposal A2: "Colour by Irrigation Efficiency" heat-map moment. → background.
- `b-1-initial-palms.jpg` — Proposal B: lands in a module view, no summary (its structural flaw). → spare.
- `b-2-water.jpg` — Proposal B: the one-dial Water view. → background.
- `b-5-news.jpg` — Proposal B: repetitive activity feed (mock-data credibility example). → spare.
- `wireframe-proposal-a-scorecard.png` — early wireframe of A's scorecard Home. → spare.
- `wireframe-proposal-b-dial.png` — early wireframe of B's dial workspace. → spare.
