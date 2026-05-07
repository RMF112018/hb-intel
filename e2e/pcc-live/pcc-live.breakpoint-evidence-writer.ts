import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  PccLiveBreakpointEvidenceRun,
  PccLiveBreakpointSurfaceEvidence,
} from './pcc-live.breakpoint.types';

const DISCLAIMER =
  'This output is breakpoint, container, overflow, rowspan, and touch evidence support for EV-59..EV-71 only. It is not a final scorecard result and does not mark any EV captured without operator review.';

const UNSAFE_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|session|secrets|trace|video|har/i;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noBlob = noCred.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function safeArtifactPath(pathLike: string): boolean {
  return !UNSAFE_PATH_PATTERN.test(pathLike);
}

function sanitizeArtifactPath(pathLike: string): string {
  return sanitizeText(pathLike);
}

function sanitizeSurface(
  surface: PccLiveBreakpointSurfaceEvidence,
): PccLiveBreakpointSurfaceEvidence {
  return {
    ...surface,
    label: sanitizeText(surface.label),
    viewportLabel: sanitizeText(surface.viewportLabel),
    warnings: surface.warnings.map((warning) => sanitizeText(warning)),
    grid: {
      ...surface.grid,
      observedMode: surface.grid.observedMode
        ? sanitizeText(String(surface.grid.observedMode))
        : undefined,
      observedGridSafety: surface.grid.observedGridSafety
        ? sanitizeText(surface.grid.observedGridSafety)
        : undefined,
    },
    cards: surface.cards.map((card) => ({
      ...card,
      footprint: card.footprint ? sanitizeText(card.footprint) : undefined,
      hierarchy: card.hierarchy ? sanitizeText(card.hierarchy) : undefined,
      tier: card.tier ? sanitizeText(card.tier) : undefined,
      region: card.region ? sanitizeText(card.region) : undefined,
      headingLevel: card.headingLevel ? sanitizeText(card.headingLevel) : undefined,
      dataMode: card.dataMode ? sanitizeText(card.dataMode) : undefined,
    })),
    touchTargets: surface.touchTargets.map((target) => ({
      ...target,
      selector: sanitizeText(target.selector),
      role: target.role ? sanitizeText(target.role) : undefined,
      tagName: sanitizeText(target.tagName),
    })),
    screenshot: surface.screenshot
      ? {
          ...surface.screenshot,
          path: sanitizeArtifactPath(surface.screenshot.path),
          fileName: sanitizeArtifactPath(surface.screenshot.fileName),
          operatorReviewRequired: true,
        }
      : undefined,
  };
}

export interface WritePccBreakpointEvidenceInput {
  outputDir: string;
  run: Omit<PccLiveBreakpointEvidenceRun, 'disclaimer' | 'summary' | 'surfaces' | 'warnings'> & {
    surfaces: readonly PccLiveBreakpointSurfaceEvidence[];
    warnings?: string[];
  };
  artifactPaths?: string[];
}

export interface WritePccBreakpointEvidenceResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  matrixJsonPath: string;
  cardMeasurementsJsonPath: string;
  touchTargetsJsonPath: string;
  screenshotCount: number;
  surfaceViewportCount: number;
  cardMeasurementCount: number;
  touchTargetMeasurementCount: number;
  warningCount: number;
}

export async function writePccBreakpointEvidence(
  input: WritePccBreakpointEvidenceInput,
): Promise<WritePccBreakpointEvidenceResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const surfaces = input.run.surfaces.map(sanitizeSurface);
  const warnings = (input.run.warnings ?? []).map((warning) => sanitizeText(warning));

  const summary = {
    totalSurfaceViewportPairs: surfaces.length,
    totalScreenshots: surfaces.filter((surface) => surface.screenshot).length,
    totalCardsMeasured: surfaces.reduce((sum, surface) => sum + surface.cards.length, 0),
    totalTouchTargetsMeasured: surfaces.reduce(
      (sum, surface) => sum + surface.touchTargets.length,
      0,
    ),
    totalWarnings:
      warnings.length + surfaces.reduce((sum, surface) => sum + surface.warnings.length, 0),
    modeMismatchCount: surfaces.filter(
      (surface) =>
        !!surface.grid.observedMode &&
        String(surface.grid.observedMode) !== String(surface.grid.derivedMode),
    ).length,
    horizontalOverflowCount: surfaces.filter((surface) => surface.grid.horizontalScrollDetected)
      .length,
    clippedCardCount: surfaces.reduce(
      (sum, surface) => sum + surface.cards.filter((card) => card.clipped).length,
      0,
    ),
    directChildIssueCount: surfaces.reduce(
      (sum, surface) => sum + surface.cards.filter((card) => !card.directChildOfGrid).length,
      0,
    ),
    touchTargetIssueCount: surfaces.reduce(
      (sum, surface) =>
        sum + surface.touchTargets.filter((target) => target.belowRecommendedSize).length,
      0,
    ),
  };

  const runPayload: PccLiveBreakpointEvidenceRun = {
    ...input.run,
    tenantSiteUrl: sanitizeText(input.run.tenantSiteUrl),
    tenantPageUrl: sanitizeText(input.run.tenantPageUrl),
    surfaces,
    summary,
    warnings,
    disclaimer: DISCLAIMER,
  };

  const artifactPaths = (input.artifactPaths ?? [])
    .filter((item) => safeArtifactPath(item))
    .map((item) => sanitizeArtifactPath(item));

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-breakpoint-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-breakpoint-evidence.md');
  const matrixJsonPath = path.join(input.outputDir, 'pcc-live-breakpoint-matrix.json');
  const cardMeasurementsJsonPath = path.join(
    input.outputDir,
    'pcc-live-breakpoint-card-measurements.json',
  );
  const touchTargetsJsonPath = path.join(input.outputDir, 'pcc-live-breakpoint-touch-targets.json');

  const matrix = surfaces.map((surface) => ({
    surfaceId: surface.surfaceId,
    viewportId: surface.viewportId,
    viewportLabel: surface.viewportLabel,
    grid: surface.grid,
    warningCount: surface.warnings.length,
  }));
  const cardMeasurements = surfaces.flatMap((surface) => surface.cards);
  const touchTargets = surfaces.flatMap((surface) => surface.touchTargets);

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(matrixJsonPath, `${JSON.stringify(matrix, null, 2)}\n`, 'utf-8');
  await fs.writeFile(
    cardMeasurementsJsonPath,
    `${JSON.stringify(cardMeasurements, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(touchTargetsJsonPath, `${JSON.stringify(touchTargets, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# PCC Live Breakpoint Evidence');
  lines.push('');
  lines.push(`- Run ID: ${runPayload.runId}`);
  lines.push(`- Generated: ${runPayload.generatedAtIso}`);
  lines.push(`- Tenant site: ${runPayload.tenantSiteUrl}`);
  lines.push(`- Tenant page: ${runPayload.tenantPageUrl}`);
  lines.push(`- Expected package version: ${runPayload.expectedPackageVersion}`);
  lines.push(`- EV refs: ${runPayload.evRefs.join(', ')}`);
  lines.push(`- selfSkipped: ${runPayload.selfSkipped}`);
  lines.push(`- runState: ${runPayload.runState}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Surface/viewport pairs: ${summary.totalSurfaceViewportPairs}`);
  lines.push(`- Screenshot count: ${summary.totalScreenshots}`);
  lines.push(`- Card measurement count: ${summary.totalCardsMeasured}`);
  lines.push(`- Touch target measurement count: ${summary.totalTouchTargetsMeasured}`);
  lines.push(`- Warning count: ${summary.totalWarnings}`);
  lines.push(`- Mode mismatch count: ${summary.modeMismatchCount}`);
  lines.push(`- Horizontal overflow count: ${summary.horizontalOverflowCount}`);
  lines.push(`- Clipped card count: ${summary.clippedCardCount}`);
  lines.push(`- Direct-child issue count: ${summary.directChildIssueCount}`);
  lines.push(`- Touch target issue count: ${summary.touchTargetIssueCount}`);
  lines.push('');
  lines.push('## Surface/Viewport Table');
  lines.push('| Viewport | Surface | Mode (observed/derived) | Cards | Touch Targets | Warnings |');
  lines.push('|---|---|---|---:|---:|---:|');
  for (const surface of surfaces) {
    lines.push(
      `| ${surface.viewportId} | ${surface.surfaceId} | ${surface.grid.observedMode ?? 'n/a'} / ${surface.grid.derivedMode} | ${surface.cards.length} | ${surface.touchTargets.length} | ${surface.warnings.length} |`,
    );
  }
  lines.push('');
  lines.push('## Artifact Paths');
  if (artifactPaths.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const artifactPath of artifactPaths) lines.push(`- ${artifactPath}`);
  }
  lines.push('');
  lines.push('## Artifact Policy');
  lines.push(
    '- Responsive screenshot PNG files are operator-review required and not auto-commit eligible.',
  );
  lines.push('- JSON/markdown inventories are commit-eligible only after review/scrubbing.');
  lines.push('- Raw Playwright outputs are never-commit.');
  lines.push('');
  lines.push('## Warnings');
  if (warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of warnings) lines.push(`- ${warning}`);
  }
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);

  await fs.writeFile(evidenceMarkdownPath, `${lines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    matrixJsonPath,
    cardMeasurementsJsonPath,
    touchTargetsJsonPath,
    screenshotCount: summary.totalScreenshots,
    surfaceViewportCount: summary.totalSurfaceViewportPairs,
    cardMeasurementCount: summary.totalCardsMeasured,
    touchTargetMeasurementCount: summary.totalTouchTargetsMeasured,
    warningCount: summary.totalWarnings,
  };
}
