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

console.log("status (verdict) tile");
var vmTile = Object.assign({}, vmWarn, { summary: "34% canopy stress · 279.2k trees" });
check("shows the module icon next to the name", function () {
  var html = sc.cardHtml(vmTile, { size: "status" });
  assert.ok(html.indexOf("status-tile-icon") !== -1, "icon slot present");
  assert.ok(html.indexOf(">park<") !== -1, "renders the module's icon glyph");
  assert.ok(html.indexOf("Palms &amp; Fruit Trees") !== -1, "full label, not the short one");
});
check("status word is the plain-language verdict, keyed by kind", function () {
  assert.ok(sc.cardHtml(vmOk, { size: "status" }).indexOf("On track") !== -1);
  assert.ok(sc.cardHtml(vmTile, { size: "status" }).indexOf("Watch") !== -1);
  var crit = Object.assign({}, vmTile, { statusKind: "critical" });
  assert.ok(sc.cardHtml(crit, { size: "status" }).indexOf("Needs attention") !== -1);
});
check("state rides on ONE modifier class — never a coloured border/hero ring", function () {
  ["ok", "warn", "critical"].forEach(function (kind) {
    var html = sc.cardHtml(Object.assign({}, vmTile, { statusKind: kind }), { size: "status" });
    assert.ok(html.indexOf("status-tile--" + kind) !== -1, kind + " modifier");
    assert.ok(html.indexOf("status-tile--hero") === -1, "no hero ring on the tile");
    assert.ok(html.indexOf("border-") === -1, "no utility border classes on the tile");
  });
});
check("shows the summary line, falling back to the headline", function () {
  assert.ok(sc.cardHtml(vmTile, { size: "status" }).indexOf("34% canopy stress") !== -1);
  var noSummary = Object.assign({}, vmTile, { summary: null });
  assert.ok(sc.cardHtml(noSummary, { size: "status" }).indexOf("1.24M trees") !== -1);
});
check("draws a column chart: one bar + one % label per band, in band order", function () {
  var html = sc.bandColumns(vmTile.bands);
  assert.strictEqual(html.split("tile-bar").length - 1, 4, "four bars");
  assert.strictEqual(html.split("tile-val\">").length - 1, 4, "four value labels");
  assert.ok(html.indexOf("height:55%") !== -1, "bar height is the band's share");
  assert.ok(html.indexOf(">55%<") < html.indexOf(">5%<"), "labels follow band order");
  assert.ok(html.indexOf('title="Severe Stress — 5% of area"') !== -1, "hover names the band");
});
check("keeps zero-share bands as columns so the plot never re-flows", function () {
  var html = sc.bandColumns([{ label: "Healthy", color: "#1a9850", share: 100 },
                             { label: "Stressed", color: "#d73027", share: 0 }]);
  assert.strictEqual(html.split("tile-bar").length - 1, 2, "zero band still drawn");
  assert.ok(html.indexOf(">0%<") !== -1, "and still labelled");
});
check("clamps out-of-range shares (a bar can never overflow the plot)", function () {
  var html = sc.bandColumns([{ label: "Odd", color: "#000", share: 140 },
                             { label: "Odd2", color: "#000", share: -5 }]);
  assert.ok(html.indexOf("height:100%") !== -1, "clamped high");
  assert.ok(html.indexOf("height:0%") !== -1, "clamped low");
});

console.log("render");
check("render() writes one card per model into a container", function () {
  var container = { innerHTML: "" };
  sc.render(container, [vmWarn, vmOk], { size: "big" });
  assert.ok(container.innerHTML.indexOf("1.24M trees") !== -1);
  assert.ok(container.innerHTML.indexOf("7,918 dun cultivated") !== -1);
});

console.log("\nAll " + passed + " checks passed.");
