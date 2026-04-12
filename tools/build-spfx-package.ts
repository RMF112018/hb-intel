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
 *   4. gulp bundle --ship  (compiles shell webpart + CopyWebpackPlugin copies Vite bundle)
 *   5. gulp package-solution --ship  (produces .sppkg with all assets declared)
 *   6. Collect .sppkg into dist/sppkg/
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
import { Script, createContext } from 'node:vm';
import { createHash } from 'node:crypto';

// ── Domain registry ────────────────────────────────────────────────────────

interface DomainConfig {
  dir: string;        // directory name under apps/
  camel: string;      // camelCase for global name segment
  pascal: string;     // PascalCase for manifest lookups
  packagingModel?: 'single' | 'multi';
  extensionType?: 'ApplicationCustomizer';  // set for SPFx extension domains (Lane B)
}

interface HbShimExpectation {
  manifestId: string;
  entryModuleId: string;
  shimFileName: string;
  shimFileHash: string;
  baseModuleId: string;
}

interface HbVerificationExpectations {
  baseModuleId: string;
  shimExpectations: HbShimExpectation[];
  emittedLocalShimFiles: string[];
}

interface FreshnessEvidence {
  runId: string;
  sourceBundleSha256: string;
  sourceBundleMtimeIso: string;
  sourceBundleSizeBytes: number;
}

interface FileFingerprint {
  path: string;
  sha256: string;
  sizeBytes: number;
  mtimeIso: string;
}

interface ExpectedShimAsset {
  manifestId: string;
  entryModuleId: string;
  fileName: string;
  expectedHashPrefix: string;
}

interface PackagedAssetFingerprint {
  archivePath: string;
  fileName: string;
  sha256: string;
  sizeBytes: number;
}

interface ManifestSemanticComparison {
  manifestId: string;
  xmlPath: string;
  entryModuleId: {
    expected: string;
    actual: string;
    matches: boolean;
  };
  fields: Record<string, {
    expected: unknown;
    actual: unknown;
    matches: boolean;
  }>;
  allMatched: boolean;
}

interface HbPackageTruthProof {
  domain: string;
  generatedAt: string;
  packagingRunId: string;
  sppkgFile: string;
  pnpOpsWebpartId: string;
  sourceFingerprints: {
    criticalRuntimeFiles: FileFingerprint[];
  };
  expectedAssets: {
    appBundle: {
      fileName: string;
      sha256: string;
      sizeBytes: number;
      mtimeIso: string;
    };
    shimEntries: ExpectedShimAsset[];
  };
  packagedAssets: {
    appBundle: PackagedAssetFingerprint;
    shimEntries: PackagedAssetFingerprint[];
  };
  manifestLinkage: ManifestSemanticComparison[];
  checks: {
    structuralValidity: {
      pass: boolean;
      details: string[];
    };
    freshness: {
      pass: boolean;
      details: string[];
    };
    sourcePackageSemanticAlignment: {
      pass: boolean;
      details: string[];
    };
    liveRuntimeProof: {
      pass: boolean;
      details: string[];
    };
  };
}

interface BuildHbPackageTruthProofResult {
  ok: boolean;
  proof: HbPackageTruthProof;
}

const ALL_DOMAINS: DomainConfig[] = [
  { dir: 'accounting', camel: 'accounting', pascal: 'Accounting' },
  { dir: 'estimating', camel: 'projectSetup', pascal: 'ProjectSetup' },
  { dir: 'project-hub', camel: 'projectHub', pascal: 'ProjectHub' },
  { dir: 'leadership', camel: 'leadership', pascal: 'Leadership' },
  { dir: 'business-development', camel: 'businessDevelopment', pascal: 'BusinessDevelopment' },
  { dir: 'admin', camel: 'admin', pascal: 'Admin' },
  { dir: 'safety', camel: 'safety', pascal: 'Safety' },
  { dir: 'quality-control-warranty', camel: 'qualityControlWarranty', pascal: 'QualityControlWarranty' },
  { dir: 'risk-management', camel: 'riskManagement', pascal: 'RiskManagement' },
  { dir: 'operational-excellence', camel: 'operationalExcellence', pascal: 'OperationalExcellence' },
  { dir: 'human-resources', camel: 'humanResources', pascal: 'HumanResources' },
  { dir: 'project-sites', camel: 'projectSites', pascal: 'ProjectSites' },
  { dir: 'hb-webparts', camel: 'hbWebparts', pascal: 'HbWebparts', packagingModel: 'multi' },
  { dir: 'hb-shell-extension', camel: 'hbShellExtension', pascal: 'HbShellExtension', extensionType: 'ApplicationCustomizer' },
];

const HB_WEBPARTS_EXCLUDED_MANIFEST_IDS = new Set([
  '535f5a17-fc49-40ea-ac16-5d68895884f7', // legacy HbWebpartsWebPart
  // Retired merged People & Culture seam. Superseded by the split
  // PeopleCulturePublic (e39d9662-…) + PeopleCultureCompanion
  // (7c3f8e24-…) + HbKudos (f14e59a3-…) + HbKudosCompanion
  // (a8c5d9e2-…) webparts. Excluded from the packaging walk so the
  // rebuilt .sppkg no longer advertises the retired GUID; any
  // SharePoint pages still using this GUID must migrate to the
  // split seams.
  '27ac10f4-4054-4dd2-bd53-3b4ef4379ab4',
]);
const HB_WEBPARTS_NEUTRAL_SHELL_MANIFEST_ID = '9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e';
const HB_PNP_OPS_WEBPART_ID = '9e2dd84a-a121-4fb3-a964-f43a94abf9fd';
const DEFAULT_SUPPORTED_HOSTS = ['SharePointWebPart', 'TeamsPersonalApp'];
const HB_WEBPARTS_PROOF_CASE_IDS = new Set<string>([
  // Cumulative full-package mode: all webparts are included.
  // Proof-case IDs validated in Phase 2-3: HbHeroBanner, PriorityActionsRail.
]);
const HB_WEBPARTS_PROOF_CASE_ENTRY_MAP: Record<string, string> = {
  '39762a4d-c7fd-44a6-a11e-4f8de9f5778d': 'src/mount-hero-proof-case.tsx',
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616': 'src/mount-priority-actions-rail-proof-case.tsx',
};

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
const NODE18_BIN = process.env.HB_INTEL_NODE18_BIN
  ?? path.join(process.env.HOME ?? '', '.nvm', 'versions', 'node', 'v18.20.8', 'bin', 'node');

// ── Helpers ────────────────────────────────────────────────────────────────

function run(cmd: string, opts?: { cwd?: string; env?: Record<string, string>; useNode18?: boolean }): void {
  console.log(`  → ${cmd}`);
  // SPFx 1.18 requires Node 18. Invoke the Node 18 binary directly instead
  // of relying on shell-local nvm state, which can silently fall back to the
  // wrong Node version in CI or desktop-agent environments.
  const finalCmd = opts?.useNode18
    ? cmd.replace(/^node\b/, `"${NODE18_BIN}"`)
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

function resolveDefaultBackendMode(domainDir: string): string {
  if (process.env.BACKEND_MODE) {
    return process.env.BACKEND_MODE;
  }

  // P7-02: No domain-specific fallback. When BACKEND_MODE is unset, pass empty
  // string so the app's own runtime default ('production') takes effect.
  // Previously, estimating silently defaulted to 'ui-review' here, masking
  // missing production configuration in shipped .sppkg artifacts.
  if (domainDir) {
    console.warn(
      `[build-spfx-package] BACKEND_MODE is not set for domain "${domainDir}". ` +
      'The packaged app will use its own runtime default (production). ' +
      'Set BACKEND_MODE explicitly in CI/CD to avoid ambiguity.',
    );
  }

  return '';
}

function cleanShellTemp(): void {
  for (const dir of ['temp', 'dist', 'lib', 'sharepoint', 'assets', 'release']) {
    const target = path.join(SHELL_DIR, dir);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
  fs.mkdirSync(path.join(SHELL_DIR, 'assets'), { recursive: true });
  // Remove stale extension manifest from previous builds so only the
  // currently-intended shell type's manifest is active.
  const staleExtensionManifest = path.join(SHELL_DIR, 'src', 'extensions', 'customizer', 'ShellExtensionCustomizer.manifest.json');
  if (fs.existsSync(staleExtensionManifest)) {
    fs.rmSync(staleExtensionManifest, { force: true });
  }
  // Reset config.json to WebPart default so extension builds from a prior
  // iteration do not leak into the next domain (or into manual gulp runs).
  fs.writeFileSync(
    path.join(SHELL_DIR, 'config', 'config.json'),
    JSON.stringify({
      $schema: 'https://developer.microsoft.com/json-schemas/spfx-build/config.2.0.schema.json',
      version: '2.0',
      bundles: {
        'shell-web-part': {
          components: [{
            entrypoint: './lib/webparts/shell/ShellWebPart.js',
            manifest: './src/webparts/shell/ShellWebPart.manifest.json',
          }],
        },
      },
      externals: {},
      localizedResources: {},
    }, null, 2) + '\n',
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeXmlAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function sha256Hex(input: Buffer | string): string {
  return createHash('sha256').update(input).digest('hex');
}

function readArchiveBytes(sppkgPath: string, archivePath: string): Buffer {
  return execSync(`unzip -p "${sppkgPath}" "${archivePath}"`, {
    maxBuffer: 256 * 1024 * 1024,
  });
}

function getArchivePaths(sppkgPath: string): string[] {
  return execSync(`unzip -Z1 "${sppkgPath}"`, { encoding: 'utf8' })
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function normalizeSourceManifestField(field: string, sourceManifest: any): unknown {
  const value = sourceManifest[field];
  switch (field) {
    case 'supportedHosts':
      return Array.isArray(value) ? value : DEFAULT_SUPPORTED_HOSTS;
    case 'requiresCustomScript':
      return typeof value === 'boolean' ? value : false;
    case 'supportsThemeVariants':
      return typeof value === 'boolean' ? value : true;
    case 'supportsFullBleed':
      return typeof value === 'boolean' ? value : null;
    case 'preconfiguredEntries':
      return Array.isArray(value) ? value : [];
    default:
      return value ?? null;
  }
}

function normalizePackagedManifestField(field: string, packagedManifest: any): unknown {
  const value = packagedManifest[field];
  switch (field) {
    case 'supportedHosts':
      return Array.isArray(value) ? value : DEFAULT_SUPPORTED_HOSTS;
    case 'requiresCustomScript':
      return typeof value === 'boolean' ? value : false;
    case 'supportsThemeVariants':
      return typeof value === 'boolean' ? value : true;
    case 'supportsFullBleed':
      return typeof value === 'boolean' ? value : null;
    case 'preconfiguredEntries':
      return Array.isArray(value) ? value : [];
    default:
      return value ?? null;
  }
}

function collectRuntimeSourceFingerprints(root: string): FileFingerprint[] {
  const criticalPaths = [
    'apps/hb-webparts/src/mount.tsx',
    'apps/hb-webparts/src/webparts/pnp/PnpOps.tsx',
    'apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts',
    'apps/hb-webparts/src/webparts/pnp/pnpOpsRunnerClient.ts',
    'apps/hb-webparts/src/webparts/pnp/pnpOpsActionCatalog.ts',
    'apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.ts',
    'apps/hb-webparts/src/webparts/pnp/pnpOpsExecutionModes.ts',
    'apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json',
  ];

  const fingerprints: FileFingerprint[] = [];
  for (const relPath of criticalPaths) {
    const absPath = path.join(root, relPath);
    if (!fs.existsSync(absPath)) {
      continue;
    }
    const bytes = fs.readFileSync(absPath);
    const stats = fs.statSync(absPath);
    fingerprints.push({
      path: relPath,
      sha256: sha256Hex(bytes),
      sizeBytes: stats.size,
      mtimeIso: new Date(stats.mtimeMs).toISOString(),
    });
  }
  return fingerprints.sort((a, b) => a.path.localeCompare(b.path));
}

function parsePackagedComponentManifestById(
  sppkgPath: string,
  archivePaths: string[],
  manifestId: string,
): { xmlPath: string; manifest: any } | null {
  const xmlPath = archivePaths.find((entry) => entry.endsWith(`/WebPart_${manifestId}.xml`));
  if (!xmlPath) {
    return null;
  }
  const manifestXml = readArchiveBytes(sppkgPath, xmlPath).toString('utf8');
  const componentManifestMatch = manifestXml.match(/ComponentManifest="([^"]+)"/);
  if (!componentManifestMatch) {
    return null;
  }
  const manifestRaw = decodeXmlAttribute(componentManifestMatch[1]);
  return { xmlPath, manifest: JSON.parse(manifestRaw) };
}

function buildHbPackageTruthProof(
  root: string,
  sppkgPath: string,
  sppkgFile: string,
  packagingRunId: string,
  bundleName: string,
  freshnessEvidence: FreshnessEvidence,
  targetManifests: Array<{ file: string; json: any }>,
  generatedShimExpectations: HbShimExpectation[],
): BuildHbPackageTruthProofResult {
  const structuralDetails: string[] = [];
  const freshnessDetails: string[] = [];
  const semanticDetails: string[] = [];
  const runtimeDetails: string[] = [];
  let structuralPass = true;
  let freshnessPass = true;
  let semanticPass = true;
  let runtimePass = true;

  const archivePaths = getArchivePaths(sppkgPath);
  const expectedBundlePath = `ClientSideAssets/${bundleName}`;
  const bundleArchivePath = archivePaths.find(
    (entry) => entry === expectedBundlePath || entry.endsWith(`/${expectedBundlePath}`),
  );

  let packagedAppBundle: PackagedAssetFingerprint = {
    archivePath: '',
    fileName: bundleName,
    sha256: '',
    sizeBytes: 0,
  };

  if (!bundleArchivePath) {
    structuralPass = false;
    freshnessPass = false;
    structuralDetails.push(`Missing packaged app bundle in archive: ${bundleName}`);
    freshnessDetails.push(`Cannot verify packaged app hash because ${bundleName} is missing`);
  } else {
    const appBytes = readArchiveBytes(sppkgPath, bundleArchivePath);
    const appSha = sha256Hex(appBytes);
    packagedAppBundle = {
      archivePath: bundleArchivePath,
      fileName: bundleName,
      sha256: appSha,
      sizeBytes: appBytes.length,
    };
    if (appSha !== freshnessEvidence.sourceBundleSha256) {
      freshnessPass = false;
      freshnessDetails.push(
        `App bundle hash mismatch for ${bundleName} (source=${freshnessEvidence.sourceBundleSha256}, packaged=${appSha})`,
      );
    } else {
      freshnessDetails.push(`App bundle hash matches current build (${bundleName})`);
    }

    if (!appBytes.toString('utf8').includes(HB_PNP_OPS_WEBPART_ID)) {
      runtimePass = false;
      semanticPass = false;
      runtimeDetails.push(`Packaged app bundle ${bundleName} does not contain PnP webpart ID ${HB_PNP_OPS_WEBPART_ID}`);
      semanticDetails.push(`Missing PnP component ID marker in packaged runtime bundle (${bundleName})`);
    } else {
      runtimeDetails.push(`Packaged app bundle contains PnP webpart ID marker ${HB_PNP_OPS_WEBPART_ID}`);
    }
  }

  const packagedShimEntries: PackagedAssetFingerprint[] = [];
  const expectedShimEntries: ExpectedShimAsset[] = generatedShimExpectations.map((expectation) => ({
    manifestId: expectation.manifestId,
    entryModuleId: expectation.entryModuleId,
    fileName: expectation.shimFileName,
    expectedHashPrefix: expectation.shimFileHash,
  }));

  for (const expectedShim of expectedShimEntries) {
    const shimArchivePath = archivePaths.find(
      (entry) => entry === `ClientSideAssets/${expectedShim.fileName}` || entry.endsWith(`/ClientSideAssets/${expectedShim.fileName}`),
    );
    if (!shimArchivePath) {
      structuralPass = false;
      freshnessPass = false;
      semanticPass = false;
      structuralDetails.push(`Missing packaged shim asset ${expectedShim.fileName}`);
      freshnessDetails.push(`Cannot verify shim hash because ${expectedShim.fileName} is missing`);
      semanticDetails.push(`Manifest linkage cannot be trusted because shim ${expectedShim.fileName} is missing`);
      continue;
    }

    const shimBytes = readArchiveBytes(sppkgPath, shimArchivePath);
    const shimSha = sha256Hex(shimBytes);
    packagedShimEntries.push({
      archivePath: shimArchivePath,
      fileName: expectedShim.fileName,
      sha256: shimSha,
      sizeBytes: shimBytes.length,
    });

    if (!shimSha.startsWith(expectedShim.expectedHashPrefix)) {
      freshnessPass = false;
      semanticPass = false;
      freshnessDetails.push(
        `Shim hash mismatch for ${expectedShim.fileName} (expected prefix=${expectedShim.expectedHashPrefix}, packaged=${shimSha})`,
      );
      semanticDetails.push(`Shim linkage hash mismatch for ${expectedShim.manifestId}`);
    } else {
      freshnessDetails.push(`Shim hash matches generated mapping for ${expectedShim.fileName}`);
    }
  }

  const manifestComparisons: ManifestSemanticComparison[] = [];
  const requiredFields = [
    'id',
    'alias',
    'componentType',
    'supportedHosts',
    'preconfiguredEntries',
    'requiresCustomScript',
    'supportsThemeVariants',
    'supportsFullBleed',
  ] as const;

  const shimByManifestId = new Map(expectedShimEntries.map((entry) => [entry.manifestId, entry]));
  for (const sourceManifest of targetManifests) {
    const packaged = parsePackagedComponentManifestById(sppkgPath, archivePaths, sourceManifest.json.id);
    if (!packaged) {
      structuralPass = false;
      semanticPass = false;
      structuralDetails.push(`Missing packaged WebPart XML or ComponentManifest for ${sourceManifest.json.id}`);
      semanticDetails.push(`Missing packaged manifest linkage for ${sourceManifest.json.id}`);
      continue;
    }

    const expectedShim = shimByManifestId.get(sourceManifest.json.id);
    const expectedEntryModuleId = expectedShim?.entryModuleId ?? `${sourceManifest.json.id}_${packaged.manifest.version}`;
    const actualEntryModuleId = String(packaged.manifest.loaderConfig?.entryModuleId ?? '');
    const fieldResults: ManifestSemanticComparison['fields'] = {};
    let allMatched = actualEntryModuleId === expectedEntryModuleId;

    for (const field of requiredFields) {
      const expectedValue = normalizeSourceManifestField(field, sourceManifest.json);
      const actualValue = normalizePackagedManifestField(field, packaged.manifest);
      const matches = stableJson(expectedValue) === stableJson(actualValue);
      if (!matches) {
        allMatched = false;
      }
      fieldResults[field] = {
        expected: expectedValue ?? null,
        actual: actualValue ?? null,
        matches,
      };
    }

    const expectedScriptPath = expectedShim?.fileName;
    if (expectedScriptPath) {
      const scriptResource = packaged.manifest.loaderConfig?.scriptResources?.[expectedEntryModuleId];
      const actualPath = typeof scriptResource?.path === 'string' ? scriptResource.path : '';
      const pathMatches = actualPath === expectedScriptPath;
      if (!pathMatches) {
        allMatched = false;
      }
      fieldResults.scriptResourcePath = {
        expected: expectedScriptPath,
        actual: actualPath || null,
        matches: pathMatches,
      };
    }

    manifestComparisons.push({
      manifestId: sourceManifest.json.id,
      xmlPath: packaged.xmlPath,
      entryModuleId: {
        expected: expectedEntryModuleId,
        actual: actualEntryModuleId,
        matches: actualEntryModuleId === expectedEntryModuleId,
      },
      fields: fieldResults,
      allMatched,
    });

    if (!allMatched) {
      semanticPass = false;
      semanticDetails.push(`Manifest semantic mismatch detected for ${sourceManifest.json.id}`);
    } else {
      semanticDetails.push(`Manifest semantic alignment verified for ${sourceManifest.json.id}`);
    }
  }

  const pnpManifest = manifestComparisons.find((comparison) => comparison.manifestId === HB_PNP_OPS_WEBPART_ID);
  if (!pnpManifest) {
    structuralPass = false;
    semanticPass = false;
    runtimePass = false;
    structuralDetails.push(`PnP webpart manifest ${HB_PNP_OPS_WEBPART_ID} not found in packaged XML`);
    semanticDetails.push(`PnP webpart linkage missing for ${HB_PNP_OPS_WEBPART_ID}`);
    runtimeDetails.push(`Cannot prove PnP manifest linkage without packaged XML for ${HB_PNP_OPS_WEBPART_ID}`);
  } else {
    const pnpShim = shimByManifestId.get(HB_PNP_OPS_WEBPART_ID);
    const pnpScriptPath = pnpManifest.fields.scriptResourcePath;
    if (!pnpShim || !pnpScriptPath?.matches) {
      semanticPass = false;
      runtimePass = false;
      semanticDetails.push(`PnP webpart shim linkage mismatch for ${HB_PNP_OPS_WEBPART_ID}`);
      runtimeDetails.push(`PnP webpart entry mapping does not resolve to expected shell-entry shim`);
    } else {
      runtimeDetails.push(`PnP webpart linkage verified: ${HB_PNP_OPS_WEBPART_ID} -> ${pnpShim.fileName}`);
    }
  }

  const sourceFingerprints = collectRuntimeSourceFingerprints(root);
  if (sourceFingerprints.length === 0) {
    semanticPass = false;
    semanticDetails.push('No critical runtime source fingerprints were captured');
  }

  const proof: HbPackageTruthProof = {
    domain: 'hb-webparts',
    generatedAt: new Date().toISOString(),
    packagingRunId,
    sppkgFile,
    pnpOpsWebpartId: HB_PNP_OPS_WEBPART_ID,
    sourceFingerprints: {
      criticalRuntimeFiles: sourceFingerprints,
    },
    expectedAssets: {
      appBundle: {
        fileName: 'hb-webparts-app.js',
        sha256: freshnessEvidence.sourceBundleSha256,
        sizeBytes: freshnessEvidence.sourceBundleSizeBytes,
        mtimeIso: freshnessEvidence.sourceBundleMtimeIso,
      },
      shimEntries: expectedShimEntries,
    },
    packagedAssets: {
      appBundle: packagedAppBundle,
      shimEntries: packagedShimEntries.sort((a, b) => a.fileName.localeCompare(b.fileName)),
    },
    manifestLinkage: manifestComparisons.sort((a, b) => a.manifestId.localeCompare(b.manifestId)),
    checks: {
      structuralValidity: {
        pass: structuralPass,
        details: structuralDetails.length ? structuralDetails : ['All required package structures and assets are present'],
      },
      freshness: {
        pass: freshnessPass,
        details: freshnessDetails.length ? freshnessDetails : ['Freshness checks passed'],
      },
      sourcePackageSemanticAlignment: {
        pass: semanticPass,
        details: semanticDetails.length ? semanticDetails : ['Source/package semantic alignment checks passed'],
      },
      liveRuntimeProof: {
        pass: runtimePass,
        details: runtimeDetails.length
          ? runtimeDetails
          : ['Static runtime guards passed; SharePoint page-hosted runtime still requires live validation'],
      },
    },
  };

  const ok = structuralPass && freshnessPass && semanticPass && runtimePass;
  return { ok, proof };
}

/**
 * Generate a per-webpart copy of the compiled shell JS with the AMD define()
 * module registration name patched from the neutral shell ID to the target
 * webpart's entryModuleId.
 *
 * SPFx's AMD loader requires the define() name inside the JS file to match
 * the manifest's entryModuleId.  The neutral shell compiles as
 * define("9a2f7f61-..._1.0.0", ...) but each webpart manifest expects
 * define("{webpartId}_1.0.0", ...).  This function creates a dedicated copy
 * for each webpart with the correct module name.
 */
function generatePerWebpartShellCopy(
  sourceShellPath: string,
  neutralModuleId: string,
  targetModuleId: string,
  targetManifestId: string,
  outputDir: string,
): { fileName: string; contentHash: string } {
  const sourceJs = fs.readFileSync(sourceShellPath, 'utf8');

  const definePattern = `define("${neutralModuleId}"`;
  if (!sourceJs.includes(definePattern)) {
    throw new Error(
      `[generatePerWebpartShellCopy] Source shell JS does not contain expected ` +
      `define("${neutralModuleId}"). Cannot generate per-webpart copy for ${targetManifestId}.`,
    );
  }

  const defineReplacement = `define("${targetModuleId}"`;
  const patchedJs = sourceJs.replace(definePattern, defineReplacement);

  if (!patchedJs.includes(defineReplacement)) {
    throw new Error(
      `[generatePerWebpartShellCopy] Post-patch verification failed: ` +
      `define("${targetModuleId}") not found after replacement for ${targetManifestId}.`,
    );
  }

  const contentHash = createHash('sha256').update(patchedJs).digest('hex').slice(0, 8);
  const fileName = `shell-entry-${targetManifestId}-${contentHash}.js`;
  fs.writeFileSync(path.join(outputDir, fileName), patchedJs, 'utf8');

  return { fileName, contentHash };
}

function inspectCompiledShellAsset(
  shellAssetPath: string,
  bundleName: string,
  globalName: string,
  domainDir: string,
  backendMode?: string,
  apiAudience?: string,
  functionAppUrl?: string,
): boolean {
  if (!fs.existsSync(shellAssetPath)) {
    console.error(`  ❌ ${domainDir}: compiled shell asset missing at ${shellAssetPath}`);
    return false;
  }

  const shellJs = fs.readFileSync(shellAssetPath, 'utf8');
  const errors: string[] = [];

  if (!shellJs.includes(bundleName)) {
    errors.push(`missing bundle reference ${bundleName}`);
  }
  if (!shellJs.includes(globalName)) {
    errors.push(`missing global reference ${globalName}`);
  }
  if (backendMode && !shellJs.includes(`"${backendMode}"`)) {
    errors.push(`missing backend mode reference ${backendMode}`);
  }
  if (apiAudience && !shellJs.includes('apiAudience')) {
    errors.push('missing apiAudience reference in compiled shell asset');
  }
  if (functionAppUrl && !shellJs.includes(functionAppUrl)) {
    errors.push(`missing Function App URL reference ${functionAppUrl}`);
  }
  if (bundleName !== 'app.js' && shellJs.includes('"app.js"')) {
    errors.push('still contains fallback bundle name app.js');
  }
  if (globalName !== '__hbIntel_app' && shellJs.includes('"__hbIntel_app"')) {
    errors.push('still contains fallback global __hbIntel_app');
  }

  if (errors.length > 0) {
    console.error(`  ❌ ${domainDir}: compiled shell asset inspection failed — ${errors.join('; ')}`);
    return false;
  }

  console.log(`  ✓ Compiled shell asset references ${bundleName} and ${globalName}`);
  return true;
}

function inspectPackagedShellAsset(
  sppkgPath: string,
  bundleName: string,
  globalName: string,
  domainDir: string,
  backendMode?: string,
  apiAudience?: string,
  functionAppUrl?: string,
): boolean {
  try {
    const listOutput = execSync(`unzip -Z1 "${sppkgPath}"`, { encoding: 'utf8' });
    const shellAssetPath = listOutput
      .split('\n')
      .map((entry) => entry.trim())
      .find((entry) => /^ClientSideAssets\/shell-(web-part|extension-customizer).*\.js$/.test(entry));

    if (!shellAssetPath) {
      console.error(`  ❌ ${domainDir}: .sppkg missing packaged shell asset`);
      return false;
    }

    const shellJs = execSync(
      `unzip -p "${sppkgPath}" "${shellAssetPath}"`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
    );
    const errors: string[] = [];

    if (!shellJs.includes(bundleName)) {
      errors.push(`missing packaged bundle reference ${bundleName}`);
    }
    if (!shellJs.includes(globalName)) {
      errors.push(`missing packaged global reference ${globalName}`);
    }
    if (backendMode && !shellJs.includes(`"${backendMode}"`)) {
      errors.push(`missing packaged backend mode reference ${backendMode}`);
    }
    if (apiAudience && !shellJs.includes('apiAudience')) {
      errors.push('missing apiAudience reference in packaged shell asset');
    }
    if (functionAppUrl && !shellJs.includes(functionAppUrl)) {
      errors.push(`missing packaged Function App URL reference ${functionAppUrl}`);
    }
    if (bundleName !== 'app.js' && shellJs.includes('"app.js"')) {
      errors.push('still contains packaged fallback bundle name app.js');
    }
    if (globalName !== '__hbIntel_app' && shellJs.includes('"__hbIntel_app"')) {
      errors.push('still contains packaged fallback global __hbIntel_app');
    }

    if (errors.length > 0) {
      console.error(`  ❌ ${domainDir}: packaged shell asset inspection failed — ${errors.join('; ')}`);
      return false;
    }

    console.log(`  ✓ Packaged shell asset references ${bundleName} and ${globalName}`);
    return true;
  } catch (err) {
    console.error(`  ❌ ${domainDir}: failed to inspect packaged shell asset — ${(err as Error).message}`);
    return false;
  }
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
function verifySppkg(
  sppkgPath: string,
  bundleName: string,
  expectedIds: string[],
  domainDir: string,
  hbExpectations?: HbVerificationExpectations,
  isExtension?: boolean,
  fullBleedManifestIds?: Set<string>,
): boolean {
  try {
    // List archive contents using unzip -l (sppkg is a ZIP/OPC archive)
    const listOutput = execSync(`unzip -l "${sppkgPath}"`, { encoding: 'utf8' });
    const entries = listOutput.split('\n').map((l) => l.trim());
    const archivePaths = execSync(`unzip -Z1 "${sppkgPath}"`, { encoding: 'utf8' })
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);

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

    // Check for shell JS (webpart or extension)
    const hasShellJs = entries.some((e) =>
      /shell-web-part.*\.js/.test(e) || /ShellWebPart.*\.js/.test(e) ||
      /shell-extension-customizer.*\.js/.test(e) || /ShellExtensionCustomizer.*\.js/.test(e));
    if (!hasShellJs) {
      console.error(`  ❌ ${domainDir}: .sppkg missing compiled shell JS`);
      ok = false;
    }

    // Extract and inspect manifest payload for all expected component IDs
    try {
      const manifestJson = execSync(
        `unzip -p "${sppkgPath}" "*.manifest.json" 2>/dev/null || true`,
        { encoding: 'utf8' },
      );
      if (manifestJson) {
        for (const expectedId of expectedIds) {
          if (!manifestJson.includes(expectedId)) {
            console.error(`  ❌ ${domainDir}: component ID ${expectedId} not found in .sppkg manifest`);
            ok = false;
          } else {
            console.log(`  ✓ Component ID ${expectedId.substring(0, 8)}... found in .sppkg manifest`);
          }
        }
      }
    } catch {
      // Non-fatal — manifest extraction failed but archive structure is OK
      console.warn(`  ⚠ ${domainDir}: could not extract manifest for ID verification`);
    }

    // Extension-specific verification: ClientSideInstance.xml content and no WebPart XML
    if (isExtension) {
      const clientSideInstancePath = archivePaths.find((e) => /ClientSideInstance\.xml$/i.test(e));
      if (!clientSideInstancePath) {
        console.error(`  ❌ ${domainDir}: .sppkg missing ClientSideInstance.xml`);
        ok = false;
      } else {
        try {
          const instanceXml = execSync(
            `unzip -p "${sppkgPath}" "${clientSideInstancePath}"`,
            { encoding: 'utf8', maxBuffer: 1024 * 1024 },
          );
          if (!instanceXml.includes('Location="ClientSideExtension.ApplicationCustomizer"')) {
            console.error(`  ❌ ${domainDir}: ClientSideInstance.xml missing Location="ClientSideExtension.ApplicationCustomizer"`);
            ok = false;
          }
          if (!instanceXml.includes(`ComponentId="${expectedIds[0]}"`)) {
            console.error(`  ❌ ${domainDir}: ClientSideInstance.xml ComponentId does not match expected ${expectedIds[0]}`);
            ok = false;
          }
          if (!instanceXml.includes('Properties=')) {
            console.error(`  ❌ ${domainDir}: ClientSideInstance.xml missing Properties attribute`);
            ok = false;
          }
          if (ok) {
            console.log(`  ✓ ClientSideInstance.xml verified: Location, ComponentId, Properties correct`);
          }
        } catch (err) {
          console.error(`  ❌ ${domainDir}: failed to extract ClientSideInstance.xml — ${(err as Error).message}`);
          ok = false;
        }
      }
      // Verify no WebPart_*.xml files are present in extension packages
      const webPartXmls = archivePaths.filter((e) => /WebPart_[0-9a-f-]+\.xml$/i.test(e));
      if (webPartXmls.length > 0) {
        console.error(`  ❌ ${domainDir}: extension .sppkg should not contain WebPart XML files: ${webPartXmls.join(', ')}`);
        ok = false;
      }
    }

    const manifestById = new Map<string, { archivePath: string; manifest: any; raw: string }>();

    if (hbExpectations) {
      const availablePackagedShimFiles = new Set<string>();

      for (const manifestId of expectedIds) {
        const manifestXmlPath = archivePaths.find((entry) => entry.endsWith(`/WebPart_${manifestId}.xml`));
        if (!manifestXmlPath) {
          console.error(`  ❌ ${domainDir}: webpart xml for ${manifestId} missing from .sppkg`);
          ok = false;
          continue;
        }
        const manifestXml = execSync(
          `unzip -p "${sppkgPath}" "${manifestXmlPath}"`,
          { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
        );
        const componentManifestMatch = manifestXml.match(/ComponentManifest="([^"]+)"/);
        if (!componentManifestMatch) {
          console.error(`  ❌ ${domainDir}: ComponentManifest payload missing in ${manifestXmlPath}`);
          ok = false;
          continue;
        }
        const manifestRaw = decodeXmlAttribute(componentManifestMatch[1]);
        const parsedManifest = JSON.parse(manifestRaw);
        manifestById.set(manifestId, {
          archivePath: manifestXmlPath,
          manifest: parsedManifest,
          raw: manifestRaw,
        });
      }

      for (const shimExpectation of hbExpectations.shimExpectations) {
        const manifestRecord = manifestById.get(shimExpectation.manifestId);
        if (!manifestRecord) {
          continue;
        }

        const { manifest } = manifestRecord;
        const loaderConfig = manifest.loaderConfig ?? {};
        if (loaderConfig.entryModuleId !== shimExpectation.entryModuleId) {
          console.error(
            `  ❌ ${domainDir}: manifest ${shimExpectation.manifestId} entryModuleId mismatch ` +
            `(expected ${shimExpectation.entryModuleId}, got ${String(loaderConfig.entryModuleId)})`,
          );
          ok = false;
        }

        const scriptResource = loaderConfig.scriptResources?.[shimExpectation.entryModuleId];
        if (!scriptResource || scriptResource.type !== 'path' || typeof scriptResource.path !== 'string') {
          console.error(
            `  ❌ ${domainDir}: manifest ${shimExpectation.manifestId} missing path scriptResource for ` +
            `${shimExpectation.entryModuleId}`,
          );
          ok = false;
          continue;
        }

        if (scriptResource.path !== shimExpectation.shimFileName) {
          console.error(
            `  ❌ ${domainDir}: manifest ${shimExpectation.manifestId} scriptResources path mismatch ` +
            `(expected ${shimExpectation.shimFileName}, got ${scriptResource.path})`,
          );
          ok = false;
        }

        if (!/^shell-entry-[0-9a-f-]{36}-[a-f0-9]{8}\.js$/i.test(scriptResource.path)) {
          console.error(
            `  ❌ ${domainDir}: manifest ${shimExpectation.manifestId} scriptResource path is not versioned: ${scriptResource.path}`,
          );
          ok = false;
        }

        const shimArchivePath = archivePaths.find((entry) => entry.endsWith(`/${scriptResource.path}`));
        if (!shimArchivePath) {
          console.error(`  ❌ ${domainDir}: shim asset ${scriptResource.path} missing from .sppkg`);
          ok = false;
          continue;
        }
        availablePackagedShimFiles.add(scriptResource.path);

        const shimSource = execSync(
          `unzip -p "${sppkgPath}" "${shimArchivePath}"`,
          { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
        );
        const expectedDefine = `define("${shimExpectation.entryModuleId}"`;
        const neutralDefine = `define("${shimExpectation.baseModuleId}"`;

        if (!shimSource.includes(expectedDefine)) {
          console.error(
            `  ❌ ${domainDir}: shell entry ${scriptResource.path} missing expected AMD define for ${shimExpectation.entryModuleId}`,
          );
          ok = false;
        }
        if (shimSource.includes(neutralDefine)) {
          console.error(
            `  ❌ ${domainDir}: shell entry ${scriptResource.path} still contains neutral define ` +
            `${shimExpectation.baseModuleId} — patching failed`,
          );
          ok = false;
        }
      }

      const allManifestRaw = Array.from(manifestById.values()).map((record) => record.raw).join('\n');
      const hasLegacyStableShimRef = /shell-entry-[0-9a-f-]{36}\.js\b/i.test(allManifestRaw);
      if (hasLegacyStableShimRef) {
        console.error(`  ❌ ${domainDir}: found legacy non-versioned shim path reference in packaged manifest`);
        ok = false;
      }

      const expectedPackagedShimFiles = hbExpectations.shimExpectations.map((expectation) => expectation.shimFileName).sort();
      const packagedShimFiles = Array.from(availablePackagedShimFiles).sort();
      console.log(`  ✓ Packaged shim files (${packagedShimFiles.length}): ${packagedShimFiles.join(', ')}`);
      console.log(`  ✓ Neutral shared shell module identity: ${hbExpectations.baseModuleId}`);

      if (expectedPackagedShimFiles.join('|') !== packagedShimFiles.join('|')) {
        console.error(`  ❌ ${domainDir}: packaged shim set does not match expected manifest-to-shim mapping`);
        ok = false;
      }
    }

    // Verify supportsFullBleed preservation for webparts that declare it.
    // For single-manifest domains (no hbExpectations), extract manifests on demand.
    if (fullBleedManifestIds) {
      for (const fbId of fullBleedManifestIds) {
        if (!manifestById.has(fbId)) {
          const xmlPath = archivePaths.find((e) => e.endsWith(`/WebPart_${fbId}.xml`));
          if (xmlPath) {
            const xml = execSync(`unzip -p "${sppkgPath}" "${xmlPath}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
            const match = xml.match(/ComponentManifest="([^"]+)"/);
            if (match) {
              const raw = decodeXmlAttribute(match[1]);
              manifestById.set(fbId, { archivePath: xmlPath, manifest: JSON.parse(raw), raw });
            }
          }
        }
        const record = manifestById.get(fbId);
        if (!record) {
          console.error(`  ❌ ${domainDir}: supportsFullBleed webpart ${fbId} not found in packaged manifests`);
          ok = false;
        } else if (record.manifest.supportsFullBleed !== true) {
          console.error(`  ❌ ${domainDir}: packaged manifest ${fbId} missing supportsFullBleed: true`);
          ok = false;
        } else {
          console.log(`  ✓ ${fbId.substring(0, 8)}... supportsFullBleed: true preserved`);
        }
      }
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

function verifyPackagedBundleFreshness(
  sppkgPath: string,
  bundleName: string,
  evidence: FreshnessEvidence,
  domainDir: string,
): boolean {
  try {
    const archivePaths = execSync(`unzip -Z1 "${sppkgPath}"`, { encoding: 'utf8' })
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const expectedBundlePath = `ClientSideAssets/${bundleName}`;
    const bundleArchivePath = archivePaths.find(
      (entry) => entry === expectedBundlePath || entry.endsWith(`/${expectedBundlePath}`),
    );
    if (!bundleArchivePath) {
      console.error(`  ❌ ${domainDir}: packaged bundle ${bundleName} not found for freshness verification`);
      return false;
    }

    const packagedBytes = execSync(`unzip -p "${sppkgPath}" "${bundleArchivePath}"`, {
      maxBuffer: 256 * 1024 * 1024,
    });
    const packagedSha = sha256Hex(packagedBytes);
    if (packagedSha !== evidence.sourceBundleSha256) {
      console.error(
        `  ❌ ${domainDir}: packaged bundle hash mismatch for ${bundleName}\n` +
        `     source:   ${evidence.sourceBundleSha256}\n` +
        `     packaged: ${packagedSha}`,
      );
      return false;
    }
    console.log(`  ✓ Packaged bundle freshness verified (${bundleName}, sha256:${packagedSha.slice(0, 12)}...)`);
    return true;
  } catch (err) {
    console.error(`  ❌ ${domainDir}: failed packaged freshness verification — ${(err as Error).message}`);
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
  const isExtension = Boolean(domain.extensionType);
  const manifestGlob = isExtension
    ? path.join(appDir, 'src', 'extensions')
    : path.join(appDir, 'src', 'webparts');
  const expectedComponentType = isExtension ? 'Extension' : 'WebPart';

  // Validate prerequisites
  if (!fs.existsSync(configPath)) {
    console.error(`  ❌ ${domain.dir}: config/package-solution.json not found`);
    allPassed = false;
    continue;
  }

  // Find the domain's source manifests
  type SourceManifest = {
    file: string;
    json: any;
  };
  const sourceManifests: SourceManifest[] = [];
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
    const manifests = walk(manifestGlob).sort();
    for (const file of manifests) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (parsed.componentType !== expectedComponentType) {
        continue;
      }
      if (domain.dir === 'hb-webparts' && HB_WEBPARTS_EXCLUDED_MANIFEST_IDS.has(parsed.id)) {
        continue;
      }
      sourceManifests.push({ file, json: parsed });
    }
  }

  let targetManifests =
    domain.packagingModel === 'multi'
      ? sourceManifests
      : sourceManifests.slice(0, 1);

  // Proof-case scope lock: restrict hb-webparts to only the proof-case
  // webpart IDs until each has been validated in the first-class loader model.
  if (domain.dir === 'hb-webparts' && HB_WEBPARTS_PROOF_CASE_IDS.size > 0) {
    targetManifests = targetManifests.filter((m) => HB_WEBPARTS_PROOF_CASE_IDS.has(m.json.id));
  }

  if (targetManifests.length === 0) {
    console.error(`  ❌ ${domain.dir}: no eligible webpart manifest found`);
    allPassed = false;
    continue;
  }

  const primarySourceManifest = targetManifests[0].json;
  const targetManifestIds = targetManifests.map((m) => m.json.id);

  // ── Step 1: Enforce fresh build output ───────────────────────────────
  // baseBundleName is the fixed name Vite always outputs.
  // After content hashing (Step 1c), bundleName is updated to the hashed
  // filename which is what gulp, the .sppkg, and SharePoint will reference.
  const baseBundleName = `${domain.dir}-app.js`;
  let bundleName = baseBundleName;
  let bundlePath = path.join(distDir, bundleName);
  const packagingRunId = `${new Date().toISOString()}-${Math.random().toString(16).slice(2, 10)}`;
  let freshnessEvidence: FreshnessEvidence | undefined;

  // For the hb-webparts proof case, use the isolated entry that imports only
  // the proof-case webpart component — avoids bundle contamination from the
  // full mount.tsx which imports all 10 webpart trees.
  // The entry file is resolved from HB_WEBPARTS_PROOF_CASE_ENTRY_MAP by
  // manifest ID so future proof-case migrations do not require ad hoc
  // hardcoded entry-file replacements.
  const isProofCase = domain.dir === 'hb-webparts' && HB_WEBPARTS_PROOF_CASE_IDS.size > 0 && targetManifests.length === 1;
  const proofCaseBuildEnv: Record<string, string> = {};
  if (isProofCase) {
    const proofCaseId = targetManifests[0].json.id;
    const proofCaseEntry = HB_WEBPARTS_PROOF_CASE_ENTRY_MAP[proofCaseId];
    if (!proofCaseEntry) {
      console.error(`  ❌ ${domain.dir}: no proof-case entry mapped for manifest ID ${proofCaseId}`);
      console.error(`     Add an entry to HB_WEBPARTS_PROOF_CASE_ENTRY_MAP in build-spfx-package.ts`);
      allPassed = false;
      continue;
    }
    proofCaseBuildEnv.HB_WEBPARTS_ENTRY = proofCaseEntry;
  }

  const enforceFreshBuild = domain.dir === 'hb-webparts';
  if (enforceFreshBuild) {
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log(`  ✓ Freshness gate: removed stale dist directory ${path.relative(ROOT, distDir)}`);
    }
    console.log('  Building app with Vite (fresh build enforced)...');
    run(`pnpm --filter @hbc/spfx-${domain.dir} build`, { env: proofCaseBuildEnv });
  } else if (!fs.existsSync(distDir)) {
    console.log('  Building app with Vite...');
    run(`pnpm --filter @hbc/spfx-${domain.dir} build`, { env: proofCaseBuildEnv });
  }

  if (!fs.existsSync(bundlePath)) {
    console.error(`  ❌ ${domain.dir}: expected ${bundleName} in dist/ after build${enforceFreshBuild ? ' (fresh build gate active)' : ''}`);
    allPassed = false;
    continue;
  }

  if (enforceFreshBuild) {
    const stats = fs.statSync(bundlePath);
    freshnessEvidence = {
      runId: packagingRunId,
      sourceBundleSha256: sha256Hex(fs.readFileSync(bundlePath)),
      sourceBundleMtimeIso: new Date(stats.mtimeMs).toISOString(),
      sourceBundleSizeBytes: stats.size,
    };
    console.log(
      `  ✓ Freshness evidence captured: ${bundleName} ` +
      `(sha256:${freshnessEvidence.sourceBundleSha256.slice(0, 12)}..., ` +
      `mtime:${freshnessEvidence.sourceBundleMtimeIso}, bytes:${freshnessEvidence.sourceBundleSizeBytes})`,
    );
  }

  // Verify IIFE format (no ES module exports)
  const bundleHead = fs.readFileSync(bundlePath, 'utf8').slice(0, 500);
  if (bundleHead.includes('export default') || bundleHead.includes('export {') || bundleHead.startsWith('import ')) {
    console.error(`  ❌ ${domain.dir}: bundle is ES module format, expected IIFE`);
    allPassed = false;
    continue;
  }
  console.log(`  ✓ Vite IIFE bundle verified: ${bundleName}`);

  // ── Step 1c: Content hash — rename bundle for service-worker cache busting ──
  // SPFx's service worker (spserviceworker.js) caches assets by URL.  A fixed
  // filename means re-uploading a new .sppkg cannot bust the cached version in
  // browsers that have already loaded the old bundle — they continue serving it
  // from the SW cache even after the App Catalog file is replaced.
  //
  // Adding an 8-char SHA-256 content hash to the filename guarantees a new URL
  // on every content change.  The service worker treats this as an uncached
  // resource and fetches the new bundle from the CDN on next page load.
  //
  // This hash is computed here (post-build) and propagated into the gulp env as
  // APP_BUNDLE_NAME, so the shell webpart is compiled with the hashed filename.
  // No change is required in vite.config.ts — Vite always outputs the base name
  // and the orchestrator renames it before the SPFx build step.
  {
    // Clean up any stale hashed bundles from previous runs to keep distDir tidy.
    for (const f of fs.readdirSync(distDir)) {
      if (f.startsWith(`${domain.dir}-app-`) && f.endsWith('.js')) {
        fs.unlinkSync(path.join(distDir, f));
      }
    }

    const bundleBytes = fs.readFileSync(bundlePath);
    const contentHash = sha256Hex(bundleBytes).slice(0, 8);
    const hashedBundleName = `${domain.dir}-app-${contentHash}.js`;
    const hashedBundlePath = path.join(distDir, hashedBundleName);
    fs.copyFileSync(bundlePath, hashedBundlePath);
    bundleName = hashedBundleName;
    bundlePath = hashedBundlePath;
    console.log(`  ✓ Content hash applied: ${contentHash} → ${hashedBundleName}`);
  }

  // ── Step 1b: Runtime smoke test — verify globalThis contract ────────
  // Evaluate the built IIFE in a minimal VM and assert the global API.
  const globalName = `__hbIntel_${domain.camel}`;
  {
    // node:vm imported at top of file
    const bundleSrc = fs.readFileSync(bundlePath, 'utf8');
    // Provide a minimal browser-like global environment so the IIFE can
    // evaluate without throwing on missing globals (e.g. `global`, `window`,
    // `document`, `navigator`).  We only need the bundle to finish
    // evaluating — we do not need real DOM behavior.
    //
    // IMPORTANT: globalThis and window are intentionally SEPARATE objects here.
    // In the SPFx runtime, the script's globalThis may differ from the window
    // accessible to the shell webpart.  Using a single shared object masked this
    // divergence in previous versions of this test — causing production failures
    // that the smoke test did not catch.  mount.tsx must assign to BOTH
    // globalThis AND window explicitly; this test enforces that contract.
    const fakeGlobalThis: Record<string, unknown> = {};
    const fakeWindow: Record<string, unknown> = {};
    const sandbox: Record<string, unknown> = {
      globalThis: fakeGlobalThis,
      global: fakeGlobalThis,
      window: fakeWindow,
      self: fakeWindow,
      document: { createElement: () => ({}), head: {}, body: {}, addEventListener: () => {} },
      navigator: { userAgent: 'node-vm', onLine: true },
      location: { href: '', protocol: 'https:', hostname: 'localhost' },
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      queueMicrotask,
      Object, Array, Map, Set, WeakMap, WeakSet, Promise, Symbol, Error,
      TypeError, RangeError, JSON, Math, Date, RegExp, parseInt, parseFloat,
      isNaN, isFinite, undefined, NaN, Infinity, encodeURIComponent,
      decodeURIComponent, encodeURI, decodeURI, btoa: (s: string) => Buffer.from(s).toString('base64'),
      atob: (s: string) => Buffer.from(s, 'base64').toString(),
      URL, URLSearchParams, TextEncoder, TextDecoder,
      ArrayBuffer, Uint8Array, Int8Array, Float64Array, DataView,
      Proxy, Reflect, WeakRef, FinalizationRegistry,
    };
    const ctx = createContext(sandbox);
    try {
      new Script(bundleSrc, { filename: bundleName }).runInContext(ctx);
    } catch (e) {
      console.error(`  ❌ ${domain.dir}: bundle threw during evaluation — ${(e as Error).message}`);
      allPassed = false;
      continue;
    }

    // Check all three resolution paths that ShellWebPart.ts uses at runtime:
    //   1. SPComponentLoader reads window[globalName] after script load
    //   2. ShellWebPart reads globalThis[globalName] explicitly
    //   3. ShellWebPart reads window[globalName] explicitly
    // Because globalThis and window are separate objects here, all three paths
    // must independently expose mount/unmount for the smoke test to pass.
    const fromGlobalThis = (sandbox.globalThis as Record<string, any>)[globalName];
    const fromWindow = (sandbox.window as Record<string, any>)[globalName];
    const fromVarScope = (sandbox as Record<string, any>)[globalName];
    const resolved = fromGlobalThis ?? fromWindow ?? fromVarScope;

    // Extension domains expose mountTop/mountBottom; webpart domains expose mount/unmount.
    const requiredFns = isExtension
      ? ['mountTop', 'mountBottom', 'unmountTop', 'unmountBottom']
      : ['mount', 'unmount'];
    const missingFns = requiredFns.filter((fn) => typeof resolved?.[fn] !== 'function');
    if (!resolved || missingFns.length > 0) {
      console.error(`  ❌ ${domain.dir}: runtime smoke test failed — ${globalName} missing: ${missingFns.join(', ')}`);
      console.error(`     fromGlobalThis:`, typeof fromGlobalThis, fromGlobalThis ? Object.keys(fromGlobalThis) : 'n/a');
      console.error(`     fromWindow:`, typeof fromWindow, fromWindow ? Object.keys(fromWindow) : 'n/a');
      console.error(`     fromVarScope:`, typeof fromVarScope, fromVarScope ? Object.keys(fromVarScope) : 'n/a');
      allPassed = false;
      continue;
    }
    console.log(`  ✓ Runtime smoke test passed: ${globalName}.${requiredFns.join('() + .')}() present (globalThis + window verified independently)`);
  }

  // ── Step 2: Prepare SPFx shell project ───────────────────────────────
  cleanShellTemp();

  // Write domain-appropriate config.json — extension domains compile via
  // the ShellExtensionCustomizer entry; webpart domains via ShellWebPart.
  if (isExtension) {
    fs.writeFileSync(
      path.join(SHELL_DIR, 'config', 'config.json'),
      JSON.stringify({
        $schema: 'https://developer.microsoft.com/json-schemas/spfx-build/config.2.0.schema.json',
        version: '2.0',
        bundles: {
          'shell-extension-customizer': {
            components: [{
              entrypoint: './lib/extensions/customizer/ShellExtensionCustomizer.js',
              manifest: './src/extensions/customizer/ShellExtensionCustomizer.manifest.json',
            }],
          },
        },
        externals: {},
        localizedResources: {},
      }, null, 2) + '\n',
    );
    console.log('  ✓ config.json set to extension bundle (shell-extension-customizer)');
  }

  // Copy Vite assets into shell assets/.
  // Skip the base unhashed bundle (baseBundleName) — only the hashed copy is
  // copied so the .sppkg does not contain a redundant unhashed version.
  for (const file of fs.readdirSync(distDir)) {
    if (file === baseBundleName) continue;
    fs.copyFileSync(path.join(distDir, file), path.join(SHELL_DIR, 'assets', file));
  }

  // Write domain-specific package-solution.json
  const domainPkgSolution = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const sppkgName = domainPkgSolution.paths.zippedPackage.replace('solution/', '');

  // Parameterize webApiPermissionRequests resource at build time.
  // SPFX_API_RESOURCE env var overrides the source config default.
  // Source default is "hb-intel-api-production" (the production app registration).
  // Set SPFX_API_RESOURCE=hb-intel-api-staging for staging builds.
  const spfxApiResource = process.env.SPFX_API_RESOURCE;
  if (spfxApiResource && domainPkgSolution.solution?.webApiPermissionRequests?.length) {
    domainPkgSolution.solution.webApiPermissionRequests[0].resource = spfxApiResource;
    console.log(`  ✓ webApiPermissionRequests resource overridden: ${spfxApiResource}`);
  }

  const shellPkgSolution = {
    ...domainPkgSolution,
    paths: { zippedPackage: `solution/${sppkgName}` },
  };
  if (
    shellPkgSolution.solution?.features?.length &&
    Array.isArray(shellPkgSolution.solution.features)
  ) {
    if (isExtension) {
      // Extensions use element manifests for automatic tenant-wide activation,
      // not componentIds (which is a WebPart-only concept).
      delete shellPkgSolution.solution.features[0].componentIds;
      shellPkgSolution.solution.features[0].assets = {
        elementManifests: ['ClientSideInstance.xml'],
        elementFiles: ['ClientSideInstance.xml'],
      };
    } else {
      shellPkgSolution.solution.features[0].componentIds = targetManifestIds;
    }
  }
  fs.writeFileSync(
    path.join(SHELL_DIR, 'config', 'package-solution.json'),
    JSON.stringify(shellPkgSolution, null, 2),
  );

  // For extension domains, generate ClientSideInstance.xml for automatic
  // Tenant Wide Extensions registration.
  if (isExtension) {
    const spAssetsDir = path.join(SHELL_DIR, 'sharepoint', 'assets');
    fs.mkdirSync(spAssetsDir, { recursive: true });
    const clientSideInstanceXml = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<Elements xmlns="http://schemas.microsoft.com/sharepoint/">',
      '  <ClientSideComponentInstance',
      '    Title="HB Shell Extension"',
      '    Location="ClientSideExtension.ApplicationCustomizer"',
      `    ComponentId="${primarySourceManifest.id}"`,
      '    Properties="{}" />',
      '</Elements>',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(spAssetsDir, 'ClientSideInstance.xml'), clientSideInstanceXml);
    console.log(`  ✓ ClientSideInstance.xml generated (ComponentId=${primarySourceManifest.id})`);
  }

  // Write primary domain manifest into the shell (additional manifests for multi-mode
  // are generated from this compiled base after gulp bundle).
  // Use the neutral shell manifest only when multiple target manifests require
  // post-bundle cloning and AMD shim generation.  When a single proof-case
  // target is active, compile with the real manifest ID so SPFx emits the
  // loader contract natively — no shims, no cloned manifests.
  const useNeutralShellManifestId =
    domain.dir === 'hb-webparts' && domain.packagingModel === 'multi' && targetManifests.length > 1;
  const shellManifestId = useNeutralShellManifestId
    ? HB_WEBPARTS_NEUTRAL_SHELL_MANIFEST_ID
    : primarySourceManifest.id;
  // Write the shell manifest for SPFx compilation.
  // Extension domains: write a true Extension manifest to the extension entry path.
  // WebPart domains: write a WebPart manifest to the webpart entry path (existing behavior).
  if (isExtension) {
    const shellManifest = {
      $schema: 'https://developer.microsoft.com/json-schemas/spfx/client-side-extension-manifest.schema.json',
      id: shellManifestId,
      alias: 'ShellExtensionCustomizer',
      componentType: 'Extension',
      extensionType: 'ApplicationCustomizer',
      version: '*',
      manifestVersion: 2,
    };
    fs.writeFileSync(
      path.join(SHELL_DIR, 'src', 'extensions', 'customizer', 'ShellExtensionCustomizer.manifest.json'),
      JSON.stringify(shellManifest, null, 2),
    );
  } else {
    const shellManifest = {
      $schema: 'https://developer.microsoft.com/json-schemas/spfx/client-side-web-part-manifest.schema.json',
      id: shellManifestId,
      alias: 'ShellWebPart',
      componentType: 'WebPart',
      version: '*',
      manifestVersion: 2,
      requiresCustomScript: false,
      supportedHosts: primarySourceManifest.supportedHosts || ['SharePointWebPart', 'TeamsPersonalApp'],
      supportsThemeVariants: true,
      ...(primarySourceManifest.supportsFullBleed !== undefined && { supportsFullBleed: primarySourceManifest.supportsFullBleed }),
      preconfiguredEntries: primarySourceManifest.preconfiguredEntries,
    };
    fs.writeFileSync(
      path.join(SHELL_DIR, 'src', 'webparts', 'shell', 'ShellWebPart.manifest.json'),
      JSON.stringify(shellManifest, null, 2),
    );
  }

  // ── Step 2d: Detect companion CSS asset ─────────────────────────────
  // Vite extracts CSS to a separate file. If one exists, pass its name to
  // the shell so it can load the stylesheet at runtime via SPComponentLoader.
  const cssFiles = fs.readdirSync(path.join(SHELL_DIR, 'assets')).filter((f) => f.endsWith('.css'));
  const appCssName = cssFiles.length === 1 ? cssFiles[0] : '';
  if (appCssName) {
    console.log(`  ✓ Companion CSS detected: ${appCssName}`);
  }

  // ── Step 3: Run SPFx gulp build ─────────────────────────────────────
  const shellEnv = {
    APP_BUNDLE_NAME: bundleName,
    APP_GLOBAL_NAME: globalName,
    APP_CSS_NAME: appCssName,
    REQUIRE_DOMAIN_APP_CONFIG: 'true',
    // Pass Function App URL through to webpack DefinePlugin so the shell
    // webpart can inject it into the loaded app at runtime.
    // Read from FUNCTION_APP_URL env var (set by CI or .env).
    FUNCTION_APP_URL: process.env.FUNCTION_APP_URL ?? '',
    BACKEND_MODE: resolveDefaultBackendMode(domain.dir),
    ALLOW_BACKEND_MODE_SWITCH: process.env.ALLOW_BACKEND_MODE_SWITCH ?? '',
    API_AUDIENCE: process.env.API_AUDIENCE ?? '',
  };

  console.log('  Running gulp bundle --ship...');
  run('node node_modules/gulp-cli/bin/gulp.js bundle --ship', { cwd: SHELL_DIR, env: shellEnv, useNode18: true });

  const compiledShellAssetPath = path.join(SHELL_DIR, 'release', 'assets');
  const shellAssetPattern = isExtension
    ? /^shell-extension-customizer.*\.js$/
    : /^shell-web-part.*\.js$/;
  const compiledShellAsset = fs.existsSync(compiledShellAssetPath)
    ? fs.readdirSync(compiledShellAssetPath).find((file) => shellAssetPattern.test(file))
    : undefined;
  if (!compiledShellAsset) {
    console.error(`  ❌ ${domain.dir}: compiled shell asset not found after gulp bundle (pattern: ${shellAssetPattern})`);
    allPassed = false;
    continue;
  }
  if (!inspectCompiledShellAsset(
    path.join(compiledShellAssetPath, compiledShellAsset),
    bundleName,
    globalName,
    domain.dir,
    shellEnv.BACKEND_MODE || undefined,
    shellEnv.API_AUDIENCE || undefined,
    shellEnv.FUNCTION_APP_URL || undefined,
  )) {
    allPassed = false;
    continue;
  }

  // For multi-manifest domains, clone the compiled shell manifest to every
  // target webpart ID while preserving each source manifest's title/entries.
  const compiledManifestDir = path.join(SHELL_DIR, 'release', 'manifests');
  if (!fs.existsSync(compiledManifestDir)) {
    console.error(`  ❌ ${domain.dir}: compiled manifest directory not found`);
    allPassed = false;
    continue;
  }
  const compiledManifestFiles = fs
    .readdirSync(compiledManifestDir)
    .filter((file) => file.endsWith('.manifest.json'))
    .sort();
  if (compiledManifestFiles.length === 0) {
    console.error(`  ❌ ${domain.dir}: no compiled manifests found`);
    allPassed = false;
    continue;
  }
  const compiledBaseManifestPath = useNeutralShellManifestId
    ? path.join(compiledManifestDir, `${HB_WEBPARTS_NEUTRAL_SHELL_MANIFEST_ID}.manifest.json`)
    : path.join(compiledManifestDir, compiledManifestFiles[0]);
  if (!fs.existsSync(compiledBaseManifestPath)) {
    console.error(`  ❌ ${domain.dir}: compiled base manifest not found at ${compiledBaseManifestPath}`);
    allPassed = false;
    continue;
  }
  const compiledBaseManifest = JSON.parse(fs.readFileSync(compiledBaseManifestPath, 'utf8'));
  const compiledEntryModuleId = `${shellManifestId}_${compiledBaseManifest.version}`;
  const compiledScriptResources = compiledBaseManifest.loaderConfig?.scriptResources ?? {};
  const shellBundleKey = isExtension ? 'shell-extension-customizer' : 'shell-web-part';
  const legacyScriptResource = compiledScriptResources[shellBundleKey];
  if (!legacyScriptResource) {
    console.error(`  ❌ ${domain.dir}: compiled shell manifest missing ${shellBundleKey} script resource`);
    allPassed = false;
    continue;
  }
  const normalizedScriptResources = {
    ...compiledScriptResources,
    [compiledEntryModuleId]: legacyScriptResource,
  };
  delete (normalizedScriptResources as Record<string, unknown>)[shellBundleKey];
  const generatedShimExpectations: HbShimExpectation[] = [];

  // Remove stale shim files before rewriting per-webpart shims so repeated
  // local builds cannot accidentally retain obsolete stable shim filenames.
  for (const file of fs.readdirSync(compiledShellAssetPath)) {
    if (/^shell-entry-[0-9a-f-]{36}(?:-[a-f0-9]{8})?\.js$/i.test(file)) {
      fs.rmSync(path.join(compiledShellAssetPath, file), { force: true });
    }
  }

  for (const target of targetManifests) {
    const targetEntryModuleId = `${target.json.id}_${compiledBaseManifest.version}`;

    // SPFx's AMD loader requires the define() name inside the JS file to match
    // the manifest's entryModuleId.  The compiled shell registers as the neutral
    // ID, so generate a per-webpart copy with the define() name patched to the
    // webpart-specific entryModuleId.
    const { fileName: perWebpartFileName, contentHash: perWebpartHash } =
      generatePerWebpartShellCopy(
        path.join(compiledShellAssetPath, compiledShellAsset),
        compiledEntryModuleId,
        targetEntryModuleId,
        target.json.id,
        compiledShellAssetPath,
      );

    const perWebpartScriptResource = {
      ...legacyScriptResource,
      path: perWebpartFileName,
    };
    const targetScriptResources: Record<string, unknown> = {
      ...compiledScriptResources,
      [targetEntryModuleId]: perWebpartScriptResource,
    };
    delete (targetScriptResources as Record<string, unknown>)[shellBundleKey];

    generatedShimExpectations.push({
      manifestId: target.json.id,
      entryModuleId: targetEntryModuleId,
      shimFileName: perWebpartFileName,
      shimFileHash: perWebpartHash,
      baseModuleId: compiledEntryModuleId,
    });

    const composed = {
      ...compiledBaseManifest,
      id: target.json.id,
      alias: target.json.alias ?? compiledBaseManifest.alias,
      requiresCustomScript: target.json.requiresCustomScript ?? compiledBaseManifest.requiresCustomScript,
      supportedHosts: target.json.supportedHosts ?? compiledBaseManifest.supportedHosts,
      supportsThemeVariants: target.json.supportsThemeVariants ?? compiledBaseManifest.supportsThemeVariants,
      preconfiguredEntries: target.json.preconfiguredEntries ?? compiledBaseManifest.preconfiguredEntries,
      loaderConfig: {
        ...compiledBaseManifest.loaderConfig,
        entryModuleId: targetEntryModuleId,
        scriptResources: targetScriptResources,
      },
    };
    if (typeof target.json.supportsFullBleed === 'boolean') {
      composed.supportsFullBleed = target.json.supportsFullBleed;
    } else {
      delete (composed as Record<string, unknown>).supportsFullBleed;
    }
    fs.writeFileSync(
      path.join(compiledManifestDir, `${target.json.id}.manifest.json`),
      JSON.stringify(composed, null, 2),
    );

    console.log(`  ✓ ${target.json.id}: shell copy ${perWebpartFileName} (define → ${targetEntryModuleId})`);
  }
  if (useNeutralShellManifestId) {
    fs.rmSync(compiledBaseManifestPath, { force: true });
  }
  console.log(`  ✓ Prepared ${targetManifests.length} compiled manifest(s) for package-solution`);
  console.log(`  ✓ Base shell module identity: ${compiledEntryModuleId}`);
  if (generatedShimExpectations.length > 0) {
    console.log(`  ✓ Generated ${generatedShimExpectations.length} per-webpart shell entry module(s)`);
    for (const shim of generatedShimExpectations) {
      console.log(
        `    - ${shim.manifestId} -> ${shim.shimFileName} (entry ${shim.entryModuleId}, sha256:${shim.shimFileHash})`,
      );
    }
  }

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

  // Copy per-webpart shell entry files from release/assets/ to temp/deploy/
  // so gulp package-solution includes them in the .sppkg archive.
  for (const shimExpectation of generatedShimExpectations) {
    const shimSource = path.join(compiledShellAssetPath, shimExpectation.shimFileName);
    if (fs.existsSync(shimSource)) {
      fs.copyFileSync(shimSource, path.join(deployDir, shimExpectation.shimFileName));
    }
  }
  if (generatedShimExpectations.length > 0) {
    console.log(`  ✓ ${generatedShimExpectations.length} per-webpart shell entry file(s) copied to temp/deploy/`);
  }

  // ── Step 5: Run gulp package-solution ───────────────────────────────
  // CopyWebpackPlugin in gulpfile.js copies assets/ into the webpack output
  // during gulp bundle, so gulp package-solution now includes the Vite bundle
  // as a first-class client-side asset — no post-hoc zip injection required.
  console.log('  Running gulp package-solution --ship...');
  run('node node_modules/gulp-cli/bin/gulp.js package-solution --ship', { cwd: SHELL_DIR, env: shellEnv, useNode18: true });

  const sppkgSource = path.join(SHELL_DIR, 'sharepoint', 'solution', sppkgName);
  if (!fs.existsSync(sppkgSource)) {
    console.error(`  ❌ ${domain.dir}: .sppkg not found at ${sppkgSource}`);
    allPassed = false;
    continue;
  }

  // Safety net: if CopyWebpackPlugin didn't propagate the Vite bundle into the
  // .sppkg (e.g., version mismatch), inject it from the debug directory and re-zip.
  const debugDir = path.join(SHELL_DIR, 'sharepoint', 'solution', 'debug');
  const debugAssets = path.join(debugDir, 'ClientSideAssets');
  if (fs.existsSync(debugAssets) && !fs.existsSync(path.join(debugAssets, bundleName))) {
    console.log(`  ⚠ Vite bundle not in debug/ClientSideAssets — re-zipping from debug dir`);
    fs.copyFileSync(path.join(SHELL_DIR, 'assets', bundleName), path.join(debugAssets, bundleName));
    fs.unlinkSync(sppkgSource);
    run(`zip -r "${sppkgSource}" .`, { cwd: debugDir });
  }

  // ── Step 6: Collect and verify .sppkg output ────────────────────────
  const sppkgDest = path.join(OUTPUT_DIR, sppkgName);
  fs.copyFileSync(sppkgSource, sppkgDest);

  // Post-packaging verification: inspect .sppkg contents (OPC/ZIP archive)
  const emittedLocalShimFiles = generatedShimExpectations.map((expectation) => expectation.shimFileName).sort();
  const hbExpectations = domain.dir === 'hb-webparts'
    ? {
      baseModuleId: compiledEntryModuleId,
      shimExpectations: generatedShimExpectations,
      emittedLocalShimFiles,
    }
    : undefined;
  const fullBleedManifestIds = new Set(
    targetManifests.filter((m) => m.json.supportsFullBleed === true).map((m) => m.json.id),
  );
  const verified = verifySppkg(sppkgDest, bundleName, targetManifestIds, domain.dir, hbExpectations, isExtension, fullBleedManifestIds);
  if (!verified) {
    allPassed = false;
    continue;
  }
  if (domain.dir === 'hb-webparts' && freshnessEvidence) {
    if (!verifyPackagedBundleFreshness(sppkgDest, bundleName, freshnessEvidence, domain.dir)) {
      allPassed = false;
      continue;
    }
  }
  if (!inspectPackagedShellAsset(
    sppkgDest,
    bundleName,
    globalName,
    domain.dir,
    shellEnv.BACKEND_MODE || undefined,
    shellEnv.API_AUDIENCE || undefined,
    shellEnv.FUNCTION_APP_URL || undefined,
  )) {
    allPassed = false;
    continue;
  }

  if (hbExpectations) {
    const packagedShimSummary = hbExpectations.shimExpectations
      .map((expectation) => ({
        manifestId: expectation.manifestId,
        entryModuleId: expectation.entryModuleId,
        shimFileName: expectation.shimFileName,
        shimFileHash: expectation.shimFileHash,
        baseModuleId: expectation.baseModuleId,
      }))
      .sort((a, b) => a.manifestId.localeCompare(b.manifestId));
    const proofOutputPath = path.join(OUTPUT_DIR, `${domain.dir}-shim-proof.json`);
    fs.writeFileSync(
      proofOutputPath,
      `${JSON.stringify({
        domain: domain.dir,
        sppkgFile: path.basename(sppkgDest),
        packagingRunId: freshnessEvidence?.runId ?? null,
        sourceBundle: freshnessEvidence
          ? {
            fileName: baseBundleName,
            sha256: freshnessEvidence.sourceBundleSha256,
            mtimeIso: freshnessEvidence.sourceBundleMtimeIso,
            sizeBytes: freshnessEvidence.sourceBundleSizeBytes,
          }
          : null,
        packagedBundleName: bundleName,
        baseModuleId: hbExpectations.baseModuleId,
        emittedLocalShimFiles: hbExpectations.emittedLocalShimFiles,
        packagedShimMappings: packagedShimSummary,
      }, null, 2)}\n`,
    );
    console.log(`  ✓ Shim proof written: ${proofOutputPath}`);

    if (!freshnessEvidence) {
      console.error(`  ❌ ${domain.dir}: missing freshness evidence required for package-truth proof`);
      allPassed = false;
      continue;
    }
    const packageTruth = buildHbPackageTruthProof(
      ROOT,
      sppkgDest,
      path.basename(sppkgDest),
      freshnessEvidence.runId,
      bundleName,
      freshnessEvidence,
      targetManifests,
      generatedShimExpectations,
    );
    const packageTruthPath = path.join(OUTPUT_DIR, `${domain.dir}-package-truth-proof.json`);
    fs.writeFileSync(packageTruthPath, `${JSON.stringify(packageTruth.proof, null, 2)}\n`);
    console.log(`  ✓ Package-truth proof written: ${packageTruthPath}`);
    if (!packageTruth.ok) {
      console.error(`  ❌ ${domain.dir}: package-truth verification failed; see ${packageTruthPath}`);
      allPassed = false;
      continue;
    }
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
