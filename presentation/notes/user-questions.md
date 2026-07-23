# The five questions — audience analysis and the altitude mapping

**Who the users are.** ADAFSA officials: administrators and inspectors in a government
agriculture & food-safety authority. Comfortable with computers; not GIS analysts, not
data scientists. They open this tool in three situations: the daily glance, the weekly
work-list, and the briefing (a superior in the room, sometimes on an iPad). Their output
is never "a map" — it is a memo, a work order, an inspection visit, or a number quoted
in a meeting.

**The method behind the deck.** We wrote the questions first, then scored both designs
against them. This file is the full version of deck slides 4 and 6.

---

## Q1 — "Is the region OK today?"

- **Who asks:** everyone, every day; directors most of all.
- **Time budget:** five seconds. If it takes longer, the user stops asking the tool.
- **Current app:** ✗ no answer exists. Three counters (farms / fields / area) are
  inventory, not status — they never change colour and never say "fine". A user must
  toggle layers and *infer* regional health from polygon colours.
- **Redesign:** Altitude 1. A verdict sentence ("2 of 6 areas need attention —
  Irrigation Efficiency, Water Allocation"), a map glowing where the problem is, six
  status tiles that lead with a status word. First paint = the answer.

## Q2 — "Which farms need attention, worst first?"

- **Who asks:** operations staff; this is the Monday-morning work list.
- **Current app:** ✗ impossible. No ranking exists anywhere. The distribution tables
  aggregate by class (land-use area, tree counts) — they contain no farm identities and
  no ordering by severity. The official cannot produce a work list from this screen at all.
- **Redesign:** Altitude 2. Every module page docks a ranked attention list —
  worst-first, farm identity + the offending value, exportable to CSV. One click from
  landing (tile → module page).

## Q3 — "What exactly is wrong at this farm — and what do we do?"

- **Who asks:** inspectors preparing a visit; anyone answering a complaint or a call.
- **Current app:** ~ partial at best. "Single Farm Land Use / Tree Type" toggles show one
  farm's classification on the map, but there is no per-farm summary, no cross-module
  view, no severity statement, and no next action. The user assembles the case file by hand.
- **Redesign:** Altitude 3. The farm dossier: the AI's verdict in one sentence
  (worst finding first), all six modules' status for that farm, and actions —
  export the farm, open the Farm Analysis deep-dive. Every journey ends in an action.

## Q4 — "Show me X on the map" (the briefing moment)

- **Who asks:** whoever is presenting when a superior walks in; demos; GITEX.
- **Current app:** ~ partial. The layers can show classifications, but the presenter must
  operate toggles live, layers are mutually exclusive, and nothing highlights *problems* —
  the map shows what is where, not what matters.
- **Redesign:** Altitude 1's map is the briefing screen by default: coloured by overall
  criticality, clusters take the worst band present with red count badges, so problems
  survive aggregation. "Colour by" flips the lens in one control; the dial does the same
  inside module pages without losing the viewport. Deep links let a slide or an email
  open the exact view.

## Q5 — "Can I quote this number?"

- **Who asks:** implicitly, everyone — every figure may end up in a memo, a meeting, or
  in front of the client.
- **Current app:** ~ untested. Static counters are internally consistent because nothing
  is computed twice. The moment scored modules are added (six analyses, each with KPIs,
  legends, rollups), independent per-widget computation guarantees eventual contradictions.
- **Redesign:** the number contract — every figure on every screen comes from one audited
  registry; no component computes its own counts; automated tests assert that formatted
  values, band ranges and rollup headlines agree. During prototyping we caught a real
  instance ("223 farms critical" vs "Critical: 105" for the same module) and fixed it
  structurally: that bug class is now impossible, not just currently absent.

---

## The scorecard (slide 6's matrix)

| Question | Current app | Redesign |
|---|---|---|
| Q1 Is the region OK? | ✗ — no status anywhere | Altitude 1: verdict sentence + status tiles |
| Q2 Which farms, worst first? | ✗ — no ranking exists | Altitude 2: ranked attention list, CSV export |
| Q3 What's wrong at this farm? | ~ — single-farm layers only | Altitude 3: dossier, verdict, actions |
| Q4 Show me X on the map | ~ — manual toggles, problems invisible | Criticality map, worst-band clusters, colour-by, deep links |
| Q5 Can I quote this number? | ~ — unarchitected | Number contract, one registry, tested |

## Why "altitude" and not "dashboard + drill-down"

Drill-down describes a gesture; altitude describes a *contract about density*. Each level
promises a different reading effort — a sentence, a ranked table, a case file — and each
descent is a deliberate trade of reassurance for density. The discipline this buys:

- **No screen serves two questions.** The old app's single workspace served all five
  badly. Each altitude serves one question well, and the others are one click away.
- **Calm becomes possible.** Altitude 1 can afford to be quiet (status words, white
  tiles) because density lives downstairs. A screen that must serve analysts can never
  be calm; a screen that only answers "is anything red?" can.
- **The org chart maps onto the click path.** Director stays at 1; analyst lives at 2;
  inspector lands at 3. Complexity is buried a click down, not deleted — expert power
  (the layer browser, exports, the full data table) is funnelled deeper into the app
  rather than presented up front.
