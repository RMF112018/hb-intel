import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const path = new URL('../dist/extensions/hbIntelHeader/HbIntelHeaderApplicationCustomizer.js', import.meta.url);
const content = readFileSync(path);
const bytes = content.byteLength;
const gzipBytes = gzipSync(content).byteLength;
const limit = 250 * 1024;

console.log(`customizer.js: ${bytes} bytes (${(bytes / 1024).toFixed(2)} KB)`);
console.log(`customizer.js.gz: ${gzipBytes} bytes (${(gzipBytes / 1024).toFixed(2)} KB)`);
console.log(`under_250kb: ${bytes < limit}`);

if (bytes >= limit) {
  process.exitCode = 1;
}
