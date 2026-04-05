// tools/spfx-bundle-check.ts
// Enforces total JS bundle size per SPFx domain and product lane.
// Budget raised from 1 MB to 1.5 MB for domain apps to accommodate IIFE format.
// Homepage (Lane A) and shell-extension (Lane B) have their own budgets.
// Reference: PH7-BW-4-Vite-Bundle-Config.md §Bundle Size Check Script
// Reference: Phase-07-Bundle-Governance-Policy.md

import fs from 'fs';
import path from 'path';

const MAX_BUNDLE_SIZE_BYTES = 1_500_000; // 1.5 MB hard limit for domain apps (IIFE single-file)

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

// Homepage and shell-extension product lanes with lane-specific budgets
const productLanes = [
  { dir: 'hb-webparts', label: 'Lane A (homepage)', jsWarnKB: 350, jsFailKB: 400, cssWarnKB: 5, cssFailKB: 10 },
  { dir: 'hb-shell-extension', label: 'Lane B (shell-extension)', jsWarnKB: 250, jsFailKB: 300, cssWarnKB: 5, cssFailKB: 10 },
];

let allPassed = true;

// ── Domain apps ────────────────────────────────────────────────────────
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
    console.error(`❌  ${domain}: ${totalKB} KB — EXCEEDS 1.5 MB budget`);
    allPassed = false;
  } else {
    console.log(`✅  ${domain}: ${totalKB} KB`);
  }
}

// ── Product lanes (homepage + shell-extension) ─────────────────────────
for (const lane of productLanes) {
  const distPath = path.join('apps', lane.dir, 'dist');
  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  ${lane.label}: dist/ not found — run build first`);
    continue;
  }

  const jsFiles = fs.readdirSync(distPath).filter((f) => f.endsWith('.js'));
  const cssFiles = fs.readdirSync(distPath).filter((f) => f.endsWith('.css'));

  const jsBytes = jsFiles.reduce((sum, f) => sum + fs.statSync(path.join(distPath, f)).size, 0);
  const cssBytes = cssFiles.reduce((sum, f) => sum + fs.statSync(path.join(distPath, f)).size, 0);
  const jsKB = (jsBytes / 1024).toFixed(1);
  const cssKB = (cssBytes / 1024).toFixed(1);

  // JS budget
  if (jsBytes > lane.jsFailKB * 1024) {
    console.error(`❌  ${lane.label}: JS ${jsKB} KB — EXCEEDS ${lane.jsFailKB} KB hard budget`);
    allPassed = false;
  } else if (jsBytes > lane.jsWarnKB * 1024) {
    console.warn(`⚠️  ${lane.label}: JS ${jsKB} KB — exceeds ${lane.jsWarnKB} KB soft budget (hard limit: ${lane.jsFailKB} KB)`);
  } else {
    console.log(`✅  ${lane.label}: JS ${jsKB} KB`);
  }

  // CSS budget
  if (cssBytes > lane.cssFailKB * 1024) {
    console.error(`❌  ${lane.label}: CSS ${cssKB} KB — EXCEEDS ${lane.cssFailKB} KB hard budget`);
    allPassed = false;
  } else if (cssBytes > lane.cssWarnKB * 1024) {
    console.warn(`⚠️  ${lane.label}: CSS ${cssKB} KB — exceeds ${lane.cssWarnKB} KB soft budget (hard limit: ${lane.cssFailKB} KB)`);
  } else {
    console.log(`✅  ${lane.label}: CSS ${cssKB} KB`);
  }
}

process.exit(allPassed ? 0 : 1);
