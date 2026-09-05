/* Polygons, loaded only when something needs to draw them.
 *
 * The three survey files total about 4.4 MB. Most pages in this platform have
 * no map at all and none of them need geometry to count anything, so the
 * polygons sit behind a dynamic import and are fetched the first time a map
 * mounts. Everything else reads data/attributes.js, which is a hundredth of
 * the size. */

const R = 6378137.0;
const DEG = 180 / Math.PI;

export const toLatLng = (x, y) => [(2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * DEG, (x / R) * DEG];

/* A GeoJSON MultiPolygon in Web Mercator becomes Leaflet's lat/lng rings. */
export function ringsOf(feature) {
  const coordinates = feature.geometry?.coordinates || [];
  return coordinates.map((polygon) => polygon[0].map(([x, y]) => toLatLng(x, y)));
}

const loaded = {};

async function load(name) {
  if (!loaded[name]) {
    loaded[name] = import(`../../data/geo/${name}.js`).then((m) => m.default);
  }
  return loaded[name];
}

export const plotGeometry = () => load('plots');
export const cropGeometry = () => load('crops');
export const landuseGeometry = () => load('landuse');

/* Farm boundaries keyed by id, so a page can draw only the farms in its working
 * set without walking the whole collection each time. */
let boundaryIndex = null;
export async function farmBoundaries() {
  if (!boundaryIndex) {
    const collection = await plotGeometry();
    boundaryIndex = new Map(collection.features.map((f) => [String(f.properties.fid), ringsOf(f)]));
  }
  return boundaryIndex;
}
