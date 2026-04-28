import { describe, expect, it } from 'vitest';
import {
  MANIFEST_SCAFFOLD_VERSION,
  OBJECT_PLAN_KEYS,
  createProvisioningManifest,
  validateProvisioningManifest,
} from '../src/index.js';
import minimalContract from './fixtures/minimal-template-contract.fixture.json' with { type: 'json' };

const FROZEN_NOW = () => new Date('2026-04-28T00:00:00.000Z');

describe('createProvisioningManifest (scaffold)', () => {
  it('produces a manifest with the locked mutation gate by default', () => {
    const manifest = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });

    expect(manifest.manifestVersion).toBe(MANIFEST_SCAFFOLD_VERSION);
    expect(manifest.mutationGate.mutationLocked).toBe(true);
    expect(manifest.mutationGate.liveMutationAllowed).toBe(false);
    expect(manifest.mutationGate.requiresHumanApproval).toBe(true);
    expect(manifest.mutationGate.approvedBy).toBeUndefined();
    expect(manifest.mutationGate.approvedAt).toBeUndefined();
    expect(manifest.mutationGate.approvalRef).toBeUndefined();
  });

  it('populates generatedFrom from the input template contract', () => {
    const manifest = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW, sourceCommit: 'deadbeef' },
    });

    expect(manifest.generatedFrom.packageName).toBe('@hbc/project-site-template');
    expect(manifest.generatedFrom.templateName).toBe(minimalContract.templateName);
    expect(manifest.generatedFrom.templateVersion).toBe(minimalContract.templateVersion);
    expect(manifest.generatedFrom.contractRef).toBe('template-contract.json');
    expect(manifest.generatedFrom.sourceCommit).toBe('deadbeef');
  });

  it('exposes all ten object plan slots with empty planned entries', () => {
    const manifest = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });

    for (const key of OBJECT_PLAN_KEYS) {
      const slot = manifest.objectPlans[key];
      expect(slot.status).toBe('planned');
      expect(Array.isArray(slot.entries)).toBe(true);
      expect(slot.entries.length).toBe(0);
    }
  });

  it('returns scaffold-only proof placeholders', () => {
    const manifest = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });

    expect(manifest.proof.plannedHash).toBeNull();
    expect(manifest.proof.validationStatus).toBe('planned');
    expect(manifest.proof.noSecretScan).toBe('planned');
    expect(manifest.proof.noProcoreMirrorScan).toBe('planned');
  });

  it('produces deterministic JSON output for identical inputs', () => {
    const a = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });
    const b = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });

    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('passes runtime validation', () => {
    const manifest = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });

    const result = validateProvisioningManifest(manifest);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns a frozen manifest object graph', () => {
    const manifest = createProvisioningManifest({
      templateContract: minimalContract,
      context: { now: FROZEN_NOW },
    });

    expect(Object.isFrozen(manifest)).toBe(true);
    expect(Object.isFrozen(manifest.mutationGate)).toBe(true);
    expect(Object.isFrozen(manifest.objectPlans)).toBe(true);
  });
});
