(function (W) {
  "use strict";

  W.ui = W.ui || {};

  // Wires zoom in/out buttons to a Leaflet map instance.
  // ids = { inId: "zoom-in", outId: "zoom-out" } (both optional, these are the defaults).
  // No-op for any id that isn't found in the DOM.
  function wireZoom(map, ids) {
    ids = ids || {};
    var inId = ids.inId || 'zoom-in';
    var outId = ids.outId || 'zoom-out';

    var inBtn = document.getElementById(inId);
    if (inBtn) inBtn.addEventListener('click', function () { map.zoomIn(); });

    var outBtn = document.getElementById(outId);
    if (outBtn) outBtn.addEventListener('click', function () { map.zoomOut(); });
  }

  // Wires a basemap-toggle button to a map context returned by W.map.create().
  // opts = { btnId: "toggle-basemap", onToggle }
  //   - btnId: element id, default "toggle-basemap".
  //   - onToggle(newBasemapName): optional callback invoked after toggling,
  //     e.g. so a page can re-add overlays that were removed/re-added along
  //     with the basemap layer.
  // No-op if the button isn't found in the DOM.
  function wireBasemap(mapCtx, opts) {
    opts = opts || {};
    var btnId = opts.btnId || 'toggle-basemap';
    var onToggle = opts.onToggle;

    var btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('click', function () {
      var newBasemap = mapCtx.toggleBasemap();
      if (onToggle) onToggle(newBasemap);
    });
  }

  W.ui.wireZoom = wireZoom;
  W.ui.wireBasemap = wireBasemap;

})(window.Wafra);
