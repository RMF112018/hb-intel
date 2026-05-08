import fs from 'node:fs/promises';
import path from 'node:path';
import type { PccWorkflowEvidenceRun, PccWorkflowSurfaceEvidence } from './pcc-live.workflow.types';
import {
  isPccLiveUnsafeArtifactPath,
  sanitizePccLiveArtifactPath,
  sanitizePccLiveText,
} from './pcc-live.sanitization';

const DISCLAIMER =
  'This output is workflow, action, source, state, and false-affordance evidence support for EV-83..EV-106 only. It is not a final scorecard result and does not mark any EV captured without operator review.';

function sanitizeText(input: string): string {
  return sanitizePccLiveText(input, { maxLength: 240, redactPolicyClaims: true });
}

function safeArtifactPath(pathLike: string): boolean {
  return !isPccLiveUnsafeArtifactPath(pathLike);
}

function sanitizeSurface(surface: PccWorkflowSurfaceEvidence): PccWorkflowSurfaceEvidence {
  return {
    ...surface,
    label: sanitizeText(surface.label),
    warnings: surface.warnings.map(sanitizeText),
    actions: surface.actions.map((item) => ({
      ...item,
      selector: sanitizeText(item.selector),
      tagName: sanitizeText(item.tagName),
      role: item.role ? sanitizeText(item.role) : undefined,
      labelSnippet: item.labelSnippet ? sanitizeText(item.labelSnippet) : undefined,
      destinationHost: item.destinationHost ? sanitizeText(item.destinationHost) : undefined,
      destinationPath: item.destinationPath ? sanitizeText(item.destinationPath) : undefined,
    })),
    priority: {
      ...surface.priority,
      notes: surface.priority.notes.map(sanitizeText),
    },
    states: surface.states.map((item) => ({
      ...item,
      selector: item.selector ? sanitizeText(item.selector) : undefined,
      copySnippet: item.copySnippet ? sanitizeText(item.copySnippet) : undefined,
    })),
    sources: surface.sources.map((item) => ({
      ...item,
      selector: item.selector ? sanitizeText(item.selector) : undefined,
      ownershipSnippet: item.ownershipSnippet ? sanitizeText(item.ownershipSnippet) : undefined,
    })),
    hbiAuthority: {
      ...surface.hbiAuthority,
      selector: surface.hbiAuthority.selector
        ? sanitizeText(surface.hbiAuthority.selector)
        : undefined,
    },
    externalPlatform: surface.externalPlatform
      ? {
          ...surface.externalPlatform,
          destinationHosts: surface.externalPlatform.destinationHosts.map(sanitizeText),
        }
      : undefined,
  };
}

export interface WritePccWorkflowEvidenceInput {
  outputDir: string;
  run: Omit<PccWorkflowEvidenceRun, 'disclaimer' | 'summary' | 'surfaces' | 'warnings'> & {
    surfaces: readonly PccWorkflowSurfaceEvidence[];
    warnings?: string[];
  };
  artifactPaths?: string[];
}

export interface WritePccWorkflowEvidenceResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  actionSummaryPath: string;
  stateSummaryPath: string;
  sourceSummaryPath: string;
  falseAffordanceSummaryPath: string;
  hbiAuthoritySummaryPath: string;
  surfaceCount: number;
  actionObservationCount: number;
  primaryActionCount: number;
  disabledWithoutReasonCount: number;
  falseAffordanceNeedsReviewCount: number;
  stateObservationCount: number;
  sourceObservationCount: number;
  mockDemoSignalCount: number;
  hbiAuthorityRiskCount: number;
  externalPlatformsObservationCount: number;
  approvalsQueueObservationCount: number;
  continuitySignalCount: number;
  warningCount: number;
}

export async function writePccWorkflowEvidence(
  input: WritePccWorkflowEvidenceInput,
): Promise<WritePccWorkflowEvidenceResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const surfaces = input.run.surfaces.map(sanitizeSurface);
  const warnings = (input.run.warnings ?? []).map(sanitizeText);

  const summary = {
    totalSurfaces: surfaces.length,
    totalActions: surfaces.reduce((sum, s) => sum + s.actions.length, 0),
    totalPrimaryActions: surfaces.reduce((sum, s) => sum + s.priority.primaryActionCount, 0),
    totalDisabledWithoutReason: surfaces.reduce(
      (sum, s) =>
        sum +
        s.actions.filter((a) => (a.disabled || a.ariaDisabled) && !a.hasDisabledReason).length,
      0,
    ),
    totalFalseAffordanceNeedsReview: surfaces.reduce(
      (sum, s) =>
        sum +
        s.actions.filter(
          (a) =>
            a.falseAffordanceRisk === 'needs-review' ||
            a.falseAffordanceRisk === 'high' ||
            a.falseAffordanceRisk === 'medium',
        ).length,
      0,
    ),
    totalStateObservations: surfaces.reduce((sum, s) => sum + s.states.length, 0),
    totalSourceObservations: surfaces.reduce((sum, s) => sum + s.sources.length, 0),
    totalMockDemoSignals: surfaces.reduce(
      (sum, s) =>
        sum +
        s.states.filter((st) => st.stateKind === 'mock-demo' || st.stateKind === 'fixture').length,
      0,
    ),
    totalHbiAuthorityRisks: surfaces.reduce((sum, s) => sum + s.hbiAuthority.riskyKeywordCount, 0),
    totalExternalLaunchObservations: surfaces.reduce(
      (sum, s) => sum + (s.externalPlatform?.launchSurfaceObserved ? 1 : 0),
      0,
    ),
    totalApprovalsQueueObservations: surfaces.reduce(
      (sum, s) => sum + (s.approvalsQueue?.queueObserved ? 1 : 0),
      0,
    ),
    totalContinuitySignals: surfaces.reduce(
      (sum, s) =>
        sum +
        s.continuity.ownerSignalCount +
        s.continuity.responsibilitySignalCount +
        s.continuity.crossSurfaceReferenceCount +
        s.continuity.lifecycleLanguageCount +
        s.continuity.nextActionLanguageCount,
      0,
    ),
    totalWarnings: warnings.length + surfaces.reduce((sum, s) => sum + s.warnings.length, 0),
  };

  const runPayload: PccWorkflowEvidenceRun = {
    ...input.run,
    tenantSiteUrl: sanitizeText(input.run.tenantSiteUrl),
    tenantPageUrl: sanitizeText(input.run.tenantPageUrl),
    surfaces,
    summary,
    warnings,
    disclaimer: DISCLAIMER,
  };

  const artifactPaths = (input.artifactPaths ?? [])
    .filter(safeArtifactPath)
    .map((item) => sanitizePccLiveArtifactPath(item));

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-workflow-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-workflow-evidence.md');
  const actionSummaryPath = path.join(input.outputDir, 'pcc-live-action-summary.json');
  const stateSummaryPath = path.join(input.outputDir, 'pcc-live-state-summary.json');
  const sourceSummaryPath = path.join(input.outputDir, 'pcc-live-source-summary.json');
  const falseAffordanceSummaryPath = path.join(
    input.outputDir,
    'pcc-live-false-affordance-summary.json',
  );
  const hbiAuthoritySummaryPath = path.join(input.outputDir, 'pcc-live-hbi-authority-summary.json');

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(
    actionSummaryPath,
    `${JSON.stringify(
      surfaces.flatMap((s) => s.actions),
      null,
      2,
    )}\n`,
    'utf-8',
  );
  await fs.writeFile(
    stateSummaryPath,
    `${JSON.stringify(
      surfaces.flatMap((s) => s.states),
      null,
      2,
    )}\n`,
    'utf-8',
  );
  await fs.writeFile(
    sourceSummaryPath,
    `${JSON.stringify(
      surfaces.flatMap((s) => s.sources),
      null,
      2,
    )}\n`,
    'utf-8',
  );
  await fs.writeFile(
    falseAffordanceSummaryPath,
    `${JSON.stringify(
      surfaces.flatMap((s) =>
        s.actions.map((a) => ({
          surfaceId: s.surfaceId,
          selector: a.selector,
          falseAffordanceRisk: a.falseAffordanceRisk,
          needsReview: a.needsReview,
        })),
      ),
      null,
      2,
    )}\n`,
    'utf-8',
  );
  await fs.writeFile(
    hbiAuthoritySummaryPath,
    `${JSON.stringify(
      surfaces.map((s) => s.hbiAuthority),
      null,
      2,
    )}\n`,
    'utf-8',
  );

  const lines: string[] = [];
  lines.push('# PCC Live Workflow Evidence');
  lines.push('');
  lines.push(`- Run ID: ${runPayload.runId}`);
  lines.push(`- Generated: ${runPayload.generatedAtIso}`);
  lines.push(`- Tenant site: ${runPayload.tenantSiteUrl}`);
  lines.push(`- Tenant page: ${runPayload.tenantPageUrl}`);
  lines.push(`- Expected package version: ${runPayload.expectedPackageVersion}`);
  lines.push(`- EV refs: ${runPayload.evRefs.join(', ')}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Surface count: ${summary.totalSurfaces}`);
  lines.push(`- Action observation count: ${summary.totalActions}`);
  lines.push(`- Primary action count: ${summary.totalPrimaryActions}`);
  lines.push(`- Disabled-without-reason count: ${summary.totalDisabledWithoutReason}`);
  lines.push(`- False-affordance needs-review count: ${summary.totalFalseAffordanceNeedsReview}`);
  lines.push(`- State observation count: ${summary.totalStateObservations}`);
  lines.push(`- Source observation count: ${summary.totalSourceObservations}`);
  lines.push(`- Mock/demo signal count: ${summary.totalMockDemoSignals}`);
  lines.push(`- HBI authority risk count: ${summary.totalHbiAuthorityRisks}`);
  lines.push(`- External Platforms observation count: ${summary.totalExternalLaunchObservations}`);
  lines.push(`- Approvals queue observation count: ${summary.totalApprovalsQueueObservations}`);
  lines.push(`- Continuity signal count: ${summary.totalContinuitySignals}`);
  lines.push(`- Warning count: ${summary.totalWarnings}`);
  lines.push('');
  lines.push('## Surface Table');
  lines.push(
    '| Surface | Actions | Primary | False-affordance | State | Source | HBI risk | External | Approvals |',
  );
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const s of surfaces) {
    const falseAffordance = s.actions.filter(
      (a) =>
        a.falseAffordanceRisk === 'needs-review' ||
        a.falseAffordanceRisk === 'high' ||
        a.falseAffordanceRisk === 'medium',
    ).length;
    lines.push(
      `| ${s.surfaceId} | ${s.actions.length} | ${s.priority.primaryActionCount} | ${falseAffordance} | ${s.states.length} | ${s.sources.length} | ${s.hbiAuthority.riskyKeywordCount} | ${s.externalPlatform?.externalLinkCount ?? 0} | ${(s.approvalsQueue?.approveActionCount ?? 0) + (s.approvalsQueue?.rejectActionCount ?? 0) + (s.approvalsQueue?.submitActionCount ?? 0)} |`,
    );
  }
  lines.push('');
  lines.push('## Artifact Paths');
  if (artifactPaths.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const item of artifactPaths) lines.push(`- ${item}`);
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
  lines.push('- Workflow evidence is inspection-only and operator-review pending.');
  lines.push('- No hard-stop disposition or readiness disposition claims are produced.');
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);

  await fs.writeFile(evidenceMarkdownPath, `${lines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    actionSummaryPath,
    stateSummaryPath,
    sourceSummaryPath,
    falseAffordanceSummaryPath,
    hbiAuthoritySummaryPath,
    surfaceCount: summary.totalSurfaces,
    actionObservationCount: summary.totalActions,
    primaryActionCount: summary.totalPrimaryActions,
    disabledWithoutReasonCount: summary.totalDisabledWithoutReason,
    falseAffordanceNeedsReviewCount: summary.totalFalseAffordanceNeedsReview,
    stateObservationCount: summary.totalStateObservations,
    sourceObservationCount: summary.totalSourceObservations,
    mockDemoSignalCount: summary.totalMockDemoSignals,
    hbiAuthorityRiskCount: summary.totalHbiAuthorityRisks,
    externalPlatformsObservationCount: summary.totalExternalLaunchObservations,
    approvalsQueueObservationCount: summary.totalApprovalsQueueObservations,
    continuitySignalCount: summary.totalContinuitySignals,
    warningCount: summary.totalWarnings,
  };
}
