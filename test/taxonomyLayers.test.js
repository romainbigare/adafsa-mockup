"use strict";

// Runnable with plain Node: `node test/taxonomyLayers.test.js` (no build/npm).
//
// taxonomyLayers.js is the "Map Layers" taxonomy browser: a slide-in panel that
// lists the full Land Use / Crops / Trees taxonomy with a checkbox per type,
// ticking a type draws those parcels on the map. Almost all of it is DOM/Leaflet
// wiring, but the piece that governs *which parcels each view draws* is pure —
// and it's the part a regression would silently break. We load taxonomy.js (the
// tree data) + taxonomyLayers.js into a bare window and assert that pure core:
//   • each view maps to the right dataset (Trees rides the Crops dataset),
//   • a view's "own types" come from its own taxonomy tree,
//   • visibility shows all of Land Use, but only each half of the Crops dataset.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

// --- Minimal Wafra harness (no DOM needed for the pure helpers) ---
var win = { Wafra: { color: { TYPE_COLORS: {} }, dashboard: {} } };
function load(rel) {
  var src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
  vm.runInNewContext(src, { window: win, console: console });
}
load("js/dashboard/taxonomy.js");
load("js/dashboard/taxonomyLayers.js");

var tl = win.Wafra.dashboard.taxonomyLayers;
var tax = win.Wafra.dashboard.taxonomy;
assert.ok(tl, "taxonomyLayers.js should attach Wafra.dashboard.taxonomyLayers");
assert.ok(tax, "taxonomy.js should attach Wafra.dashboard.taxonomy");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

function leaves(tree) {
  var out = [];
  tree.forEach(function (cat) { cat.types.forEach(function (t) { out.push(t.name); }); });
  return out;
}

console.log("dataset routing");
check("Land Use has its own dataset; Crops and Trees share the crops dataset", function () {
  assert.strictEqual(tl.datasetFor("landuse"), "landuse");
  assert.strictEqual(tl.datasetFor("crops"), "crops");
  assert.strictEqual(tl.datasetFor("trees"), "crops");
  // Switching Crops <-> Trees must not require a reload.
  assert.strictEqual(tl.datasetFor("crops"), tl.datasetFor("trees"));
});

console.log("own types come from each view's own taxonomy tree");
check("crops owns field crops, not trees; trees owns palms + fruit trees", function () {
  var crops = tl.ownTypes("crops");
  var trees = tl.ownTypes("trees");
  assert.ok(crops.indexOf("Wheat") !== -1, "crops includes Wheat");
  assert.ok(crops.indexOf("Tomato") !== -1, "crops includes Tomato");
  assert.strictEqual(crops.indexOf("Date Palm"), -1, "crops excludes Date Palm");
  assert.ok(trees.indexOf("Date Palm") !== -1, "trees includes Date Palm");
  assert.ok(trees.indexOf("Mango") !== -1, "trees includes Mango (a fruit tree)");
  assert.strictEqual(trees.indexOf("Wheat"), -1, "trees excludes Wheat");
});
check("Crops and Trees split the crops taxonomy by category and cover all of it", function () {
  // The split is by CATEGORY (Trees = Date Palm + Fruit Trees; Crops = the
  // rest), which is a clean partition. Note a leaf *name* can still appear in
  // both halves — e.g. "Watermelon" is listed under both Fruit Trees and
  // Open-Field Produce in the source taxonomy — so we assert category-level
  // disjointness plus full leaf coverage, not leaf-level disjointness.
  var cropCats = tax.CROPS_TREE.map(function (c) { return c.name; });
  var treeCats = tax.TREES_TREE.map(function (c) { return c.name; });
  var catOverlap = cropCats.filter(function (c) { return treeCats.indexOf(c) !== -1; });
  assert.strictEqual(catOverlap.length, 0, "no category in both Crops and Trees: " + catOverlap.join(","));

  var uniq = function (a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }).sort().join(","); };
  var union = uniq(tl.ownTypes("crops").concat(tl.ownTypes("trees")));
  var all = uniq(leaves(tax.CROP_TREE));
  assert.strictEqual(union, all, "Crops + Trees together cover the whole crops taxonomy");
});

console.log("visibilityFor — which parcels a view draws");
check("Land Use draws everything currently on the map", function () {
  var types = ["Barren Land", "Greenhouse", "Warehouse", "Cultivated Fields", "Something Unmapped"];
  var vis = tl.visibilityFor("landuse", types);
  types.forEach(function (t) { assert.strictEqual(vis[t], true, "landuse shows " + t); });
});
check("Crops draws only crop types; Trees draws only tree types", function () {
  var types = ["Wheat", "Tomato", "Date Palm", "Mango"];
  var cropVis = tl.visibilityFor("crops", types);
  assert.strictEqual(cropVis["Wheat"], true);
  assert.strictEqual(cropVis["Tomato"], true);
  assert.strictEqual(cropVis["Date Palm"], false);
  assert.strictEqual(cropVis["Mango"], false);

  var treeVis = tl.visibilityFor("trees", types);
  assert.strictEqual(treeVis["Date Palm"], true);
  assert.strictEqual(treeVis["Mango"], true);
  assert.strictEqual(treeVis["Wheat"], false);
  assert.strictEqual(treeVis["Tomato"], false);
});
check("a crops-dataset type unknown to either half is hidden in both crop views", function () {
  var vis = tl.visibilityFor("crops", ["Mystery Crop"]);
  assert.strictEqual(vis["Mystery Crop"], false, "unknown type not force-shown");
});

console.log("taxonomy data integrity");
check("every taxonomy tree is non-empty and every leaf carries a colour", function () {
  [tax.LAND_USE_TREE, tax.CROPS_TREE, tax.TREES_TREE].forEach(function (tree) {
    assert.ok(tree.length > 0, "tree has categories");
    tree.forEach(function (cat) {
      assert.ok(cat.name && cat.color, "category has name + colour");
      assert.ok(cat.types.length > 0, cat.name + " has types");
      cat.types.forEach(function (t) { assert.ok(t.name && t.color, t.name + " has name + colour"); });
    });
  });
});

console.log("\nAll " + passed + " checks passed.");
