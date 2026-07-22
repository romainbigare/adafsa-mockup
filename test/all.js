"use strict";

// One command to run every suite: `node test/all.js`.
//
// The suites are plain scripts (assert + process.exit on throw), NOT node:test
// cases — so `node --test test/` mis-parses them and reports a false failure.
// This runner spawns a fresh `node` per *.test.js file and fails loudly if any
// suite errors. Wire CI to THIS file.

var fs = require("fs");
var path = require("path");
var cp = require("child_process");

var dir = __dirname;
var files = fs.readdirSync(dir)
  .filter(function (f) { return /\.test\.js$/.test(f); })
  .sort();

var failed = [];
files.forEach(function (f) {
  var res = cp.spawnSync(process.execPath, [path.join(dir, f)], { encoding: "utf8" });
  var ok = res.status === 0;
  if (!ok) {
    failed.push(f);
    process.stdout.write("\n✗ " + f + "\n");
    process.stdout.write((res.stdout || "").split("\n").slice(-6).join("\n"));
    process.stdout.write((res.stderr || "").split("\n").slice(-12).join("\n"));
  } else {
    var last = (res.stdout || "").trim().split("\n").pop();
    process.stdout.write("✓ " + f + "  — " + last + "\n");
  }
});

process.stdout.write("\n" + (files.length - failed.length) + "/" + files.length + " suites passed\n");
if (failed.length) { process.stdout.write("FAILED: " + failed.join(", ") + "\n"); process.exit(1); }
