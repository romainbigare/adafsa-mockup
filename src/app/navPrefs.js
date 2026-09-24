/* Whether the menu is narrow.
 *
 * The menu can fold down to a column of icons, which gives a laptop screen
 * back a fifth of its width. It opens wide — the labels are what make the menu
 * readable to someone who has not used it before — and remembers the choice in
 * this browser once somebody makes it.
 *
 * Storage can be missing or refuse (a private window, blocked site data), so
 * every read and write is allowed to fail and the menu simply opens wide. */

export const NAV_COMPACT_KEY = 'adafsa.nav.compact';

export function readCompact(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(NAV_COMPACT_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeCompact(on, storage = globalThis.localStorage) {
  try {
    if (on) storage?.setItem(NAV_COMPACT_KEY, '1');
    else storage?.removeItem(NAV_COMPACT_KEY);
  } catch { /* not remembered; the menu still changes */ }
}
