/**
 * Admin Control Plane — Phase 11 safety action catalog.
 *
 * Registers safety profiles for all currently implemented admin actions.
 * This catalog is the code-defined source of truth for action → safety
 * envelope mappings.
 *
 * Action keys follow the convention: `domain:family:verb`
 * (e.g., `provisioning-rollout:saga:force-state-transition`).
 *
 * @module admin-control-plane/services
 */

import {
  AdminDomain,
  AdminRiskLevel,
  AdminExecutionMode,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import { registerSafetyProfile, buildSafetyProfile } from './safety-policy-registry.js';

/**
 * Register all known admin action safety profiles.
 *
 * Call this at service startup (from the admin control-plane host)
 * to populate the safety registry before any requests are handled.
 */
export function registerDefaultSafetyProfiles(): void {
  // ── Provisioning Domain ────────────────────────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('provisioning-rollout:saga:launch', AdminDomain.ProvisioningRollout, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Launches provisioning for a single project site.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('provisioning-rollout:saga:retry', AdminDomain.ProvisioningRollout, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: false,
      scopeDescription: 'Retries a failed provisioning run from the last failed step.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('provisioning-rollout:failure:archive', AdminDomain.ProvisioningRollout, AdminRiskLevel.Low, {
      scopeDescription: 'Marks a provisioning failure as acknowledged.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('provisioning-rollout:escalation:acknowledge', AdminDomain.ProvisioningRollout, AdminRiskLevel.Low, {
      scopeDescription: 'Marks an escalation as acknowledged.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('provisioning-rollout:saga:force-state-transition', AdminDomain.ProvisioningRollout, AdminRiskLevel.High, {
      executionMode: AdminExecutionMode.Destructive,
      supportsPreview: true,
      scopeDescription: 'Overrides the run state machine for a single provisioning run.',
    }),
  );

  // ── Setup / Install Domain ─────────────────────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('setup-install:install:launch', AdminDomain.SetupInstall, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Launches the backend install/bootstrap workflow.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('setup-install:checkpoint:approve', AdminDomain.SetupInstall, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: false,
      scopeDescription: 'Approves a checkpoint to resume the install workflow.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('setup-install:checkpoint:reject', AdminDomain.SetupInstall, AdminRiskLevel.Low, {
      scopeDescription: 'Rejects a checkpoint and stops the install workflow.',
    }),
  );

  // ── App Binding Domain ─────────────────────────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('app-binding:binding:publish', AdminDomain.AppBinding, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Publishes or updates a managed app binding.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('app-binding:binding:repair', AdminDomain.AppBinding, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Repairs a drifted or errored app binding.',
    }),
  );

  // ── Hybrid Identity Domain ─────────────────────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('entra-control:user:create-ad-ds', AdminDomain.EntraControl, AdminRiskLevel.High, {
      executionMode: AdminExecutionMode.Destructive,
      supportsPreview: true,
      scopeDescription: 'Creates an identity in on-prem Active Directory.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:user:create-cloud', AdminDomain.EntraControl, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Creates an Entra ID cloud identity.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:user:update', AdminDomain.EntraControl, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Updates identity attributes for a single user.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:user:enable', AdminDomain.EntraControl, AdminRiskLevel.Low, {
      scopeDescription: 'Re-enables a disabled user identity.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:user:disable', AdminDomain.EntraControl, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Disables a user identity, removing access.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:user:delete', AdminDomain.EntraControl, AdminRiskLevel.High, {
      executionMode: AdminExecutionMode.Destructive,
      supportsPreview: true,
      scopeDescription: 'Permanently removes a user identity.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:connection:upsert', AdminDomain.EntraControl, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: false,
      scopeDescription: 'Creates or updates a governed connector configuration.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('entra-control:connection:rotate-secret', AdminDomain.EntraControl, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: false,
      scopeDescription: 'Rotates a connector secret reference.',
    }),
  );

  // ── White-Glove Device Deployment Domain ───────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('white-glove-deployment:package:launch', AdminDomain.WhiteGloveDeployment, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Launches a white-glove device package deployment.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('white-glove-deployment:checkpoint:approve', AdminDomain.WhiteGloveDeployment, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: false,
      scopeDescription: 'Approves a deployment checkpoint.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('white-glove-deployment:checkpoint:reject', AdminDomain.WhiteGloveDeployment, AdminRiskLevel.Low, {
      scopeDescription: 'Rejects a deployment checkpoint.',
    }),
  );

  // ── Standards / Config Domain ──────────────────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('standards-config:config:publish', AdminDomain.StandardsConfig, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Publishes a configuration override with audit reason.',
    }),
  );

  registerSafetyProfile(
    buildSafetyProfile('standards-config:config:revert', AdminDomain.StandardsConfig, AdminRiskLevel.Moderate, {
      executionMode: AdminExecutionMode.Checkpointed,
      supportsPreview: true,
      scopeDescription: 'Reverts a configuration override to a prior version.',
    }),
  );

  // ── SharePoint Control Domain ──────────────────────────────────────────

  registerSafetyProfile(
    buildSafetyProfile('sharepoint-control:site:apply-repair', AdminDomain.SharePointControl, AdminRiskLevel.High, {
      executionMode: AdminExecutionMode.Destructive,
      supportsPreview: true,
      supportsDryRun: true,
      scopeDescription: 'Applies repair changes to SharePoint managed assets.',
    }),
  );
}
