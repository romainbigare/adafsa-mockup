(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // FILTERING panel — the floating control that drives js/dashboard/farmFilter.js.
  //
  // Minimised by default: a single header row, so the landing map is never
  // fronted by a wall of checkboxes. Expanding reveals the taxonomy for the
  // CURRENT route's scope (see farmFilter.SCOPE_FOR_MODULE) — categories first,
  // each drilling down to its types. Ticking is the only interaction.
  //
  // One component, mounted on two chromes (the Overview and the module pages):
  // the selection lives in farmFilter, so both mounts always agree.
  //
  // HTML building is pure (panelHtml/rowsHtml take a view model, touch no DOM)
  // — see test/filterPanel.test.js.
  // ============================================================================

  var ff = W.dashboard.farmFilter;

  var expanded = false;              // panel open/closed — minimised at first
  var openCats = {};                 // category name -> expanded (collapsed by default)
  var mounts = {};                   // elId -> { el, wired }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function box(checked, cls, key) {
    return '<input type="checkbox" ' + (checked ? 'checked' : '') +
      ' class="filter-box ' + cls + '" data-key="' + esc(key) + '">';
  }

  function typeRow(t) {
    return '<label class="filter-row filter-row--type">' +
        '<span class="filter-row-main">' +
          '<span class="filter-swatch" style="background:' + esc(t.color) + '"></span>' +
          '<span class="filter-row-name">' + esc(t.name) + '</span>' +
        '</span>' +
        '<span class="filter-row-meta">' +
          '<span class="filter-count">' + t.count + '</span>' +
          box(t.checked, 'filter-type', t.key) +
        '</span>' +
      '</label>';
  }

  function catRow(c, isOpen) {
    return '<div class="filter-cat' + (isOpen ? ' open' : '') + '">' +
        '<div class="filter-row filter-row--cat" data-cat="' + esc(c.name) + '">' +
          '<span class="filter-row-main">' +
            '<span class="material-symbols-outlined filter-chevron-sm">chevron_right</span>' +
            '<span class="filter-swatch" style="background:' + esc(c.color) + '"></span>' +
            '<span class="filter-row-name filter-row-name--cat">' + esc(c.name) + '</span>' +
          '</span>' +
          '<span class="filter-row-meta">' +
            '<span class="filter-count">' + c.count + '</span>' +
            box(c.checked, 'filter-catbox', c.name) +
          '</span>' +
        '</div>' +
        '<div class="filter-cat-body">' + c.types.map(typeRow).join('') + '</div>' +
      '</div>';
  }

  // The whole panel, from a farmFilter view model.
  function panelHtml(vm, open) {
    var chip = vm.active
      ? '<span class="filter-chip filter-chip--on">' + vm.matching + ' of ' + vm.total + '</span>'
      : '<span class="filter-chip">All</span>';

    var head =
      '<button type="button" class="filter-head" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        '<span class="material-symbols-outlined filter-head-icon">filter_alt</span>' +
        '<span class="filter-head-title">FILTERING</span>' +
        chip +
        '<span class="material-symbols-outlined filter-chevron">' + (open ? 'expand_less' : 'expand_more') + '</span>' +
      '</button>';

    if (!open) return head;

    var body =
      '<div class="filter-body">' +
        '<div class="filter-tree scroll-thin">' +
          vm.categories.map(function (c) { return catRow(c, !!openCats[c.name]); }).join('') +
        '</div>' +
        '<div class="filter-foot">' +
          '<span class="filter-foot-text">' +
            (vm.active ? 'Showing ' + vm.matching + ' of ' + vm.total + ' farms'
                       : 'All ' + vm.total + ' farms') +
          '</span>' +
          '<button type="button" class="filter-action" data-act="all">All</button>' +
          '<button type="button" class="filter-action" data-act="none">None</button>' +
        '</div>' +
      '</div>';

    return head + body;
  }

  // ---- DOM -------------------------------------------------------------------

  function render(state, elId) {
    var m = mounts[elId];
    if (!m || !m.el) return;
    var el = m.el;
    if (!state.filterScope) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.classList.toggle('filter-panel--open', expanded);
    var vm = ff.viewModel(state);
    el.innerHTML = panelHtml(vm, expanded);
    // Partly-ticked categories read as indeterminate — a property, not an
    // attribute, so it has to be set after the innerHTML swap.
    var partial = {};
    vm.categories.forEach(function (c) { if (c.partial) partial[c.name] = true; });
    el.querySelectorAll('.filter-catbox').forEach(function (cb) {
      if (partial[cb.dataset.key]) cb.indeterminate = true;
    });
    wire(state, el);
  }

  // Re-render every mounted panel (both chromes share one selection).
  function renderAll(state) {
    Object.keys(mounts).forEach(function (id) { render(state, id); });
  }

  // A filter change moves the map AND every number on the route.
  function changed(state) {
    ff.apply(state);
    renderAll(state);
    if (W.dashboard.router && W.dashboard.router.refreshAnalysis) {
      W.dashboard.router.refreshAnalysis(state);
    }
  }

  function wire(state, el) {
    var head = el.querySelector('.filter-head');
    if (head) head.addEventListener('click', function () {
      expanded = !expanded;
      renderAll(state);
    });

    el.querySelectorAll('.filter-row--cat').forEach(function (row) {
      row.addEventListener('click', function () {
        var name = row.dataset.cat;
        openCats[name] = !openCats[name];
        row.parentElement.classList.toggle('open', openCats[name]);
      });
    });

    el.querySelectorAll('.filter-catbox').forEach(function (cb) {
      cb.addEventListener('click', function (e) { e.stopPropagation(); });   // don't fold the row
      cb.addEventListener('change', function () {
        var cat = ff.treeFor(state.filterScope).filter(function (c) { return c.name === cb.dataset.key; })[0];
        if (!cat) return;
        ff.setKeys(cat.types.map(function (t) { return ff.keyOf(cat.name, t.name); }), cb.checked);
        changed(state);
      });
    });

    el.querySelectorAll('.filter-type').forEach(function (cb) {
      cb.addEventListener('change', function () {
        ff.setKeys([cb.dataset.key], cb.checked);
        changed(state);
      });
    });

    el.querySelectorAll('.filter-action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.act === 'all') ff.selectAll(state.filterScope);
        else ff.clearAll(state.filterScope);
        changed(state);
      });
    });
  }

  // Mount a panel element once (both chromes call this at init).
  function mount(elId) {
    var el = document.getElementById(elId);
    if (el) mounts[elId] = { el: el };
  }

  // Called on every route entry: set the scope this route filters by (null hides
  // the panel), re-derive the working set, and repaint.
  function show(state, scope) {
    if (state.filterScope !== scope) {
      state.filterScope = scope || null;
      ff.apply(state);
    }
    renderAll(state);
  }

  W.dashboard.filterPanel = {
    mount: mount,
    show: show,
    render: renderAll,
    // pure — exposed for tests
    panelHtml: panelHtml
  };

})(window.Wafra);
