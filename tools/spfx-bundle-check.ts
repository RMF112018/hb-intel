// tools/spfx-bundle-check.ts
// Enforces total JS bundle size per SPFx webpart domain.
// Budget raised from 1 MB to 1.5 MB to accommodate IIFE single-file format
// (vendor code inlined instead of split into separate chunks).
// Reference: PH7-BW-4-Vite-Bundle-Config.md §Bundle Size Check Script

import fs from 'fs';
import path from 'path';

const MAX_BUNDLE_SIZE_BYTES = 1_500_000; // 1.5 MB hard limit (IIFE single-file)

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

let allPassed = true;

for (const domain of domains) {
  const distPath = path.join('apps', domain, 'dist');
  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  ${domain}: dist/ not found — run build first`);
    continue;
  }

  const files = fs.readdirSync(distPath).filter((f) => f.endsWith('.js'));
  const totalBytes = files.reduce((sum, f) => {
    return sum + fs.statSync(path.join(distPath, f)).size;
  }, 0);
  const totalKB = (totalBytes / 1024).toFixed(1);

  if (totalBytes > MAX_BUNDLE_SIZE_BYTES) {
    console.error(`❌  ${domain}: ${totalKB} KB — EXCEEDS 1 MB budget`);
    allPassed = false;
  } else {
    console.log(`✅  ${domain}: ${totalKB} KB`);
  }
}

process.exit(allPassed ? 0 : 1);
