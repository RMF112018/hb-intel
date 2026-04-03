/**
 * Admin Control Plane — install/bootstrap domain contracts.
 *
 * Phase 6 install-specific types that extend the generalized admin
 * control plane model. These types define the install step catalog,
 * preflight check IDs, and verification check IDs for the
 * Setup / Install lane.
 *
 * Design: these are intentionally thin — they reference the generalized
 * model types (IAdminRunEnvelope, IAdminPreflightCheck, etc.) rather
 * than duplicating them. The install domain is one consumer of the
 * generalized run model, not a parallel type system.
 *
 * @module admin-control-plane
 */

// ─── Install Step Catalog ──────────────────────────────────────────────────────

/**
 * Canonical install/bootstrap step identifiers.
 *
 * Each step maps to an adapter operation in the adapter registry.
 * Step ordering is defined by the install orchestration service,
 * not by the enum order.
 */
export enum InstallStepId {
  // Family 1: Environment Discovery
  DiscoverResourceGroup = 'discover-resource-group',
  DiscoverAppRegistrations = 'discover-app-registrations',
  DiscoverAppCatalog = 'discover-app-catalog',
  DiscoverExistingInfrastructure = 'discover-existing-infrastructure',

  // Family 3: Install Execution
  DeployResourceGroup = 'deploy-resource-group',
  DeployStorage = 'deploy-storage',
  DeployFunctionApp = 'deploy-function-app',
  ConfigureAppSettings = 'configure-app-settings',
  CreateAppRegistration = 'create-app-registration',
  GrantApiPermissions = 'grant-api-permissions',
  InstallSpfxPackage = 'install-spfx-package',
  RequestSharePointApiAccess = 'request-sharepoint-api-access',
  ConfigureHubSite = 'configure-hub-site',

  // Family 5: Post-Install Verification
  VerifyFunctionApp = 'verify-function-app',
  VerifyTableStorage = 'verify-table-storage',
  VerifyGraphApi = 'verify-graph-api',
  VerifySharePoint = 'verify-sharepoint',
  VerifySpfxPackage = 'verify-spfx-package',
  VerifyApiPermissions = 'verify-api-permissions',
}

/**
 * Install step definition with metadata for orchestration and display.
 */
export interface IInstallStepDefinition {
  /** Step identifier from the catalog */
  readonly stepId: InstallStepId;

  /** Human-readable step label for operator display */
  readonly label: string;

  /** Step family for grouping (discovery, preflight, install, verification, evidence) */
  readonly family: InstallStepFamily;

  /** Adapter key that executes this step (from adapter registry) */
  readonly adapterKey: string;

  /** Adapter operation name */
  readonly operation: string;

  /** Whether this step requires a manual checkpoint */
  readonly requiresCheckpoint: boolean;

  /** Whether this step can be skipped if already completed (idempotent) */
  readonly idempotent: boolean;

  /** Whether a failure in this step blocks the run (vs warning-only) */
  readonly blocking: boolean;
}

/**
 * Install step families for grouping and display.
 */
export enum InstallStepFamily {
  Discovery = 'discovery',
  Preflight = 'preflight',
  Install = 'install',
  Verification = 'verification',
  Evidence = 'evidence',
}

// ─── Install Preflight Check IDs ───────────────────────────────────────────────

/**
 * Canonical preflight check identifiers for install/bootstrap.
 *
 * These map to IAdminPreflightCheck.checkId values in preflight responses.
 */
export enum InstallPreflightCheckId {
  AzureSubscriptionAccessible = 'azure-subscription-accessible',
  ResourceGroupReachable = 'resource-group-reachable',
  EntraAppRegistrationPrereqs = 'entra-app-registration-prereqs',
  GraphApiPermissions = 'graph-api-permissions',
  SharePointTenantReachable = 'sharepoint-tenant-reachable',
  AppCatalogConfigured = 'app-catalog-configured',
  SpfxAppPackageAvailable = 'spfx-app-package-available',
  TableStorageAccessible = 'table-storage-accessible',
  EnvironmentConfigComplete = 'environment-config-complete',
}

// ─── Install Verification Check IDs ────────────────────────────────────────────

/**
 * Canonical verification check identifiers for post-install health checks.
 *
 * These map to IAdminPostRunValidationCheck.checkId values.
 */
export enum InstallVerificationCheckId {
  FunctionAppResponds = 'function-app-responds',
  TableStorageAccessible = 'table-storage-accessible',
  GraphApiFunctional = 'graph-api-functional',
  SharePointTenantReachable = 'sharepoint-tenant-reachable',
  SpfxPackageDeployed = 'spfx-package-deployed',
  ApiPermissionsGranted = 'api-permissions-granted',
}

// ─── Install Action Keys ───────────────────────────────────────────────────────

/**
 * Well-known action keys for the install/bootstrap domain.
 *
 * These are the AdminActionKey values used when launching install runs
 * via adminLaunchRun. They follow the domain:family:verb pattern.
 */
export const INSTALL_ACTION_KEYS = {
  /** Full install/bootstrap run */
  FULL_INSTALL: 'setup-install:bootstrap:full-install' as const,

  /** Preflight validation only (no install) */
  PREFLIGHT_ONLY: 'setup-install:bootstrap:preflight-only' as const,

  /** Post-install verification only (no install) */
  VERIFY_ONLY: 'setup-install:bootstrap:verify-only' as const,
} as const;

/** Union type of all install action keys */
export type InstallActionKey = (typeof INSTALL_ACTION_KEYS)[keyof typeof INSTALL_ACTION_KEYS];
