import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_BREAKPOINT_EVIDENCE_IDS = [
  'EV-59',
  'EV-60',
  'EV-61',
  'EV-62',
  'EV-63',
  'EV-64',
  'EV-65',
  'EV-66',
  'EV-67',
  'EV-68',
  'EV-69',
  'EV-70',
  'EV-71',
] as const;

export type PccBreakpointEvidenceId = (typeof PCC_BREAKPOINT_EVIDENCE_IDS)[number];

export type PccLiveResponsiveMode =
  | 'phone'
  | 'tabletPortrait'
  | 'tabletLandscape'
  | 'smallLaptop'
  | 'standardLaptop'
  | 'largeLaptop'
  | 'desktop'
  | 'ultrawide';

export interface PccLiveViewportDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
  touch: boolean;
}

export interface PccLiveGridMeasurement {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  browserViewportWidth: number;
  browserViewportHeight: number;
  measuredContainerWidth: number;
  measuredContainerHeight: number;
  observedMode?: PccLiveResponsiveMode | string;
  derivedMode: PccLiveResponsiveMode;
  expectedColumns: number;
  observedGridSafety?: string;
  horizontalScrollDetected: boolean;
  viewportOverflowX: number;
  documentScrollWidth: number;
  documentClientWidth: number;
}

export interface PccLiveCardMeasurement {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  index: number;
  footprint?: string;
  hierarchy?: string;
  tier?: string;
  region?: string;
  headingLevel?: string;
  dataMode?: string;
  columnSpan?: number;
  rowSpan?: number;
  measuredHeight?: number;
  boundingWidth: number;
  boundingHeight: number;
  directChildOfGrid: boolean;
  clipped: boolean;
  overflowX: boolean;
  overflowY: boolean;
  minTouchTargetIssueCount: number;
}

export interface PccLiveTouchTargetMeasurement {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  selector: string;
  role?: string;
  tagName: string;
  width: number;
  height: number;
  belowRecommendedSize: boolean;
}

export interface PccLiveBreakpointScreenshotArtifact {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  path: string;
  fileName: string;
  viewportWidth: number;
  viewportHeight: number;
  operatorReviewRequired: true;
}

export interface PccLiveBreakpointSurfaceEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  viewportId: string;
  viewportLabel: string;
  grid: PccLiveGridMeasurement;
  cards: PccLiveCardMeasurement[];
  touchTargets: PccLiveTouchTargetMeasurement[];
  screenshot?: PccLiveBreakpointScreenshotArtifact;
  warnings: string[];
}

export interface PccLiveBreakpointEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: 'completed' | 'self-skipped' | 'writer-test-only';
  evRefs: readonly PccEvidenceId[];
  surfaces: PccLiveBreakpointSurfaceEvidence[];
  summary: {
    totalSurfaceViewportPairs: number;
    totalScreenshots: number;
    totalCardsMeasured: number;
    totalTouchTargetsMeasured: number;
    totalWarnings: number;
    modeMismatchCount: number;
    horizontalOverflowCount: number;
    clippedCardCount: number;
    directChildIssueCount: number;
    touchTargetIssueCount: number;
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

type _BreakpointEvIdNotString = AssertFalse<IsExactlyString<PccBreakpointEvidenceId>>;
type _BreakpointEvIdAssignable = AssertTrue<IsSubset<PccBreakpointEvidenceId, PccEvidenceId>>;
type _BreakpointEvIdUnique = AssertTrue<UniqueTuple<typeof PCC_BREAKPOINT_EVIDENCE_IDS>>;
type _BreakpointEvIdLength = AssertTrue<
  (typeof PCC_BREAKPOINT_EVIDENCE_IDS)['length'] extends 13 ? true : false
>;
type _ResponsiveModeNotString = AssertFalse<IsExactlyString<PccLiveResponsiveMode>>;
