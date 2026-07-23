# Presentation Assets Manifest

One line per file, grouped by folder. Format: `filename — what it shows — suggested slide use`.

## presentation/assets/current/

- `current-app-wireframe.jpg` — Clean redesign-style mockup of the production "Farms Overview" screen (sidebar nav, Map Layers toggle panel, three stat cards, two data tables); a caption fragment at the very bottom ("...close in spirit to Proposal C...") is visible, confirming this frame comes from a design-comparison doc rather than a raw current-app screenshot — treat as an idealized/cleaned-up stand-in for current, not a literal capture — use where a tidy "before" reference is needed but a literal DOM screenshot isn't available.
- `mockup-of-current-layout.jpg` — High-fidelity mockup reproducing the current app's actual GIS-workspace layout: dense left-hand layer-toggle stack over a full-bleed satellite map with clustered farm markers, flat/unfiltered data table docked at the bottom — use as the primary "current state" visual on the problem-statement slide (cluttered toggles, single flat table, no hierarchy).

Note: the live production DOM capture (`docs/design/current_website`) could not be rendered — see final report. No `current-app-render.jpg` file exists in this folder; the two files above stand in for it.

## presentation/assets/process/

- `a-1-overview.jpg` — Proposal-A "Region scorecard" concept: six KPI cards (Crop Monitoring, Palms & Fruit Trees, Structures, Irrigation Efficiency, Yield Forecast, Water Allocation) each with a headline number, status chip, and mini progress bar — use to show the scorecard-first redesign direction.
- `a-2-palms.jpg` — Proposal-A module drill-down (Palms & Fruit Trees): top metric strip, legend panel (Healthy/Fair/Stressed/Severe Stress bands) over the satellite map, attention-list table below — use to show how a scorecard tile expands into a focused module view.
- `a-5-farm-selected.jpg` — Same Proposal-A Palms & Fruit Trees module with a single farm/field selected and highlighted on the satellite map, attention-list table still visible — use to show the map-to-record selection interaction.
- `a2-1-overview.jpg` — Proposal-A2 variant: full-width map with a compact "Region Overview" summary chip and a "Colour by" dropdown (set to Structures) top-right, module tiles condensed into one row at the bottom — use to show a map-forward alternative layout.
- `a2-2-colourby-ier.jpg` — Same Proposal-A2 layout with "Colour by" set to Irrigation Efficiency, showing farm markers recolored by that metric — use to illustrate the flexible map-colouring concept.
- `b-1-initial-palms.jpg` — Proposal-B concept: a single "VIEW" selector pill-bar (Farms/Crops/Palms/Structures/Irrigation/Yield/Water) driving one map, with region stats, a legend card, and a Summary/Ranked-farms tab pair at the bottom — use to show the "one map, one question" navigation model.
- `b-2-water.jpg` — Proposal-B with the VIEW selector switched to Water, showing water-allocation bands on the map and the corresponding ranked-farms table — use to reinforce the single-selector, swappable-lens concept across metrics.
- `b-5-news.jpg` — Proposal-B with an "Activity" feed panel open (satellite scans, AI assessments, harvest/registration events with timestamps) layered over the map — use to show the proposed activity/notifications concept.
- `a-7-mobile-module.jpg` — Proposal-A module view (Palms & Fruit Trees) at a narrow mobile viewport, legend and attention-list table stacked vertically — use to show responsive/mobile behaviour of the redesign direction.
- `wireframe-proposal-a-scorecard.png` — Annotated low-fi wireframe of the Proposal-A scorecard home screen (six KPI cards with headline number/status chip/micro-chart, captioned "the boomer test: six cards, six numbers, six statuses") — use on a process/rationale slide explaining the scorecard concept.
- `wireframe-proposal-b-dial.png` — Annotated low-fi wireframe of the Proposal-B single-view screen (VIEW pill selector, one legend card, map stripped to "the active view, nothing else", captioned "One selector, one legend, two bottom tabs...") — use on a process/rationale slide explaining the single-selector concept.

## presentation/assets/new/

(empty — populated by other steps; nothing to list yet)

## presentation/assets/diagrams/

(empty — populated by other steps; nothing to list yet)
