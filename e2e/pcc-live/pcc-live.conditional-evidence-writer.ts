import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  PccConditionalAuthObservation,
  PccConditionalEvidenceRun,
  PccConditionalFocusObservation,
  PccConditionalLayoutObservation,
  PccConditionalSetupStatus,
  PccConditionalStateObservation,
} from './pcc-live.conditional.types';

const DISCLAIMER =
  'This output is conditional edit-mode, high-zoom, drawer/modal, unauthorized, and special-state evidence support for EV-57, EV-67, EV-68, EV-82, EV-94, EV-96, EV-102, and related state/source EVs only. It is not a final scorecard result and does not mark any EV captured without operator review.';

const UNSAFE_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|session|secrets|trace|video|har|unauthorized/i;
const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noRawArtifacts = noCred
    .replace(/test-results/gi, '[redacted-artifact]')
    .replace(/playwright-report/gi, '[redacted-artifact]')
    .replace(/trace\.zip/gi, '[redacted-artifact]')
    .replace(/video\.webm/gi, '[redacted-artifact]')
    .replace(/network\.har/gi, '[redacted-artifact]')
    .replace(/\.auth/gi, '[redacted-cred]');
  const noPolicyClaims = noRawArtifacts
    .replace(/hard stop passed/gi, '[redacted-claim]')
    .replace(/hard stop failed/gi, '[redacted-claim]')
    .replace(/score-ready/gi, '[redacted-claim]')
    .replace(/Phase 4 ready/gi, '[redacted-claim]');
  const noHtml = noPolicyClaims.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function sanitizeSetup(setup: PccConditionalSetupStatus): PccConditionalSetupStatus {
  return {
    ...setup,
    reason: sanitizeText(setup.reason),
  };
}

function sanitizeState(item: PccConditionalStateObservation): PccConditionalStateObservation {
  return {
    ...item,
    selector: item.selector ? sanitizeText(item.selector) : undefined,
    snippet: item.snippet ? sanitizeText(item.snippet) : undefined,
  };
}

function sanitizeLayout(item: PccConditionalLayoutObservation): PccConditionalLayoutObservation {
  return {
    ...item,
    zoomOrScaleLabel: sanitizeText(item.zoomOrScaleLabel),
  };
}

function sanitizeFocus(item: PccConditionalFocusObservation): PccConditionalFocusObservation {
  return {
    ...item,
    notes: item.notes.map(sanitizeText),
  };
}

function sanitizeAuth(item: PccConditionalAuthObservation): PccConditionalAuthObservation {
  return {
    ...item,
    attemptedUrl: item.attemptedUrl ? sanitizeText(item.attemptedUrl) : undefined,
    notes: item.notes.map(sanitizeText),
  };
}

function safeArtifactPath(pathLike: string): boolean {
  return !UNSAFE_PATH_PATTERN.test(pathLike);
}

export interface WritePccConditionalEvidenceInput {
  outputDir: string;
  run: Omit<
    PccConditionalEvidenceRun,
    | 'disclaimer'
    | 'summary'
    | 'setup'
    | 'stateObservations'
    | 'layoutObservations'
    | 'focusObservations'
    | 'authObservations'
    | 'warnings'
  > & {
    setup: readonly PccConditionalSetupStatus[];
    stateObservations: readonly PccConditionalStateObservation[];
    layoutObservations: readonly PccConditionalLayoutObservation[];
    focusObservations: readonly PccConditionalFocusObservation[];
    authObservations: readonly PccConditionalAuthObservation[];
    warnings?: string[];
  };
  artifactPaths?: string[];
}

export interface WritePccConditionalEvidenceResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  setupSummaryPath: string;
  stateSummaryPath: string;
  layoutSummaryPath: string;
  focusSummaryPath: string;
  authSummaryPath: string;
  completedLaneCount: number;
  operatorPendingLaneCount: number;
  notConfiguredLaneCount: number;
  stateObservationCount: number;
  layoutObservationCount: number;
  focusObservationCount: number;
  authObservationCount: number;
  needsReviewCount: number;
  warningCount: number;
}

export async function writePccConditionalEvidence(
  input: WritePccConditionalEvidenceInput,
): Promise<WritePccConditionalEvidenceResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const setup = input.run.setup.map(sanitizeSetup);
  const stateObservations = input.run.stateObservations.map(sanitizeState);
  const layoutObservations = input.run.layoutObservations.map(sanitizeLayout);
  const focusObservations = input.run.focusObservations.map(sanitizeFocus);
  const authObservations = input.run.authObservations.map(sanitizeAuth);
  const warnings = (input.run.warnings ?? []).map(sanitizeText);

  const summary = {
    totalLanes: setup.length,
    completedLanes: setup.filter((s) => s.status === 'completed').length,
    operatorPendingLanes: setup.filter((s) => s.status === 'operator-pending').length,
    notConfiguredLanes: setup.filter((s) => s.status === 'not-configured').length,
    stateObservationCount: stateObservations.length,
    layoutObservationCount: layoutObservations.length,
    focusObservationCount: focusObservations.length,
    authObservationCount: authObservations.length,
    needsReviewCount:
      setup.filter((s) => s.status === 'needs-review').length +
      stateObservations.filter((s) => s.needsReview).length +
      layoutObservations.filter((s) => s.needsReview).length +
      focusObservations.filter((s) => s.focusRiskCount > 0).length +
      authObservations.filter((s) => s.needsReview).length,
    warningCount: warnings.length,
  };

  const runPayload: PccConditionalEvidenceRun = {
    ...input.run,
    tenantSiteUrl: sanitizeText(input.run.tenantSiteUrl),
    tenantPageUrl: sanitizeText(input.run.tenantPageUrl),
    setup,
    stateObservations,
    layoutObservations,
    focusObservations,
    authObservations,
    summary,
    warnings,
    disclaimer: DISCLAIMER,
  };

  const artifactPaths = (input.artifactPaths ?? [])
    .filter(safeArtifactPath)
    .map((p) => sanitizeText(p));

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-conditional-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-conditional-evidence.md');
  const setupSummaryPath = path.join(input.outputDir, 'pcc-live-conditional-setup-summary.json');
  const stateSummaryPath = path.join(input.outputDir, 'pcc-live-conditional-state-summary.json');
  const layoutSummaryPath = path.join(input.outputDir, 'pcc-live-conditional-layout-summary.json');
  const focusSummaryPath = path.join(input.outputDir, 'pcc-live-conditional-focus-summary.json');
  const authSummaryPath = path.join(input.outputDir, 'pcc-live-conditional-auth-summary.json');

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(setupSummaryPath, `${JSON.stringify(setup, null, 2)}\n`, 'utf-8');
  await fs.writeFile(stateSummaryPath, `${JSON.stringify(stateObservations, null, 2)}\n`, 'utf-8');
  await fs.writeFile(
    layoutSummaryPath,
    `${JSON.stringify(layoutObservations, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(focusSummaryPath, `${JSON.stringify(focusObservations, null, 2)}\n`, 'utf-8');
  await fs.writeFile(authSummaryPath, `${JSON.stringify(authObservations, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# PCC Live Conditional Evidence');
  lines.push('');
  lines.push(`- Run ID: ${runPayload.runId}`);
  lines.push(`- Generated: ${runPayload.generatedAtIso}`);
  lines.push(`- Tenant site: ${runPayload.tenantSiteUrl}`);
  lines.push(`- Tenant page: ${runPayload.tenantPageUrl}`);
  lines.push(`- Expected package version: ${runPayload.expectedPackageVersion}`);
  lines.push(`- EV refs: ${runPayload.evRefs.join(', ')}`);
  lines.push('');
  lines.push('## Lane Setup');
  lines.push('| Lane | Status | Configured | Attempted |');
  lines.push('|---|---|---:|---:|');
  for (const item of setup) {
    lines.push(
      `| ${item.laneId} | ${item.status} | ${item.configured ? 'yes' : 'no'} | ${item.attempted ? 'yes' : 'no'} |`,
    );
  }
  lines.push('');
  lines.push('## Summary');
  lines.push(`- State observation count: ${summary.stateObservationCount}`);
  lines.push(`- Layout observation count: ${summary.layoutObservationCount}`);
  lines.push(`- Focus observation count: ${summary.focusObservationCount}`);
  lines.push(`- Auth observation count: ${summary.authObservationCount}`);
  lines.push(`- Operator-pending lane count: ${summary.operatorPendingLanes}`);
  lines.push(`- Not-configured lane count: ${summary.notConfiguredLanes}`);
  lines.push(`- Needs-review count: ${summary.needsReviewCount}`);
  lines.push(`- Warning count: ${summary.warningCount}`);
  lines.push('');
  lines.push('## Artifact Paths');
  if (artifactPaths.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const artifact of artifactPaths) lines.push(`- ${artifact}`);
  }
  lines.push('');
  lines.push('## Warnings');
  if (warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of warnings) lines.push(`- ${warning}`);
  }
  lines.push('');
  lines.push('## Policy');
  lines.push('- Conditional evidence is inspection-only and operator-review pending.');
  lines.push('- No hard-stop disposition or readiness disposition claims are produced.');
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);

  await fs.writeFile(evidenceMarkdownPath, `${lines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    setupSummaryPath,
    stateSummaryPath,
    layoutSummaryPath,
    focusSummaryPath,
    authSummaryPath,
    completedLaneCount: summary.completedLanes,
    operatorPendingLaneCount: summary.operatorPendingLanes,
    notConfiguredLaneCount: summary.notConfiguredLanes,
    stateObservationCount: summary.stateObservationCount,
    layoutObservationCount: summary.layoutObservationCount,
    focusObservationCount: summary.focusObservationCount,
    authObservationCount: summary.authObservationCount,
    needsReviewCount: summary.needsReviewCount,
    warningCount: summary.warningCount,
  };
}
