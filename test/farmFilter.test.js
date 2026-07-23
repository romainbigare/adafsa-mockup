"use strict";

// Runnable with plain Node: `node test/farmFilter.test.js`.
//
// farmFilter is the model behind the FILTERING panel: it joins the crops dataset
// onto farms (by owner), and answers "which farms count right now". The rules
// that a regression would silently break are all pure:
//   • the owner join + per-type/per-category farm counts,
//   • scope (Crop Monitoring sees field crops, Palms sees woody perennials),
//   • "everything ticked" means NO filter — farms with no crops still count,
//   • a selection made outside the current scope is remembered but ignored.

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var win = { Wafra: { dashboard: {}, color: { TYPE_COLORS: {} } } };
function load(rel) { vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", rel), "utf8"), { window: win, console: console }); }
load("js/dashboard/taxonomy.js");
load("js/dashboard/farmFilter.js");

var ff = win.Wafra.dashboard.farmFilter;
assert.ok(ff, "farmFilter.js should attach Wafra.dashboard.farmFilter");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// Bare crop-parcel property objects (indexFarms accepts these directly).
function parcel(owner, cat, type) { return { owner_name: owner, level_1: cat, level_3: type }; }
function farm(fid, owner) { return { fid: fid, owner: owner, area: 10 }; }

// Three farms: one pure field-crop, one pure date palm, one with neither.
function fixture() {
  var farms = [farm(1, "A"), farm(2, "B"), farm(3, "C"), farm(4, "D")];
  var parcels = [
    parcel("A", "Fodder", "Alfalfa"),
    parcel("A", "Fodder", "Sorghum"),
    parcel("B", "Date Palm", "Date Palm"),
    parcel("C", "Fodder", "Alfalfa"),
    parcel("C", "Fruit Trees", "Mango")
    // D has no crop parcels at all
  ];
  var counts = ff.prepare(farms, parcels);     // indexes AND stores the counts
  return { farms: farms, counts: counts };
}

console.log("indexing (crops joined onto farms by owner)");
check("stamps each farm with the category|type keys growing on it", function () {
  var f = fixture();
  assert.strictEqual(Object.keys(f.farms[0]._taxa).sort().join(","), "Fodder|Alfalfa,Fodder|Sorghum");
  assert.strictEqual(Object.keys(f.farms[1]._taxa).join(","), "Date Palm|Date Palm");
  assert.strictEqual(f.farms[3]._taxa, null, "a farm with no parcels gets no taxa");
});
check("counts FARMS per type and per category, not parcels", function () {
  var f = fixture();
  assert.strictEqual(f.counts.keys["Fodder|Alfalfa"], 2, "A and C grow alfalfa");
  assert.strictEqual(f.counts.keys["Fodder|Sorghum"], 1);
  assert.strictEqual(f.counts.cats["Fodder"], 2, "A and C — counted once each");
  assert.strictEqual(f.counts.cats["Fruit Trees"], 1);
});
check("normalises the data's crop names onto the taxonomy's", function () {
  var farms = [farm(1, "A")];
  ff.indexFarms(farms, [parcel("A", "Fodder", "Corn")]);      // Corn -> Maize
  assert.ok(farms[0]._taxa["Fodder|Maize"], "Corn indexed as Maize");
});
check("keys are category-qualified — a leaf name alone is ambiguous", function () {
  // "Watermelon" is both a fruit tree and an open-field crop in the taxonomy.
  var farms = [farm(1, "A")];
  ff.indexFarms(farms, [parcel("A", "Open-Field Produce", "Watermelon")]);
  assert.ok(farms[0]._taxa["Open-Field Produce|Watermelon"]);
  assert.ok(!farms[0]._taxa["Fruit Trees|Watermelon"], "the tree half is untouched");
});

console.log("scope — each route filters by the taxonomy it is about");
check("Crop Monitoring filters by field crops, Palms by woody perennials", function () {
  assert.strictEqual(ff.scopeForModule("crop"), "crops");
  assert.strictEqual(ff.scopeForModule("palms"), "trees");
  ["ier", "yield", "water"].forEach(function (k) {
    assert.strictEqual(ff.scopeForModule(k), "both", k + " filters by both");
  });
  assert.strictEqual(ff.OVERVIEW_SCOPE, "both");
});
check("Land Use & Structures has no filter — the taxonomy IS its analysis", function () {
  assert.strictEqual(ff.scopeForModule("structures"), null);
  assert.strictEqual(ff.keysOf(null).length, 0);
});
check("scope keys come from that scope's taxonomy only", function () {
  var crops = ff.keysOf("crops"), trees = ff.keysOf("trees"), both = ff.keysOf("both");
  assert.ok(crops.indexOf("Fodder|Alfalfa") !== -1);
  assert.strictEqual(crops.indexOf("Date Palm|Date Palm"), -1, "crops excludes palms");
  assert.ok(trees.indexOf("Date Palm|Date Palm") !== -1);
  assert.strictEqual(trees.indexOf("Fodder|Alfalfa"), -1, "trees excludes fodder");
  assert.strictEqual(both.length, crops.length + trees.length, "both = crops + trees");
});

console.log("selection + matching");
check("nothing unticked means NO filter at all", function () {
  ff.reset();
  assert.strictEqual(ff.isActive("both"), false);
  assert.strictEqual(ff.isActive("crops"), false);
});
check("unticking one type turns the filter on for that scope", function () {
  ff.reset();
  ff.setKeys(["Fodder|Alfalfa"], false);
  assert.strictEqual(ff.isActive("crops"), true);
  assert.strictEqual(ff.activeKeys("crops").indexOf("Fodder|Alfalfa"), -1);
  ff.reset();
});
check("an out-of-scope selection is remembered but ignored", function () {
  ff.reset();
  ff.setKeys(["Date Palm|Date Palm"], false);        // a TREE type...
  assert.strictEqual(ff.isActive("crops"), false, "...does not filter the Crops scope");
  assert.strictEqual(ff.isActive("trees"), true, "...but does filter the Trees scope");
  assert.strictEqual(ff.isActive("both"), true);
  ff.reset();
});
check("a farm survives if it grows ANY ticked type", function () {
  var f = fixture();
  assert.strictEqual(ff.matches(f.farms[0], ["Fodder|Alfalfa"]), true);
  assert.strictEqual(ff.matches(f.farms[0], ["Fodder|Sorghum", "Cereals|Wheat"]), true);
  assert.strictEqual(ff.matches(f.farms[1], ["Fodder|Alfalfa"]), false);
  assert.strictEqual(ff.matches(f.farms[3], ["Fodder|Alfalfa"]), false, "no crops recorded -> no match");
  assert.strictEqual(ff.matches(f.farms[0], []), false, "nothing ticked -> nothing matches");
});

console.log("apply — the working set handed to the map and the numbers");
function stateWith(farms, scope) {
  return { farmFeatures: farms, filterScope: scope, currentDataset: "plots" };
}
check("inert filter leaves the working set null (everything counts)", function () {
  ff.reset();
  var f = fixture();
  var st = stateWith(f.farms, "both");
  ff.apply(st);
  assert.strictEqual(st.farmFilterSet, null, "no Set -> the map draws everything");
  assert.strictEqual(st.filteredFarms, null);
  assert.strictEqual(ff.farms(st).length, 4, "farms() falls back to every farm");
});
check("an active filter narrows the set — crop-less farms drop out", function () {
  ff.reset();
  var f = fixture();
  var st = stateWith(f.farms, "crops");
  ff.clearAll("crops");
  ff.setKeys(["Fodder|Sorghum"], true);              // only sorghum ticked
  ff.apply(st);
  assert.strictEqual(ff.farms(st).map(function (x) { return x.fid; }).join(","), "1");
  assert.ok(st.farmFilterSet.has(f.farms[0]), "the map set holds the same farms");
  assert.strictEqual(st.farmFilterSet.has(f.farms[3]), false, "no-crop farm excluded");
  ff.reset();
});
check("scope decides the outcome — the same selection filters differently", function () {
  ff.reset();
  var f = fixture();
  ff.setKeys(ff.keysOf("crops"), false);             // untick every field crop
  var cropView = stateWith(f.farms, "crops");
  ff.apply(cropView);
  assert.strictEqual(ff.farms(cropView).length, 0, "no field crops ticked -> nothing shown");

  var treeView = stateWith(f.farms, "trees");
  ff.apply(treeView);
  assert.strictEqual(treeView.filteredFarms, null, "the tree scope is untouched -> no filter");
  assert.strictEqual(ff.farms(treeView).length, 4);
  ff.reset();
});

console.log("view model (what the panel renders)");
check("mirrors the scope's tree with farm counts and tick state", function () {
  ff.reset();
  var f = fixture();
  var st = stateWith(f.farms, "trees");
  ff.apply(st);
  var vm2 = ff.viewModel(st);
  assert.strictEqual(vm2.categories.map(function (c) { return c.name; }).join(","), "Date Palm,Fruit Trees");
  assert.strictEqual(vm2.active, false);
  assert.strictEqual(vm2.total, 4);
  assert.strictEqual(vm2.matching, 4, "nothing filtered -> matching is the total");
  var datePalm = vm2.categories[0];
  assert.strictEqual(datePalm.count, 1, "one farm grows date palms");
  assert.strictEqual(datePalm.checked, true);
  assert.strictEqual(datePalm.partial, false);
});
check("a partly-ticked category reports itself partial", function () {
  ff.reset();
  var f = fixture();
  var st = stateWith(f.farms, "crops");
  ff.setKeys(["Fodder|Alfalfa"], false);
  ff.apply(st);
  var fodder = ff.viewModel(st).categories.filter(function (c) { return c.name === "Fodder"; })[0];
  assert.strictEqual(fodder.checked, true, "still has ticked types");
  assert.strictEqual(fodder.partial, true);
  assert.strictEqual(fodder.types.filter(function (t) { return t.name === "Alfalfa"; })[0].checked, false);
  ff.reset();
});

console.log("\nAll " + passed + " checks passed.");
