import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_CONDITIONAL_CORE_EVIDENCE_IDS = [
  'EV-57',
  'EV-67',
  'EV-68',
  'EV-82',
  'EV-94',
  'EV-96',
  'EV-102',
] as const;

export const PCC_CONDITIONAL_RELATED_EVIDENCE_IDS = [
  'EV-93',
  'EV-95',
  'EV-97',
  'EV-98',
  'EV-99',
  'EV-100',
  'EV-101',
  'EV-103',
  'EV-104',
  'EV-105',
  'EV-106',
] as const;

export const PCC_CONDITIONAL_EVIDENCE_IDS = [
  ...PCC_CONDITIONAL_CORE_EVIDENCE_IDS,
  ...PCC_CONDITIONAL_RELATED_EVIDENCE_IDS,
] as const;

export type PccConditionalEvidenceId = (typeof PCC_CONDITIONAL_EVIDENCE_IDS)[number];

export type PccConditionalRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-pending'
  | 'writer-test-only';

export type PccConditionalLaneId =
  | 'edit-mode'
  | 'high-zoom'
  | 'short-height'
  | 'drawer-modal'
  | 'unauthorized'
  | 'special-state';

export type PccConditionalLaneStatus =
  | 'completed'
  | 'self-skipped'
  | 'not-configured'
  | 'configured-not-run'
  | 'blocked'
  | 'needs-review'
  | 'operator-pending';

export interface PccConditionalSetupStatus {
  laneId: PccConditionalLaneId;
  status: PccConditionalLaneStatus;
  configured: boolean;
  attempted: boolean;
  reason: string;
  evRefs: readonly PccEvidenceId[];
}

export interface PccConditionalStateObservation {
  laneId: PccConditionalLaneId;
  surfaceId?: PccLiveSurfaceId;
  stateKind:
    | 'edit-mode'
    | 'read-only'
    | 'preview'
    | 'deferred'
    | 'unavailable'
    | 'unauthorized'
    | 'stale'
    | 'missing-config'
    | 'blocked'
    | 'degraded'
    | 'drawer'
    | 'modal'
    | 'dialog'
    | 'high-zoom'
    | 'short-height'
    | 'mock-demo'
    | 'source-owned'
    | 'unknown';
  observed: boolean;
  selector?: string;
  snippet?: string;
  hasImpact: boolean;
  hasOwner: boolean;
  hasNextStep: boolean;
  needsReview: boolean;
}

export interface PccConditionalLayoutObservation {
  laneId: PccConditionalLaneId;
  surfaceId?: PccLiveSurfaceId;
  viewportWidth: number;
  viewportHeight: number;
  zoomOrScaleLabel: string;
  horizontalOverflowDetected: boolean;
  clippedElementCount: number;
  primaryActionVisible: boolean;
  activePanelVisible: boolean;
  needsReview: boolean;
}

export interface PccConditionalFocusObservation {
  laneId: PccConditionalLaneId;
  surfaceId?: PccLiveSurfaceId;
  dialogCount: number;
  modalCount: number;
  drawerCount: number;
  focusableCount: number;
  focusRiskCount: number;
  status: PccConditionalLaneStatus;
  notes: string[];
}

export interface PccConditionalAuthObservation {
  laneId: 'unauthorized';
  attemptedUrl?: string;
  unauthorizedStorageConfigured: boolean;
  pageLoaded: boolean;
  unauthorizedStateObserved: boolean;
  signInRedirectObserved: boolean;
  accessDeniedObserved: boolean;
  pccContentVisible: boolean;
  needsReview: boolean;
  notes: string[];
}

export interface PccConditionalEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccConditionalRunState;
  evRefs: readonly PccEvidenceId[];
  setup: PccConditionalSetupStatus[];
  stateObservations: PccConditionalStateObservation[];
  layoutObservations: PccConditionalLayoutObservation[];
  focusObservations: PccConditionalFocusObservation[];
  authObservations: PccConditionalAuthObservation[];
  summary: {
    totalLanes: number;
    completedLanes: number;
    operatorPendingLanes: number;
    notConfiguredLanes: number;
    stateObservationCount: number;
    layoutObservationCount: number;
    focusObservationCount: number;
    authObservationCount: number;
    needsReviewCount: number;
    warningCount: number;
  };
  warnings: string[];
  disclaimer: string;
}

type IsExactlyString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;

type _CoreLength = AssertTrue<
  (typeof PCC_CONDITIONAL_CORE_EVIDENCE_IDS)['length'] extends 7 ? true : false
>;
type _RelatedLength = AssertTrue<
  (typeof PCC_CONDITIONAL_RELATED_EVIDENCE_IDS)['length'] extends 11 ? true : false
>;
type _CombinedLength = AssertTrue<
  (typeof PCC_CONDITIONAL_EVIDENCE_IDS)['length'] extends 18 ? true : false
>;
type _NoWiden = AssertFalse<IsExactlyString<PccConditionalEvidenceId>>;
type _Assignable = AssertTrue<PccConditionalEvidenceId extends PccEvidenceId ? true : false>;
type _Unique = AssertTrue<
  Extract<
    (typeof PCC_CONDITIONAL_CORE_EVIDENCE_IDS)[number],
    (typeof PCC_CONDITIONAL_RELATED_EVIDENCE_IDS)[number]
  > extends never
    ? true
    : false
>;

void (0 as _CoreLength);
void (0 as _RelatedLength);
void (0 as _CombinedLength);
void (0 as _NoWiden);
void (0 as _Assignable);
void (0 as _Unique);
