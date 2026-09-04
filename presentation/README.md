# Presentation kit — Farm dashboard redesign

Everything needed for the deck that walks through the redesign: how people use the
tool (three altitudes), where the current app falls short, and what the new layout
does about it.

## Two deliverables

- **`Farm_Monitoring_Wafra_Review.pdf`** — the review document, in the Wafra Review
  house style (A4, Poppins, white cover with the logo). Eight pages: six findings, each
  written as *what we found* then *what we suggest* with a drawn snippet, then a closing
  page on the shared frame. Source and build script in `review/`; rebuild with
  `pip install weasyprint pillow && python3 review/build.py`.
- **`adafsa-redesign-draft.pptx`** — the same argument as slides, for presenting live.

Both are built from the same findings; the PDF is the one to send ahead or leave behind.

## Start here

1. **`storyboard.md`** — the deck, slide by slide: a cover and ten slides, each
   with its visual, its annotations, and spoken speaker notes. The deck is
   deliberately light: one diagram or one annotated image per slide.
2. **`adafsa-redesign-draft.pptx`** — the draft deck built from the storyboard,
   speaker notes embedded. Annotations are real shapes connected to the screenshots
   with leader lines, so they can be nudged in PowerPoint. To regenerate after
   editing assets: `npm i pptxgenjs sharp && node build_deck.js`.

## The fifteen slides

The current platform (2–3), the proposal in two steps (4–5), the three level layouts
(6–9), the journey and a live demo (10–11), then wireframes in an appendix (12–15).

1. Cover — ADAFSA Platform · UX / UI Review
2. Analysis of Current Solution — Confusing navigation
3. Analysis of Current Solution — Page morphology
4. Step 1 : A better use of the navigation pane
5. Step 2 : A thoughtful layout for each level
6. Level 1 layout : Overview page
7. Level 2 layout : The module view
8. Level 2 layout : Zooming in
9. Level 3 layout : The full farm analytics
10. We follow the user's journey
11. See live demo
12. Extra — Diagrams for the New Proposal
13-15. Proposal Diagrams — Level 1 / Level 2 / Level 2b


Every annotation — on the screenshot slides and the wireframe/journey slides alike — is
a native PowerPoint shape: a soft floating card joined to the image by a thin leader and
a small ring marker, so any label can be edited or nudged in PowerPoint. The diagram
PNGs carry only the wireframe art and icons; their callouts and the journey's text are
placed natively by `build_deck.js` (from the coordinates in `*_ANN` / `BANDS`).

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
