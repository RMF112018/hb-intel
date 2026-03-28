// tools/package-sppkg.ts
// Packages each SPFx webpart domain into a valid .sppkg OPC archive for App Catalog deployment.
// A .sppkg is an Open Packaging Conventions (OPC) archive, not a plain ZIP.
// It MUST contain: [Content_Types].xml, _rels/.rels, AppManifest.xml, and client-side assets.
// Reference: PH7-BW-9-CI-CD-Pipeline.md §.sppkg Packaging Script
// @decision D-PH7-BW-9

import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

// ── Filesystem helpers ─────────────────────────────────────────────────────

function walkDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function findManifests(appDir: string): string[] {
  const webpartsDir = path.join(appDir, 'src', 'webparts');
  if (!fs.existsSync(webpartsDir)) return [];
  return walkDir(webpartsDir).filter((f) => f.endsWith('.manifest.json'));
}

// ── Domain registry ────────────────────────────────────────────────────────

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

// ── OPC XML generators ─────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * Generates [Content_Types].xml for the OPC package.
 * Maps file extensions to MIME types and declares explicit overrides
 * for the root relationship and AppManifest.
 */
function generateContentTypes(assetFiles: string[]): string {
  const extSet = new Set<string>();
  for (const f of assetFiles) {
    const ext = path.extname(f).toLowerCase();
    if (ext) extSet.add(ext);
  }

  const mimeMap: Record<string, string> = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.map': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.html': 'text/html',
    '.txt': 'text/plain',
  };

  const defaults = Array.from(extSet)
    .filter((ext) => mimeMap[ext])
    .map((ext) => `  <Default Extension="${ext.slice(1)}" ContentType="${mimeMap[ext]}" />`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
${defaults}
  <Override PartName="/AppManifest.xml" ContentType="application/vnd.ms-appx.manifest+xml" />
</Types>`;
}

/**
 * Generates _rels/.rels — the root OPC relationship file.
 * Must contain exactly one relationship pointing to AppManifest.xml
 * with the SharePoint package-manifest relationship type.
 */
function generateRootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="/AppManifest.xml" />
</Relationships>`;
}

/**
 * Generates AppManifest.xml from package-solution.json and the webpart manifest.
 * This is the solution manifest that SharePoint reads to register the app.
 */
function generateAppManifest(
  solution: {
    name: string;
    id: string;
    version: string;
    skipFeatureDeployment?: boolean;
    isDomainIsolated?: boolean;
    developer: { name: string; websiteUrl: string };
    metadata: {
      shortDescription: { default: string };
      longDescription: { default: string };
    };
    features: Array<{ title: string; description: string; id: string; version: string }>;
  },
  webpartManifest: {
    id: string;
    alias: string;
    componentType: string;
    preconfiguredEntries: Array<{ title: { default: string }; description: { default: string } }>;
  },
): string {
  const feature = solution.features[0];
  const entry = webpartManifest.preconfiguredEntries[0];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest"
     Name="${escapeXml(solution.name)}"
     ProductID="{${solution.id}}"
     Version="${solution.version}"
     SharePointMinVersion="16.0.0.0"
     IsClientSideSolution="true">
  <Properties>
    <Title>${escapeXml(entry?.title?.default ?? solution.name)}</Title>
    <StartPage>~appWebUrl</StartPage>
    <SkipFeatureDeployment>${solution.skipFeatureDeployment ?? false}</SkipFeatureDeployment>
    <IsDomainIsolated>${solution.isDomainIsolated ?? false}</IsDomainIsolated>
  </Properties>
  <AppPrincipal>
    <Internal />
  </AppPrincipal>
  <WebTemplate Id="0" FeatureId="${feature?.id ?? '00000000-0000-0000-0000-000000000000'}" />
  <InstalledEventEndpoint>~remoteAppUrl/InstalledEventEndpoint.svc</InstalledEventEndpoint>
</App>`;
}

// ── Main packaging loop ────────────────────────────────────────────────────

fs.mkdirSync('dist/sppkg', { recursive: true });

let allPassed = true;

for (const domain of domains) {
  const configPath = path.join('apps', domain, 'config', 'package-solution.json');
  if (!fs.existsSync(configPath)) {
    console.error(`❌  ${domain}: config/package-solution.json not found`);
    allPassed = false;
    continue;
  }

  const distPath = path.join('apps', domain, 'dist');
  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  ${domain}: dist/ not found — run build first`);
    continue;
  }

  // Find the webpart manifest for this domain
  const manifestFiles = findManifests(path.join('apps', domain));
  if (manifestFiles.length === 0) {
    console.error(`❌  ${domain}: no webpart manifest found`);
    allPassed = false;
    continue;
  }

  const solutionPkg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const webpartManifest = JSON.parse(fs.readFileSync(manifestFiles[0], 'utf8'));
  const sppkgName = solutionPkg.paths.zippedPackage.replace('solution/', '');
  const outputPath = path.join('dist', 'sppkg', sppkgName);

  // Collect asset files for [Content_Types].xml
  const assetFiles = walkDir(distPath).map((f) => path.relative(distPath, f));

  const output = createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const closePromise = new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(output);

  // OPC root structure
  archive.append(generateContentTypes(assetFiles), { name: '[Content_Types].xml' });
  archive.append(generateRootRels(), { name: '_rels/.rels' });
  archive.append(
    generateAppManifest(solutionPkg.solution, webpartManifest),
    { name: 'AppManifest.xml' },
  );

  // Client-side assets from Vite build
  archive.directory(distPath + '/', 'ClientSideAssets');

  // Include the webpart manifest in the package
  archive.file(manifestFiles[0], {
    name: `ClientSideAssets/${path.basename(manifestFiles[0])}`,
  });

  await archive.finalize();
  await closePromise;

  // Post-build validation
  const stats = fs.statSync(outputPath);
  console.log(`✅ Packaged: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log(`   OPC: [Content_Types].xml ✓  _rels/.rels ✓  AppManifest.xml ✓`);
}

if (!allPassed) {
  process.exit(1);
}
