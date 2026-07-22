"use strict";

// Runnable with plain Node: `node test/strings.test.js`.
//
// The strings dictionary is the i18n seam. Guard that the keys the new chrome
// references exist, and that {placeholder} interpolation works.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var win = { Wafra: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "js", "ui", "strings.js"), "utf8"), { window: win });
var W = win.Wafra;
assert.ok(W.str && W.strings, "strings.js should attach Wafra.str + Wafra.strings");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// Keys referenced by the new components (legend, dossier, layers badge).
var REQUIRED = [
  "scopeInView", "scopeAll", "legendFootView", "legendFootAll",
  "dossierModuleStatus", "dossierOpenAnalysis", "dossierExport", "dossierBack", "dossierNoData",
  "layersPaused", "layersPausedGeneric", "layersReturn"
];

console.log("dictionary");
check("every referenced key resolves to a non-empty string", function () {
  REQUIRED.forEach(function (k) {
    var v = W.str(k);
    assert.ok(typeof v === "string" && v.length, "missing/empty string for '" + k + "'");
    assert.ok(v !== k, "key '" + k + "' has no value (returned the key)");
  });
});
check("interpolates {placeholder} tokens", function () {
  assert.strictEqual(W.str("layersPaused", { module: "Water Allocation" }),
    "Water Allocation paused — showing Map Layers");
});
check("a missing key returns the key itself (visible, never blank)", function () {
  assert.strictEqual(W.str("no_such_key_xyz"), "no_such_key_xyz");
});

console.log("\nAll " + passed + " checks passed.");
