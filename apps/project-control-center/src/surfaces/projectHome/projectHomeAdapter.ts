/**
 * Project Home read-model adapter (Phase 3 / Wave 4 / Prompt 04).
 *
 * Pure mapping layer. Converts PCC read-model envelopes into a stable
 * Project Home view model whose slots carry both:
 *   - `state` — the existing card-state vocabulary (`PccCardState`),
 *     derived via `mapPccSourceStatusToPreviewState` and narrowed to
 *     the card subset;
 *   - `data`  — the typed payload Project Home cards render.
 *
 * No `fetch`, no async, no client/factory imports. The single
 * `src/api/` import is the named pure helper
 * `mapPccSourceStatusToPreviewState`; the controlled-consumption guard
 * encodes a narrow exception for this file + identifier + path.
 *
 * Prompt 05 wires `PccProjectHome` through this adapter; Prompt 06
 * hardens the guard.
 */

import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState';
import type {
  PccApprovalsReadModel,
  PccDocumentControlReadModel,
  PccPriorityActionsReadModel,
  PccProcoreProjectMappingReadModel,
  PccProcoreSyncHealthReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import {
  buildPccProcoreSurfaceViewModel,
  buildProcorePriorityActionsForRail,
} from '../../viewModels/procoreSurfaceAdapter.js';
import {
  buildApprovalsDerivedPriorityActions,
  buildPccApprovalsCheckpointsCardViewModel,
} from '../../viewModels/approvalsPriorityActionsAdapter.js';
import type { PccCardState } from './shared.js';
import type {
  IPccProjectHomeViewModel,
  IPccProjectHomeViewModelSlot,
} from './projectHomeViewModel.js';

export interface IProjectHomeAdapterInput {
  readonly projectId: PccProjectId;
  /**
   * All envelope fields are optional. When absent (runtime degraded path
   * — the consuming hook caught a rejected client call with
   * `.catch(() => undefined)`), the adapter emits a per-slot
   * `'source-unavailable'` posture instead of throwing. Slots derived
   * from the same envelope degrade together (e.g., when `home` is
   * undefined, `intelligence`, `siteHealth`, and `missingConfigurations`
   * all degrade).
   */
  readonly home?: PccReadModelEnvelope<PccProjectHomeReadModel>;
  readonly documentControl?: PccReadModelEnvelope<PccDocumentControlReadModel>;
  readonly priorityActions?: PccReadModelEnvelope<PccPriorityActionsReadModel>;
  readonly procoreProjectMapping?: PccReadModelEnvelope<PccProcoreProjectMappingReadModel>;
  readonly procoreSyncHealth?: PccReadModelEnvelope<PccProcoreSyncHealthReadModel>;
  /**
   * Wave 14 / Prompt 06 — approvals composite envelope. Optional. When
   * absent (runtime degraded path), zero approvals-derived priority actions
   * are merged and the approvals card view-model is omitted (card falls
   * back to its fixture render).
   */
  readonly approvals?: PccReadModelEnvelope<PccApprovalsReadModel>;
}

const DEGRADED_SOURCE_STATUS: PccReadModelSourceStatus = 'source-unavailable';

/**
 * Build a synthetic empty envelope used when a Procore read-model call
 * was caught (`.catch(() => undefined)` in the hook). The Procore
 * surface adapter already treats `'source-unavailable'` envelopes as
 * fail-closed: when `mappingFailClosed` / `syncFailClosed` is true, the
 * builder reads only `data.mappings` (or `data.syncHealthEntries` /
 * `derivedSignals` / `curatedSummaries`) before short-circuiting to
 * empty values. The remaining read-model fields
 * (`moduleIdentity`, `registryContexts`, `subjectAreas`, etc.) are
 * never accessed under fail-closed, so providing a minimal data shape
 * via `as unknown as` cast is safe at runtime; the cast is scoped to
 * these helpers only and the result feeds straight into
 * `buildPccProcoreSurfaceViewModel`'s fail-closed path.
 */
function syntheticDegradedMappingEnvelope(
  projectId: PccProjectId,
): PccReadModelEnvelope<PccProcoreProjectMappingReadModel> {
  return {
    projectId,
    mode: 'mock',
    sourceStatus: DEGRADED_SOURCE_STATUS,
    readOnly: true,
    warnings: [],
    data: { mappings: [] } as unknown as PccProcoreProjectMappingReadModel,
  };
}

function syntheticDegradedSyncHealthEnvelope(
  projectId: PccProjectId,
): PccReadModelEnvelope<PccProcoreSyncHealthReadModel> {
  return {
    projectId,
    mode: 'mock',
    sourceStatus: DEGRADED_SOURCE_STATUS,
    readOnly: true,
    warnings: [],
    data: {
      syncHealthEntries: [],
      derivedSignals: [],
      curatedSummaries: [],
    } as unknown as PccProcoreSyncHealthReadModel,
  };
}

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

function slot<TData>(
  sourceStatus: PccReadModelSourceStatus,
  data: TData,
): IPccProjectHomeViewModelSlot<TData> {
  return {
    state: toCardState(sourceStatus),
    sourceStatus,
    data,
  };
}

export function buildPccProjectHomeViewModel(
  input: IProjectHomeAdapterInput,
): IPccProjectHomeViewModel {
  // When `home` or `documentControl` was caught (`.catch(() => undefined)`
  // in the hook), the corresponding slots degrade to `'source-unavailable'`
  // posture rather than throwing on `input.home.data` / `input.documentControl.data`.
  const homeStatus: PccReadModelSourceStatus = input.home
    ? input.home.sourceStatus
    : DEGRADED_SOURCE_STATUS;
  const docStatus: PccReadModelSourceStatus = input.documentControl
    ? input.documentControl.sourceStatus
    : DEGRADED_SOURCE_STATUS;
  const homeData = input.home?.data;
  const docs = input.documentControl?.data;

  // Procore surface view-model: when either Procore envelope is undefined,
  // synthesize an empty `'source-unavailable'` envelope so the existing
  // `buildPccProcoreSurfaceViewModel` fail-closed branches handle the
  // degraded path uniformly. No new branching in the Procore adapter.
  const procoreSnapshotData = buildPccProcoreSurfaceViewModel({
    projectId: input.projectId,
    mapping: input.procoreProjectMapping ?? syntheticDegradedMappingEnvelope(input.projectId),
    syncHealth:
      input.procoreSyncHealth ?? syntheticDegradedSyncHealthEnvelope(input.projectId),
  });
  // Wave 13 Prompt 13E — Procore priority-action signals flow into the
  // existing Priority Actions Rail via category 'procore-sync', which the
  // rail adapter already routes to 'external-system-mapping'. No new lane.
  const procoreRailActions = buildProcorePriorityActionsForRail(
    procoreSnapshotData.priorityActionCandidates,
  );
  const baseActions = input.priorityActions
    ? (input.priorityActions.data.actions ?? [])
    : (homeData?.priorityActions ?? []);
  const priorityActionsSourceStatus = input.priorityActions
    ? input.priorityActions.sourceStatus
    : homeStatus;
  const baseAndProcore = [...baseActions, ...procoreRailActions];
  // Wave 14 / Prompt 06 — merge approvals-derived priority action candidates
  // alongside base + Procore. Runtime callers pass `approvalsEnvelope` only
  // (never `priorityActionLinks`); when the envelope is undefined the
  // adapter returns an empty array — no fixture fallback at runtime.
  const approvalsDerived = buildApprovalsDerivedPriorityActions({
    projectId: input.projectId,
    approvalsEnvelope: input.approvals,
    existingActions: baseAndProcore,
  });
  const priorityActionsSlot = slot(priorityActionsSourceStatus, [
    ...baseAndProcore,
    ...approvalsDerived.priorityActions,
  ]);
  // Use the procore-mapping envelope's status as the canonical slot
  // sourceStatus; the adapter's `chooseEnvelopeStatus` already encodes
  // fail-closed precedence across both envelopes. When the mapping
  // envelope was caught, the synthetic degraded envelope above carries
  // `'source-unavailable'`, so this slot status reflects the degraded
  // posture without extra branching here.
  const procoreSlotStatus: PccReadModelSourceStatus = input.procoreProjectMapping
    ? input.procoreProjectMapping.sourceStatus
    : DEGRADED_SOURCE_STATUS;

  // Wave 14 / Prompt 06 — small approvals card view-model. Built only when
  // an approvals envelope is supplied (runtime degraded path → undefined →
  // card falls back to its synchronous fixture render).
  const approvalsCard = input.approvals
    ? buildPccApprovalsCheckpointsCardViewModel(input.approvals)
    : undefined;

  return {
    intelligence: slot(homeStatus, homeData?.profile),
    priorityActions: priorityActionsSlot,
    siteHealth: slot(homeStatus, homeData?.siteHealth),
    documentControl: slot(docStatus, docs?.sources ?? []),
    missingConfigurations: slot(homeStatus, homeData?.missingConfigurations ?? []),
    procoreSnapshot: slot(procoreSlotStatus, procoreSnapshotData),
    approvalsCard,
  };
}
