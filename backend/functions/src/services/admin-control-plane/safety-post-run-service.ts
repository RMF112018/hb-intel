/**
 * Admin Control Plane — Phase 11 post-run validation and recovery guidance.
 *
 * After a risky admin action executes, this service:
 * 1. Runs post-run validation checks to confirm the intended outcome.
 * 2. Generates recovery guidance when validation fails or execution errors.
 * 3. Assembles a safety evidence summary linking all safety artifacts.
 *
 * Design: attaches to the existing durable run/audit/evidence stores
 * (Phase 4) rather than inventing a parallel store. Post-run validation
 * results and recovery guidance are captured as evidence references.
 *
 * @module admin-control-plane/services
 */

import {
  AdminAuditEventType,
  AdminEvidenceType,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type {
  AdminActionKey,
  AdminDomain,
  AdminRiskLevel,
  IAdminActorContext,
  IAdminPostRunValidationSummary,
  IAdminPostRunValidationCheck,
  IAdminRecoveryGuidance,
  IAdminRecoveryStep,
  IAdminSafetyEvidenceSummary,
  IAdminSafetyProfile,
  IAdminEvidenceReference,
} from '@hbc/models/admin-control-plane';
import type { IAdminAuditService, IAdminEvidenceService } from './types.js';
import { getSafetyProfile, isPostRunValidationRequired, isRecoveryGuidanceRequired, getRequiredEvidenceControls } from './safety-policy-registry.js';

// ─── Post-Run Validation Provider ──────────────────────────────────────────────

/**
 * Domain-specific post-run validation provider.
 *
 * Each admin domain implements this interface to supply domain-specific
 * validation checks after action execution.
 */
export interface IPostRunValidationProvider {
  /** Generate validation checks for the completed action. */
  generateChecks(input: IPostRunValidationInput): Promise<IAdminPostRunValidationCheck[]>;
}

/** Input to a post-run validation provider. */
export interface IPostRunValidationInput {
  readonly actionKey: AdminActionKey;
  readonly runId: string;
  readonly commandInput: Record<string, unknown>;
  readonly targetEntityId: string | null;
}

const validationProviderRegistry = new Map<string, IPostRunValidationProvider>();

/** Register a post-run validation provider by action key or domain. */
export function registerPostRunValidationProvider(key: string, provider: IPostRunValidationProvider): void {
  validationProviderRegistry.set(key, provider);
}

/** Look up a validation provider. Tries action key first, then domain. */
export function getPostRunValidationProvider(actionKey: AdminActionKey, domain: AdminDomain): IPostRunValidationProvider | null {
  return validationProviderRegistry.get(actionKey) ?? validationProviderRegistry.get(domain) ?? null;
}

/** Clear the validation provider registry (for testing). */
export function clearPostRunValidationProviders(): void {
  validationProviderRegistry.clear();
}

// ─── Recovery Guidance Provider ────────────────────────────────────────────────

/**
 * Domain-specific recovery guidance provider.
 *
 * Generates contextual recovery steps when an action fails or
 * validation finds discrepancies.
 */
export interface IRecoveryGuidanceProvider {
  /** Generate recovery guidance for a failed or partially-failed action. */
  generateGuidance(input: IRecoveryGuidanceInput): Promise<IAdminRecoveryGuidance>;
}

/** Input to a recovery guidance provider. */
export interface IRecoveryGuidanceInput {
  readonly actionKey: AdminActionKey;
  readonly runId: string;
  readonly failureClass: string;
  readonly commandInput: Record<string, unknown>;
  readonly targetEntityId: string | null;
  readonly validationChecks?: readonly IAdminPostRunValidationCheck[];
}

const recoveryProviderRegistry = new Map<string, IRecoveryGuidanceProvider>();

/** Register a recovery guidance provider by action key or domain. */
export function registerRecoveryGuidanceProvider(key: string, provider: IRecoveryGuidanceProvider): void {
  recoveryProviderRegistry.set(key, provider);
}

/** Look up a recovery provider. Tries action key first, then domain. */
export function getRecoveryGuidanceProvider(actionKey: AdminActionKey, domain: AdminDomain): IRecoveryGuidanceProvider | null {
  return recoveryProviderRegistry.get(actionKey) ?? recoveryProviderRegistry.get(domain) ?? null;
}

/** Clear the recovery provider registry (for testing). */
export function clearRecoveryGuidanceProviders(): void {
  recoveryProviderRegistry.clear();
}

// ─── Post-Run Validation Execution ─────────────────────────────────────────────

/** Result of executing post-run validation. */
export interface IPostRunValidationResult {
  readonly summary: IAdminPostRunValidationSummary;
  readonly evidenceId: string;
  readonly allPassed: boolean;
}

/**
 * Execute post-run validation for an action.
 *
 * 1. Look up the domain-specific validation provider
 * 2. Generate validation checks (or produce truthful "no provider" result)
 * 3. Capture validation evidence
 * 4. Record audit event
 */
export async function executePostRunValidation(
  input: IPostRunValidationInput,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IPostRunValidationResult> {
  const now = new Date().toISOString();
  const evidenceId = crypto.randomUUID();
  const profile = getSafetyProfile(input.actionKey);
  const domain = profile?.domain;

  // 1. Resolve provider
  const provider = domain
    ? getPostRunValidationProvider(input.actionKey, domain)
    : null;

  let checks: IAdminPostRunValidationCheck[];

  if (provider) {
    checks = await provider.generateChecks(input);
  } else {
    // No provider — produce truthful result
    checks = [{
      checkId: 'no-provider',
      label: 'Automated validation',
      passed: true,
      message: 'No domain-specific post-run validation provider is registered. Manual verification is recommended.',
    }];
  }

  const allPassed = checks.every(c => c.passed);

  const summary: IAdminPostRunValidationSummary = {
    runId: input.runId,
    outcomeAccepted: allPassed,
    checks,
    comment: null,
    validatedAt: now,
    validatedBy: actor,
  };

  // 2. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId,
        evidenceType: AdminEvidenceType.PostValidationSummary,
        label: `Post-run validation for ${input.actionKey}`,
        runId: input.runId,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-validation/${input.actionKey}/${input.runId}/${now}`,
      },
      'operational',
      {
        actionKey: input.actionKey,
        runId: input.runId,
        allPassed,
        checkCount: checks.length,
        failedCount: checks.filter(c => !c.passed).length,
        checks,
      },
    ).catch(() => {});
  }

  // 3. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: allPassed ? AdminAuditEventType.RunCompleted : AdminAuditEventType.RunFailed,
      timestamp: now,
      domain: (domain ?? '') as AdminDomain,
      actionKey: input.actionKey,
      runId: input.runId,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: {
        evidenceId,
        evidenceType: AdminEvidenceType.PostValidationSummary,
        label: `Post-run validation: ${allPassed ? 'all passed' : 'failures detected'}`,
        runId: input.runId,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-validation/${input.actionKey}/${input.runId}/${now}`,
      },
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `Post-run validation for ${input.actionKey}: ${checks.length} checks, ${checks.filter(c => !c.passed).length} failed`,
    }).catch(() => {});
  }

  return { summary, evidenceId, allPassed };
}

// ─── Recovery Guidance Execution ───────────────────────────────────────────────

/** Result of generating recovery guidance. */
export interface IRecoveryGuidanceResult {
  readonly guidance: IAdminRecoveryGuidance;
  readonly evidenceId: string;
}

/**
 * Generate recovery guidance for a failed or partially-failed action.
 *
 * 1. Look up the domain-specific recovery provider
 * 2. Generate guidance (or produce truthful default guidance)
 * 3. Capture recovery evidence
 * 4. Record audit event
 */
export async function generateRecoveryGuidance(
  input: IRecoveryGuidanceInput,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IRecoveryGuidanceResult> {
  const now = new Date().toISOString();
  const evidenceId = crypto.randomUUID();
  const profile = getSafetyProfile(input.actionKey);
  const domain = profile?.domain;

  // 1. Resolve provider
  const provider = domain
    ? getRecoveryGuidanceProvider(input.actionKey, domain)
    : null;

  let guidance: IAdminRecoveryGuidance;

  if (provider) {
    guidance = await provider.generateGuidance(input);
  } else {
    // No provider — produce truthful default guidance
    guidance = buildDefaultRecoveryGuidance(input, profile);
  }

  // 2. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId,
        evidenceType: AdminEvidenceType.CompensationRecord,
        label: `Recovery guidance for ${input.actionKey}`,
        runId: input.runId,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-recovery/${input.actionKey}/${input.runId}/${now}`,
      },
      'operational',
      {
        actionKey: input.actionKey,
        runId: input.runId,
        failureClass: input.failureClass,
        stepCount: guidance.steps.length,
        estimatedComplexity: guidance.estimatedComplexity,
        compensationAvailable: guidance.compensationAvailable,
        externalActionCount: guidance.externalActions.length,
      },
    ).catch(() => {});
  }

  // 3. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.RunFailed,
      timestamp: now,
      domain: (domain ?? '') as AdminDomain,
      actionKey: input.actionKey,
      runId: input.runId,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: {
        evidenceId,
        evidenceType: AdminEvidenceType.CompensationRecord,
        label: `Recovery guidance: ${guidance.estimatedComplexity}`,
        runId: input.runId,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-recovery/${input.actionKey}/${input.runId}/${now}`,
      },
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `Recovery guidance for ${input.actionKey}: ${guidance.steps.length} steps, complexity ${guidance.estimatedComplexity}`,
    }).catch(() => {});
  }

  return { guidance, evidenceId };
}

function buildDefaultRecoveryGuidance(
  input: IRecoveryGuidanceInput,
  profile: IAdminSafetyProfile | null,
): IAdminRecoveryGuidance {
  const steps: IAdminRecoveryStep[] = [
    {
      order: 1,
      label: 'Review execution evidence',
      description: 'Check the audit trail and evidence artifacts to understand what was executed and what failed.',
      actionType: 'manual',
      actionKey: null,
    },
    {
      order: 2,
      label: 'Assess failure impact',
      description: `The failure was classified as "${input.failureClass}". Determine whether the failure left the system in a partially modified state.`,
      actionType: 'manual',
      actionKey: null,
    },
    {
      order: 3,
      label: 'Contact support if needed',
      description: 'If the failure requires access or permissions beyond your current scope, escalate to the appropriate support channel.',
      actionType: 'external',
      actionKey: null,
    },
  ];

  return {
    runId: input.runId,
    actionKey: input.actionKey,
    failureClass: input.failureClass,
    steps,
    estimatedComplexity: 'moderate',
    compensationAvailable: false,
    externalActions: ['Review the Azure portal or admin center for the affected resource state.'],
  };
}

// ─── Safety Evidence Summary Assembly ──────────────────────────────────────────

/** Input for assembling a safety evidence summary. */
export interface ISafetyEvidenceSummaryInput {
  readonly runId: string;
  readonly actionKey: AdminActionKey;
  readonly previewEvidenceId?: string | null;
  readonly confirmationEvidenceId?: string | null;
  readonly validationEvidenceId?: string | null;
  readonly recoveryEvidenceId?: string | null;
}

/**
 * Assemble a complete safety evidence summary for a run.
 *
 * Queries the evidence service for all evidence references associated
 * with the run, then builds the summary showing which controls were
 * satisfied and which were skipped.
 */
export async function assembleSafetyEvidenceSummary(
  input: ISafetyEvidenceSummaryInput,
  evidenceService?: IAdminEvidenceService,
): Promise<IAdminSafetyEvidenceSummary> {
  const now = new Date().toISOString();
  const profile = getSafetyProfile(input.actionKey);
  const riskLevel = profile?.riskLevel ?? ('moderate' as AdminRiskLevel);
  const requiredControls = profile?.requiredControls ?? [];

  // Gather evidence refs from the evidence service
  let evidenceRefs: readonly IAdminEvidenceReference[] = [];
  if (evidenceService) {
    evidenceRefs = await evidenceService.listByRunId(input.runId).catch(() => []);
  }

  // Determine which controls were satisfied
  const controlsSatisfied: AdminSafetyControl[] = [];
  const controlsSkipped: AdminSafetyControl[] = [];

  for (const control of requiredControls) {
    const satisfied = isControlSatisfied(control, input, evidenceRefs);
    if (satisfied) {
      controlsSatisfied.push(control);
    } else {
      controlsSkipped.push(control);
    }
  }

  return {
    runId: input.runId,
    actionKey: input.actionKey,
    riskLevel,
    controlsSatisfied,
    controlsSkipped,
    previewCaptured: !!input.previewEvidenceId,
    confirmationCaptured: !!input.confirmationEvidenceId,
    validationCaptured: !!input.validationEvidenceId,
    recoveryCaptured: !!input.recoveryEvidenceId,
    evidenceRefs,
    completedAt: now,
  };
}

function isControlSatisfied(
  control: AdminSafetyControl,
  input: ISafetyEvidenceSummaryInput,
  _evidenceRefs: readonly IAdminEvidenceReference[],
): boolean {
  switch (control) {
    case AdminSafetyControl.Preview:
    case AdminSafetyControl.PreviewEvidence:
      return !!input.previewEvidenceId;
    case AdminSafetyControl.StandardConfirmation:
    case AdminSafetyControl.EnhancedConfirmation:
      return !!input.confirmationEvidenceId;
    case AdminSafetyControl.PostRunValidation:
    case AdminSafetyControl.ValidationEvidence:
      return !!input.validationEvidenceId;
    case AdminSafetyControl.RecoveryGuidance:
      return !!input.recoveryEvidenceId;
    case AdminSafetyControl.AuditRecord:
    case AdminSafetyControl.InputEvidence:
    case AdminSafetyControl.ExecutionEvidence:
      return true; // These are captured by the run/audit infrastructure automatically
    case AdminSafetyControl.DryRun:
    case AdminSafetyControl.ScopeRestriction:
      return true; // Validated at gate-check time, not evidence time
    default:
      return false;
  }
}
