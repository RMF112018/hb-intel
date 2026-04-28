import { describe, expect, it } from 'vitest';
import {
  MANIFEST_VERSION,
  OBJECT_PLAN_KEYS,
  createProvisioningManifest,
  loadTemplateArtifactsFromPackage,
  validateProvisioningManifest,
} from '../src/index.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PKG_ROOT = join(HERE, '..', '..', 'project-site-template');

const FROZEN_NOW = () => new Date('2026-04-28T00:00:00.000Z');
const PROJECT_INPUTS = { projectNumber: '26-000-00', projectName: 'Test Project' };

describe('createProvisioningManifest (contract coverage)', () => {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);

  it('uses the Step 3 manifest version', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    expect(manifest.manifestVersion).toBe(MANIFEST_VERSION);
    expect(MANIFEST_VERSION).toBe('0.2.0-contract-coverage');
  });

  it('produces a manifest with the locked mutation gate by default', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    expect(manifest.mutationGate.mutationLocked).toBe(true);
    expect(manifest.mutationGate.liveMutationAllowed).toBe(false);
    expect(manifest.mutationGate.requiresHumanApproval).toBe(true);
  });

  it('exposes all fourteen object plan slots', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    expect(OBJECT_PLAN_KEYS.length).toBe(14);
    for (const key of OBJECT_PLAN_KEYS) {
      expect(manifest.objectPlans[key]).toBeDefined();
      expect(Array.isArray(manifest.objectPlans[key].entries)).toBe(true);
    }
  });

  it('produces deterministic output for identical inputs', () => {
    const a = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW, sourceCommit: '66a9ef1b0' },
    });
    const b = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW, sourceCommit: '66a9ef1b0' },
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.proof.plannedHash).toBe(b.proof.plannedHash);
  });

  it('passes runtime validation', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const result = validateProvisioningManifest(manifest);
    expect(result.ok, `validator errors: ${result.errors.join(' | ')}`).toBe(true);
  });

  it('returns a frozen manifest object graph', () => {
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    expect(Object.isFrozen(manifest)).toBe(true);
    expect(Object.isFrozen(manifest.mutationGate)).toBe(true);
    expect(Object.isFrozen(manifest.objectPlans)).toBe(true);
    expect(Object.isFrozen(manifest.proof)).toBe(true);
  });
});
