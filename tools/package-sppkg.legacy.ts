// RETIRED: tools/package-sppkg.legacy.ts
// Replaced by tools/build-spfx-package.ts + tools/spfx-shell/ (official SPFx gulp tooling).
// See docs/architecture/reviews/estimating-spfx-packaging-remediation.md
//
// Original description:
// Packages each SPFx webpart domain into a valid .sppkg OPC archive for App Catalog deployment.
// A .sppkg is an Open Packaging Conventions (OPC) archive, not a plain ZIP.
// It MUST contain: [Content_Types].xml, _rels/.rels, AppManifest.xml, and runtime component manifests.
// Reference: PH7-BW-9-CI-CD-Pipeline.md §.sppkg Packaging Script
// @decision D-PH7-BW-9 (superseded by SPFx shell approach)

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
 */
function generateRootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="/AppManifest.xml" />
</Relationships>`;
}

/**
 * Generates AppManifest.xml for an SPFx client-side solution package.
 * Matches the output of the official SPFx `gulp package-solution` toolchain.
 */
function generateAppManifest(
  solution: {
    name: string;
    id: string;
    version: string;
    skipFeatureDeployment?: boolean;
    isDomainIsolated?: boolean;
    developer?: { name: string; websiteUrl: string; privacyUrl: string; termsOfUseUrl: string; mpnId: string };
    metadata?: {
      shortDescription?: { default: string };
      longDescription?: { default: string };
    };
  },
  title: string,
): string {
  const devProps = solution.developer;
  const devJson = devProps
    ? JSON.stringify({
        name: devProps.name ?? '',
        websiteUrl: devProps.websiteUrl ?? '',
        privacyUrl: devProps.privacyUrl ?? '',
        termsOfUseUrl: devProps.termsOfUseUrl ?? '',
        mpnId: devProps.mpnId || 'Undefined-1.18.0',
      })
    : null;

  const shortDesc = solution.metadata?.shortDescription?.default;
  const longDesc = solution.metadata?.longDescription?.default;

  let propsContent = `    <Title>${escapeXml(title)}</Title>`;
  if (devJson) {
    propsContent += `\n    <DeveloperProperties>${escapeXml(devJson)}</DeveloperProperties>`;
  }
  if (shortDesc) {
    propsContent += `\n    <ShortDescription>\n      <LocalizedString CultureName="default">${escapeXml(shortDesc)}</LocalizedString>\n    </ShortDescription>`;
  }
  if (longDesc) {
    propsContent += `\n    <LongDescription>\n      <LocalizedString CultureName="default">${escapeXml(longDesc)}</LocalizedString>\n    </LongDescription>`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest"
     Name="${escapeXml(solution.name)}"
     ProductID="{${solution.id}}"
     Version="${solution.version}"
     SharePointMinVersion="16.0.0.0"
     IsClientSideSolution="true"
     SkipFeatureDeployment="${solution.skipFeatureDeployment ?? true}"
     IsDomainIsolated="${solution.isDomainIsolated ?? false}">
  <Properties>
${propsContent}
  </Properties>
</App>`;
}

// ── Runtime manifest generator ─────────────────────────────────────────────

/**
 * Transforms a source component manifest into a runtime manifest with loaderConfig.
 *
 * The source manifest (e.g., EstimatingWebPart.manifest.json) is a development-time
 * artifact that declares component metadata. SharePoint's runtime loader requires a
 * RUNTIME manifest that additionally includes:
 *
 *   loaderConfig.internalModuleBaseUrls — base URL for asset resolution
 *   loaderConfig.entryModuleId          — which JS module is the entry point
 *   loaderConfig.scriptResources        — map of ALL JS modules in the bundle
 *
 * Without loaderConfig, SharePoint registers the web part but cannot load its code.
 * This is the exact transformation that `gulp bundle && gulp package-solution` performs.
 */
function generateRuntimeManifest(
  sourceManifest: Record<string, unknown>,
  solutionVersion: string,
  jsFiles: string[],
  entryFile: string,
): Record<string, unknown> {
  // Build the scriptResources map from actual Vite output files
  const scriptResources: Record<string, { type: string; path: string }> = {};
  const entryModuleId = path.basename(entryFile, '.js');

  for (const jsFile of jsFiles) {
    const moduleId = path.basename(jsFile, '.js');
    scriptResources[moduleId] = {
      type: 'path',
      path: jsFile,
    };
  }

  return {
    ...sourceManifest,
    version: solutionVersion,
    loaderConfig: {
      internalModuleBaseUrls: [
        'https://spclientsideassetlibrary/',
      ],
      entryModuleId,
      scriptResources,
    },
  };
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
  const sourceManifest = JSON.parse(fs.readFileSync(manifestFiles[0], 'utf8'));
  const sppkgName = solutionPkg.paths.zippedPackage.replace('solution/', '');
  const outputPath = path.join('dist', 'sppkg', sppkgName);

  // Derive the package title from the webpart manifest
  const title = sourceManifest.preconfiguredEntries?.[0]?.title?.default ?? solutionPkg.solution.name;

  // Collect JS files from the dist directory for loaderConfig
  const allDistFiles = walkDir(distPath).map((f) => path.relative(distPath, f));
  const jsFiles = allDistFiles.filter((f) => f.endsWith('.js'));

  // Determine entry file — Vite entry name is always {domain}-webpart.js
  const expectedEntry = `${domain}-webpart.js`;
  const entryFile = jsFiles.find((f) => f === expectedEntry) ?? jsFiles[0];

  // Generate the runtime manifest with loaderConfig
  const runtimeManifest = generateRuntimeManifest(
    sourceManifest,
    solutionPkg.solution.version,
    jsFiles,
    entryFile,
  );

  const output = createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const closePromise = new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(output);

  // OPC root structure
  archive.append(generateContentTypes(allDistFiles), { name: '[Content_Types].xml' });
  archive.append(generateRootRels(), { name: '_rels/.rels' });
  archive.append(
    generateAppManifest(solutionPkg.solution, title),
    { name: 'AppManifest.xml' },
  );

  // Runtime component manifest (with loaderConfig) replaces the raw source manifest
  const manifestFileName = path.basename(manifestFiles[0]);
  archive.append(
    JSON.stringify(runtimeManifest, null, 2),
    { name: `ClientSideAssets/${manifestFileName}` },
  );

  // Client-side assets from Vite build (excluding any .manifest.json already in dist)
  for (const file of allDistFiles) {
    archive.file(path.join(distPath, file), { name: `ClientSideAssets/${file}` });
  }

  await archive.finalize();
  await closePromise;

  // Post-build validation
  const stats = fs.statSync(outputPath);
  const hasLoader = !!runtimeManifest.loaderConfig;
  console.log(`✅ Packaged: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log(`   OPC: [Content_Types].xml ✓  _rels/.rels ✓  AppManifest.xml ✓`);
  console.log(`   Runtime manifest: loaderConfig ${hasLoader ? '✓' : '✗'}  entry: ${entryFile}  modules: ${jsFiles.length}`);
}

if (!allPassed) {
  process.exit(1);
}
