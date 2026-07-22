"use strict";

// Runnable with plain Node: `node test/moduleRegistry.test.js` (no build/npm).
//
// moduleRegistry.js is a classic browser script that reads window.Wafra. We
// stand up a minimal window with the seeded RNG + colour helpers, then load the
// dependency chain (metrics.js → modules.js → moduleRegistry.js) into one shared
// context and assert the six-module model: every module colours a farm, exposes
// KPIs + a scorecard rollup, and ranks its attention list worst-first.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

// --- Minimal Wafra harness ---
function seededRandom(seed) {
  var h = 0, s = String(seed);
  for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs((Math.sin(h) * 10000) % 1);
}
function lerpColor(c1, c2, t) { return "rgb(0,0,0)"; }
var win = {
  Wafra: {
    random: { seededRandom: seededRandom },
    color: { lerpColor: lerpColor, TYPE_COLORS: {} },
    mock: {}
  }
};

function load(rel) {
  var src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
  vm.runInNewContext(src, { window: win, console: console });
}
load("js/mock/metrics.js");
load("js/dashboard/modules.js");
load("js/dashboard/moduleRegistry.js");

var reg = win.Wafra.dashboard.moduleRegistry;
var mock = win.Wafra.mock.metrics;
assert.ok(reg, "moduleRegistry.js should attach Wafra.dashboard.moduleRegistry");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// A batch of fake farms with prepared metrics.
function makeFarms(n) {
  var farms = [];
  for (var i = 1; i <= n; i++) {
    farms.push({
      fid: i, owner: "Owner " + i, area: 10 + (i % 7) * 5,
      centroid: [23.8 + (i % 5) * 0.04, 53.7 + (i % 3) * 0.04],
      type: i % 2 === 0 ? "Palm" : "No Palm",
      rings: [[[0, 0], [0, 1], [1, 1]]]
    });
  }
  win.Wafra.dashboard.modules.prepare(farms);
  mock.prepareFarmMetrics(farms);
  return farms;
}

console.log("registry shape");
check("exactly six modules, expected keys + fee weights", function () {
  assert.strictEqual(reg.MODULES.length, 6);
  var keys = reg.MODULES.map(function (m) { return m.key; }).sort().join(",");
  assert.strictEqual(keys, "crop,ier,palms,structures,water,yield");
  // Fee weights (roughly) sum to 100% of the contract.
  var fee = reg.MODULES.reduce(function (s, m) { return s + m.feePct; }, 0);
  assert.ok(Math.abs(fee - 100) < 0.001, "fees sum to 100, got " + fee);
});
check("palms is the hero module (31.6%)", function () {
  var palms = reg.byKey("palms");
  assert.ok(palms.hero, "palms flagged hero");
  assert.strictEqual(palms.feePct, 31.6);
});

console.log("prepareFarmMetrics — deterministic per-farm mock metrics");
check("stashes _farm with sane values; deterministic across runs", function () {
  var a = makeFarms(20);
  a.forEach(function (f) {
    assert.ok(f._farm, "fid " + f.fid + " has _farm");
    assert.ok(f._farm.trees >= 0);
    assert.ok(f._farm.cultivatedFrac >= 0.15 && f._farm.cultivatedFrac <= 1.0);
    assert.ok(f._farm.tierIdx >= 0 && f._farm.tierIdx <= 3);
  });
  var b = makeFarms(20);
  assert.strictEqual(a[0]._farm.trees, b[0]._farm.trees, "trees deterministic");
  assert.strictEqual(a[3]._farm.cultivar, b[3]._farm.cultivar, "cultivar deterministic");
});
check("palm farms get trees + a cultivar; non-palm farms get neither", function () {
  var farms = makeFarms(10);
  var palm = farms.filter(function (f) { return f.type === "Palm"; })[0];
  var noPalm = farms.filter(function (f) { return f.type === "No Palm"; })[0];
  assert.ok(palm._farm.datePalms > 0, "palm farm has date palms");
  assert.ok(palm._farm.cultivar, "palm farm has a cultivar");
  assert.strictEqual(noPalm._farm.datePalms, 0, "non-palm farm has no date palms");
  assert.strictEqual(noPalm._farm.cultivar, null, "non-palm farm has no cultivar");
});

console.log("colouring — every module returns a colour for a sample farm");
check("colourOf is a non-empty string for all six modules", function () {
  var farm = makeFarms(1)[0];
  reg.MODULES.forEach(function (m) {
    var c = reg.colourOf(m, farm);
    assert.ok(typeof c === "string" && c.length > 0, m.key + " colour is a string");
  });
});
check("a value-less farm falls back to UNKNOWN colour", function () {
  var palms = reg.byKey("palms");
  // A farm with no trees has no canopy score.
  var farm = { _farm: { trees: 0, canopy: null } };
  assert.strictEqual(palms.valueOf(farm), null);
  assert.strictEqual(reg.colourOf(palms, farm), win.Wafra.dashboard.modules.UNKNOWN_COLOR);
});

console.log("KPIs + rollups — every module produces a card model");
check("kpis() returns labelled values; rollup() a headline + status", function () {
  var farms = makeFarms(60);
  reg.MODULES.forEach(function (m) {
    var kpis = m.kpis(farms);
    assert.ok(Array.isArray(kpis) && kpis.length >= 3, m.key + " has KPIs");
    kpis.forEach(function (k) {
      assert.ok(k.label, m.key + " KPI has a label");
      assert.ok(k.value != null, m.key + " KPI has a value");
    });
    var vm = reg.cardModel(m, farms);
    assert.ok(vm.headline, m.key + " rollup has a headline");
    assert.ok(vm.statusKind === "ok" || vm.statusKind === "warn" || vm.statusKind === "critical", m.key + " status kind valid");
    assert.ok(typeof vm.criticalCount === "number", m.key + " card model carries a critical count");
    assert.ok(typeof vm.summary === "string" && vm.summary.length, m.key + " card model carries a plain summary");
    assert.ok(Array.isArray(vm.bands), m.key + " card model has band shares");
  });
});
check("regionRollups covers all six keys", function () {
  var farms = makeFarms(30);
  var r = reg.regionRollups(farms);
  assert.strictEqual(Object.keys(r).sort().join(","), "crop,ier,palms,structures,water,yield");
});

console.log("legend — band metadata per module");
check("legend rows carry label + colour + range", function () {
  reg.MODULES.forEach(function (m) {
    var rows = reg.legend(m);
    assert.ok(rows.length >= 3, m.key + " legend has rows");
    rows.forEach(function (row) {
      assert.ok(row.label && row.color, m.key + " legend row complete");
    });
  });
});

console.log("severity — attention ranking is worst-first");
check("a more-stressed palm farm outranks a healthy one", function () {
  var palms = reg.byKey("palms");
  var healthy = { _farm: { trees: 100, canopy: 0.9 } };  // canopy 90
  var stressed = { _farm: { trees: 100, canopy: 0.4 } }; // canopy 40
  assert.ok(palms.severity(stressed) > palms.severity(healthy),
    "stressed farm has higher severity");
});
check("water severity increases with over-allocation", function () {
  var water = reg.byKey("water");
  var over = { _mod: { water: 160 } };
  var fine = { _mod: { water: 95 } };
  assert.ok(water.severity(over) > water.severity(fine));
});

console.log("\nAll " + passed + " checks passed.");
