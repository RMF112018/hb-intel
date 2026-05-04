/**
 * Wave 13 Prompt 13E — Procore surface adapter.
 *
 * Pure, envelope-in mapping shared by every PCC core surface that
 * renders Procore-derived signals. Inputs are the two Wave 13 read-model
 * envelopes (`procore-project-mapping`, `procore-sync-health`); outputs
 * are display-only view-model values keyed off the canonical seven
 * degraded-state IDs called for by 13E:
 *
 *   `unmapped`, `stale`, `permission-denied`, `tool-disabled`,
 *   `rate-limited`, `partial-sync`, `backend-unavailable`.
 *
 * Constraints:
 *   - no `'loading'` state in the output union — loading is owned by the
 *     hooks that fetch the envelopes;
 *   - no fetch, no SDK, no `src/api/` client/factory imports beyond the
 *     pure preview-state mapping helper;
 *   - existing `@hbc/models/pcc` helpers
 *     (`mapProcoreSourceStatusToPccPreviewState`,
 *     `isProcoreSignalActionable`, `redactProcoreSyncErrorMessage`)
 *     are reused as-is — no duplicated literals;
 *   - allowed pill tones are the existing five
 *     (`info | success | warning | danger | neutral`).
 */

import {
  isProcoreSignalActionable,
  mapProcoreSourceStatusToPccPreviewState,
  redactProcoreSyncErrorMessage,
} from '@hbc/models/pcc';
import type {
  IPriorityAction,
  PccPersona,
  PccProcoreCuratedSummary,
  PccProcoreDerivedSignal,
  PccProcoreDerivedSignalSeverity,
  PccProcoreFreshnessBand,
  PccProcoreProjectMapping,
  PccProcoreProjectMappingFreshnessBand,
  PccProcoreProjectMappingOwnerRole,
  PccProcoreProjectMappingReadModel,
  PccProcoreProjectMappingRemediationHint,
  PccProcoreProjectMappingState,
  PccProcoreSourceState,
  PccProcoreSubjectAreaId,
  PccProcoreSyncHealthEntry,
  PccProcoreSyncHealthReadModel,
  PccProcoreSyncState,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../api/pccReadModelStateMapping.js';
import type { PccCardState } from '../surfaces/projectHome/shared.js';

export const PROCORE_DEGRADED_STATE_IDS = [
  'unmapped',
  'stale',
  'permission-denied',
  'tool-disabled',
  'rate-limited',
  'partial-sync',
  'backend-unavailable',
] as const;
export type PccProcoreDegradedStateId = (typeof PROCORE_DEGRADED_STATE_IDS)[number];

export type PccProcorePillTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface IPccProcoreMappingSummary {
  readonly state: PccProcoreProjectMappingState | 'unmapped';
  readonly freshnessBand: PccProcoreProjectMappingFreshnessBand;
  readonly ownerRole?: PccProcoreProjectMappingOwnerRole;
  readonly ownerUpn?: string;
  readonly remediationHint?: PccProcoreProjectMappingRemediationHint;
  readonly procoreCompanyId?: string;
  readonly procoreProjectId?: string;
  readonly lastConfirmedAtUtc?: string;
  readonly legacyProcoreHint: string | null;
}

export interface IPccProcoreSubjectAreaEntry {
  readonly subjectArea: PccProcoreSubjectAreaId;
  readonly sourceState: PccProcoreSourceState;
  readonly syncState: PccProcoreSyncState;
  readonly freshnessBand: PccProcoreFreshnessBand;
  readonly openObjectCount: number;
  readonly derivedSignalCount: number;
  /** Already redacted via `redactProcoreSyncErrorMessage`. */
  readonly redactedErrors: readonly string[];
}

export interface IPccProcoreSyncRollup {
  readonly entryCount: number;
  readonly availableCount: number;
  readonly degradedCount: number;
  readonly degradedSourceStates: readonly PccProcoreSourceState[];
  readonly hasUnmappedAreas: boolean;
  readonly hasStaleAreas: boolean;
  readonly hasPermissionDeniedAreas: boolean;
  readonly hasToolDisabledAreas: boolean;
  readonly hasRateLimitedAreas: boolean;
  readonly hasSyncDegradedAreas: boolean;
}

export interface IPccProcoreSurfaceViewModel {
  readonly cardState: PccCardState;
  readonly degradedStateId: PccProcoreDegradedStateId | null;
  readonly pillTone: PccProcorePillTone;
  readonly mappingEnvelopeStatus: PccReadModelSourceStatus;
  readonly syncEnvelopeStatus: PccReadModelSourceStatus;
  readonly mappingSummary: IPccProcoreMappingSummary;
  readonly subjectAreaEntries: readonly IPccProcoreSubjectAreaEntry[];
  readonly syncRollup: IPccProcoreSyncRollup;
  readonly priorityActionCandidates: readonly PccProcoreDerivedSignal[];
  readonly readinessImpactSignals: readonly PccProcoreDerivedSignal[];
  readonly topCuratedSummary?: PccProcoreCuratedSummary;
}

export interface IPccProcoreSurfaceAdapterInput {
  readonly projectId: PccProjectId;
  readonly mapping: PccReadModelEnvelope<PccProcoreProjectMappingReadModel>;
  readonly syncHealth: PccReadModelEnvelope<PccProcoreSyncHealthReadModel>;
}

/**
 * Narrow client surface required by Procore-aware PCC views. Defined
 * here so non-`api/` consumers can type the client without re-exporting
 * `IPccReadModelClient`. TypeScript structural typing lets the full
 * client (returned by `createPccReadModelClient`) flow through wherever
 * this narrow type is expected.
 */
export interface IPccProcoreSurfaceClient {
  getProcoreProjectMapping(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProcoreProjectMappingReadModel>>;
  getProcoreSyncHealth(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProcoreSyncHealthReadModel>>;
}

const PREVIEW_TO_CARD_STATE = {
  preview: 'preview',
  empty: 'empty',
  loading: 'preview',
  error: 'error',
  'missing-config': 'missing-config',
  'unavailable-fixture': 'unavailable-fixture',
  'unauthorized-persona': 'unauthorized-persona',
  'not-yet-implemented-operation': 'preview',
} as const satisfies Record<string, PccCardState>;

const TONE_BY_DEGRADED_STATE: Readonly<Record<PccProcoreDegradedStateId, PccProcorePillTone>> = {
  'backend-unavailable': 'danger',
  'permission-denied': 'danger',
  'tool-disabled': 'warning',
  'rate-limited': 'warning',
  unmapped: 'warning',
  stale: 'warning',
  'partial-sync': 'info',
};

const DEGRADED_SOURCE_STATES: ReadonlySet<PccProcoreSourceState> = new Set<PccProcoreSourceState>([
  'mapping-missing',
  'permission-denied',
  'tool-disabled',
  'stale',
  'rate-limited',
  'endpoint-deprecated',
  'object-inaccessible',
  'backend-unavailable',
  'source-unavailable',
]);

function toCardState(status: PccReadModelSourceStatus): PccCardState {
  return PREVIEW_TO_CARD_STATE[mapPccSourceStatusToPreviewState(status)];
}

function chooseEnvelopeStatus(
  mapping: PccReadModelSourceStatus,
  sync: PccReadModelSourceStatus,
): PccReadModelSourceStatus {
  // Preference order: backend-unavailable > unauthorized > forbidden >
  // missing-config > source-unavailable > stale > available. This keeps the
  // surface "fail closed" when either envelope reports a problem.
  const order: readonly PccReadModelSourceStatus[] = [
    'backend-unavailable',
    'unauthorized',
    'forbidden',
    'missing-config',
    'source-unavailable',
    'stale',
    'available',
  ];
  for (const status of order) {
    if (mapping === status || sync === status) return status;
  }
  return 'available';
}

function findMappingForProject(
  projectId: PccProjectId,
  mappings: readonly PccProcoreProjectMapping[],
): PccProcoreProjectMapping | undefined {
  for (const mapping of mappings) {
    if (mapping.pccProjectId === projectId) return mapping;
  }
  return undefined;
}

function readMappingFreshnessBand(
  mapping: PccProcoreProjectMapping | undefined,
): PccProcoreProjectMappingFreshnessBand {
  if (!mapping) return 'unknown';
  switch (mapping.state) {
    case 'mapping-confirmed':
      return mapping.freshnessBand;
    case 'mapping-stale':
      return mapping.freshnessBand;
    case 'unmapped':
    case 'mapping-proposed':
    case 'mapping-conflict':
    case 'mapping-archived':
      return 'unknown';
  }
}

function readMappingOwnerRole(mapping: PccProcoreProjectMapping | undefined): {
  ownerRole?: PccProcoreProjectMappingOwnerRole;
  ownerUpn?: string;
} {
  if (!mapping) return {};
  switch (mapping.state) {
    case 'mapping-confirmed':
      return { ownerRole: mapping.confirmedByOwnerRole, ownerUpn: mapping.confirmedByOwnerUpn };
    case 'mapping-proposed':
      return { ownerRole: mapping.proposedByOwnerRole, ownerUpn: mapping.proposedByOwnerUpn };
    default:
      return {};
  }
}

function readMappingProcoreIds(mapping: PccProcoreProjectMapping | undefined): {
  procoreCompanyId?: string;
  procoreProjectId?: string;
} {
  if (!mapping) return {};
  switch (mapping.state) {
    case 'mapping-confirmed':
    case 'mapping-stale':
      return {
        procoreCompanyId: mapping.procoreCompanyId,
        procoreProjectId: mapping.procoreProjectId,
      };
    default:
      return {};
  }
}

function readMappingLastConfirmedAt(
  mapping: PccProcoreProjectMapping | undefined,
): string | undefined {
  if (!mapping) return undefined;
  switch (mapping.state) {
    case 'mapping-confirmed':
    case 'mapping-stale':
      return mapping.lastConfirmedAtUtc;
    default:
      return undefined;
  }
}

function readMappingRemediationHint(
  mapping: PccProcoreProjectMapping | undefined,
): PccProcoreProjectMappingRemediationHint | undefined {
  if (!mapping) return undefined;
  if (mapping.state === 'mapping-conflict') {
    return mapping.remediationHint;
  }
  return undefined;
}

function buildSubjectAreaEntries(
  entries: readonly PccProcoreSyncHealthEntry[],
): readonly IPccProcoreSubjectAreaEntry[] {
  return entries.map((entry) => ({
    subjectArea: entry.subjectArea,
    sourceState: entry.sourceState,
    syncState: entry.syncState,
    freshnessBand: entry.freshnessBand,
    openObjectCount: entry.openObjectCount,
    derivedSignalCount: entry.derivedSignalCount,
    redactedErrors: entry.errors.map((message) => redactProcoreSyncErrorMessage(message)),
  }));
}

function buildSyncRollup(entries: readonly PccProcoreSyncHealthEntry[]): IPccProcoreSyncRollup {
  const degradedSourceStateSet = new Set<PccProcoreSourceState>();
  let availableCount = 0;
  let degradedCount = 0;
  let hasUnmappedAreas = false;
  let hasStaleAreas = false;
  let hasPermissionDeniedAreas = false;
  let hasToolDisabledAreas = false;
  let hasRateLimitedAreas = false;
  let hasSyncDegradedAreas = false;

  for (const entry of entries) {
    if (entry.sourceState === 'available') {
      availableCount += 1;
    } else if (DEGRADED_SOURCE_STATES.has(entry.sourceState)) {
      degradedCount += 1;
      degradedSourceStateSet.add(entry.sourceState);
    }
    if (entry.sourceState === 'mapping-missing') hasUnmappedAreas = true;
    if (entry.sourceState === 'stale') hasStaleAreas = true;
    if (entry.sourceState === 'permission-denied') hasPermissionDeniedAreas = true;
    if (entry.sourceState === 'tool-disabled') hasToolDisabledAreas = true;
    if (entry.sourceState === 'rate-limited') hasRateLimitedAreas = true;
    if (entry.syncState === 'sync-degraded') hasSyncDegradedAreas = true;
  }

  return {
    entryCount: entries.length,
    availableCount,
    degradedCount,
    degradedSourceStates: Array.from(degradedSourceStateSet),
    hasUnmappedAreas,
    hasStaleAreas,
    hasPermissionDeniedAreas,
    hasToolDisabledAreas,
    hasRateLimitedAreas,
    hasSyncDegradedAreas,
  };
}

function deriveDegradedStateId(
  envelopeStatus: PccReadModelSourceStatus,
  mappingState: PccProcoreProjectMappingState | 'unmapped',
  mappingFreshness: PccProcoreProjectMappingFreshnessBand,
  rollup: IPccProcoreSyncRollup,
): PccProcoreDegradedStateId | null {
  if (envelopeStatus === 'backend-unavailable') return 'backend-unavailable';
  if (envelopeStatus === 'unauthorized' || envelopeStatus === 'forbidden') {
    return 'permission-denied';
  }
  if (rollup.hasPermissionDeniedAreas) return 'permission-denied';
  if (rollup.hasToolDisabledAreas) return 'tool-disabled';
  if (rollup.hasRateLimitedAreas) return 'rate-limited';
  if (
    mappingState === 'unmapped' ||
    mappingState === 'mapping-archived' ||
    rollup.hasUnmappedAreas
  ) {
    return 'unmapped';
  }
  if (
    mappingState === 'mapping-stale' ||
    mappingFreshness === 'stale' ||
    mappingFreshness === 'expired' ||
    rollup.hasStaleAreas
  ) {
    return 'stale';
  }
  if (
    rollup.hasSyncDegradedAreas ||
    (rollup.entryCount > 0 && rollup.degradedCount > 0 && rollup.availableCount > 0)
  ) {
    return 'partial-sync';
  }
  return null;
}

function selectTopCuratedSummary(
  summaries: readonly PccProcoreCuratedSummary[],
): PccProcoreCuratedSummary | undefined {
  return summaries.length > 0 ? summaries[0] : undefined;
}

function isMappingEnvelopeFailClosed(status: PccReadModelSourceStatus): boolean {
  return (
    status === 'backend-unavailable' ||
    status === 'source-unavailable' ||
    status === 'unauthorized' ||
    status === 'forbidden' ||
    status === 'missing-config'
  );
}

/**
 * Pure adapter. Total over the input envelope statuses; never throws.
 *
 * Fail-closed: when either envelope is degraded for the requested
 * project, project-bound outputs (mapping summary, subject-area entries,
 * derived signals, curated summaries) are dropped to safe empty values.
 * The chosen envelope status drives the card state and pill tone via
 * the existing PCC preview-state vocabulary.
 */
export function buildPccProcoreSurfaceViewModel(
  input: IPccProcoreSurfaceAdapterInput,
): IPccProcoreSurfaceViewModel {
  const mappingEnvelopeStatus = input.mapping.sourceStatus;
  const syncEnvelopeStatus = input.syncHealth.sourceStatus;
  const envelopeStatus = chooseEnvelopeStatus(mappingEnvelopeStatus, syncEnvelopeStatus);

  const mappingFailClosed = isMappingEnvelopeFailClosed(mappingEnvelopeStatus);
  const syncFailClosed = isMappingEnvelopeFailClosed(syncEnvelopeStatus);

  const mappingsList = mappingFailClosed ? [] : input.mapping.data.mappings;
  const projectMapping = findMappingForProject(input.projectId, mappingsList);

  const mappingState: PccProcoreProjectMappingState | 'unmapped' = projectMapping
    ? projectMapping.state
    : 'unmapped';
  const mappingFreshnessBand = readMappingFreshnessBand(projectMapping);
  const { ownerRole, ownerUpn } = readMappingOwnerRole(projectMapping);
  const { procoreCompanyId, procoreProjectId } = readMappingProcoreIds(projectMapping);

  const syncEntries: readonly PccProcoreSyncHealthEntry[] = syncFailClosed
    ? []
    : input.syncHealth.data.syncHealthEntries;
  const subjectAreaEntries = buildSubjectAreaEntries(syncEntries);
  const syncRollup = buildSyncRollup(syncEntries);

  const derivedSignals: readonly PccProcoreDerivedSignal[] = syncFailClosed
    ? []
    : input.syncHealth.data.derivedSignals;
  const priorityActionCandidates = derivedSignals.filter(
    (signal) => signal.category === 'priority-action' && isProcoreSignalActionable(signal),
  );
  const readinessImpactSignals = derivedSignals.filter(
    (signal) => signal.category === 'readiness-impact',
  );
  const topCuratedSummary = syncFailClosed
    ? undefined
    : selectTopCuratedSummary(input.syncHealth.data.curatedSummaries);

  const degradedStateId = deriveDegradedStateId(
    envelopeStatus,
    mappingState,
    mappingFreshnessBand,
    syncRollup,
  );

  const cardState = toCardState(envelopeStatus);
  const pillTone: PccProcorePillTone =
    degradedStateId === null ? 'success' : TONE_BY_DEGRADED_STATE[degradedStateId];

  return {
    cardState,
    degradedStateId,
    pillTone,
    mappingEnvelopeStatus,
    syncEnvelopeStatus,
    mappingSummary: {
      state: mappingState,
      freshnessBand: mappingFreshnessBand,
      ownerRole,
      ownerUpn,
      remediationHint: readMappingRemediationHint(projectMapping),
      procoreCompanyId,
      procoreProjectId,
      lastConfirmedAtUtc: readMappingLastConfirmedAt(projectMapping),
      legacyProcoreHint: projectMapping?.legacyProcoreHint ?? null,
    },
    subjectAreaEntries,
    syncRollup,
    priorityActionCandidates,
    readinessImpactSignals,
    topCuratedSummary,
  };
}

/**
 * Translate Procore-derived priority-action signals into `IPriorityAction`
 * shape so they flow through the existing Priority Actions Rail seam:
 * the rail adapter routes `category === 'procore-sync'` to the existing
 * `'external-system-mapping'` group (no new lane).
 *
 * Only fields with safe, signal-backed data are emitted. `dueDate`,
 * `assigneePersona`, `relatedWorkCenter`, and `relatedWorkflowItemId` are
 * omitted on purpose (no invented record fields).
 */
export function buildProcorePriorityActionsForRail(
  signals: readonly PccProcoreDerivedSignal[],
): readonly IPriorityAction[] {
  return signals
    .filter((signal) => signal.category === 'priority-action' && isProcoreSignalActionable(signal))
    .map((signal) => ({
      id: signal.id,
      category: 'procore-sync',
      title: signal.summary,
      severity: severityForSignal(signal.severity),
    }));
}

function severityForSignal(severity: PccProcoreDerivedSignalSeverity): IPriorityAction['severity'] {
  switch (severity) {
    case 'info':
      return 'Info';
    case 'attention':
      return 'Warning';
    case 'critical':
      return 'Repair Required';
  }
}

// Re-exported for test access only — kept here so the helper's vocabulary
// stays in lockstep with adapter logic without duplicating the import in
// every test module that exercises envelope-status mapping.
export { mapProcoreSourceStatusToPccPreviewState };
