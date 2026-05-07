import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  PccAccessibilityEvidenceRun,
  PccAccessibilitySurfaceEvidence,
} from './pcc-live.accessibility.types';

const DISCLAIMER =
  'This output is accessibility, keyboard, focus, ARIA, contrast, reduced-motion, hover-only, touch-target, and dialog-focus evidence support for EV-72..EV-82 only. It is not a final scorecard result and does not mark any EV captured without operator review.';

const UNSAFE_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|session|secrets|trace|video|har/i;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noHtml = noCred
    .replace(/node\.html/gi, '[redacted-html]')
    .replace(/failureSummary/gi, '[redacted-summary]')
    .replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function safeArtifactPath(pathLike: string): boolean {
  return !UNSAFE_PATH_PATTERN.test(pathLike);
}

function sanitizeSurface(
  surface: PccAccessibilitySurfaceEvidence,
): PccAccessibilitySurfaceEvidence {
  return {
    ...surface,
    label: sanitizeText(surface.label),
    warnings: surface.warnings.map(sanitizeText),
    axeViolations: surface.axeViolations.map((item) => ({
      ...item,
      ruleId: sanitizeText(item.ruleId),
      impact: item.impact ? sanitizeText(item.impact) : undefined,
      help: item.help ? sanitizeText(item.help) : undefined,
      helpUrl: item.helpUrl ? sanitizeText(item.helpUrl) : undefined,
      tags: item.tags.map(sanitizeText),
      sanitizedTargets: item.sanitizedTargets.map(sanitizeText),
    })),
    keyboardFocus: surface.keyboardFocus.map((item) => ({
      ...item,
      role: item.role ? sanitizeText(item.role) : undefined,
      tagName: sanitizeText(item.tagName),
      selector: sanitizeText(item.selector),
    })),
    ariaLabels: surface.ariaLabels.map((item) => ({
      ...item,
      selector: sanitizeText(item.selector),
      tagName: sanitizeText(item.tagName),
      role: item.role ? sanitizeText(item.role) : undefined,
      ariaLabel: item.ariaLabel ? sanitizeText(item.ariaLabel) : undefined,
      ariaLabelledBy: item.ariaLabelledBy ? sanitizeText(item.ariaLabelledBy) : undefined,
      ariaDescribedBy: item.ariaDescribedBy ? sanitizeText(item.ariaDescribedBy) : undefined,
    })),
    contrast: surface.contrast.map((item) => ({ ...item, details: sanitizeText(item.details) })),
    reducedMotion: surface.reducedMotion,
    hoverOnly: {
      ...surface.hoverOnly,
      selectors: surface.hoverOnly.selectors.map(sanitizeText),
    },
    dialogFocus: {
      ...surface.dialogFocus,
      notes: surface.dialogFocus.notes.map(sanitizeText),
    },
    touchTargets: surface.touchTargets.map((item) => ({
      ...item,
      selector: sanitizeText(item.selector),
      role: item.role ? sanitizeText(item.role) : undefined,
      tagName: sanitizeText(item.tagName),
    })),
  };
}

export interface WritePccAccessibilityEvidenceInput {
  outputDir: string;
  run: Omit<PccAccessibilityEvidenceRun, 'disclaimer' | 'summary' | 'surfaces' | 'warnings'> & {
    surfaces: readonly PccAccessibilitySurfaceEvidence[];
    warnings?: string[];
  };
  artifactPaths?: string[];
}

export interface WritePccAccessibilityEvidenceResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  axeSummaryPath: string;
  keyboardSummaryPath: string;
  ariaSummaryPath: string;
  contrastSummaryPath: string;
  surfaceCount: number;
  axeViolationSummaryCount: number;
  keyboardFocusStopCount: number;
  ariaNeedsReviewCount: number;
  contrastNeedsReviewCount: number;
  reducedMotionRiskCount: number;
  hoverOnlyRiskCount: number;
  touchTargetIssueCount: number;
  dialogModalObservationCount: number;
  warningCount: number;
}

export async function writePccAccessibilityEvidence(
  input: WritePccAccessibilityEvidenceInput,
): Promise<WritePccAccessibilityEvidenceResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const surfaces = input.run.surfaces.map(sanitizeSurface);
  const warnings = (input.run.warnings ?? []).map(sanitizeText);

  const summary = {
    totalSurfaces: surfaces.length,
    totalAxeViolations: surfaces.reduce(
      (sum, s) => sum + s.axeViolations.reduce((n, v) => n + v.count, 0),
      0,
    ),
    totalKeyboardFocusStops: surfaces.reduce((sum, s) => sum + s.keyboardFocus.length, 0),
    totalAriaNeedsReview: surfaces.reduce(
      (sum, s) => sum + s.ariaLabels.filter((x) => x.needsReview).length,
      0,
    ),
    totalContrastNeedsReview: surfaces.reduce(
      (sum, s) => sum + s.contrast.filter((x) => x.needsReview).length,
      0,
    ),
    totalReducedMotionRisks: surfaces.reduce(
      (sum, s) => sum + s.reducedMotion.animationRiskCount + s.reducedMotion.transitionRiskCount,
      0,
    ),
    totalHoverOnlyRisks: surfaces.reduce((sum, s) => sum + s.hoverOnly.hoverOnlyRiskCount, 0),
    totalDialogFocusNeedsReview: surfaces.reduce(
      (sum, s) => sum + (s.dialogFocus.status === 'needs-review' ? 1 : 0),
      0,
    ),
    totalTouchTargetIssues: surfaces.reduce(
      (sum, s) => sum + s.touchTargets.filter((x) => x.belowRecommendedSize).length,
      0,
    ),
    totalWarnings: warnings.length + surfaces.reduce((sum, s) => sum + s.warnings.length, 0),
  };

  const runPayload: PccAccessibilityEvidenceRun = {
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
    .map((item) => sanitizeText(item));

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-accessibility-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-accessibility-evidence.md');
  const axeSummaryPath = path.join(input.outputDir, 'pcc-live-axe-summary.json');
  const keyboardSummaryPath = path.join(input.outputDir, 'pcc-live-keyboard-focus-summary.json');
  const ariaSummaryPath = path.join(input.outputDir, 'pcc-live-aria-label-summary.json');
  const contrastSummaryPath = path.join(input.outputDir, 'pcc-live-contrast-summary.json');

  const axeSummary = surfaces.flatMap((surface) => surface.axeViolations);
  const keyboardSummary = surfaces.flatMap((surface) => surface.keyboardFocus);
  const ariaSummary = surfaces.flatMap((surface) => surface.ariaLabels);
  const contrastSummary = surfaces.flatMap((surface) => surface.contrast);

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(axeSummaryPath, `${JSON.stringify(axeSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(keyboardSummaryPath, `${JSON.stringify(keyboardSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(ariaSummaryPath, `${JSON.stringify(ariaSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(contrastSummaryPath, `${JSON.stringify(contrastSummary, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# PCC Live Accessibility Evidence');
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
  lines.push(`- Axe violation count: ${summary.totalAxeViolations}`);
  lines.push(`- Keyboard focus stops: ${summary.totalKeyboardFocusStops}`);
  lines.push(`- ARIA needs-review count: ${summary.totalAriaNeedsReview}`);
  lines.push(`- Contrast needs-review count: ${summary.totalContrastNeedsReview}`);
  lines.push(`- Reduced-motion risk count: ${summary.totalReducedMotionRisks}`);
  lines.push(`- Hover-only risk count: ${summary.totalHoverOnlyRisks}`);
  lines.push(`- Dialog/modal needs-review count: ${summary.totalDialogFocusNeedsReview}`);
  lines.push(`- Touch target issue count: ${summary.totalTouchTargetIssues}`);
  lines.push(`- Warning count: ${summary.totalWarnings}`);
  lines.push('');
  lines.push('## Surface Table');
  lines.push(
    '| Surface | Axe | Focus Stops | ARIA Review | Contrast Review | Hover Risks | Touch Issues | Dialog Status |',
  );
  lines.push('|---|---:|---:|---:|---:|---:|---:|---|');
  for (const surface of surfaces) {
    const axeCount = surface.axeViolations.reduce((sum, x) => sum + x.count, 0);
    const ariaNeeds = surface.ariaLabels.filter((x) => x.needsReview).length;
    const contrastNeeds = surface.contrast.filter((x) => x.needsReview).length;
    const touchIssues = surface.touchTargets.filter((x) => x.belowRecommendedSize).length;
    lines.push(
      `| ${surface.surfaceId} | ${axeCount} | ${surface.keyboardFocus.length} | ${ariaNeeds} | ${contrastNeeds} | ${surface.hoverOnly.hoverOnlyRiskCount} | ${touchIssues} | ${surface.dialogFocus.status} |`,
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
  lines.push('- Accessibility evidence is operator-review pending before commit eligibility.');
  lines.push('- Raw DOM HTML and raw Axe node payloads are prohibited in outputs.');
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);

  await fs.writeFile(evidenceMarkdownPath, `${lines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    axeSummaryPath,
    keyboardSummaryPath,
    ariaSummaryPath,
    contrastSummaryPath,
    surfaceCount: summary.totalSurfaces,
    axeViolationSummaryCount: surfaces.reduce((sum, s) => sum + s.axeViolations.length, 0),
    keyboardFocusStopCount: summary.totalKeyboardFocusStops,
    ariaNeedsReviewCount: summary.totalAriaNeedsReview,
    contrastNeedsReviewCount: summary.totalContrastNeedsReview,
    reducedMotionRiskCount: summary.totalReducedMotionRisks,
    hoverOnlyRiskCount: summary.totalHoverOnlyRisks,
    touchTargetIssueCount: summary.totalTouchTargetIssues,
    dialogModalObservationCount: surfaces.reduce(
      (sum, s) => sum + (s.dialogFocus.status === 'not-observed' ? 0 : s.dialogFocus.dialogCount),
      0,
    ),
    warningCount: summary.totalWarnings,
  };
}
