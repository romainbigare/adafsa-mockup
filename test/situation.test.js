"use strict";

// Runnable with plain Node: `node test/situation.test.js` (no build/npm).
//
// The Situation model is pure (no DOM): the verdict sentence and the default
// "Colour by" pick. We load the registry chain so situation.js's IIFE resolves,
// then exercise verdict()/pickDefaultModule() on fabricated card models.

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
load("js/dashboard/situation.js");

var sit = win.Wafra.dashboard.situation;
assert.ok(sit, "situation.js should attach Wafra.dashboard.situation");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// Fabricate the six card models the registry would produce, with a given
// statusKind per module (nav order: crop, palms, structures, ier, yield, water).
function m(key, label, feePct, kind, hero) {
  return { key: key, label: label, feePct: feePct, statusKind: kind, hero: !!hero };
}
function sixWith(kinds) {
  var meta = [
    ["crop", "Crop Monitoring", 14.9, false],
    ["palms", "Palms & Fruit Trees", 31.6, true],
    ["structures", "Structures", 21.0, false],
    ["ier", "Irrigation Efficiency", 10.5, false],
    ["yield", "Yield Forecast", 12.6, false],
    ["water", "Water Allocation", 9.4, false]
  ];
  return meta.map(function (x, i) { return m(x[0], x[1], x[2], kinds[i], x[3]); });
}

console.log("verdict sentence");
check("all-ok reads 'All six areas are normal.'", function () {
  var v = sit.verdict(sixWith(["ok", "ok", "ok", "ok", "ok", "ok"]));
  assert.strictEqual(v.kind, "ok");
  assert.strictEqual(v.sentence, "All six areas are normal.");
  assert.strictEqual(v.keys.length, 0);
});
check("one warn names the module and counts it", function () {
  var v = sit.verdict(sixWith(["ok", "ok", "ok", "warn", "ok", "ok"]));
  assert.strictEqual(v.kind, "warn");
  assert.strictEqual(v.sentence, "1 of 6 areas need attention — Irrigation Efficiency.");
  assert.deepStrictEqual(v.keys.join(","), "ier");
});
check("any critical makes the whole verdict critical", function () {
  var v = sit.verdict(sixWith(["warn", "ok", "ok", "critical", "ok", "ok"]));
  assert.strictEqual(v.kind, "critical");
  assert.ok(/2 of 6 areas need attention/.test(v.sentence));
  assert.ok(/Crop Monitoring and Irrigation Efficiency/.test(v.sentence), "two names joined with 'and'");
});
check("three+ flagged use commas then 'and'", function () {
  var v = sit.verdict(sixWith(["critical", "ok", "ok", "critical", "ok", "warn"]));
  assert.ok(/Crop Monitoring, Irrigation Efficiency and Water Allocation/.test(v.sentence), v.sentence);
});
check("the sentence carries no jargon keys (labels only)", function () {
  var v = sit.verdict(sixWith(["ok", "ok", "ok", "critical", "ok", "warn"]));
  ["ier", "yield", "water", "crop", "palms", "structures", "NDVI"].forEach(function (tok) {
    assert.ok(v.sentence.indexOf(tok) === -1, "sentence must not contain '" + tok + "'");
  });
});

console.log("default Colour-by");
check("prefers critical over warn, then heaviest fee", function () {
  // ier critical (10.5) vs crop warn (14.9): critical wins despite lower fee.
  assert.strictEqual(sit.pickDefaultModule(sixWith(["warn", "ok", "ok", "critical", "ok", "ok"])), "ier");
  // two warns: heavier fee wins (crop 14.9 > water 9.4).
  assert.strictEqual(sit.pickDefaultModule(sixWith(["warn", "ok", "ok", "ok", "ok", "warn"])), "crop");
});
check("falls back to the hero module when nothing is flagged", function () {
  assert.strictEqual(sit.pickDefaultModule(sixWith(["ok", "ok", "ok", "ok", "ok", "ok"])), "palms");
});

console.log("\nAll " + passed + " checks passed.");
