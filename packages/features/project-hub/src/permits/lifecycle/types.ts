/**
 * P3-E7-T03 Permits Lifecycle TypeScript contracts.
 * Application lifecycle, issued permit lifecycle via PermitLifecycleAction, governance.
 */

import type { PermitApplicationStatus, IssuedPermitStatus, PermitLifecycleActionType } from '../records/enums.js';
import type { IPermitLifecycleAction, IIssuedPermit } from '../records/types.js';

// ── Application Transition ──────────────────────────────────────────

export interface IPermitApplicationTransitionRule {
  readonly from: PermitApplicationStatus | '*';
  readonly to: PermitApplicationStatus;
  readonly trigger: string;
  readonly requiredFields: readonly string[];
}

export interface IPermitApplicationTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ── Issued Permit Lifecycle Action Transition (§3.2) ────────────────

export interface IPermitLifecycleActionTransitionRule {
  readonly actionType: PermitLifecycleActionType;
  readonly previousStatus: IssuedPermitStatus | '*';
  readonly newStatus: IssuedPermitStatus | 'SAME';
  readonly notesRequired: boolean;
  readonly ackRequired: boolean;
}

export interface IPermitLifecycleActionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ── API Contracts (§6) ──────────────────────────────────────────────

export interface ICreatePermitLifecycleActionRequest {
  readonly actionType: PermitLifecycleActionType;
  readonly effectiveDate?: string;
  readonly notes?: string;
  readonly evidenceRecordIds?: readonly string[];
  readonly jurisdictionReferenceNumber?: string;
}

export interface ICreatePermitLifecycleActionResponse {
  readonly action: IPermitLifecycleAction;
  readonly updatedPermit: IIssuedPermit;
  readonly workQueueItemsCreated: readonly string[];
  readonly resolvedWorkQueueItemIds: readonly string[];
}

// ── Governance ──────────────────────────────────────────────────────

export interface IPermitApplicationEditRule {
  readonly status: PermitApplicationStatus;
  readonly whoMayEdit: readonly string[];
}

export interface ISystemDrivenTransition {
  readonly trigger: string;
  readonly actionType: PermitLifecycleActionType;
  readonly condition: string;
}
