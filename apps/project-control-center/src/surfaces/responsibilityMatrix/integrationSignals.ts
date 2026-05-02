/**
 * PCC Responsibility Matrix — integration signals (Phase 3 / Wave 11 / Prompt 06).
 *
 * Pure mapper that derives five integration sub-region view-models from the
 * existing `PccResponsibilityMatrixReadModel`. Read-only by contract: no
 * Priority Action creation, no readiness scoring change, no approval
 * execution, no Team & Access mutation, no evidence binary handling.
 *
 * Ownership boundaries:
 *   - Priority Actions remains its own surface; entries here are
 *     candidate signals only.
 *   - Project Readiness retains its scoring doctrine; entries here are
 *     source-lineage references with `sourceModuleId='responsibility-matrix'`.
 *   - Approval execution is owned by Wave 14; entries here are reference
 *     descriptors of pending workflow steps only.
 *   - Team & Access remains the roster/access owner.
 *   - HB Document Control Center retains evidence-binary ownership.
 *
 * "Missing responsible / current action owner unresolved" is sourced from
 * `MISSING_CURRENT_ACTION_OWNER` exceptions plus an absent
 * `assignment.currentActionOwner`. It is never sourced from an absent
 * `ownerRole` — the canonical fixture contracts include `ownerRole` on
 * every project instance.
 */

import type {
  IResponsibilityProjectInstanceRecord,
  IResponsibilityWorkflowStep,
  PccPersona,
  PccResponsibilityMatrixReadModel,
  ResponsibilityCriticality,
  ResponsibilityEvidenceLinkState,
  ResponsibilityExceptionCode,
  ResponsibilityWorkflowStepType,
} from '@hbc/models/pcc';

// ---------------------------------------------------------------------------
// Public view-model shapes
// ---------------------------------------------------------------------------

export interface IPccRmPriorityActionCandidateGroup {
  readonly code: ResponsibilityExceptionCode;
  readonly codeLabel: string;
  readonly count: number;
  readonly severityHighest: ResponsibilityCriticality;
  readonly severityLabel: string;
  readonly relatedInstanceIds: readonly string[];
  readonly captionText: string;
}

export interface IPccRmPriorityActionsCandidatesViewModel {
  readonly groups: readonly IPccRmPriorityActionCandidateGroup[];
  readonly ownershipCaption: string;
  readonly emptyCaption: string;
}

export type PccRmReadinessSignalKind =
  | 'open-critical-exceptions'
  | 'pending-human-review'
  | 'decision-rights-gap'
  | 'source-posture';

export interface IPccRmReadinessSignalEntry {
  readonly kind: PccRmReadinessSignalKind;
  readonly kindLabel: string;
  readonly count: number;
  readonly severityLabel: string;
  readonly captionText: string;
}

export interface IPccRmReadinessSignalsViewModel {
  readonly sourceModuleId: 'responsibility-matrix';
  readonly entries: readonly IPccRmReadinessSignalEntry[];
  readonly ownershipCaption: string;
}

export interface IPccRmApprovalsReferenceEntry {
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly stepId: string;
  readonly stepType: ResponsibilityWorkflowStepType;
  readonly stepTypeLabel: string;
  readonly stepStateLabel: string;
}

export interface IPccRmApprovalsReferencesViewModel {
  readonly entries: readonly IPccRmApprovalsReferenceEntry[];
  readonly ownershipCaption: string;
  readonly emptyCaption: string;
}

export interface IPccRmTeamAccessReferenceRoleEntry {
  readonly roleCode: string;
  readonly roleLabel: string;
  readonly required: boolean;
  readonly instanceCount: number;
}

export interface IPccRmTeamAccessReferencePersonEntry {
  readonly personId: string;
  readonly displayName: string;
  readonly isActive: boolean;
  readonly instanceCount: number;
}

export interface IPccRmTeamAccessReferencesViewModel {
  readonly roleEntries: readonly IPccRmTeamAccessReferenceRoleEntry[];
  readonly personEntries: readonly IPccRmTeamAccessReferencePersonEntry[];
  readonly ownershipCaption: string;
  readonly emptyCaption: string;
}

export interface IPccRmDocumentControlReferenceEntry {
  readonly status: ResponsibilityEvidenceLinkState;
  readonly statusLabel: string;
  readonly count: number;
  readonly documentControlSourceIds: readonly string[];
}

export interface IPccRmDocumentControlReferencesViewModel {
  readonly entries: readonly IPccRmDocumentControlReferenceEntry[];
  readonly ownershipCaption: string;
  readonly emptyCaption: string;
}

export interface IPccRmIntegrationSignalsViewModel {
  readonly priorityActions: IPccRmPriorityActionsCandidatesViewModel;
  readonly readinessSignals: IPccRmReadinessSignalsViewModel;
  readonly approvalsReferences: IPccRmApprovalsReferencesViewModel;
  readonly teamAccessReferences: IPccRmTeamAccessReferencesViewModel;
  readonly documentControlReferences: IPccRmDocumentControlReferencesViewModel;
}

// ---------------------------------------------------------------------------
// Module-local label maps and copy
// ---------------------------------------------------------------------------

const PRIORITY_OWNERSHIP_CAPTION =
  'Priority Actions remains its own surface. The entries below are candidate signals only — nothing is created or mutated here.';
const READINESS_OWNERSHIP_CAPTION =
  'Project Readiness retains its scoring doctrine. The signals below are source-lineage references from responsibility-matrix.';
const APPROVALS_OWNERSHIP_CAPTION =
  'Approval execution is owned by Wave 14. The entries below are reference descriptors only — no approval is requested or executed here.';
const TEAM_ACCESS_OWNERSHIP_CAPTION =
  'Team & Access remains the roster and access owner. The entries below are role and person references read from this envelope only — no roster, permission, Teams, or SharePoint group is mutated here.';
const DOCUMENT_CONTROL_OWNERSHIP_CAPTION =
  'HB Document Control Center retains evidence-binary ownership. The entries below are reference descriptors only — no upload, download, sync, mirror, or storage is performed here.';

const PRIORITY_EMPTY_CAPTION =
  'No priority-action candidate signals derived from the current envelope.';
const APPROVALS_EMPTY_CAPTION =
  'No approval-related workflow steps derived from the current envelope.';
const TEAM_ACCESS_EMPTY_CAPTION = 'No role or person references derived from the current envelope.';
const DOCUMENT_CONTROL_EMPTY_CAPTION = 'No evidence references derived from the current envelope.';

const EXCEPTION_CODE_LABELS: Readonly<Record<ResponsibilityExceptionCode, string>> = {
  MISSING_ACCOUNTABLE_OWNER: 'Missing accountable owner',
  // The "missing responsible" condition is intentionally derived from this
  // code plus an absent currentActionOwner. The label says so explicitly.
  MISSING_CURRENT_ACTION_OWNER:
    'Missing current action owner / responsible action owner unresolved',
  OVERDUE_ACTION: 'Overdue current action',
  CONFLICTING_ASSIGNMENTS: 'Conflicting assignments',
  UNRESOLVED_CONTRACT_PARTY_MAPPING: 'Unresolved contract-party mapping',
  MISSING_REQUIRED_EVIDENCE_REFERENCE: 'Evidence reference missing',
  ROLE_VACANT: 'Role vacant',
  PERSON_INACTIVE: 'Person inactive',
  HANDOFF_REQUIRED: 'Handoff required',
  OWNER_CONTRACT_AMBIGUITY: 'Owner-contract ambiguity',
};

const EXCEPTION_CODE_CAPTIONS: Readonly<Record<ResponsibilityExceptionCode, string>> = {
  MISSING_ACCOUNTABLE_OWNER:
    'Active operational item has no accountable owner. Candidate Priority Action signal — assign accountable owner.',
  MISSING_CURRENT_ACTION_OWNER:
    'Current action owner not assigned for an active item; the responsible action owner is unresolved. Candidate Priority Action signal — assign current action owner.',
  OVERDUE_ACTION:
    'Required action is past due. Candidate Priority Action signal — review schedule and reassign or extend.',
  CONFLICTING_ASSIGNMENTS:
    'Conflicting assignments detected. Candidate Priority Action signal — reconcile assignment ownership.',
  UNRESOLVED_CONTRACT_PARTY_MAPPING:
    'Contract-party mapping is unresolved. Candidate Priority Action signal — review contract-party policy with legal/contract owner.',
  MISSING_REQUIRED_EVIDENCE_REFERENCE:
    'Required evidence reference is missing. Candidate Priority Action signal — link evidence in HB Document Control Center.',
  ROLE_VACANT:
    'Role currently has no active person assigned. Candidate Priority Action signal — staff role through Team & Access.',
  PERSON_INACTIVE:
    'Assigned person is inactive in the roster. Candidate Priority Action signal — reassign through Team & Access.',
  HANDOFF_REQUIRED:
    'Handoff requested but not yet accepted. Candidate Priority Action signal — review handoff status.',
  OWNER_CONTRACT_AMBIGUITY:
    'Owner-contract placeholder pending governed activation. Candidate Priority Action signal — schedule legal/contract review.',
};

const SEVERITY_LABELS: Readonly<Record<ResponsibilityCriticality, string>> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const STEP_TYPE_LABELS: Readonly<Record<ResponsibilityWorkflowStepType, string>> = {
  review: 'Review',
  approval: 'Approval',
  decision: 'Decision',
  'sign-off': 'Sign-off',
};

const EVIDENCE_STATUS_LABELS: Readonly<Record<ResponsibilityEvidenceLinkState, string>> = {
  present: 'Present',
  expected: 'Expected',
  missing: 'Missing',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_RANK: Readonly<Record<ResponsibilityCriticality, number>> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function maxSeverity(
  a: ResponsibilityCriticality,
  b: ResponsibilityCriticality,
): ResponsibilityCriticality {
  return SEVERITY_RANK[b] > SEVERITY_RANK[a] ? b : a;
}

// ---------------------------------------------------------------------------
// Lane mappers
// ---------------------------------------------------------------------------

function buildPriorityActionsCandidates(
  data: PccResponsibilityMatrixReadModel,
): IPccRmPriorityActionsCandidatesViewModel {
  const grouped = new Map<
    ResponsibilityExceptionCode,
    {
      count: number;
      severityHighest: ResponsibilityCriticality;
      relatedInstanceIds: Set<string>;
    }
  >();

  for (const ex of data.exceptions) {
    const existing = grouped.get(ex.code);
    if (!existing) {
      grouped.set(ex.code, {
        count: 1,
        severityHighest: ex.severity,
        relatedInstanceIds: new Set(ex.relatedItemId ? [ex.relatedItemId] : []),
      });
      continue;
    }
    existing.count += 1;
    existing.severityHighest = maxSeverity(existing.severityHighest, ex.severity);
    if (ex.relatedItemId) existing.relatedInstanceIds.add(ex.relatedItemId);
  }

  const groups: IPccRmPriorityActionCandidateGroup[] = Array.from(grouped.entries()).map(
    ([code, info]) => ({
      code,
      codeLabel: EXCEPTION_CODE_LABELS[code],
      count: info.count,
      severityHighest: info.severityHighest,
      severityLabel: SEVERITY_LABELS[info.severityHighest],
      relatedInstanceIds: Array.from(info.relatedInstanceIds),
      captionText: EXCEPTION_CODE_CAPTIONS[code],
    }),
  );

  return {
    groups,
    ownershipCaption: PRIORITY_OWNERSHIP_CAPTION,
    emptyCaption: PRIORITY_EMPTY_CAPTION,
  };
}

function buildReadinessSignals(
  data: PccResponsibilityMatrixReadModel,
): IPccRmReadinessSignalsViewModel {
  const entries: IPccRmReadinessSignalEntry[] = [];

  if (data.healthScore.state === 'computed') {
    entries.push({
      kind: 'open-critical-exceptions',
      kindLabel: 'Open critical exceptions',
      count: data.healthScore.openCriticalExceptions,
      severityLabel:
        data.healthScore.openCriticalExceptions > 0
          ? SEVERITY_LABELS.critical
          : SEVERITY_LABELS.low,
      captionText:
        data.healthScore.openCriticalExceptions > 0
          ? 'Critical exceptions are open. Project Readiness should treat this lane as elevated severity.'
          : 'No critical exceptions reported.',
    });
    entries.push({
      kind: 'decision-rights-gap',
      kindLabel: 'Decision-rights gap',
      count: data.healthScore.unresolvedDecisionRightsGaps,
      severityLabel:
        data.healthScore.unresolvedDecisionRightsGaps > 0
          ? SEVERITY_LABELS.high
          : SEVERITY_LABELS.low,
      captionText:
        data.healthScore.unresolvedDecisionRightsGaps > 0
          ? 'Decision-rights gaps detected. Coordinate decider/recommender resolution before approval routing.'
          : 'No decision-rights gaps reported.',
    });
  } else {
    entries.push({
      kind: 'open-critical-exceptions',
      kindLabel: 'Open critical exceptions',
      count: 0,
      severityLabel: SEVERITY_LABELS.low,
      captionText:
        'Health score is insufficient-data; critical exception count cannot be derived from this envelope.',
    });
    entries.push({
      kind: 'decision-rights-gap',
      kindLabel: 'Decision-rights gap',
      count: 0,
      severityLabel: SEVERITY_LABELS.low,
      captionText:
        'Health score is insufficient-data; decision-rights gap signal cannot be derived from this envelope.',
    });
  }

  const pendingReview =
    data.sourcePosture.pendingHumanReviewCount + data.workbookSourceSummary.ambiguousItemsTotal;
  entries.push({
    kind: 'pending-human-review',
    kindLabel: 'Pending human review',
    count: pendingReview,
    severityLabel: pendingReview > 0 ? SEVERITY_LABELS.medium : SEVERITY_LABELS.low,
    captionText:
      pendingReview > 0
        ? `${data.sourcePosture.pendingHumanReviewCount} source-posture review item${
            data.sourcePosture.pendingHumanReviewCount === 1 ? '' : 's'
          } and ${data.workbookSourceSummary.ambiguousItemsTotal} ambiguous workbook row${
            data.workbookSourceSummary.ambiguousItemsTotal === 1 ? '' : 's'
          } require explicit mapping policy and human review before becoming RACI assignments.`
        : 'No items pending human review.',
  });

  entries.push({
    kind: 'source-posture',
    kindLabel: 'Source posture',
    count: data.workbookSourceSummary.ambiguousItemsTotal,
    severityLabel:
      data.sourcePosture.sourceStatus === 'available' ? SEVERITY_LABELS.low : SEVERITY_LABELS.high,
    captionText: `Workbook source status is "${data.sourcePosture.sourceStatus}". Project Readiness consumes this as the responsibility-matrix source-lineage signal.`,
  });

  return {
    sourceModuleId: 'responsibility-matrix',
    entries,
    ownershipCaption: READINESS_OWNERSHIP_CAPTION,
  };
}

function buildApprovalsReferences(
  instances: readonly IResponsibilityProjectInstanceRecord[],
): IPccRmApprovalsReferencesViewModel {
  const entries: IPccRmApprovalsReferenceEntry[] = [];
  for (const instance of instances) {
    for (const step of instance.workflowSteps ?? []) {
      const lastState = lastStepState(step);
      entries.push({
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        stepId: step.stepId,
        stepType: step.stepType,
        stepTypeLabel: STEP_TYPE_LABELS[step.stepType],
        stepStateLabel: lastState ?? 'Unknown',
      });
    }
  }
  return {
    entries,
    ownershipCaption: APPROVALS_OWNERSHIP_CAPTION,
    emptyCaption: APPROVALS_EMPTY_CAPTION,
  };
}

function lastStepState(step: IResponsibilityWorkflowStep): string | undefined {
  const last = step.statusHistory[step.statusHistory.length - 1];
  if (!last) return undefined;
  // Capitalize first letter.
  return last.state[0].toUpperCase() + last.state.slice(1);
}

function buildTeamAccessReferences(
  instances: readonly IResponsibilityProjectInstanceRecord[],
): IPccRmTeamAccessReferencesViewModel {
  const roleMap = new Map<string, { label: string; required: boolean; instanceIds: Set<string> }>();
  const personMap = new Map<
    string,
    { displayName: string; isActive: boolean; instanceIds: Set<string> }
  >();

  for (const instance of instances) {
    const role = instance.assignment.ownerRole;
    if (role) {
      const entry = roleMap.get(role.roleCode);
      if (!entry) {
        roleMap.set(role.roleCode, {
          label: role.label,
          required: role.required,
          instanceIds: new Set([instance.instanceId]),
        });
      } else {
        entry.instanceIds.add(instance.instanceId);
        // Required posture is sticky-true if any instance marks it so.
        if (role.required) entry.required = true;
      }
    }
    for (const personRef of [
      instance.assignment.accountableOwner,
      instance.assignment.currentActionOwner,
    ]) {
      if (!personRef) continue;
      const entry = personMap.get(personRef.personId);
      if (!entry) {
        personMap.set(personRef.personId, {
          displayName: personRef.displayName,
          isActive: personRef.isActive,
          instanceIds: new Set([instance.instanceId]),
        });
      } else {
        entry.instanceIds.add(instance.instanceId);
        // Inactive flag is sticky-false if any reference marks the person inactive.
        if (!personRef.isActive) entry.isActive = false;
      }
    }
  }

  const roleEntries: IPccRmTeamAccessReferenceRoleEntry[] = Array.from(roleMap.entries()).map(
    ([roleCode, info]) => ({
      roleCode,
      roleLabel: info.label,
      required: info.required,
      instanceCount: info.instanceIds.size,
    }),
  );
  const personEntries: IPccRmTeamAccessReferencePersonEntry[] = Array.from(personMap.entries()).map(
    ([personId, info]) => ({
      personId,
      displayName: info.displayName,
      isActive: info.isActive,
      instanceCount: info.instanceIds.size,
    }),
  );

  return {
    roleEntries,
    personEntries,
    ownershipCaption: TEAM_ACCESS_OWNERSHIP_CAPTION,
    emptyCaption: TEAM_ACCESS_EMPTY_CAPTION,
  };
}

function buildDocumentControlReferences(
  instances: readonly IResponsibilityProjectInstanceRecord[],
): IPccRmDocumentControlReferencesViewModel {
  const grouped = new Map<
    ResponsibilityEvidenceLinkState,
    { count: number; sourceIds: Set<string> }
  >();
  for (const instance of instances) {
    for (const link of instance.evidenceLinks ?? []) {
      const entry = grouped.get(link.status);
      if (!entry) {
        grouped.set(link.status, {
          count: 1,
          sourceIds: new Set([link.documentControlSourceId]),
        });
      } else {
        entry.count += 1;
        entry.sourceIds.add(link.documentControlSourceId);
      }
    }
  }
  const entries: IPccRmDocumentControlReferenceEntry[] = Array.from(grouped.entries()).map(
    ([status, info]) => ({
      status,
      statusLabel: EVIDENCE_STATUS_LABELS[status],
      count: info.count,
      documentControlSourceIds: Array.from(info.sourceIds),
    }),
  );
  return {
    entries,
    ownershipCaption: DOCUMENT_CONTROL_OWNERSHIP_CAPTION,
    emptyCaption: DOCUMENT_CONTROL_EMPTY_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------------

export function buildPccRmIntegrationSignalsViewModel(
  data: PccResponsibilityMatrixReadModel,
  // Reserved for forward use; Wave 11 has no live persona-driven filtering.
  _viewerPersona?: PccPersona,
): IPccRmIntegrationSignalsViewModel {
  return {
    priorityActions: buildPriorityActionsCandidates(data),
    readinessSignals: buildReadinessSignals(data),
    approvalsReferences: buildApprovalsReferences(data.projectInstances),
    teamAccessReferences: buildTeamAccessReferences(data.projectInstances),
    documentControlReferences: buildDocumentControlReferences(data.projectInstances),
  };
}
