/**
 * Packaging, deployment smoke, and test-data management suite —
 * Phase-14 testing Prompt-05.
 *
 * Validates package build artifacts, manifest inclusion, shell-entry
 * shim parity, stale-artifact detection, and named refactored surface
 * registration without requiring a live SharePoint tenant.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SuiteModule, RunContext, StepResult } from '../shared/types.js';
import { recordResult, assertTruthy } from '../shared/assertions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');

export const smokeSuite: SuiteModule = {
  name: 'smoke',
  async run(ctx: RunContext): Promise<StepResult[]> {
    validateBuildArtifacts(ctx);
    validateManifestInclusion(ctx);
    validateShellEntryParity(ctx);
    validateStaleArtifacts(ctx);
    validateRefactoredSurfaces(ctx);
    return ctx.results;
  },
};

// ---------------------------------------------------------------------------
// 1. Build artifact existence
// ---------------------------------------------------------------------------

function validateBuildArtifacts(ctx: RunContext): void {
  const distDir = join(REPO_ROOT, 'apps/hb-webparts/dist');
  const jsFile = join(distDir, 'hb-webparts-app.js');
  const cssFile = join(distDir, 'spfx-hb-webparts.css');

  assertTruthy(ctx, 'smoke.build.distDir', 'dist/ directory exists', existsSync(distDir));
  assertTruthy(ctx, 'smoke.build.jsBundle', 'hb-webparts-app.js exists', existsSync(jsFile));
  assertTruthy(ctx, 'smoke.build.cssBundle', 'spfx-hb-webparts.css exists', existsSync(cssFile));

  if (existsSync(jsFile)) {
    const stats = statSync(jsFile);
    const sizeKB = Math.round(stats.size / 1024);
    assertTruthy(ctx, 'smoke.build.jsSize', `JS bundle ${sizeKB} KB > 100 KB`, sizeKB > 100);
    recordResult(ctx, { step: 'smoke.build.jsSize.detail', status: 'pass', detail: `${sizeKB} KB` });
  }

  if (existsSync(cssFile)) {
    const stats = statSync(cssFile);
    const sizeKB = Math.round(stats.size / 1024);
    assertTruthy(ctx, 'smoke.build.cssSize', `CSS bundle ${sizeKB} KB > 10 KB`, sizeKB > 10);
  }

  // package-solution.json
  const pkgSolPath = join(REPO_ROOT, 'apps/hb-webparts/config/package-solution.json');
  assertTruthy(ctx, 'smoke.build.packageSolution', 'package-solution.json exists', existsSync(pkgSolPath));
  if (existsSync(pkgSolPath)) {
    const pkgSol = JSON.parse(readFileSync(pkgSolPath, 'utf8')) as { solution?: { version?: string } };
    recordResult(ctx, { step: 'smoke.build.solutionVersion', status: 'pass', detail: `version=${pkgSol.solution?.version}` });
  }
}

// ---------------------------------------------------------------------------
// 2. Manifest inclusion — every source manifest must be registered
// ---------------------------------------------------------------------------

// Phase-23 retired the legacy merged People & Culture seam
// (27ac10f4-4054-4dd2-bd53-3b4ef4379ab4). It is no longer packaged
// into hb-webparts.sppkg and no longer present in the shell
// componentIds — consumers use the split surfaces below. Phase-27
// Prompt-09 removed the stale expectation from this registry so the
// smoke check reflects repo truth.
const EXPECTED_SURFACE_GUIDS: Record<string, string> = {
  'HB Kudos':                 'f14e59a3-4d6b-43b2-952e-ba02dea11dad',
  'HB Kudos Companion':       'a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97',
  'People Culture Public':    'e39d9662-34c4-43e6-9425-5770f62da626',
  'People Culture Companion': '7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e',
};

function validateManifestInclusion(ctx: RunContext): void {
  const shellPkgPath = join(REPO_ROOT, 'tools/spfx-shell/config/package-solution.json');
  if (!existsSync(shellPkgPath)) {
    recordResult(ctx, { step: 'smoke.manifest.shellConfig', status: 'fail', detail: 'tools/spfx-shell/config/package-solution.json missing' });
    return;
  }

  const shellPkg = JSON.parse(readFileSync(shellPkgPath, 'utf8')) as {
    solution?: { features?: Array<{ componentIds?: string[] }> };
  };
  const componentIds = new Set(shellPkg.solution?.features?.[0]?.componentIds ?? []);

  for (const [label, guid] of Object.entries(EXPECTED_SURFACE_GUIDS)) {
    assertTruthy(ctx, `smoke.manifest.registered.${label}`, `${guid} in componentIds`, componentIds.has(guid));
  }

  recordResult(ctx, { step: 'smoke.manifest.totalRegistered', status: 'pass', detail: `${componentIds.size} componentIds registered` });
}

// ---------------------------------------------------------------------------
// 3. Shell-entry shim parity
// ---------------------------------------------------------------------------

function validateShellEntryParity(ctx: RunContext): void {
  const assetsDir = join(REPO_ROOT, 'tools/spfx-shell/release/assets');
  if (!existsSync(assetsDir)) {
    recordResult(ctx, { step: 'smoke.shims.assetsDir', status: 'fail', detail: 'release/assets/ missing' });
    return;
  }

  const shellFiles = readdirSync(assetsDir).filter((f) => f.startsWith('shell-entry-'));
  recordResult(ctx, { step: 'smoke.shims.count', status: 'pass', detail: `${shellFiles.length} shell-entry shims` });

  // Each shell-entry filename embeds the componentId GUID
  for (const [label, guid] of Object.entries(EXPECTED_SURFACE_GUIDS)) {
    const hasShim = shellFiles.some((f) => f.includes(guid));
    assertTruthy(ctx, `smoke.shims.has.${label}`, `shell-entry for ${guid}`, hasShim);
  }

  // Manifests directory
  const manifestsDir = join(REPO_ROOT, 'tools/spfx-shell/release/manifests');
  if (existsSync(manifestsDir)) {
    const manifestFiles = readdirSync(manifestsDir).filter((f) => f.endsWith('.manifest.json'));
    recordResult(ctx, { step: 'smoke.shims.manifestCount', status: 'pass', detail: `${manifestFiles.length} release manifests` });
    for (const [label, guid] of Object.entries(EXPECTED_SURFACE_GUIDS)) {
      assertTruthy(ctx, `smoke.shims.manifest.${label}`, `${guid}.manifest.json`, manifestFiles.some((f) => f.startsWith(guid)));
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Stale-artifact detection
// ---------------------------------------------------------------------------

function validateStaleArtifacts(ctx: RunContext): void {
  const distJs = join(REPO_ROOT, 'apps/hb-webparts/dist/hb-webparts-app.js');
  const assetsDir = join(REPO_ROOT, 'tools/spfx-shell/release/assets');

  if (!existsSync(distJs) || !existsSync(assetsDir)) {
    recordResult(ctx, { step: 'smoke.stale.skip', status: 'warn', detail: 'dist/ or release/assets/ missing; skipping freshness check' });
    return;
  }

  const distMtime = statSync(distJs).mtimeMs;
  const shellFiles = readdirSync(assetsDir)
    .filter((f) => f.startsWith('hb-webparts-app-'))
    .map((f) => ({ name: f, mtime: statSync(join(assetsDir, f)).mtimeMs }));

  if (shellFiles.length === 0) {
    recordResult(ctx, { step: 'smoke.stale.noShellBundle', status: 'warn', detail: 'No hb-webparts-app-*.js in release/assets/' });
    return;
  }

  const newest = shellFiles.reduce((a, b) => (a.mtime > b.mtime ? a : b));
  const delta = Math.abs(distMtime - newest.mtime);
  const deltaMinutes = Math.round(delta / 60_000);

  // If the delta is more than 60 minutes, the release asset may be stale
  if (deltaMinutes > 60) {
    recordResult(ctx, { step: 'smoke.stale.freshness', status: 'warn', detail: `dist/ and release/ differ by ${deltaMinutes} min — consider rebuilding` });
  } else {
    recordResult(ctx, { step: 'smoke.stale.freshness', status: 'pass', detail: `dist/ and release/ differ by ${deltaMinutes} min` });
  }
}

// ---------------------------------------------------------------------------
// 5. Named refactored surfaces — source manifest existence
// ---------------------------------------------------------------------------

function validateRefactoredSurfaces(ctx: RunContext): void {
  // Phase-23 retired the merged PeopleCultureWebPart source (the
  // folder was removed). Phase-27 Prompt-09 dropped the stale
  // expectation so this check stops asserting a path that cannot
  // exist.
  const surfaces: Array<{ label: string; manifestPath: string }> = [
    { label: 'HbKudos', manifestPath: 'apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json' },
    { label: 'HbKudosCompanion', manifestPath: 'apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json' },
    { label: 'PeopleCulturePublic', manifestPath: 'apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicWebPart.manifest.json' },
    { label: 'PeopleCultureCompanion', manifestPath: 'apps/hb-webparts/src/webparts/peopleCultureCompanion/PeopleCultureCompanionWebPart.manifest.json' },
  ];

  for (const s of surfaces) {
    const fullPath = join(REPO_ROOT, s.manifestPath);
    const exists = existsSync(fullPath);
    assertTruthy(ctx, `smoke.surface.manifest.${s.label}`, `${s.manifestPath} exists`, exists);
    if (exists) {
      const manifest = JSON.parse(readFileSync(fullPath, 'utf8')) as { id?: string; version?: string };
      recordResult(ctx, { step: `smoke.surface.version.${s.label}`, status: 'pass', detail: `id=${manifest.id} version=${manifest.version}` });
    }
  }

  // Runtime entry files
  const runtimes: Array<{ label: string; path: string }> = [
    { label: 'HbKudos.tsx', path: 'apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx' },
    { label: 'HbKudosCompanion.tsx', path: 'apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx' },
    { label: 'PeopleCulturePublic.tsx', path: 'apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx' },
    { label: 'PeopleCultureCompanion.tsx', path: 'apps/hb-webparts/src/webparts/peopleCultureCompanion/PeopleCultureCompanion.tsx' },
  ];

  for (const r of runtimes) {
    assertTruthy(ctx, `smoke.surface.runtime.${r.label}`, `${r.path} exists`, existsSync(join(REPO_ROOT, r.path)));
  }
}
