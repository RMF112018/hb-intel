/**
 * P3-E8-T06 JHA, pre-task, toolbox prompt business rules.
 * Approval governance, completion validation, closure proof.
 */

import type { JhaStatus, DesignationStatus } from '../records/enums.js';
import type { IDailyPreTaskPlan, IWeeklyToolboxTalkRecord } from '../records/types.js';
import type { PromptClosureType } from './enums.js';
import type { IJhaApprovalResult, IPreTaskCompletionResult, IPromptClosureResult } from './types.js';

// -- JHA Approval Governance (§2.2–2.4) ------------------------------------

/**
 * §2.2: Validate JHA is ready for approval.
 * Must be PENDING_APPROVAL. If requiresCompetentPerson, designation must be ACTIVE.
 */
export const canApproveJha = (
  jhaStatus: JhaStatus,
  requiresCompetentPerson: boolean,
  designationStatus: DesignationStatus | null,
): IJhaApprovalResult => {
  const errors: string[] = [];

  if (jhaStatus !== 'PENDING_APPROVAL') {
    errors.push(`JHA must be in PENDING_APPROVAL status to approve. Current: '${jhaStatus}'.`);
  }

  if (requiresCompetentPerson && designationStatus !== 'ACTIVE') {
    errors.push(
      `JHA requires a competent person with ACTIVE designation. Current designation status: '${designationStatus ?? 'none'}'.`,
    );
  }

  return { valid: errors.length === 0, errors };
};

/**
 * §2.4: Check if competent person requirement is met.
 */
export const isCompetentPersonRequirementMet = (
  requiresCompetentPerson: boolean,
  designationStatus: DesignationStatus | null,
): boolean => {
  if (!requiresCompetentPerson) return true;
  return designationStatus === 'ACTIVE';
};

// -- Daily Pre-Task Plan (§3.1–3.3) ----------------------------------------

/**
 * §3.1: Daily pre-task plan can only be created against an APPROVED JHA.
 */
export const canCreateDailyPreTask = (jhaStatus: JhaStatus): boolean =>
  jhaStatus === 'APPROVED';

/**
 * §3.3: Validate daily pre-task plan is complete.
 * Required: controlsConfirmed, ppeVerified, attendeeCount > 0, completedAt set.
 */
export const validatePreTaskCompletion = (
  preTask: Pick<IDailyPreTaskPlan, 'controlsConfirmed' | 'ppeVerified' | 'attendeeCount' | 'completedAt'>,
): IPreTaskCompletionResult => {
  const errors: string[] = [];

  if (!preTask.controlsConfirmed) {
    errors.push('Controls must be confirmed before completion.');
  }

  if (!preTask.ppeVerified) {
    errors.push('PPE must be verified before completion.');
  }

  if (preTask.attendeeCount < 1) {
    errors.push('At least one attendee is required.');
  }

  if (!preTask.completedAt) {
    errors.push('Completion timestamp must be set.');
  }

  return { valid: errors.length === 0, errors };
};

// -- Toolbox Prompt Closure (§4.3) ------------------------------------------

/**
 * §4.3: Validate prompt closure against the closure type proof model.
 *
 * STANDARD: attendeeCount > 0
 * HIGH_RISK: attendeeCount > 0 + named attendees + proof (sign-in or acknowledgment)
 * CRITICAL: all HIGH_RISK + closureVerifiedById
 */
export const validatePromptClosure = (
  closureType: PromptClosureType,
  talkRecord: Pick<IWeeklyToolboxTalkRecord, 'attendeeCount' | 'namedAttendees' | 'signInSheetEvidenceId' | 'acknowledgmentBatchId' | 'status'>,
  closureVerifiedById: string | null = null,
): IPromptClosureResult => {
  const errors: string[] = [];

  if (talkRecord.status !== 'COMPLETE') {
    errors.push('Toolbox talk record must be COMPLETE.');
  }

  if (talkRecord.attendeeCount < 1) {
    errors.push('At least one attendee is required.');
  }

  if (closureType === 'HIGH_RISK' || closureType === 'CRITICAL') {
    if (talkRecord.namedAttendees.length === 0) {
      errors.push('Named attendee list is required for high-risk or critical closure.');
    }

    const hasProof =
      talkRecord.signInSheetEvidenceId !== null ||
      talkRecord.acknowledgmentBatchId !== null;

    if (!hasProof) {
      errors.push('At least one proof element (sign-in sheet or acknowledgment batch) is required.');
    }
  }

  if (closureType === 'CRITICAL') {
    if (!closureVerifiedById) {
      errors.push('Safety Manager verification is required for critical closure.');
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * §5.3: Check if high-risk proof requirements are satisfied.
 */
export const isHighRiskProofSatisfied = (
  talkRecord: Pick<IWeeklyToolboxTalkRecord, 'namedAttendees' | 'signInSheetEvidenceId' | 'acknowledgmentBatchId'>,
): boolean =>
  talkRecord.namedAttendees.length > 0 &&
  (talkRecord.signInSheetEvidenceId !== null || talkRecord.acknowledgmentBatchId !== null);

/**
 * Returns human-readable description of required proof for a closure type.
 */
export const getRequiredClosureProofLevel = (closureType: PromptClosureType): string => {
  switch (closureType) {
    case 'STANDARD':
      return 'Weekly toolbox talk record with attendee count > 0';
    case 'HIGH_RISK':
      return 'Weekly toolbox talk record + named attendees + sign-in sheet or acknowledgment batch';
    case 'CRITICAL':
      return 'All high-risk requirements + Safety Manager verification (closureVerifiedById)';
  }
};
