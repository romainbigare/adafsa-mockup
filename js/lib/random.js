(function (W) {
  "use strict";

  // Deterministic pseudo-random from a seed (dashboard version — string-hash
  // then sin-based fractional pull). Farm Analysis uses a DIFFERENT RNG
  // (`sin(seed*9999.123)`); it keeps its own — do not route it through this one.
  function seededRandom(seed) {
    var h = 0;
    var s = String(seed);
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs((Math.sin(h) * 10000) % 1);
  }

  W.random = {
    seededRandom: seededRandom
  };

})(window.Wafra);
