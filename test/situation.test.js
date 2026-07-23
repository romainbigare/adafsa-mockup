"use strict";

// Runnable with plain Node: `node test/situation.test.js` (no build/npm).
//
// The Situation model is pure (no DOM): which modules are flagged and how badly.
// We load the registry chain so situation.js's IIFE resolves, then exercise
// verdict() on fabricated card models.

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

console.log("verdict");
check("all-ok is 'ok' and flags nothing", function () {
  var v = sit.verdict(sixWith(["ok", "ok", "ok", "ok", "ok", "ok"]));
  assert.strictEqual(v.kind, "ok");
  assert.strictEqual(v.keys.length, 0);
  assert.strictEqual(v.total, 6);
});
check("one warn is 'warn' and names the flagged module key", function () {
  var v = sit.verdict(sixWith(["ok", "ok", "ok", "warn", "ok", "ok"]));
  assert.strictEqual(v.kind, "warn");
  assert.deepStrictEqual(v.keys, ["ier"]);
});
check("any critical makes the whole verdict critical", function () {
  var v = sit.verdict(sixWith(["warn", "ok", "ok", "critical", "ok", "ok"]));
  assert.strictEqual(v.kind, "critical");
  assert.deepStrictEqual(v.keys, ["crop", "ier"]);
});
check("keys keep nav order and count every non-ok module", function () {
  var v = sit.verdict(sixWith(["critical", "ok", "ok", "critical", "ok", "warn"]));
  assert.deepStrictEqual(v.keys, ["crop", "ier", "water"]);
  assert.strictEqual(v.keys.length + " of " + v.total, "3 of 6");
});

console.log("\nAll " + passed + " checks passed.");
