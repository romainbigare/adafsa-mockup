# The redesign in one page — rationale reference

The distilled argument behind the deck. Longer versions: `docs/design/proposal-combined-plan.md`
(implementation), `docs/design/ux-review-proposals.md` (evidence), `user-questions.md` (audience).

## The trigger

The programme grows from map layers (boundaries, crops, land use) to **six analysis
modules**: Crop Monitoring, Palms & Fruit Trees, Land Use & Structures, Irrigation
Efficiency, Yield Forecast, Water Allocation. The last three are *scored* analyses —
bands, KPIs, rankings — not overlays. The current UI is a single-workspace map viewer
with mutually exclusive layer toggles and flat tables: it has no home for scores,
rankings, statuses, or six subjects competing for one map.

## The idea: three altitudes

Information is presented at the depth its question needs. Users descend by clicking;
every descent trades reassurance for density.

| Altitude | Route | Question | Screen | Register |
|---|---|---|---|---|
| 1 — the Situation | `#/overview` | "Is anything red?" | Verdict sentence · criticality map with worst-band clusters · six calm status tiles | a sentence |
| 2 — the Question | `#/m/<module>` | "Which farms, how bad?" | KPI strip · dial · one legend · ranked attention list | a work list |
| 3 — the Farm | `#/farm/<id>` | "What exactly, what next?" | Dossier: AI verdict · six-module status · actions (export, Farm Analysis) | a case file |

**One screen grammar throughout:** verdict on top, the world (map) in the centre, the
answer (ranked list) docked below, navigation on the left edge. The furniture never
moves; only the altitude changes. Consequences: one thing to learn; calm is possible at
the top because density lives downstairs; the click path mirrors the org chart
(director → analyst → inspector); and the symmetric layout mirrors cleanly for RTL.

## The two contracts (trust as architecture)

- **Number contract.** Every figure on every screen comes from one audited module
  registry; no component computes its own counts; one value scale per module. The same
  quantity can never appear with two values or two scales. Test-enforced.
- **Colour contract.** Red = needs action, amber = watch, green = fine, grey = no
  data — everywhere, including cluster badges. No decorative use of semantic colours.

Origin story worth telling: prototyping produced a real "223 farms critical" (Home) vs
"Critical: 105" (module page) contradiction — 223 was "poor or worse". The fix was
structural, not editorial; that bug class is impossible now.

## Modules become navigation

The mutual-exclusivity problem of layer toggles is dissolved, not fixed: each module is
a page (one template reused six times), the sidebar lists the contract by name, every
level deep-links. Adding module #7 = one registry entry + one nav item.

## What is deliberately preserved

Map engine and imagery; the layer browser (as an explicit, honestly-labelled mode);
sortable/exportable tables (now ranked worst-first); the Farm Analysis deep-dive page;
the buildless static architecture (runs over `file://`, demos anywhere). The mock/data
boundary is an API seam: production data replaces two folders, zero screens change.

## Design-principle checklist (why this matches house style)

- *Minimise inputs*: landing screen requires zero choices — the default colour-by is
  "today's worst module", computed, not configured.
- *Bury complexity in code, not UI*: composite criticality is fee-weighted in the
  registry; on screen it is one phrase and one colour.
- *Friendly first, expert deeper*: status words at the door; layers, exports, and the
  full data table are funnelled into deeper levels rather than presented up front.
