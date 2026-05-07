import {
  REQUIRED_PCC_EVIDENCE_IDS,
  type PccEvidenceId,
  type PccEvidenceRecord,
} from './pcc-evidence.types';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
import {
  buildPccHardStopWorksheet,
  buildPccPillarEvidenceMap,
  buildPccScorecardWorksheet,
} from './pcc-scorecard.traceability';
import type {
  PccScorecardReportArtifactRef,
  PccScorecardReportAuditPackageIndexItem,
  PccScorecardReportDisposition,
  PccScorecardReportEvidenceCoverageRow,
  PccScorecardReportExpertScoringRow,
  PccScorecardReportFinding,
  PccScorecardReportHardStopRow,
  PccScorecardReportPillarRow,
  PccScorecardReportResidualRisk,
  PccScorecardReportRun,
  PccScorecardReportSourceLane,
} from './pcc-live.scorecard-report.types';

export const PCC_SCORECARD_REPORT_DISCLAIMER =
  'This output is a draft PCC scorecard report and audit package for expert review only. It is not a final 100-point scorecard result, does not calculate points, does not mark any EV captured, and does not mark any hard stop passed or failed.';

export const PCC_SCORECARD_REPORT_OUTPUT_FILES = [
  'pcc-live-scorecard-report.json',
  'pcc-live-scorecard-report.md',
  'executive-review-summary.md',
  'audit-package-index.json',
  'audit-package-index.md',
  'evidence-coverage-matrix.json',
  'evidence-coverage-matrix.md',
  'pillar-evidence-map.json',
  'pillar-evidence-map.md',
  'hard-stop-worksheet.json',
  'hard-stop-worksheet.md',
  'expert-scoring-worksheet.json',
  'expert-scoring-worksheet.md',
  'findings-register.json',
  'findings-register.md',
  'residual-risk-register.json',
  'residual-risk-register.md',
  'artifact-inventory.json',
  'artifact-inventory.md',
  'manual-review-checklist.md',
  'final-report-readme.md',
] as const;

const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;

function sanitizeText(input: string, max = 180): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  const noQuery = normalized.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secret|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noArtifacts = noCred
    .replace(/test-results/gi, '[redacted-artifact]')
    .replace(/playwright-report/gi, '[redacted-artifact]')
    .replace(/trace\.zip/gi, '[redacted-artifact]')
    .replace(/video\.webm/gi, '[redacted-artifact]')
    .replace(/network\.har/gi, '[redacted-artifact]')
    .replace(/\.auth/gi, '[redacted-cred]')
    .replace(/\.e2e-auth/gi, '[redacted-cred]');
  const noClaims = noArtifacts
    .replace(/hard stop passed/gi, '[redacted-claim]')
    .replace(/hard stop failed/gi, '[redacted-claim]')
    .replace(/score-ready/gi, '[redacted-claim]')
    .replace(/phase 4 ready/gi, '[redacted-claim]')
    .replace(/56\/56 achieved/gi, '[redacted-claim]')
    .replace(/100\/100/gi, '[redacted-claim]')
    .replace(/mold breaker achieved/gi, '[redacted-claim]')
    .replace(/deployment ready/gi, '[redacted-claim]')
    .replace(/ready for phase 4/gi, '[redacted-claim]')
    .replace(/\bcaptured\b/gi, '[redacted-claim]');
  const noHtml = noClaims.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, max);
}

function safeArtifactPath(pathLike: string): boolean {
  return !/(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|session|secret|trace|video|har/i.test(
    pathLike,
  );
}

function asLane(pathText: string): PccScorecardReportSourceLane {
  const lower = pathText.toLowerCase();
  if (lower.includes('surface-block')) return 'surface-blocks';
  if (lower.includes('doctrine')) return 'doctrine-source';
  if (lower.includes('content')) return 'content';
  if (lower.includes('conditional')) return 'conditional';
  if (lower.includes('workflow')) return 'workflow';
  if (lower.includes('accessibility') || lower.includes('axe')) return 'accessibility';
  if (lower.includes('breakpoint')) return 'breakpoint';
  if (lower.includes('screenshot')) return 'screenshot';
  if (lower.includes('surface-smoke')) return 'surface-smoke';
  if (lower.includes('runtime')) return 'runtime';
  return 'operator';
}

function byEv(a: PccEvidenceId, b: PccEvidenceId): number {
  return Number(a.slice(3)) - Number(b.slice(3));
}

function toUniqueEvidence(ids: readonly PccEvidenceId[]): PccEvidenceId[] {
  return [...new Set(ids)].sort(byEv);
}

function defaultAuditPackageIndex(): PccScorecardReportAuditPackageIndexItem[] {
  return [...PCC_SCORECARD_REPORT_OUTPUT_FILES]
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({
      file,
      artifactKind: file.endsWith('.json')
        ? ('json-summary' as const)
        : ('markdown-summary' as const),
      sourceLane: 'operator' as const,
      description: sanitizeText(`Prompt 13 audit package output: ${file}`),
      required: true,
    }));
}

export interface AssemblePccScorecardReportInput {
  runId?: string;
  generatedAtIso?: string;
  tenantSiteUrl?: string;
  tenantPageUrl?: string;
  expectedPackageVersion?: string;
  repoCommit?: string;
  registry?: readonly PccEvidenceRecord[];
  artifactPaths?: readonly string[];
  environmentValidationExceptions?: readonly string[];
}

export function assemblePccScorecardReport(
  input: AssemblePccScorecardReportInput = {},
): PccScorecardReportRun {
  const registry = (input.registry ?? PCC_EVIDENCE_REGISTRY)
    .slice()
    .sort((a, b) => byEv(a.id, b.id));
  const registryById = new Map(registry.map((r) => [r.id, r]));

  const warnings: string[] = [];
  const findings: PccScorecardReportFinding[] = [];
  const residualRisks: PccScorecardReportResidualRisk[] = [];
  const evidenceCoverage: PccScorecardReportEvidenceCoverageRow[] = [];

  const artifactInventory: PccScorecardReportArtifactRef[] = (input.artifactPaths ?? [])
    .filter((p): p is string => typeof p === 'string')
    .filter((p) => safeArtifactPath(p))
    .map((pathText) => sanitizeText(pathText))
    .filter(Boolean)
    .map((p) => ({
      artifactKind: p.endsWith('.md') ? ('markdown-summary' as const) : ('json-summary' as const),
      sourceLane: asLane(p),
      path: p,
      description: sanitizeText(`Referenced artifact from ${asLane(p)} lane.`),
      exists: true,
      operatorReviewRequired: true,
    }))
    .sort((a, b) => (a.sourceLane + a.path).localeCompare(b.sourceLane + b.path));

  for (const evidenceId of REQUIRED_PCC_EVIDENCE_IDS) {
    const record = registryById.get(evidenceId);
    const referenced = artifactInventory.filter((artifact) => artifact.path.includes(evidenceId));
    evidenceCoverage.push({
      evidenceId,
      registryStatus: record?.status ?? 'not-listed',
      coverageDisposition: record ? 'registry-listed' : 'source-missing',
      artifactReferenceCount: referenced.length,
      pillarRefs: record?.pillarRefs ?? [],
      hardStopRefs: record?.hardStopRefs ?? [],
      notes: [
        sanitizeText(record ? 'Registry row present.' : 'Registry row missing.'),
        sanitizeText(
          referenced.length > 0
            ? 'Artifact references linked.'
            : 'No direct artifact reference linked.',
        ),
      ],
    });
  }

  const unknownIds = registry
    .map((r) => r.id)
    .filter((id) => !REQUIRED_PCC_EVIDENCE_IDS.includes(id));
  for (const unknown of unknownIds) {
    findings.push({
      id: `finding-unknown-${sanitizeText(unknown)}`,
      category: 'taxonomy',
      disposition: 'expert-review-required',
      sourceLane: 'registry',
      title: 'Unknown evidence ID in registry input',
      detail: sanitizeText(`Unknown EV ID excluded from Prompt 13 coverage matrix: ${unknown}`),
      evidenceIds: [],
    });
  }

  const pillarRows: PccScorecardReportPillarRow[] = buildPccScorecardWorksheet(registry).map(
    (row) => ({
      pillarId: row.pillarId,
      title: sanitizeText(row.title),
      weight: row.weight,
      evidenceIds: toUniqueEvidence(row.evidenceIds),
      manualScore: null,
      automatedScore: null,
      scoringOwner: 'expert-review',
      disposition: 'expert-review-required',
      notes: [sanitizeText('Manual expert scoring required.')],
    }),
  );

  const hardStopRows: PccScorecardReportHardStopRow[] = buildPccHardStopWorksheet(registry).map(
    (row) => ({
      hardStopId: row.hardStopId,
      title: sanitizeText(row.title),
      blocksPhase4: true,
      reviewStatus: 'manual-review-required',
      evidenceIds: toUniqueEvidence(row.evidenceIds),
      disposition: 'expert-review-required',
      notes: [sanitizeText('Manual hard-stop review required.')],
    }),
  );

  const pillarMap = buildPccPillarEvidenceMap(registry);
  const expertScoringWorksheet: PccScorecardReportExpertScoringRow[] = pillarRows
    .map((pillar) => ({
      pillarId: pillar.pillarId,
      pillarTitle: pillar.title,
      weight: pillar.weight,
      evidenceIds: toUniqueEvidence(pillarMap[pillar.pillarId]),
      manualScore: null,
      automatedScore: null,
      reviewerOwner: 'expert-review',
      reviewPrompt: sanitizeText(
        `Review ${pillar.pillarId} evidence quality, coverage, and confidence. Assign manual score only after expert review.`,
      ),
    }))
    .sort((a, b) => a.pillarId.localeCompare(b.pillarId));

  if (artifactInventory.length === 0) {
    findings.push({
      id: 'finding-artifacts-missing',
      category: 'source-missing',
      disposition: 'operator-review-pending',
      sourceLane: 'operator',
      title: 'No artifact paths provided',
      detail: sanitizeText(
        'Prompt 13 report assembled without explicit prior-lane artifact references.',
      ),
      evidenceIds: [],
    });
  }

  findings.push({
    id: 'finding-manual-scoring-required',
    category: 'manual-review-required',
    disposition: 'expert-review-required',
    sourceLane: 'traceability',
    title: 'Manual expert score required',
    detail: sanitizeText(
      'Prompt 13 does not calculate scores; expert reviewer must populate pillar scores.',
    ),
    evidenceIds: [],
  });

  findings.push({
    id: 'finding-hardstop-manual-review-required',
    category: 'manual-review-required',
    disposition: 'expert-review-required',
    sourceLane: 'traceability',
    title: 'Manual hard-stop review required',
    detail: sanitizeText(
      'Prompt 13 does not set hard-stop outcomes; manual-review-required remains for all hard stops.',
    ),
    evidenceIds: [],
  });

  residualRisks.push({
    id: 'risk-manual-scoring-pending',
    sourceLane: 'traceability',
    disposition: 'expert-review-required',
    statement: sanitizeText('Final score remains pending expert manual scoring.'),
    mitigation: sanitizeText('Complete expert scoring worksheet and retain reviewer notes.'),
  });
  residualRisks.push({
    id: 'risk-hardstop-review-pending',
    sourceLane: 'traceability',
    disposition: 'expert-review-required',
    statement: sanitizeText('Hard-stop dispositions remain pending manual review.'),
    mitigation: sanitizeText('Complete hard-stop worksheet and capture reviewer rationale.'),
  });

  for (const exception of input.environmentValidationExceptions ?? []) {
    const detail = sanitizeText(exception);
    findings.push({
      id: `finding-env-${findings.length + 1}`,
      category: 'environment-validation',
      disposition: 'operator-review-pending',
      sourceLane: 'operator',
      title: 'Environment validation exception',
      detail,
      evidenceIds: [],
    });
    residualRisks.push({
      id: `risk-env-${residualRisks.length + 1}`,
      sourceLane: 'operator',
      disposition: 'operator-review-pending',
      statement: detail,
      mitigation: sanitizeText('Resolve environment policy blocker and rerun validation.'),
    });
  }

  const sourceMissingCount = evidenceCoverage.filter(
    (row) => row.coverageDisposition === 'source-missing',
  ).length;
  const expertReviewRequiredCount =
    findings.filter((f) => f.disposition === 'expert-review-required').length +
    residualRisks.filter((r) => r.disposition === 'expert-review-required').length +
    pillarRows.length +
    hardStopRows.length;
  const operatorPendingCount =
    findings.filter((f) => f.disposition === 'operator-review-pending').length +
    residualRisks.filter((r) => r.disposition === 'operator-review-pending').length;

  const auditPackageIndex = defaultAuditPackageIndex();

  const report: PccScorecardReportRun = {
    runId: sanitizeText(input.runId ?? 'pcc-scorecard-report'),
    generatedAtIso: input.generatedAtIso ?? new Date().toISOString(),
    tenantSiteUrl: sanitizeText(
      input.tenantSiteUrl ??
        'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
    ),
    tenantPageUrl: sanitizeText(input.tenantPageUrl ?? 'not-provided'),
    expectedPackageVersion: sanitizeText(input.expectedPackageVersion ?? 'unknown'),
    repoCommit: input.repoCommit ? sanitizeText(input.repoCommit) : undefined,
    registryEvidenceCount: registry.length,
    requiredEvidenceCount: REQUIRED_PCC_EVIDENCE_IDS.length,
    summary: {
      requiredEvidenceCount: REQUIRED_PCC_EVIDENCE_IDS.length,
      registeredEvidenceCount: registry.length,
      evidenceReferencedCount: evidenceCoverage.filter((r) => r.artifactReferenceCount > 0).length,
      missingEvidenceCount: sourceMissingCount,
      pillarCount: pillarRows.length,
      hardStopCount: hardStopRows.length,
      manualScoreRequiredCount: pillarRows.length,
      manualHardStopReviewRequiredCount: hardStopRows.length,
      artifactReferenceCount: artifactInventory.length,
      findingCount: findings.length,
      residualRiskCount: residualRisks.length,
      expertReviewRequiredCount,
      operatorPendingCount,
      sourceMissingCount,
    },
    evidenceCoverage: evidenceCoverage.sort((a, b) => byEv(a.evidenceId, b.evidenceId)),
    pillarRows: pillarRows.sort((a, b) => a.pillarId.localeCompare(b.pillarId)),
    hardStopRows: hardStopRows.sort((a, b) => a.hardStopId.localeCompare(b.hardStopId)),
    findings: findings.slice(0, 120),
    residualRisks: residualRisks.slice(0, 120),
    expertScoringWorksheet,
    artifactInventory,
    auditPackageIndex,
    warnings: warnings.map((w) => sanitizeText(w)),
    disclaimer: PCC_SCORECARD_REPORT_DISCLAIMER,
    runState: 'completed',
    finalDisposition: 'report-ready-for-expert-review',
  };

  return report;
}
