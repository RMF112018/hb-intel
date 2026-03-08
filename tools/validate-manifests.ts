// tools/validate-manifests.ts
// Validates SPFx config and manifest files across all 11 webpart apps.
// Checks: file existence, GUID uniqueness (33 total), port uniqueness.
import fs from 'fs';
import path from 'path';

const domains = [
  { dir: 'accounting', sub: 'accounting', pascal: 'Accounting' },
  { dir: 'estimating', sub: 'estimating', pascal: 'Estimating' },
  { dir: 'project-hub', sub: 'projectHub', pascal: 'ProjectHub' },
  { dir: 'leadership', sub: 'leadership', pascal: 'Leadership' },
  { dir: 'business-development', sub: 'businessDevelopment', pascal: 'BusinessDevelopment' },
  { dir: 'admin', sub: 'admin', pascal: 'Admin' },
  { dir: 'safety', sub: 'safety', pascal: 'Safety' },
  { dir: 'quality-control-warranty', sub: 'qualityControlWarranty', pascal: 'QualityControlWarranty' },
  { dir: 'risk-management', sub: 'riskManagement', pascal: 'RiskManagement' },
  { dir: 'operational-excellence', sub: 'operationalExcellence', pascal: 'OperationalExcellence' },
  { dir: 'human-resources', sub: 'humanResources', pascal: 'HumanResources' },
];

let errors = 0;
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
  }
}

if (errors > 0) {
  console.error(`\n❌ ${errors} error(s) found`);
  process.exit(1);
} else {
  console.log(`✅ All ${domains.length} apps validated:`);
  console.log(`   ${allGuids.size} GUIDs — all unique`);
  console.log(`   ${allPorts.size} ports — all unique`);
  console.log(`   ${domains.length * 4} files — all present`);
  process.exit(0);
}
