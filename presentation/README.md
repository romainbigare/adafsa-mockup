# Presentation kit — "From map viewer to decision tool"

Everything needed to build the PowerPoint that argues for the dashboard redesign
(current app → three-altitude design) ahead of the six-module release.

## Start here

1. **`storyboard.md`** — the deck, slide by slide: headline, on-slide content, which
   asset goes where, and full speaker notes. 19 slides + 6 appendix slides.
2. **`adafsa-redesign-draft.pptx`** — a draft deck assembled from the storyboard
   (20 slides: all 19 + appendix pointer slide, visuals placed, speaker notes
   embedded). Use it as the starting file or rebuild from the storyboard in the
   house template. To regenerate after editing assets:
   `npm i pptxgenjs sharp && node build_deck.js` (the script measures each image
   and re-fits layouts automatically).

## Supporting notes (`notes/`)

| File | What it is | Feeds |
|---|---|---|
| `current-app-audit.md` | Factual inventory of the production app, extracted from its captured DOM — every claim verifiable, exact strings quoted | Slides 3, 5, 6, 7 + appendix A1 |
| `user-questions.md` | The five questions government officials bring to the tool, scored against both designs; the altitude rationale | Slides 4, 6, 8 + appendix A2 |
| `redesign-rationale.md` | The whole argument on one page (altitude model, screen grammar, the two contracts, what's preserved) | Slides 8–14, 16 |
| `objections.md` | Likely pushback in the meeting, with prepared answers | Q&A prep |

## Assets (`assets/`)

- `current/` — the "before": wireframe of the live app + a high-fidelity mockup of its
  layout. (A direct render of the captured production DOM was attempted and discarded —
  the capture has no absolute asset URLs, so it renders unstyled; see `ASSETS.md`.)
- `new/` — fresh screenshots of the working redesign mockup: the three altitudes,
  the dial, layers mode, the farm dossier, Farm Analysis, and mobile shots.
- `diagrams/` — the five argument diagrams (SVG source + PNG for PowerPoint):
  altitude model, screen grammar, questions matrix, module-scaling breakdown,
  the two contracts.
- `process/` — screenshots of the three prototyped layout proposals (A / A2 / B)
  for the "how we got here" slide.
- `ASSETS.md` — per-file manifest.

## Deeper background (outside this folder)

- `docs/design/ux-review-proposals.md` — the hands-on review of the three proposals
  (the evidence base; includes the must-fix list).
- `docs/design/proposal-combined-plan.md` — the implementation plan for the combined
  design (milestones quoted on slide 18).
- The mockup itself: open `index.html` (no build, no server needed) — the best
  appendix is a live demo.
