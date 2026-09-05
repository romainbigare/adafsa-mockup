/* A small deterministic generator.
 *
 * Everything the platform shows is fabricated, and it has to be fabricated the
 * same way on every reload — a farm whose score changes when you refresh is
 * worse than no farm at all in front of a client. Seeding from the farm's id
 * gives stable values without storing them. */

export function seeded(seed) {
  let state = 0;
  const text = String(seed);
  for (let i = 0; i < text.length; i++) state = (state * 31 + text.charCodeAt(i)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/* Pull a value from a bell-ish distribution around `mid`. Sums of uniforms are
 * close enough to normal for a mockup and cost nothing. */
export function around(rand, mid, spread) {
  const draw = (rand() + rand() + rand()) / 3;
  return mid + (draw - 0.5) * 2 * spread;
}

export const between = (rand, min, max) => min + rand() * (max - min);
export const pick = (rand, list) => list[Math.min(list.length - 1, Math.floor(rand() * list.length))];

/* A weighted pick — weights need not sum to one. */
export function weighted(rand, entries) {
  const total = entries.reduce((a, e) => a + e.weight, 0);
  let draw = rand() * total;
  for (const entry of entries) {
    draw -= entry.weight;
    if (draw <= 0) return entry;
  }
  return entries[entries.length - 1];
}

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
