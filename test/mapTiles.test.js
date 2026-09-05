/* The basemap has to reach the browser, and it reaches it two different ways.
 *
 * On the published site the tile URLs are used exactly as written. Inside the
 * deck build the browser cannot reach the tile servers, so the builder serves
 * tiles itself and announces where. Getting that switch wrong is invisible in
 * development and shows up as a white hole where the map should be, printed. */

import { relayed } from '../src/components/mapBand.js';
import { is, ok, done } from './helpers.js';

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

delete globalThis.ADAFSA_TILE_RELAY;
is(relayed(ESRI), ESRI, 'a browser gets the tile URL untouched');

globalThis.ADAFSA_TILE_RELAY = 'http://127.0.0.1:8137/__tiles';
is(relayed(ESRI), `http://127.0.0.1:8137/__tiles?u=${ESRI}`, 'the deck build gets the relay');

/* Leaflet substitutes the placeholders AFTER this wrapper runs, so they have to
 * survive it unencoded — encoding them is the way this quietly stops working. */
ok(relayed(ESRI).includes('{z}/{y}/{x}'), 'the tile placeholders are still there to substitute');

const OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
ok(relayed(OSM).includes('{s}'), 'the subdomain placeholder survives too');

delete globalThis.ADAFSA_TILE_RELAY;
done('mapTiles');
