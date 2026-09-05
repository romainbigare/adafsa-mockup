import assert from 'node:assert/strict';

let checks = 0;
export function is(actual, expected, message) {
  checks++;
  assert.deepStrictEqual(actual, expected, message);
}
export function ok(value, message) {
  checks++;
  assert.ok(value, message);
}
export function close(actual, expected, tolerance, message) {
  checks++;
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} not within ${tolerance} of ${expected}`);
}
export function done(name) {
  console.log(`  ${name}: ${checks} checks`);
}
