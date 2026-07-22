"use strict";

// Runnable with plain Node: `node test/composite.test.js`.
//
// The Overview lens: a fee-weighted criticality score per farm, 0 (healthy on
// everything) .. 100 (worst on everything), plugged into the band machinery so
// it colours the map + legend like any module. Guards the score maths, the band
// mapping and the per-farm breakdown (the hover content).

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

function healthy() {
  return { fid: 1, owner: "H", area: 10,
    _mod: { ier: 95, yieldDev: 5, water: 95 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.92, cultivar: "Khalas", cultivatedFrac: 0.9, tier: "Open Agriculture", tierIdx: 0 } };
}
function critical() {
  return { fid: 2, owner: "C", area: 10,
    _mod: { ier: 30, yieldDev: 5, water: 150 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.45, cultivar: "Khalas", cultivatedFrac: 0.1, tier: "Open Agriculture", tierIdx: 0 } };
}
function palmsOnly() {
  return { fid: 3, owner: "P", area: 10,
    _mod: { ier: 95, yieldDev: 5, water: 95 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.55, cultivar: "Khalas", cultivatedFrac: 0.9, tier: "Open Agriculture", tierIdx: 0 } };
}

console.log("composite score");
check("byKey('composite') returns the composite lens", function () {
  var c = reg.byKey("composite");
  assert.ok(c && c.key === "composite", "composite resolvable");
  assert.strictEqual(c.label, "Overall criticality");
});
check("a healthy farm scores ~0 and bands Healthy", function () {
  var s = reg.compositeScore(healthy());
  assert.ok(s < 10, "healthy score < 10, got " + s);
  assert.strictEqual(reg.bandOf(reg.COMPOSITE, healthy()).label, "Healthy");
});
check("a farm bad on everything scores high and bands Critical", function () {
  var s = reg.compositeScore(critical());
  assert.ok(s >= 45, "critical score >= 45, got " + s);
  assert.strictEqual(reg.bandOf(reg.COMPOSITE, critical()).label, "Critical");
});
check("severity is monotonic: critical > palms-only > healthy", function () {
  assert.ok(reg.compositeScore(critical()) > reg.compositeScore(palmsOnly()));
  assert.ok(reg.compositeScore(palmsOnly()) > reg.compositeScore(healthy()));
});
check("colourOf works through the composite (plugs into band machinery)", function () {
  var col = reg.colourOf(reg.COMPOSITE, critical());
  assert.ok(/^#/.test(col), "returns a hex colour, got " + col);
});

console.log("per-farm breakdown (hover content)");
check("farmBreakdown carries the composite + one row per module", function () {
  var bd = reg.farmBreakdown(critical());
  assert.ok(typeof bd.score === "number", "has a score");
  assert.strictEqual(bd.band, "Critical");
  assert.strictEqual(bd.rows.length, 6, "one row per contract module");
  var ier = bd.rows.filter(function (r) { return r.key === "ier"; })[0];
  assert.strictEqual(ier.band, "Critical");
  assert.strictEqual(ier.value, "30", "formatted on the module's own scale");
});

console.log("\nAll " + passed + " checks passed.");
