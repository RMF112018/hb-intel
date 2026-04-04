/**
 * Admin Control Plane — Phase 11 safety policy registry and enforcement.
 *
 * The safety policy registry is the backend's code-defined source of truth
 * for which safety controls are required for each admin action. Route handlers
 * use the enforcement helpers to verify that required safety steps have been
 * satisfied before executing an action.
 *
 * Design: the registry is code-defined (not live-configurable). A documented
 * seam exists for Phase 10 governed overrides if the safety policy needs to
 * become admin-configurable in the future.
 *
 * @module admin-control-plane/services
 */

import type { HttpResponseInit } from '@azure/functions';
import {
  AdminDomain,
  AdminRiskLevel,
  AdminExecutionMode,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type {
  AdminActionKey,
  AdminConfirmationType,
  IAdminSafetyProfile,
} from '@hbc/models/admin-control-plane';
import { errorResponse } from '../../utils/response-helpers.js';

// ─── Safety Profile Registry ───────────────────────────────────────────────────

/** Internal map of action key → safety profile. */
const registry = new Map<AdminActionKey, IAdminSafetyProfile>();

/**
 * Register a safety profile for an admin action.
 * Overwrites any existing profile for the same action key.
 */
export function registerSafetyProfile(profile: IAdminSafetyProfile): void {
  registry.set(profile.actionKey, profile);
}

/**
 * Look up the safety profile for an action.
 * Returns `null` if no profile is registered.
 */
export function getSafetyProfile(actionKey: AdminActionKey): IAdminSafetyProfile | null {
  return registry.get(actionKey) ?? null;
}

/** List all registered safety profiles. */
export function listSafetyProfiles(): readonly IAdminSafetyProfile[] {
  return [...registry.values()];
}

/** Clear the registry (for testing). */
export function clearSafetyRegistry(): void {
  registry.clear();
}

// ─── Default Safety Control Sets ───────────────────────────────────────────────

/** Controls required for T1 Routine actions. */
const ROUTINE_CONTROLS: readonly AdminSafetyControl[] = [
  AdminSafetyControl.AuditRecord,
  AdminSafetyControl.ExecutionEvidence,
];

/** Controls required for T2 Elevated actions. */
const ELEVATED_CONTROLS: readonly AdminSafetyControl[] = [
  AdminSafetyControl.Preview,
  AdminSafetyControl.StandardConfirmation,
  AdminSafetyControl.AuditRecord,
  AdminSafetyControl.InputEvidence,
  AdminSafetyControl.PreviewEvidence,
  AdminSafetyControl.ExecutionEvidence,
];

/** Controls required for T3 Destructive actions. */
const DESTRUCTIVE_CONTROLS: readonly AdminSafetyControl[] = [
  AdminSafetyControl.Preview,
  AdminSafetyControl.EnhancedConfirmation,
  AdminSafetyControl.ScopeRestriction,
  AdminSafetyControl.PostRunValidation,
  AdminSafetyControl.RecoveryGuidance,
  AdminSafetyControl.AuditRecord,
  AdminSafetyControl.InputEvidence,
  AdminSafetyControl.PreviewEvidence,
  AdminSafetyControl.ExecutionEvidence,
  AdminSafetyControl.ValidationEvidence,
];

/** Controls required for T4 Tenant-sensitive actions. */
const TENANT_SENSITIVE_CONTROLS: readonly AdminSafetyControl[] = [
  AdminSafetyControl.Preview,
  AdminSafetyControl.DryRun,
  AdminSafetyControl.EnhancedConfirmation,
  AdminSafetyControl.ScopeRestriction,
  AdminSafetyControl.PostRunValidation,
  AdminSafetyControl.RecoveryGuidance,
  AdminSafetyControl.AuditRecord,
  AdminSafetyControl.InputEvidence,
  AdminSafetyControl.PreviewEvidence,
  AdminSafetyControl.ExecutionEvidence,
  AdminSafetyControl.ValidationEvidence,
];

/**
 * Get the default control set for a risk level.
 * Read-only actions return an empty set.
 */
export function getDefaultControlsForRiskLevel(riskLevel: AdminRiskLevel): readonly AdminSafetyControl[] {
  switch (riskLevel) {
    case AdminRiskLevel.ReadOnly:
      return [];
    case AdminRiskLevel.Low:
      return ROUTINE_CONTROLS;
    case AdminRiskLevel.Moderate:
      return ELEVATED_CONTROLS;
    case AdminRiskLevel.High:
      return DESTRUCTIVE_CONTROLS;
    case AdminRiskLevel.Critical:
      return TENANT_SENSITIVE_CONTROLS;
    default:
      return DESTRUCTIVE_CONTROLS; // fail-safe: treat unknown as high
  }
}

/**
 * Get the default confirmation type for a risk level.
 */
export function getDefaultConfirmationType(riskLevel: AdminRiskLevel): AdminConfirmationType {
  switch (riskLevel) {
    case AdminRiskLevel.ReadOnly:
    case AdminRiskLevel.Low:
      return 'none';
    case AdminRiskLevel.Moderate:
      return 'standard';
    case AdminRiskLevel.High:
    case AdminRiskLevel.Critical:
      return 'enhanced';
    default:
      return 'enhanced';
  }
}

// ─── Profile Builder ───────────────────────────────────────────────────────────

/**
 * Build a safety profile with defaults derived from risk level.
 * Callers can override individual fields.
 */
export function buildSafetyProfile(
  actionKey: AdminActionKey,
  domain: AdminDomain,
  riskLevel: AdminRiskLevel,
  overrides?: Partial<Pick<IAdminSafetyProfile, 'executionMode' | 'requiredControls' | 'supportsPreview' | 'supportsDryRun' | 'confirmationType' | 'scopeDescription'>>,
): IAdminSafetyProfile {
  const executionMode = overrides?.executionMode ?? deriveDefaultExecutionMode(riskLevel);
  return {
    actionKey,
    domain,
    riskLevel,
    executionMode,
    requiredControls: overrides?.requiredControls ?? getDefaultControlsForRiskLevel(riskLevel),
    supportsPreview: overrides?.supportsPreview ?? (riskLevel !== AdminRiskLevel.ReadOnly && riskLevel !== AdminRiskLevel.Low),
    supportsDryRun: overrides?.supportsDryRun ?? false,
    confirmationType: overrides?.confirmationType ?? getDefaultConfirmationType(riskLevel),
    scopeDescription: overrides?.scopeDescription ?? '',
  };
}

function deriveDefaultExecutionMode(riskLevel: AdminRiskLevel): AdminExecutionMode {
  switch (riskLevel) {
    case AdminRiskLevel.ReadOnly:
      return AdminExecutionMode.Advisory;
    case AdminRiskLevel.Low:
      return AdminExecutionMode.Seamless;
    case AdminRiskLevel.Moderate:
      return AdminExecutionMode.Checkpointed;
    case AdminRiskLevel.High:
    case AdminRiskLevel.Critical:
      return AdminExecutionMode.Destructive;
    default:
      return AdminExecutionMode.Destructive;
  }
}

// ─── Enforcement Evaluation ────────────────────────────────────────────────────

/** Context provided by the caller to prove safety steps were completed. */
export interface ISafetyGateContext {
  /** Whether preview was performed (evidence ID expected if true) */
  readonly previewCompleted?: boolean;
  /** Evidence ID of the preview result */
  readonly previewEvidenceId?: string;
  /** Whether dry-run was performed */
  readonly dryRunCompleted?: boolean;
  /** Whether explicit confirmation was captured */
  readonly confirmationCaptured?: boolean;
  /** Declared execution scope description */
  readonly scopeDeclared?: boolean;
}

/** Result of safety gate evaluation. */
export interface ISafetyGateResult {
  readonly passed: boolean;
  readonly violations: readonly string[];
  readonly profile: IAdminSafetyProfile;
}

/**
 * Evaluate whether the provided context satisfies the safety requirements
 * for the given action.
 *
 * Returns a result indicating whether all required gates passed, with
 * a list of specific violations if any controls are unsatisfied.
 */
export function evaluateSafetyGates(
  profile: IAdminSafetyProfile,
  context: ISafetyGateContext,
): ISafetyGateResult {
  const violations: string[] = [];
  const controls = profile.requiredControls;

  if (controls.includes(AdminSafetyControl.Preview) && !context.previewCompleted) {
    violations.push('Preview is required but was not completed.');
  }

  if (controls.includes(AdminSafetyControl.PreviewEvidence) && !context.previewEvidenceId) {
    violations.push('Preview evidence is required but no evidence ID was provided.');
  }

  if (controls.includes(AdminSafetyControl.DryRun) && profile.supportsDryRun && !context.dryRunCompleted) {
    violations.push('Dry-run is required and supported but was not completed.');
  }

  if (
    (controls.includes(AdminSafetyControl.StandardConfirmation) ||
      controls.includes(AdminSafetyControl.EnhancedConfirmation)) &&
    !context.confirmationCaptured
  ) {
    violations.push('Explicit confirmation is required but was not captured.');
  }

  if (controls.includes(AdminSafetyControl.ScopeRestriction) && !context.scopeDeclared) {
    violations.push('Scope restriction is required but scope was not declared.');
  }

  return {
    passed: violations.length === 0,
    violations,
    profile,
  };
}

// ─── HTTP Enforcement Helper ───────────────────────────────────────────────────

/**
 * Require that safety gates are satisfied for an action.
 *
 * Returns a 422 response if the action has a registered safety profile
 * and the provided context does not satisfy all required controls.
 * Returns `null` if all gates pass or the action has no registered profile.
 *
 * Usage in route handlers:
 * ```ts
 * const denied = requireSafetyGates(actionKey, { previewCompleted: true, ... }, requestId);
 * if (denied) return denied;
 * ```
 */
export function requireSafetyGates(
  actionKey: AdminActionKey,
  context: ISafetyGateContext,
  requestId?: string,
): HttpResponseInit | null {
  const profile = getSafetyProfile(actionKey);
  if (!profile) return null; // No profile registered — pass through (forward-compatible)

  const result = evaluateSafetyGates(profile, context);
  if (result.passed) return null;

  return errorResponse(
    422,
    'SAFETY_GATES_UNSATISFIED',
    `Safety requirements not met for action ${actionKey}: ${result.violations.join(' ')}`,
    requestId,
  );
}

/**
 * Require that a safety profile exists for an action.
 *
 * Returns a 400 response if no profile is registered.
 * Returns `null` with the profile if found.
 *
 * Usage:
 * ```ts
 * const [denied, profile] = requireSafetyProfile(actionKey, requestId);
 * if (denied) return denied;
 * // profile is guaranteed non-null here
 * ```
 */
export function requireSafetyProfile(
  actionKey: AdminActionKey,
  requestId?: string,
): [HttpResponseInit, null] | [null, IAdminSafetyProfile] {
  const profile = getSafetyProfile(actionKey);
  if (!profile) {
    return [
      errorResponse(400, 'UNKNOWN_ACTION', `No safety profile registered for action: ${actionKey}`, requestId),
      null,
    ];
  }
  return [null, profile];
}

// ─── Required Evidence Query ───────────────────────────────────────────────────

/**
 * Determine which evidence types must be captured for an action based on
 * its safety profile.
 */
export function getRequiredEvidenceControls(profile: IAdminSafetyProfile): readonly AdminSafetyControl[] {
  return profile.requiredControls.filter((c) =>
    c === AdminSafetyControl.InputEvidence ||
    c === AdminSafetyControl.PreviewEvidence ||
    c === AdminSafetyControl.ExecutionEvidence ||
    c === AdminSafetyControl.ValidationEvidence,
  );
}

/**
 * Check whether a specific safety control is required for an action.
 */
export function isControlRequired(profile: IAdminSafetyProfile, control: AdminSafetyControl): boolean {
  return profile.requiredControls.includes(control);
}

// ─── Post-Run Hooks Query ──────────────────────────────────────────────────────

/**
 * Determine whether post-run validation is required for an action.
 */
export function isPostRunValidationRequired(profile: IAdminSafetyProfile): boolean {
  return profile.requiredControls.includes(AdminSafetyControl.PostRunValidation);
}

/**
 * Determine whether recovery guidance must be generated on failure.
 */
export function isRecoveryGuidanceRequired(profile: IAdminSafetyProfile): boolean {
  return profile.requiredControls.includes(AdminSafetyControl.RecoveryGuidance);
}

// ─── Seam for Phase 10 Governed Overrides ──────────────────────────────────────

/**
 * SEAM: When Phase 10 live-config governance extends to safety policy,
 * this function should be updated to merge code-defined defaults with
 * governed overrides from the config resolution service.
 *
 * Current behavior: returns the code-defined profile unchanged.
 */
export function resolveSafetyProfile(actionKey: AdminActionKey): IAdminSafetyProfile | null {
  // Phase 11: code-defined only
  // Phase 10 extension: merge with IConfigResolutionService overrides
  return getSafetyProfile(actionKey);
}
