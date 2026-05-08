export type PccEvidencePackageCompletenessStatus =
  | 'present'
  | 'missing'
  | 'operator-pending'
  | 'not-configured'
  | 'self-skipped'
  | 'blocked'
  | 'unavailable';

export type PccEvidencePackageGroupId =
  | 'surface-smoke'
  | 'surface-screenshots'
  | 'breakpoints'
  | 'accessibility'
  | 'workflow'
  | 'content'
  | 'doctrine-source'
  | 'conditional'
  | 'surface-blocks'
  | 'scorecard-report';

export interface PccEvidencePackageExpectedGroup {
  groupId: PccEvidencePackageGroupId;
  label: string;
  requiredForFullPhase4ScoringPackage: boolean;
  expectedDirectoryPrefix: string;
  expectedFiles: readonly string[];
  absenceDefaultStatus: PccEvidencePackageCompletenessStatus;
  notes: readonly string[];
}

export interface PccEvidencePackageGroupCompleteness {
  groupId: PccEvidencePackageGroupId;
  label: string;
  required: boolean;
  expectedGlobOrPrefix: string;
  expectedFiles: readonly string[];
  observed: boolean;
  observedPathCount: number;
  observedPaths: readonly string[];
  missingExpectedFiles: readonly string[];
  status: PccEvidencePackageCompletenessStatus;
  notes: readonly string[];
  recommendedAction: string;
}

export interface PccEvidencePackageUnsafeReasonSummary {
  reason:
    | 'raw-playwright-artifact'
    | 'auth-session-secret-material'
    | 'trace-or-archive-artifact'
    | 'network-or-video-artifact';
  count: number;
}

export interface PccEvidencePackageCompletenessSummary {
  expectedGroupCount: number;
  presentGroupCount: number;
  missingGroupCount: number;
  operatorPendingGroupCount: number;
  notConfiguredGroupCount: number;
  selfSkippedGroupCount: number;
  blockedGroupCount: number;
  unavailableGroupCount: number;
  requiredMissingGroupCount: number;
  observedPathCount: number;
  excludedUnsafePathCount: number;
  excludedUnsafePathReasons: readonly PccEvidencePackageUnsafeReasonSummary[];
}

export interface PccEvidencePackageCompletenessRun {
  runId: string;
  generatedAtIso: string;
  sourceRoot?: string;
  inventorySource: 'artifact-paths' | 'run-directory' | 'combined';
  groups: readonly PccEvidencePackageGroupCompleteness[];
  summary: PccEvidencePackageCompletenessSummary;
  disclaimer: string;
  finalDisposition: 'expert-review-required' | 'operator-review-required';
}

export interface EvaluatePccEvidencePackageCompletenessInput {
  runId?: string;
  generatedAtIso?: string;
  sourceRoot?: string;
  artifactPaths?: readonly string[];
  statusOverrides?: Partial<
    Record<PccEvidencePackageGroupId, PccEvidencePackageCompletenessStatus>
  >;
  notesByGroup?: Partial<Record<PccEvidencePackageGroupId, readonly string[]>>;
  recommendedActionsByGroup?: Partial<Record<PccEvidencePackageGroupId, string>>;
}

export interface WritePccEvidencePackageCompletenessInput extends EvaluatePccEvidencePackageCompletenessInput {
  outputDir: string;
}

export interface WritePccEvidencePackageCompletenessResult {
  outputDir: string;
  run: PccEvidencePackageCompletenessRun;
  jsonPath: string;
  markdownPath: string;
}
