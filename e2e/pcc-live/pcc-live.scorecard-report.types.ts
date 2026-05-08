import type {
  PccEvidenceId,
  PccEvidenceStatus,
  PccHardStopRef,
  PccScorecardPillarRef,
} from './pcc-evidence.types';

export type PccScorecardReportRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-review-pending'
  | 'writer-test-only';

export type PccScorecardReportDisposition =
  | 'report-ready-for-expert-review'
  | 'expert-review-required'
  | 'operator-review-pending'
  | 'evidence-package-gap'
  | 'source-missing'
  | 'not-observed'
  | 'registry-listed'
  | 'artifact-referenced';

export type PccScorecardReportSourceLane =
  | 'registry'
  | 'traceability'
  | 'surface-blocks'
  | 'doctrine-source'
  | 'content'
  | 'conditional'
  | 'workflow'
  | 'accessibility'
  | 'breakpoint'
  | 'screenshot'
  | 'surface-smoke'
  | 'package-completeness'
  | 'runtime'
  | 'operator';

export type PccScorecardReportArtifactKind =
  | 'json-summary'
  | 'markdown-summary'
  | 'worksheet'
  | 'report-section'
  | 'index'
  | 'register';

export interface PccScorecardReportArtifactRef {
  artifactKind: PccScorecardReportArtifactKind;
  sourceLane: PccScorecardReportSourceLane;
  path: string;
  description: string;
  exists: boolean;
  operatorReviewRequired: boolean;
}

export interface PccScorecardReportEvidenceCoverageRow {
  evidenceId: PccEvidenceId;
  registryStatus: PccEvidenceStatus | 'not-listed';
  coverageDisposition: PccScorecardReportDisposition;
  artifactReferenceCount: number;
  pillarRefs: readonly PccScorecardPillarRef[];
  hardStopRefs: readonly PccHardStopRef[];
  notes: string[];
}

export interface PccScorecardReportPillarRow {
  pillarId: PccScorecardPillarRef;
  title: string;
  weight: number;
  evidenceIds: readonly PccEvidenceId[];
  manualScore: null;
  automatedScore: null;
  scoringOwner: 'expert-review';
  disposition: PccScorecardReportDisposition;
  notes: string[];
}

export interface PccScorecardReportHardStopRow {
  hardStopId: PccHardStopRef;
  title: string;
  blocksPhase4: true;
  reviewStatus: 'manual-review-required';
  evidenceIds: readonly PccEvidenceId[];
  disposition: PccScorecardReportDisposition;
  notes: string[];
}

export interface PccScorecardReportFinding {
  id: string;
  category:
    | 'coverage-gap'
    | 'evidence-package-gap'
    | 'source-missing'
    | 'manual-review-required'
    | 'taxonomy'
    | 'environment-validation';
  disposition: PccScorecardReportDisposition;
  sourceLane: PccScorecardReportSourceLane;
  title: string;
  detail: string;
  evidenceIds: readonly PccEvidenceId[];
}

export interface PccScorecardReportResidualRisk {
  id: string;
  sourceLane: PccScorecardReportSourceLane;
  disposition: PccScorecardReportDisposition;
  statement: string;
  mitigation: string;
}

export interface PccScorecardReportExpertScoringRow {
  pillarId: PccScorecardPillarRef;
  pillarTitle: string;
  weight: number;
  evidenceIds: readonly PccEvidenceId[];
  manualScore: null;
  automatedScore: null;
  reviewerOwner: 'expert-review';
  reviewPrompt: string;
}

export interface PccScorecardReportAuditPackageIndexItem {
  file: string;
  artifactKind: PccScorecardReportArtifactKind;
  sourceLane: PccScorecardReportSourceLane;
  description: string;
  required: boolean;
}

export interface PccScorecardReportSummary {
  requiredEvidenceCount: number;
  registeredEvidenceCount: number;
  evidenceReferencedCount: number;
  missingEvidenceCount: number;
  pillarCount: number;
  hardStopCount: number;
  manualScoreRequiredCount: number;
  manualHardStopReviewRequiredCount: number;
  artifactReferenceCount: number;
  findingCount: number;
  residualRiskCount: number;
  expertReviewRequiredCount: number;
  operatorPendingCount: number;
  sourceMissingCount: number;
}

export interface PccScorecardReportRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  repoCommit?: string;
  registryEvidenceCount: number;
  requiredEvidenceCount: number;
  summary: PccScorecardReportSummary;
  evidenceCoverage: PccScorecardReportEvidenceCoverageRow[];
  pillarRows: PccScorecardReportPillarRow[];
  hardStopRows: PccScorecardReportHardStopRow[];
  findings: PccScorecardReportFinding[];
  residualRisks: PccScorecardReportResidualRisk[];
  expertScoringWorksheet: PccScorecardReportExpertScoringRow[];
  artifactInventory: PccScorecardReportArtifactRef[];
  auditPackageIndex: PccScorecardReportAuditPackageIndexItem[];
  warnings: string[];
  disclaimer: string;
  runState: PccScorecardReportRunState;
  finalDisposition: PccScorecardReportDisposition;
}
