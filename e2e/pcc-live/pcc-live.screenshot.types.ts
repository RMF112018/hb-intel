import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccHardStopRef, PccScorecardPillarRef } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS = [
  'EV-37',
  'EV-38',
  'EV-39',
  'EV-40',
  'EV-41',
  'EV-42',
  'EV-43',
  'EV-44',
  'EV-45',
  'EV-46',
  'EV-47',
  'EV-48',
  'EV-49',
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

export type PccScreenshotInitialEvidenceId = (typeof PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS)[number];

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

type _EvidenceTupleNotString = AssertFalse<IsExactlyString<PccScreenshotInitialEvidenceId>>;
type _EvidenceTupleAssignableToPrompt02 = AssertTrue<
  IsSubset<PccScreenshotInitialEvidenceId, PccEvidenceId>
>;
type _EvidenceTupleUnique = AssertTrue<UniqueTuple<typeof PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS>>;

export type PccScreenshotKind = 'above-fold' | 'full-page' | 'scroll-segment';
export type PccScrollRootKind = 'active-surface-panel' | 'pcc-container' | 'window-document';
export type PccScrollSegmentClassification = 'meaningful' | 'duplicate' | 'not-scrollable';

export interface PccScreenshotArtifact {
  surfaceId: PccLiveSurfaceId;
  kind: PccScreenshotKind;
  path: string;
  fileName: string;
  width: number;
  height: number;
  scrollY?: number;
  viewportWidth: number;
  viewportHeight: number;
  segmentIndex?: number;
  segmentCount?: number;
  requestedScrollY?: number;
  actualScrollY: number;
  meaningfulScrollDelta: number;
  scrollRootKind: PccScrollRootKind;
  scrollRootSelector: string;
  contentScrollHeight: number;
  contentClientHeight: number;
  actualWindowScrollY: number;
  actualDocumentScrollLeft: number;
  actualBodyScrollLeft: number;
  maxHorizontalScrollLeftObserved: number;
  activeSurfacePanelLeft: number | null;
  activeSurfacePanelRight: number | null;
  activeSurfacePanelWidth: number | null;
  activeSurfacePanelScrollLeft: number | null;
  bentoGridLeft: number | null;
  bentoGridRight: number | null;
  bentoGridWidth: number | null;
  documentClientWidth: number;
  documentScrollWidth: number;
  horizontalResetApplied: boolean;
  horizontalScrollWithinTolerance: boolean;
  surfacePanelLeftWithinTolerance: boolean;
  bentoGridLeftWithinTolerance: boolean;
  captureReliabilityWarnings: string[];
  notScrollableReason?: string;
  segmentClassification?: PccScrollSegmentClassification;
  contentSha256?: string;
  fileSizeBytes?: number;
  operatorReviewRequired: true;
}

export interface PccDomCardSummary {
  surfaceId: PccLiveSurfaceId;
  index: number;
  hierarchy?: string;
  tier?: string;
  region?: string;
  footprint?: string;
  headingLevel?: string;
  headingText?: string;
  cardSelector: string;
  textWasSanitized: boolean;
}

export interface PccSurfaceScreenshotEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  passed: boolean;
  screenshots: PccScreenshotArtifact[];
  cardSummaries: PccDomCardSummary[];
  warnings: string[];
}

export interface PccScreenshotEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: 'completed' | 'self-skipped' | 'writer-test-only';
  evRefs: readonly PccEvidenceId[];
  surfaces: PccSurfaceScreenshotEvidence[];
  summary: {
    totalSurfaces: number;
    surfacesWithScreenshots: number;
    totalScreenshots: number;
    totalCards: number;
    totalWarnings: number;
  };
  warnings: string[];
  disclaimer: string;
}

export interface PccScreenshotManifestByEvRow {
  evId: PccEvidenceId;
  pillarRefs: readonly PccScorecardPillarRef[];
  hardStopRefs: readonly PccHardStopRef[];
  surfaceId: PccLiveSurfaceId;
  surfaceLabel: string;
  screenshotKind: PccScreenshotKind;
  fileName: string;
  path: string;
  displayPath: string;
  viewportWidth: number;
  viewportHeight: number;
  operatorReviewRequired: true;
  artifactPolicy:
    | 'operator-review-required'
    | 'not-auto-commit-eligible'
    | 'commit-eligible-after-scrub';
  reviewPrompts: readonly string[];
}
