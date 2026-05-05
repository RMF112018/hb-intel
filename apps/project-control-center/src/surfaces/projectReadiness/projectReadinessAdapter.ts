/**
 * Project Readiness Center read-model adapter (Phase 3 / Wave 8 / Prompt 05).
 *
 * Pure mapping layer. Converts a `PccProjectReadinessFrameworkReadModel`
 * envelope into a stable, six-region view model. No React, no hooks, no
 * fetch, no client calls. The single `src/api/` import is the named
 * helper `mapPccSourceStatusToPreviewState`; the controlled-consumption
 * guard encodes a narrow exception for this file + identifier + path.
 *
 * For non-`available` `sourceStatus` values, the adapter returns a safe
 * preview-shaped view model with empty arrays and pass-through
 * `sourceStatus`. It does not throw and does not leave undefined slots.
 */

import {
  PROJECT_READINESS_DOMAINS,
  PROJECT_READINESS_LIFECYCLE_GATES,
  PROJECT_READINESS_SOURCE_MODULES,
} from '@hbc/models/pcc';
import type {
  IProjectReadinessBlockerSummary,
  IProjectReadinessDomainSummary,
  IProjectReadinessEvidenceSummary,
  IProjectReadinessFrameworkSnapshot,
  IProjectReadinessGateSummary,
  IProjectReadinessItem,
  IProjectReadinessSourceHealthSummary,
  PccApprovalsReadModel,
  PccPersona,
  PccProjectReadinessFrameworkReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  ProjectReadinessConfidenceState,
  ProjectReadinessDomainId,
  ProjectReadinessLifecycleGateId,
  ProjectReadinessPosture,
  ProjectReadinessSourceModuleId,
} from '@hbc/models/pcc';
import { buildApprovalsReadinessReferences } from '../../viewModels/approvalsReadinessReferencesAdapter.js';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';
import type { PccCardState } from '../projectHome/shared.js';
import type {
  IPccProjectReadinessViewModel,
  IPccReadinessBlockerItemViewModel,
  IPccReadinessDomainViewModel,
  IPccReadinessDownstreamModuleViewModel,
  IPccReadinessDownstreamWaveStatus,
  IPccReadinessEvidenceStateBucket,
  IPccReadinessEvidenceViewModel,
  IPccReadinessGateViewModel,
  IPccReadinessHeroViewModel,
  IPccReadinessOwnershipAccountabilityViewModel,
  IPccReadinessOwnershipEntryViewModel,
  IPccReadinessPriorityActionEligibilityItem,
  IPccReadinessPriorityActionsPreviewViewModel,
  IPccReadinessSourceHealthBadge,
  IPccReadinessSourceHealthEntry,
  ProjectReadinessRiskTag,
} from './projectReadinessViewModel.js';

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

const LIFECYCLE_GATE_LABELS: Readonly<Record<ProjectReadinessLifecycleGateId, string>> = {
  'lead-pursuit': 'Lead / Pursuit',
  estimating: 'Estimating',
  preconstruction: 'Preconstruction',
  'turnover-to-operations': 'Turnover to Operations',
  'startup-mobilization': 'Startup / Mobilization',
  'active-construction': 'Active Construction',
  'closeout-planning': 'Closeout Planning',
  'substantial-completion': 'Substantial Completion',
  'turnover-warranty': 'Turnover / Warranty',
  'archived-lessons-learned': 'Archived / Lessons Learned',
};

const DOMAIN_LABELS: Readonly<Record<ProjectReadinessDomainId, string>> = {
  'project-setup': 'Project Setup',
  'team-and-access': 'Team and Access',
  'documents-project-record': 'Documents / Project Record',
  'startup-mobilization': 'Startup / Mobilization',
  'safety-qaqc': 'Safety / QAQC',
  'permits-jurisdiction': 'Permits / Jurisdiction',
  'procurement-buyout': 'Procurement / Buyout',
  'responsibility-raci': 'Responsibility / RACI',
  constraints: 'Constraints',
  'schedule-milestones': 'Schedule / Milestones',
  'financial-accounting-setup': 'Financial / Accounting Setup',
  'external-systems': 'External Systems',
  'site-health': 'Site Health',
  'closeout-turnover': 'Closeout / Turnover',
};

interface IDownstreamModuleSpec {
  readonly label: string;
  readonly waveLabel: string;
  readonly waveStatus: IPccReadinessDownstreamWaveStatus;
  readonly statusCaption: string;
}

const DOWNSTREAM_MODULE_REGISTRY: Readonly<
  Record<ProjectReadinessSourceModuleId, IDownstreamModuleSpec>
> = {
  'team-access': {
    label: 'Team and Access',
    waveLabel: 'Wave 6',
    waveStatus: 'implemented',
    statusCaption: 'Team and access governance is live as the Wave 6 surface.',
  },
  'document-control': {
    label: 'HB Document Control Center',
    waveLabel: 'Wave 7',
    waveStatus: 'implemented',
    statusCaption: 'Document control is live as the Wave 7 surface.',
  },
  'project-lifecycle-readiness': {
    label: 'Project Lifecycle Readiness Center',
    waveLabel: 'Wave 9',
    waveStatus: 'preview-deferred',
    statusCaption: 'Wave 9 — checklist item libraries begin in Wave 9. Not implemented in Wave 8.',
  },
  'permit-log': {
    label: 'Permit & Inspection Control Center',
    waveLabel: 'Wave 10',
    waveStatus: 'implemented',
    statusCaption: 'Permit & Inspection Control Center is live as the Wave 10 module.',
  },
  'responsibility-matrix': {
    label: 'Responsibility Matrix / RACI',
    waveLabel: 'Wave 11',
    waveStatus: 'implemented',
    statusCaption:
      'Wave 11 — Responsibility Matrix is live as the embedded module under Project Readiness.',
  },
  'constraints-log': {
    label: 'Constraints Log',
    waveLabel: 'Wave 12',
    waveStatus: 'preview-deferred',
    statusCaption: 'Wave 12 — Constraints Log is deferred. Not implemented in Wave 8.',
  },
  'buyout-log': {
    label: 'Buyout Log',
    waveLabel: 'Wave 13',
    waveStatus: 'implemented',
    statusCaption:
      'Wave 13 — Buyout Log / Buyout Control Center is live as the embedded Project Readiness module.',
  },
  'approvals-checkpoints': {
    label: 'Approvals / Checkpoints',
    waveLabel: 'Wave 14',
    waveStatus: 'preview-deferred',
    statusCaption: 'Wave 14 — Approvals runtime is deferred. Not implemented in Wave 8.',
  },
  'external-systems': {
    label: 'External Systems',
    waveLabel: 'Wave 15',
    waveStatus: 'implemented',
    statusCaption:
      'Wave 15 — External Systems Launch Pad is implemented as a read-only / metadata-only PCC surface. No live external-system API or runtime is enabled.',
  },
  'site-health': {
    label: 'Site Health',
    waveLabel: 'Site Health surface',
    waveStatus: 'implemented',
    statusCaption: 'Site Health is live as the dedicated PCC surface.',
  },
};

const READ_ONLY_BADGE_TEXT = 'Read-only readiness framework preview';
const NO_EXECUTION_CAPTION = 'No workflow execution is enabled in Wave 8.';
const DOCUMENT_CONTROL_REFERENCE_CAPTION =
  'Evidence links are references only; HB Document Control Center remains the evidence source of record.';

const EMPTY_HERO: IPccReadinessHeroViewModel = {
  activeLifecycleGate: 'preconstruction',
  activeLifecycleGateLabel: LIFECYCLE_GATE_LABELS['preconstruction'],
  overallPosture: 'unknown',
  blockerCount: 0,
  evidenceConfidence: 'unknown',
  sourceHealthBadges: [],
  readOnlyBadgeText: READ_ONLY_BADGE_TEXT,
  noExecutionCaption: NO_EXECUTION_CAPTION,
};

function findDomainSummary(
  summaries: readonly IProjectReadinessDomainSummary[],
  domain: ProjectReadinessDomainId,
): IProjectReadinessDomainSummary | undefined {
  return summaries.find((s) => s.domain === domain);
}

function findGateSummary(
  summaries: readonly IProjectReadinessGateSummary[],
  gate: ProjectReadinessLifecycleGateId,
): IProjectReadinessGateSummary | undefined {
  return summaries.find((s) => s.lifecycleGate === gate);
}

function buildLifecycleGates(
  snapshot: IProjectReadinessFrameworkSnapshot,
  activeGate: ProjectReadinessLifecycleGateId,
): readonly IPccReadinessGateViewModel[] {
  return PROJECT_READINESS_LIFECYCLE_GATES.map((gate) => {
    const summary = findGateSummary(snapshot.gateSummaries, gate);
    const posture: ProjectReadinessPosture = summary?.posture ?? 'not-started';
    return {
      lifecycleGate: gate,
      label: LIFECYCLE_GATE_LABELS[gate],
      posture,
      itemCount: summary?.itemIds.length ?? 0,
      openBlockerCount: summary?.openBlockerCount ?? 0,
      pendingEvidenceCount: summary?.pendingEvidenceCount ?? 0,
      isActive: gate === activeGate,
    };
  });
}

function buildDomains(
  snapshot: IProjectReadinessFrameworkSnapshot,
): readonly IPccReadinessDomainViewModel[] {
  return PROJECT_READINESS_DOMAINS.map((domain) => {
    const summary = findDomainSummary(snapshot.domainSummaries, domain);
    const posture: ProjectReadinessPosture = summary?.posture ?? 'not-started';
    const confidence: ProjectReadinessConfidenceState = summary?.confidence ?? 'unknown';
    return {
      domain,
      label: DOMAIN_LABELS[domain],
      posture,
      itemCount: summary?.itemIds.length ?? 0,
      openBlockerCount: summary?.openBlockerCount ?? 0,
      pendingEvidenceCount: summary?.pendingEvidenceCount ?? 0,
      confidence,
    };
  });
}

function isBlockerCandidate(item: IProjectReadinessItem): boolean {
  if (item.posture === 'blocked' || item.posture === 'at-risk') return true;
  if (item.blockerState !== 'none' && item.blockerState !== 'resolved') return true;
  return false;
}

function deriveRiskTag(item: IProjectReadinessItem): ProjectReadinessRiskTag {
  if (item.severity === 'critical') return 'critical-blocker';
  if (item.blockerState === 'escalated' || item.blockerState === 'open') return 'open-blocker';
  if (item.severity === 'high' || item.posture === 'at-risk') return 'at-risk-warning';
  return 'monitor';
}

function buildBlockers(
  snapshot: IProjectReadinessFrameworkSnapshot,
): readonly IPccReadinessBlockerItemViewModel[] {
  return snapshot.items.filter(isBlockerCandidate).map((item) => ({
    id: item.id,
    title: item.title,
    domain: item.domain,
    domainLabel: DOMAIN_LABELS[item.domain],
    lifecycleGate: item.lifecycleGate,
    lifecycleGateLabel: LIFECYCLE_GATE_LABELS[item.lifecycleGate],
    status: item.status,
    severity: item.severity,
    blockerState: item.blockerState,
    posture: item.posture,
    ownerPersona: item.ownerPersona,
    dueDateUtc: item.dueDateUtc,
    sourceModuleId: item.sourceModuleId,
    sourceModuleLabel: DOWNSTREAM_MODULE_REGISTRY[item.sourceModuleId].label,
    riskTag: deriveRiskTag(item),
    blockerSource: 'framework',
  }));
}

/**
 * Wave 14 / Prompt 06 — additive approvals-derived blocker reference rows.
 *
 * Pure projection. Source data is the approvals composite envelope; rows
 * are read-only references that preserve the original Wave 14
 * `CheckpointSourceModule` on the explicit `checkpointSourceModule` field
 * and use the mapped `ProjectReadinessSourceModuleId` on `sourceModuleId`.
 * Project Readiness owns readiness state; these rows never claim
 * readiness ownership.
 */
function buildApprovalsReferenceBlockers(
  approvalsEnvelope: PccReadModelEnvelope<PccApprovalsReadModel> | undefined,
): readonly IPccReadinessBlockerItemViewModel[] {
  const refRows = buildApprovalsReadinessReferences(approvalsEnvelope);
  return refRows.map((ref) => ({
    id: ref.id,
    title: ref.title,
    // Domain / lifecycle gate are framework concepts; reference rows have
    // no direct framework anchor, so a stable fallback is used. The
    // `blockerSource: 'approvals-reference'` marker discriminates them
    // from framework rows in the surface.
    domain: 'project-setup' as ProjectReadinessDomainId,
    domainLabel: 'Approvals reference',
    lifecycleGate: 'preconstruction' as ProjectReadinessLifecycleGateId,
    lifecycleGateLabel: ref.checkpointSourceModuleLabel,
    status: 'in-progress',
    severity: 'medium',
    blockerState: 'open',
    posture: 'at-risk',
    ownerPersona: 'project-executive' as PccPersona,
    sourceModuleId: ref.readinessSourceModuleId,
    sourceModuleLabel: DOWNSTREAM_MODULE_REGISTRY[ref.readinessSourceModuleId].label,
    riskTag: 'monitor',
    blockerSource: 'approvals-reference',
    approvalReferenceCaption: ref.referenceCaption,
    checkpointSourceModule: ref.checkpointSourceModule,
    checkpointSourceModuleLabel: ref.checkpointSourceModuleLabel,
  }));
}

function isOpenBlockerItem(item: IProjectReadinessItem): boolean {
  return item.blockerState === 'open' || item.blockerState === 'escalated';
}

function buildOwnershipAccountability(
  snapshot: IProjectReadinessFrameworkSnapshot,
): IPccReadinessOwnershipAccountabilityViewModel {
  const personaItems = new Map<PccPersona, IProjectReadinessItem[]>();
  for (const item of snapshot.items) {
    const list = personaItems.get(item.ownerPersona) ?? [];
    list.push(item);
    personaItems.set(item.ownerPersona, list);
  }

  const entries: IPccReadinessOwnershipEntryViewModel[] = Array.from(personaItems.entries()).map(
    ([ownerPersona, items]) => {
      const assignedItemIds = items.map((i) => i.id);
      const unassignedItemIds = items
        .filter((i) => i.assignedUserUpn === undefined)
        .map((i) => i.id);
      const openBlockerCount = items.filter(isOpenBlockerItem).length;
      const dueDates = items
        .map((i) => i.dueDateUtc)
        .filter((d): d is string => d !== undefined)
        .sort();
      const escalationSet = new Set<PccPersona>();
      for (const i of items) {
        for (const persona of i.escalationPath ?? []) escalationSet.add(persona);
      }
      return {
        ownerPersona,
        assignedItemIds,
        unassignedItemIds,
        openBlockerCount,
        nextDueDateUtc: dueDates[0],
        escalationPersonas: Array.from(escalationSet),
      };
    },
  );

  const totalUnassignedCount = entries.reduce((sum, e) => sum + e.unassignedItemIds.length, 0);

  const summaryCaption =
    totalUnassignedCount > 0
      ? `${totalUnassignedCount} item${totalUnassignedCount === 1 ? '' : 's'} have no designated user assigned.`
      : 'All items have a designated user assigned.';

  return {
    entries,
    totalUnassignedCount,
    summaryCaption,
  };
}

function buildPriorityActionsPreview(
  snapshot: IProjectReadinessFrameworkSnapshot,
): IPccReadinessPriorityActionsPreviewViewModel {
  const items: IPccReadinessPriorityActionEligibilityItem[] = snapshot.items
    .filter((i) => i.relatedPriorityActionId !== undefined)
    .map((i) => ({
      itemId: i.id,
      itemTitle: i.title,
      relatedPriorityActionId: i.relatedPriorityActionId as string,
      domain: i.domain,
      domainLabel: DOMAIN_LABELS[i.domain],
      eligibilityCaption:
        'Eligible for the Priority Actions surface. Preview only in Wave 8 — no action is created or modified here.',
    }));

  return {
    items,
    previewCaption:
      items.length === 0
        ? 'No readiness items are currently flagged as Priority Actions eligible.'
        : `${items.length} readiness item${items.length === 1 ? '' : 's'} flagged as eligible for the Priority Actions surface.`,
    inertActionLabel: 'Preview only — Priority Actions remains its own surface.',
  };
}

function buildEvidence(
  snapshot: IProjectReadinessFrameworkSnapshot,
): IPccReadinessEvidenceViewModel {
  const evidenceBuckets: readonly IPccReadinessEvidenceStateBucket[] = snapshot.evidenceSummary.map(
    (s: IProjectReadinessEvidenceSummary) => ({
      evidenceState: s.evidenceState,
      itemCount: s.itemIds.length,
      documentControlSourceIds: s.documentControlSourceIds,
    }),
  );

  const sourceHealthEntries: readonly IPccReadinessSourceHealthEntry[] =
    snapshot.sourceHealthSummary.map((s: IProjectReadinessSourceHealthSummary) => ({
      sourceModuleId: s.sourceModuleId,
      sourceModuleLabel: DOWNSTREAM_MODULE_REGISTRY[s.sourceModuleId].label,
      sourceHealthStatus: s.sourceHealthStatus,
      itemCount: s.itemIds.length,
      warningCount: s.warningCount,
    }));

  return {
    evidenceBuckets,
    sourceHealthEntries,
    documentControlReferenceCaption: DOCUMENT_CONTROL_REFERENCE_CAPTION,
  };
}

function buildDownstreamModules(): readonly IPccReadinessDownstreamModuleViewModel[] {
  return PROJECT_READINESS_SOURCE_MODULES.map((sourceModuleId) => {
    const spec = DOWNSTREAM_MODULE_REGISTRY[sourceModuleId];
    return {
      sourceModuleId,
      sourceModuleLabel: spec.label,
      waveLabel: spec.waveLabel,
      waveStatus: spec.waveStatus,
      statusCaption: spec.statusCaption,
    };
  });
}

function buildHero(
  snapshot: IProjectReadinessFrameworkSnapshot,
  blockerCount: number,
): IPccReadinessHeroViewModel {
  const blockerSummaries: readonly IProjectReadinessBlockerSummary[] = snapshot.blockerSummary;
  const overallPosture: ProjectReadinessPosture = derivedOverallPosture(snapshot, blockerSummaries);

  const evidenceConfidence: ProjectReadinessConfidenceState = derivedEvidenceConfidence(snapshot);

  const activeGate: ProjectReadinessLifecycleGateId = derivedActiveGate(snapshot);

  const sourceHealthBadges: readonly IPccReadinessSourceHealthBadge[] =
    snapshot.sourceHealthSummary.map((s) => ({
      sourceModuleId: s.sourceModuleId,
      sourceModuleLabel: DOWNSTREAM_MODULE_REGISTRY[s.sourceModuleId].label,
      sourceHealthStatus: s.sourceHealthStatus,
      warningCount: s.warningCount,
    }));

  return {
    activeLifecycleGate: activeGate,
    activeLifecycleGateLabel: LIFECYCLE_GATE_LABELS[activeGate],
    overallPosture,
    blockerCount,
    evidenceConfidence,
    sourceHealthBadges,
    readOnlyBadgeText: READ_ONLY_BADGE_TEXT,
    noExecutionCaption: NO_EXECUTION_CAPTION,
  };
}

function derivedOverallPosture(
  snapshot: IProjectReadinessFrameworkSnapshot,
  blockerSummaries: readonly IProjectReadinessBlockerSummary[],
): ProjectReadinessPosture {
  const hasBlocked = blockerSummaries.some(
    (s) => (s.blockerState === 'open' || s.blockerState === 'escalated') && s.itemIds.length > 0,
  );
  if (hasBlocked) return 'blocked';
  const domainPostures = snapshot.domainSummaries.map((s) => s.posture);
  if (domainPostures.some((p) => p === 'blocked')) return 'blocked';
  if (domainPostures.some((p) => p === 'at-risk')) return 'at-risk';
  if (domainPostures.length === 0) return 'unknown';
  if (domainPostures.every((p) => p === 'ready')) return 'ready';
  return 'not-started';
}

function derivedEvidenceConfidence(
  snapshot: IProjectReadinessFrameworkSnapshot,
): ProjectReadinessConfidenceState {
  const confidences = snapshot.domainSummaries.map((s) => s.confidence);
  if (confidences.length === 0) return 'unknown';
  if (confidences.some((c) => c === 'low')) return 'low';
  if (confidences.some((c) => c === 'medium')) return 'medium';
  if (confidences.every((c) => c === 'high')) return 'high';
  return 'unknown';
}

function derivedActiveGate(
  snapshot: IProjectReadinessFrameworkSnapshot,
): ProjectReadinessLifecycleGateId {
  const inProgressGate = snapshot.gateSummaries.find(
    (g) => g.itemIds.length > 0 && g.posture !== 'ready' && g.posture !== 'not-applicable',
  );
  if (inProgressGate) return inProgressGate.lifecycleGate;
  const firstGate = snapshot.gateSummaries[0];
  return firstGate?.lifecycleGate ?? 'preconstruction';
}

export function buildPccProjectReadinessViewModel(
  envelope: PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>,
  approvalsEnvelope?: PccReadModelEnvelope<PccApprovalsReadModel>,
): IPccProjectReadinessViewModel {
  const sourceStatus = envelope.sourceStatus;
  const cardState = toCardState(sourceStatus);
  const snapshot = envelope.data;
  const approvalsRefBlockers = buildApprovalsReferenceBlockers(approvalsEnvelope);

  if (sourceStatus !== 'available') {
    return {
      status: 'preview',
      cardState,
      sourceStatus,
      hero: EMPTY_HERO,
      lifecycleGates: PROJECT_READINESS_LIFECYCLE_GATES.map((gate) => ({
        lifecycleGate: gate,
        label: LIFECYCLE_GATE_LABELS[gate],
        posture: 'not-started' as ProjectReadinessPosture,
        itemCount: 0,
        openBlockerCount: 0,
        pendingEvidenceCount: 0,
        isActive: gate === EMPTY_HERO.activeLifecycleGate,
      })),
      domains: PROJECT_READINESS_DOMAINS.map((domain) => ({
        domain,
        label: DOMAIN_LABELS[domain],
        posture: 'not-started' as ProjectReadinessPosture,
        itemCount: 0,
        openBlockerCount: 0,
        pendingEvidenceCount: 0,
        confidence: 'unknown' as ProjectReadinessConfidenceState,
      })),
      blockers: approvalsRefBlockers,
      ownershipAccountability: {
        entries: [],
        totalUnassignedCount: 0,
        summaryCaption:
          'Ownership data is unavailable. Assignments will appear when the source is online.',
      },
      priorityActionsPreview: {
        items: [],
        previewCaption:
          'Priority Actions eligibility cannot be derived without source data. Preview only.',
        inertActionLabel: 'Preview only — Priority Actions remains its own surface.',
      },
      evidence: {
        evidenceBuckets: [],
        sourceHealthEntries: [],
        documentControlReferenceCaption: DOCUMENT_CONTROL_REFERENCE_CAPTION,
      },
      downstreamModules: buildDownstreamModules(),
    };
  }

  const frameworkBlockers = buildBlockers(snapshot);
  const blockers = [...frameworkBlockers, ...approvalsRefBlockers];

  return {
    status: 'preview',
    cardState,
    sourceStatus,
    hero: buildHero(snapshot, blockers.length),
    lifecycleGates: buildLifecycleGates(snapshot, derivedActiveGate(snapshot)),
    domains: buildDomains(snapshot),
    blockers,
    ownershipAccountability: buildOwnershipAccountability(snapshot),
    priorityActionsPreview: buildPriorityActionsPreview(snapshot),
    evidence: buildEvidence(snapshot),
    downstreamModules: buildDownstreamModules(),
  };
}
