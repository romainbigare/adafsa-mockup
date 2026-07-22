"use strict";

// Runnable with plain Node: `node test/formatScale.test.js` (no build/npm).
//
// The NUMBER CONTRACT, scale half: a module's formatted value must live in the
// SAME numeric space as its band ranges. This is the generic guard against the
// "canopy shows 0.50 next to a band labelled 50–64" class of bug — asserted for
// every numeric module at once, so it can never silently regress on any of them.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

function seededRandom(seed) {
  var h = 0, s = String(seed);
  for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs((Math.sin(h) * 10000) % 1);
}
var win = { Wafra: { random: { seededRandom: seededRandom }, color: { lerpColor: function () { return "rgb(0,0,0)"; }, TYPE_COLORS: {} }, mock: {} } };
function load(rel) { vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", rel), "utf8"), { window: win, console: console }); }
load("js/mock/metrics.js");
load("js/dashboard/modules.js");
load("js/dashboard/moduleRegistry.js");

var reg = win.Wafra.dashboard.moduleRegistry;
var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

function makeFarms(n) {
  var farms = [];
  for (var i = 1; i <= n; i++) {
    farms.push({
      fid: i * 3 + 1, owner: "Owner " + i, area: 8 + (i % 11) * 6,
      centroid: [23.8 + (i % 7) * 0.04, 53.7 + (i % 5) * 0.04],
      type: i % 2 === 0 ? "Palm" : "No Palm",
      rings: [[[0, 0], [0, 1], [1, 1]]]
    });
  }
  win.Wafra.dashboard.modules.prepare(farms);
  win.Wafra.mock.metrics.prepareFarmMetrics(farms);
  return farms;
}

// Strip formatting (%, +, spaces) → a bare number.
function num(s) { return parseFloat(String(s).replace(/[^0-9.\-]/g, "")); }

var farms = makeFarms(120);

console.log("numeric modules — formatted value sits on the band's scale");
["crop", "palms", "ier", "yield", "water"].forEach(function (key) {
  check(key + ": every formatted value is a rounded rendering of valueOf (same scale)", function () {
    var m = reg.byKey(key);
    var seen = 0;
    farms.forEach(function (f) {
      var v = m.valueOf(f);
      if (v == null || isNaN(v)) return;
      seen++;
      var parsed = num(m.format(v));
      assert.ok(!isNaN(parsed), key + " format() must be numeric, got " + m.format(v));
      // The formatted number must be within rounding distance of the raw value.
      // The old 0–1 canopy bug (0.50 vs 50) fails this by ~50.
      assert.ok(Math.abs(parsed - v) <= 1.0,
        key + " formatted " + m.format(v) + " (" + parsed + ") is off-scale vs value " + v);
    });
    assert.ok(seen > 0, key + " had at least one scored farm");
  });
});

console.log("categorical module — Structures formats to a band label, not a number");
check("structures.format returns one of its band labels", function () {
  var m = reg.byKey("structures");
  var labels = m.bands.map(function (b) { return b.label; });
  var seen = 0;
  farms.forEach(function (f) {
    var v = m.valueOf(f);
    if (v == null) return;
    seen++;
    assert.ok(labels.indexOf(m.format(v)) !== -1, "structures format '" + m.format(v) + "' is a band label");
  });
  assert.ok(seen > 0, "structures had scored farms");
});

console.log("\nAll " + passed + " checks passed.");
