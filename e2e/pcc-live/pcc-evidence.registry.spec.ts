import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  writePccEvidenceManifest,
  createPccEvidenceManifest,
  getPccEvidenceCoverage,
} from './pcc-evidence.manifest';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
import {
  PCC_EVIDENCE_DISCLAIMER,
  REQUIRED_PCC_EVIDENCE_IDS,
  type PccEvidenceRunMetadata,
} from './pcc-evidence.types';

const EV_52_THROUGH_58 = new Set(['EV-52', 'EV-53', 'EV-54', 'EV-55', 'EV-56', 'EV-57', 'EV-58']);

function metadata(outputDir: string): PccEvidenceRunMetadata {
  return {
    runId: 'prompt-02-test-run',
    generatedAtIso: '2026-05-07T00:00:00.000Z',
    repoCommit: 'abc123',
    expectedPackageVersion: '1.0.0.16',
    evidenceOutputDir: outputDir,
    generatedBy: 'pcc-live-playwright-harness',
    prompt: 'Prompt 02 — Evidence Registry and Manifest Writer',
  };
}

test('registry contains exactly 80 required EV records', () => {
  expect(PCC_EVIDENCE_REGISTRY).toHaveLength(80);
  expect(REQUIRED_PCC_EVIDENCE_IDS).toHaveLength(80);
});

test('registry contains required IDs with no duplicates or unexpected IDs', () => {
  const registryIds = PCC_EVIDENCE_REGISTRY.map((r) => r.id);
  expect(new Set(registryIds).size).toBe(registryIds.length);
  expect([...registryIds].sort()).toEqual([...REQUIRED_PCC_EVIDENCE_IDS].sort());
});

test('every record includes required metadata fields', () => {
  for (const record of PCC_EVIDENCE_REGISTRY) {
    expect(record.title.trim().length).toBeGreaterThan(0);
    expect(record.objective.trim().length).toBeGreaterThan(0);
    expect(record.pillarRefs.length).toBeGreaterThan(0);
    expect(Array.isArray(record.hardStopRefs)).toBeTruthy();
    expect(typeof record.reviewerNotes).toBe('string');
    expect(record.sourceRefs.length).toBeGreaterThan(0);
    expect(record.requiredArtifacts.length).toBeGreaterThan(0);
  }
});

test('no record defaults to captured and EV-52..EV-58 are not captured', () => {
  for (const record of PCC_EVIDENCE_REGISTRY) {
    expect(record.status).not.toBe('captured');
    if (EV_52_THROUGH_58.has(record.id)) {
      expect(record.status).not.toBe('captured');
    }
  }
});

test('coverage helper reports no missing, duplicate, or unexpected IDs for canonical registry', () => {
  const coverage = getPccEvidenceCoverage(PCC_EVIDENCE_REGISTRY);
  expect(coverage.requiredCount).toBe(80);
  expect(coverage.registryCount).toBe(80);
  expect(coverage.missingIds).toEqual([]);
  expect(coverage.duplicateIds).toEqual([]);
  expect(coverage.unexpectedIds).toEqual([]);
  expect(coverage.malformedIds).toEqual([]);
});

test('manifest creator includes all EV IDs and traceability disclaimer', () => {
  const manifest = createPccEvidenceManifest({
    metadata: metadata('docs/architecture/evidence/pcc-live/run-001'),
    registry: PCC_EVIDENCE_REGISTRY,
  });

  expect(manifest.records).toHaveLength(80);
  expect(manifest.disclaimer).toBe(PCC_EVIDENCE_DISCLAIMER);
  expect(manifest.records.map((r) => r.id).sort()).toEqual([...REQUIRED_PCC_EVIDENCE_IDS].sort());
});

test('manifest writer emits JSON/MD output and excludes sensitive key material', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-evidence-'));

  try {
    const result = await writePccEvidenceManifest({
      outputDir: tmpDir,
      metadata: {
        ...(metadata(tmpDir) as PccEvidenceRunMetadata & Record<string, string>),
        token: 'secret',
      } as PccEvidenceRunMetadata,
      registry: PCC_EVIDENCE_REGISTRY,
      artifactPaths: [
        'docs/architecture/evidence/pcc-live/run-001/pcc-evidence-manifest.json',
        'test-results/raw-output.json',
      ],
    });

    expect(fs.existsSync(result.manifestPath)).toBeTruthy();
    expect(fs.existsSync(result.summaryPath)).toBeTruthy();

    const parsed = JSON.parse(fs.readFileSync(result.manifestPath, 'utf-8')) as {
      records: unknown[];
    };
    expect(parsed.records).toHaveLength(80);

    const summary = fs.readFileSync(result.summaryPath, 'utf-8');
    expect(summary).toContain(PCC_EVIDENCE_DISCLAIMER);

    const jsonText = fs.readFileSync(result.manifestPath, 'utf-8');
    expect(jsonText).not.toContain('storageState');
    expect(jsonText).not.toContain('cookie');
    expect(jsonText).not.toContain('token');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
