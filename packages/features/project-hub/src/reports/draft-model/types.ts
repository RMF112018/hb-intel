/**
 * P3-E9-T03 reports draft-model TypeScript contracts.
 * Draft state, staleness, narrative audit, snapshot freeze, readiness.
 */

import type {
  DraftConfirmationStatus,
  DraftStalenessWorkQueuePriority,
  ReadinessCheckResult,
  RefreshAction,
  SnapshotFreezeStatus,
  StalenessLevel,
  StructuralChangeClassification,
} from './enums.js';
import type { ISnapshotRef } from '../contracts/types.js';

// -- Draft State --------------------------------------------------------------

export interface IDraftState {
  readonly draftStateId: string;
  readonly projectId: string;
  readonly familyKey: string;
  readonly configVersionId: string;
  readonly lastRefreshedAt: string;
  readonly confirmationStatus: DraftConfirmationStatus;
  readonly stalenessLevel: StalenessLevel;
  readonly stalenessAcknowledgedAt: string | null;
  readonly narrativeEditCount: number;
  readonly createdAt: string;
}

// -- Staleness Check ----------------------------------------------------------

export interface IStalenessCheck {
  readonly checkId: string;
  readonly draftStateId: string;
  readonly checkedAt: string;
  readonly lastRefreshedAt: string;
  readonly stalenessThresholdDays: number;
  readonly isStale: boolean;
  readonly stalenessLevel: StalenessLevel;
}

// -- Narrative Edit -----------------------------------------------------------

export interface INarrativeEdit {
  readonly editId: string;
  readonly draftStateId: string;
  readonly sectionKey: string;
  readonly content: string;
  readonly editedByUPN: string;
  readonly editedAt: string;
  readonly previousContent: string | null;
}

// -- Snapshot Freeze Record ---------------------------------------------------

export interface ISnapshotFreezeRecord {
  readonly freezeRecordId: string;
  readonly runId: string;
  readonly draftStateId: string;
  readonly snapshotRefs: readonly ISnapshotRef[];
  readonly freezeStatus: SnapshotFreezeStatus;
  readonly frozenAt: string | null;
  readonly failureReason: string | null;
}

// -- Refresh Record -----------------------------------------------------------

export interface IRefreshRecord {
  readonly refreshId: string;
  readonly draftStateId: string;
  readonly refreshAction: RefreshAction;
  readonly refreshedAt: string;
  readonly refreshedByUPN: string;
  readonly sectionsRefreshed: readonly string[];
  readonly narrativePreserved: boolean;
}

// -- Readiness Check Record ---------------------------------------------------

export interface IReadinessCheckRecord {
  readonly checkId: string;
  readonly draftStateId: string;
  readonly checkedAt: string;
  readonly allSourceModulesHaveSnapshots: boolean;
  readonly activeConfigExists: boolean;
  readonly narrativePresentForRequiredSections: boolean;
  readonly internalReviewChainComplete: boolean;
  readonly overallResult: ReadinessCheckResult;
}

// -- Structural Change Record -------------------------------------------------

export interface IStructuralChangeRecord {
  readonly changeId: string;
  readonly configVersionId: string;
  readonly classification: StructuralChangeClassification;
  readonly changeDescription: string;
  readonly requiresPeReApproval: boolean;
}

// -- Draft Staleness Work Queue Item ------------------------------------------

export interface IDraftStalenessWorkQueueItem {
  readonly workItemId: string;
  readonly draftStateId: string;
  readonly projectId: string;
  readonly priority: DraftStalenessWorkQueuePriority;
  readonly escalatedAt: string | null;
  readonly isEscalated: boolean;
}
