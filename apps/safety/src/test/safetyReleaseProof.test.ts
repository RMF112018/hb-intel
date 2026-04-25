import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { hostedSafetyGuidOverlayFingerprint } from '../runtime/hostedSafetyGuidBinding.js';

const appDir = resolve(__dirname, '../..');

describe('print-release-proof.mjs', () => {
  it('emits a proof JSON with governance-required fields', () => {
    const stdout = execFileSync(
      process.execPath,
      [resolve(appDir, 'scripts/print-release-proof.mjs')],
      { encoding: 'utf-8' },
    );
    const proof = JSON.parse(stdout) as {
      manifest: { id: string; version: string };
      packageSolution: { id: string | null; name: string | null; version: string };
      runtimeBinding: {
        acceptedBackendOrigin: string;
        expectedApiAudience: string;
        hostedGuidOverlayFingerprint: string;
      };
      generatedAt: string;
      buildSha: string;
    };

    // Manifest and package-solution versions must be equal.
    expect(proof.manifest.version).toBe(proof.packageSolution.version);

    // Manifest id is a UUID.
    expect(proof.manifest.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    // Governed runtime binding fields must be populated.
    expect(proof.runtimeBinding.acceptedBackendOrigin).toMatch(/^https?:\/\//);
    expect(proof.runtimeBinding.expectedApiAudience).toMatch(/^api:\/\//);
    expect(proof.runtimeBinding.hostedGuidOverlayFingerprint).toMatch(
      /^fnv1a32:[0-9a-f]{8}$/,
    );
    // Cross-source identity: the script's regex-extracted overlay + replay
    // of FNV-1a 32 must equal the runtime's source-of-truth computation.
    // Seals the script-vs-runtime drift seam.
    expect(proof.runtimeBinding.hostedGuidOverlayFingerprint).toBe(
      hostedSafetyGuidOverlayFingerprint(),
    );

    // Generated timestamp is ISO-8601.
    expect(proof.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

});
