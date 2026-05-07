import type { PccEvidenceId } from './pcc-evidence.types';

export const PCC_DOCTRINE_SOURCE_EVIDENCE_IDS = [
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
  'EV-50',
  'EV-51',
  'EV-52',
  'EV-53',
  'EV-54',
  'EV-55',
  'EV-56',
  'EV-57',
  'EV-58',
] as const;

export type PccDoctrineSourceEvidenceId = (typeof PCC_DOCTRINE_SOURCE_EVIDENCE_IDS)[number];

export type PccDoctrineSourceRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-review-pending'
  | 'writer-test-only';

export type PccDoctrineSourceDisposition =
  | 'review-support'
  | 'source-present'
  | 'source-missing'
  | 'not-observed'
  | 'expert-review-required'
  | 'operator-review-pending';

export type PccDoctrineCategory =
  | 'shell-host-fit'
  | 'navigation-orientation'
  | 'bento-card-hierarchy'
  | 'responsive-container-discipline'
  | 'accessibility-semantics'
  | 'state-feedback'
  | 'source-of-record-boundary'
  | 'hbi-authority-boundary'
  | 'external-launch-boundary'
  | 'approval-mutation-boundary'
  | 'content-language-quality'
  | 'mold-breaker-differentiation'
  | 'test-coverage-evidence'
  | 'package-version-evidence';

export type PccMoldBreakerTheme =
  | 'incumbent-failure-mode-contrast'
  | 'cognitive-load-reduction'
  | 'progressive-disclosure'
  | 'field-office-continuity'
  | 'source-clarity-and-confidence'
  | 'role-action-clarity'
  | 'pwa-live-runtime-resilience'
  | 'mold-breaker-differentiation';

export interface PccGoverningDocVerification {
  path: string;
  exists: boolean;
  sizeBytes: number;
  lineCount: number;
  sha256?: string;
  detectedHeadings: string[];
  requiredReferenceRole:
    | 'con-tech-ui-study'
    | 'con-tech-ux-study'
    | 'ui-doctrine'
    | 'acceptance-scoring-model'
    | 'pcc-scorecard';
  reviewDisposition: PccDoctrineSourceDisposition;
  notes: string[];
}

export interface PccSourceFileIndexEntry {
  path: string;
  sourceArea: string;
  extension: string;
  kind:
    | 'shell'
    | 'layout'
    | 'surface'
    | 'ui'
    | 'test'
    | 'config'
    | 'tool-config'
    | 'evidence-tooling'
    | 'blueprint-doc'
    | 'planning-doc'
    | 'unknown';
  exists: boolean;
  sizeBytes: number;
  lineCount: number;
  sha256?: string;
  detectedMarkers: string[];
  boundedSignalSnippets: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
}

export interface PccDoctrineConformanceItem {
  category: PccDoctrineCategory;
  relatedEvidenceIds: readonly PccEvidenceId[];
  supportingDocPaths: string[];
  supportingSourcePaths: string[];
  observedSignals: string[];
  missingSignals: string[];
  expertReviewQuestions: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
}

export interface PccMoldBreakerReviewItem {
  theme: PccMoldBreakerTheme;
  relatedEvidenceIds: readonly PccEvidenceId[];
  supportingDocPaths: string[];
  supportingSourceAreas: string[];
  observedSignals: string[];
  incumbentFailureModeContrast: string;
  expertReviewQuestions: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
}

export interface PccPackageVersionProof {
  packageSolutionPath?: string;
  manifestPaths: string[];
  detectedVersions: string[];
  packageNameSignals: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
  notes: string[];
}

export interface PccDoctrineSourceEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  repoRootLabel: string;
  selfSkipped: boolean;
  runState: PccDoctrineSourceRunState;
  evRefs: readonly PccEvidenceId[];
  governingDocs: PccGoverningDocVerification[];
  sourceIndex: PccSourceFileIndexEntry[];
  doctrineConformance: PccDoctrineConformanceItem[];
  moldBreakerReview: PccMoldBreakerReviewItem[];
  packageVersionProof: PccPackageVersionProof;
  summary: {
    governingDocCount: number;
    missingGoverningDocCount: number;
    indexedSourceFileCount: number;
    missingSourceAreaCount: number;
    doctrineCategoryCount: number;
    moldBreakerThemeCount: number;
    expertReviewRequiredCount: number;
    warningCount: number;
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

type _EvIdNotString = AssertFalse<IsExactlyString<PccDoctrineSourceEvidenceId>>;
type _EvIdAssignable = AssertTrue<IsSubset<PccDoctrineSourceEvidenceId, PccEvidenceId>>;
type _EvIdLength = AssertTrue<
  (typeof PCC_DOCTRINE_SOURCE_EVIDENCE_IDS)['length'] extends 22 ? true : false
>;
type _EvIdUnique = AssertTrue<UniqueTuple<typeof PCC_DOCTRINE_SOURCE_EVIDENCE_IDS>>;

void (0 as _EvIdNotString);
void (0 as _EvIdAssignable);
void (0 as _EvIdLength);
void (0 as _EvIdUnique);
