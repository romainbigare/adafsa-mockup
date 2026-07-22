"use strict";

// Runnable with plain Node: `node test/datasetTab.test.js`.
//
// The Full Dataset tab exposes the raw dataset behind the map. Its two moving
// parts are pure: which rows it lists (all farms in analysis mode, all taxonomy
// parcels in layers mode) and which columns each mode gets. The grid rendering
// itself is DOM-driven and covered by the Playwright pass, not here.

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
load("js/dashboard/dataTable.js");
load("js/dashboard/modulePage.js");

var mp = win.Wafra.dashboard.modulePage;
var reg = win.Wafra.dashboard.moduleRegistry;
assert.ok(mp && mp.datasetRows && mp.datasetColumnKeys, "modulePage should expose dataset selectors");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

var farm = { fid: 1, owner: "A", type: "Alfalfa", category: "Plots", area: 12,
  _mod: { ier: 80, yieldDev: 0, water: 100 },
  _farm: { trees: 100, datePalms: 90, canopy: 0.9, cultivar: "Khalas", cultivatedFrac: 0.8, tier: "Open Agriculture", tierIdx: 0 } };
var parcel = { fid: 7, owner: "B", type: "Alfalfa", category: "Fodder", area: 5 };

console.log("dataset rows follow the mode");
check("analysis mode lists the farms (farmFeatures)", function () {
  var st = { taxonomyView: null, farmFeatures: [farm], allFeatures: [parcel] };
  var r = mp.datasetRows(st);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].fid, 1);
});
check("layers mode lists the taxonomy parcels (allFeatures)", function () {
  var st = { taxonomyView: "crops", farmFeatures: [farm], allFeatures: [parcel] };
  var r = mp.datasetRows(st);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].fid, 7);
});
check("no state → no rows (never throws)", function () {
  assert.strictEqual(mp.datasetRows(null).length, 0);
});

console.log("dataset columns follow the mode");
check("farm columns carry identity + overall + EVERY contract module", function () {
  var keys = mp.datasetColumnKeys({ taxonomyView: null });
  ["fid", "owner", "crop", "area", "composite"].forEach(function (k) {
    assert.ok(keys.indexOf(k) >= 0, "farm columns missing " + k);
  });
  reg.MODULES.forEach(function (m) {
    assert.ok(keys.indexOf("m_" + m.key) >= 0, "farm columns dropped module " + m.key);
  });
  // The base 'crop' type column must survive alongside the crop MODULE column.
  assert.ok(keys.indexOf("crop") >= 0 && keys.indexOf("m_crop") >= 0, "crop type + crop module must coexist");
});
check("parcel columns are the taxonomy classification", function () {
  var keys = mp.datasetColumnKeys({ taxonomyView: "crops" });
  assert.strictEqual(keys.join(","), "fid,owner,category,type,area");
});

console.log("\nAll " + passed + " checks passed.");
