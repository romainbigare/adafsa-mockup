/* Entry point.
 *
 * Draws the navigation and header, loads the page the route names, and hands it
 * the current selection. Pages are fetched on demand, so opening the overview
 * does not pull down the water calculator. */

import { start, onRouteChange, selection } from './router.js';
import { renderNav, renderHeader, renderBody, placeFor } from './shell.js';
import { loadPage } from './pages.js';
import { h } from './dom.js';
import { taxonomyTree } from '../data/store.js';

const nav = document.getElementById('nav');
const header = document.getElementById('page-header');
const body = document.getElementById('page-body');

let drawToken = 0;
let lastPath = null;

function failure(message) {
  return {
    content: h('div', { class: 'empty' },
      h('strong', { text: 'This page could not be opened.' }),
      h('p', { text: message }),
      h('a', { class: 'btn', href: '#/overview', text: 'Back to the overview' }))
  };
}

async function draw(route) {
  const token = ++drawToken;
  const place = placeFor(route.segments);
  const chosen = selection(route.params);
  const path = route.segments.join('/');

  renderNav(nav, place);
  document.body.classList.remove('nav-open');

  let view;
  try {
    const module = await loadPage(place.pageKey);
    if (token !== drawToken) return;
    view = module
      ? await module.render({ route, selection: chosen, place, params: route.params })
      : failure('There is no page at this address.');
  } catch (error) {
    console.error(error);
    view = failure(String(error && error.message ? error.message : error));
  }
  if (token !== drawToken) return;

  renderHeader(header, { place, tools: view.tools || [] });
  renderBody(body, {
    ...view,
    selection: chosen,
    showRegion: view.showRegion !== false,
    tree: taxonomyTree()
  });
  document.title = `${place.title ? place.title + ' — ' : ''}ADAFSA Platform`;

  /* Only jump to the top when the page itself changed; ticking a filter should
   * leave the reader where they were. */
  if (path !== lastPath) window.scrollTo(0, 0);
  lastPath = path;
}

onRouteChange(draw);
start();
