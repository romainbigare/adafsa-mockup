(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  var BATCH_SIZE = 200;
  // Zoom-based layer switching: clusters when far, polygons when close.
  var CLUSTER_THRESHOLD = 13; // zoom levels below this use clusters

  // colorFor(state,type) depends on currentDataset + CROP_COLORS /
  // CROP_COLORS_BY_TYPE / TYPE_COLORS.
  function colorFor(state, type) {
    var tax = W.dashboard.taxonomy;
    var c = state.currentDataset === 'plots' ? tax.CROP_COLORS[type]
      : state.currentDataset === 'crops' ? (tax.CROP_COLORS_BY_TYPE[type] || '#999')
      : tax.TYPE_COLORS[type];
    return c || '#999';
  }

  // Creates the cluster layer for the zoomed-out view (centroid markers with
  // counts). Colors clusters by metric (overview tab) or dominant type
  // (landuse/trees tabs) — reads activeTab/currentMetric from shared state.
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

        // Compute color based on active tab
        var bgColor = 'rgba(22,163,74,0.85)';
        var metrics = W.mock.metrics;
        if (markers.length > 0) {
          if (state.activeTab === 'overview') {
            // On overview tab, color by selected metric
            if (state.currentMetric === 'irrigation') {
              var irrigationCounts = {};
              for (var ii = 0; ii < markers.length; ii++) {
                var val = metrics.getMetricValue(markers[ii]._featureRef, 'irrigation');
                var idx = Math.round(val);
                irrigationCounts[idx] = (irrigationCounts[idx] || 0) + 1;
              }
              var maxIdx = 0, maxCount = 0;
              for (var key in irrigationCounts) {
                if (irrigationCounts[key] > maxCount) { maxCount = irrigationCounts[key]; maxIdx = parseInt(key, 10); }
              }
              bgColor = metrics.IRRIGATION_COLORS[maxIdx] || bgColor;
            } else {
              var sum = 0;
              for (var si = 0; si < markers.length; si++) {
                sum += metrics.getMetricValue(markers[si]._featureRef, state.currentMetric);
              }
              var avg = sum / markers.length;
              bgColor = metrics.getMetricColor(avg, state.currentMetric);
            }
          } else {
            // On landuse/trees tabs, color by dominant type
            var typeCounts = {};
            for (var ti = 0; ti < markers.length; ti++) {
              var fr = markers[ti]._featureRef;
              if (fr) typeCounts[fr.type] = (typeCounts[fr.type] || 0) + 1;
            }
            var dominantType = null, maxC = 0;
            for (var t in typeCounts) {
              if (typeCounts[t] > maxC) { maxC = typeCounts[t]; dominantType = t; }
            }
            if (dominantType) bgColor = colorFor(state, dominantType);
          }
        }

        return L.divIcon({ html: '<div class="cluster-icon ' + cls + '" style="background:' + bgColor + '">' + count + '</div>', className: '', iconSize: [40, 40] });
      }
    });
    state.clusterActive = false;
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
  }

  function loadDataset(state, name) {
    if (state.currentDataset === name && state.allFeatures.length > 0) return;
    state.currentDataset = name;
    clearAllFeatures(state);
    W.dashboard.violationsPanel.clear(state);

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

      // Store for viewport stats
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
          color: colorFor(state, type), weight: 1, opacity: 0.8, fillOpacity: 0.35
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
        var marker = L.marker(centroid);
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
        state.clusterGroup.addLayer(marker);
      }
    }

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

  // Apply metric coloring to all layers
  function applyMetricColoring(state) {
    var metric = state.currentMetric;
    var metrics = W.mock.metrics;

    // Update polygon colors
    for (var type in state.layerGroups) {
      state.layerGroups[type].eachLayer(function (poly) {
        var feature = poly._featureRef;
        if (feature) {
          var val = metrics.getMetricValue(feature, metric);
          var c = metrics.getMetricColor(val, metric);
          poly.setStyle({ color: c, fillColor: c });
        }
      });
    }

    // Force complete cluster rebuild by removing and re-adding the cluster
    // group so iconCreateFunction is called fresh with the updated metric.
    if (state.clusterActive) {
      state.map.removeLayer(state.clusterGroup);
      state.clusterGroup.clearLayers();
      for (var t in state.markersByType) {
        if (state.layerVisibility[t]) {
          state.markersByType[t].forEach(function (m) { state.clusterGroup.addLayer(m); });
        }
      }
      state.map.addLayer(state.clusterGroup);
    }
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
    W.dashboard.layersPanel.build(state);
    W.dashboard.violationsPanel.generate(state);
    if (state.isFirstLoad) { W.dashboard.liveBar.init(state); state.isFirstLoad = false; }
    updateLayerMode(state);
    applyMetricColoring(state);
    W.dashboard.viewportStats.update(state);
    var fcEl = document.getElementById('live-farm-count');
    if (fcEl) fcEl.textContent = state.totalFarms;
    var loader = document.getElementById('map-loader');
    if (loader) loader.style.display = 'none';
  }

  W.dashboard.plotsLayer = {
    colorFor: colorFor,
    init: init,
    clearAllFeatures: clearAllFeatures,
    loadDataset: loadDataset,
    updateLayerMode: updateLayerMode,
    applyMetricColoring: applyMetricColoring
  };

})(window.Wafra);
