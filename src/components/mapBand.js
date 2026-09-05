/* The map, as a band inside a page rather than a canvas the page floats on.
 *
 * Three modes, and the review decided which pages get which:
 *   counts    — bubbles carrying the number of farms, breaking down as you zoom
 *               in, with no colour and no legend. This is the overview map.
 *   category  — farms coloured by their dominant crop or land-use class.
 *   band      — farms coloured by a status scale, where something is judged.
 *
 * The basemaps carry real administrative boundaries and real roads from the
 * tile provider, rather than approximate outlines drawn here. Mark asked for
 * borders and major highways back on the satellite view; borrowing the real
 * ones is both easier and more honest than inventing them.
 *
 * The Leaflet instance is kept per map id, so ticking a filter redraws the
 * markers without throwing away the reader's viewport. */

import { h, clear } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { int } from '../domain/format.js';
import { NEUTRAL, SEQUENTIAL } from '../domain/palette.js';
import { regionById, isEmirate } from '../domain/regions.js';
import { deckMark } from '../app/deckMark.js';

/* A build that photographs the app has no direct route to the tile servers, so
 * it serves them from its own cache and points this at it. Empty in a browser,
 * where the tile URLs below are used as they are. */
export const relayed = (url) => (globalThis.ADAFSA_TILE_RELAY ? `${globalThis.ADAFSA_TILE_RELAY}?u=${url}` : url);

const BASEMAPS = {
  satellite: {
    label: 'Satellite',
    layers: [
      ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Imagery &copy; Esri', maxZoom: 18 }],
      ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }],
      ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }]
    ]
  },
  streets: {
    label: 'Streets',
    layers: [['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }]]
  }
};

/* How coarsely farms are grouped at each zoom, in degrees. Zooming in splits a
 * bubble into smaller ones until, close enough in, every farm stands alone. */
const CELL_FOR_ZOOM = (zoom) => (zoom < 9 ? 0.4 : zoom < 10 ? 0.2 : zoom < 11 ? 0.09 : zoom < 12 ? 0.04 : zoom < 13 ? 0.015 : 0);

const instances = new Map();

export function mapBand(id, options) {
  const existing = instances.get(id);
  if (existing) {
    existing.update(options);
    return existing.element;
  }

  const canvas = h('div', { class: 'map-canvas' });
  const legendBox = h('div', { class: 'map-legend', hidden: true });
  const noteBox = h('div', { class: 'map-note', hidden: true });
  const controls = h('div', { class: 'map-controls' });
  const element = h('figure', { class: ['map-band', options.size || null] }, canvas, legendBox, controls, noteBox);

  if (typeof window.L === 'undefined') {
    element.append(h('div', { class: 'empty', style: { position: 'absolute', inset: '16px' } },
      h('strong', { text: 'The map could not load.' }),
      h('p', { text: 'Map tiles need a network connection. Every figure and table on this page works without one.' })));
    const stub = { element, update() {} };
    instances.set(id, stub);
    return element;
  }

  const map = window.L.map(canvas, { zoomControl: false, attributionControl: true, preferCanvas: true });
  let base = 'satellite';
  let baseLayers = [];
  const markerLayer = window.L.layerGroup().addTo(map);
  let current = null;
  let fittedRegion = null;

  function setBasemap(name) {
    baseLayers.forEach((layer) => map.removeLayer(layer));
    baseLayers = BASEMAPS[name].layers.map(([url, opts]) => window.L.tileLayer(relayed(url), opts).addTo(map));
    base = name;
  }
  setBasemap(base);

  const squareBtn = (label, glyph, onclick) => h('button', {
    class: 'btn btn-sm map-square', title: label, 'aria-label': label, onclick
  }, glyph);
  const baseToggle = h('button', {
    class: 'btn btn-sm map-square', title: 'Switch to the street map', 'aria-label': 'Switch to the street map',
    ...deckMark({ note: 'Swaps the satellite view for a street map' })
  }, icon('layers', { size: 15 }));
  baseToggle.addEventListener('click', () => {
    const next = base === 'satellite' ? 'streets' : 'satellite';
    setBasemap(next);
    const label = next === 'satellite' ? 'Switch to the street map' : 'Switch to the satellite map';
    baseToggle.title = label;
    baseToggle.setAttribute('aria-label', label);
  });
  controls.append(
    baseToggle,
    squareBtn('Zoom in', '+', () => map.zoomIn()),
    squareBtn('Zoom out', '\u2212', () => map.zoomOut()),
    h('button', {
      class: 'btn btn-sm map-square', title: 'Fit to the region', 'aria-label': 'Fit to the region',
      ...deckMark({ note: 'Frames the whole selection again after zooming' }),
      onclick: () => fit(true)
    }, icon('pin', { size: 15 }))
  );

  function fit(force = false) {
    const points = (current?.farms || []).filter((f) => f.lat && f.lng).map((f) => [f.lat, f.lng]);
    if (!points.length) { map.setView([23.9, 54.4], 8); return; }
    if (force || fittedRegion !== current.region) {
      /* The legend sits over the top-left corner, so the data is framed clear
       * of it rather than underneath it. */
      const legendRoom = current.legend?.length ? [element.clientWidth < 620 ? 190 : 230, 20] : [24, 20];
      /* And clear of the control column on the right. */
      map.fitBounds(window.L.latLngBounds(points), { paddingTopLeft: legendRoom, paddingBottomRight: [104, 34] });
      fittedRegion = current.region;
    }
  }

  /* Five thousand parcels across a whole emirate are specks. Below this zoom
   * the map shows a marker per holding, coloured by the class covering most of
   * it, and says how to see the outlines; past it the real boundaries are drawn.
   * A pleasant side effect is that the 2.7 MB of parcel geometry is not fetched
   * until somebody actually looks closely. */
  const PARCEL_ZOOM = 12;

  let parcelCache = null;
  async function drawParcels() {
    const { parcels } = current;
    if (!parcels) return;
    if (!parcelCache) {
      const { landuseGeometry, ringsOf } = await import('../data/geometry.js');
      const collection = await landuseGeometry();
      parcelCache = collection.features.map((feature) => ({
        rings: ringsOf(feature),
        category: feature.properties.Category,
        type: feature.properties.Type
      }));
    }
    if (!current.parcels) return;
    const drawnNow = current;
    for (const parcel of parcelCache) {
      if (drawnNow !== current) return;
      if (drawnNow.parcelFilter && !drawnNow.parcelFilter(parcel)) continue;
      const colour = drawnNow.parcelColor(parcel);
      const polygon = window.L.polygon(parcel.rings, {
        color: colour, weight: 0.6, fillColor: colour, fillOpacity: 0.72
      });
      polygon.bindTooltip(`<strong>${parcel.type}</strong>${parcel.category}`);
      markerLayer.addLayer(polygon);
    }
  }

  async function drawFarm() {
    const { farms: [farm], boundaryColor = '#2a78d6' } = current;
    if (!farm) return;
    const drawnNow = current;
    const { farmBoundaries } = await import('../data/geometry.js');
    const rings = (await farmBoundaries()).get(String(farm.fid));
    if (drawnNow !== current || !rings) return;
    const polygon = window.L.polygon(rings, { color: boundaryColor, weight: 2, fillColor: boundaryColor, fillOpacity: 0.2 });
    markerLayer.addLayer(polygon);
    map.fitBounds(polygon.getBounds().pad(0.6));
  }

  function draw() {
    markerLayer.clearLayers();
    if (!current) return;
    const { mode, farms, colorOf, labelOf } = current;

    if (mode === 'parcels') {
      if (map.getZoom() >= PARCEL_ZOOM) { drawParcels(); setNote(current.note); return; }
      setNote('Zoom in to see the parcel outlines. Each dot is a holding, coloured by the class covering most of it.');
      drawFarmMarkers(farms, current.farmColor || colorOf, labelOf);
      return;
    }
    if (mode === 'farm') { drawFarm(); return; }

    if (mode === 'counts') {
      const cell = CELL_FOR_ZOOM(map.getZoom());
      const groups = new Map();
      for (const farm of farms) {
        if (!farm.lat) continue;
        const key = cell ? `${Math.floor(farm.lat / cell)}:${Math.floor(farm.lng / cell)}` : String(farm.fid);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(farm);
      }
      const biggest = Math.max(...[...groups.values()].map((g) => g.length), 1);
      for (const members of groups.values()) {
        const lat = members.reduce((a, f) => a + f.lat, 0) / members.length;
        const lng = members.reduce((a, f) => a + f.lng, 0) / members.length;
        const weight = members.length / biggest;
        const size = 26 + Math.round(Math.sqrt(weight) * 26);
        const shade = SEQUENTIAL[Math.min(SEQUENTIAL.length - 1, 2 + Math.floor(weight * 3))];
        const marker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            className: '',
            html: `<div class="cluster-bubble" style="width:${size}px;height:${size}px;background:${shade}">${int(members.length)}</div>`,
            iconSize: [size, size], iconAnchor: [size / 2, size / 2]
          })
        });
        const area = members.reduce((a, f) => a + f.area, 0);
        marker.bindTooltip(`${int(members.length)} farm${members.length === 1 ? '' : 's'} · ${int(area)} dunums`);
        if (members.length === 1) marker.on('click', () => { location.hash = `#/farm/${members[0].fid}`; });
        else marker.on('click', () => map.setView([lat, lng], Math.min(15, map.getZoom() + 2)));
        markerLayer.addLayer(marker);
      }
      return;
    }

    drawFarmMarkers(farms, colorOf, labelOf);
  }

  function drawFarmMarkers(farms, colorOf, labelOf) {
    for (const farm of farms) {
      if (!farm.lat) continue;
      const colour = colorOf ? colorOf(farm) || NEUTRAL : NEUTRAL;
      const marker = window.L.circleMarker([farm.lat, farm.lng], {
        radius: Math.max(4, Math.min(13, Math.sqrt(farm.area) * 1.15)),
        fillColor: colour, fillOpacity: 0.85, color: '#ffffff', weight: 1.5
      });
      marker.bindTooltip(`<strong>#${farm.fid} · ${farm.owner}</strong>${labelOf ? labelOf(farm) : ''}`);
      marker.on('click', () => { location.hash = `#/farm/${farm.fid}`; });
      markerLayer.addLayer(marker);
    }
  }

  function setNote(text) {
    noteBox.hidden = !text;
    if (text) noteBox.textContent = text;
  }

  function drawLegend(legend) {
    if (!legend || !legend.length) { legendBox.hidden = true; return; }
    legendBox.hidden = false;
    clear(legendBox);
    legendBox.append(
      h('h3', { text: current.legendTitle || 'Legend' }),
      h('ul', {}, ...legend.map((entry) => h('li', {},
        h('span', { class: 'swatch', style: { background: entry.color } }),
        h('span', { text: entry.label }),
        entry.count != null ? h('span', { class: 'count', text: int(entry.count) }) : null))));
  }

  map.on('zoomend', () => { if (current?.mode === 'counts' || current?.mode === 'parcels') draw(); });

  const api = {
    element,
    update(next) {
      const first = !current;
      current = next;
      element.className = ['map-band', next.size || null].filter(Boolean).join(' ');
      drawLegend(next.legend);
      setNote(next.note);
      draw();
      if (first) map.setView([23.9, 54.4], 8);
      fit(first);
      /* The container is often still being laid out on the first pass, and a
       * fit against a zero-height box lands nowhere useful. Re-measure once the
       * browser has settled, then frame the region again. */
      requestAnimationFrame(() => {
        map.invalidateSize();
        fit(true);
      });
    }
  };
  instances.set(id, api);
  api.update(options);
  return element;
}

/* Pages are re-rendered on every filter change; the cached maps whose id is no
 * longer on screen are dropped so they do not leak. */
export function releaseMaps(keep = []) {
  for (const [id, instance] of instances) {
    if (keep.includes(id)) continue;
    if (!instance.element.isConnected) instances.delete(id);
  }
}

export const regionLabel = (id) => regionById(id).label;
export const wholeEmirate = isEmirate;
