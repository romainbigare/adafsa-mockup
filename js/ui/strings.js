(function (W) {
  "use strict";

  // ============================================================================
  // User-facing copy, in one place. NOT a translation engine — just the
  // discipline that makes Arabic (and plain-language review) a fill-in later
  // instead of a hunt through every component. New chrome pulls strings via
  // W.str('key', vars); {placeholders} interpolate. Generated prose (the verdict
  // sentence, the dossier verdict) stays in code — it needs grammar, not a
  // lookup — and is the next i18n step.
  // ============================================================================

  var STRINGS = {
    // Legend
    scopeInView: 'In view',
    scopeAll: 'All farms',
    legendFootView: 'Shares are of farms currently in view.',
    legendFootAll: 'Shares are of farms across the whole region.',

    // Situation
    tilesHeading: 'The six modules',
    tilesHint: 'Tap a tile to open it',
    colourBy: 'Colour by',

    // Farm dossier
    dossierModuleStatus: 'Module status',
    dossierOpenAnalysis: 'Open Farm Analysis',
    dossierExport: 'Export farm (CSV)',
    dossierBack: 'Back to list',
    dossierNoData: 'no data',

    // Layers mode
    layersPaused: '{module} paused — showing Map Layers',
    layersPausedGeneric: 'Map Layers — module data paused',
    layersReturn: 'Return to module',

    // Units
    unitDunums: 'dunums'
  };

  // Look up a key and interpolate {placeholder} tokens. Falls back to the key
  // so a missing string is visible, never a blank.
  function str(key, vars) {
    var s = STRINGS.hasOwnProperty(key) ? STRINGS[key] : key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    }
    return s;
  }

  W.strings = STRINGS;
  W.str = str;

})(window.Wafra);
