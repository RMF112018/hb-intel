import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  PccDomCardSummary,
  PccScreenshotArtifact,
  PccScreenshotEvidenceRun,
  PccSurfaceScreenshotEvidence,
} from './pcc-live.screenshot.types';

const DISCLAIMER =
  'This output is screenshot and DOM-summary evidence support for EV-37..EV-49 and EV-125..EV-134 only. It is not a final scorecard result and does not mark any EV captured without operator review.';

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

function sanitizeArtifactPath(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noBlob = noEmail.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function safeArtifactPath(pathLike: string): boolean {
  return !UNSAFE_PATH_PATTERN.test(pathLike);
}

function sanitizeScreenshotArtifact(item: PccScreenshotArtifact): PccScreenshotArtifact {
  return {
    ...item,
    path: sanitizeArtifactPath(item.path),
    fileName: sanitizeArtifactPath(item.fileName),
    operatorReviewRequired: true,
  };
}

function sanitizeCardSummary(item: PccDomCardSummary): PccDomCardSummary {
  return {
    ...item,
    headingText: item.headingText ? sanitizeText(item.headingText) : item.headingText,
    cardSelector: sanitizeText(item.cardSelector),
  };
}

function sanitizeSurface(item: PccSurfaceScreenshotEvidence): PccSurfaceScreenshotEvidence {
  return {
    ...item,
    screenshots: item.screenshots.map(sanitizeScreenshotArtifact),
    cardSummaries: item.cardSummaries.map(sanitizeCardSummary),
    warnings: item.warnings.map((warning) => sanitizeText(warning)),
  };
}

export interface WritePccScreenshotEvidenceInput {
  outputDir: string;
  run: Omit<PccScreenshotEvidenceRun, 'disclaimer' | 'summary' | 'surfaces' | 'warnings'> & {
    surfaces: readonly PccSurfaceScreenshotEvidence[];
    warnings?: string[];
  };
  artifactPaths?: string[];
}

export interface WritePccScreenshotEvidenceResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  inventoryJsonPath: string;
  domSummaryJsonPath: string;
  screenshotCount: number;
  surfaceCount: number;
  domCardSummaryCount: number;
}

export async function writePccScreenshotEvidence(
  input: WritePccScreenshotEvidenceInput,
): Promise<WritePccScreenshotEvidenceResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const surfaces = input.run.surfaces.map(sanitizeSurface);
  const warnings = (input.run.warnings ?? []).map((warning) => sanitizeText(warning));
  const screenshotCount = surfaces.reduce((sum, surface) => sum + surface.screenshots.length, 0);
  const domCardSummaryCount = surfaces.reduce(
    (sum, surface) => sum + surface.cardSummaries.length,
    0,
  );

  const summary = {
    totalSurfaces: surfaces.length,
    surfacesWithScreenshots: surfaces.filter((surface) => surface.screenshots.length > 0).length,
    totalScreenshots: screenshotCount,
    totalCards: domCardSummaryCount,
    totalWarnings:
      warnings.length + surfaces.reduce((sum, surface) => sum + surface.warnings.length, 0),
  };

  const runPayload: PccScreenshotEvidenceRun = {
    ...input.run,
    tenantSiteUrl: sanitizeText(input.run.tenantSiteUrl),
    tenantPageUrl: sanitizeText(input.run.tenantPageUrl),
    surfaces,
    summary,
    warnings,
    disclaimer: DISCLAIMER,
  };

  const artifactPaths = (input.artifactPaths ?? [])
    .filter((pathLike) => safeArtifactPath(pathLike))
    .map((pathLike) => sanitizeArtifactPath(pathLike));

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-screenshot-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-screenshot-evidence.md');
  const inventoryJsonPath = path.join(input.outputDir, 'pcc-live-screenshot-inventory.json');
  const domSummaryJsonPath = path.join(input.outputDir, 'pcc-live-dom-card-summary.json');

  const inventory = surfaces.flatMap((surface) => surface.screenshots);
  const domSummary = surfaces.flatMap((surface) => surface.cardSummaries);

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(inventoryJsonPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf-8');
  await fs.writeFile(domSummaryJsonPath, `${JSON.stringify(domSummary, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# PCC Live Screenshot Evidence');
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
  lines.push(`- Surface count: ${summary.totalSurfaces}`);
  lines.push(`- Surfaces with screenshots: ${summary.surfacesWithScreenshots}`);
  lines.push(`- Screenshot count: ${summary.totalScreenshots}`);
  lines.push(`- DOM card summary count: ${summary.totalCards}`);
  lines.push(`- Warning count: ${summary.totalWarnings}`);
  lines.push('');
  lines.push('## Surface Table');
  lines.push('| Surface | Passed | Screenshots | Card Summaries | Warnings |');
  lines.push('|---|---|---:|---:|---:|');
  for (const surface of surfaces) {
    lines.push(
      `| ${surface.surfaceId} | ${surface.passed ? 'yes' : 'no'} | ${surface.screenshots.length} | ${surface.cardSummaries.length} | ${surface.warnings.length} |`,
    );
  }
  lines.push('');
  lines.push('## Artifact Paths');
  if (artifactPaths.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const artifactPath of artifactPaths) {
      lines.push(`- ${artifactPath}`);
    }
  }
  lines.push('');
  lines.push('## Artifact Policy');
  lines.push('- Screenshot PNG files are operator-review required and not auto-commit eligible.');
  lines.push('- JSON/markdown inventories are commit-eligible only after review/scrubbing.');
  lines.push('- Raw Playwright outputs are never-commit.');
  lines.push('');
  lines.push('## Warnings');
  if (warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of warnings) {
      lines.push(`- ${warning}`);
    }
  }
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);

  await fs.writeFile(evidenceMarkdownPath, `${lines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    inventoryJsonPath,
    domSummaryJsonPath,
    screenshotCount,
    surfaceCount: surfaces.length,
    domCardSummaryCount,
  };
}
