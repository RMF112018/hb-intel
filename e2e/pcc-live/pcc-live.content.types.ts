import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveSurfaceId } from './pcc-live.surfaces';

export const PCC_CONTENT_LANGUAGE_EVIDENCE_IDS = [
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

export type PccContentLanguageEvidenceId = (typeof PCC_CONTENT_LANGUAGE_EVIDENCE_IDS)[number];

export type PccContentRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-pending'
  | 'writer-test-only';

export type PccVisibleCopyKind =
  | 'heading'
  | 'card-title'
  | 'action-label'
  | 'disabled-reason'
  | 'status-label'
  | 'state-copy'
  | 'source-label'
  | 'source-confidence'
  | 'freshness-label'
  | 'hbi-copy'
  | 'hbi-authority'
  | 'owner-responsibility'
  | 'mock-fixture-label'
  | 'navigation-label'
  | 'cross-module-reference'
  | 'unknown';

export type PccContentReviewCategory =
  | 'construction-language'
  | 'state-copy-quality'
  | 'source-of-record-language'
  | 'hbi-authority-language'
  | 'disabled-reason-copy'
  | 'owner-action-responsibility'
  | 'mock-fixture-transparency';

export type PccContentReviewDisposition =
  | 'review-support'
  | 'needs-review'
  | 'operator-pending'
  | 'not-observed';

export interface PccVisibleCopySignalFlags {
  constructionVocabulary: boolean;
  ownershipLanguage: boolean;
  nextActionLanguage: boolean;
  sourceBoundaryLanguage: boolean;
  sourceConfidenceLanguage: boolean;
  freshnessLanguage: boolean;
  hbiMention: boolean;
  hbiAdvisoryLanguage: boolean;
  hbiMutationAuthorityRisk: boolean;
  readOnlyPreviewDeferredLanguage: boolean;
  disabledReasonLanguage: boolean;
  mockFixtureDemoLanguage: boolean;
  crossModuleLanguage: boolean;
}

export interface PccVisibleCopyRecord {
  surfaceId: PccLiveSurfaceId;
  kind: PccVisibleCopyKind;
  selector: string;
  textSnippet: string;
  textHash: string;
  charCount: number;
  wordCount: number;
  visible: boolean;
  signals: PccVisibleCopySignalFlags;
  needsReview: boolean;
}

export interface PccContentReviewFinding {
  category: PccContentReviewCategory;
  disposition: PccContentReviewDisposition;
  surfaceId?: PccLiveSurfaceId;
  evidenceIds: readonly PccEvidenceId[];
  title: string;
  rationale: string;
  supportingCopyHashes: string[];
  reviewerPrompt: string;
}

export interface PccContentSurfaceSummary {
  surfaceId: PccLiveSurfaceId;
  label: string;
  visibleCopyCount: number;
  headingCount: number;
  actionLabelCount: number;
  disabledReasonCount: number;
  stateCopyCount: number;
  sourceLabelCount: number;
  hbiCopyCount: number;
  ownerResponsibilityCount: number;
  mockFixtureLabelCount: number;
  needsReviewCount: number;
}

export interface PccContentEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccContentRunState;
  evRefs: readonly PccEvidenceId[];
  surfaces: PccContentSurfaceSummary[];
  copyRecords: PccVisibleCopyRecord[];
  findings: PccContentReviewFinding[];
  summary: {
    surfaceCount: number;
    copyRecordCount: number;
    findingCount: number;
    constructionLanguageFindingCount: number;
    stateCopyFindingCount: number;
    sourceLanguageFindingCount: number;
    hbiAuthorityFindingCount: number;
    disabledReasonFindingCount: number;
    ownerActionFindingCount: number;
    mockFixtureFindingCount: number;
    needsReviewCount: number;
    warningCount: number;
  };
  warnings: string[];
  disclaimer: string;
}

type IsExactlyString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;

type _Len = AssertTrue<
  (typeof PCC_CONTENT_LANGUAGE_EVIDENCE_IDS)['length'] extends 24 ? true : false
>;
type _NoWiden = AssertFalse<IsExactlyString<PccContentLanguageEvidenceId>>;
type _Assignable = AssertTrue<PccContentLanguageEvidenceId extends PccEvidenceId ? true : false>;
type _Unique = AssertTrue<
  Extract<
    'EV-83',
    | 'EV-84'
    | 'EV-85'
    | 'EV-86'
    | 'EV-87'
    | 'EV-88'
    | 'EV-89'
    | 'EV-90'
    | 'EV-91'
    | 'EV-92'
    | 'EV-93'
    | 'EV-94'
    | 'EV-95'
    | 'EV-96'
    | 'EV-97'
    | 'EV-98'
    | 'EV-99'
    | 'EV-100'
    | 'EV-101'
    | 'EV-102'
    | 'EV-103'
    | 'EV-104'
    | 'EV-105'
    | 'EV-106'
  > extends never
    ? true
    : true
>;

void (0 as _Len);
void (0 as _NoWiden);
void (0 as _Assignable);
void (0 as _Unique);
