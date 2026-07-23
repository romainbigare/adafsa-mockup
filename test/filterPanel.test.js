"use strict";

// Runnable with plain Node: `node test/filterPanel.test.js`.
//
// filterPanel is DOM wiring around one pure string builder, panelHtml(vm, open).
// The contract worth guarding: minimised means HEADER ONLY (the panel must never
// land on the map as a wall of checkboxes), the header states whether a filter
// is on, and expanding renders every category with its types and tick state.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var win = { Wafra: { dashboard: {}, color: { TYPE_COLORS: {} } } };
function load(rel) { vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", rel), "utf8"), { window: win, console: console }); }
load("js/dashboard/taxonomy.js");
load("js/dashboard/farmFilter.js");
load("js/dashboard/filterPanel.js");

var fp = win.Wafra.dashboard.filterPanel;
assert.ok(fp, "filterPanel.js should attach Wafra.dashboard.filterPanel");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

var vmInert = {
  scope: "trees", active: false, matching: 500, total: 500,
  categories: [
    { name: "Date Palm", color: "#7b4b2a", count: 63, checked: true, partial: false,
      types: [{ key: "Date Palm|Date Palm", name: "Date Palm", color: "#7b4b2a", count: 63, checked: true }] },
    { name: "Fruit Trees", color: "#e67e22", count: 12, checked: true, partial: false,
      types: [
        { key: "Fruit Trees|Mango", name: "Mango", color: "#f0932b", count: 2, checked: true },
        { key: "Fruit Trees|Lemon", name: "Lemon", color: "#f2e22e", count: 4, checked: true }
      ] }
  ]
};
var vmActive = JSON.parse(JSON.stringify(vmInert));
vmActive.active = true;
vmActive.matching = 58;
vmActive.categories[1].checked = true;
vmActive.categories[1].partial = true;
vmActive.categories[1].types[0].checked = false;

console.log("minimised (the default)");
check("renders the header and NOTHING else", function () {
  var html = fp.panelHtml(vmInert, false);
  assert.ok(html.indexOf("FILTERING") !== -1, "titled FILTERING");
  assert.ok(html.indexOf("filter-body") === -1, "no body");
  assert.ok(html.indexOf("Date Palm") === -1, "no taxonomy rows");
  assert.ok(html.indexOf("filter-box") === -1, "no checkboxes");
  assert.ok(html.indexOf('aria-expanded="false"') !== -1, "reports itself collapsed");
});
check("the header says whether a filter is on", function () {
  assert.ok(fp.panelHtml(vmInert, false).indexOf(">All<") !== -1, "inert reads 'All'");
  var on = fp.panelHtml(vmActive, false);
  assert.ok(on.indexOf("58 of 500") !== -1, "active reads the surviving count");
  assert.ok(on.indexOf("filter-chip--on") !== -1, "and is highlighted");
});

console.log("expanded");
check("renders every category with its types and tick state", function () {
  var html = fp.panelHtml(vmInert, true);
  assert.ok(html.indexOf("filter-body") !== -1, "body present");
  assert.strictEqual(html.split("filter-catbox").length - 1, 2, "one box per category");
  assert.strictEqual(html.split("filter-type").length - 1, 3, "one box per type");
  assert.ok(html.indexOf('data-key="Fruit Trees|Mango"') !== -1, "types carry their scoped key");
  assert.ok(html.indexOf('aria-expanded="true"') !== -1);
});
check("an unticked type renders unchecked", function () {
  var html = fp.panelHtml(vmActive, true);
  var mango = html.slice(html.indexOf("Mango"));
  var mangoBox = mango.slice(0, mango.indexOf(">", mango.indexOf("filter-type")) + 1);
  assert.strictEqual(mangoBox.indexOf("checked"), -1, "Mango's box is not checked");
  assert.ok(html.indexOf('checked class="filter-box filter-type" data-key="Fruit Trees|Lemon"') !== -1,
    "Lemon's box still is");
});
check("categories start collapsed so the open panel stays a short list", function () {
  var html = fp.panelHtml(vmInert, true);
  assert.strictEqual(html.indexOf("filter-cat open"), -1, "no category pre-expanded");
});
check("the footer states the working set and offers All / None", function () {
  assert.ok(fp.panelHtml(vmInert, true).indexOf("All 500 farms") !== -1);
  assert.ok(fp.panelHtml(vmActive, true).indexOf("Showing 58 of 500 farms") !== -1);
  var html = fp.panelHtml(vmInert, true);
  assert.ok(html.indexOf('data-act="all"') !== -1 && html.indexOf('data-act="none"') !== -1);
});
check("counts are per-FARM and shown against every row", function () {
  var html = fp.panelHtml(vmInert, true);
  assert.ok(html.indexOf(">63<") !== -1, "date palm farm count");
  assert.ok(html.indexOf(">2<") !== -1 && html.indexOf(">4<") !== -1, "per-type counts");
});

console.log("\nAll " + passed + " checks passed.");
