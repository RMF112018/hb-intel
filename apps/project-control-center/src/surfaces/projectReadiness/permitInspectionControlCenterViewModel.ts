/**
 * Permit & Inspection Control Center — view-model adapter.
 *
 * Phase 3 / Wave 10 / Prompt 05. Pure, deterministic mapping from a
 * `PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>` into
 * a UI-shaped view model. No React, no hooks, no fetch, no client calls.
 *
 * Mirrors the Wave 9 lifecycle-readiness adapter pattern:
 *   - degraded envelope statuses (`backend-unavailable`, `source-unavailable`)
 *     produce a `'preview'` view model with empty arrays;
 *   - `'available'` and `'mock'` produce a `'preview'` view model with the
 *     fixture/mock data;
 *   - `'loading'` and `'error'` are owned by the hook (this adapter never
 *     emits them).
 *
 * The narrow client interface `IPccPermitInspectionControlCenterReadModelClient`
 * follows the `feedback_narrow_consumer_interface` pattern — exposes only
 * the single Wave 10 read-model method, not the full `IPccReadModelClient`.
 */

import type {
  IAhjJurisdictionProfile,
  IFeeExposureRecord,
  IInspectionRecord,
  IPermitInspectionApprovalSignal,
  IPermitInspectionControlCenterReadModel,
  IPermitInspectionControlCenterSummary,
  IPermitInspectionEvidenceLink,
  IPermitInspectionPriorityActionSignal,
  IPermitInspectionReadinessSignal,
  IPermitRecord,
  IReinspectionLineage,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';

export interface IPccPermitInspectionControlCenterReadModelClient {
  getPermitInspectionControlCenter(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>>;
}

export interface IPermitInspectionControlCenterUiSnapshot {
  readonly summary: IPermitInspectionControlCenterSummary;
  readonly captionLine: string;
  readonly permitsBlockingWork: readonly IPermitRecord[];
  readonly inspectionsReadyToRequest: readonly IInspectionRecord[];
  readonly failedReinspectionQueue: readonly IInspectionRecord[];
  readonly expiringPermits: readonly IPermitRecord[];
  readonly openFeeExposure: readonly IFeeExposureRecord[];
  readonly evidenceMissing: readonly IPermitInspectionEvidenceLink[];
  readonly closeoutExposure: readonly IFeeExposureRecord[];
  readonly ahjLauncherPanel: readonly IAhjJurisdictionProfile[];
  readonly reinspectionLineages: readonly IReinspectionLineage[];
  readonly recordDetailRows: readonly IPermitRecord[];
  readonly priorityActionSignals: readonly IPermitInspectionPriorityActionSignal[];
  readonly readinessSignals: readonly IPermitInspectionReadinessSignal[];
  readonly approvalSignals: readonly IPermitInspectionApprovalSignal[];
}

export type PccPermitInspectionControlCenterViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
      readonly status: 'preview';
      readonly sourceStatus: PccReadModelSourceStatus;
      readonly snapshot: IPermitInspectionControlCenterUiSnapshot;
    };

const READ_ONLY_CAPTION =
  'Read-only Wave 10 preview — no AHJ, Procore, Graph, or SharePoint runtime.';

const DEGRADED_CAPTION = 'Read-only Wave 10 preview — backend unavailable, fixture fallback empty.';

const EMPTY_SUMMARY: IPermitInspectionControlCenterSummary = {
  permitCount: 0,
  expiringCount: 0,
  expiredCount: 0,
  pendingRevisionCount: 0,
  inspectionCount: 0,
  failedInspectionCount: 0,
  openReinspectionCount: 0,
  openFeeExposureCount: 0,
  evidenceMissingCount: 0,
  ahjLauncherCount: 0,
};

function dedupeEvidenceLinks(
  links: readonly IPermitInspectionEvidenceLink[],
): readonly IPermitInspectionEvidenceLink[] {
  const seen = new Set<string>();
  const out: IPermitInspectionEvidenceLink[] = [];
  for (const link of links) {
    if (seen.has(link.id)) continue;
    seen.add(link.id);
    out.push(link);
  }
  return out;
}

function buildSnapshot(
  data: IPermitInspectionControlCenterReadModel,
  caption: string,
): IPermitInspectionControlCenterUiSnapshot {
  const permitsBlockingWork = data.permits.filter(
    (p) => p.status === 'pending-application' || p.status === 'pending-revision',
  );
  const inspectionsReadyToRequest = data.inspections.filter(
    (i) => i.status === 'ready-to-request' || i.status === 'requested',
  );
  const failedReinspectionQueue = data.inspections.filter(
    (i) =>
      i.status === 'failed' ||
      i.status === 'reinspection-required' ||
      i.status === 'reinspection-scheduled',
  );
  const expiringPermits = data.permits.filter(
    (p) => p.status === 'expiring' || p.status === 'expired',
  );
  const openFeeExposure = data.feeExposure.filter(
    (f) => f.feeStatus === 'open' || f.feeStatus === 'pending-receipt',
  );
  const evidenceMissing = dedupeEvidenceLinks([
    ...data.permits.flatMap((p) => p.evidenceLinks),
    ...data.inspections.flatMap((i) => i.evidenceLinks),
    ...data.reinspectionLineages.flatMap((l) => l.evidenceLinks),
    ...data.feeExposure.flatMap((f) => f.receiptEvidenceLinks),
  ]).filter((e) => e.status === 'required-missing');
  const closeoutExposure = data.feeExposure.filter(
    (f) => f.feeStatus === 'disputed' || f.feeStatus === 'pending-receipt',
  );

  return {
    summary: data.summary,
    captionLine: caption,
    permitsBlockingWork,
    inspectionsReadyToRequest,
    failedReinspectionQueue,
    expiringPermits,
    openFeeExposure,
    evidenceMissing,
    closeoutExposure,
    ahjLauncherPanel: data.ahjProfiles,
    reinspectionLineages: data.reinspectionLineages,
    recordDetailRows: data.permits,
    priorityActionSignals: data.priorityActionSignals,
    readinessSignals: data.readinessSignals,
    approvalSignals: data.approvalSignals,
  };
}

function buildEmptySnapshot(caption: string): IPermitInspectionControlCenterUiSnapshot {
  return {
    summary: EMPTY_SUMMARY,
    captionLine: caption,
    permitsBlockingWork: [],
    inspectionsReadyToRequest: [],
    failedReinspectionQueue: [],
    expiringPermits: [],
    openFeeExposure: [],
    evidenceMissing: [],
    closeoutExposure: [],
    ahjLauncherPanel: [],
    reinspectionLineages: [],
    recordDetailRows: [],
    priorityActionSignals: [],
    readinessSignals: [],
    approvalSignals: [],
  };
}

export function buildPermitInspectionControlCenterViewModel(
  envelope: PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>,
): PccPermitInspectionControlCenterViewModel {
  const sourceStatus = envelope.sourceStatus;
  if (sourceStatus !== 'available') {
    return {
      status: 'preview',
      sourceStatus,
      snapshot: buildEmptySnapshot(DEGRADED_CAPTION),
    };
  }
  return {
    status: 'preview',
    sourceStatus,
    snapshot: buildSnapshot(envelope.data, READ_ONLY_CAPTION),
  };
}
