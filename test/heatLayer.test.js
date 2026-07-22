"use strict";

// Runnable with plain Node: `node test/heatLayer.test.js`.
//
// The heat surface's intensity model is pure (no Leaflet): each farm's severity
// under the active lens (composite score or a module's normalised band severity),
// plus a faint baseline so healthy farms stay faintly visible. init() touches
// Leaflet/DOM and is not exercised here.

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
load("js/dashboard/heatLayer.js");

var heat = win.Wafra.dashboard.heatLayer;
assert.ok(heat && heat.severityFor && heat.points, "heatLayer should attach severityFor + points");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

function healthy(fid) {
  return { fid: fid || 1, owner: "H", area: 10, centroid: [24.1, 55.0],
    _mod: { ier: 95, yieldDev: 5, water: 95 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.92, cultivar: "Khalas", cultivatedFrac: 0.9, tier: "Open Agriculture", tierIdx: 0 } };
}
function crit(fid) {
  return { fid: fid || 2, owner: "C", area: 10, centroid: [24.2, 55.1],
    _mod: { ier: 30, yieldDev: 5, water: 150 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.45, cultivar: "Khalas", cultivatedFrac: 0.1, tier: "Open Agriculture", tierIdx: 0 } };
}

console.log("severity under a lens");
check("composite lens: healthy ~0, critical ~1", function () {
  var st = { activeModule: "composite" };
  assert.ok(heat.severityFor(st, healthy()) < 0.15, "healthy is cool");
  assert.ok(heat.severityFor(st, crit()) > 0.8, "critical is hot");
});
check("single-module lens (ier): a Critical farm reads full severity", function () {
  var st = { activeModule: "ier" };
  assert.strictEqual(heat.severityFor(st, crit()), 1, "ier<50 → sev 4/4 = 1");
  assert.ok(heat.severityFor(st, healthy()) < 0.3, "ier 95 → Excellent → low");
});
check("no lens → no severity boost", function () {
  assert.strictEqual(heat.severityFor({ activeModule: null }, crit()), 0);
});

console.log("heat points");
check("one [lat,lng,intensity] per on-map farm; intensity >= baseline", function () {
  var st = { activeModule: "composite", farmFeatures: [healthy(1), crit(2)] };
  var pts = heat.points(st);
  assert.strictEqual(pts.length, 2);
  pts.forEach(function (p) {
    assert.strictEqual(p.length, 3, "lat,lng,intensity");
    assert.ok(p[2] >= 0.18 - 1e-9, "at least the baseline, got " + p[2]);
    assert.ok(p[2] <= 1 + 1e-9, "at most 1");
  });
  // the critical farm is hotter than the healthy one
  assert.ok(pts[1][2] > pts[0][2], "critical farm hotter");
});
check("off-map farms contribute no heat point", function () {
  var off = healthy(3); off._offMap = true;
  var st = { activeModule: "composite", farmFeatures: [healthy(1), off] };
  assert.strictEqual(heat.points(st).length, 1);
});

console.log("\nAll " + passed + " checks passed.");
