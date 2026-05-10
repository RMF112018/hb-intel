import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_SURFACE_BLOCK_EVIDENCE_IDS = [
  'EV-125',
  'EV-126',
  'EV-127',
  'EV-128',
  'EV-129',
  'EV-130',
  'EV-131',
  'EV-132',
  'EV-133',
  'EV-134',
] as const;

export type PccSurfaceBlockEvidenceId = (typeof PCC_SURFACE_BLOCK_EVIDENCE_IDS)[number];

// Phase 05 wave-b10 Prompt 08 — surface block IDs migrated from the
// eight legacy MVP surfaces to the eight Phase 05 primary tabs. The
// EV-125..EV-132 evidence block IDs remain the canonical surface
// evidence anchors; only the per-surface block-id strings and surface
// ids change to match the Phase 05 grouped-tab navigation model.
export type PccSurfaceEvidenceBlockId =
  | 'project-home-surface-block'
  | 'core-tools-surface-block'
  | 'documents-surface-block'
  | 'estimating-preconstruction-surface-block'
  | 'startup-closeout-surface-block'
  | 'project-controls-surface-block'
  | 'cost-time-surface-block'
  | 'systems-administration-surface-block'
  | 'shared-primitive-system-block'
  | 'cross-surface-evidence-index-block';

export type PccSurfaceEvidenceBlockType = 'surface' | 'primitive-system' | 'cross-surface-index';

export type PccSurfaceEvidenceBlockDisposition =
  | 'review-support'
  | 'expert-review-required'
  | 'operator-review-pending'
  | 'source-missing'
  | 'not-observed';

export interface PccSurfaceEvidenceBlockMappingItem {
  evId: PccSurfaceBlockEvidenceId;
  blockId: PccSurfaceEvidenceBlockId;
  blockType: PccSurfaceEvidenceBlockType;
  surfaceId?: PccLiveSurfaceId;
  primitiveScope?: 'shared-primitive-system' | 'cross-surface-evidence-index';
}

export const PCC_SURFACE_BLOCK_MAPPING: readonly PccSurfaceEvidenceBlockMappingItem[] = [
  {
    evId: 'EV-125',
    blockId: 'project-home-surface-block',
    blockType: 'surface',
    surfaceId: 'project-home',
  },
  {
    evId: 'EV-126',
    blockId: 'core-tools-surface-block',
    blockType: 'surface',
    surfaceId: 'core-tools',
  },
  {
    evId: 'EV-127',
    blockId: 'documents-surface-block',
    blockType: 'surface',
    surfaceId: 'documents',
  },
  {
    evId: 'EV-128',
    blockId: 'estimating-preconstruction-surface-block',
    blockType: 'surface',
    surfaceId: 'estimating-preconstruction',
  },
  {
    evId: 'EV-129',
    blockId: 'startup-closeout-surface-block',
    blockType: 'surface',
    surfaceId: 'startup-closeout',
  },
  {
    evId: 'EV-130',
    blockId: 'project-controls-surface-block',
    blockType: 'surface',
    surfaceId: 'project-controls',
  },
  {
    evId: 'EV-131',
    blockId: 'cost-time-surface-block',
    blockType: 'surface',
    surfaceId: 'cost-time',
  },
  {
    evId: 'EV-132',
    blockId: 'systems-administration-surface-block',
    blockType: 'surface',
    surfaceId: 'systems-administration',
  },
  {
    evId: 'EV-133',
    blockId: 'shared-primitive-system-block',
    blockType: 'primitive-system',
    primitiveScope: 'shared-primitive-system',
  },
  {
    evId: 'EV-134',
    blockId: 'cross-surface-evidence-index-block',
    blockType: 'cross-surface-index',
    primitiveScope: 'cross-surface-evidence-index',
  },
] as const;

export interface PccSurfaceEvidenceBlockArtifactRef {
  artifactKind:
    | 'screenshot'
    | 'json-summary'
    | 'markdown-summary'
    | 'source-summary'
    | 'runtime-summary'
    | 'gap-register';
  sourceLane:
    | 'screenshot'
    | 'breakpoint'
    | 'accessibility'
    | 'workflow'
    | 'conditional'
    | 'content'
    | 'doctrine-source'
    | 'surface-smoke'
    | 'runtime'
    | 'prompt-12';
  path: string;
  description: string;
  exists: boolean;
  operatorReviewRequired: boolean;
}

export interface PccSurfaceEvidenceScreenshotSummary {
  referenceCount: number;
  hasSurfaceScreenshot: boolean;
  notes: string[];
}

export interface PccSurfaceEvidenceSourceStateSummary {
  sourceMarkerCount: number;
  stateMarkerCount: number;
  needsReviewCount: number;
  notes: string[];
}

export interface PccSurfaceEvidenceCardHierarchySummary {
  cardCount: number;
  primaryCardCount: number;
  referenceCardCount: number;
  hierarchySignals: string[];
  notes: string[];
}

export interface PccSurfaceEvidenceWorkflowSummary {
  actionCount: number;
  disabledWithoutReasonCount: number;
  falseAffordanceNeedsReviewCount: number;
  notes: string[];
}

export interface PccSurfaceEvidenceAccessibilitySummary {
  axeViolationCount: number;
  keyboardFocusStopCount: number;
  ariaNeedsReviewCount: number;
  contrastNeedsReviewCount: number;
  notes: string[];
}

export interface PccSurfaceEvidenceBreakpointSummary {
  viewportCount: number;
  overflowIssueCount: number;
  clippedIssueCount: number;
  touchIssueCount: number;
  notes: string[];
}

export interface PccSurfaceEvidenceRuntimeSummary {
  warningCount: number;
  runtimeErrorCount: number;
  observed: boolean;
  notes: string[];
}

export interface PccSurfaceEvidenceContentSummary {
  copySignalCount: number;
  findingCount: number;
  needsReviewCount: number;
  notes: string[];
}

export interface PccSurfaceEvidenceDoctrineSummary {
  doctrineSignalCount: number;
  moldBreakerSignalCount: number;
  expertReviewRequiredCount: number;
  notes: string[];
}

export interface PccSurfaceEvidenceGapItem {
  code: string;
  message: string;
  sourceLane:
    | 'screenshot'
    | 'breakpoint'
    | 'accessibility'
    | 'workflow'
    | 'conditional'
    | 'content'
    | 'doctrine-source'
    | 'surface-smoke'
    | 'runtime';
  disposition: PccSurfaceEvidenceBlockDisposition;
}

export interface PccSurfaceEvidenceBlockSummary {
  evidenceSourcePresence: Record<string, boolean>;
  totalArtifactRefs: number;
  totalPendingGaps: number;
  totalExpertReviewQuestions: number;
}

export interface PccPrimitiveEvidenceBlockSummary {
  sharedPrimitiveSignalCount: number;
  accessibilityPrimitiveSignalCount: number;
  responsivePrimitiveSignalCount: number;
  cardDistributionSignalCount: number;
}

export interface PccCrossSurfaceEvidenceIndexSummary {
  surfaceBlockCount: number;
  presentSourceLaneCount: number;
  missingSourceLaneCount: number;
  totalPendingGaps: number;
}

export interface PccSurfaceEvidenceBlock {
  evId: PccSurfaceBlockEvidenceId;
  blockId: PccSurfaceEvidenceBlockId;
  blockType: PccSurfaceEvidenceBlockType;
  surfaceId?: PccLiveSurfaceId;
  primitiveScope?: 'shared-primitive-system' | 'cross-surface-evidence-index';
  label: string;
  disposition: PccSurfaceEvidenceBlockDisposition;
  artifactRefs: PccSurfaceEvidenceBlockArtifactRef[];
  screenshotSummary: PccSurfaceEvidenceScreenshotSummary;
  sourceStateSummary: PccSurfaceEvidenceSourceStateSummary;
  cardHierarchySummary: PccSurfaceEvidenceCardHierarchySummary;
  workflowSummary: PccSurfaceEvidenceWorkflowSummary;
  accessibilitySummary: PccSurfaceEvidenceAccessibilitySummary;
  breakpointSummary: PccSurfaceEvidenceBreakpointSummary;
  runtimeSummary: PccSurfaceEvidenceRuntimeSummary;
  contentSummary: PccSurfaceEvidenceContentSummary;
  doctrineSummary: PccSurfaceEvidenceDoctrineSummary;
  pendingGaps: PccSurfaceEvidenceGapItem[];
  expertReviewQuestions: string[];
}

export interface PccSurfaceEvidenceBlockRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  evRefs: readonly PccSurfaceBlockEvidenceId[];
  blocks: PccSurfaceEvidenceBlock[];
  summary: PccSurfaceEvidenceBlockSummary;
  primitiveSummary: PccPrimitiveEvidenceBlockSummary;
  crossSurfaceSummary: PccCrossSurfaceEvidenceIndexSummary;
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

type _EvIdNotString = AssertFalse<IsExactlyString<PccSurfaceBlockEvidenceId>>;
type _EvIdAssignable = AssertTrue<IsSubset<PccSurfaceBlockEvidenceId, PccEvidenceId>>;
type _EvIdLength = AssertTrue<
  (typeof PCC_SURFACE_BLOCK_EVIDENCE_IDS)['length'] extends 10 ? true : false
>;
type _EvIdUnique = AssertTrue<UniqueTuple<typeof PCC_SURFACE_BLOCK_EVIDENCE_IDS>>;

type _MappingLength = AssertTrue<
  (typeof PCC_SURFACE_BLOCK_MAPPING)['length'] extends 10 ? true : false
>;

void (0 as _EvIdNotString);
void (0 as _EvIdAssignable);
void (0 as _EvIdLength);
void (0 as _EvIdUnique);
void (0 as _MappingLength);
