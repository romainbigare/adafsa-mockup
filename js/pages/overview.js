(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Proposal Combined — Home is the Situation screen (ALTITUDE 1). The page
  // entry keeps the thin `overview` seam the router/dashboard bootstrap expect,
  // and delegates all rendering to js/dashboard/situation.js.

  function render(state) { W.dashboard.situation.render(state); }

  W.dashboard.overview = { render: render };

})(window.Wafra);
