/* A small inline icon set.
 *
 * Drawn here rather than pulled from an icon font, so the platform keeps
 * working on a conference network that blocks everything but the map tiles.
 * Every glyph is a 24-unit square of plain strokes. */

const PATHS = {
  overview: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  crop: '<path d="M12 21V9"/><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5Z"/><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5Z"/><path d="M12 17c0-3 2-5 5-5 0 3-2 5-5 5Z"/>',
  trees: '<path d="M12 21v-4"/><path d="M12 17a5 5 0 0 0 0-10 5 5 0 0 0-3.5 8.5"/><path d="M8.5 15.5A4 4 0 1 1 12 9"/>',
  land: '<path d="M3 20h18"/><path d="M5 20V10l5-4 5 4v10"/><path d="M15 20v-6h4v6"/><path d="M9 20v-4h2v4"/>',
  water: '<path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3Z"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0"/>',
  yieldup: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  farms: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/>',
  support: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5A2.5 2.5 0 1 1 12 13v1.5"/><circle cx="12" cy="18" r=".6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9 7 7 7-7"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  download: '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
  close: '<path d="M6 6 18 18M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".7"/>',
  alert: '<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".7"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  arrowUp: '<path d="M12 20V5"/><path d="m6 11 6-6 6 6"/>',
  arrowDown: '<path d="M12 4v15"/><path d="m6 13 6 6 6-6"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m4 13 8 4.5L20 13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  print: '<path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  trend: '<path d="M3 17.5 9 11l4 4 8-8.5"/><path d="M15 6.5h6v6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  table: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M9.5 9.5V19.5"/>',
  scale: '<path d="M12 4v16"/><path d="M5 8h14"/><path d="m5 8-2.5 6h5Z"/><path d="m19 8-2.5 6h5Z"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>'
};

export function icon(name, { size = 16, title = null } = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', title ? 'false' : 'true');
  if (title) svg.setAttribute('aria-label', title);
  svg.innerHTML = PATHS[name] || PATHS.info;
  return svg;
}

export const ICON_NAMES = Object.keys(PATHS);
