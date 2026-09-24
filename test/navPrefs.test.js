/* The narrow menu is remembered, and a browser that will not remember does no
 * harm: the menu opens wide and the page still draws. */
import { NAV_COMPACT_KEY, readCompact, writeCompact } from '../src/app/navPrefs.js';
import { is, done } from './helpers.js';

const memory = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data
  };
};

const store = memory();
is(readCompact(store), false, 'the menu opens wide until somebody folds it');
writeCompact(true, store);
is(readCompact(store), true, 'folding it is remembered');
is(store.data.get(NAV_COMPACT_KEY), '1');
writeCompact(false, store);
is(readCompact(store), false, 'and so is opening it again');
is(store.data.has(NAV_COMPACT_KEY), false, 'which leaves nothing behind');

const refusing = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); }
};
is(readCompact(refusing), false, 'storage that refuses reads as a wide menu');
writeCompact(true, refusing);
is(readCompact(null), false, 'no storage at all reads as a wide menu');
writeCompact(true, null);

done('navPrefs');
