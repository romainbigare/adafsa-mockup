(function (W) {
  "use strict";

  W.ui = W.ui || {};

  // Renders the left <aside> sidebar (logo, subtitle, nav groups, footer).
  // options = { active, subtitle, mount }
  //   - mount: CSS selector for the mount element, default "#sidebar".
  //            If the mount element has a data-page attribute and `active`
  //            was not passed, data-page is used as the active id.
  //   - active: id of the nav link to mark active (matches config.nav link.id).
  //   - subtitle: text under the logo, default "Farm Management".
  function renderSidebar(options) {
    options = options || {};
    var mountSel = options.mount || '#sidebar';
    var el = document.querySelector(mountSel);
    if (!el) return;

    var active = options.active;
    if (!active && el.dataset && el.dataset.page) active = el.dataset.page;

    var subtitle = options.subtitle || 'Farm Management';
    var cfg = W.config;

    var html = '';
    html += '<div class="px-6 mb-6">';
    html += '  <div class="flex items-center space-x-2 mb-4">';
    html += '    <img src="' + cfg.logoUrl + '" alt="Map My Crop" class="h-8 w-auto" style="max-width:140px"/>';
    html += '  </div>';
    html += '  <p class="text-gray-500 text-xs">' + subtitle + '</p>';
    html += '</div>';
    html += '<nav class="flex-1 space-y-1">';

    cfg.nav.groups.forEach(function (group, i) {
      var padTop = i === 0 ? 'pt-2' : 'pt-4';
      if (group.label) {
        html += '<div class="px-6 ' + padTop + ' pb-1">';
        html += '  <span class="font-label-caps text-gray-400">' + group.label + '</span>';
        html += '</div>';
      }

      group.links.forEach(function (link) {
        var isActive = link.id === active;
        var linkClass = isActive
          ? 'flex items-center space-x-3 px-6 py-2 bg-brand-100 text-brand-800 border-l-4 border-brand-500 hover:bg-brand-200 transition-all cursor-pointer text-sm'
          : 'flex items-center space-x-3 px-6 py-2 text-gray-600 border-l-4 border-transparent hover:bg-gray-200 transition-all cursor-pointer text-sm';
        var iconStyle = isActive
          ? "font-variation-settings:'FILL' 1;font-size:20px;"
          : 'font-size:20px;';

        html += '<a class="' + linkClass + '" href="' + link.href + '">';
        html += '  <span class="material-symbols-outlined" style="' + iconStyle + '">' + link.icon + '</span>';
        html += '  <span>' + link.label + '</span>';
        html += '</a>';
      });
    });

    html += '</nav>';
    html += '<div class="mt-auto space-y-1">';
    cfg.nav.footer.forEach(function (link) {
      html += '<a class="flex items-center space-x-3 px-6 py-2.5 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer text-sm" href="' + link.href + '">';
      html += '  <span class="material-symbols-outlined" style="font-size:20px;">' + link.icon + '</span>';
      html += '  <span>' + link.label + '</span>';
      html += '</a>';
    });
    html += '</div>';

    el.innerHTML = html;
  }

  W.ui.renderSidebar = renderSidebar;

})(window.Wafra);
