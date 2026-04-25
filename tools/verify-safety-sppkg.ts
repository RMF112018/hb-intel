#!/usr/bin/env npx tsx
/**
 * Safety SPFx .sppkg verifier — read-only post-build deterministic check.
 *
 * Aggregates the four per-build proof JSONs emitted by
 * tools/build-spfx-package.ts (safety-package-truth-proof.json,
 * safety-route-auth-proof.json, safety-runtime-config-proof.json,
 * safety-shim-proof.json), validates they belong to the same packaging
 * run, computes the .sppkg-level SHA-256, extracts the package, computes
 * SHA-256 for each ClientSideAssets bundle, scans the two minified
 * bundles (safety-app and shell-web-part) for required structural-key
 * and value-level governance markers, and asserts the AppManifest /
 * webpart / feature XML inside the package match in-repo authority.
 *
 * Read-only: never mutates the .sppkg, the proof JSONs, the build
 * outputs, or any source file. Emits two unified reports:
 *   - dist/sppkg/safety-package-verification-report.json
 *   - dist/sppkg/safety-package-verification-report.md
 *
 * Exit code 0 on overall pass; 1 on any failure (with failure list
 * printed to stderr).
 *
 * Usage: npx tsx tools/verify-safety-sppkg.ts
 *
 * @see docs/how-to/safety-spfx-package-verification.md
 * @see tools/build-spfx-package.ts (orchestrator that emits the four
 *      per-build proof JSONs this verifier consumes)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SAFETY_APP_DIR = path.join(ROOT, 'apps', 'safety');
const SPPKG_DIR = path.join(ROOT, 'dist', 'sppkg');
const SPPKG_PATH = path.join(SPPKG_DIR, 'hb-intel-safety.sppkg');
const SOURCE_BUNDLE_PATH = path.join(SAFETY_APP_DIR, 'dist', 'safety-app.js');
const PROOF_FILES = {
  packageTruth: path.join(SPPKG_DIR, 'safety-package-truth-proof.json'),
  routeAuth: path.join(SPPKG_DIR, 'safety-route-auth-proof.json'),
  runtimeConfig: path.join(SPPKG_DIR, 'safety-runtime-config-proof.json'),
  shim: path.join(SPPKG_DIR, 'safety-shim-proof.json'),
} as const;
const REPORT_JSON_PATH = path.join(SPPKG_DIR, 'safety-package-verification-report.json');
const REPORT_MD_PATH = path.join(SPPKG_DIR, 'safety-package-verification-report.md');

const VERIFIER_VERSION = '1.0.0';

interface Failure {
  readonly check: string;
  readonly detail: string;
}

interface MarkerSpec {
  readonly key: string;
  readonly marker: string;
  readonly expectedBundles: ReadonlyArray<'safety-app' | 'shell-web-part'>;
  readonly description: string;
}

interface MarkerObservation {
  readonly key: string;
  readonly marker: string;
  readonly expectedBundles: ReadonlyArray<string>;
  readonly foundIn: ReadonlyArray<{ bundle: string; firstOffset: number }>;
  readonly pass: boolean;
}

function sha256File(p: string): string {
  return createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
}

function readText(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function unzipTo(sppkg: string, target: string): void {
  fs.mkdirSync(target, { recursive: true });
  // Use system unzip; -q quiet, -o overwrite (fresh tmp dir but defensive).
  execFileSync('unzip', ['-q', '-o', sppkg, '-d', target]);
}

function findFiles(root: string, predicate: (rel: string) => boolean): string[] {
  const out: string[] = [];
  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full);
      if (entry.isDirectory()) {
        walk(full);
      } else if (predicate(rel)) {
        out.push(rel);
      }
    }
  }
  walk(root);
  return out;
}

function main(): void {
  const failures: Failure[] = [];
  const fail = (check: string, detail: string): void => {
    failures.push({ check, detail });
  };

  // ── Authority loading ─────────────────────────────────────────────
  const safetyManifest = readJson<{ id: string; version: string }>(
    path.join(SAFETY_APP_DIR, 'src/webparts/safety/SafetyWebPart.manifest.json'),
  );
  const safetyPkgSolution = readJson<{
    solution: {
      id: string;
      version: string;
      features?: Array<{ id: string; version: string }>;
    };
  }>(path.join(SAFETY_APP_DIR, 'config/package-solution.json'));
  const safetyRuntimeBinding = readJson<{
    acceptedBackendOrigin: string;
    expectedApiAudience: string;
    defaultFunctionAppUrl: string;
    defaultApiAudience: string;
  }>(path.join(SAFETY_APP_DIR, 'config/runtime-binding.json'));

  const releaseProofStdout = execFileSync(
    process.execPath,
    [path.join(SAFETY_APP_DIR, 'scripts/print-release-proof.mjs')],
    { encoding: 'utf8' },
  );
  const releaseProof = JSON.parse(releaseProofStdout) as {
    runtimeBinding: { hostedGuidOverlayFingerprint: string };
  };

  const expectedAuthority = {
    manifestId: safetyManifest.id,
    packageVersion: safetyPkgSolution.solution.version,
    solutionId: safetyPkgSolution.solution.id,
    featureId: safetyPkgSolution.solution.features?.[0]?.id ?? '',
    acceptedBackendOrigin: safetyRuntimeBinding.acceptedBackendOrigin,
    apiAudience: safetyRuntimeBinding.expectedApiAudience,
    functionAppUrl: safetyRuntimeBinding.defaultFunctionAppUrl,
    fingerprint: releaseProof.runtimeBinding.hostedGuidOverlayFingerprint,
  };

  // ── .sppkg presence + SHA + mtime ─────────────────────────────────
  if (!fs.existsSync(SPPKG_PATH)) {
    fail('sppkg.exists', `${SPPKG_PATH} not found — run \`npx tsx tools/build-spfx-package.ts --domain safety\` first`);
    emitReport(failures, null);
    process.exitCode = 1;
    return;
  }
  const sppkgStat = fs.statSync(SPPKG_PATH);
  const sppkgSha = sha256File(SPPKG_PATH);

  // ── Source bundle SHA ─────────────────────────────────────────────
  if (!fs.existsSync(SOURCE_BUNDLE_PATH)) {
    fail('sourceBundle.exists', `${SOURCE_BUNDLE_PATH} not found — run \`pnpm --filter @hbc/spfx-safety build\` first`);
  }
  const sourceBundleSha = fs.existsSync(SOURCE_BUNDLE_PATH) ? sha256File(SOURCE_BUNDLE_PATH) : '';
  const sourceBundleSize = fs.existsSync(SOURCE_BUNDLE_PATH) ? fs.statSync(SOURCE_BUNDLE_PATH).size : 0;

  // ── Proof JSON loading + freshness gate ───────────────────────────
  type ProofPair = { name: string; path: string; data: Record<string, unknown> | null };
  const proofs: ProofPair[] = Object.entries(PROOF_FILES).map(([name, p]) => ({
    name,
    path: p,
    data: fs.existsSync(p) ? (readJson(p) as Record<string, unknown>) : null,
  }));
  for (const proof of proofs) {
    if (!proof.data) {
      fail(`proof.${proof.name}.exists`, `missing ${proof.path}`);
    }
  }
  const runIds = new Set(
    proofs
      .map((p) => (p.data?.packagingRunId as string | undefined) ?? null)
      .filter((v): v is string => typeof v === 'string'),
  );
  let sharedRunId: string | null = null;
  if (runIds.size === 1) {
    sharedRunId = [...runIds][0];
  } else {
    fail(
      'proofAggregation.packagingRunIdsAgree',
      `proofs are not from the same packaging run: ${[...runIds].join(' vs ') || '(none)'}`,
    );
  }

  // .sppkg mtime must be after the run-ID timestamp prefix (orchestrator
  // writes the .sppkg before the proofs; both within the same run).
  if (sharedRunId) {
    const runTsMatch = sharedRunId.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/);
    if (runTsMatch) {
      const runTs = new Date(runTsMatch[1]).getTime();
      const sppkgMtime = sppkgStat.mtimeMs;
      if (sppkgMtime < runTs) {
        fail(
          'sppkg.mtimeAfterRunId',
          `.sppkg mtime (${new Date(sppkgMtime).toISOString()}) predates packagingRunId (${runTsMatch[1]})`,
        );
      }
      // Slack window: 24h.
      if (sppkgMtime - runTs > 24 * 60 * 60 * 1000) {
        fail(
          'sppkg.mtimeWithinSlack',
          `.sppkg mtime (${new Date(sppkgMtime).toISOString()}) is more than 24h after packagingRunId (${runTsMatch[1]}); proofs may be stale`,
        );
      }
    }
  }

  // ── Per-proof check.pass flags (from existing proofs) ─────────────
  const perProofChecks: Record<string, { pass: boolean; details: string[] }> = {};
  for (const proof of proofs) {
    const checks = (proof.data?.checks as Record<string, { pass: boolean; details: string[] }>) ?? {};
    const allPass = Object.values(checks).every((c) => c?.pass === true);
    perProofChecks[proof.name] = {
      pass: allPass,
      details: Object.entries(checks).flatMap(([k, v]) => v?.details?.map((d) => `${k}: ${d}`) ?? []),
    };
    if (proof.data && Object.keys(checks).length > 0 && !allPass) {
      fail(`proof.${proof.name}.checksAllPass`, `at least one check.pass is false`);
    }
  }

  // ── Cross-validate proofs vs in-repo authority ────────────────────
  const runtimeConfigProof = proofs.find((p) => p.name === 'runtimeConfig')?.data;
  const governedAuthority = (runtimeConfigProof?.governedAuthority as Record<string, string>) ?? {};
  if (governedAuthority.expectedManifestId !== expectedAuthority.manifestId) {
    fail('crossValidation.runtimeConfig.manifestId', `proof says ${governedAuthority.expectedManifestId}; repo says ${expectedAuthority.manifestId}`);
  }
  if (governedAuthority.expectedPackageVersion !== expectedAuthority.packageVersion) {
    fail('crossValidation.runtimeConfig.packageVersion', `proof says ${governedAuthority.expectedPackageVersion}; repo says ${expectedAuthority.packageVersion}`);
  }
  if (governedAuthority.expectedHostedGuidOverlayFingerprint !== expectedAuthority.fingerprint) {
    fail('crossValidation.runtimeConfig.fingerprint', `proof says ${governedAuthority.expectedHostedGuidOverlayFingerprint}; runtime authority says ${expectedAuthority.fingerprint}`);
  }

  const shimProof = proofs.find((p) => p.name === 'shim')?.data;
  const proofSourceSha = (shimProof?.sourceBundle as Record<string, unknown> | undefined)?.sha256 as string | undefined;
  if (sourceBundleSha && proofSourceSha && proofSourceSha !== sourceBundleSha) {
    fail('crossValidation.shim.sourceBundleSha', `proof says ${proofSourceSha}; verifier computed ${sourceBundleSha}`);
  }

  const routeAuthProof = proofs.find((p) => p.name === 'routeAuth')?.data;
  const proofPackagedAppArchivePath =
    ((routeAuthProof?.packagedAppBundle as Record<string, unknown> | undefined)?.archivePath as string | undefined) ?? null;
  const proofPackagedAppSha =
    ((routeAuthProof?.packagedAppBundle as Record<string, unknown> | undefined)?.sha256 as string | undefined) ?? null;

  // ── Unzip .sppkg into temp dir ────────────────────────────────────
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sppkg-verify-'));
  let safetyAppRel = '';
  let shellWebPartRel = '';
  let shellEntryRel = '';
  let appManifestRel = '';
  const featureXmlRels: string[] = [];
  const webPartXmlRels: string[] = [];
  let safetyAppSha = '';
  let shellWebPartSha = '';
  let shellEntrySha = '';
  let safetyAppSize = 0;
  let shellWebPartSize = 0;
  let shellEntrySize = 0;

  try {
    unzipTo(SPPKG_PATH, tmpDir);

    const csaFiles = findFiles(tmpDir, (rel) => rel.startsWith('ClientSideAssets/') && rel.endsWith('.js'));
    const safetyAppMatches = csaFiles.filter((f) => /\/safety-app-[a-f0-9]+\.js$/.test(f));
    const shellWebPartMatches = csaFiles.filter((f) => /\/shell-web-part_[a-f0-9]+\.js$/.test(f));
    const shellEntryMatches = csaFiles.filter((f) => /\/shell-entry-[0-9a-f-]+-[a-f0-9]+\.js$/.test(f));
    if (safetyAppMatches.length !== 1) {
      fail('sppkg.safetyAppBundle', `expected exactly one ClientSideAssets/safety-app-*.js; found ${safetyAppMatches.length}`);
    } else {
      safetyAppRel = safetyAppMatches[0];
      safetyAppSha = sha256File(path.join(tmpDir, safetyAppRel));
      safetyAppSize = fs.statSync(path.join(tmpDir, safetyAppRel)).size;
    }
    if (shellWebPartMatches.length !== 1) {
      fail('sppkg.shellWebPartBundle', `expected exactly one ClientSideAssets/shell-web-part_*.js; found ${shellWebPartMatches.length}`);
    } else {
      shellWebPartRel = shellWebPartMatches[0];
      shellWebPartSha = sha256File(path.join(tmpDir, shellWebPartRel));
      shellWebPartSize = fs.statSync(path.join(tmpDir, shellWebPartRel)).size;
    }
    if (shellEntryMatches.length !== 1) {
      fail('sppkg.shellEntryShim', `expected exactly one ClientSideAssets/shell-entry-*.js; found ${shellEntryMatches.length}`);
    } else {
      shellEntryRel = shellEntryMatches[0];
      shellEntrySha = sha256File(path.join(tmpDir, shellEntryRel));
      shellEntrySize = fs.statSync(path.join(tmpDir, shellEntryRel)).size;
    }

    const appManifestMatches = findFiles(tmpDir, (rel) => /(^|\/)AppManifest\.xml$/i.test(rel));
    if (appManifestMatches.length !== 1) {
      fail('sppkg.appManifestXml', `expected exactly one AppManifest.xml; found ${appManifestMatches.length}`);
    } else {
      appManifestRel = appManifestMatches[0];
    }
    const featureMatches = findFiles(tmpDir, (rel) => /(^|\/)feature_[0-9a-f-]+\.xml$/i.test(rel));
    featureXmlRels.push(...featureMatches);
    const webPartMatches = findFiles(tmpDir, (rel) => /(^|\/)WebPart_[0-9a-f-]+\.xml$/i.test(rel));
    webPartXmlRels.push(...webPartMatches);

    // ── Stale-proof: archivePath in proof must match unpacked .sppkg ──
    if (proofPackagedAppArchivePath && safetyAppRel && proofPackagedAppArchivePath !== safetyAppRel) {
      fail(
        'crossValidation.routeAuth.archivePath',
        `proof says ${proofPackagedAppArchivePath}; .sppkg contains ${safetyAppRel}`,
      );
    }
    // ── Cross-validate packaged app bundle SHA in proof ──
    if (proofPackagedAppSha && safetyAppSha && proofPackagedAppSha !== safetyAppSha) {
      fail(
        'crossValidation.routeAuth.packagedAppSha',
        `proof says ${proofPackagedAppSha}; verifier computed ${safetyAppSha}`,
      );
    }
    // ── Bundle equality: packaged === source (source-of-truth) ──
    if (sourceBundleSha && safetyAppSha && sourceBundleSha !== safetyAppSha) {
      fail(
        'bundleEquality.packagedSafetyAppMatchesSource',
        `source bundle SHA ${sourceBundleSha}; packaged bundle SHA ${safetyAppSha}`,
      );
    }

    // ── Manifest XML extraction ───────────────────────────────────
    let extractedSolutionId = '';
    let extractedPackageVersion = '';
    let extractedFeatureId = '';
    let extractedWebpartManifestId = '';
    if (appManifestRel) {
      const appManifestText = readText(path.join(tmpDir, appManifestRel));
      // SPFx AppManifest.xml uses `ProductID="<solution-guid>"` on the root <App>
      // element. The solution-level package version is the bare `Version="..."`
      // attribute (not `SharePointMinVersion`, which uses the same X.X.X.X form
      // but is anchored to a different attribute name — match Version preceded
      // by whitespace to exclude it).
      const solIdMatch = appManifestText.match(/ProductID="([0-9a-f-]{36})"/i);
      const versionMatch = appManifestText.match(/\sVersion="(\d+\.\d+\.\d+\.\d+)"/);
      if (solIdMatch) extractedSolutionId = solIdMatch[1];
      if (versionMatch) extractedPackageVersion = versionMatch[1];
      if (extractedSolutionId.toLowerCase() !== expectedAuthority.solutionId.toLowerCase()) {
        fail('manifestXml.solutionId', `AppManifest says ${extractedSolutionId}; repo says ${expectedAuthority.solutionId}`);
      }
      if (extractedPackageVersion && extractedPackageVersion !== expectedAuthority.packageVersion) {
        fail('manifestXml.packageVersion', `AppManifest says ${extractedPackageVersion}; repo says ${expectedAuthority.packageVersion}`);
      }
    }
    if (featureXmlRels.length > 0) {
      const featureText = readText(path.join(tmpDir, featureXmlRels[0]));
      const featIdMatch = featureText.match(/Id="\{?([0-9a-f-]{36})\}?"/i)
        ?? featureText.match(/FeatureId="\{?([0-9a-f-]{36})\}?"/i);
      if (featIdMatch) extractedFeatureId = featIdMatch[1];
      if (extractedFeatureId.toLowerCase() !== expectedAuthority.featureId.toLowerCase()) {
        fail('manifestXml.featureId', `feature XML says ${extractedFeatureId}; repo says ${expectedAuthority.featureId}`);
      }
    } else {
      fail('manifestXml.featureXmlPresent', 'no feature_*.xml found in package');
    }
    if (webPartXmlRels.length > 0) {
      const wpText = readText(path.join(tmpDir, webPartXmlRels[0]));
      // The WebPart_<id>.xml file references the manifest id by GUID substring.
      if (wpText.includes(expectedAuthority.manifestId)) {
        extractedWebpartManifestId = expectedAuthority.manifestId;
      } else {
        const wpIdMatch = webPartXmlRels[0].match(/WebPart_([0-9a-f-]{36})\.xml$/i);
        if (wpIdMatch) extractedWebpartManifestId = wpIdMatch[1];
        fail(
          'manifestXml.webPartManifestId',
          `WebPart XML at ${webPartXmlRels[0]} does not reference expected manifest id ${expectedAuthority.manifestId}`,
        );
      }
    } else {
      fail('manifestXml.webPartXmlPresent', 'no WebPart_*.xml found in package');
    }

    // ── Marker scan ───────────────────────────────────────────────
    const markerSpecs: MarkerSpec[] = [
      { key: 'runtimeBindingProofGlobal', marker: '__hbIntel_safetyRuntimeBindingProof', expectedBundles: ['safety-app'], description: 'Mount-published global proof marker' },
      { key: 'apiAudienceKey', marker: 'apiAudience', expectedBundles: ['safety-app', 'shell-web-part'], description: 'Token audience structural key' },
      { key: 'expectedApiAudienceKey', marker: 'expectedApiAudience', expectedBundles: ['safety-app', 'shell-web-part'], description: 'Governed expected audience structural key' },
      { key: 'acceptedBackendOriginKey', marker: 'acceptedBackendOrigin', expectedBundles: ['safety-app', 'shell-web-part'], description: 'Backend origin allowlist structural key' },
      { key: 'expectedHostedGuidOverlayFingerprintKey', marker: 'expectedHostedGuidOverlayFingerprint', expectedBundles: ['safety-app', 'shell-web-part'], description: 'Overlay fingerprint structural key' },
      { key: 'manifestIdValue', marker: expectedAuthority.manifestId, expectedBundles: ['safety-app', 'shell-web-part'], description: 'Safety webpart manifest GUID value' },
      { key: 'packageVersionValue', marker: expectedAuthority.packageVersion, expectedBundles: ['safety-app', 'shell-web-part'], description: 'Safety package version value' },
      { key: 'apiAudienceValue', marker: expectedAuthority.apiAudience, expectedBundles: ['safety-app', 'shell-web-part'], description: 'Governed API audience GUID value' },
      { key: 'functionAppUrlValue', marker: expectedAuthority.functionAppUrl, expectedBundles: ['safety-app', 'shell-web-part'], description: 'Governed Function App URL value' },
      // Note: the fingerprint VALUE (`fnv1a32:...`) is computed at runtime in
      // safety-app.js via FNV-1a over the overlay GUIDs (which ARE baked in by
      // Vite); the literal string only exists in the shell bundle, where it's
      // injected via DefinePlugin from the build orchestrator. The Safety
      // bundle's computation correctness is asserted independently by the
      // hostedSafetyGuidBinding.test.ts and safetyReleaseProof.test.ts suites.
      { key: 'fingerprintValue', marker: expectedAuthority.fingerprint, expectedBundles: ['shell-web-part'], description: 'Hosted GUID overlay fingerprint value (shell-only; safety-app computes at runtime)' },
    ];
    const safetyAppText = safetyAppRel ? fs.readFileSync(path.join(tmpDir, safetyAppRel)).toString('latin1') : '';
    const shellText = shellWebPartRel ? fs.readFileSync(path.join(tmpDir, shellWebPartRel)).toString('latin1') : '';
    const markerObservations: MarkerObservation[] = markerSpecs.map((spec) => {
      const found: { bundle: string; firstOffset: number }[] = [];
      const safetyOffset = safetyAppText.indexOf(spec.marker);
      if (safetyOffset >= 0) found.push({ bundle: 'safety-app', firstOffset: safetyOffset });
      const shellOffset = shellText.indexOf(spec.marker);
      if (shellOffset >= 0) found.push({ bundle: 'shell-web-part', firstOffset: shellOffset });
      // Pass: every required bundle has a hit.
      const foundBundles = new Set(found.map((f) => f.bundle));
      const pass = spec.expectedBundles.every((b) => foundBundles.has(b));
      if (!pass) {
        const missing = spec.expectedBundles.filter((b) => !foundBundles.has(b));
        fail(
          `markerScan.${spec.key}`,
          `marker "${spec.marker}" missing in: ${missing.join(', ')}`,
        );
      }
      return {
        key: spec.key,
        marker: spec.marker,
        expectedBundles: spec.expectedBundles,
        foundIn: found,
        pass,
      };
    });

    // ── Build report ──────────────────────────────────────────────
    const report = {
      verifierVersion: VERIFIER_VERSION,
      generatedAt: new Date().toISOString(),
      expectedAuthority,
      sppkg: {
        path: SPPKG_PATH,
        sha256: sppkgSha,
        sizeBytes: sppkgStat.size,
        mtimeIso: new Date(sppkgStat.mtimeMs).toISOString(),
      },
      packagedAssets: {
        safetyAppBundle: { archivePath: safetyAppRel, sha256: safetyAppSha, sizeBytes: safetyAppSize },
        shellWebPartBundle: { archivePath: shellWebPartRel, sha256: shellWebPartSha, sizeBytes: shellWebPartSize },
        shellEntryShim: { archivePath: shellEntryRel, sha256: shellEntrySha, sizeBytes: shellEntrySize },
      },
      sourceBundle: { path: SOURCE_BUNDLE_PATH, sha256: sourceBundleSha, sizeBytes: sourceBundleSize },
      bundleEquality: {
        packagedSafetyAppMatchesSource: !!sourceBundleSha && !!safetyAppSha && sourceBundleSha === safetyAppSha,
        proofSourceShaMatchesComputed: !!sourceBundleSha && !!proofSourceSha && proofSourceSha === sourceBundleSha,
      },
      manifestXml: {
        appManifestPath: appManifestRel,
        featureManifestPaths: featureXmlRels,
        webpartManifestPaths: webPartXmlRels,
        extractedSolutionId,
        extractedPackageVersion,
        extractedFeatureId,
        extractedWebpartManifestId,
        allMatched:
          extractedSolutionId.toLowerCase() === expectedAuthority.solutionId.toLowerCase() &&
          extractedPackageVersion === expectedAuthority.packageVersion &&
          extractedFeatureId.toLowerCase() === expectedAuthority.featureId.toLowerCase() &&
          extractedWebpartManifestId === expectedAuthority.manifestId,
      },
      proofAggregation: {
        packagingRunIdsAgree: runIds.size === 1,
        sharedPackagingRunId: sharedRunId,
        perProofChecksAllPass: Object.values(perProofChecks).every((p) => p.pass),
        perProof: perProofChecks,
      },
      markerScan: markerObservations,
      appCatalogDeployment: {
        uploaded: null,
        deployedVersion: null,
        matchesExpected: null,
        uploadedAt: null,
        operatorNote: null,
      },
      hostedPageProof: {
        captured: null,
        hostSource: null,
        webPartIdMatchesManifest: null,
        canInitializeCommands: null,
        blockingReasons: null,
        expectedPackageVersionMatchesDeployed: null,
        operatorNote: null,
      },
      overallPass: failures.length === 0,
      failures,
    };
    fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2) + '\n');
    fs.writeFileSync(REPORT_MD_PATH, renderMarkdown(report));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    process.stderr.write(`\nVerifier FAILED with ${failures.length} issue(s):\n`);
    for (const f of failures) {
      process.stderr.write(`  - [${f.check}] ${f.detail}\n`);
    }
    process.stderr.write(`\nReport: ${REPORT_JSON_PATH}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Verifier PASSED. Report: ${REPORT_MD_PATH}\n`);
  }
}

function emitReport(failures: Failure[], partial: unknown): void {
  const stub = {
    verifierVersion: VERIFIER_VERSION,
    generatedAt: new Date().toISOString(),
    overallPass: false,
    failures,
    partial,
  };
  try {
    fs.mkdirSync(SPPKG_DIR, { recursive: true });
    fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(stub, null, 2) + '\n');
  } catch {
    // Best-effort report; failures already printed below.
  }
  process.stderr.write(`\nVerifier FAILED early:\n`);
  for (const f of failures) {
    process.stderr.write(`  - [${f.check}] ${f.detail}\n`);
  }
}

function renderMarkdown(report: ReturnType<typeof asReport>): string {
  const r = report;
  const lines: string[] = [];
  lines.push(`# Safety SPFx Package Verification Report`);
  lines.push('');
  lines.push(`- Verifier version: \`${r.verifierVersion}\``);
  lines.push(`- Generated: ${r.generatedAt}`);
  lines.push(`- Overall: **${r.overallPass ? 'PASS' : 'FAIL'}**`);
  lines.push('');
  lines.push('## Build & package commands');
  lines.push('```bash');
  lines.push('pnpm --filter @hbc/spfx-safety build');
  lines.push('npx tsx tools/build-spfx-package.ts --domain safety');
  lines.push('npx tsx tools/verify-safety-sppkg.ts');
  lines.push('```');
  lines.push('');
  lines.push('## Expected authority (in-repo)');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  for (const [k, v] of Object.entries(r.expectedAuthority)) {
    lines.push(`| ${k} | \`${v}\` |`);
  }
  lines.push('');
  lines.push('## .sppkg artifact');
  lines.push(`- Path: \`${r.sppkg.path}\``);
  lines.push(`- SHA-256: \`${r.sppkg.sha256}\``);
  lines.push(`- Size: ${r.sppkg.sizeBytes} bytes`);
  lines.push(`- mtime: ${r.sppkg.mtimeIso}`);
  lines.push('');
  lines.push('## Packaged assets');
  lines.push('| Asset | Archive path | SHA-256 | Size |');
  lines.push('| --- | --- | --- | --- |');
  for (const [k, v] of Object.entries(r.packagedAssets) as Array<[string, { archivePath: string; sha256: string; sizeBytes: number }]>) {
    lines.push(`| ${k} | \`${v.archivePath}\` | \`${v.sha256}\` | ${v.sizeBytes} |`);
  }
  lines.push('');
  lines.push('## Source bundle (Vite output)');
  lines.push(`- Path: \`${r.sourceBundle.path}\``);
  lines.push(`- SHA-256: \`${r.sourceBundle.sha256}\``);
  lines.push(`- Size: ${r.sourceBundle.sizeBytes} bytes`);
  lines.push('');
  lines.push('## Bundle equality assertions');
  lines.push(`- Packaged Safety bundle === Vite source bundle (SHA-256): **${r.bundleEquality.packagedSafetyAppMatchesSource ? 'PASS' : 'FAIL'}**`);
  lines.push(`- Proof's source SHA === verifier-computed source SHA: **${r.bundleEquality.proofSourceShaMatchesComputed ? 'PASS' : 'FAIL'}**`);
  lines.push('');
  lines.push('## Manifest XML extraction');
  lines.push(`- AppManifest.xml: \`${r.manifestXml.appManifestPath}\``);
  lines.push(`- Feature XML(s): ${r.manifestXml.featureManifestPaths.map((p) => `\`${p}\``).join(', ') || '_(none)_'}`);
  lines.push(`- WebPart XML(s): ${r.manifestXml.webpartManifestPaths.map((p) => `\`${p}\``).join(', ') || '_(none)_'}`);
  lines.push(`- Extracted SolutionId: \`${r.manifestXml.extractedSolutionId}\``);
  lines.push(`- Extracted PackageVersion: \`${r.manifestXml.extractedPackageVersion}\``);
  lines.push(`- Extracted FeatureId: \`${r.manifestXml.extractedFeatureId}\``);
  lines.push(`- Extracted WebPart manifest ID: \`${r.manifestXml.extractedWebpartManifestId}\``);
  lines.push(`- All matched expected authority: **${r.manifestXml.allMatched ? 'PASS' : 'FAIL'}**`);
  lines.push('');
  lines.push('## Proof aggregation (four per-build proof JSONs)');
  lines.push(`- Shared packagingRunId: \`${r.proofAggregation.sharedPackagingRunId ?? '(none)'}\``);
  lines.push(`- All proofs share same run ID: **${r.proofAggregation.packagingRunIdsAgree ? 'PASS' : 'FAIL'}** _(stale-proof gate)_`);
  lines.push(`- All per-proof checks pass: **${r.proofAggregation.perProofChecksAllPass ? 'PASS' : 'FAIL'}**`);
  for (const [name, p] of Object.entries(r.proofAggregation.perProof) as Array<[string, { pass: boolean; details: string[] }]>) {
    lines.push(`  - **${name}**: ${p.pass ? 'PASS' : 'FAIL'}`);
    for (const d of p.details) {
      lines.push(`    - ${d}`);
    }
  }
  lines.push('');
  lines.push('## Marker scan (byte-level, minified-safe, value-precise)');
  lines.push('| Marker | Expected bundles | Found in (offset) | Pass |');
  lines.push('| --- | --- | --- | --- |');
  for (const m of r.markerScan) {
    const foundCol =
      m.foundIn.length === 0
        ? '_(none)_'
        : m.foundIn.map((f) => `${f.bundle} @ ${f.firstOffset}`).join('; ');
    const truncatedMarker = m.marker.length > 80 ? `${m.marker.slice(0, 77)}…` : m.marker;
    lines.push(`| \`${truncatedMarker}\` | ${m.expectedBundles.join(', ')} | ${foundCol} | ${m.pass ? '✅' : '❌'} |`);
  }
  lines.push('');
  lines.push('## App Catalog deployment (operator-filled post-upload)');
  lines.push(`- Uploaded: \`${r.appCatalogDeployment.uploaded ?? 'null'}\``);
  lines.push(`- Deployed version: \`${r.appCatalogDeployment.deployedVersion ?? 'null'}\``);
  lines.push(`- Matches expected: \`${r.appCatalogDeployment.matchesExpected ?? 'null'}\``);
  lines.push(`- Uploaded at: \`${r.appCatalogDeployment.uploadedAt ?? 'null'}\``);
  lines.push(`- Operator note: \`${r.appCatalogDeployment.operatorNote ?? 'null'}\``);
  lines.push('');
  lines.push('## Hosted page runtime proof (operator-filled post-deploy)');
  lines.push('Capture from a live SharePoint Safety page via:');
  lines.push('```js');
  lines.push('copy(JSON.stringify(window.__hbIntel_safetyRuntimeBindingProof, null, 2));');
  lines.push('```');
  lines.push(`- Captured: \`${r.hostedPageProof.captured ?? 'null'}\``);
  lines.push(`- hostSource: \`${r.hostedPageProof.hostSource ?? 'null'}\``);
  lines.push(`- webPartIdMatchesManifest: \`${r.hostedPageProof.webPartIdMatchesManifest ?? 'null'}\``);
  lines.push(`- canInitializeCommands: \`${r.hostedPageProof.canInitializeCommands ?? 'null'}\``);
  lines.push(`- blockingReasons: \`${r.hostedPageProof.blockingReasons ?? 'null'}\``);
  lines.push(`- expectedPackageVersionMatchesDeployed: \`${r.hostedPageProof.expectedPackageVersionMatchesDeployed ?? 'null'}\``);
  lines.push(`- Operator note: \`${r.hostedPageProof.operatorNote ?? 'null'}\``);
  lines.push('');
  lines.push('## Failures');
  if (r.failures.length === 0) {
    lines.push('_(none)_');
  } else {
    for (const f of r.failures) {
      lines.push(`- **${f.check}**: ${f.detail}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(
    '> Hosted SharePoint runtime closure is **not** complete until the live `window.__hbIntel_safetyRuntimeBindingProof` capture matches every required field documented in `docs/how-to/safety-spfx-package-verification.md`. This report covers package-verification tooling only.',
  );
  return lines.join('\n') + '\n';
}

// Type-shape helper for renderMarkdown's argument inference.
function asReport<T>(x: T): T {
  return x;
}

main();
