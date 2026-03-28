#!/usr/bin/env npx tsx
/**
 * SPFx-compliant packaging orchestrator.
 *
 * Replaces tools/package-sppkg.ts as the authoritative deployment artifact generator.
 * Uses the official SPFx gulp toolchain (tools/spfx-shell/) for .sppkg production.
 *
 * Flow per domain:
 *   1. Vite build → IIFE bundle in apps/{domain}/dist/
 *   2. Copy Vite output into tools/spfx-shell/assets/
 *   3. Write domain-specific manifest + package-solution config into spfx-shell/
 *   4. gulp bundle --ship  (compiles the thin shell webpart)
 *   5. Copy Vite bundle into temp/deploy/ (so package-solution includes it)
 *   6. gulp package-solution --ship  (produces .sppkg via official tooling)
 *   7. Collect .sppkg into dist/sppkg/
 *
 * Usage:
 *   npx tsx tools/build-spfx-package.ts                  # all domains
 *   npx tsx tools/build-spfx-package.ts --domain estimating  # single domain
 *
 * @see tools/spfx-shell/  (isolated SPFx project)
 * @see apps/{domain}/src/mount.tsx  (IIFE entry point)
 * @see docs/architecture/reviews/estimating-spfx-packaging-remediation.md
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ── Domain registry ────────────────────────────────────────────────────────

interface DomainConfig {
  dir: string;        // directory name under apps/
  camel: string;      // camelCase for global name segment
  pascal: string;     // PascalCase for manifest lookups
}

const ALL_DOMAINS: DomainConfig[] = [
  { dir: 'accounting', camel: 'accounting', pascal: 'Accounting' },
  { dir: 'estimating', camel: 'estimating', pascal: 'Estimating' },
  { dir: 'project-hub', camel: 'projectHub', pascal: 'ProjectHub' },
  { dir: 'leadership', camel: 'leadership', pascal: 'Leadership' },
  { dir: 'business-development', camel: 'businessDevelopment', pascal: 'BusinessDevelopment' },
  { dir: 'admin', camel: 'admin', pascal: 'Admin' },
  { dir: 'safety', camel: 'safety', pascal: 'Safety' },
  { dir: 'quality-control-warranty', camel: 'qualityControlWarranty', pascal: 'QualityControlWarranty' },
  { dir: 'risk-management', camel: 'riskManagement', pascal: 'RiskManagement' },
  { dir: 'operational-excellence', camel: 'operationalExcellence', pascal: 'OperationalExcellence' },
  { dir: 'human-resources', camel: 'humanResources', pascal: 'HumanResources' },
];

// ── CLI argument parsing ───────────────────────────────────────────────────

const args = process.argv.slice(2);
const domainIdx = args.indexOf('--domain');
const targetDomain = domainIdx !== -1 ? args[domainIdx + 1] : null;

const domains = targetDomain
  ? ALL_DOMAINS.filter((d) => d.dir === targetDomain)
  : ALL_DOMAINS;

if (targetDomain && domains.length === 0) {
  console.error(`Unknown domain: ${targetDomain}`);
  console.error(`Valid domains: ${ALL_DOMAINS.map((d) => d.dir).join(', ')}`);
  process.exit(1);
}

// ── Paths ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dirname, '..');
const SHELL_DIR = path.join(ROOT, 'tools', 'spfx-shell');
const OUTPUT_DIR = path.join(ROOT, 'dist', 'sppkg');

// ── Helpers ────────────────────────────────────────────────────────────────

function run(cmd: string, opts?: { cwd?: string; env?: Record<string, string>; useNode18?: boolean }): void {
  console.log(`  → ${cmd}`);
  // SPFx 1.18 requires Node 18. When useNode18 is true, wrap the command
  // in a bash shell that activates nvm and switches to Node 18.
  const finalCmd = opts?.useNode18
    ? `bash -c 'source "$NVM_DIR/nvm.sh" && nvm use 18 --silent && ${cmd.replace(/'/g, "'\\''")}'`
    : cmd;
  execSync(finalCmd, {
    cwd: opts?.cwd ?? ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...opts?.env },
  });
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanShellTemp(): void {
  for (const dir of ['temp', 'dist', 'lib', 'sharepoint', 'assets']) {
    const target = path.join(SHELL_DIR, dir);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
  fs.mkdirSync(path.join(SHELL_DIR, 'assets'), { recursive: true });
}

// ── Post-packaging .sppkg verification ─────────────────────────────────────

/**
 * Inspects a .sppkg archive (OPC/ZIP) to verify it contains the required
 * structure for SharePoint deployment and runtime loading.
 *
 * Checks:
 * - OPC structure files exist ([Content_Types].xml, _rels/.rels, AppManifest.xml)
 * - Vite IIFE app bundle is present in the archive
 * - At least one component manifest exists with matching webpart ID
 * - Shell webpart JS is present
 */
function verifySppkg(sppkgPath: string, bundleName: string, expectedId: string, domainDir: string): boolean {
  try {
    // List archive contents using unzip -l (sppkg is a ZIP/OPC archive)
    const listOutput = execSync(`unzip -l "${sppkgPath}"`, { encoding: 'utf8' });
    const entries = listOutput.split('\n').map((l) => l.trim());

    const checks = [
      { name: '[Content_Types].xml', pattern: /\[Content_Types\]\.xml/ },
      { name: '_rels/.rels', pattern: /_rels\/\.rels/ },
      { name: 'AppManifest.xml', pattern: /AppManifest\.xml/ },
      { name: `Vite bundle (${bundleName})`, pattern: new RegExp(bundleName.replace('.', '\\.')) },
    ];

    let ok = true;
    for (const check of checks) {
      const found = entries.some((e) => check.pattern.test(e));
      if (!found) {
        console.error(`  ❌ ${domainDir}: .sppkg missing ${check.name}`);
        ok = false;
      }
    }

    // Check for shell webpart JS
    const hasShellJs = entries.some((e) => /shell-web-part.*\.js/.test(e) || /ShellWebPart.*\.js/.test(e));
    if (!hasShellJs) {
      console.error(`  ❌ ${domainDir}: .sppkg missing compiled shell webpart JS`);
      ok = false;
    }

    // Extract and inspect manifest for webpart ID
    try {
      const manifestJson = execSync(
        `unzip -p "${sppkgPath}" "*.manifest.json" 2>/dev/null || true`,
        { encoding: 'utf8' },
      );
      if (manifestJson && manifestJson.includes(expectedId)) {
        console.log(`  ✓ Webpart ID ${expectedId.substring(0, 8)}... found in .sppkg manifest`);
      } else if (manifestJson) {
        console.error(`  ❌ ${domainDir}: webpart ID ${expectedId} not found in .sppkg manifest`);
        ok = false;
      }
    } catch {
      // Non-fatal — manifest extraction failed but archive structure is OK
      console.warn(`  ⚠ ${domainDir}: could not extract manifest for ID verification`);
    }

    if (ok) {
      console.log(`  ✓ .sppkg structure verified`);
    }
    return ok;
  } catch (err) {
    console.error(`  ❌ ${domainDir}: failed to inspect .sppkg — ${(err as Error).message}`);
    return false;
  }
}

// ── Main loop ──────────────────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let allPassed = true;

for (const domain of domains) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Packaging: ${domain.dir}`);
  console.log(`${'═'.repeat(60)}`);

  const appDir = path.join(ROOT, 'apps', domain.dir);
  const distDir = path.join(appDir, 'dist');
  const configPath = path.join(appDir, 'config', 'package-solution.json');
  const manifestGlob = path.join(appDir, 'src', 'webparts');

  // Validate prerequisites
  if (!fs.existsSync(configPath)) {
    console.error(`  ❌ ${domain.dir}: config/package-solution.json not found`);
    allPassed = false;
    continue;
  }

  // Find the domain's webpart manifest
  const manifestDir = path.join(manifestGlob, domain.camel === 'projectHub' ? 'projectHub' : domain.dir.replace(/-/g, ''));
  let manifestFile: string | undefined;
  if (fs.existsSync(manifestGlob)) {
    const walk = (dir: string): string[] => {
      const results: string[] = [];
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) results.push(...walk(p));
        else if (e.name.endsWith('.manifest.json')) results.push(p);
      }
      return results;
    };
    const manifests = walk(manifestGlob);
    manifestFile = manifests[0];
  }
  if (!manifestFile) {
    console.error(`  ❌ ${domain.dir}: no webpart manifest found`);
    allPassed = false;
    continue;
  }

  // ── Step 1: Check Vite build output exists ───────────────────────────
  const bundleName = `${domain.dir}-app.js`;
  const bundlePath = path.join(distDir, bundleName);

  if (!fs.existsSync(distDir)) {
    console.log('  Building app with Vite...');
    run(`pnpm --filter @hbc/spfx-${domain.dir} build`);
  }

  if (!fs.existsSync(bundlePath)) {
    console.error(`  ❌ ${domain.dir}: expected ${bundleName} in dist/ after build`);
    allPassed = false;
    continue;
  }

  // Verify IIFE format (no ES module exports)
  const bundleHead = fs.readFileSync(bundlePath, 'utf8').slice(0, 500);
  if (bundleHead.includes('export default') || bundleHead.includes('export {') || bundleHead.startsWith('import ')) {
    console.error(`  ❌ ${domain.dir}: bundle is ES module format, expected IIFE`);
    allPassed = false;
    continue;
  }
  console.log(`  ✓ Vite IIFE bundle verified: ${bundleName}`);

  // ── Step 2: Prepare SPFx shell project ───────────────────────────────
  cleanShellTemp();

  // Copy Vite assets into shell assets/
  for (const file of fs.readdirSync(distDir)) {
    fs.copyFileSync(path.join(distDir, file), path.join(SHELL_DIR, 'assets', file));
  }

  // Write domain-specific package-solution.json
  const domainPkgSolution = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const sppkgName = domainPkgSolution.paths.zippedPackage.replace('solution/', '');
  const shellPkgSolution = {
    ...domainPkgSolution,
    paths: { zippedPackage: `solution/${sppkgName}` },
  };
  fs.writeFileSync(
    path.join(SHELL_DIR, 'config', 'package-solution.json'),
    JSON.stringify(shellPkgSolution, null, 2),
  );

  // Write domain-specific manifest into the shell
  const sourceManifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const shellManifest = {
    $schema: 'https://developer.microsoft.com/json-schemas/spfx/client-side-web-part-manifest.schema.json',
    id: sourceManifest.id,
    alias: 'ShellWebPart',
    componentType: 'WebPart',
    version: '*',
    manifestVersion: 2,
    requiresCustomScript: false,
    supportedHosts: sourceManifest.supportedHosts || ['SharePointWebPart', 'TeamsPersonalApp'],
    supportsThemeVariants: true,
    preconfiguredEntries: sourceManifest.preconfiguredEntries,
  };
  fs.writeFileSync(
    path.join(SHELL_DIR, 'src', 'webparts', 'shell', 'ShellWebPart.manifest.json'),
    JSON.stringify(shellManifest, null, 2),
  );

  // ── Step 3: Run SPFx gulp build ─────────────────────────────────────
  const globalName = `__hbIntel_${domain.camel}`;
  const shellEnv = {
    APP_BUNDLE_NAME: bundleName,
    APP_GLOBAL_NAME: globalName,
  };

  console.log('  Running gulp bundle --ship...');
  run('npx gulp bundle --ship', { cwd: SHELL_DIR, env: shellEnv, useNode18: true });

  // ── Step 4: Inject Vite assets into temp/deploy/ ────────────────────
  const deployDir = path.join(SHELL_DIR, 'temp', 'deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  for (const file of fs.readdirSync(path.join(SHELL_DIR, 'assets'))) {
    fs.copyFileSync(
      path.join(SHELL_DIR, 'assets', file),
      path.join(deployDir, file),
    );
  }
  console.log(`  ✓ Vite assets copied to temp/deploy/`);

  // ── Step 5: Run gulp package-solution ───────────────────────────────
  console.log('  Running gulp package-solution --ship...');
  run('npx gulp package-solution --ship', { cwd: SHELL_DIR, env: shellEnv, useNode18: true });

  // ── Step 6: Inject Vite bundle into .sppkg ─────────────────────────
  // gulp package-solution only includes files it built (the shell webpart JS).
  // The Vite IIFE bundle must be added to the .sppkg as a ClientSideAsset
  // so SharePoint can serve it from the CDN alongside the shell webpart.
  const sppkgSource = path.join(SHELL_DIR, 'sharepoint', 'solution', sppkgName);
  if (!fs.existsSync(sppkgSource)) {
    console.error(`  ❌ ${domain.dir}: .sppkg not found at ${sppkgSource}`);
    allPassed = false;
    continue;
  }

  // Add Vite assets to the .sppkg archive (ZIP format) under ClientSideAssets/.
  // Create a temp staging dir with the correct path structure, then zip from there.
  const injectDir = path.join(SHELL_DIR, 'temp', '_inject');
  const injectAssets = path.join(injectDir, 'ClientSideAssets');
  fs.mkdirSync(injectAssets, { recursive: true });
  for (const file of fs.readdirSync(path.join(SHELL_DIR, 'assets'))) {
    fs.copyFileSync(path.join(SHELL_DIR, 'assets', file), path.join(injectAssets, file));
  }
  run(`zip -r "${sppkgSource}" ClientSideAssets/`, { cwd: injectDir });
  console.log(`  ✓ Vite bundle injected into .sppkg`);

  // ── Step 7: Collect and verify .sppkg output ────────────────────────
  const sppkgDest = path.join(OUTPUT_DIR, sppkgName);
  fs.copyFileSync(sppkgSource, sppkgDest);

  // Post-packaging verification: inspect .sppkg contents (OPC/ZIP archive)
  const verified = verifySppkg(sppkgDest, bundleName, sourceManifest.id, domain.dir);
  if (!verified) {
    allPassed = false;
    continue;
  }

  const stats = fs.statSync(sppkgDest);
  console.log(`  ✅ ${sppkgName} (${(stats.size / 1024).toFixed(1)} KB)`);
}

// ── Summary ──────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(60)}`);
if (allPassed) {
  console.log(`✅ All ${domains.length} domain(s) packaged successfully.`);
  console.log(`   Output: ${OUTPUT_DIR}/`);
} else {
  console.error(`❌ Some domains failed packaging.`);
  process.exit(1);
}
