export const REQUIRED_PCC_EVIDENCE_IDS = [
  ...Array.from({ length: 70 }, (_, i) => `EV-${i + 37}`),
  ...Array.from({ length: 10 }, (_, i) => `EV-${i + 125}`),
] as const;

export type PccEvidenceId = (typeof REQUIRED_PCC_EVIDENCE_IDS)[number];

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
