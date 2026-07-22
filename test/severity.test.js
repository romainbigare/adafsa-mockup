"use strict";

// Runnable with plain Node: `node test/severity.test.js` (no build/npm).
//
// The COLOUR CONTRACT (roll-up side) + rollup honesty:
//  - worst-band severity is explicit and monotonic;
//  - criticalCountOf counts exactly the worst band(s);
//  - statusKindOf is tri-state and only escalates warn→critical on a real share;
//  - every rollup headline's NUMBER is reproducible from band counts (so the
//    Home card and the module page can never disagree — the "223 vs 105" bug).

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
var mods = win.Wafra.dashboard.modules;
var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

function makeFarms(n) {
  var farms = [];
  for (var i = 1; i <= n; i++) {
    farms.push({
      fid: i, owner: "Owner " + i, area: 8 + (i % 11) * 6,
      centroid: [23.8 + (i % 7) * 0.04, 53.7 + (i % 5) * 0.04],
      type: i % 2 === 0 ? "Palm" : "No Palm",
      rings: [[[0, 0], [0, 1], [1, 1]]]
    });
  }
  mods.prepare(farms);
  win.Wafra.mock.metrics.prepareFarmMetrics(farms);
  return farms;
}

var farms = makeFarms(200);

console.log("worst-band severity");
check("every module exposes a worstSev; risk modules have worstSev > 0", function () {
  reg.MODULES.forEach(function (m) {
    assert.ok(typeof m.worstSev === "number", m.key + " has worstSev");
  });
  assert.ok(reg.byKey("structures").worstSev === 0, "structures is categorical (worstSev 0)");
  ["ier", "water", "palms", "crop", "yield"].forEach(function (k) {
    assert.ok(reg.byKey(k).worstSev > 0, k + " has a risk axis");
  });
});
check("worstBandLabels are the highest-severity bands; empty for categorical", function () {
  // Compare as joined strings — the arrays cross the vm realm boundary, so
  // deepStrictEqual would reject them on prototype identity alone.
  assert.strictEqual(reg.worstBandLabels(reg.byKey("ier")).join("|"), "Critical");
  assert.strictEqual(reg.worstBandLabels(reg.byKey("water")).join("|"), "Over-Allocated");
  assert.strictEqual(reg.worstBandLabels(reg.byKey("palms")).join("|"), "Severe Stress");
  assert.strictEqual(reg.worstBandLabels(reg.byKey("structures")).join("|"), "");
});
check("criticalCountOf equals the worst band(s) tally; 0 for categorical", function () {
  var ier = reg.byKey("ier");
  var counts = mods.bandCounts(ier, farms);
  assert.strictEqual(reg.criticalCountOf(ier, farms), counts["Critical"]);
  assert.strictEqual(reg.criticalCountOf(reg.byKey("structures"), farms), 0);
});

console.log("tri-state status");
check("statusKindOf is one of ok/warn/critical and never downgrades an ok rollup", function () {
  reg.MODULES.forEach(function (m) {
    var k = reg.statusKindOf(m, farms);
    assert.ok(k === "ok" || k === "warn" || k === "critical", m.key + " valid kind");
    if (m.rollup(farms).status.kind === "ok") assert.strictEqual(k, "ok", m.key + " ok stays ok");
  });
});
check("escalates to critical only when the worst band holds >= CRITICAL_SHARE", function () {
  var ier = reg.byKey("ier");
  var scored = farms.filter(function (f) { return ier.valueOf(f) != null; }).length;
  var crit = reg.criticalCountOf(ier, farms);
  var expect = (scored && crit / scored >= reg.CRITICAL_SHARE) ? "critical" : "warn";
  // ier always has poor-or-worse in this fixture, so it is never 'ok'.
  assert.strictEqual(reg.statusKindOf(ier, farms), expect);
});

console.log("rollup honesty — headline numbers are reproducible from band counts");
check("IER headline says 'poor or worse' and equals Poor + Critical", function () {
  var ier = reg.byKey("ier");
  var counts = mods.bandCounts(ier, farms);
  var expected = counts["Poor"] + counts["Critical"];
  var head = ier.rollup(farms).headline;
  assert.ok(/poor or worse/.test(head), "label reads 'poor or worse', got: " + head);
  assert.strictEqual(parseInt(head.replace(/[^0-9]/g, ""), 10), expected,
    "headline number equals Poor+Critical (" + expected + "), got: " + head);
});
check("Water headline count equals Over-Allocated", function () {
  var water = reg.byKey("water");
  var counts = mods.bandCounts(water, farms);
  var head = water.rollup(farms).headline;
  assert.strictEqual(parseInt(head.replace(/[^0-9]/g, ""), 10), counts["Over-Allocated"],
    "water headline equals Over-Allocated, got: " + head);
});

console.log("\nAll " + passed + " checks passed.");
