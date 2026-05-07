export const REQUIRED_PCC_EVIDENCE_IDS = [
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

export type PccEvidenceId = (typeof REQUIRED_PCC_EVIDENCE_IDS)[number];

type IsExactlyString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type _PccEvidenceIdMustNotBeString = AssertFalse<IsExactlyString<PccEvidenceId>>;
type _PccEvidenceIdMatchesRequiredTuple = AssertTrue<
  IsEqual<PccEvidenceId, (typeof REQUIRED_PCC_EVIDENCE_IDS)[number]>
>;

export type PccEvidenceStatus =
  | 'not-started'
  | 'foundation-ready'
  | 'operator-pending'
  | 'captured'
  | 'review-required'
  | 'blocked'
  | 'not-applicable';

export type PccEvidenceAutomationLevel =
  | 'automated'
  | 'semi-automated'
  | 'manual-review'
  | 'operator-supplied';

export type PccEvidenceCapturePhase =
  | 'prompt-01-harness-foundation'
  | 'prompt-02-registry-and-manifest'
  | 'live-runtime-capture'
  | 'breakpoint-capture'
  | 'accessibility-capture'
  | 'state-capture'
  | 'source-review'
  | 'expert-review'
  | 'final-report';

export type PccEvidenceCategory =
  | 'governing-doctrine'
  | 'mold-breaker-study'
  | 'pcc-source'
  | 'visual-surface'
  | 'tenant-runtime'
  | 'breakpoint-container'
  | 'accessibility'
  | 'interaction-workflow'
  | 'state-model'
  | 'source-of-record'
  | 'content-language'
  | 'test-validation'
  | 'package-version'
  | 'hard-stop'
  | 'closure-reproducibility';

export type PccScorecardPillarRef = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9';

export type PccHardStopRef =
  | 'HS-01'
  | 'HS-02'
  | 'HS-03'
  | 'HS-04'
  | 'HS-05'
  | 'HS-06'
  | 'HS-07'
  | 'HS-08'
  | 'HS-09'
  | 'HS-10';

export interface PccEvidenceSourceRef {
  type: 'scorecard' | 'doctrine' | 'study' | 'repo-path' | 'prompt' | 'test' | 'operator';
  ref: string;
  note?: string;
}

export interface PccRequiredArtifact {
  kind:
    | 'screenshot'
    | 'json-summary'
    | 'markdown-summary'
    | 'source-path'
    | 'test-output'
    | 'console-summary'
    | 'accessibility-summary'
    | 'operator-note'
    | 'review-note'
    | 'manifest-reference';
  description: string;
  requiredForCapturedStatus: boolean;
}

export interface PccEvidenceRecord {
  id: PccEvidenceId;
  title: string;
  objective: string;
  pillarRefs: PccScorecardPillarRef[];
  hardStopRefs: PccHardStopRef[];
  evidenceCategory: PccEvidenceCategory;
  automationLevel: PccEvidenceAutomationLevel;
  status: PccEvidenceStatus;
  capturePhase: PccEvidenceCapturePhase;
  requiredArtifacts: PccRequiredArtifact[];
  reviewerNotes: string;
  sourceRefs: PccEvidenceSourceRef[];
}

export interface PccEvidenceRunMetadata {
  runId: string;
  generatedAtIso: string;
  repoCommit?: string;
  packageVersion?: string;
  expectedPackageVersion?: string;
  tenantSiteUrl?: string;
  tenantPageUrl?: string;
  evidenceOutputDir: string;
  generatedBy: 'pcc-live-playwright-harness';
  prompt: 'Prompt 02 — Evidence Registry and Manifest Writer';
}

export interface PccEvidenceCoverageResult {
  requiredCount: number;
  registryCount: number;
  missingIds: PccEvidenceId[];
  duplicateIds: PccEvidenceId[];
  unexpectedIds: string[];
  malformedIds: string[];
  statusCounts: Record<PccEvidenceStatus, number>;
  hardStopCounts: Partial<Record<PccHardStopRef, number>>;
  warnings: string[];
}

export interface PccEvidenceManifest {
  metadata: PccEvidenceRunMetadata;
  disclaimer: string;
  coverage: PccEvidenceCoverageResult;
  records: PccEvidenceRecord[];
  artifactPaths: string[];
}

export interface CreatePccEvidenceManifestInput {
  metadata: PccEvidenceRunMetadata;
  registry: readonly PccEvidenceRecord[];
  artifactPaths?: string[];
}

export interface WritePccEvidenceManifestInput extends CreatePccEvidenceManifestInput {
  outputDir: string;
}

export interface PccEvidenceManifestWriteResult {
  manifest: PccEvidenceManifest;
  manifestPath: string;
  summaryPath: string;
}

export const PCC_EVIDENCE_DISCLAIMER =
  'This manifest is evidence traceability only. It is not a final 100-point scorecard result.';
