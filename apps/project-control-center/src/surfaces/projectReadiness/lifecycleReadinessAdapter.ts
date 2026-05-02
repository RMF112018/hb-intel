/**
 * Project Lifecycle Readiness Center adapter (Phase 3 / Wave 9 / Prompt 05).
 *
 * Pure function: takes a `PccReadModelEnvelope<PccLifecycleReadinessReadModel>`
 * and returns the eight-region view-model consumed by the surface.
 *
 * No React, no fetch, no client. Degraded envelopes (`source-unavailable`,
 * `backend-unavailable`) still return a `preview` view-model with safe-empty
 * region arrays; the canonical 157 / 55 / 32 / 70 library metadata is
 * surfaced even in degraded states because the backend mock provider's
 * `EMPTY_LIFECYCLE_READINESS_READ_MODEL` preserves it.
 */

import {
  LIFECYCLE_READINESS_FAMILIES,
  LIFECYCLE_READINESS_PHASES,
} from '@hbc/models/pcc';
import type {
  ILifecycleReadinessProjectItem,
  ILifecycleReadinessTemplateItem,
  LifecycleReadinessFamily,
  LifecycleReadinessGateId,
  LifecycleReadinessPhaseId,
  LifecycleReadinessStatus,
  PccLifecycleReadinessReadModel,
  PccPersona,
  PccReadModelEnvelope,
  ProjectReadinessPosture,
  ProjectReadinessSeverity,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState';
import type { PccCardState } from '../projectHome/shared.js';
import type {
  IPccLifecycleBlockerBucketViewModel,
  IPccLifecycleBlockerItemViewModel,
  IPccLifecycleBlockersViewModel,
  IPccLifecycleDomainCardViewModel,
  IPccLifecycleEvidenceBucketViewModel,
  IPccLifecycleEvidenceViewModel,
  IPccLifecycleFamilyCardViewModel,
  IPccLifecycleFamilyDomainsViewModel,
  IPccLifecycleFutureCloseoutItemViewModel,
  IPccLifecycleFutureCloseoutViewModel,
  IPccLifecycleItemDetailViewModel,
  IPccLifecycleItemExternalReferenceDetailViewModel,
  IPccLifecycleMapPhaseViewModel,
  IPccLifecycleMapViewModel,
  IPccLifecycleMyActionsItemViewModel,
  IPccLifecycleMyActionsViewModel,
  IPccLifecycleReadinessHeroViewModel,
  IPccLifecycleReadinessViewModel,
  IPccLifecycleSourceTraceabilityViewModel,
} from './lifecycleReadinessViewModel.js';

// ---------------------------------------------------------------------------
// Local label maps. Wave-9-scoped; do NOT iterate the shared registry tuples
// just to build label rows (per fixture-parity feedback).
// ---------------------------------------------------------------------------

const FAMILY_LABELS: Readonly<Record<LifecycleReadinessFamily, string>> = {
  startup: 'Startup readiness',
  safety: 'Safety readiness',
  closeout: 'Closeout readiness',
};

const PHASE_LABELS: Readonly<Record<LifecycleReadinessPhaseId, string>> = {
  'contract-review': 'Contract review',
  'startup-readiness': 'Startup readiness',
  'mobilization-readiness': 'Mobilization readiness',
  'permit-ahj-readiness': 'Permit / AHJ readiness',
  'safety-readiness': 'Safety readiness',
  'active-construction-controls': 'Active construction controls',
  'pre-co-readiness': 'Pre-Certificate of Occupancy readiness',
  'turnover-readiness': 'Turnover readiness',
  'post-turnover-closeout': 'Post-turnover / financial closeout',
  'warranty-lessons-learned': 'Warranty / lessons learned',
};

const DOMAIN_LABELS: Readonly<Record<string, string>> = {
  'contract-commercial': 'Contract & commercial',
  'financial-accounting': 'Financial & accounting',
  'systems-setup': 'Systems setup',
  'documents-records': 'Documents & records',
  'insurance-risk': 'Insurance & risk',
  'schedule-planning': 'Schedule & planning',
  'safety-qaqc': 'Safety & QA / QC',
  'field-mobilization': 'Field mobilization',
  'permit-ahj': 'Permit & AHJ',
  'owner-turnover': 'Owner turnover',
  'closeout-compliance': 'Closeout & compliance',
  'knowledge-performance': 'Knowledge & performance',
};

const GATE_LABELS: Readonly<Record<LifecycleReadinessGateId, string>> = {
  'contract-review-ready': 'Contract review ready',
  'startup-ready': 'Startup ready',
  'mobilization-ready': 'Mobilization ready',
  'safety-ready': 'Safety ready',
  'permit-ahj-ready': 'Permit / AHJ ready',
  'pre-co-ready': 'Pre-Certificate of Occupancy ready',
  'turnover-ready': 'Turnover ready',
  'financial-closeout-ready': 'Financial closeout ready',
  'project-closeout-complete': 'Project closeout complete',
};

const ZERO_SEVERITY_COUNTS: Readonly<Record<ProjectReadinessSeverity, number>> =
  Object.freeze({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  });

// Mirror the Wave 8 adapter's preview→card mapping. Mapping for `loading` and
// `not-yet-implemented-operation` is intentionally `preview` so the surface
// renders an envelope-driven preview shell rather than a global loading state.
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

const ACTIVE_STATUSES: ReadonlySet<LifecycleReadinessStatus> = new Set([
  'not-started',
  'in-progress',
  'needs-evidence',
  'needs-review',
  'returned',
  'blocked',
  'failed',
]);

const READ_ONLY_BADGE_TEXT = 'Read-only lifecycle readiness preview';
const NO_EXECUTION_CAPTION =
  'No workflow execution is enabled in Wave 9. Live tenant runtime is operator-pending.';
const DOCUMENT_CONTROL_REFERENCE_CAPTION =
  'Evidence references resolve to Document Control sources; live document operations are not enabled in Wave 9.';
const AUDIT_CAPTION =
  'Lifecycle readiness vocabulary is sourced from the canonical HB checklists; counts shown reflect the published library.';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildPccLifecycleReadinessViewModel(
  envelope: PccReadModelEnvelope<PccLifecycleReadinessReadModel>,
): IPccLifecycleReadinessViewModel {
  const { sourceStatus, viewerPersona, data } = envelope;
  const cardState: PccCardState =
    PREVIEW_TO_CARD_STATE[mapPccSourceStatusToPreviewState(sourceStatus)];

  const templateItems = data.sampleTemplateItems;
  const projectItems = data.sampleProjectItems;
  const templateMap = new Map<string, ILifecycleReadinessTemplateItem>();
  for (const t of templateItems) templateMap.set(t.templateItemId, t);

  const totalOpenBlockers = data.gates.reduce(
    (sum, g) => sum + g.openBlockerCount,
    0,
  );
  const totalPendingEvidence = data.gates.reduce(
    (sum, g) => sum + g.pendingEvidenceCount,
    0,
  );

  const hero: IPccLifecycleReadinessHeroViewModel = {
    headlinePosture: data.summary.headlinePosture,
    activeGate: deriveActiveGate(data.gates),
    activeGateLabel: deriveActiveGateLabel(data.gates),
    totalProjectItems: data.summary.totalProjectItems,
    totalOpenBlockers,
    totalPendingEvidence,
    libraryTotal: data.templateLibraryMetadata.total,
    readOnlyBadgeText: READ_ONLY_BADGE_TEXT,
    noExecutionCaption: NO_EXECUTION_CAPTION,
  };

  const lifecycleMap = buildLifecycleMap(data);
  const familyDomains = buildFamilyDomains(data, projectItems, cardState);
  const myActions = buildMyActions(projectItems, templateMap, viewerPersona, cardState);
  const blockers = buildBlockers(data, projectItems, templateMap, cardState);
  const evidence = buildEvidence(data, cardState);
  const futureCloseout = buildFutureCloseout(templateItems, projectItems, cardState);
  const sourceTraceability = buildSourceTraceability(data);

  return {
    status: 'preview',
    cardState,
    sourceStatus,
    hero,
    lifecycleMap,
    familyDomains,
    myActions,
    blockers,
    evidence,
    futureCloseout,
    sourceTraceability,
  };
}

// ---------------------------------------------------------------------------
// Region builders
// ---------------------------------------------------------------------------

function deriveActiveGate(
  gates: PccLifecycleReadinessReadModel['gates'],
): LifecycleReadinessGateId | 'none' {
  if (gates.length === 0) return 'none';
  const blocked = gates.find((g) => g.posture === 'blocked');
  if (blocked) return blocked.gateId;
  const atRisk = gates.find((g) => g.posture === 'at-risk');
  if (atRisk) return atRisk.gateId;
  return gates[0]!.gateId;
}

function deriveActiveGateLabel(gates: PccLifecycleReadinessReadModel['gates']): string {
  const id = deriveActiveGate(gates);
  if (id === 'none') return 'No gate currently active';
  return GATE_LABELS[id];
}

function buildLifecycleMap(
  data: PccLifecycleReadinessReadModel,
): IPccLifecycleMapViewModel {
  const phaseMap = new Map(data.phases.map((p) => [p.phase, p]));
  const phases: IPccLifecycleMapPhaseViewModel[] = LIFECYCLE_READINESS_PHASES.map(
    (phaseId) => {
      const summary = phaseMap.get(phaseId);
      if (summary) {
        return {
          phaseId,
          phaseLabel: PHASE_LABELS[phaseId],
          posture: summary.posture,
          openBlockerCount: summary.openBlockerCount,
          pendingEvidenceCount: summary.pendingEvidenceCount,
          criticalCount: summary.criticalCount,
          isInSnapshot: true,
        };
      }
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        posture: 'not-applicable' as ProjectReadinessPosture,
        openBlockerCount: 0,
        pendingEvidenceCount: 0,
        criticalCount: 0,
        isInSnapshot: false,
      };
    },
  );
  const tracked = phases.filter((p) => p.isInSnapshot).length;
  return {
    phases,
    summaryCaption: `${tracked} of ${LIFECYCLE_READINESS_PHASES.length} phases tracked in this snapshot.`,
  };
}

function buildFamilyDomains(
  data: PccLifecycleReadinessReadModel,
  projectItems: readonly ILifecycleReadinessProjectItem[],
  cardState: PccCardState,
): IPccLifecycleFamilyDomainsViewModel {
  const families: IPccLifecycleFamilyCardViewModel[] = LIFECYCLE_READINESS_FAMILIES.map(
    (family) => {
      const inFamily = projectItems.filter((p) => p.family === family);
      return {
        family,
        familyLabel: FAMILY_LABELS[family],
        libraryCount: data.templateLibraryMetadata.familyCounts[family],
        instanceCount: inFamily.length,
        headlinePosture: deriveFamilyPosture(inFamily),
      };
    },
  );

  const domains: IPccLifecycleDomainCardViewModel[] = data.domains.map((d) => ({
    domainId: d.domain,
    domainLabel: DOMAIN_LABELS[d.domain] ?? d.domain,
    posture: d.posture,
    openBlockerCount: d.openBlockerCount,
    pendingEvidenceCount: d.pendingEvidenceCount,
    confidence: d.confidence,
  }));

  return { cardState, families, domains };
}

function deriveFamilyPosture(
  items: readonly ILifecycleReadinessProjectItem[],
): ProjectReadinessPosture {
  if (items.length === 0) return 'not-applicable';
  if (items.some((i) => i.posture === 'blocked')) return 'blocked';
  if (items.some((i) => i.posture === 'at-risk')) return 'at-risk';
  if (items.every((i) => i.posture === 'ready')) return 'ready';
  if (items.every((i) => i.posture === 'not-started')) return 'not-started';
  return 'at-risk';
}

function buildMyActions(
  projectItems: readonly ILifecycleReadinessProjectItem[],
  templateMap: ReadonlyMap<string, ILifecycleReadinessTemplateItem>,
  viewerPersona: PccPersona | undefined,
  cardState: PccCardState,
): IPccLifecycleMyActionsViewModel {
  const filtered = projectItems.filter((p) => {
    if (viewerPersona && p.ownerPersona !== viewerPersona) return false;
    return ACTIVE_STATUSES.has(p.status);
  });

  const items: IPccLifecycleMyActionsItemViewModel[] = filtered.map((p) => {
    const tmpl = templateMap.get(p.templateItemId);
    const phaseId = tmpl?.lifecyclePhase;
    return {
      projectItemId: p.projectItemId,
      templateItemId: p.templateItemId,
      title: tmpl?.normalizedTitle ?? p.templateItemId,
      family: p.family,
      familyLabel: FAMILY_LABELS[p.family],
      phaseLabel: phaseId ? PHASE_LABELS[phaseId] : '—',
      status: p.status,
      criticality: tmpl?.criticality ?? 'informational',
      ownerPersona: p.ownerPersona,
      ...(p.dueDateUtc !== undefined ? { dueDateUtc: p.dueDateUtc } : {}),
      detail: buildItemDetail(tmpl, p),
    };
  });

  const captionText = viewerPersona
    ? `Active items assigned to ${viewerPersona}.`
    : 'Active readiness items across all owners (fixture preview — persona filter not applied).';

  return {
    cardState,
    items,
    captionText,
    inertActionLabel: 'Preview only — workflow execution is not enabled in Wave 9.',
    ...(viewerPersona !== undefined ? { viewerPersona } : {}),
  };
}

function buildBlockers(
  data: PccLifecycleReadinessReadModel,
  projectItems: readonly ILifecycleReadinessProjectItem[],
  templateMap: ReadonlyMap<string, ILifecycleReadinessTemplateItem>,
  cardState: PccCardState,
): IPccLifecycleBlockersViewModel {
  const buckets: IPccLifecycleBlockerBucketViewModel[] = data.blockerSummary.map(
    (b) => ({
      blockerState: b.blockerState,
      itemCount: b.itemIds.length,
      severityCounts: { ...ZERO_SEVERITY_COUNTS, ...b.severityCounts },
    }),
  );

  const blocked = projectItems.filter(
    (p) =>
      p.posture === 'blocked' ||
      p.blockerState === 'open' ||
      p.blockerState === 'escalated',
  );
  const items: IPccLifecycleBlockerItemViewModel[] = blocked.map((p) => {
    const tmpl = templateMap.get(p.templateItemId);
    return {
      projectItemId: p.projectItemId,
      templateItemId: p.templateItemId,
      title: tmpl?.normalizedTitle ?? p.templateItemId,
      family: p.family,
      familyLabel: FAMILY_LABELS[p.family],
      severity: p.severity,
      blockerState: p.blockerState,
      status: p.status,
      ...(p.exceptionCode !== undefined ? { exceptionCode: p.exceptionCode } : {}),
      detail: buildItemDetail(tmpl, p),
    };
  });

  const summaryCaption =
    items.length === 0
      ? 'No active blockers in the lifecycle preview.'
      : `${items.length} item${items.length === 1 ? '' : 's'} currently blocked or escalated.`;

  return {
    cardState,
    buckets,
    items,
    summaryCaption,
    rawBlockerSummary: data.blockerSummary,
  };
}

function buildEvidence(
  data: PccLifecycleReadinessReadModel,
  cardState: PccCardState,
): IPccLifecycleEvidenceViewModel {
  const buckets: IPccLifecycleEvidenceBucketViewModel[] = data.evidenceSummary.map(
    (e) => ({
      evidenceState: e.evidenceState,
      itemCount: e.itemIds.length,
      documentControlSourceCount: e.documentControlSourceIds.length,
      documentControlSourceIds: e.documentControlSourceIds,
    }),
  );
  return {
    cardState,
    buckets,
    documentControlReferenceCaption: DOCUMENT_CONTROL_REFERENCE_CAPTION,
    rawEvidenceSummary: data.evidenceSummary,
  };
}

function buildFutureCloseout(
  templateItems: readonly ILifecycleReadinessTemplateItem[],
  projectItems: readonly ILifecycleReadinessProjectItem[],
  cardState: PccCardState,
): IPccLifecycleFutureCloseoutViewModel {
  const futureTemplates = templateItems.filter(
    (t) => t.itemType === 'future-closeout-exposure',
  );
  const projectByTemplate = new Map<string, ILifecycleReadinessProjectItem>();
  for (const p of projectItems) projectByTemplate.set(p.templateItemId, p);

  const items: IPccLifecycleFutureCloseoutItemViewModel[] = futureTemplates.map(
    (t) => {
      const inst = projectByTemplate.get(t.templateItemId);
      return {
        templateItemId: t.templateItemId,
        title: t.normalizedTitle,
        family: t.family,
        phaseLabel: PHASE_LABELS[t.lifecyclePhase],
        criticality: t.criticality,
        hasProjectInstance: inst !== undefined,
        ...(inst?.status !== undefined ? { projectStatus: inst.status } : {}),
        detail: buildItemDetail(t, inst),
      };
    },
  );

  const captionText =
    items.length === 0
      ? 'No future closeout exposure flagged in this snapshot.'
      : `${items.length} future closeout exposure item${items.length === 1 ? '' : 's'} surfaced for early visibility.`;

  return { cardState, items, captionText };
}

function buildSourceTraceability(
  data: PccLifecycleReadinessReadModel,
): IPccLifecycleSourceTraceabilityViewModel {
  const meta = data.templateLibraryMetadata;
  const familyTotals = LIFECYCLE_READINESS_FAMILIES.map((family) => ({
    family,
    familyLabel: FAMILY_LABELS[family],
    count: meta.familyCounts[family],
  }));
  const sourceDocuments = meta.sourceDocuments.map((doc) => ({
    family: doc.family,
    familyLabel: FAMILY_LABELS[doc.family],
    sourceFile: doc.sourceFile,
    libraryCount: meta.familyCounts[doc.family],
  }));
  return {
    libraryTotal: meta.total,
    familyTotals,
    sourceDocuments,
    auditCaption: AUDIT_CAPTION,
  };
}

// Detail view-model builder.
// `template` and `project` are both optional so the helper can serve the
// rare degenerate paths (project-only or template-only). When both are
// present the joined detail uses the template item for classification and
// source traceability, and the project item for instance state.
function buildItemDetail(
  template: ILifecycleReadinessTemplateItem | undefined,
  project: ILifecycleReadinessProjectItem | undefined,
): IPccLifecycleItemDetailViewModel {
  const family = (template?.family ?? project?.family) as LifecycleReadinessFamily;
  const sourceTrace = template?.sourceTrace;
  const evidenceLink = project?.evidenceLink ?? template?.evidenceLink;

  const externalReferences: IPccLifecycleItemExternalReferenceDetailViewModel[] =
    (template?.externalReferences ?? []).map((ref) => ({
      system: ref.system,
      referenceLabel: ref.referenceLabel,
      ...(ref.referenceUrl !== undefined ? { referenceUrlText: ref.referenceUrl } : {}),
    }));

  const status = project?.status;
  const itemType = template?.itemType ?? 'reference-only';
  const isCloseoutFromDayOne = family === 'closeout' && template?.activeByDefault === true;
  const isFutureCloseoutExposure = itemType === 'future-closeout-exposure';
  const isSafetyFailedState = family === 'safety' && status === 'failed';

  return {
    templateItemId: template?.templateItemId ?? project?.templateItemId ?? '—',
    ...(project?.projectItemId !== undefined ? { projectItemId: project.projectItemId } : {}),

    normalizedTitle: template?.normalizedTitle ?? project?.templateItemId ?? '—',
    family,
    familyLabel: FAMILY_LABELS[family],
    itemType,
    criticality: template?.criticality ?? 'informational',
    riskTags: template?.riskTags ?? [],
    activeByDefault: template?.activeByDefault === true,
    ...(template?.classificationNotes !== undefined
      ? { classificationNotes: template.classificationNotes }
      : {}),

    sourceFamily: sourceTrace?.family ?? family,
    sourceFile: sourceTrace?.sourceFile ?? '—',
    sourceSection: sourceTrace?.section ?? '—',
    sourcePage: sourceTrace?.page ?? 0,
    sourceItemKey: sourceTrace?.itemKey ?? '—',
    exactItemText: sourceTrace?.exactItemText ?? '—',
    sourceTraceabilityRequirement: sourceTrace?.sourceTraceabilityRequirement ?? '—',
    ...(sourceTrace?.details !== undefined ? { sourceDetails: sourceTrace.details } : {}),
    ...(sourceTrace?.responseOptions !== undefined
      ? { responseOptions: sourceTrace.responseOptions }
      : {}),

    lifecyclePhase: template?.lifecyclePhase ?? 'contract-review',
    phaseLabel: template?.lifecyclePhase
      ? PHASE_LABELS[template.lifecyclePhase]
      : '—',
    readinessDomain: template?.readinessDomain ?? 'contract-commercial',
    domainLabel: template?.readinessDomain
      ? DOMAIN_LABELS[template.readinessDomain] ?? template.readinessDomain
      : '—',
    defaultGateImpact: template?.defaultGateImpact ?? [],

    defaultOwnerPersona: (template?.defaultOwnerPersona ??
      project?.ownerPersona ??
      'project-manager') as PccPersona,
    ...(template?.defaultReviewerPersona !== undefined
      ? { defaultReviewerPersona: template.defaultReviewerPersona }
      : {}),
    ownershipClassification: template?.ownershipClassification ?? 'owned',

    ...(project?.status !== undefined ? { status: project.status } : {}),
    ...(project?.posture !== undefined ? { posture: project.posture } : {}),
    ...(project?.severity !== undefined ? { severity: project.severity } : {}),
    ...(project?.blockerState !== undefined ? { blockerState: project.blockerState } : {}),
    ...(project?.confidence !== undefined ? { confidence: project.confidence } : {}),
    ...(project?.ownerPersona !== undefined ? { ownerPersona: project.ownerPersona } : {}),
    ...(project?.reviewerPersona !== undefined ? { reviewerPersona: project.reviewerPersona } : {}),
    ...(project?.dueDateUtc !== undefined ? { dueDateUtc: project.dueDateUtc } : {}),
    ...(project?.completedAtUtc !== undefined ? { completedAtUtc: project.completedAtUtc } : {}),
    ...(project?.completedByPersona !== undefined
      ? { completedByPersona: project.completedByPersona }
      : {}),
    ...(project?.lastUpdatedAtUtc !== undefined
      ? { lastUpdatedAtUtc: project.lastUpdatedAtUtc }
      : {}),
    ...(project?.lastActorPersona !== undefined
      ? { lastActorPersona: project.lastActorPersona }
      : {}),

    ...(project?.notApplicableReason !== undefined
      ? { notApplicableReason: project.notApplicableReason }
      : {}),
    ...(project?.deferredReason !== undefined
      ? { deferredReason: project.deferredReason }
      : {}),
    ...(project?.blockedReason !== undefined ? { blockedReason: project.blockedReason } : {}),
    ...(project?.projectOverrideNotes !== undefined
      ? { projectOverrideNotes: project.projectOverrideNotes }
      : {}),
    ...(project?.exceptionCode !== undefined ? { exceptionCode: project.exceptionCode } : {}),

    evidencePolicy: template?.evidencePolicy ?? evidenceLink?.policy ?? 'optional',
    ...(evidenceLink?.evidenceState !== undefined
      ? { evidenceState: evidenceLink.evidenceState }
      : {}),
    ...(evidenceLink?.referenceLabel !== undefined
      ? { evidenceReferenceLabel: evidenceLink.referenceLabel }
      : {}),
    ...(evidenceLink?.documentControlSourceId !== undefined
      ? { evidenceDocumentControlSourceId: evidenceLink.documentControlSourceId }
      : {}),
    ...(evidenceLink?.externalReferenceLabel !== undefined
      ? { evidenceExternalReferenceLabel: evidenceLink.externalReferenceLabel }
      : {}),
    ...(evidenceLink?.externalReferenceUrl !== undefined
      ? { evidenceExternalReferenceUrlText: evidenceLink.externalReferenceUrl }
      : {}),

    externalReferences,

    ...(template?.recurrence?.cadence !== undefined
      ? { recurrenceCadence: template.recurrence.cadence }
      : {}),
    ...(template?.recurrence?.triggerEvent !== undefined
      ? { recurrenceTriggerEvent: template.recurrence.triggerEvent }
      : {}),

    ...(project?.approvalCheckpointReference !== undefined
      ? { approvalCheckpointReference: project.approvalCheckpointReference }
      : {}),
    ...(project?.relatedPriorityActionId !== undefined
      ? { relatedPriorityActionId: project.relatedPriorityActionId }
      : {}),

    isCloseoutFromDayOne,
    isFutureCloseoutExposure,
    isSafetyFailedState,
  };
}
