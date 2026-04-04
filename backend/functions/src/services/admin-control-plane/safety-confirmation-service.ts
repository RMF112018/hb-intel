/**
 * Admin Control Plane — Phase 11 destructive-action confirmation service.
 *
 * Validates confirmation payloads from the operator, records confirmation
 * evidence, and bridges to the safety gate enforcement pipeline. This service
 * ensures that destructive and tenant-sensitive actions cannot execute without
 * proven operator acknowledgment.
 *
 * Design: confirmation state is recorded as durable evidence via the existing
 * IAdminEvidenceService and IAdminAuditService. No separate confirmation store
 * is needed — the evidence service is the durable record. The safety gate
 * context carries the proof that confirmation was satisfied.
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
  AdminConfirmationType,
  IAdminActorContext,
  IAdminSafetyProfile,
  IAdminConfirmationPayload,
  IAdminExecutionScope,
} from '@hbc/models/admin-control-plane';
import type { IAdminAuditService, IAdminEvidenceService } from './types.js';
import { getSafetyProfile } from './safety-policy-registry.js';

// ─── Confirmation Validation ───────────────────────────────────────────────────

/** Result of validating a confirmation payload. */
export interface IConfirmationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly confirmationType: AdminConfirmationType;
}

/**
 * Validate a confirmation payload against the action's safety profile.
 *
 * Checks:
 * - Profile exists and requires confirmation
 * - Confirmation type matches profile requirement
 * - Enhanced confirmation: acknowledgment text matches expected phrase
 * - Scope is declared when required
 * - Preview evidence is linked when required
 */
export function validateConfirmation(
  payload: IConfirmationPayloadInput,
  expectedPhrase?: string,
): IConfirmationValidationResult {
  const errors: string[] = [];
  const profile = getSafetyProfile(payload.actionKey);

  if (!profile) {
    return { valid: false, errors: ['No safety profile registered for this action.'], confirmationType: 'none' };
  }

  const confirmationType = profile.confirmationType;

  if (confirmationType === 'none') {
    return { valid: true, errors: [], confirmationType };
  }

  // Standard confirmation: just needs to be present
  if (!payload.operatorAcknowledgment || payload.operatorAcknowledgment.trim().length === 0) {
    errors.push('Operator acknowledgment is required.');
  }

  // Enhanced confirmation: must match expected phrase
  if (confirmationType === 'enhanced') {
    const phrase = expectedPhrase ?? 'CONFIRM';
    if (payload.operatorAcknowledgment !== phrase) {
      errors.push(`Enhanced confirmation requires typing "${phrase}" exactly.`);
    }
  }

  // Scope must be declared for actions requiring scope restriction
  if (profile.requiredControls.includes(AdminSafetyControl.ScopeRestriction) && !payload.scopeDeclared) {
    errors.push('Scope declaration is required for this action.');
  }

  // Preview evidence must be linked when preview is required
  if (profile.requiredControls.includes(AdminSafetyControl.PreviewEvidence) && !payload.previewEvidenceId) {
    errors.push('Preview evidence ID is required — the operator must review a preview before confirming.');
  }

  return { valid: errors.length === 0, errors, confirmationType };
}

// ─── Confirmation Payload Input ────────────────────────────────────────────────

/** Input for confirmation validation and recording. */
export interface IConfirmationPayloadInput {
  readonly actionKey: AdminActionKey;
  readonly operatorAcknowledgment: string;
  readonly previewEvidenceId?: string | null;
  readonly scopeDeclared?: boolean;
  readonly rationale?: { reason: string; externalReference?: string | null } | null;
}

// ─── Confirmation Recording ────────────────────────────────────────────────────

/** Result of recording a confirmation. */
export interface IConfirmationRecordResult {
  readonly confirmationEvidenceId: string;
  readonly confirmationPayload: IAdminConfirmationPayload;
}

/**
 * Record a validated confirmation as durable evidence.
 *
 * This creates:
 * 1. A confirmation evidence record (IAdminEvidenceReference)
 * 2. An audit event recording the confirmation
 *
 * The returned evidence ID is used in the ISafetyGateContext to prove
 * confirmation was captured before execution proceeds.
 */
export async function recordConfirmation(
  payload: IConfirmationPayloadInput,
  actor: IAdminActorContext,
  scope: IAdminExecutionScope | null,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IConfirmationRecordResult> {
  const now = new Date().toISOString();
  const confirmationEvidenceId = crypto.randomUUID();
  const profile = getSafetyProfile(payload.actionKey);

  const confirmationPayload: IAdminConfirmationPayload = {
    actionKey: payload.actionKey,
    confirmationType: profile?.confirmationType ?? 'standard',
    operatorAcknowledgment: payload.operatorAcknowledgment,
    previewEvidenceId: payload.previewEvidenceId ?? null,
    rationale: payload.rationale
      ? {
          reason: payload.rationale.reason,
          externalReference: payload.rationale.externalReference ?? null,
          recordedAt: now,
          recordedBy: actor,
        }
      : null,
    confirmedAt: now,
    confirmedBy: actor,
  };

  // 1. Record evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId: confirmationEvidenceId,
        evidenceType: AdminEvidenceType.CommandInputSnapshot,
        label: `Confirmation for ${payload.actionKey}`,
        runId: null,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-confirmation/${payload.actionKey}/${now}`,
      },
      'operational',
      {
        actionKey: payload.actionKey,
        confirmationType: confirmationPayload.confirmationType,
        previewEvidenceId: payload.previewEvidenceId ?? null,
        scopeDeclared: payload.scopeDeclared ?? false,
        hasRationale: !!payload.rationale,
        scope: scope ?? null,
      },
    ).catch(() => {});
  }

  // 2. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.CheckpointDecided,
      timestamp: now,
      domain: (profile?.domain ?? '') as AdminDomain,
      actionKey: payload.actionKey,
      runId: null,
      checkpointInstanceId: `safety-confirmation-${confirmationEvidenceId}`,
      actor,
      rationale: confirmationPayload.rationale,
      evidenceRef: {
        evidenceId: confirmationEvidenceId,
        evidenceType: AdminEvidenceType.CommandInputSnapshot,
        label: `Confirmation for ${payload.actionKey}`,
        runId: null,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-confirmation/${payload.actionKey}/${now}`,
      },
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `${confirmationPayload.confirmationType} confirmation for ${payload.actionKey} by ${actor.displayName}`,
    }).catch(() => {});
  }

  return { confirmationEvidenceId, confirmationPayload };
}

// ─── Full Confirmation Flow ────────────────────────────────────────────────────

/** Result of the full confirmation flow. */
export interface IConfirmationFlowResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly confirmationEvidenceId: string | null;
  readonly confirmationPayload: IAdminConfirmationPayload | null;
}

/**
 * Execute the full confirmation flow: validate + record.
 *
 * This is the primary entry point for route handlers. It validates the
 * confirmation payload against the safety profile, then records the
 * confirmation as durable evidence if valid.
 *
 * Usage in route handlers:
 * ```ts
 * const result = await executeConfirmationFlow(payload, actor, scope, auditService, evidenceService);
 * if (!result.valid) return errorResponse(422, 'CONFIRMATION_INVALID', result.errors.join(' '), requestId);
 * // result.confirmationEvidenceId is now available for ISafetyGateContext
 * ```
 */
export async function executeConfirmationFlow(
  payload: IConfirmationPayloadInput,
  actor: IAdminActorContext,
  scope: IAdminExecutionScope | null,
  expectedPhrase?: string,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IConfirmationFlowResult> {
  // 1. Validate
  const validation = validateConfirmation(payload, expectedPhrase);
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      confirmationEvidenceId: null,
      confirmationPayload: null,
    };
  }

  // 2. Record
  const record = await recordConfirmation(payload, actor, scope, auditService, evidenceService);

  return {
    valid: true,
    errors: [],
    confirmationEvidenceId: record.confirmationEvidenceId,
    confirmationPayload: record.confirmationPayload,
  };
}

// ─── Checkpoint Bridge ─────────────────────────────────────────────────────────

/**
 * Determine whether an action requires checkpoint-style execution
 * (pause + resume) vs straight-through execution.
 *
 * This bridges the Phase 11 safety model with the existing Phase 6
 * checkpoint infrastructure. Actions in checkpointed mode use the
 * existing checkpoint flow; destructive actions use a confirmation-
 * then-execute pattern without mid-execution pauses.
 */
export function requiresCheckpointExecution(profile: IAdminSafetyProfile): boolean {
  return profile.executionMode === 'checkpointed';
}

/**
 * Determine whether an action requires the enhanced (destructive)
 * confirmation ceremony before execution.
 */
export function requiresDestructiveConfirmation(profile: IAdminSafetyProfile): boolean {
  return profile.confirmationType === 'enhanced';
}
