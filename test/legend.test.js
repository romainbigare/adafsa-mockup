"use strict";

// Runnable with plain Node: `node test/legend.test.js`.
//
// legend.js builds one HTML string into an element, so a `{ innerHTML: "" }`
// stand-in is enough — no DOM. Guards the two things callers depend on: the
// scope chip (so "in view" and "all farms" shares can never be confused) and
// the optional statistics grid the Situation screen passes in.

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
load("js/ui/strings.js");
load("js/mock/metrics.js");
load("js/dashboard/modules.js");
load("js/dashboard/legend.js");

var legend = win.Wafra.dashboard.legend;
assert.ok(legend, "legend.js should attach Wafra.dashboard.legend");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// A minimal module: bands + valueOf is all the band helpers need.
var module_ = {
  key: "demo", label: "Overall criticality", icon: "warning",
  valueOf: function (f) { return f.v; },
  bands: [
    { label: "Healthy",  range: "0–9",  color: "#1a9850", contains: function (v) { return v < 10; } },
    { label: "Critical", range: "≥ 45", color: "#d73027", contains: function (v) { return v >= 45; } }
  ]
};
var features = [{ v: 5, area: 10 }, { v: 50, area: 10 }, { v: 60, area: 10 }];

function render(opts) {
  var el = { innerHTML: "", classList: { add: function () {}, remove: function () {} } };
  legend.render(el, module_, features, opts);
  return el.innerHTML;
}

console.log("bands");
check("one row per band, with its share of the scored farms", function () {
  var html = render({ scope: "all" });
  assert.ok(html.indexOf("Healthy") !== -1 && html.indexOf("Critical") !== -1, "both bands listed");
  assert.ok(html.indexOf("33%") !== -1, "1 of 3 farms healthy");
  assert.ok(html.indexOf("67%") !== -1, "2 of 3 farms critical");
});
check("the scope chip states which farms the shares cover", function () {
  assert.ok(render({ scope: "all" }).indexOf("All farms") !== -1);
  assert.ok(render({ scope: "view" }).indexOf("In view") !== -1);
});

console.log("statistics grid");
check("omitted entirely when the caller passes no stats", function () {
  assert.ok(render({ scope: "all" }).indexOf("legend-stats") === -1);
});
check("renders a value + label per stat, in the order given", function () {
  var html = render({ scope: "all", stats: [
    { value: "500", label: "Farms tracked" },
    { value: "17,597", label: "Dunums mapped" },
    { value: "4 of 6", label: "Modules flagged" }
  ] });
  assert.strictEqual(html.split("legend-stat-value").length - 1, 3, "three stats");
  assert.ok(html.indexOf("500") !== -1 && html.indexOf("Farms tracked") !== -1);
  assert.ok(html.indexOf("4 of 6") !== -1 && html.indexOf("Modules flagged") !== -1);
  assert.ok(html.indexOf("Farms tracked") < html.indexOf("Modules flagged"), "order preserved");
});
check("stats sit above the band breakdown, below the header", function () {
  var html = render({ scope: "all", title: "Overall criticality", showIcon: true,
    stats: [{ value: "500", label: "Farms tracked" }] });
  assert.ok(html.indexOf("Overall criticality") < html.indexOf("legend-stats"), "header first");
  assert.ok(html.indexOf("legend-stats") < html.indexOf("cat-chart"), "then stats, then bands");
});

console.log("\nAll " + passed + " checks passed.");
