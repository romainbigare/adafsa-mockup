# Presentation kit — Farm dashboard redesign

Everything needed for the deck that walks through the redesign: how people use the
tool (three altitudes), where the current app falls short, and what the new layout
does about it.

## Start here

1. **`storyboard.md`** — the deck, slide by slide: a cover and ten slides, each
   with its visual, its annotations, and spoken speaker notes. The deck is
   deliberately light: one diagram or one annotated image per slide.
2. **`adafsa-redesign-draft.pptx`** — the draft deck built from the storyboard,
   speaker notes embedded. Annotations are real shapes connected to the screenshots
   with leader lines, so they can be nudged in PowerPoint. To regenerate after
   editing assets: `npm i pptxgenjs sharp && node build_deck.js`.

## The ten slides

Problem statement:

1. Three questions, three altitudes (icon diagram)
2. Start with the menu (real screenshot, nav in focus)
3. Can it tell us whether anything is wrong? (real overview screenshot, annotated)
4. Can it tell us what is happening on a farm? (Farm Monitoring wireframe, annotated)

The solution:

5. The proposal, seen from the menu (wireframe)
6. Three pages, three altitudes (wireframe)
7. The shape of a module page, with the taxonomy filter (wireframe)
8. Altitude 1, in practice (annotated screenshot, includes the filter)
9. Altitude 2, in practice (annotated screenshot)
10. Altitude 3, in practice (annotated screenshot)

## Background material (`notes/`)

Not slides. Kept for questions and follow-up:

| File | What it is |
|---|---|
| `current-app-audit.md` | Factual inventory of the production app, extracted from its captured DOM |
| `user-questions.md` | The users' questions in full, scored against both designs |
| `redesign-rationale.md` | The design argument on one page |
| `objections.md` | Likely pushback, with prepared answers |

## Assets (`assets/`)

- `current/` — the "before": wireframe of the live app and a high-fidelity layout
  mockup. (The captured production DOM renders unstyled, so no direct render exists.)
- `new/` — screenshots of the working mockup: the three altitudes, module switching,
  layers mode, the farm dossier, Farm Analysis, mobile.
- `diagrams/` — the slide diagrams (SVG source + PNG): `journeys-altitudes`,
  `wireframe-nav`, `wireframe-module`, plus six earlier argument diagrams kept as
  background.
- `process/` — screenshots of the three prototyped layout proposals (A / A2 / B).
- `ASSETS.md` — per-file manifest.

## Deeper background (outside this folder)

- `docs/design/ux-review-proposals.md` — hands-on review of the three proposals.
- `docs/design/proposal-combined-plan.md` — implementation plan of the combined design.
- The live mockup: open `index.html`. No build, no server.
