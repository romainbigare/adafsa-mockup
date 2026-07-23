(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Farm filter — "which farms count right now".
  //
  // The user picks crop / tree types; every farm that grows none of the picked
  // types drops out of BOTH the map and the numbers (KPIs, legend, attention
  // list, verdict tiles). One working set, so no panel can disagree with the map
  // — the same discipline the module registry enforces for values.
  //
  // This replaced the old "analysis mode vs layers mode" toggle: the taxonomy is
  // no longer a separate map you switch INTO, it is a lens you narrow the
  // current map WITH. (Land Use & Structures keeps the full taxonomy browser —
  // there the classification *is* the analysis; see taxonomyLayers.js.)
  //
  // Farm -> crop/tree types comes from the crops dataset, joined on owner name
  // (every crop parcel carries the owner of the farm it sits on). Indexed once
  // per farm load, alongside the other per-farm precomputes in plotsLayer.
  //
  // Scoping: each route filters by the taxonomy it is ABOUT — Crop Monitoring by
  // field crops, Palms & Fruit Trees by woody perennials, everything else by
  // both. A selection made out of the current scope is remembered but ignored:
  // what the panel shows is exactly what governs the map.
  //
  // Pure model, no DOM — the panel that drives it is js/dashboard/filterPanel.js.
  // Unit-tested in test/farmFilter.test.js.
  // ============================================================================

  var SEP = '|';                 // key = "<category>|<type>" (a leaf name alone
                                 // is ambiguous: "Watermelon" is both a fruit
                                 // tree and an open-field crop)

  // Which taxonomy a route may filter by. Land Use & Structures is deliberately
  // absent — it IS the taxonomy browser, so a crop/tree filter there is noise.
  var SCOPE_FOR_MODULE = {
    crop:  'crops',              // Crop Monitoring — field crops only
    palms: 'trees',              // Palms & Fruit Trees — woody perennials only
    ier:   'both',
    yield: 'both',
    water: 'both'
  };
  var OVERVIEW_SCOPE = 'both';

  function scopeForModule(key) { return SCOPE_FOR_MODULE[key] || null; }

  function tax() { return W.dashboard.taxonomy; }

  function treeFor(scope) {
    var t = tax();
    if (!t) return [];
    return scope === 'crops' ? t.CROPS_TREE
      : scope === 'trees' ? t.TREES_TREE
      : scope === 'both' ? t.CROP_TREE
      : [];
  }

  function keyOf(cat, type) { return cat + SEP + type; }
  function catOf(key) { return key.slice(0, key.indexOf(SEP)); }

  function keysOf(scope) {
    var out = [];
    treeFor(scope).forEach(function (c) {
      c.types.forEach(function (t) { out.push(keyOf(c.name, t.name)); });
    });
    return out;
  }

  // ---- Selection -------------------------------------------------------------
  // Stored as the set of types that are OFF, so "nothing chosen yet" is the empty
  // object and a type added to the taxonomy later is on by default.
  var off = {};

  function isOff(key) { return !!off[key]; }
  function setKeys(keys, on) {
    (keys || []).forEach(function (k) {
      if (on) delete off[k]; else off[k] = true;
    });
  }
  function selectAll(scope) { setKeys(keysOf(scope), true); }
  function clearAll(scope) { setKeys(keysOf(scope), false); }
  function reset() { off = {}; }

  // The in-scope types still ticked. Equal to the whole scope => no filtering.
  function activeKeys(scope) {
    return keysOf(scope).filter(function (k) { return !off[k]; });
  }
  function isActive(scope) {
    if (!scope) return false;
    return activeKeys(scope).length !== keysOf(scope).length;
  }

  // ---- Index: farm -> the crop/tree types growing on it ----------------------
  var counts = { keys: {}, cats: {} };     // farms per type / per category

  // Pure: stamps `_taxa` (a key->true map) on every farm and returns the farm
  // counts per type and per category. `parcels` are crops-dataset GeoJSON
  // features (or bare property objects, which is what the tests pass).
  function indexFarms(farms, parcels) {
    var norm = (tax() && tax().CROP_NORMALIZE) || {};
    var byOwner = {};
    (parcels || []).forEach(function (p) {
      var props = p.properties || p;
      var owner = props.owner_name, cat = props.level_1;
      var type = norm[props.level_3] || props.level_3;
      if (!owner || !cat || !type) return;
      (byOwner[owner] = byOwner[owner] || {})[keyOf(cat, type)] = true;
    });

    var out = { keys: {}, cats: {} };
    (farms || []).forEach(function (f) {
      var taxa = byOwner[f.owner] || null;
      f._taxa = taxa;
      if (!taxa) return;
      var seenCat = {};
      Object.keys(taxa).forEach(function (k) {
        out.keys[k] = (out.keys[k] || 0) + 1;
        var c = catOf(k);
        if (!seenCat[c]) { seenCat[c] = true; out.cats[c] = (out.cats[c] || 0) + 1; }
      });
    });
    return out;
  }

  // Called once per farm load, from plotsLayer.finishLoading. `parcels` defaults
  // to the crops dataset (tests inject their own).
  function prepare(farms, parcels) {
    if (!parcels) {
      try { parcels = W.data.features('crops'); } catch (e) { parcels = []; }
    }
    counts = indexFarms(farms, parcels);
    return counts;
  }

  // ---- Matching --------------------------------------------------------------
  // A farm survives if it grows at least one of the ticked in-scope types. Farms
  // with no recorded crops match nothing — they drop out as soon as a filter is
  // on (and are all shown while it is off, which is the inert default).
  function matches(farm, keys) {
    var taxa = farm && farm._taxa;
    if (!taxa) return false;
    for (var i = 0; i < keys.length; i++) if (taxa[keys[i]]) return true;
    return false;
  }

  // Recompute the working set from state.filterScope and push it to the map.
  // state.farmFilterSet — the Set the map draws from (null = everything).
  // state.filteredFarms — the same as an array for the analysis (null = all).
  function apply(state) {
    if (!state) return;
    var scope = state.filterScope || null;
    var all = state.farmFeatures || [];
    var set = null, list = null;

    if (scope && isActive(scope)) {
      var keys = activeKeys(scope);
      list = [];
      set = new Set();
      for (var i = 0; i < all.length; i++) {
        if (matches(all[i], keys)) { list.push(all[i]); set.add(all[i]); }
      }
    }

    state.farmFilterSet = set;
    state.filteredFarms = list;
    if (W.dashboard.plotsLayer && W.dashboard.plotsLayer.applyFarmFilter) {
      W.dashboard.plotsLayer.applyFarmFilter(state);
    }
  }

  // THE accessor for every analysis surface — never read state.farmFeatures
  // directly for numbers, or the panels will disagree with the map.
  function farms(state) {
    if (!state) return [];
    return state.filteredFarms || state.farmFeatures || [];
  }

  // ---- View model (pure) — what the panel renders ----------------------------
  function viewModel(state) {
    var scope = (state && state.filterScope) || null;
    var total = ((state && state.farmFeatures) || []).length;
    var cats = treeFor(scope).map(function (c) {
      var types = c.types.map(function (t) {
        var key = keyOf(c.name, t.name);
        return { key: key, name: t.name, color: t.color,
          count: counts.keys[key] || 0, checked: !off[key] };
      });
      var on = types.filter(function (t) { return t.checked; }).length;
      return {
        name: c.name, color: c.color, count: counts.cats[c.name] || 0,
        checked: on > 0, partial: on > 0 && on < types.length, types: types
      };
    });
    return {
      scope: scope,
      categories: cats,
      active: isActive(scope),
      matching: state && state.filteredFarms ? state.filteredFarms.length : total,
      total: total
    };
  }

  W.dashboard.farmFilter = {
    OVERVIEW_SCOPE: OVERVIEW_SCOPE,
    scopeForModule: scopeForModule,
    prepare: prepare,
    apply: apply,
    farms: farms,
    viewModel: viewModel,
    // selection
    isOff: isOff, setKeys: setKeys, selectAll: selectAll, clearAll: clearAll, reset: reset,
    // pure helpers — exposed for tests / reuse
    keyOf: keyOf, keysOf: keysOf, treeFor: treeFor, activeKeys: activeKeys,
    isActive: isActive, indexFarms: indexFarms, matches: matches
  };

})(window.Wafra);
