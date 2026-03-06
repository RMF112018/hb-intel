import { describe, expect, it } from 'vitest';
import {
  assertProtectedFeatureRegistered,
  createProtectedFeatureRegistry,
  defineProtectedFeatureRegistration,
  toFeaturePermissionRegistration,
  validateProtectedFeatureRegistration,
} from './featureRegistration.js';

const baseContract = {
  featureId: 'project-hub',
  route: {
    primaryPath: '/project-hub',
  },
  navigation: {
    workspaceId: 'project-hub' as const,
    showInNavigation: true,
  },
  permissions: {
    requiredFeaturePermissions: ['project-hub:access'],
    requiredActionPermissions: {
      view: ['project-hub:view'],
    },
  },
  visibility: 'discoverable-locked' as const,
  compatibleShellModes: 'all' as const,
  compatibleRuntimeModes: 'all' as const,
};

describe('feature registration contract', () => {
  it('validates required contract fields', () => {
    const result = validateProtectedFeatureRegistration(baseContract);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid route metadata', () => {
    const result = validateProtectedFeatureRegistration({
      ...baseContract,
      route: {
        primaryPath: 'project-hub',
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('route.primaryPath');
  });

  it('enforces duplicate-protection in registry creation', () => {
    expect(() =>
      createProtectedFeatureRegistry([baseContract, { ...baseContract }]),
    ).toThrow('Duplicate protected feature registration');
  });

  it('asserts registration presence for protected feature wiring', () => {
    const registry = createProtectedFeatureRegistry([baseContract]);
    const contract = assertProtectedFeatureRegistered(registry, 'project-hub');
    expect(contract.featureId).toBe('project-hub');
    expect(() => assertProtectedFeatureRegistered(registry, 'unknown-feature')).toThrow(
      'not registered',
    );
  });

  it('maps shell contract to auth permission registration shape', () => {
    const registration = toFeaturePermissionRegistration(
      defineProtectedFeatureRegistration({
        ...baseContract,
        extensionPath: {
          extensionKey: 'future.custom-approval-flow',
          metadata: { ticket: 'PH5B-001' },
        },
      }),
    );

    expect(registration.featureId).toBe('project-hub');
    expect(registration.requiredFeatureGrants).toEqual(['project-hub:access']);
    expect(registration.actionGrants.view).toEqual(['project-hub:view']);
    expect(registration.visibility).toBe('discoverable-locked');
    expect(registration.futureGrammarKey).toBe('future.custom-approval-flow');
  });
});
