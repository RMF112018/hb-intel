/**
 * PCC Responsibility Matrix read-model adapter (Phase 3 / Wave 11 / Prompt 05).
 *
 * Pure mapping layer. Converts a `PccResponsibilityMatrixReadModel`
 * envelope into a stable, eight-lane view-model. No React, no hooks, no
 * fetch, no client calls.
 *
 * Owner-contract lane fails closed: contract-party values not in the
 * `RESPONSIBILITY_CONTRACT_PARTIES` registry are dropped from the rendered
 * mapping list and counted under `droppedNonRegistryPartyCount` so the
 * surface never displays unknown party labels.
 */

import {
  RESPONSIBILITY_CONTRACT_PARTIES,
  type IResponsibilityAuditEvent,
  type IResponsibilityException,
  type IResponsibilityHandoff,
  type IResponsibilityMatrixSnapshot,
  type IResponsibilityProjectInstanceRecord,
  type IResponsibilityPersonRef,
  type IResponsibilityTemplateLibraryRecord,
  type IResponsibilityWorkbookSourceSummary,
  type PccPersona,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
  type PccResponsibilityMatrixReadModel,
  type ResponsibilityAssignmentLifecycleState,
  type ResponsibilityAuditEventType,
  type ResponsibilityContractParty,
  type ResponsibilityCriticality,
  type ResponsibilityExceptionCode,
  type ResponsibilityHealthBand,
  type ResponsibilityItemClassification,
  type ResponsibilityMatrixHealthScore,
  type ResponsibilitySourceMark,
  type ResponsibilitySourceSheet,
  type ResponsibilityTemplateStatus,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';
import type { PccCardState } from '../projectHome/shared.js';
import { buildPccRmIntegrationSignalsViewModel } from './integrationSignals.js';
import type {
  IPccResponsibilityMatrixViewModel,
  IPccRmAuditEventRowViewModel,
  IPccRmCountPosture,
  IPccRmExceptionGroupViewModel,
  IPccRmGapsConflictsViewModel,
  IPccRmHandoffRowViewModel,
  IPccRmHandoffsViewModel,
  IPccRmHealthBadgeViewModel,
  IPccRmItemRegisterViewModel,
  IPccRmMatrixRowViewModel,
  IPccRmMatrixViewViewModel,
  IPccRmMyResponsibilitiesViewModel,
  IPccRmMyRowViewModel,
  IPccRmOverviewViewModel,
  IPccRmOwnerContractInstanceRow,
  IPccRmOwnerContractTemplateRow,
  IPccRmOwnerContractViewModel,
  IPccRmRegisterRowViewModel,
  IPccRmSnapshotSummaryViewModel,
  IPccRmSourceTraceabilityViewModel,
  IPccRmTemplateAdminViewModel,
  IPccRmTemplateRowViewModel,
  IPccRmWhoOwnsLookupResult,
} from './responsibilityMatrixViewModel.js';

// ---------------------------------------------------------------------------
// Canonical copy
// ---------------------------------------------------------------------------

const READ_ONLY_CAPTION = 'Responsibility Matrix';
const NO_EXECUTION_CAPTION =
  'Approvals, Team & Access changes, and evidence upload are managed by your PCC administrator.';
const RACI_VS_CONTRACT_PARTY_CAPTION =
  'Contract-party "C = Contractor" is never RACI "C = Consulted". Contract party (Owner / Architect-Engineer / Contractor) and RACI (Responsible / Accountable / Consulted / Informed) are stored on independent axes.';
const EVIDENCE_REFERENCE_CAPTION =
  'Evidence is reference-only. HB Document Control Center remains the evidence source of record. No file upload, download, sync, or storage is performed here.';
const OWNER_CONTRACT_PLACEHOLDER_CAPTION =
  'Owner-contract rows remain placeholder/schema-only. There are 0 active default obligations until governed activation.';
const OWNER_CONTRACT_PLACEHOLDER_DETAIL_CAPTION =
  'Owner-contract obligations require governed legal/contract review before activation. This module does not provide legal advice and does not create or replace executed contract obligations.';
const NON_EXPLICIT_MARK_POLICY_CAPTION =
  'Workbook source marks "X", "Support", "Review", and "Sign-Off" require explicit mapping policy and human review before becoming RACI assignments. Only "R / A / C / I" map directly.';
const TEMPLATE_GOVERNANCE_CAPTION =
  'Template and source-mapping changes are governed records. Snapshots are read-only and do not amend any executed contract.';

// ---------------------------------------------------------------------------
// Vocabulary label maps (module-local; tests assert adapter outputs, not
// internal label-map shape)
// ---------------------------------------------------------------------------

const PREVIEW_TO_CARD_STATE: Readonly<Record<PccPreviewStateKind, PccCardState>> = {
  preview: 'preview',
  empty: 'empty',
  loading: 'preview',
  error: 'error',
  'missing-config': 'missing-config',
  'unavailable-fixture': 'unavailable-fixture',
  'unauthorized-persona': 'unauthorized-persona',
  'not-yet-implemented-operation': 'preview',
};

function toCardState(sourceStatus: PccReadModelSourceStatus): PccCardState {
  return PREVIEW_TO_CARD_STATE[mapPccSourceStatusToPreviewState(sourceStatus)];
}

const CONTRACT_PARTY_LABELS: Readonly<Record<ResponsibilityContractParty, string>> = {
  Owner: 'Owner',
  ArchitectEngineer: 'Architect / Engineer',
  Contractor: 'Contractor',
};

const CRITICALITY_LABELS: Readonly<Record<ResponsibilityCriticality, string>> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const CLASSIFICATION_LABELS: Readonly<Record<ResponsibilityItemClassification, string>> = {
  'active-default-item': 'Active default item',
  'ambiguous-review-required': 'Ambiguous — review required',
  'placeholder-schema-only': 'Placeholder / schema-only',
  'active-default-obligation': 'Active default obligation',
};

const LIFECYCLE_STATE_LABELS: Readonly<Record<ResponsibilityAssignmentLifecycleState, string>> = {
  created: 'Created',
  reassigned: 'Reassigned',
  'handoff-pending': 'Handoff pending',
  'handoff-accepted': 'Handoff accepted',
  unassigned: 'Unassigned',
  closed: 'Closed',
};

const EXCEPTION_CODE_LABELS: Readonly<Record<ResponsibilityExceptionCode, string>> = {
  MISSING_ACCOUNTABLE_OWNER: 'Missing accountable owner',
  MISSING_CURRENT_ACTION_OWNER: 'Missing current action owner',
  OVERDUE_ACTION: 'Overdue action',
  CONFLICTING_ASSIGNMENTS: 'Conflicting assignments',
  UNRESOLVED_CONTRACT_PARTY_MAPPING: 'Unresolved contract-party mapping',
  MISSING_REQUIRED_EVIDENCE_REFERENCE: 'Missing required evidence reference',
  ROLE_VACANT: 'Role vacant',
  PERSON_INACTIVE: 'Person inactive',
  HANDOFF_REQUIRED: 'Handoff required',
  OWNER_CONTRACT_AMBIGUITY: 'Owner-contract ambiguity',
};

const HEALTH_BAND_LABELS: Readonly<Record<ResponsibilityHealthBand, string>> = {
  healthy: 'Healthy',
  'at-risk': 'At risk',
  blocked: 'Blocked',
};

const TEMPLATE_STATUS_LABELS: Readonly<Record<ResponsibilityTemplateStatus, string>> = {
  draft: 'Draft',
  approved: 'Approved',
  retired: 'Retired',
};

const AUDIT_EVENT_TYPE_LABELS: Readonly<Record<ResponsibilityAuditEventType, string>> = {
  'template-changed': 'Template changed',
  'assignment-changed': 'Assignment changed',
  'handoff-changed': 'Handoff changed',
  'current-owner-changed': 'Current owner changed',
  'exception-changed': 'Exception changed',
  'evidence-ref-changed': 'Evidence reference changed',
  'snapshot-generated': 'Snapshot generated',
};

// Domains intentionally rendered with light human-readable transformation;
// the registry is small and label drift is unlikely.
function domainLabel(domain: string): string {
  return domain
    .split('-')
    .map((part) => (part.length === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join(' ');
}

function sourceSheetLabel(sheet: ResponsibilitySourceSheet): string {
  return sheet === 'PM' ? 'PM sheet' : sheet === 'Field' ? 'Field sheet' : 'Template sheet';
}

function formatDateDisplay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  // Slice ISO to YYYY-MM-DD (deterministic, no Date construction so tests
  // don't depend on the host time zone).
  return iso.slice(0, 10);
}

function ownerDisplay(person?: IResponsibilityPersonRef): string {
  if (!person) return 'Unassigned';
  const inactive = person.isActive ? '' : ' (inactive)';
  return `${person.displayName}${inactive}`;
}

// ---------------------------------------------------------------------------
// Lane builders
// ---------------------------------------------------------------------------

function buildHealthBadge(score: ResponsibilityMatrixHealthScore): IPccRmHealthBadgeViewModel {
  if (score.state === 'insufficient-data') {
    return {
      state: 'insufficient-data',
      badgeLabel: 'Insufficient data',
      summaryCaption: score.reason,
      insufficientReason: score.reason,
    };
  }
  return {
    state: 'computed',
    band: score.band,
    badgeLabel: HEALTH_BAND_LABELS[score.band],
    summaryCaption:
      score.band === 'healthy'
        ? 'Responsibility posture is healthy. Continue routine governance.'
        : score.band === 'at-risk'
          ? 'Responsibility posture is at risk. Review the gaps & conflicts lane for triage.'
          : 'Responsibility posture is blocked. Critical exceptions require immediate ownership review.',
    counts: {
      openCriticalExceptions: score.openCriticalExceptions,
      overdueActions: score.overdueActions,
      missingAccountableOwners: score.missingAccountableOwners,
      missingCurrentActionOwners: score.missingCurrentActionOwners,
      pendingEvidence: score.pendingEvidence,
      unresolvedDecisionRightsGaps: score.unresolvedDecisionRightsGaps,
    },
  };
}

function buildCountPosture(summary: IResponsibilityWorkbookSourceSummary): IPccRmCountPosture {
  const headlineCaption = `${summary.defaultItemsTotal} workbook task-row context · ${summary.strictMarkedRows} strict marked assignment rows · ${summary.ownerContractActiveDefaultObligations} owner-contract active default obligations`;
  const explanationCaption = `${summary.defaultItemsTotal} is workbook-derived task-row context (${summary.pmItems} PM + ${summary.fieldItems} Field), not a count of final active assignments. ${summary.strictMarkedRows} reflects strict marked assignment-row posture. ${summary.ambiguousItemsTotal} ambiguous rows require human review. Owner-contract active default obligations remain ${summary.ownerContractActiveDefaultObligations} until governed activation.`;
  return {
    defaultItemsTotal: summary.defaultItemsTotal,
    pmItems: summary.pmItems,
    fieldItems: summary.fieldItems,
    strictMarkedRows: summary.strictMarkedRows,
    ambiguousItemsTotal: summary.ambiguousItemsTotal,
    ownerContractActiveDefaultObligations: summary.ownerContractActiveDefaultObligations,
    headlineCaption,
    explanationCaption,
    sourceFiles: summary.sourceFiles,
  };
}

function buildSourceTraceability(
  data: PccResponsibilityMatrixReadModel,
): IPccRmSourceTraceabilityViewModel {
  const posture = data.sourcePosture;
  const confidenceLabel = posture.confidence
    ? `${posture.confidence[0].toUpperCase()}${posture.confidence.slice(1)}`
    : 'Unknown';
  const lastIngestedDisplay = posture.lastIngestedAtUtc
    ? `Last ingested ${formatDateDisplay(posture.lastIngestedAtUtc)}`
    : 'Never ingested';
  return {
    sourceStatus: posture.sourceStatus,
    confidenceLabel,
    lastIngestedDisplay,
    pendingHumanReviewCount: posture.pendingHumanReviewCount,
    traceabilityCaption: `Source posture is "${posture.sourceStatus}". ${posture.pendingHumanReviewCount} item${posture.pendingHumanReviewCount === 1 ? '' : 's'} pending human review.`,
  };
}

function buildSnapshotSummary(
  history: readonly IResponsibilityMatrixSnapshot[],
): IPccRmSnapshotSummaryViewModel | undefined {
  if (history.length === 0) return undefined;
  const latest = history[history.length - 1];
  return {
    snapshotId: latest.snapshotId,
    generatedAtDisplay: formatDateDisplay(latest.generatedAtUtc) ?? '',
    summary: latest.summary,
    readOnlyBadge: 'Read-only governed snapshot',
  };
}

function buildWhoOwnsResults(
  instances: readonly IResponsibilityProjectInstanceRecord[],
): readonly IPccRmWhoOwnsLookupResult[] {
  const out: IPccRmWhoOwnsLookupResult[] = [];
  for (const instance of instances) {
    const role = instance.assignment.ownerRole;
    if (instance.assignment.accountableOwner) {
      out.push({
        key: `${instance.instanceId}:accountable`,
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        roleCode: role?.roleCode ?? '—',
        roleLabel: role?.label ?? 'Role unassigned',
        personId: instance.assignment.accountableOwner.personId,
        personDisplayName: instance.assignment.accountableOwner.displayName,
        personIsActive: instance.assignment.accountableOwner.isActive,
        accountabilityKind: 'accountable',
      });
    }
    if (instance.assignment.currentActionOwner) {
      out.push({
        key: `${instance.instanceId}:current-action`,
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        roleCode: role?.roleCode ?? '—',
        roleLabel: role?.label ?? 'Role unassigned',
        personId: instance.assignment.currentActionOwner.personId,
        personDisplayName: instance.assignment.currentActionOwner.displayName,
        personIsActive: instance.assignment.currentActionOwner.isActive,
        accountabilityKind: 'current-action',
      });
    }
    if (role && !instance.assignment.accountableOwner && !instance.assignment.currentActionOwner) {
      out.push({
        key: `${instance.instanceId}:owner-role`,
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        roleCode: role.roleCode,
        roleLabel: role.label,
        accountabilityKind: 'owner-role',
      });
    }
  }
  return out;
}

function buildOverview(data: PccResponsibilityMatrixReadModel): IPccRmOverviewViewModel {
  return {
    readOnlyCaption: READ_ONLY_CAPTION,
    noExecutionCaption: NO_EXECUTION_CAPTION,
    healthBadge: buildHealthBadge(data.healthScore),
    countPosture: buildCountPosture(data.workbookSourceSummary),
    sourceTraceability: buildSourceTraceability(data),
    snapshotSummary: buildSnapshotSummary(data.snapshotHistory),
    raciVsContractPartyCaption: RACI_VS_CONTRACT_PARTY_CAPTION,
    evidenceReferenceCaption: EVIDENCE_REFERENCE_CAPTION,
    whoOwnsResults: buildWhoOwnsResults(data.projectInstances),
  };
}

function buildMatrixView(
  instances: readonly IResponsibilityProjectInstanceRecord[],
): IPccRmMatrixViewViewModel {
  const rows: IPccRmMatrixRowViewModel[] = instances.map((instance) => {
    const accountable = instance.assignment.accountableOwner;
    const current = instance.assignment.currentActionOwner;
    const ballInCourtCaption = current
      ? `Ball-in-court: ${current.displayName}`
      : accountable
        ? `Ball-in-court: awaiting reassignment (accountable owner ${accountable.displayName})`
        : 'Ball-in-court: unassigned';
    return {
      instanceId: instance.instanceId,
      sourceTask: instance.sourceTask,
      classification: instance.classification,
      classificationLabel: CLASSIFICATION_LABELS[instance.classification],
      criticality: instance.criticality,
      criticalityLabel: CRITICALITY_LABELS[instance.criticality],
      domainLabel: domainLabel(instance.domain),
      accountableOwnerDisplay: ownerDisplay(accountable),
      currentActionOwnerDisplay: ownerDisplay(current),
      ballInCourtCaption,
      hasOpenException: instance.exceptions.length > 0,
    };
  });
  return {
    rows,
    emptyCaption: 'No project instances available for the matrix preview.',
    toggleLabelRoleMode: 'Role view',
    toggleLabelPersonMode: 'Person view',
  };
}

function evidenceStatusSummary(instance: IResponsibilityProjectInstanceRecord): string {
  const links = instance.evidenceLinks ?? [];
  if (links.length === 0) return 'No evidence references recorded';
  const counts = { present: 0, expected: 0, missing: 0 };
  for (const link of links) counts[link.status] += 1;
  return `${counts.present} present · ${counts.expected} expected · ${counts.missing} missing`;
}

function buildItemRegister(
  instances: readonly IResponsibilityProjectInstanceRecord[],
  templates: readonly IResponsibilityTemplateLibraryRecord[],
): IPccRmItemRegisterViewModel {
  const templateById = new Map(templates.map((t) => [t.templateItemId, t]));
  const rows: IPccRmRegisterRowViewModel[] = instances.map((instance) => {
    const template = templateById.get(instance.templateItemId);
    return {
      instanceId: instance.instanceId,
      sourceTask: instance.sourceTask,
      classification: instance.classification,
      classificationLabel: CLASSIFICATION_LABELS[instance.classification],
      criticalityLabel: CRITICALITY_LABELS[instance.criticality],
      domainLabel: domainLabel(instance.domain),
      currentActionOwnerDisplay: ownerDisplay(instance.assignment.currentActionOwner),
      dueDateDisplay: formatDateDisplay(instance.assignment.dueDateUtc),
      isOverdue: instance.assignment.isOverdue,
      lifecycleState: instance.assignment.lifecycleState,
      lifecycleStateLabel: LIFECYCLE_STATE_LABELS[instance.assignment.lifecycleState],
      exceptionCodes: instance.exceptions.map((e) => e.code),
      evidenceStatusSummary: evidenceStatusSummary(instance),
      templateItemId: template?.templateItemId ?? instance.templateItemId,
      templateVersion: template?.templateVersion ?? instance.templateVersion,
    };
  });
  return {
    rows,
    emptyCaption: 'No items in the project register.',
  };
}

function isKnownContractParty(value: string): value is ResponsibilityContractParty {
  return (RESPONSIBILITY_CONTRACT_PARTIES as readonly string[]).includes(value);
}

function buildOwnerContract(data: PccResponsibilityMatrixReadModel): IPccRmOwnerContractViewModel {
  const templateRows: IPccRmOwnerContractTemplateRow[] = [];
  let droppedNonRegistryPartyCount = 0;
  for (const t of data.templates) {
    const mapping = t.baselineContractPartyMapping;
    if (!mapping) continue;
    if (!isKnownContractParty(mapping.contractParty)) {
      droppedNonRegistryPartyCount += 1;
      continue;
    }
    templateRows.push({
      templateItemId: t.templateItemId,
      sourceTask: t.sourceTask,
      contractParty: mapping.contractParty,
      contractPartyLabel: CONTRACT_PARTY_LABELS[mapping.contractParty],
      mappingNotes: mapping.mappingNotes,
      requiresUserReview: mapping.requiresUserReview,
      obligationSummary: t.obligationRef?.obligationSummary,
      contractDocumentRef: t.obligationRef?.contractDocumentRef,
      articleSection: t.obligationRef?.articleSection,
    });
  }

  const instanceRows: IPccRmOwnerContractInstanceRow[] = data.projectInstances
    .filter(
      (i) =>
        i.classification === 'placeholder-schema-only' ||
        i.assignment.sharedAccountabilityException !== undefined,
    )
    .map((i) => ({
      instanceId: i.instanceId,
      sourceTask: i.sourceTask,
      classification: i.classification,
      sharedExceptionReason:
        i.assignment.sharedAccountabilityException?.reason ??
        'Owner-contract placeholder pending governed activation.',
    }));

  return {
    placeholderCaption: OWNER_CONTRACT_PLACEHOLDER_CAPTION,
    placeholderDetailCaption: OWNER_CONTRACT_PLACEHOLDER_DETAIL_CAPTION,
    raciVsContractPartyCaption: RACI_VS_CONTRACT_PARTY_CAPTION,
    activeDefaultObligationsCount: data.workbookSourceSummary.ownerContractActiveDefaultObligations,
    templateRows,
    instanceRows,
    droppedNonRegistryPartyCount,
  };
}

function describeWorkflowStep(
  instance: IResponsibilityProjectInstanceRecord,
  viewerPersona: PccPersona | undefined,
): string | undefined {
  // Wave 11 is read-only; persona-based filtering is not gated on a Team &
  // Access roster lookup — we simply surface the first pending step on the
  // instance for the viewer's awareness.
  void viewerPersona;
  const step = (instance.workflowSteps ?? []).find((s) => {
    const last = s.statusHistory[s.statusHistory.length - 1];
    return last && last.state !== 'completed' && last.state !== 'skipped';
  });
  if (!step) return undefined;
  return `Pending ${step.stepType} step ${step.stepId}`;
}

function describePendingHandoff(
  instance: IResponsibilityProjectInstanceRecord,
): string | undefined {
  const handoff = (instance.handoffs ?? []).find((h) => !h.accepted);
  if (!handoff) return undefined;
  const from = handoff.fromPerson?.displayName ?? 'Unassigned';
  const to = handoff.toPerson?.displayName ?? 'Unassigned';
  return `Pending handoff: ${from} → ${to}`;
}

function buildMyResponsibilities(
  instances: readonly IResponsibilityProjectInstanceRecord[],
  viewerPersona: PccPersona | undefined,
): IPccRmMyResponsibilitiesViewModel {
  // Wave 11 has no live Team & Access roster lookup; we render every
  // instance with an accountable or current-action owner as a personal
  // candidate row. The viewer-persona caption documents the posture.
  const rows: IPccRmMyRowViewModel[] = [];
  for (const instance of instances) {
    if (instance.assignment.accountableOwner) {
      rows.push({
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        accountabilityKind: 'accountable',
        dueDateDisplay: formatDateDisplay(instance.assignment.dueDateUtc),
        isOverdue: instance.assignment.isOverdue,
        pendingHandoffSummary: describePendingHandoff(instance),
        pendingWorkflowStepSummary: describeWorkflowStep(instance, viewerPersona),
      });
    }
    if (instance.assignment.currentActionOwner) {
      rows.push({
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        accountabilityKind: 'current-action',
        dueDateDisplay: formatDateDisplay(instance.assignment.dueDateUtc),
        isOverdue: instance.assignment.isOverdue,
        pendingHandoffSummary: describePendingHandoff(instance),
        pendingWorkflowStepSummary: describeWorkflowStep(instance, viewerPersona),
      });
    }
  }
  return {
    viewerPersona,
    viewerPersonaCaption: viewerPersona
      ? `Showing accountable and current-action assignments for viewer persona "${viewerPersona}".`
      : 'No viewer persona selected. Showing all accountable and current-action candidates.',
    rows,
    emptyCaption:
      'No accountable or current-action assignments found. Assignments will appear once data is available.',
  };
}

function pickMaxSeverity(
  a: ResponsibilityCriticality,
  b: ResponsibilityCriticality,
): ResponsibilityCriticality {
  const order: Record<ResponsibilityCriticality, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return order[b] > order[a] ? b : a;
}

function buildGapsConflicts(data: PccResponsibilityMatrixReadModel): IPccRmGapsConflictsViewModel {
  const grouped = new Map<ResponsibilityExceptionCode, IResponsibilityException[]>();
  for (const ex of data.exceptions) {
    const list = grouped.get(ex.code) ?? [];
    list.push(ex);
    grouped.set(ex.code, list);
  }
  const groups: IPccRmExceptionGroupViewModel[] = Array.from(grouped.entries()).map(
    ([code, entries]) => {
      let severityHighest: ResponsibilityCriticality = 'low';
      for (const e of entries) severityHighest = pickMaxSeverity(severityHighest, e.severity);
      return {
        code,
        codeLabel: EXCEPTION_CODE_LABELS[code],
        severityHighest,
        count: entries.length,
        entries: entries.map((e) => ({
          summary: e.summary,
          severity: e.severity,
          relatedItemId: e.relatedItemId,
        })),
      };
    },
  );

  let unresolvedDecisionRightsGapsCaption = 'No unresolved decision-rights gaps reported.';
  if (data.healthScore.state === 'computed') {
    const n = data.healthScore.unresolvedDecisionRightsGaps;
    unresolvedDecisionRightsGapsCaption =
      n === 0
        ? 'No unresolved decision-rights gaps reported.'
        : `${n} unresolved decision-rights gap${n === 1 ? '' : 's'} flagged.`;
  } else {
    unresolvedDecisionRightsGapsCaption =
      'Decision-rights gap signal unavailable while health score is insufficient.';
  }

  return {
    groups,
    unresolvedDecisionRightsGapsCaption,
    emptyCaption: 'No exceptions in the current preview.',
  };
}

function buildHandoffs(
  instances: readonly IResponsibilityProjectInstanceRecord[],
): IPccRmHandoffsViewModel {
  const rows: IPccRmHandoffRowViewModel[] = [];
  for (const instance of instances) {
    for (const h of instance.handoffs ?? []) {
      rows.push({
        handoffId: h.handoffId,
        instanceId: instance.instanceId,
        sourceTask: instance.sourceTask,
        fromDisplay: ownerDisplay(h.fromPerson),
        toDisplay: ownerDisplay(h.toPerson),
        requestedAtDisplay: formatDateDisplay(h.requestedAtUtc) ?? '',
        accepted: h.accepted,
        statusLabel: h.accepted ? 'Accepted' : 'Pending acceptance',
        reason: h.reason,
        lifecycleState: instance.assignment.lifecycleState,
        lifecycleStateLabel: LIFECYCLE_STATE_LABELS[instance.assignment.lifecycleState],
      });
    }
  }
  return {
    rows,
    emptyCaption: 'No handoffs requested in the current preview.',
  };
}

function buildTemplateAdmin(data: PccResponsibilityMatrixReadModel): IPccRmTemplateAdminViewModel {
  const templates: IPccRmTemplateRowViewModel[] = data.templates.map((t) => ({
    templateItemId: t.templateItemId,
    templateVersion: t.templateVersion,
    status: t.status,
    statusLabel: TEMPLATE_STATUS_LABELS[t.status],
    classification: t.classification,
    classificationLabel: CLASSIFICATION_LABELS[t.classification],
    domainLabel: domainLabel(t.domain),
    criticalityLabel: CRITICALITY_LABELS[t.criticality],
    sourceFile: t.sourceSnapshot.sourceFile,
    sourceSheet: sourceSheetLabel(t.sourceSnapshot.sourceSheet),
    sourceMarksDisplay: formatSourceMarks(t.sourceSnapshot.sourceMarks),
    requiresUserReview: t.sourceSnapshot.requiresUserReview,
    mappingNotes: t.sourceSnapshot.mappingNotes,
    effectiveDateDisplay: formatDateDisplay(t.effectiveDateUtc),
  }));

  const auditEvents: IPccRmAuditEventRowViewModel[] = data.auditEvents.map((e) => ({
    eventId: e.eventId,
    eventTypeLabel: AUDIT_EVENT_TYPE_LABELS[e.eventType],
    occurredAtDisplay: formatDateDisplay(e.occurredAtUtc) ?? '',
    entityRef: e.entityRef,
    summary: e.summary,
    actorDisplay: e.actor?.displayName,
  }));

  return {
    templates,
    auditEvents,
    governanceCaption: TEMPLATE_GOVERNANCE_CAPTION,
    nonExplicitMarkPolicyCaption: NON_EXPLICIT_MARK_POLICY_CAPTION,
  };
}

function formatSourceMarks(marks: readonly ResponsibilitySourceMark[]): string {
  if (marks.length === 0) return '—';
  return marks.join(' · ');
}

// ---------------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------------

export function buildPccResponsibilityMatrixViewModel(
  envelope: PccReadModelEnvelope<PccResponsibilityMatrixReadModel>,
): IPccResponsibilityMatrixViewModel {
  const sourceStatus = envelope.sourceStatus;
  const cardState = toCardState(sourceStatus);
  const data = envelope.data;
  const viewerPersona = envelope.viewerPersona;
  return {
    status: 'ready',
    cardState,
    sourceStatus,
    overview: buildOverview(data),
    matrixView: buildMatrixView(data.projectInstances),
    itemRegister: buildItemRegister(data.projectInstances, data.templates),
    ownerContract: buildOwnerContract(data),
    myResponsibilities: buildMyResponsibilities(data.projectInstances, viewerPersona),
    gapsConflicts: buildGapsConflicts(data),
    handoffs: buildHandoffs(data.projectInstances),
    templateAdmin: buildTemplateAdmin(data),
    integrationSignals: buildPccRmIntegrationSignalsViewModel(data, viewerPersona),
  };
}

// Re-export model types used by lane card components.
export type {
  IResponsibilityAuditEvent,
  IResponsibilityException,
  IResponsibilityHandoff,
  IResponsibilityMatrixSnapshot,
  IResponsibilityProjectInstanceRecord,
  IResponsibilityTemplateLibraryRecord,
  IResponsibilityWorkbookSourceSummary,
};
