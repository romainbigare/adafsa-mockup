(function (W) {
  "use strict";

  W.ui = W.ui || {};

  // Renders the bottom "System Ticker" bar into the mount element's innerHTML.
  // mount: CSS selector, default "#ticker".
  function renderTicker(mount) {
    var mountSel = mount || '#ticker';
    var el = document.querySelector(mountSel);
    if (!el) return;

    var cfg = W.config.ticker;

    var html = '';
    html += '<div class="flex items-center space-x-3">';
    html += '  <span class="flex h-2 w-2 relative">';
    html += '    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>';
    html += '    <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>';
    html += '  </span>';
    html += '  <span class="font-data-sm text-gray-500">' + cfg.status + '</span>';
    html += '</div>';
    html += '<div class="font-data-sm text-gray-500 hidden sm:block">';
    html += '  ' + cfg.coords;
    html += '</div>';

    el.innerHTML = html;
  }

  W.ui.renderTicker = renderTicker;

})(window.Wafra);
