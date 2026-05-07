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

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noSensitiveKeywords = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noTokenLike = noSensitiveKeywords.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noTokenLike.slice(0, 240);
}

function sanitizeUrl(input: string): string {
  return sanitizeText(input);
}

function sanitizeArtifactPath(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noTokenLike = noEmail.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noTokenLike.slice(0, 240);
}

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

  const sanitizedSurfaces = input.surfaces.map((surface) => ({
    ...surface,
    warning: surface.warning ? sanitizeText(surface.warning) : undefined,
  }));

  const sanitizedRuntimeErrors = {
    ...input.runtimeErrors,
    items: input.runtimeErrors.items.map((item) => ({
      ...item,
      message: sanitizeText(item.message),
    })),
  };

  const sanitizedWarnings = (input.warnings ?? []).map((warning) => sanitizeText(warning));
  const sanitizedArtifacts = safeArtifactPaths(input.artifactPaths).map((artifactPath) =>
    sanitizeArtifactPath(artifactPath),
  );

  const payload = {
    runId: input.runId,
    generatedAtIso: input.generatedAtIso,
    tenantSiteUrl: sanitizeUrl(input.tenantSiteUrl),
    tenantPageUrl: sanitizeUrl(input.tenantPageUrl),
    expectedPackageVersion: input.expectedPackageVersion,
    evRefs: ['EV-52', 'EV-55'] as const,
    selfSkipped: input.selfSkipped,
    runState: input.runState,
    surfaces: sanitizedSurfaces,
    runtimeErrors: sanitizedRuntimeErrors,
    summary,
    warnings: sanitizedWarnings,
    artifactPaths: sanitizedArtifacts,
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
  lines.push(`- Tenant site: ${sanitizeUrl(input.tenantSiteUrl)}`);
  lines.push(`- Tenant page: ${sanitizeUrl(input.tenantPageUrl)}`);
  lines.push(`- Expected package version: ${input.expectedPackageVersion}`);
  lines.push(`- EV refs: EV-52, EV-55`);
  lines.push(`- selfSkipped: ${input.selfSkipped}`);
  lines.push(`- runState: ${input.runState}`);
  lines.push('');
  lines.push('## Surface Results');
  lines.push('| Surface | Passed | Panel | Tab Active | Grid Count | Card Count | Warning |');
  lines.push('|---|---|---|---|---:|---:|---|');
  for (const surface of sanitizedSurfaces) {
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
  if (sanitizedArtifacts.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const artifactPath of sanitizedArtifacts) {
      lines.push(`- ${artifactPath}`);
    }
  }
  lines.push('');
  lines.push('## Warnings');
  if (sanitizedWarnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of sanitizedWarnings) {
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
