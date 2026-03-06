import { describe, expect, it } from 'vitest';
import type {
  EffectivePermissionSet,
  FeaturePermissionRegistration,
} from '../types.js';
import {
  evaluateFeatureAccess,
  isProtectedFeatureRegistered,
  isActionAllowed,
  isFeatureVisible,
  toEffectivePermissionSet,
} from './permissionResolution.js';

function createRegistration(
  overrides?: Partial<FeaturePermissionRegistration>,
): FeaturePermissionRegistration {
  return {
    featureId: 'project-hub',
    requiredFeatureGrants: ['project-hub:access'],
    actionGrants: {
      view: ['project-hub:view'],
      edit: ['project-hub:edit'],
    },
    visibility: 'hidden',
    compatibleModes: 'all',
    ...overrides,
  };
}

function createEffective(grants: string[]): EffectivePermissionSet {
  return toEffectivePermissionSet(grants);
}

describe('permissionResolution phase 5.4 evaluators', () => {
  it('reports registration presence through centralized enforcement helper', () => {
    const registration = createRegistration();
    expect(isProtectedFeatureRegistered(registration)).toBe(true);
    expect(isProtectedFeatureRegistered(null)).toBe(false);
  });

  it('applies default-deny to unregistered features', () => {
    const allowed = isActionAllowed({
      effective: createEffective(['project-hub:view']),
      registration: null,
      action: 'view',
    });

    expect(allowed).toBe(false);
  });

  it('allows feature access only when both feature and action grants are present', () => {
    const registration = createRegistration();
    const allowed = isActionAllowed({
      effective: createEffective(['project-hub:access', 'project-hub:view']),
      registration,
      action: 'view',
    });
    const denied = isActionAllowed({
      effective: createEffective(['project-hub:view']),
      registration,
      action: 'view',
    });

    expect(allowed).toBe(true);
    expect(denied).toBe(false);
  });

  it('keeps discoverable-locked features visible while unauthorized', () => {
    const registration = createRegistration({
      visibility: 'discoverable-locked',
    });
    const access = evaluateFeatureAccess({
      effective: createEffective(['project-hub:access']),
      registration,
      action: 'view',
    });

    expect(access.visible).toBe(true);
    expect(access.allowed).toBe(false);
    expect(access.locked).toBe(true);
    expect(isFeatureVisible({ effective: createEffective(['project-hub:access']), registration })).toBe(
      true,
    );
  });
});
