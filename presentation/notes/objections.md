# Objections you should expect — and the answers

Prep notes for the Q&A after the deck. Ordered by likelihood.

## "Can't we just add the six modules to the current UI?"

That thought experiment is slide 7, drawn honestly: the toggle list grows past twelve
switches, most combinations are meaningless, and every module still needs KPIs, a legend
and a ranked list that the current layout has no home for. A toggle can show a module's
*colour wash*; it cannot show its *content* (scores, bands, rankings, exports). The
modules are the product the client is paying for — burying them behind identical
checkboxes is also a commercial mistake: the new sidebar lists them by name.

## "How much does this cost / how long?"

The layout work is done and testable — the deck's screenshots are the working mockup
(five milestones, originally sized at ~7 working days, already implemented on placeholder
data). What remains is (a) wiring real data behind the mock seam — screens read one data
interface, so this touches two folders and zero screens — and (b) hardening: QA on real
volumes, the Arabic/RTL spike, client demo script. The expensive-looking part is behind us.

## "Isn't a full redesign risky? Users know the current app."

Three de-risking facts. First, what users *do* is preserved: same map, same satellite
imagery, the layer browser still exists (as an explicit mode), tables still exist (ranked
and exportable), the Farm Analysis page is untouched. Second, there is one screen grammar
to learn — verdict / map / list / nav — not three new screens. Third, we didn't bet on one
design: three full layouts were built and reviewed hands-on in a browser, and the shipped
design is the harvest of that comparison, with the review's must-fix list closed.

## "The current app already shows all this data on the map."

It shows *data*; the redesign shows *judgements*. The AI already computes which farms are
critical — the current UI never says it anywhere. No verdict, no ranking, no per-farm
summary exists on the current screens (verified against the captured DOM — see
`current-app-audit.md`). "The user can figure it out from the layers" is precisely the
analyst's workflow our users don't have.

## "Six modules on one map — won't the Situation screen be cluttered?"

The opposite: aggregation is the point of Altitude 1. The landing map shows one composite
(overall criticality, weighted across modules); the six tiles show one status word each.
Density lives at Altitude 2, one click down, one module at a time. The design rule is
literally "every descent trades reassurance for density" — clutter is architecturally
impossible at the top because detail has a home downstairs.

## "What about Arabic?"

Not shipped in v1, deliberately planned for: all user-facing copy passes through one
strings file (a translation seam, not a translation system); new CSS uses
direction-logical properties; and the screen grammar is symmetric (centre map, docked
panels) so it mirrors cleanly. The recommendation on slide 19 is an RTL spike *before*
the layout hardens — retrofitting RTL later is the expensive path.

## "Will it handle more farms (5k, 25k)?"

Today: 500 farms with ~8k classified polygons render client-side with clustering and
streaming already in place. Known scaling work is identified, not hand-waved: overlay
drawing for the taxonomy layers (instead of dataset swaps) is filed as the follow-up for
the 25k range, and the map-led landing degrades gracefully to the tile scorecard if a
future region map can't carry the polygon count. Nothing in the architecture assumes 500.

## "Who says these are the users' real questions?"

Fair challenge — the five questions (slide 4, `user-questions.md`) are our synthesis from
the client's role (government oversight of farm outputs and water usage), not a user
study. Two honest answers: (1) the questions are conservative — every oversight body asks
"is it OK / who's worst / what next"; (2) the architecture is cheap to re-aim: if client
conversations surface a sixth question, it gets an altitude assignment, not a redesign.
Proposing a structured walkthrough with actual ADAFSA users is a strong follow-up to
offer in the meeting.

## "Why should I trust the mockup's numbers/screenshots?"

They're placeholder data by design (the real AI outputs stay server-side), but the
*behaviour* is real: the screenshots come from the running app, and the contracts are
enforced by automated tests (`node test/all.js`) — registry rollups, verdict wording,
value scales, severity ordering, dossier composition. The demo is reproducible on any
laptop from static files, no install.
