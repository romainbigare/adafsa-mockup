"use strict";

// Runnable with plain Node: `node test/farmDossier.test.js`.
//
// The dossier model is pure: it orders the six modules worst-first, writes a
// verdict that leads with the worst finding using FORMATTED values (same scale
// as the module page), and colours each row from its band. No number here can
// disagree with a module page because it all comes from moduleRegistry.

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
load("js/dashboard/farmDossier.js");

var dossier = win.Wafra.dashboard.farmDossier;
assert.ok(dossier, "farmDossier.js should attach Wafra.dashboard.farmDossier");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// A farm with a hand-set profile: IER Critical (30), Palms Stressed (55),
// everything else healthy. Worst = IER.
function farm() {
  return {
    fid: 7, owner: "Owner 7", area: 42.5,
    _mod: { ier: 30, yieldDev: 0, water: 95 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.55, cultivar: "Khalas", cultivatedFrac: 0.8, tier: "Open Agriculture", tierIdx: 0 }
  };
}

console.log("model");
check("carries fid/owner/area and six rows", function () {
  var m = dossier.model(farm());
  assert.strictEqual(m.fid, 7);
  assert.strictEqual(m.owner, "Owner 7");
  assert.strictEqual(m.rows.length, 6);
});
check("rows are ordered worst-first (IER critical leads)", function () {
  var m = dossier.model(farm());
  assert.strictEqual(m.rows[0].key, "ier", "worst module leads");
  // severities are non-increasing down the list
  for (var i = 1; i < m.rows.length; i++) {
    assert.ok(m.rows[i].sev <= m.rows[i - 1].sev, "sev non-increasing at " + i);
  }
});
check("each scored row's colour is its band colour; IER critical is red", function () {
  var m = dossier.model(farm());
  var ier = m.rows.filter(function (r) { return r.key === "ier"; })[0];
  assert.strictEqual(ier.band, "Critical");
  assert.strictEqual(ier.color, "#d73027", "IER Critical band colour");
  assert.strictEqual(ier.value, "30", "formatted on the 0–100 scale");
});
check("an unscored module reads 'no data', not a bogus band", function () {
  var noTree = farm(); noTree._farm.trees = 0; noTree._farm.canopy = null;
  var m = dossier.model(noTree);
  var palms = m.rows.filter(function (r) { return r.key === "palms"; })[0];
  assert.strictEqual(palms.scored, false);
  assert.strictEqual(palms.value, "—");
});

console.log("verdict sentence");
check("leads with the worst finding, formatted, names a second", function () {
  var m = dossier.model(farm());
  assert.ok(/Irrigation Efficiency is critical \(30\)/.test(m.verdictSentence), m.verdictSentence);
  assert.ok(/palms & fruit trees is stressed/.test(m.verdictSentence), m.verdictSentence);
});
check("a healthy farm reads healthy", function () {
  var healthy = { fid: 9, owner: "Owner 9", area: 10,
    _mod: { ier: 95, yieldDev: 5, water: 95 },
    _farm: { trees: 100, datePalms: 90, canopy: 0.92, cultivar: "Khalas", cultivatedFrac: 0.9, tier: "Open Agriculture", tierIdx: 0 } };
  assert.ok(/look healthy/.test(dossier.model(healthy).verdictSentence));
});

console.log("worstModuleKey");
check("returns the farm's worst scored module", function () {
  assert.strictEqual(dossier.worstModuleKey(farm()), "ier");
});

console.log("\nAll " + passed + " checks passed.");
