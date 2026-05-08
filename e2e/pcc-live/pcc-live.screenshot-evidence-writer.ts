import fs from 'node:fs/promises';
import path from 'node:path';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
import type { PccEvidenceId } from './pcc-evidence.types';
import type {
  PccDomCardSummary,
  PccScreenshotArtifact,
  PccScreenshotEvidenceRun,
  PccScreenshotManifestByEvRow,
  PccSurfaceScreenshotEvidence,
} from './pcc-live.screenshot.types';

const DISCLAIMER =
  'This output is screenshot and DOM-summary evidence support for EV-37..EV-49 and EV-125..EV-134 only. It is not a final scorecard result and does not mark any EV captured without operator review.';

const UNSAFE_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookies?|tokens?|auth|sessions?|secrets|trace|video|har/i;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookies?|tokens?|auth|sessions?|secrets)\b/gi,
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
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookies?|tokens?|auth|sessions?|secrets)\b/gi,
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
  screenshotContactSheetPath: string;
  screenshotManifestByEvPath: string;
  firstScreenReviewIndexPath: string;
  screenshotCount: number;
  surfaceCount: number;
  domCardSummaryCount: number;
}

const SCREENSHOT_MANIFEST_REVIEW_PROMPTS = [
  'Evaluate command-center clarity and first-glance orientation.',
  'Assess card hierarchy, cognitive load, and next-action visibility.',
  'Verify SharePoint host-fit and field/tablet usability cues.',
  'Confirm screenshot requires operator scrub/review before commit.',
] as const;

function toPosix(value: string): string {
  return value.replaceAll('\\', '/');
}

function escapeMdCell(value: string): string {
  return value.replaceAll('|', '\\|');
}

function displayPathForMarkdown(pathLike: string): string {
  const normalized = toPosix(pathLike);
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized)) {
    return '[operator-review path]';
  }
  return normalized;
}

function canEmbedMarkdownImage(pathLike: string): boolean {
  const displayPath = displayPathForMarkdown(pathLike);
  return displayPath !== '[operator-review path]' && !UNSAFE_PATH_PATTERN.test(displayPath);
}

function buildScreenshotManifestRows(
  surfaces: readonly PccSurfaceScreenshotEvidence[],
  evRefs: readonly PccEvidenceId[],
): PccScreenshotManifestByEvRow[] {
  const registryById = new Map(PCC_EVIDENCE_REGISTRY.map((record) => [record.id, record]));
  const rows: PccScreenshotManifestByEvRow[] = [];

  for (const surface of surfaces) {
    for (const screenshot of surface.screenshots) {
      for (const evId of evRefs) {
        const record = registryById.get(evId);
        if (!record) continue;
        const displayPath = displayPathForMarkdown(screenshot.path);
        rows.push({
          evId: record.id,
          pillarRefs: record.pillarRefs,
          hardStopRefs: record.hardStopRefs,
          surfaceId: screenshot.surfaceId,
          surfaceLabel: surface.label,
          screenshotKind: screenshot.kind,
          fileName: screenshot.fileName,
          path: screenshot.path,
          displayPath,
          viewportWidth: screenshot.viewportWidth,
          viewportHeight: screenshot.viewportHeight,
          operatorReviewRequired: true,
          artifactPolicy: 'operator-review-required',
          reviewPrompts: SCREENSHOT_MANIFEST_REVIEW_PROMPTS,
        });
      }
    }
  }

  return rows.sort((a, b) => {
    const evCmp = Number(a.evId.replace('EV-', '')) - Number(b.evId.replace('EV-', ''));
    if (evCmp !== 0) return evCmp;
    const surfaceCmp = a.surfaceId.localeCompare(b.surfaceId);
    if (surfaceCmp !== 0) return surfaceCmp;
    const kindCmp = a.screenshotKind.localeCompare(b.screenshotKind);
    if (kindCmp !== 0) return kindCmp;
    const viewportCmp = a.viewportWidth - b.viewportWidth || a.viewportHeight - b.viewportHeight;
    if (viewportCmp !== 0) return viewportCmp;
    return a.fileName.localeCompare(b.fileName);
  });
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
  const screenshotContactSheetPath = path.join(input.outputDir, 'screenshot-contact-sheet.md');
  const screenshotManifestByEvPath = path.join(input.outputDir, 'screenshot-manifest-by-ev.json');
  const firstScreenReviewIndexPath = path.join(input.outputDir, 'first-screen-review-index.md');

  const inventory = surfaces.flatMap((surface) => surface.screenshots);
  const domSummary = surfaces.flatMap((surface) => surface.cardSummaries);
  const manifestRows = buildScreenshotManifestRows(surfaces, runPayload.evRefs);

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(inventoryJsonPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf-8');
  await fs.writeFile(domSummaryJsonPath, `${JSON.stringify(domSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(
    screenshotManifestByEvPath,
    `${JSON.stringify(manifestRows, null, 2)}\n`,
    'utf-8',
  );

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

  const contactSheetLines: string[] = [];
  contactSheetLines.push('# Screenshot Contact Sheet');
  contactSheetLines.push('');
  contactSheetLines.push('- Review support only.');
  contactSheetLines.push('- Screenshots require operator review and scrub before commit.');
  contactSheetLines.push('- No final score is calculated.');
  contactSheetLines.push('- No hard stop is passed or failed.');
  contactSheetLines.push('- No EV is finally captured.');
  contactSheetLines.push('- No Phase 4 readiness is approved.');
  contactSheetLines.push('');
  contactSheetLines.push(
    '| Surface | Kind | Viewport | File | Display Path | Operator Review | Artifact Policy |',
  );
  contactSheetLines.push('|---|---|---|---|---|---|---|');
  for (const surface of surfaces) {
    for (const screenshot of surface.screenshots) {
      const displayPath = displayPathForMarkdown(screenshot.path);
      contactSheetLines.push(
        `| ${escapeMdCell(surface.surfaceId)} (${escapeMdCell(surface.label)}) | ${screenshot.kind} | ${screenshot.viewportWidth}x${screenshot.viewportHeight} | ${escapeMdCell(screenshot.fileName)} | ${escapeMdCell(displayPath)} | operator-review-required | commit-eligible-after-scrub |`,
      );
      if (canEmbedMarkdownImage(screenshot.path)) {
        contactSheetLines.push(`![${escapeMdCell(screenshot.fileName)}](${displayPath})`);
      } else {
        contactSheetLines.push(`- Operator-review path reference: ${escapeMdCell(displayPath)}`);
      }
      contactSheetLines.push('');
    }
  }
  await fs.writeFile(screenshotContactSheetPath, `${contactSheetLines.join('\n')}\n`, 'utf-8');

  const firstScreenLines: string[] = [];
  firstScreenLines.push('# First-Screen Review Index');
  firstScreenLines.push('');
  firstScreenLines.push('- reviewer posture: expert-review-required');
  firstScreenLines.push('- screenshot posture: operator-review-required');
  firstScreenLines.push('- no scoring columns or pass/fail columns are provided.');
  firstScreenLines.push('');
  firstScreenLines.push(
    '| Surface | Viewport | File | Command-center clarity | Project context | Priority/action visibility | Card hierarchy | Cognitive load | SharePoint host fit | Field/tablet usability | Source/context confidence | False-affordance risk | Scrub status |',
  );
  firstScreenLines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const surface of surfaces) {
    for (const screenshot of surface.screenshots.filter((shot) => shot.kind === 'above-fold')) {
      firstScreenLines.push(
        `| ${escapeMdCell(surface.surfaceId)} (${escapeMdCell(surface.label)}) | ${screenshot.viewportWidth}x${screenshot.viewportHeight} | ${escapeMdCell(screenshot.fileName)} | expert-review-required | expert-review-required | expert-review-required | expert-review-required | expert-review-required | expert-review-required | expert-review-required | expert-review-required | expert-review-required | operator-review-required |`,
      );
    }
  }
  firstScreenLines.push('');
  firstScreenLines.push('Review prompts:');
  firstScreenLines.push('- command-center clarity');
  firstScreenLines.push('- project context continuity');
  firstScreenLines.push('- priority and action visibility');
  firstScreenLines.push('- card hierarchy and density');
  firstScreenLines.push('- cognitive load and information pacing');
  firstScreenLines.push('- SharePoint host-fit integrity');
  firstScreenLines.push('- field/tablet usability');
  firstScreenLines.push('- source/context confidence cues');
  firstScreenLines.push('- false-affordance risk');
  firstScreenLines.push('- screenshot scrub and operator-review status');
  await fs.writeFile(firstScreenReviewIndexPath, `${firstScreenLines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    inventoryJsonPath,
    domSummaryJsonPath,
    screenshotContactSheetPath,
    screenshotManifestByEvPath,
    firstScreenReviewIndexPath,
    screenshotCount,
    surfaceCount: surfaces.length,
    domCardSummaryCount,
  };
}
