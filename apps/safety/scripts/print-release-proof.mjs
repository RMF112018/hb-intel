#!/usr/bin/env node
/**
 * Safety release-proof generator.
 *
 * Reads the governed sources in-repo and emits a single JSON document
 * asserting:
 *   - SPFx manifest id + version
 *   - package-solution version (must match manifest version)
 *   - accepted backend origin (governed)
 *   - expected API audience (governed)
 *   - hosted GUID overlay fingerprint (computed from the overlay source)
 *   - build sha + build timestamp (from env, optional)
 *
 * Writes to `apps/safety/dist/safety-release-proof.json` and prints to
 * stdout. Non-zero exit if any required governance field is missing or
 * inconsistent.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(thisDir, '..');

function readJson(rel) {
  return JSON.parse(readFileSync(path.resolve(appDir, rel), 'utf-8'));
}

function readText(rel) {
  return readFileSync(path.resolve(appDir, rel), 'utf-8');
}

/**
 * Extract the HBCENTRAL hosted overlay from hostedSafetyGuidBinding.ts
 * source and compute the same FNV-1a 32 fingerprint the runtime uses.
 * Pinning to source-extraction avoids drift between script and runtime.
 */
function computeHostedOverlayFingerprint() {
  const source = readText('src/runtime/hostedSafetyGuidBinding.ts');
  const requiredKeysMatch = source.match(
    /const REQUIRED_HOSTED_KEYS = \[([\s\S]*?)\] as const;/,
  );
  const overlayMatch = source.match(
    /HBCENTRAL_HOSTED_GUID_OVERLAY[^=]*=\s*{([\s\S]*?)};/,
  );
  if (!requiredKeysMatch || !overlayMatch) {
    throw new Error(
      'Unable to parse HBCENTRAL_HOSTED_GUID_OVERLAY from hostedSafetyGuidBinding.ts',
    );
  }
  const requiredKeys = [...requiredKeysMatch[1].matchAll(/'([^']+)'/g)].map(
    (m) => m[1],
  );
  const pairs = new Map(
    [...overlayMatch[1].matchAll(/(\w+):\s*'([^']+)'/g)].map((m) => [m[1], m[2]]),
  );
  const canonical = requiredKeys.map((k) => `${k}:${pairs.get(k)}`).join('|');
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function main() {
  const errors = [];
  const packageSolution = readJson('config/package-solution.json');
  const manifest = readJson('src/webparts/safety/SafetyWebPart.manifest.json');
  const runtimeBinding = readJson('config/runtime-binding.json');

  const manifestId = manifest.id;
  const manifestVersion = manifest.version;
  const packageVersion = packageSolution.solution?.version;
  const acceptedBackendOrigin = (
    process.env.HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN ??
    runtimeBinding.acceptedBackendOrigin ??
    ''
  ).trim();
  const expectedApiAudience = (
    process.env.HBC_SAFETY_EXPECTED_API_AUDIENCE ??
    runtimeBinding.expectedApiAudience ??
    ''
  ).trim();
  const hostedGuidOverlayFingerprint = computeHostedOverlayFingerprint();
  const buildSha = (process.env.HBC_SAFETY_BUILD_SHA ?? '').trim();
  const buildTimestamp = (
    process.env.HBC_SAFETY_BUILD_TIMESTAMP ?? new Date().toISOString()
  ).trim();

  if (!manifestId) errors.push('manifest id missing');
  if (!manifestVersion) errors.push('manifest version missing');
  if (!packageVersion) errors.push('package-solution version missing');
  if (manifestVersion !== packageVersion) {
    errors.push(
      `manifest version (${manifestVersion}) must equal package-solution version (${packageVersion})`,
    );
  }
  if (!acceptedBackendOrigin) errors.push('acceptedBackendOrigin missing');
  if (!expectedApiAudience) errors.push('expectedApiAudience missing');

  const proof = {
    generatedAt: buildTimestamp,
    buildSha,
    manifest: {
      id: manifestId,
      version: manifestVersion,
    },
    packageSolution: {
      id: packageSolution.solution?.id ?? null,
      name: packageSolution.solution?.name ?? null,
      version: packageVersion,
    },
    runtimeBinding: {
      acceptedBackendOrigin,
      expectedApiAudience,
      hostedGuidOverlayFingerprint,
    },
  };

  const distDir = path.resolve(appDir, 'dist');
  mkdirSync(distDir, { recursive: true });
  writeFileSync(
    path.resolve(distDir, 'safety-release-proof.json'),
    JSON.stringify(proof, null, 2) + '\n',
    'utf-8',
  );

  process.stdout.write(JSON.stringify(proof, null, 2) + '\n');

  if (errors.length > 0) {
    process.stderr.write(
      `\nRelease proof incomplete:\n  - ${errors.join('\n  - ')}\n`,
    );
    process.exit(1);
  }
}

main();
