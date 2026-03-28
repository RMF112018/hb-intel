// tools/validate-manifests.ts
// Validates SPFx config and manifest files across all 11 webpart apps.
// Checks: file existence, GUID uniqueness, port uniqueness, supportedHosts
// compliance, preconfiguredEntries presence, bundle format, and IIFE global export.
import fs from 'fs';
import path from 'path';

const domains = [
  { dir: 'accounting', sub: 'accounting', pascal: 'Accounting', camel: 'accounting' },
  { dir: 'estimating', sub: 'estimating', pascal: 'Estimating', camel: 'estimating' },
  { dir: 'project-hub', sub: 'projectHub', pascal: 'ProjectHub', camel: 'projectHub' },
  { dir: 'leadership', sub: 'leadership', pascal: 'Leadership', camel: 'leadership' },
  { dir: 'business-development', sub: 'businessDevelopment', pascal: 'BusinessDevelopment', camel: 'businessDevelopment' },
  { dir: 'admin', sub: 'admin', pascal: 'Admin', camel: 'admin' },
  { dir: 'safety', sub: 'safety', pascal: 'Safety', camel: 'safety' },
  { dir: 'quality-control-warranty', sub: 'qualityControlWarranty', pascal: 'QualityControlWarranty', camel: 'qualityControlWarranty' },
  { dir: 'risk-management', sub: 'riskManagement', pascal: 'RiskManagement', camel: 'riskManagement' },
  { dir: 'operational-excellence', sub: 'operationalExcellence', pascal: 'OperationalExcellence', camel: 'operationalExcellence' },
  { dir: 'human-resources', sub: 'humanResources', pascal: 'HumanResources', camel: 'humanResources' },
];

// Allowed supportedHosts values for web-part-only target state.
// SharePointFullPage is explicitly excluded per root cause review.
const ALLOWED_HOSTS = new Set(['SharePointWebPart', 'TeamsPersonalApp', 'TeamsTab']);

let errors = 0;
let warnings = 0;
const allGuids = new Map<string, string>();
const allPorts = new Map<number, string>();

function checkGuid(guid: string, label: string): void {
  if (!guid || typeof guid !== 'string') {
    console.error(`MISSING GUID: ${label}`);
    errors++;
    return;
  }
  if (allGuids.has(guid)) {
    console.error(`COLLISION: GUID ${guid} used by both "${allGuids.get(guid)}" and "${label}"`);
    errors++;
  }
  allGuids.set(guid, label);
}

// ── File existence, GUID, and port checks ──────────────────────────────────

for (const d of domains) {
  const configDir = path.join('apps', d.dir, 'config');

  // Check package-solution.json
  const pkgPath = path.join(configDir, 'package-solution.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(`MISSING: ${pkgPath}`);
    errors++;
    continue;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  checkGuid(pkg.solution?.id, `${d.dir}/solution`);
  for (const feature of pkg.solution?.features ?? []) {
    checkGuid(feature.id, `${d.dir}/feature`);
  }

  // Verify includeClientSideAssets is true (required for embedded assets)
  if (pkg.solution?.includeClientSideAssets !== true) {
    console.error(`MISSING includeClientSideAssets: ${d.dir}/package-solution.json must set includeClientSideAssets: true`);
    errors++;
  }

  // Check serve.json
  const servePath = path.join(configDir, 'serve.json');
  if (!fs.existsSync(servePath)) {
    console.error(`MISSING: ${servePath}`);
    errors++;
  } else {
    const serve = JSON.parse(fs.readFileSync(servePath, 'utf8'));
    const port = serve.port;
    if (allPorts.has(port)) {
      console.error(`PORT COLLISION: port ${port} used by both "${allPorts.get(port)}" and "${d.dir}"`);
      errors++;
    }
    allPorts.set(port, d.dir);
  }

  // Check deploy-azure-storage.json
  const deployPath = path.join(configDir, 'deploy-azure-storage.json');
  if (!fs.existsSync(deployPath)) {
    console.error(`MISSING: ${deployPath}`);
    errors++;
  }

  // Check manifest
  const manifestPath = path.join('apps', d.dir, 'src', 'webparts', d.sub, `${d.pascal}WebPart.manifest.json`);
  if (!fs.existsSync(manifestPath)) {
    console.error(`MISSING: ${manifestPath}`);
    errors++;
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    checkGuid(manifest.id, `${d.dir}/webpart`);

    // ── supportedHosts compliance ────────────────────────────────────
    const hosts: string[] = manifest.supportedHosts ?? [];
    if (!hosts.includes('SharePointWebPart')) {
      console.error(`MISSING HOST: ${d.dir} manifest must include SharePointWebPart in supportedHosts`);
      errors++;
    }
    for (const host of hosts) {
      if (!ALLOWED_HOSTS.has(host)) {
        console.error(`INVALID HOST: ${d.dir} manifest declares "${host}" — only ${[...ALLOWED_HOSTS].join(', ')} are allowed`);
        errors++;
      }
    }

    // ── preconfiguredEntries validation ──────────────────────────────
    const entries = manifest.preconfiguredEntries;
    if (!Array.isArray(entries) || entries.length === 0) {
      console.error(`MISSING preconfiguredEntries: ${d.dir} manifest has no preconfiguredEntries (webpart won't appear in toolbox)`);
      errors++;
    } else {
      const entry = entries[0];
      if (!entry.title?.default) {
        console.error(`MISSING TITLE: ${d.dir} manifest preconfiguredEntries[0] missing title.default`);
        errors++;
      }
      if (!entry.groupId) {
        console.error(`MISSING GROUP_ID: ${d.dir} manifest preconfiguredEntries[0] missing groupId`);
        errors++;
      }
      if (!entry.officeFabricIconFontName) {
        warnings++;
        console.warn(`WARNING: ${d.dir} manifest preconfiguredEntries[0] missing officeFabricIconFontName (will use default icon)`);
      }
    }

    // ── componentType validation ─────────────────────────────────────
    if (manifest.componentType !== 'WebPart') {
      console.error(`WRONG componentType: ${d.dir} manifest declares "${manifest.componentType}" — must be "WebPart"`);
      errors++;
    }
  }
}

// ── Bundle format and IIFE global export check ─────────────────────────────
// Verify production builds are IIFE with proper global name assignment.

for (const d of domains) {
  const distDir = path.join('apps', d.dir, 'dist');
  const bundleName = `${d.dir}-app.js`;
  const bundlePath = path.join(distDir, bundleName);

  if (!fs.existsSync(bundlePath)) continue; // Skip if not built yet

  const content = fs.readFileSync(bundlePath, 'utf8');
  const head = content.slice(0, 500);
  const tail = content.slice(-500);

  // Check for ES module format (must NOT be present)
  if (head.includes('export default') || head.includes('export {') || head.startsWith('import ')) {
    console.error(`ES MODULE FORMAT: ${bundlePath} — must be IIFE for SPFx compatibility`);
    errors++;
  }

  // Check for IIFE global name assignment
  const expectedGlobal = `__hbIntel_${d.camel}`;
  if (!head.includes(`var ${expectedGlobal}=`)) {
    console.error(`MISSING IIFE GLOBAL: ${bundlePath} — expected "var ${expectedGlobal}=" at start of bundle`);
    errors++;
  }

  // Check that mount/unmount are exported on the global
  if (!tail.includes('.mount=') || !tail.includes('.unmount=')) {
    console.error(`MISSING EXPORTS: ${bundlePath} — bundle must export mount and unmount on the global`);
    errors++;
  }
}

// ── Summary ────────────────────────────────────────────────────────────────

if (errors > 0) {
  console.error(`\n❌ ${errors} error(s) found`);
  if (warnings > 0) console.warn(`   ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(`✅ All ${domains.length} apps validated:`);
  console.log(`   ${allGuids.size} GUIDs — all unique`);
  console.log(`   ${allPorts.size} ports — all unique`);
  console.log(`   ${domains.length * 4} config files — all present`);
  console.log(`   Manifest compliance: supportedHosts ✓  preconfiguredEntries ✓  componentType ✓`);
  if (warnings > 0) console.warn(`   ${warnings} warning(s)`);
  process.exit(0);
}
