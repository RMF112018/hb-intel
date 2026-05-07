import fs from 'node:fs/promises';
import path from 'node:path';
import type { PccLiveRuntimeErrorSummary, PccLiveSurfaceSmokeResult } from './pcc-live.page-object';

export type PccLiveRunState = 'completed' | 'self-skipped' | 'writer-test-only';

export interface PccLiveSurfaceSmokeEvidenceInput {
  outputDir: string;
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  surfaces: readonly PccLiveSurfaceSmokeResult[];
  runtimeErrors: PccLiveRuntimeErrorSummary;
  selfSkipped: boolean;
  runState: PccLiveRunState;
  warnings?: string[];
  artifactPaths?: string[];
}

export interface PccLiveSurfaceSmokeEvidenceWriteResult {
  jsonPath: string;
  markdownPath: string;
  outputDir: string;
}

const DISCLAIMER =
  'This output is baseline live-runtime evidence for EV-52 and EV-55 only. It is not a final scorecard result and does not mark any EV captured without operator review.';

const UNSAFE_ARTIFACT_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|secrets|session|trace|video|har/i;

function safeArtifactPaths(artifactPaths: readonly string[] | undefined): string[] {
  return (artifactPaths ?? []).filter(
    (artifactPath) => !UNSAFE_ARTIFACT_PATH_PATTERN.test(artifactPath),
  );
}

export async function writePccLiveSurfaceSmokeEvidence(
  input: PccLiveSurfaceSmokeEvidenceInput,
): Promise<PccLiveSurfaceSmokeEvidenceWriteResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const summary = {
    totalSurfaces: input.surfaces.length,
    passedSurfaces: input.surfaces.filter((s) => s.passed).length,
    failedSurfaces: input.surfaces.filter((s) => !s.passed).length,
    totalGridCount: input.surfaces.reduce((sum, s) => sum + s.gridCount, 0),
    totalCardCount: input.surfaces.reduce((sum, s) => sum + s.cardCount, 0),
    consoleErrorCount: input.runtimeErrors.consoleErrorCount,
    pageErrorCount: input.runtimeErrors.pageErrorCount,
  };

  const payload = {
    runId: input.runId,
    generatedAtIso: input.generatedAtIso,
    tenantSiteUrl: input.tenantSiteUrl,
    tenantPageUrl: input.tenantPageUrl,
    expectedPackageVersion: input.expectedPackageVersion,
    evRefs: ['EV-52', 'EV-55'] as const,
    selfSkipped: input.selfSkipped,
    runState: input.runState,
    surfaces: input.surfaces,
    runtimeErrors: input.runtimeErrors,
    summary,
    warnings: input.warnings ?? [],
    artifactPaths: safeArtifactPaths(input.artifactPaths),
    disclaimer: DISCLAIMER,
  };

  const jsonPath = path.join(input.outputDir, 'pcc-live-surface-smoke.json');
  const markdownPath = path.join(input.outputDir, 'pcc-live-surface-smoke.md');

  await fs.writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# PCC Live Surface Smoke');
  lines.push('');
  lines.push(`- Run ID: ${input.runId}`);
  lines.push(`- Generated: ${input.generatedAtIso}`);
  lines.push(`- Tenant site: ${input.tenantSiteUrl}`);
  lines.push(`- Tenant page: ${input.tenantPageUrl}`);
  lines.push(`- Expected package version: ${input.expectedPackageVersion}`);
  lines.push(`- EV refs: EV-52, EV-55`);
  lines.push(`- selfSkipped: ${input.selfSkipped}`);
  lines.push(`- runState: ${input.runState}`);
  lines.push('');
  lines.push('## Surface Results');
  lines.push('| Surface | Passed | Panel | Tab Active | Grid Count | Card Count | Warning |');
  lines.push('|---|---|---|---|---:|---:|---|');
  for (const surface of input.surfaces) {
    lines.push(
      `| ${surface.surfaceId} | ${surface.passed ? 'yes' : 'no'} | ${surface.activePanelFound ? 'yes' : 'no'} | ${surface.tabActive ? 'yes' : 'no'} | ${surface.gridCount} | ${surface.cardCount} | ${surface.warning ?? ''} |`,
    );
  }
  lines.push('');
  lines.push('## Runtime Summary');
  lines.push(`- Surfaces: ${summary.totalSurfaces}`);
  lines.push(`- Passed: ${summary.passedSurfaces}`);
  lines.push(`- Failed: ${summary.failedSurfaces}`);
  lines.push(`- Total grids: ${summary.totalGridCount}`);
  lines.push(`- Total cards: ${summary.totalCardCount}`);
  lines.push(`- Console errors: ${summary.consoleErrorCount}`);
  lines.push(`- Page errors: ${summary.pageErrorCount}`);
  lines.push('');
  lines.push('## Artifact Paths');
  const filteredArtifacts = safeArtifactPaths(input.artifactPaths);
  if (filteredArtifacts.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const artifactPath of filteredArtifacts) {
      lines.push(`- ${artifactPath}`);
    }
  }
  lines.push('');
  lines.push('## Warnings');
  const warnings = input.warnings ?? [];
  if (warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of warnings) {
      lines.push(`- ${warning}`);
    }
  }
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);
  lines.push('');
  lines.push(
    'Operator review is required before treating this baseline output as captured EV evidence.',
  );

  await fs.writeFile(markdownPath, `${lines.join('\n')}\n`, 'utf-8');

  return { jsonPath, markdownPath, outputDir: input.outputDir };
}
