/* One command to run every suite: `node test/all.js`.
 *
 * The suites are plain assertion scripts rather than node:test cases, so this
 * runner spawns a fresh node per file and fails loudly if any of them throws.
 * Wire CI to this file. */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith('.test.js')).sort();
const failed = [];

for (const file of files) {
  const result = spawnSync(process.execPath, [join(here, file)], { stdio: 'inherit' });
  if (result.status !== 0) failed.push(file);
}

console.log('');
if (failed.length) {
  console.error(`FAILED ${failed.length} of ${files.length}: ${failed.join(', ')}`);
  process.exit(1);
}
console.log(`ok — ${files.length} suites passed`);
