// tools/package-sppkg.ts
// Packages each SPFx webpart domain into a .sppkg ZIP archive for App Catalog deployment.
// Reference: PH7-BW-9-CI-CD-Pipeline.md §.sppkg Packaging Script
// @decision D-PH7-BW-9

import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

fs.mkdirSync('dist/sppkg', { recursive: true });

let allPassed = true;

for (const domain of domains) {
  const configPath = path.join('apps', domain, 'config', 'package-solution.json');
  if (!fs.existsSync(configPath)) {
    console.error(`\u274C  ${domain}: config/package-solution.json not found`);
    allPassed = false;
    continue;
  }

  const distPath = path.join('apps', domain, 'dist');
  if (!fs.existsSync(distPath)) {
    console.warn(`\u26A0\uFE0F  ${domain}: dist/ not found \u2014 run build first`);
    continue;
  }

  const solutionPkg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const sppkgName = solutionPkg.paths.zippedPackage.replace('solution/', '');
  const outputPath = path.join('dist', 'sppkg', sppkgName);

  const output = createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Use Promise wrapper for reliable stream completion
  const closePromise = new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(output);
  archive.directory(path.join('apps', domain, 'dist') + '/', 'ClientSideAssets');
  archive.file(configPath, { name: 'package-solution.json' });

  await archive.finalize();
  await closePromise;

  console.log(`\u2705 Packaged: ${outputPath}`);
}

if (!allPassed) {
  process.exit(1);
}
