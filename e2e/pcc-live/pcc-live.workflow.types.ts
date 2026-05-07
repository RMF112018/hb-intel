import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_WORKFLOW_EVIDENCE_IDS = [
  'EV-83',
  'EV-84',
  'EV-85',
  'EV-86',
  'EV-87',
  'EV-88',
  'EV-89',
  'EV-90',
  'EV-91',
  'EV-92',
  'EV-93',
  'EV-94',
  'EV-95',
  'EV-96',
  'EV-97',
  'EV-98',
  'EV-99',
  'EV-100',
  'EV-101',
  'EV-102',
  'EV-103',
  'EV-104',
  'EV-105',
  'EV-106',
] as const;

export type PccWorkflowEvidenceId = (typeof PCC_WORKFLOW_EVIDENCE_IDS)[number];
export type PccWorkflowRunState = 'completed' | 'self-skipped' | 'writer-test-only';

export type PccWorkflowObservationStatus =
  | 'observed'
  | 'not-observed'
  | 'needs-review'
  | 'operator-review-pending';

export type PccActionRiskLevel = 'none-observed' | 'low' | 'medium' | 'high' | 'needs-review';

export type PccWorkflowActionKind =
  | 'navigation'
  | 'launch'
  | 'filter'
  | 'search'
  | 'preview'
  | 'read-only'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'save'
  | 'delete'
  | 'sync'
  | 'export'
  | 'unknown';

export interface PccWorkflowActionObservation {
  surfaceId: PccLiveSurfaceId;
  selector: string;
  tagName: string;
  role?: string;
  kind: PccWorkflowActionKind;
  enabled: boolean;
  disabled: boolean;
  ariaDisabled: boolean;
  hasDisabledReason: boolean;
  hasAccessibleName: boolean;
  labelSnippet?: string;
  destinationHost?: string;
  destinationPath?: string;
  destinationIsExternal: boolean;
  mutationKeywordDetected: boolean;
  readOnlyOrPreviewContext: boolean;
  falseAffordanceRisk: PccActionRiskLevel;
  needsReview: boolean;
}

export interface PccWorkflowPriorityObservation {
  surfaceId: PccLiveSurfaceId;
  primaryActionCount: number;
  priorityCardCount: number;
  referenceCardCount: number;
  firstPrimaryActionIndex?: number;
  firstReferenceCardIndex?: number;
  priorityBeforeReference: boolean;
  needsReview: boolean;
  notes: string[];
}

export interface PccWorkflowStateObservation {
  surfaceId: PccLiveSurfaceId;
  stateKind:
    | 'loading'
    | 'empty'
    | 'error'
    | 'blocked'
    | 'degraded'
    | 'preview'
    | 'read-only'
    | 'deferred'
    | 'unavailable'
    | 'unauthorized'
    | 'stale'
    | 'missing-config'
    | 'mock-demo'
    | 'fixture'
    | 'unknown';
  observed: boolean;
  selector?: string;
  copySnippet?: string;
  hasImpact: boolean;
  hasOwner: boolean;
  hasNextStep: boolean;
  needsReview: boolean;
}

export interface PccSourceOfRecordObservation {
  surfaceId: PccLiveSurfaceId;
  sourceSystem:
    | 'PCC'
    | 'SharePoint'
    | 'Procore'
    | 'Sage'
    | 'Autodesk'
    | 'Document Crunch'
    | 'Adobe Sign'
    | 'HBI'
    | 'Fixture'
    | 'Mock'
    | 'Unknown';
  observed: boolean;
  selector?: string;
  ownershipSnippet?: string;
  readOnlyBoundaryObserved: boolean;
  writeAuthorityClaimObserved: boolean;
  needsReview: boolean;
}

export interface PccHbiAuthorityObservation {
  surfaceId: PccLiveSurfaceId;
  selector?: string;
  hbiMentionObserved: boolean;
  commandSearchObserved: boolean;
  advisoryLanguageObserved: boolean;
  mutationAuthorityClaimObserved: boolean;
  riskyKeywordCount: number;
  needsReview: boolean;
}

export interface PccExternalPlatformObservation {
  surfaceId: PccLiveSurfaceId;
  launchSurfaceObserved: boolean;
  launchOnlyLanguageObserved: boolean;
  externalLinkCount: number;
  unsafeExecutableActionCount: number;
  destinationHosts: string[];
  needsReview: boolean;
}

export interface PccApprovalsQueueObservation {
  surfaceId: PccLiveSurfaceId;
  queueObserved: boolean;
  approveActionCount: number;
  rejectActionCount: number;
  submitActionCount: number;
  readOnlyOrPreviewBoundaryObserved: boolean;
  disabledReasonCount: number;
  riskyExecutableActionCount: number;
  needsReview: boolean;
}

export interface PccContinuityObservation {
  surfaceId: PccLiveSurfaceId;
  ownerSignalCount: number;
  responsibilitySignalCount: number;
  crossSurfaceReferenceCount: number;
  lifecycleLanguageCount: number;
  nextActionLanguageCount: number;
  needsReview: boolean;
}

export interface PccWorkflowSurfaceEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  actions: PccWorkflowActionObservation[];
  priority: PccWorkflowPriorityObservation;
  states: PccWorkflowStateObservation[];
  sources: PccSourceOfRecordObservation[];
  hbiAuthority: PccHbiAuthorityObservation;
  externalPlatform?: PccExternalPlatformObservation;
  approvalsQueue?: PccApprovalsQueueObservation;
  continuity: PccContinuityObservation;
  warnings: string[];
}

export interface PccWorkflowEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccWorkflowRunState;
  evRefs: readonly PccEvidenceId[];
  surfaces: PccWorkflowSurfaceEvidence[];
  summary: {
    totalSurfaces: number;
    totalActions: number;
    totalPrimaryActions: number;
    totalDisabledWithoutReason: number;
    totalFalseAffordanceNeedsReview: number;
    totalStateObservations: number;
    totalSourceObservations: number;
    totalMockDemoSignals: number;
    totalHbiAuthorityRisks: number;
    totalExternalLaunchObservations: number;
    totalApprovalsQueueObservations: number;
    totalContinuitySignals: number;
    totalWarnings: number;
  };
  warnings: string[];
  disclaimer: string;
}

type IsExactlyString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;
type IsSubset<Sub, Super> = [Sub] extends [Super] ? true : false;
type UniqueTuple<T extends readonly unknown[], Seen = never> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? Head extends Seen
    ? false
    : UniqueTuple<Tail, Seen | Head>
  : true;

type _EvIdNotString = AssertFalse<IsExactlyString<PccWorkflowEvidenceId>>;
type _EvIdAssignable = AssertTrue<IsSubset<PccWorkflowEvidenceId, PccEvidenceId>>;
type _EvIdLength = AssertTrue<
  (typeof PCC_WORKFLOW_EVIDENCE_IDS)['length'] extends 24 ? true : false
>;
type _EvIdUnique = AssertTrue<UniqueTuple<typeof PCC_WORKFLOW_EVIDENCE_IDS>>;
