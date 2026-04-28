import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createProvisioningManifest,
  loadTemplateArtifactsFromPackage,
  runNoProcoreMirrorScan,
  runNoSecretScan,
  runNoTenantMutationScan,
  validateProvisioningManifest,
} from '../src/index.js';
import invalidSecret from './fixtures/invalid-secret-bearing-manifest.fixture.json' with { type: 'json' };
import invalidProcoreMirror from './fixtures/invalid-procore-mirror-manifest.fixture.json' with { type: 'json' };
import invalidTenantMutation from './fixtures/invalid-tenant-mutation-manifest.fixture.json' with { type: 'json' };

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PKG_ROOT = join(HERE, '..', '..', 'project-site-template');
const FROZEN_NOW = () => new Date('2026-04-28T00:00:00.000Z');
const PROJECT_INPUTS = { projectNumber: '26-000-00', projectName: 'Test Project' };

describe('runNoSecretScan', () => {
  it('passes for a clean object graph', () => {
    const result = runNoSecretScan({ a: 1, b: { c: 'ok' } });
    expect(result.ok).toBe(true);
    expect(result.hits).toEqual([]);
  });

  it('fails on client_secret keys', () => {
    const result = runNoSecretScan(invalidSecret);
    expect(result.ok).toBe(false);
    expect(result.hits.some((h) => h.toLowerCase().includes('client_secret'))).toBe(true);
    expect(result.hits.some((h) => h.toLowerCase().includes('api_key'))).toBe(true);
  });

  it('fails on bearer_token, dmsa_credential, refresh_token at any depth', () => {
    const samples = [
      { deeply: { nested: { bearer_token: 'x' } } },
      { dmsa_credential: 'x' },
      { refresh_token: 'x' },
    ];
    for (const sample of samples) {
      const result = runNoSecretScan(sample);
      expect(result.ok).toBe(false);
    }
  });

  it('passes on a real generated manifest', () => {
    const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const result = runNoSecretScan(manifest);
    expect(result.ok, `hits: ${result.hits.join(', ')}`).toBe(true);
  });
});

describe('runNoProcoreMirrorScan', () => {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);

  it('passes when OC-17 / OC-18 stay placeholder-only / Deferred', () => {
    const result = runNoProcoreMirrorScan({}, artifacts);
    expect(result.ok, `hits: ${result.hits.join(', ')}`).toBe(true);
  });

  it('fails when a manifest declares procoreMirror keys', () => {
    const result = runNoProcoreMirrorScan(invalidProcoreMirror, artifacts);
    expect(result.ok).toBe(false);
    expect(result.hits.some((h) => h.toLowerCase().includes('procoremirror'))).toBe(true);
  });

  it('fails when integrations fixture flips noFullProcoreMirror to false', () => {
    const tampered = {
      ...artifacts,
      familyFixtures: {
        ...artifacts.familyFixtures,
        integrations: {
          ...(artifacts.familyFixtures.integrations as Record<string, unknown>),
          noFullProcoreMirror: false,
        },
      },
    } as unknown as typeof artifacts;
    const result = runNoProcoreMirrorScan({}, tampered);
    expect(result.ok).toBe(false);
    expect(result.hits.some((h) => h.includes('noFullProcoreMirror'))).toBe(true);
  });

  it('fails when OC-17 disposition is no longer placeholder-only', () => {
    const tampered = {
      ...artifacts,
      objectCatalog: {
        ...artifacts.objectCatalog,
        rows: artifacts.objectCatalog.rows.map((r) =>
          r.catalogId === 'OC-17' ? { ...r, extractionTreatment: 'consolidated-for-step-4' } : r,
        ),
      },
    } as unknown as typeof artifacts;
    const result = runNoProcoreMirrorScan({}, tampered);
    expect(result.ok).toBe(false);
    expect(result.hits.some((h) => h.includes('OC-17'))).toBe(true);
  });

  it('passes on a real generated manifest', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const result = runNoProcoreMirrorScan(manifest, artifacts);
    expect(result.ok, `hits: ${result.hits.join(', ')}`).toBe(true);
  });
});

describe('runNoTenantMutationScan', () => {
  it('passes for a planned-only manifest', () => {
    const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const result = runNoTenantMutationScan(manifest);
    expect(result.ok, `hits: ${result.hits.join(', ')}`).toBe(true);
  });

  it('fails when a manifest contains a prohibited mutation key', () => {
    const result = runNoTenantMutationScan(invalidTenantMutation);
    expect(result.ok).toBe(false);
    expect(result.hits.some((h) => h.toLowerCase().includes('createsite'))).toBe(true);
  });

  it('fails when string values match live-operation verb phrases', () => {
    const result = runNoTenantMutationScan({
      sitePlan: {
        operations: 'create site for tenant immediately',
      },
    });
    expect(result.ok).toBe(false);
  });

  it('fails on graph write / pnp write phrases', () => {
    const a = runNoTenantMutationScan({ note: 'we will graph write later' });
    const b = runNoTenantMutationScan({ note: 'pnp write step is queued' });
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
  });

  it('does not false-positive on planned/plannedOnly literals', () => {
    const result = runNoTenantMutationScan({
      status: 'planned',
      plannedOnly: true,
      tag: 'noTenantMutationScan',
    });
    expect(result.ok, `hits: ${result.hits.join(', ')}`).toBe(true);
  });
});

describe('validateProvisioningManifest with scan results', () => {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
  const baseManifest = createProvisioningManifest({
    templateArtifacts: artifacts,
    projectInputs: PROJECT_INPUTS,
    context: { now: FROZEN_NOW },
  });

  it('rejects a manifest where proof.noSecretScan.ok is false', () => {
    const tampered = {
      ...baseManifest,
      proof: {
        ...baseManifest.proof,
        noSecretScan: { ok: false, hits: ['$.test'] },
      },
    };
    const result = validateProvisioningManifest(tampered);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('noSecretScan failed'))).toBe(true);
  });

  it('rejects a manifest where proof.noTenantMutationScan.ok is false', () => {
    const tampered = {
      ...baseManifest,
      proof: {
        ...baseManifest.proof,
        noTenantMutationScan: { ok: false, hits: ['$.x'] },
      },
    };
    const result = validateProvisioningManifest(tampered);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('noTenantMutationScan failed'))).toBe(true);
  });

  it('rejects a manifest where proof.plannedHash is not 64-char hex', () => {
    const tampered = {
      ...baseManifest,
      proof: { ...baseManifest.proof, plannedHash: 'not-a-hash' },
    };
    const result = validateProvisioningManifest(tampered);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('plannedHash'))).toBe(true);
  });

  it('rejects a manifest where manifestVersion is wrong', () => {
    const tampered = { ...baseManifest, manifestVersion: '0.1.0-scaffold' };
    const result = validateProvisioningManifest(tampered);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('manifestVersion'))).toBe(true);
  });
});
