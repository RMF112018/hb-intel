import type {
  CanonicalAuthMode,
  FeaturePermissionRegistration,
  FeatureVisibilityMode,
  StandardActionPermission,
} from '@hbc/auth';
import type { ShellMode, WorkspaceId } from './types.js';

/**
 * Route metadata for protected features.
 */
export interface ProtectedFeatureRouteMetadata {
  primaryPath: string;
  additionalPaths?: readonly string[];
  allowRedirectRestore?: boolean;
}

/**
 * Navigation visibility metadata for shell surfaces.
 */
export interface ProtectedFeatureNavigationMetadata {
  workspaceId: WorkspaceId;
  navItemId?: string;
  showInNavigation: boolean;
}

/**
 * Permission requirements attached to protected feature registration.
 */
export interface ProtectedFeaturePermissionMetadata {
  requiredFeaturePermissions: readonly string[];
  requiredActionPermissions: Partial<Record<StandardActionPermission, readonly string[]>>;
}

/**
 * Extension descriptor for exceptional feature integration paths.
 *
 * This is a documented seam only. Phase 5.9 does not execute extension
 * metadata behavior directly; it preserves compatibility for later phases.
 */
export interface ProtectedFeatureExtensionPath {
  extensionKey: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Shell-owned protected feature registration contract.
 *
 * Alignment notes:
 * - D-04: route metadata is explicit and centralized for shell/nav behavior.
 * - D-07: action permission mapping is deterministic and typed.
 * - D-10: feature self-wiring is blocked by requiring this shared contract.
 * - D-12: navigation visibility semantics remain shell-level and theme-agnostic.
 */
export interface ProtectedFeatureRegistrationContract {
  featureId: string;
  route: ProtectedFeatureRouteMetadata;
  navigation: ProtectedFeatureNavigationMetadata;
  permissions: ProtectedFeaturePermissionMetadata;
  visibility: FeatureVisibilityMode;
  compatibleShellModes?: readonly ShellMode[] | 'all';
  compatibleRuntimeModes?: readonly CanonicalAuthMode[] | 'all';
  lockMessage?: string;
  extensionPath?: ProtectedFeatureExtensionPath;
}

/**
 * Registry type for protected feature contracts.
 */
export type ProtectedFeatureRegistrationRegistry = Record<
  string,
  ProtectedFeatureRegistrationContract
>;

/**
 * Validation result for protected feature registration contracts.
 */
export interface ProtectedFeatureRegistrationValidationResult {
  valid: boolean;
  errors: readonly string[];
}

/**
 * Validate registration contract shape and required metadata.
 */
export function validateProtectedFeatureRegistration(
  contract: ProtectedFeatureRegistrationContract,
): ProtectedFeatureRegistrationValidationResult {
  const errors: string[] = [];

  if (!contract.featureId.trim()) {
    errors.push('featureId is required.');
  }
  if (!contract.route.primaryPath.startsWith('/')) {
    errors.push('route.primaryPath must start with "/".');
  }
  if (!contract.navigation.workspaceId) {
    errors.push('navigation.workspaceId is required.');
  }
  if (contract.permissions.requiredFeaturePermissions.length === 0) {
    errors.push('permissions.requiredFeaturePermissions must include at least one permission.');
  }
  if (contract.visibility !== 'hidden' && contract.visibility !== 'discoverable-locked') {
    errors.push('visibility must be "hidden" or "discoverable-locked".');
  }
  if (contract.extensionPath && !contract.extensionPath.extensionKey.trim()) {
    errors.push('extensionPath.extensionKey is required when extensionPath is provided.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Define and validate one protected feature registration contract.
 */
export function defineProtectedFeatureRegistration(
  contract: ProtectedFeatureRegistrationContract,
): ProtectedFeatureRegistrationContract {
  const validation = validateProtectedFeatureRegistration(contract);
  if (!validation.valid) {
    throw new Error(`Invalid protected feature registration "${contract.featureId}": ${validation.errors.join(' ')}`);
  }
  return contract;
}

/**
 * Build a registry and enforce one-time registration per feature id.
 */
export function createProtectedFeatureRegistry(
  registrations: readonly ProtectedFeatureRegistrationContract[],
): ProtectedFeatureRegistrationRegistry {
  const registry: ProtectedFeatureRegistrationRegistry = {};

  for (const registration of registrations) {
    const validated = defineProtectedFeatureRegistration(registration);
    if (registry[validated.featureId]) {
      throw new Error(`Duplicate protected feature registration detected for "${validated.featureId}".`);
    }
    registry[validated.featureId] = validated;
  }

  return registry;
}

/**
 * Enforce registration usage before protected access evaluation.
 */
export function assertProtectedFeatureRegistered(
  registry: ProtectedFeatureRegistrationRegistry,
  featureId: string,
): ProtectedFeatureRegistrationContract {
  const registration = registry[featureId];
  if (!registration) {
    throw new Error(
      `Protected feature "${featureId}" is not registered. Register via featureRegistration contract before protected access wiring.`,
    );
  }
  return registration;
}

/**
 * Bridge shell registration contracts to auth permission registration shape.
 */
export function toFeaturePermissionRegistration(
  contract: ProtectedFeatureRegistrationContract,
): FeaturePermissionRegistration {
  const compatibleModes =
    contract.compatibleRuntimeModes === 'all'
      ? 'all'
      : contract.compatibleRuntimeModes
        ? [...contract.compatibleRuntimeModes]
        : 'all';

  return {
    featureId: contract.featureId,
    requiredFeatureGrants: [...contract.permissions.requiredFeaturePermissions],
    actionGrants: Object.fromEntries(
      Object.entries(contract.permissions.requiredActionPermissions).map(([action, grants]) => [
        action,
        [...(grants ?? [])],
      ]),
    ) as FeaturePermissionRegistration['actionGrants'],
    visibility: contract.visibility,
    compatibleModes,
    lockMessage: contract.lockMessage,
    futureGrammarKey: contract.extensionPath?.extensionKey,
  };
}

/**
 * Convert a list of shell contracts to auth permission registrations.
 */
export function toFeaturePermissionRegistrations(
  contracts: readonly ProtectedFeatureRegistrationContract[],
): FeaturePermissionRegistration[] {
  return contracts.map((contract) => toFeaturePermissionRegistration(contract));
}
