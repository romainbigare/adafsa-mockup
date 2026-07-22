(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  var BATCH_SIZE = 200;
  // Zoom-based layer switching: clusters when far, polygons when close.
  var CLUSTER_THRESHOLD = 13; // zoom levels below this use clusters

  var NEUTRAL = 'rgba(22,163,74,0.85)';

  // colorFor(state,type) depends on currentDataset + CROP_COLORS /
  // CROP_COLORS_BY_TYPE / TYPE_COLORS. This is the single source of truth for
  // "colour a shape by its value" — the value being the feature's type, drawn
  // from whichever category (Land Use / Crops / Trees) is currently loaded.
  function colorFor(state, type) {
    var tax = W.dashboard.taxonomy;
    var c = state.currentDataset === 'plots' ? tax.CROP_COLORS[type]
      : state.currentDataset === 'crops' ? (tax.CROP_COLORS_BY_TYPE[type] || '#999')
      : tax.TYPE_COLORS[type];
    return c || '#999';
  }

  // Resolved fill/outline colour for a single feature. When a farm-boundary
  // band module is active it wins (colour by band); otherwise the feature is
  // coloured by its taxonomy value. This is the single per-shape colour source
  // used by both the polygon layers and the cluster majority tally.
  function featureColor(state, ref) {
    if (state.activeModule) {
      // Resolve through the six-module registry so every contract module
      // (incl. Crop / Palms / Structures) can colour the farm boundaries.
      var reg = W.dashboard.moduleRegistry;
      var m = reg && reg.byKey(state.activeModule);
      if (m) return reg.colourOf(m, ref);
    }
    return colorFor(state, ref.type);
  }

  // A cluster is coloured by the majority value of the shapes it holds: tally
  // the members' resolved colours (band colour when a module is active, else
  // taxonomy colour), take the most common. Neutral green for an empty cluster.
  function majorityColor(state, markers) {
    var counts = {};
    var best = null, bestN = 0;
    for (var i = 0; i < markers.length; i++) {
      var ref = markers[i]._featureRef;
      if (!ref) continue;
      var c = featureColor(state, ref);
      counts[c] = (counts[c] || 0) + 1;
      if (counts[c] > bestN) { bestN = counts[c]; best = c; }
    }
    return best || NEUTRAL;
  }

  // How many members of a cluster are in the active module's WORST band —
  // the "N need attention" count. 0 when no risk module is active (taxonomy
  // views, categorical Structures). This is how problems survive aggregation:
  // the bubble keeps its majority colour, a red badge carries the alarm.
  function clusterCriticalCount(state, markers) {
    if (!state.activeModule) return 0;
    var reg = W.dashboard.moduleRegistry;
    var m = reg && reg.byKey(state.activeModule);
    if (!m || !reg.criticalCountOf) return 0;
    var refs = [];
    for (var i = 0; i < markers.length; i++) if (markers[i]._featureRef) refs.push(markers[i]._featureRef);
    return reg.criticalCountOf(m, refs);
  }

  // Single-farm marker icon: a band-coloured dot in the cluster visual language
  // (never Leaflet's default blue pin). Colour tracks the active module / taxonomy.
  function dotIcon(color) {
    return L.divIcon({
      className: '',
      html: '<div class="farm-dot" style="background:' + (color || NEUTRAL) + '"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7]
    });
  }

  // Creates the cluster layer for the zoomed-out view (centroid markers with
  // counts). Each cluster is coloured by the majority value of its members
  // (see majorityColor) so the zoomed-out map reflects the same taxonomy
  // colours as the individual shapes.
  function init(state) {
    state.clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: function (cluster) {
        var count = cluster.getChildCount();
        var cls = 'cluster-icon-small';
        if (count > 50) cls = 'cluster-icon-medium';
        if (count > 200) cls = 'cluster-icon-large';

        // Collect all markers in cluster to compute metric-based color
        var markers = [];
        var seen = new Set();
        var collect = function (l) {
          var ms = l._markers || (l.getAllChildMarkers && l.getAllChildMarkers()) || [];
          for (var mi = 0; mi < ms.length; mi++) {
            var m = ms[mi];
            if (m._featureRef && !seen.has(m)) {
              seen.add(m);
              markers.push(m);
            }
          }
          if (l._childClusters) l._childClusters.forEach(collect);
        };
        if (cluster._childClusters) cluster._childClusters.forEach(collect);
        var directMarkers = cluster._markers || [];
        for (var di = 0; di < directMarkers.length; di++) {
          var dm = directMarkers[di];
          if (dm._featureRef && !seen.has(dm)) {
            seen.add(dm);
            markers.push(dm);
          }
        }

        // Colour the cluster bubble by the majority value of its members.
        var bgColor = majorityColor(state, markers);

        // Red "N need attention" badge — worst-band members surface through the
        // majority colour so problems are never hidden by aggregation.
        var crit = clusterCriticalCount(state, markers);
        var badge = crit > 0 ? '<span class="cluster-badge">' + crit + '</span>' : '';

        // Ghost a cluster whose members are all outside the current selection.
        var ghost = state.ghostSet;
        var ghostCls = (ghost && !markers.some(function (m) { return m._featureRef && ghost.has(m._featureRef); })) ? ' cluster-ghosted' : '';

        return L.divIcon({ html: '<div class="cluster-icon ' + cls + ghostCls + '" style="background:' + bgColor + '">' + count + badge + '</div>', className: '', iconSize: [40, 40] });
      }
    });
    state.clusterActive = false;

    // Shared canvas renderer for the individual polygons. Canvas draws far
    // cheaper than one SVG node per shape — the render half of F2's "25k farms
    // without melting" (the other half is the bulk cluster add below).
    state.canvasRenderer = L.canvas({ padding: 0.5 });

    // Dedicated top-most pane for the selected-farm highlight so its pulsing
    // outline always draws above the polygons / cluster markers.
    state.map.createPane('farm-highlight');
    state.map.getPane('farm-highlight').style.zIndex = 650;
    state.highlightLayer = L.layerGroup().addTo(state.map);
  }

  // Zoom to a farm (from the farms table) and draw a pulsing highlight around
  // its boundary. Padding keeps the farm clear of the bottom info panel.
  function selectFarm(state, feature) {
    if (!feature || !feature.rings || !feature.rings.length) return;
    state.highlightLayer.clearLayers();

    var polys = [];
    feature.rings.forEach(function (ring) {
      var poly = L.polygon(ring, {
        pane: 'farm-highlight',
        className: 'farm-highlight-pulse',
        color: '#22d3ee', weight: 3, opacity: 1,
        fillColor: '#22d3ee', fillOpacity: 0.15
      });
      state.highlightLayer.addLayer(poly);
      polys.push(poly);
    });

    var bounds = L.featureGroup(polys).getBounds();
    var bar = document.getElementById('module-bar') || document.getElementById('live-bar');
    var bottomPad = (bar && !bar.classList.contains('collapsed')) ? bar.offsetHeight + 24 : 40;
    state.map.fitBounds(bounds, {
      maxZoom: 17,
      paddingTopLeft: [40, 40],
      paddingBottomRight: [40, bottomPad]
    });
  }

  function clearSelection(state) {
    if (state.highlightLayer) state.highlightLayer.clearLayers();
  }

  // Fit the map to a group of features (e.g. all farms in a band, or all
  // parcels of a land-use type) and ghost every shape outside the group —
  // used when a summary-table row is clicked.
  function selectGroup(state, members) {
    if (!members || !members.length) return;
    setGhost(state, members);
    var pts = [];
    for (var i = 0; i < members.length; i++) {
      if (members[i].centroid) pts.push(members[i].centroid);
    }
    if (!pts.length) return;
    var bar = document.getElementById('module-bar') || document.getElementById('live-bar');
    var bottomPad = (bar && !bar.classList.contains('collapsed')) ? bar.offsetHeight + 24 : 40;
    state.map.fitBounds(L.latLngBounds(pts), {
      maxZoom: 15,
      paddingTopLeft: [40, 40],
      paddingBottomRight: [40, bottomPad]
    });
  }

  function clearAllFeatures(state) {
    var map = state.map;
    Object.keys(state.layerGroups).forEach(function (k) { map.removeLayer(state.layerGroups[k]); });
    state.clusterGroup.clearLayers();
    for (var k1 in state.layerGroups) state.layerGroups[k1].clearLayers();
    for (var k2 in state.markersByType) delete state.markersByType[k2];
    for (var k3 in state.layerVisibility) delete state.layerVisibility[k3];
    for (var k4 in state.layerGroups) delete state.layerGroups[k4];
    for (var k5 in state.typeCounts) delete state.typeCounts[k5];
    state.allFeatures.length = 0;
    state.totalFarms = 0;
    state.totalArea = 0;
    state.clusterActive = false;
    if (state.highlightLayer) state.highlightLayer.clearLayers();
  }

  function loadDataset(state, name) {
    if (state.currentDataset === name && state.allFeatures.length > 0) return;
    state.currentDataset = name;
    clearAllFeatures(state);

    var features = W.data.features(name);
    var loader = document.getElementById('map-loader');
    if (loader) {
      loader.style.display = '';
      var p = loader.querySelector('p');
      if (p) p.textContent = 'Loading ' + features.length + ' features...';
    }
    streamFeatures(state, features, 0);
  }

  function streamFeatures(state, features, index) {
    var end = Math.min(index + BATCH_SIZE, features.length);
    var geo = W.geo;
    var metrics = W.mock.metrics;
    var tax = W.dashboard.taxonomy;
    var rnd = W.random.seededRandom;
    var batchMarkers = []; // collect this batch's markers → one bulk cluster add

    for (var i = index; i < end; i++) {
      var f = features[i];
      var props = f.properties || {};
      var type, category, owner, fid, area;
      if (state.currentDataset === 'plots') {
        type = props.crop || 'Unknown';
        category = 'Plots';
        owner = props.name || 'Unknown';
        fid = props.fid || i;
        area = props.dunum || geo.estimateArea(f);
      } else if (state.currentDataset === 'crops') {
        type = tax.CROP_NORMALIZE[props.level_3] || props.level_3 || 'Unknown';
        category = props.level_1 || 'Unknown';
        owner = props.owner_name || 'Unknown';
        fid = props.fid || i;
        area = props['area_(dun)'] || geo.estimateArea(f);
      } else {
        type = props.Type || 'Other Structures';
        category = props.Category || 'Structures';
        owner = props['Owner Name'] || 'Unknown';
        fid = props.fid || i;
        area = geo.estimateArea(f);
      }

      if (!state.typeCounts[type]) state.typeCounts[type] = 0;
      state.typeCounts[type]++;
      state.totalFarms++;

      var rings = geo.featureToPolygons(f);
      if (!rings.length) continue;
      state.totalArea += area;

      // Store for viewport stats + farm table
      var centroid = geo.featureCentroid(f);
      var featureData = { type: type, category: category, owner: owner, fid: fid, area: area, centroid: centroid, rings: rings };
      state.allFeatures.push(featureData);

      // Add to individual polygon layer group (hidden when clustered)
      if (!state.layerGroups[type]) {
        state.layerGroups[type] = L.layerGroup();
        state.layerVisibility[type] = true;
        state.markersByType[type] = [];
      }
      for (var r = 0; r < rings.length; r++) {
        var ring = rings[r];
        var poly = L.polygon(ring, {
          renderer: state.canvasRenderer,
          color: featureColor(state, featureData), weight: 1, opacity: 0.8, fillOpacity: 0.35
        });
        poly._featureRef = featureData;
        poly.bindPopup(
          '<div style="font-family:Inter,sans-serif;min-width:160px">' +
            '<b style="color:#111827">' + type + '</b><br>' +
            '<span style="color:#6b7280;font-size:11px">Category: ' + category + '</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Owner: ' + owner + '</span><br>' +
            '<span style="color:#6b7280;font-size:11px">ID: ' + fid + '</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Area: ~' + area.toFixed(1) + ' dunums</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Grade: ' + (rnd(fid * 7 + 13) * 4 + 1).toFixed(1) + '/5</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Growth: ' + Math.round(rnd(fid * 7 + 26) * 85 + 10) + '%</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Irrigation: ' + metrics.IRRIGATION_LABELS[Math.floor(rnd(fid * 7 + 39) * 4)] + '</span>' +
          '</div>'
        );
        state.layerGroups[type].addLayer(poly);
      }

      // Add centroid marker to cluster group
      if (centroid) {
        var marker = L.marker(centroid, { icon: dotIcon(featureColor(state, featureData)) });
        featureData._marker = marker;                 // back-ref for off-map pruning
        marker.bindPopup(
          '<div style="font-family:Inter,sans-serif;min-width:140px">' +
            '<b style="color:#111827">' + type + '</b><br>' +
            '<span style="color:#6b7280;font-size:11px">Owner: ' + owner + '</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Area: ~' + area.toFixed(1) + ' dunums</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Grade: ' + (rnd(fid * 7 + 13) * 4 + 1).toFixed(1) + '/5</span><br>' +
            '<span style="color:#6b7280;font-size:11px">Growth: ' + Math.round(rnd(fid * 7 + 26) * 85 + 10) + '%</span>' +
          '</div>'
        );
        marker.featureType = type;
        marker._featureRef = featureData;
        state.markersByType[type].push(marker);
        batchMarkers.push(marker);
      }
    }

    // Bulk-add the whole batch at once — markercluster's addLayers is far
    // cheaper than repeated addLayer, the key win for large farm counts.
    if (batchMarkers.length) state.clusterGroup.addLayers(batchMarkers);

    if (end < features.length) {
      requestAnimationFrame(function () { streamFeatures(state, features, end); });
    } else {
      finishLoading(state, features.length);
    }
  }

  function updateLayerMode(state) {
    var zoom = state.map.getZoom();
    var shouldCluster = zoom < CLUSTER_THRESHOLD;

    if (shouldCluster) {
      Object.keys(state.layerGroups).forEach(function (k) { state.map.removeLayer(state.layerGroups[k]); });
      state.clusterGroup.clearLayers();
      for (var type in state.markersByType) {
        if (state.layerVisibility[type]) {
          state.markersByType[type].forEach(function (m) { state.clusterGroup.addLayer(m); });
        }
      }
      if (!state.map.hasLayer(state.clusterGroup)) state.map.addLayer(state.clusterGroup);
      state.clusterActive = true;
    } else {
      state.map.removeLayer(state.clusterGroup);
      for (var type2 in state.layerGroups) {
        if (state.layerVisibility[type2]) state.map.addLayer(state.layerGroups[type2]);
        else state.map.removeLayer(state.layerGroups[type2]);
      }
      state.clusterActive = false;
    }
  }

  // Recolour every layer: shapes by their own value, clusters by their members'
  // majority value. When a farm-boundary band module is active, every shape is
  // coloured by its band (per-feature, so shapes of the same type can differ);
  // otherwise shapes take their taxonomy colour (constant per type). Colours
  // follow whichever dataset (Land Use / Crops / Trees / plots) is loaded.
  function applyColoring(state) {
    var byModule = !!state.activeModule;
    // Update polygon colors
    for (var type in state.layerGroups) {
      (function (type) {
        var typeColor = byModule ? null : colorFor(state, type);
        state.layerGroups[type].eachLayer(function (poly) {
          if (!poly._featureRef) return;
          var c = byModule ? featureColor(state, poly._featureRef) : typeColor;
          poly.setStyle({ color: c, fillColor: c });
        });
      })(type);
    }

    // Recolour single-farm dots too (lone markers shown when unclustered) so a
    // solitary critical farm still reads red, matching its polygon + cluster badge.
    for (var t in state.markersByType) {
      state.markersByType[t].forEach(function (m) {
        if (m._featureRef && m.setIcon) m.setIcon(dotIcon(featureColor(state, m._featureRef)));
      });
    }

    // Force a full cluster rebuild so iconCreateFunction reruns with the
    // current colours (and ghost state).
    rebuildClusters(state);
  }

  // Remove + re-add the cluster group so its iconCreateFunction reruns fresh —
  // the only way to restyle existing cluster bubbles (colour / ghost).
  function rebuildClusters(state) {
    if (!state.clusterActive) return;
    state.map.removeLayer(state.clusterGroup);
    state.clusterGroup.clearLayers();
    for (var t in state.markersByType) {
      if (state.layerVisibility[t]) {
        state.markersByType[t].forEach(function (m) { state.clusterGroup.addLayer(m); });
      }
    }
    state.map.addLayer(state.clusterGroup);
  }

  // ---- Ghosting -------------------------------------------------------------
  // Dim every shape/cluster not in the current selection. Driven by
  // state.ghostSet (a Set of selected featureData) — see setGhost/clearGhost.
  var POLY_OPACITY = 0.8, POLY_FILL = 0.35;
  var GHOST_OPACITY = 0.12, GHOST_FILL = 0.03;

  function applyGhost(state) {
    var ghost = state.ghostSet;
    for (var type in state.layerGroups) {
      state.layerGroups[type].eachLayer(function (poly) {
        if (!poly._featureRef) return;
        var dim = ghost && !ghost.has(poly._featureRef);
        poly.setStyle({ opacity: dim ? GHOST_OPACITY : POLY_OPACITY, fillOpacity: dim ? GHOST_FILL : POLY_FILL });
      });
    }
    rebuildClusters(state);
  }

  // Ghost everything except `members`. Empty/falsy members clears ghosting.
  function setGhost(state, members) {
    state.ghostSet = (members && members.length) ? new Set(members) : null;
    applyGhost(state);
  }

  function clearGhost(state) {
    if (!state.ghostSet) return;      // nothing to restore — avoid needless rebuilds
    state.ghostSet = null;
    applyGhost(state);
  }

  // Mock-data credibility: the placeholder plots carry a few duplicate fids
  // (two "#53"s). Reassign collisions to fresh ids above the current max so no
  // table or dossier ever shows the same farm number twice. Runs before the
  // metric prepare() passes so the reassigned id seeds those metrics.
  function dedupeFids(features) {
    var seen = {}, maxFid = 0, i;
    for (i = 0; i < features.length; i++) {
      var v = features[i].fid;
      if (typeof v === 'number' && v > maxFid) maxFid = v;
    }
    var next = maxFid + 1;
    for (i = 0; i < features.length; i++) {
      var f = features[i];
      if (seen[f.fid]) f.fid = next++;
      seen[f.fid] = true;
    }
  }

  // Never draw a farm marker in the sea. A handful of placeholder centroids fall
  // well outside the region; flag them (_offMap) and drop only their map marker —
  // the table row stays. Bounds are derived from the 2nd/98th percentile of all
  // centroids (+ generous pad), so nothing region-hardcoded.
  function pruneOffMapMarkers(state) {
    var fs = state.farmFeatures;
    if (!fs || fs.length < 25) return;
    var lats = [], lngs = [], i;
    for (i = 0; i < fs.length; i++) {
      if (fs[i].centroid) { lats.push(fs[i].centroid[0]); lngs.push(fs[i].centroid[1]); }
    }
    lats.sort(function (a, b) { return a - b; });
    lngs.sort(function (a, b) { return a - b; });
    function q(arr, p) { return arr[Math.min(arr.length - 1, Math.floor(arr.length * p))]; }
    var latLo = q(lats, 0.02), latHi = q(lats, 0.98), lngLo = q(lngs, 0.02), lngHi = q(lngs, 0.98);
    var padLat = (latHi - latLo) * 0.5 || 0.1, padLng = (lngHi - lngLo) * 0.5 || 0.1;
    var b = { latLo: latLo - padLat, latHi: latHi + padLat, lngLo: lngLo - padLng, lngHi: lngHi + padLng };

    var offByType = {}, pruned = 0;
    for (i = 0; i < fs.length; i++) {
      var f = fs[i], c = f.centroid;
      if (!c) continue;
      if (c[0] < b.latLo || c[0] > b.latHi || c[1] < b.lngLo || c[1] > b.lngHi) {
        f._offMap = true;
        pruned++;
        if (f._marker) {
          if (state.clusterGroup) state.clusterGroup.removeLayer(f._marker);
          (offByType[f.type] = offByType[f.type] || []).push(f._marker);
        }
      }
    }
    // Drop pruned markers from the per-type arrays so updateLayerMode never re-adds them.
    Object.keys(offByType).forEach(function (type) {
      var drop = offByType[type];
      if (!state.markersByType[type]) return;
      state.markersByType[type] = state.markersByType[type].filter(function (m) { return drop.indexOf(m) === -1; });
    });
    if (pruned) console.warn('[plotsLayer] pruned ' + pruned + ' off-map farm marker(s) outside the region bounds');
  }

  function finishLoading(state, total) {
    var allLayers = [];
    Object.keys(state.layerGroups).forEach(function (k) {
      allLayers = allLayers.concat(state.layerGroups[k].getLayers());
    });
    if (state.isFirstLoad && allLayers.length) {
      var group = L.featureGroup(allLayers);
      state.map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }
    // Snapshot the farm (plots) dataset so the Overview panel keeps reporting
    // farm metrics even when a landuse/crops category dataset is loaded.
    if (state.currentDataset === 'plots') {
      state.farmFeatures = state.allFeatures.slice();
      state.totalFarmCount = state.totalFarms;
      // Credibility fixes on the placeholder data, before any metric seeding:
      // unique farm ids, and no markers stranded in the sea.
      dedupeFids(state.farmFeatures);
      pruneOffMapMarkers(state);
      // Precompute the per-farm module values (IER / yield deviation / water)
      // once, on the same objects the map + module panels read from.
      W.dashboard.modules.prepare(state.farmFeatures);
      // Precompute the six-module mock metrics (tree count, canopy health,
      // cultivar, cultivated fraction, structure tier) behind the mock boundary.
      if (W.mock.metrics.prepareFarmMetrics) W.mock.metrics.prepareFarmMetrics(state.farmFeatures);
    }

    // Optional panels (present on the classic Overview page, absent on the
    // proposal layouts) are guarded; each page wires the rest via the
    // state.onFirstLoad / state.onRefresh hooks so plotsLayer stays layout-agnostic.
    var D = W.dashboard;
    if (D.layersPanel) D.layersPanel.build(state);
    if (state.isFirstLoad) {
      if (D.viewportStats) D.viewportStats.initStatusBadges();
      if (D.liveBar) D.liveBar.init(state);
      if (state.onFirstLoad) state.onFirstLoad(state);
      state.isFirstLoad = false;
    }
    updateLayerMode(state);
    applyColoring(state);
    D.dataTable.rebuildAll(state);
    if (D.viewportStats) D.viewportStats.update(state);
    if (state.onRefresh) state.onRefresh(state);
    if (D.liveBar && D.liveBar.syncLeftColumn) D.liveBar.syncLeftColumn();
    var loader = document.getElementById('map-loader');
    if (loader) loader.style.display = 'none';
  }

  W.dashboard.plotsLayer = {
    colorFor: colorFor,
    featureColor: featureColor,
    applyColoring: applyColoring,
    init: init,
    clearAllFeatures: clearAllFeatures,
    loadDataset: loadDataset,
    updateLayerMode: updateLayerMode,
    selectFarm: selectFarm,
    selectGroup: selectGroup,
    setGhost: setGhost,
    clearGhost: clearGhost,
    clearSelection: clearSelection
  };

})(window.Wafra);
