"use strict";

// Runnable with plain Node: `node test/scorecard.test.js`.
//
// scorecard.js is DOM-free string building, so we only need a bare window to
// load it, then assert the HTML it produces from a fabricated card view-model.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var win = { Wafra: { dashboard: {} } };
var src = fs.readFileSync(path.join(__dirname, "..", "js", "dashboard", "scorecard.js"), "utf8");
vm.runInNewContext(src, { window: win });

var sc = win.Wafra.dashboard.scorecard;
assert.ok(sc, "scorecard.js should attach Wafra.dashboard.scorecard");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

var vmWarn = {
  key: "palms", label: "Palms & Fruit Trees", shortLabel: "Palms/Trees",
  icon: "park", feePct: 31.6, hero: true,
  headline: "1.24M trees", statusLabel: "3.1% canopy stress", statusKind: "warn",
  bands: [
    { label: "Healthy", color: "#1a9850", share: 55 },
    { label: "Fair", color: "#91cf60", share: 27 },
    { label: "Stressed", color: "#fee08b", share: 13 },
    { label: "Severe Stress", color: "#d73027", share: 5 }
  ]
};
var vmOk = {
  key: "crop", label: "Crop Monitoring", shortLabel: "Crop Mon.",
  icon: "grass", feePct: 14.9, hero: false,
  headline: "7,918 dun cultivated", statusLabel: "On Track", statusKind: "ok",
  bands: [{ label: "Cultivated", color: "#1a9850", share: 80 }]
};

console.log("big card");
check("includes headline, label and links to the module route (no contract fee)", function () {
  var html = sc.cardHtml(vmWarn, { size: "big" });
  assert.ok(html.indexOf("1.24M trees") !== -1, "headline present");
  assert.ok(html.indexOf("31.6%") === -1, "fee not present");
  assert.ok(html.indexOf("Palms &amp; Fruit Trees") !== -1, "label escaped + present");
  assert.ok(html.indexOf('href="#/m/palms"') !== -1, "routes to module page");
});
check("status chip is tri-state: ok / warn / critical (COLOUR CONTRACT)", function () {
  assert.ok(sc.cardHtml(vmOk).indexOf("scorecard-chip--ok") !== -1, "ok → ok chip");
  assert.ok(sc.cardHtml(vmWarn).indexOf("scorecard-chip--warn") !== -1, "warn → warn chip");
  var vmCrit = Object.assign({}, vmWarn, { statusKind: "critical" });
  assert.ok(sc.cardHtml(vmCrit).indexOf("scorecard-chip--critical") !== -1, "critical → critical chip");
});
check("hero module gets the emphasised border", function () {
  assert.ok(sc.cardHtml(vmWarn).indexOf("border-brand-500") !== -1, "hero border");
  assert.ok(sc.cardHtml(vmOk).indexOf("border-brand-500") === -1, "non-hero: no hero border");
});
check("band strip renders one segment per non-zero share", function () {
  var html = sc.cardHtml(vmWarn);
  var segs = html.split("width:").length - 1; // strip container has no width:
  assert.strictEqual(segs, 4, "four band segments");
});

console.log("mini card");
check("uses the short label and still links to the module", function () {
  var html = sc.cardHtml(vmWarn, { size: "mini" });
  assert.ok(html.indexOf("Palms/Trees") !== -1, "short label present");
  assert.ok(html.indexOf('href="#/m/palms"') !== -1, "routes to module page");
  assert.ok(html.indexOf("scorecard-mini") !== -1, "mini variant class");
});

console.log("render");
check("render() writes one card per model into a container", function () {
  var container = { innerHTML: "" };
  sc.render(container, [vmWarn, vmOk], { size: "big" });
  assert.ok(container.innerHTML.indexOf("1.24M trees") !== -1);
  assert.ok(container.innerHTML.indexOf("7,918 dun cultivated") !== -1);
});

console.log("\nAll " + passed + " checks passed.");
