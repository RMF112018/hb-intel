import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_ACCESSIBILITY_EVIDENCE_IDS = [
  'EV-72',
  'EV-73',
  'EV-74',
  'EV-75',
  'EV-76',
  'EV-77',
  'EV-78',
  'EV-79',
  'EV-80',
  'EV-81',
  'EV-82',
] as const;

export type PccAccessibilityEvidenceId = (typeof PCC_ACCESSIBILITY_EVIDENCE_IDS)[number];
export type PccA11yRunState = 'completed' | 'self-skipped' | 'writer-test-only';

export type PccA11yObservationStatus =
  | 'observed'
  | 'not-observed'
  | 'needs-review'
  | 'operator-review-pending';

export interface PccAxeViolationSummary {
  surfaceId: PccLiveSurfaceId;
  ruleId: string;
  impact?: string;
  count: number;
  help?: string;
  helpUrl?: string;
  tags: string[];
  sanitizedTargets: string[];
}

export interface PccKeyboardFocusObservation {
  surfaceId: PccLiveSurfaceId;
  focusStep: number;
  role?: string;
  tagName: string;
  selector: string;
  hasAccessibleName: boolean;
  hasVisibleFocusIndicator: boolean;
  boundingWidth: number;
  boundingHeight: number;
}

export interface PccAriaLabelObservation {
  surfaceId: PccLiveSurfaceId;
  selector: string;
  tagName: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  accessibleNamePresent: boolean;
  disabled: boolean;
  disabledReasonPresent: boolean;
  needsReview: boolean;
}

export interface PccContrastObservation {
  surfaceId: PccLiveSurfaceId;
  ruleId: 'color-contrast' | 'computed-contrast-heuristic';
  count: number;
  needsReview: boolean;
  details: string;
}

export interface PccReducedMotionObservation {
  surfaceId: PccLiveSurfaceId;
  reducedMotionEmulated: boolean;
  animationRiskCount: number;
  transitionRiskCount: number;
  needsReview: boolean;
}

export interface PccHoverOnlyObservation {
  surfaceId: PccLiveSurfaceId;
  hoverOnlyRiskCount: number;
  selectors: string[];
  needsReview: boolean;
}

export interface PccDialogFocusObservation {
  surfaceId: PccLiveSurfaceId;
  status: PccA11yObservationStatus;
  dialogCount: number;
  modalCount: number;
  focusTrapObserved?: boolean;
  notes: string[];
}

export interface PccA11yTouchTargetObservation {
  surfaceId: PccLiveSurfaceId;
  selector: string;
  role?: string;
  tagName: string;
  width: number;
  height: number;
  belowRecommendedSize: boolean;
}

export interface PccAccessibilitySurfaceEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  axeViolations: PccAxeViolationSummary[];
  keyboardFocus: PccKeyboardFocusObservation[];
  ariaLabels: PccAriaLabelObservation[];
  contrast: PccContrastObservation[];
  reducedMotion: PccReducedMotionObservation;
  hoverOnly: PccHoverOnlyObservation;
  dialogFocus: PccDialogFocusObservation;
  touchTargets: PccA11yTouchTargetObservation[];
  warnings: string[];
}

export interface PccAccessibilityEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccA11yRunState;
  evRefs: readonly PccEvidenceId[];
  surfaces: PccAccessibilitySurfaceEvidence[];
  summary: {
    totalSurfaces: number;
    totalAxeViolations: number;
    totalKeyboardFocusStops: number;
    totalAriaNeedsReview: number;
    totalContrastNeedsReview: number;
    totalReducedMotionRisks: number;
    totalHoverOnlyRisks: number;
    totalDialogFocusNeedsReview: number;
    totalTouchTargetIssues: number;
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

type _EvIdNotString = AssertFalse<IsExactlyString<PccAccessibilityEvidenceId>>;
type _EvIdAssignable = AssertTrue<IsSubset<PccAccessibilityEvidenceId, PccEvidenceId>>;
type _EvIdLength = AssertTrue<
  (typeof PCC_ACCESSIBILITY_EVIDENCE_IDS)['length'] extends 11 ? true : false
>;
type _EvIdUnique = AssertTrue<UniqueTuple<typeof PCC_ACCESSIBILITY_EVIDENCE_IDS>>;
