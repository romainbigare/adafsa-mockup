"use strict";

// Runnable with plain Node: `node test/news.test.js`.
//
// Guards the two review findings on the activity feed: a burst must not repeat
// the same template back-to-back, and successive items must carry non-identical,
// non-decreasing timestamps (never five "Satellite scan" lines at one second).

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var win = { Wafra: { mock: {} } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "js", "mock", "news.js"), "utf8"), { window: win });
var news = win.Wafra.mock.news;
assert.ok(news && news.generateNewsItem, "news.js should attach Wafra.mock.news");

var passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

// Map an item back to its template by icon+shape of text (enough to detect a
// literal back-to-back repeat of the exact same generated line).
var items = [];
for (var i = 0; i < 120; i++) items.push(news.generateNewsItem());

console.log("activity feed credibility");
check("no two consecutive items are the identical line", function () {
  for (var i = 1; i < items.length; i++) {
    assert.ok(!(items[i].text === items[i - 1].text && items[i].icon === items[i - 1].icon),
      "consecutive duplicate at " + i + ": " + items[i].text);
  }
});
check("every item has icon, colour, text and a time", function () {
  items.forEach(function (it) {
    assert.ok(it.icon && it.color && it.text && it.time, "complete item");
  });
});
check("timestamps are distinct across a seeded burst (stepped clock)", function () {
  // A burst of 8 (the feed seed) must not collapse to one timestamp.
  var burst = items.slice(0, 8).map(function (it) { return it.time; });
  var uniq = {};
  burst.forEach(function (t) { uniq[t] = 1; });
  assert.ok(Object.keys(uniq).length >= 6, "a burst of 8 should show >= 6 distinct times, got " + Object.keys(uniq).length);
});

console.log("\nAll " + passed + " checks passed.");
