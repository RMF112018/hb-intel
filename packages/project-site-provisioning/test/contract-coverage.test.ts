import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTRACT_FAMILY_NAMES,
  OBJECT_PLAN_KEYS,
  computePlannedHash,
  createProvisioningManifest,
  loadTemplateArtifactsFromPackage,
  validateProvisioningManifest,
} from '../src/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PKG_ROOT = join(HERE, '..', '..', 'project-site-template');

const FROZEN_NOW = () => new Date('2026-04-28T00:00:00.000Z');
const PROJECT_INPUTS = { projectNumber: '26-000-00', projectName: 'Test Project' };

describe('contract coverage end-to-end', () => {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);

  it('loads all 14 family fixtures from @hbc/project-site-template', () => {
    for (const family of CONTRACT_FAMILY_NAMES) {
      expect(artifacts.familyFixtures[family], `missing fixture: ${family}`).toBeDefined();
    }
  });

  it('loads 12 family field maps (enums and validation-rules excluded by Phase 1 design)', () => {
    const fieldMapCount = Object.values(artifacts.familyFieldMaps).filter(Boolean).length;
    expect(fieldMapCount).toBe(12);
  });

  it('produces one planned entry per contract family with required metadata', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });

    for (const key of OBJECT_PLAN_KEYS) {
      const slot = manifest.objectPlans[key];
      expect(slot.entries.length, `expected one entry under ${key}`).toBe(1);

      const entry = slot.entries[0];
      expect(entry.family).toBe(key);
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.kind).toBe('string');
      expect(entry.plannedOnly).toBe(true);
      expect(entry.mutationAllowed).toBe(false);
      expect(typeof entry.mvpStatus).toBe('string');
      expect(Array.isArray(entry.validationRuleRefs)).toBe(true);
      expect(typeof entry.blocksGenerationIfMissing).toBe('boolean');
    }
  });

  it('emits a 64-char lowercase hex plannedHash', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    expect(manifest.proof.plannedHash).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.proof.hashAlgorithm).toBe('sha256');
  });

  it('produces deterministic plannedHash across runs with identical inputs', () => {
    const a = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW, sourceCommit: 'abc1234' },
    });
    const b = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW, sourceCommit: 'abc1234' },
    });
    expect(a.proof.plannedHash).toBe(b.proof.plannedHash);
  });

  it('changes plannedHash when meaningful planned content changes', () => {
    const a = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });

    // Recompute hash from a modified hashable subset (different project number).
    const modifiedSubset = {
      manifestVersion: a.manifestVersion,
      generatedFrom: a.generatedFrom,
      mutationGate: {
        mutationLocked: a.mutationGate.mutationLocked,
        liveMutationAllowed: a.mutationGate.liveMutationAllowed,
        requiresHumanApproval: a.mutationGate.requiresHumanApproval,
      },
      sitePlan: {
        ...a.sitePlan,
        urlDerivation: { ...a.sitePlan.urlDerivation, resolved: '/sites/00000' },
      },
      objectPlans: a.objectPlans,
    };
    const modifiedHash = computePlannedHash(modifiedSubset);
    expect(modifiedHash).not.toBe(a.proof.plannedHash);
  });

  it('does NOT change plannedHash when only excluded sections change', () => {
    const a = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: () => new Date('2026-04-28T00:00:00.000Z') },
    });
    const b = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: () => new Date('2030-01-01T12:00:00.000Z') },
    });
    expect(a.proof.plannedHash).toBe(b.proof.plannedHash);
    expect(a.generatedAt).not.toBe(b.generatedAt);
  });

  it('records source coverage counters from the loaded artifacts', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const sc = manifest.proof.sourceCoverage;
    expect(sc.contractFamiliesDeclared).toBe(14);
    expect(sc.fixturesProcessed).toBe(14);
    expect(sc.fieldMapsProcessed).toBe(12);
    expect(sc.objectCatalogRowsProcessed).toBe(18);
  });

  it('passes runtime validation', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const result = validateProvisioningManifest(manifest);
    expect(result.ok, `validator errors:\n - ${result.errors.join('\n - ')}`).toBe(true);
  });

  it('reports placeholder site URL and warnings when project inputs are missing', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      context: { now: FROZEN_NOW },
    });
    expect(manifest.sitePlan.urlDerivation.status).toBe('placeholder');
    expect(manifest.sitePlan.urlDerivation.resolved).toBeNull();
    expect(manifest.warnings.length).toBeGreaterThan(0);
  });
});
