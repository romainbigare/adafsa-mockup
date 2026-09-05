/* Controls that declare themselves to the screen deck.
 *
 * NOTHING HERE RENDERS. These are data attributes, invisible in the interface
 * and read only by tools/screendeck.mjs, which draws a numbered disc in the
 * margin beside the control and explains it in a key.
 *
 * A printed screenshot cannot be clicked, so a small icon button that opens a
 * whole panel and one that does nothing look identical on paper. The app
 * declares the truth once, next to the control; the deck draws it.
 *
 *   to   — the screen code this control leads to
 *   note — what it opens or does, in place
 */

export function deckMark({ to, note } = {}) {
  const out = {};
  if (to) out['data-deck-to'] = to;
  if (note) out['data-deck-note'] = note;
  return out;
}
