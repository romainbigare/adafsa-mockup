(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // F1 — Module registry: the single source of truth for the SIX contract
  // modules. Nav (Proposals A / A2) and the View dial (Proposal B) both read
  // from this, so "six modules" is one data model instead of a mix of band
  // modules (modules.js) and taxonomy browsers (viewportStats.js).
  //
  // Every module is expressed the same way: it maps a FARM (a plots feature)
  // to a value -> band -> colour. Three modules wrap the existing banded
  // modules in modules.js (Irrigation / Yield / Water); three are new
  // descriptors reading the mock per-farm metrics (`_farm`) stashed by
  // Wafra.mock.metrics.prepareFarmMetrics (Palms / Crop Monitoring / Structures).
  //
  // The band machinery (bandOf / colorOf / bandSummary / bandCounts) lives in
  // modules.js and is module-agnostic — it works on any object with `.bands`
  // and `.valueOf`, so all six modules reuse it unchanged.
  //
  // Pure logic, no DOM — unit-tested in test/moduleRegistry.test.js.
  // ============================================================================

  var M = W.dashboard.modules;         // band helpers + IER/Yield/Water cores
  var UNKNOWN = M.UNKNOWN_COLOR;

  // ---- New banded cores (same shape as modules.js MODULES entries) ----------
  // Each carries { key, label, icon, bands, valueOf(f), format(v) } so the
  // generic modules.js helpers accept them directly.

  // `sev` (attention severity, 0=fine..worse) — see modules.js. Structures is
  // categorical with no risk axis, so every tier is sev 0 (no "critical" state).

  // Crop Monitoring — cultivated fraction of the farm (0..100%).
  var CROP_BANDS = [
    { label: 'Cultivated',        range: '≥ 66%',   color: '#1a9850', min: 66,        sev: 0, contains: function (v) { return v >= 66; } },
    { label: 'Partially Fallow',  range: '33–66%',  color: '#fee08b', min: 33,        sev: 1, contains: function (v) { return v >= 33 && v < 66; } },
    { label: 'Fallow',            range: '< 33%',   color: '#d9a441', min: -Infinity, sev: 2, contains: function (v) { return v < 33; } }
  ];

  // Palms & Fruit Trees — canopy-health index (NDVI-like, 0..100).
  var CANOPY_BANDS = [
    { label: 'Healthy',        range: '≥ 80',  color: '#1a9850', min: 80,        sev: 0, contains: function (v) { return v >= 80; } },
    { label: 'Fair',           range: '65–79', color: '#91cf60', min: 65,        sev: 1, contains: function (v) { return v >= 65 && v < 80; } },
    { label: 'Stressed',       range: '50–64', color: '#fee08b', min: 50,        sev: 2, contains: function (v) { return v >= 50 && v < 65; } },
    { label: 'Severe Stress',  range: '< 50',  color: '#d73027', min: -Infinity, sev: 3, contains: function (v) { return v < 50; } }
  ];

  // Structures — land-use tier (categorical; value is the tier index 0..3).
  var TIER_BANDS = [
    { label: 'Open Agriculture', range: 'open',       color: '#78c679', min: 0, sev: 0, contains: function (v) { return v === 0; } },
    { label: 'Barren Land',      range: 'barren',     color: '#f0e68c', min: 1, sev: 0, contains: function (v) { return v === 1; } },
    { label: 'Protected',        range: 'protected',  color: '#41ab5d', min: 2, sev: 0, contains: function (v) { return v === 2; } },
    { label: 'Structures',       range: 'structures', color: '#fc8d59', min: 3, sev: 0, contains: function (v) { return v === 3; } }
  ];

  var cropCore = {
    key: 'crop', label: 'Crop Monitoring', icon: 'grass', bands: CROP_BANDS,
    valueOf: function (f) { return f._farm ? f._farm.cultivatedFrac * 100 : null; },
    format: function (v) { return Math.round(v) + '%'; }
  };
  var palmsCore = {
    key: 'palms', label: 'Palms & Fruit Trees', icon: 'park', bands: CANOPY_BANDS,
    // Only farms that actually carry trees get a canopy score.
    valueOf: function (f) { return (f._farm && f._farm.trees > 0 && f._farm.canopy != null) ? f._farm.canopy * 100 : null; },
    // Canopy health is a 0–100 score — display it on that scale everywhere so a
    // farm's value ("50") sits in the same space as its band range ("50–64").
    format: function (v) { return String(Math.round(v)); }
  };
  var structuresCore = {
    key: 'structures', label: 'Land Use & Structures', icon: 'home_work', bands: TIER_BANDS,
    valueOf: function (f) { return f._farm ? f._farm.tierIdx : null; },
    format: function (v) { var b = TIER_BANDS[Math.round(v)]; return b ? b.label : '—'; }
  };

  // ---- Aggregation helpers ---------------------------------------------------
  function values(module, features) {
    var out = [];
    for (var i = 0; i < features.length; i++) {
      var v = module.valueOf(features[i]);
      if (v != null && !isNaN(v)) out.push(v);
    }
    return out;
  }
  function mean(arr) { if (!arr.length) return 0; var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return s / arr.length; }
  function sum(features, fn) { var s = 0; for (var i = 0; i < features.length; i++) s += (fn(features[i]) || 0); return s; }
  function countBand(module, features, label) {
    return M.bandCounts(module, features)[label] || 0;
  }
  function fmtInt(n) { return Math.round(n).toLocaleString(); }
  function fmtCompact(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(Math.round(n));
  }

  // Per-band area share (%), in band order — powers scorecard micro-charts and
  // module legends. Reuses modules.bandSummary so shares match the tables.
  function bandShares(module, features) {
    return M.bandSummary(module, features).map(function (r) {
      return { label: r.label, color: r.color, range: r.range, share: r.share, count: r.count };
    });
  }

  // ---- Per-module product metadata ------------------------------------------
  // Each descriptor enriches a banded core with: feePct, a short label, the
  // severity() used to rank the attention list (higher = needs attention), the
  // KPI strip, and the scorecard rollup/headline. Kept declarative so a module
  // page (A/A2) and the dial (B) render identically from data.

  function kpi(label, value, warn) { return { label: label, value: value, warn: !!warn }; }

  var DESCRIPTORS = [
    {
      core: cropCore, feePct: 14.9, short: 'Crop Mon.',
      // More fallow -> more attention.
      severity: function (f) { var v = cropCore.valueOf(f); return v == null ? -1 : 100 - v; },
      kpis: function (fs) {
        var cultivated = sum(fs, function (f) { return f._farm ? f.area * f._farm.cultivatedFrac : 0; });
        var fallow = countBand(cropCore, fs, 'Fallow');
        return [
          kpi('Cultivated', fmtInt(cultivated) + ' dun'),
          kpi('Farms Monitored', fmtInt(values(cropCore, fs).length)),
          kpi('Avg Cultivated', Math.round(mean(values(cropCore, fs))) + '%'),
          kpi('Fully Fallow', fmtInt(fallow), fallow > 0)
        ];
      },
      rollup: function (fs) {
        var cultivated = sum(fs, function (f) { return f._farm ? f.area * f._farm.cultivatedFrac : 0; });
        var fallow = countBand(cropCore, fs, 'Fallow');
        return { headline: fmtInt(cultivated) + ' dun cultivated',
          status: fallow > 0 ? { label: fallow + ' fallow', kind: 'warn' } : { label: 'On Track', kind: 'ok' } };
      },
      summary: function (fs) {
        var fallow = countBand(cropCore, fs, 'Fallow');
        var cultivated = sum(fs, function (f) { return f._farm ? f.area * f._farm.cultivatedFrac : 0; });
        return fallow > 0 ? fmtInt(fallow) + ' farms fully fallow' : fmtInt(cultivated) + ' dunums cultivated';
      }
    },
    {
      core: palmsCore, feePct: 31.6, short: 'Palms/Trees', hero: true,
      severity: function (f) { var v = palmsCore.valueOf(f); return v == null ? -1 : 100 - v; },
      kpis: function (fs) {
        var trees = sum(fs, function (f) { return f._farm ? f._farm.trees : 0; });
        var palms = sum(fs, function (f) { return f._farm ? f._farm.datePalms : 0; });
        var scored = values(palmsCore, fs);
        var stress = countBand(palmsCore, fs, 'Stressed') + countBand(palmsCore, fs, 'Severe Stress');
        var stressPct = scored.length ? (stress / scored.length * 100) : 0;
        var cultivars = {};
        fs.forEach(function (f) { if (f._farm && f._farm.cultivar) cultivars[f._farm.cultivar] = 1; });
        return [
          kpi('Trees Counted', fmtInt(trees)),
          kpi('Date Palms', fmtInt(palms)),
          kpi("Cultivars ID'd", String(Object.keys(cultivars).length)),
          kpi('Canopy Stress', stressPct.toFixed(1) + '%', stressPct > 0),
          kpi('Avg Health', mean(scored) ? String(Math.round(mean(scored))) : '—')
        ];
      },
      rollup: function (fs) {
        var trees = sum(fs, function (f) { return f._farm ? f._farm.trees : 0; });
        var scored = values(palmsCore, fs);
        var stress = countBand(palmsCore, fs, 'Stressed') + countBand(palmsCore, fs, 'Severe Stress');
        var stressPct = scored.length ? (stress / scored.length * 100) : 0;
        return { headline: fmtCompact(trees) + ' trees',
          status: stressPct > 0 ? { label: stressPct.toFixed(1) + '% canopy stress', kind: 'warn' } : { label: 'Healthy', kind: 'ok' } };
      },
      summary: function (fs) {
        var scored = values(palmsCore, fs);
        var stress = countBand(palmsCore, fs, 'Stressed') + countBand(palmsCore, fs, 'Severe Stress');
        var pct = scored.length ? (stress / scored.length * 100) : 0;
        var trees = sum(fs, function (f) { return f._farm ? f._farm.trees : 0; });
        return Math.round(pct) + '% canopy stress · ' + fmtCompact(trees) + ' trees';
      }
    },
    {
      core: structuresCore, feePct: 21.0, short: 'Land Use',
      severity: function (f) { return f.area || 0; }, // no risk axis — rank by size
      kpis: function (fs) {
        return [
          kpi('Structures', fmtInt(countBand(structuresCore, fs, 'Structures'))),
          kpi('Protected', fmtInt(countBand(structuresCore, fs, 'Protected'))),
          kpi('Open Agriculture', fmtInt(countBand(structuresCore, fs, 'Open Agriculture'))),
          kpi('Barren', fmtInt(countBand(structuresCore, fs, 'Barren Land')))
        ];
      },
      rollup: function (fs) {
        var detected = countBand(structuresCore, fs, 'Structures') + countBand(structuresCore, fs, 'Protected');
        return { headline: fmtInt(detected) + ' built', status: { label: '4 tiers', kind: 'ok' } };
      },
      summary: function (fs) {
        return fmtInt(countBand(structuresCore, fs, 'Open Agriculture')) + ' open-ag · ' +
          fmtInt(countBand(structuresCore, fs, 'Structures')) + ' structures';
      }
    },
    {
      core: M.byKey('ier'), feePct: 10.5, short: 'Irrigation',
      severity: function (f) { var v = M.byKey('ier').valueOf(f); return v == null ? -1 : 100 - v; },
      kpis: function (fs) {
        var m = M.byKey('ier'); var scored = values(m, fs);
        var critical = countBand(m, fs, 'Critical');
        return [
          kpi('Farms Scored', fmtInt(scored.length)),
          kpi('Critical', fmtInt(critical), critical > 0),
          kpi('Avg Score', Math.round(mean(scored)) || '—'),
          kpi('Poor or Worse', fmtInt(critical + countBand(m, fs, 'Poor')), true)
        ];
      },
      rollup: function (fs) {
        // The headline number and its label MUST describe the same set. This is
        // "Poor + Critical", so it says "poor or worse" — never "critical" (the
        // KPI strip keeps a separate, smaller Critical-only tile).
        var m = M.byKey('ier');
        var poorOrWorse = countBand(m, fs, 'Critical') + countBand(m, fs, 'Poor');
        return { headline: fmtInt(poorOrWorse) + ' farms poor or worse',
          status: poorOrWorse > 0 ? { label: 'Needs review', kind: 'warn' } : { label: 'On Track', kind: 'ok' } };
      },
      summary: function (fs) {
        var m = M.byKey('ier');
        var crit = countBand(m, fs, 'Critical');
        return fmtInt(crit) + ' critical · ' + fmtInt(crit + countBand(m, fs, 'Poor')) + ' poor or worse';
      }
    },
    {
      core: M.byKey('yield'), feePct: 12.6, short: 'Yield',
      severity: function (f) { var v = M.byKey('yield').valueOf(f); return v == null ? -999 : -v; },
      kpis: function (fs) {
        var m = M.byKey('yield'); var scored = values(m, fs);
        var under = countBand(m, fs, 'Significantly Underperforming');
        return [
          kpi('Farms Scored', fmtInt(scored.length)),
          kpi('Avg Deviation', (mean(scored) >= 0 ? '+' : '') + Math.round(mean(scored)) + '%'),
          kpi('Underperforming', fmtInt(under), under > 0),
          kpi('Above Expected', fmtInt(countBand(m, fs, 'Above Expected')))
        ];
      },
      rollup: function () {
        return { headline: 'baseline period', status: { label: 'Counts from M6', kind: 'ok' } };
      },
      summary: function () { return 'Baseline period — counts from month 6'; }
    },
    {
      core: M.byKey('water'), feePct: 9.4, short: 'Water',
      severity: function (f) { var v = M.byKey('water').valueOf(f); return v == null ? -1 : v - 100; },
      kpis: function (fs) {
        var m = M.byKey('water'); var scored = values(m, fs);
        var over = countBand(m, fs, 'Over-Allocated');
        return [
          kpi('Farms Scored', fmtInt(scored.length)),
          kpi('Over-Allocated', fmtInt(over), over > 0),
          kpi('Avg Use', Math.round(mean(scored)) + '%'),
          kpi('Efficient', fmtInt(countBand(m, fs, 'Efficient')))
        ];
      },
      rollup: function (fs) {
        var m = M.byKey('water'); var over = countBand(m, fs, 'Over-Allocated');
        return { headline: fmtInt(over) + ' over-allocated',
          status: over > 0 ? { label: 'Flags', kind: 'warn' } : { label: 'Balanced', kind: 'ok' } };
      },
      summary: function (fs) {
        var m = M.byKey('water');
        return fmtInt(countBand(m, fs, 'Over-Allocated')) + ' farms over-allocated';
      }
    }
  ];

  // ---- Assemble the public module objects -----------------------------------
  // A registry module IS its banded core (so modules.js helpers accept it),
  // plus the product metadata above.
  var MODULES = DESCRIPTORS.map(function (d) {
    var core = d.core;
    var worstSev = 0;
    core.bands.forEach(function (b) { if ((b.sev || 0) > worstSev) worstSev = b.sev || 0; });
    return {
      key: core.key, label: core.label, shortLabel: d.short, icon: core.icon,
      feePct: d.feePct, hero: !!d.hero,
      bands: core.bands, valueOf: core.valueOf, format: core.format,
      severity: d.severity, kpis: d.kpis, rollup: d.rollup, summary: d.summary,
      worstSev: worstSev
    };
  });

  var BY_KEY = {};
  MODULES.forEach(function (m) { BY_KEY[m.key] = m; });

  function colourOf(module, feature) { return M.colorOf(module, feature); }
  function bandOf(module, feature) { return M.bandOf(module, feature); }

  // ---- Composite criticality (the Overview lens) ----------------------------
  // One fee-weighted criticality score per farm, 0 (healthy on everything) .. 100
  // (worst on everything). Each module's band severity is normalised by that
  // module's own worst severity, weighted by contract share, and averaged over
  // the modules that actually score the farm. This is the Overview map's default
  // colouring — "how much does this farm need attention, across everything?" —
  // so no single arbitrary module drives the landing; a per-module breakdown
  // shows on hover. It plugs into every band helper because it is shaped like a
  // module (bands + valueOf).
  var COMPOSITE_BANDS = [
    { label: 'Healthy',  range: '0–9',   color: '#1a9850', sev: 0, contains: function (v) { return v < 10; } },
    { label: 'Watch',    range: '10–24', color: '#a6d96a', sev: 1, contains: function (v) { return v >= 10 && v < 25; } },
    { label: 'Elevated', range: '25–44', color: '#fdae61', sev: 2, contains: function (v) { return v >= 25 && v < 45; } },
    { label: 'Critical', range: '≥ 45',  color: '#d73027', sev: 3, contains: function (v) { return v >= 45; } }
  ];
  function compositeScore(feature) {
    var total = 0, wsum = 0;
    for (var i = 0; i < MODULES.length; i++) {
      var m = MODULES[i];
      var band = bandOf(m, feature);
      if (!band || !m.worstSev) continue;               // unscored / categorical → no contribution
      total += m.feePct * ((band.sev || 0) / m.worstSev);
      wsum += m.feePct;
    }
    return wsum ? (total / wsum) * 100 : null;
  }
  var COMPOSITE = {
    key: 'composite', label: 'Overall health', icon: 'monitor_heart', bands: COMPOSITE_BANDS,
    valueOf: compositeScore, format: function (v) { return String(Math.round(v)); },
    worstSev: 3
  };

  function byKey(k) { return BY_KEY[k] || (k === 'composite' ? COMPOSITE : null); }

  // Per-farm module breakdown (for the map hover + the dossier): every module's
  // band + formatted value, plus the composite. Pure data.
  function farmBreakdown(feature) {
    var rows = MODULES.map(function (m) {
      var b = bandOf(m, feature);
      var v = m.valueOf(feature);
      return { key: m.key, label: m.label, band: b ? b.label : null, color: b ? b.color : UNKNOWN,
        value: (v == null) ? null : m.format(v) };
    });
    var cb = bandOf(COMPOSITE, feature);
    var cs = compositeScore(feature);
    return { score: cs, band: cb ? cb.label : null, color: cb ? cb.color : UNKNOWN, rows: rows };
  }

  // ---- Region severity (the COLOUR CONTRACT, roll-up side) -------------------
  // A module escalates from 'warn' to 'critical' when a meaningful share of its
  // scored farms fall in its WORST band(s). Tunable single knob:
  var CRITICAL_SHARE = 0.10;   // ≥10% of scored farms in the worst band -> critical

  // Labels of the worst (highest-severity) band(s) of a module — the ones that
  // count as "critical". Empty for categorical modules (worstSev === 0).
  function worstBandLabels(module) {
    if (!module || !module.worstSev) return [];
    return module.bands.filter(function (b) { return (b.sev || 0) === module.worstSev; })
      .map(function (b) { return b.label; });
  }

  // How many features sit in the module's worst band(s) — powers the red cluster
  // badge and the region status. 0 for categorical modules.
  function criticalCountOf(module, features) {
    var labels = worstBandLabels(module);
    if (!labels.length) return 0;
    var counts = M.bandCounts(module, features);
    var n = 0;
    labels.forEach(function (l) { n += counts[l] || 0; });
    return n;
  }

  // The tri-state region status kind for a module: 'ok' | 'warn' | 'critical'.
  // Never downgrades a roll-up 'ok'; upgrades 'warn' to 'critical' when the
  // worst band holds ≥ CRITICAL_SHARE of scored farms.
  function statusKindOf(module, features) {
    var base = module.rollup(features).status.kind;   // 'ok' | 'warn'
    if (base === 'ok') return 'ok';
    var scored = values(module, features).length;
    var crit = criticalCountOf(module, features);
    return (scored && crit / scored >= CRITICAL_SHARE) ? 'critical' : 'warn';
  }

  // Full legend rows (label + colour + range) for a module.
  function legend(module) {
    return module.bands.map(function (b) { return { label: b.label, color: b.color, range: b.range }; });
  }

  // Scorecard view-model (consumed by scorecard.js). Pure data, no DOM.
  // statusKind is the tri-state ('ok'|'warn'|'critical') so a calm Situation
  // screen can make genuine problems glow; criticalCount feeds the verdict.
  function cardModel(module, features) {
    var r = module.rollup(features);
    return {
      key: module.key, label: module.label, shortLabel: module.shortLabel,
      icon: module.icon, feePct: module.feePct, hero: module.hero,
      headline: r.headline,
      statusLabel: r.status.label, statusKind: statusKindOf(module, features),
      summary: module.summary ? module.summary(features) : r.headline,
      criticalCount: criticalCountOf(module, features),
      bands: bandShares(module, features)
    };
  }

  // Region rollups for every module at once (the Home scorecard numbers).
  function regionRollups(features) {
    var out = {};
    MODULES.forEach(function (m) { out[m.key] = cardModel(m, features); });
    return out;
  }

  W.dashboard.moduleRegistry = {
    MODULES: MODULES,
    byKey: byKey,
    colourOf: colourOf,
    bandOf: bandOf,
    legend: legend,
    bandShares: bandShares,
    cardModel: cardModel,
    regionRollups: regionRollups,
    // severity / colour-contract helpers
    worstBandLabels: worstBandLabels,
    criticalCountOf: criticalCountOf,
    statusKindOf: statusKindOf,
    CRITICAL_SHARE: CRITICAL_SHARE,
    // composite criticality (Overview lens) + per-farm breakdown
    COMPOSITE: COMPOSITE,
    compositeScore: compositeScore,
    farmBreakdown: farmBreakdown,
    // exposed for tests / reuse
    cores: { crop: cropCore, palms: palmsCore, structures: structuresCore }
  };

})(window.Wafra);
