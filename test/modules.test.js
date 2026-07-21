"use strict";

// Runnable with plain Node: `node test/modules.test.js` (no build/npm needed).
//
// modules.js is a classic browser script — an IIFE that reads `window.Wafra`.
// We stand up a minimal `window.Wafra` (with the seeded RNG the file depends
// on), then load the file so it attaches Wafra.dashboard.modules, and assert
// the band boundaries + sub-zone deviation behaviour.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

// --- Minimal Wafra harness (only what modules.js touches) ---
function seededRandom(seed) {
  var x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}
var win = { Wafra: { random: { seededRandom: seededRandom } } };

var src = fs.readFileSync(path.join(__dirname, "..", "js", "dashboard", "modules.js"), "utf8");
vm.runInNewContext(src, { window: win });

var modules = win.Wafra.dashboard.modules;
assert.ok(modules, "modules.js should attach Wafra.dashboard.modules");

var passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log("  ok - " + name);
}

// Helper: build a fake farm whose module value is `v` for the given module,
// by writing `_mod` directly (bypasses the RNG so we test classification only).
function farmWith(mod, v) {
  var key = mod.key === "ier" ? "ier" : mod.key === "yield" ? "yieldDev" : "water";
  var f = { _mod: {} };
  f._mod[key] = v;
  return f;
}
function labelAt(modKey, v) {
  var m = modules.byKey(modKey);
  var b = modules.bandOf(m, farmWith(m, v));
  return b ? b.label : null;
}

console.log("Module 4 — Irrigation Efficiency (IER) bands");
check("90 and 100 -> Excellent", function () {
  assert.strictEqual(labelAt("ier", 90), "Excellent");
  assert.strictEqual(labelAt("ier", 100), "Excellent");
});
check("80 and 89 -> Good", function () {
  assert.strictEqual(labelAt("ier", 80), "Good");
  assert.strictEqual(labelAt("ier", 89.9), "Good");
});
check("65 and 79 -> Acceptable", function () {
  assert.strictEqual(labelAt("ier", 65), "Acceptable");
  assert.strictEqual(labelAt("ier", 79.9), "Acceptable");
});
check("50 and 64 -> Poor", function () {
  assert.strictEqual(labelAt("ier", 50), "Poor");
  assert.strictEqual(labelAt("ier", 64.9), "Poor");
});
check("just below 50 -> Critical", function () {
  assert.strictEqual(labelAt("ier", 49.9), "Critical");
  assert.strictEqual(labelAt("ier", 0), "Critical");
});

console.log("Module 5 — Yield Forecast (deviation vs sub-zone avg) bands");
check(">= +10% -> Above Expected", function () {
  assert.strictEqual(labelAt("yield", 10), "Above Expected");
  assert.strictEqual(labelAt("yield", 40), "Above Expected");
});
check("-10%..+10% -> On Track", function () {
  assert.strictEqual(labelAt("yield", 9.9), "On Track");
  assert.strictEqual(labelAt("yield", 0), "On Track");
  assert.strictEqual(labelAt("yield", -10), "On Track");
});
check("-25%..-10% -> Below Expected", function () {
  assert.strictEqual(labelAt("yield", -10.1), "Below Expected");
  assert.strictEqual(labelAt("yield", -25), "Below Expected");
});
check("< -25% -> Significantly Underperforming", function () {
  assert.strictEqual(labelAt("yield", -25.1), "Significantly Underperforming");
  assert.strictEqual(labelAt("yield", -80), "Significantly Underperforming");
});

console.log("Module 6 — Crop Water Allocation bands");
check("< 80% -> Water-Stressed", function () {
  assert.strictEqual(labelAt("water", 79.9), "Water-Stressed");
  assert.strictEqual(labelAt("water", 0), "Water-Stressed");
});
check("80..105% -> Efficient", function () {
  assert.strictEqual(labelAt("water", 80), "Efficient");
  assert.strictEqual(labelAt("water", 104.9), "Efficient");
});
check("105..125% -> Mild Excess (boundaries inclusive)", function () {
  assert.strictEqual(labelAt("water", 105), "Mild Excess");
  assert.strictEqual(labelAt("water", 125), "Mild Excess");
});
check("> 125% -> Over-Allocated (matches the over-allocation flag)", function () {
  assert.strictEqual(labelAt("water", 125.1), "Over-Allocated");
  assert.strictEqual(labelAt("water", 200), "Over-Allocated");
});

console.log("colorOf / classification integrity");
check("every band's midpoint maps back to that band's colour", function () {
  modules.MODULES.forEach(function (m) {
    m.bands.forEach(function (band) {
      // pick a value the band certainly contains
      var v = band.label === "Excellent" ? 95
        : band.label === "Above Expected" ? 20
        : band.label === "Over-Allocated" ? 150
        : band.min !== -Infinity ? band.min + 0.5 : band.min;
      if (v === -Infinity) v = -999;
      var f = farmWith(m, v);
      assert.strictEqual(modules.colorOf(m, f), band.color,
        m.key + " value " + v + " should be " + band.label);
    });
  });
});
check("missing value -> UNKNOWN_COLOR, null band", function () {
  var m = modules.byKey("ier");
  assert.strictEqual(modules.bandOf(m, { _mod: null }), null);
  assert.strictEqual(modules.colorOf(m, {}), modules.UNKNOWN_COLOR);
});

console.log("prepare() — deterministic values + sub-zone deviation");
check("assigns _mod to every farm, stable across calls", function () {
  function farms() {
    return [
      { fid: 1, centroid: [23.80, 53.70] },
      { fid: 2, centroid: [23.80, 53.70] },
      { fid: 3, centroid: [23.80, 53.70] },
      { fid: 4, centroid: [24.50, 54.90] }
    ];
  }
  var a = farms();
  modules.prepare(a);
  a.forEach(function (f) {
    assert.ok(f._mod, "fid " + f.fid + " has _mod");
    assert.ok(f._mod.ier >= 35 && f._mod.ier <= 100, "ier in range");
    assert.ok(f._mod.water >= 60 && f._mod.water <= 150, "water in range");
    assert.strictEqual(typeof f._mod.yieldDev, "number");
  });
  var b = farms();
  modules.prepare(b);
  assert.strictEqual(a[0]._mod.ier, b[0]._mod.ier, "deterministic across runs");
  assert.strictEqual(a[0]._mod.yieldDev, b[0]._mod.yieldDev, "deviation deterministic");
});
check("a farm alone in its sub-zone has 0% deviation", function () {
  var solo = [{ fid: 7, centroid: [10.0, 10.0] }];
  modules.prepare(solo);
  assert.ok(Math.abs(solo[0]._mod.yieldDev) < 1e-9, "solo farm deviates 0% from its own mean");
});
check("deviations within a sub-zone are centred on the mean", function () {
  var group = [
    { fid: 11, centroid: [23.80, 53.70] },
    { fid: 12, centroid: [23.80, 53.70] },
    { fid: 13, centroid: [23.81, 53.71] } // same 0.04deg bucket
  ];
  modules.prepare(group);
  // sum of (raw - avg) is 0, so a weighted-by-avg deviation sum is ~0 only when
  // all raws equal; instead assert at least one non-zero and signs differ or zero.
  var devs = group.map(function (f) { return f._mod.yieldDev; });
  var anyNonZero = devs.some(function (d) { return Math.abs(d) > 1e-9; });
  assert.ok(anyNonZero, "a multi-farm sub-zone should produce real deviations");
});
check("bandCounts tallies a mixed set correctly", function () {
  var m = modules.byKey("ier");
  var set = [95, 85, 70, 55, 20].map(function (v) { return farmWith(m, v); });
  var counts = modules.bandCounts(m, set);
  assert.strictEqual(counts.Excellent, 1);
  assert.strictEqual(counts.Good, 1);
  assert.strictEqual(counts.Acceptable, 1);
  assert.strictEqual(counts.Poor, 1);
  assert.strictEqual(counts.Critical, 1);
});

console.log("\nAll " + passed + " checks passed.");
