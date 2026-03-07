/**
 * PWA feature registry -- defines access contracts for all protected workspaces.
 * D-PH6F-3: Registered with usePermissionStore at bootstrap via main.tsx.
 */
import {
  defineProtectedFeatureRegistration,
  createProtectedFeatureRegistry,
  validateProtectedFeatureRegistration,
  type ProtectedFeatureRegistrationContract,
} from '@hbc/shell';

// --- Feature Contracts ---

const projectHub = defineProtectedFeatureRegistration({
  featureId: 'feature:project-hub',
  route: { primaryPath: '/project-hub', allowRedirectRestore: true },
  navigation: { workspaceId: 'project-hub', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:project-hub'],
    requiredActionPermissions: {},
  },
  visibility: 'discoverable-locked',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const accounting = defineProtectedFeatureRegistration({
  featureId: 'feature:accounting',
  route: { primaryPath: '/accounting', allowRedirectRestore: true },
  navigation: { workspaceId: 'accounting', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:accounting-invoice'],
    requiredActionPermissions: {},
  },
  visibility: 'discoverable-locked',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const estimating = defineProtectedFeatureRegistration({
  featureId: 'feature:estimating',
  route: { primaryPath: '/estimating', allowRedirectRestore: true },
  navigation: { workspaceId: 'estimating', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:estimating-projects'],
    requiredActionPermissions: {},
  },
  visibility: 'discoverable-locked',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const businessDevelopment = defineProtectedFeatureRegistration({
  featureId: 'feature:business-development',
  route: { primaryPath: '/bd', allowRedirectRestore: true },
  navigation: { workspaceId: 'business-development', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:project-hub'],
    requiredActionPermissions: {},
  },
  visibility: 'discoverable-locked',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const admin = defineProtectedFeatureRegistration({
  featureId: 'feature:admin',
  route: { primaryPath: '/admin', allowRedirectRestore: false },
  navigation: { workspaceId: 'admin', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:admin-panel'],
    requiredActionPermissions: {},
  },
  visibility: 'discoverable-locked',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

// --- Registry ---

const ALL_FEATURES: readonly ProtectedFeatureRegistrationContract[] = [
  projectHub,
  accounting,
  estimating,
  businessDevelopment,
  admin,
];

if (import.meta.env.DEV) {
  for (const feature of ALL_FEATURES) {
    const result = validateProtectedFeatureRegistration(feature);
    if (!result.valid) {
      throw new Error(
        `[HB Intel] Invalid feature registration for "${feature.featureId}": ${result.errors.join(', ')}`,
      );
    }
  }
}

export const FEATURE_REGISTRY = createProtectedFeatureRegistry(ALL_FEATURES);

/**
 * Flat list of all feature permission strings required by registered features.
 * Used as a cross-reference when verifying persona permission coverage.
 */
export const ALL_FEATURE_PERMISSION_KEYS = ALL_FEATURES.flatMap(
  (f) => f.permissions.requiredFeaturePermissions,
);
