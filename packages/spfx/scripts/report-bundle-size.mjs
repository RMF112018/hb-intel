import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

/**
 * Phase 4b.17 bundle-size regression gate.
 *
 * This script is intentionally consumed by Turbo + CI and fails with a non-zero
 * exit code when the generated SPFx customizer bundle exceeds the agreed budget.
 * Keeping this check centralized prevents silent bundle growth regressions.
 */
const path = new URL('../dist/extensions/hbIntelHeader/HbIntelHeaderApplicationCustomizer.js', import.meta.url);
const content = readFileSync(path);
const bytes = content.byteLength;
const gzipBytes = gzipSync(content).byteLength;
const limit = 250 * 1024;

console.log(`customizer.js: ${bytes} bytes (${(bytes / 1024).toFixed(2)} KB)`);
console.log(`customizer.js.gz: ${gzipBytes} bytes (${(gzipBytes / 1024).toFixed(2)} KB)`);
console.log(`budget_limit_bytes: ${limit}`);
console.log(`under_budget: ${bytes < limit}`);

if (bytes >= limit) {
  console.error('Bundle size gate failed: SPFx customizer bundle exceeds 250 KB budget.');
  process.exitCode = 1;
}
