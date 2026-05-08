import fs from 'node:fs/promises';
import path from 'node:path';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
import type { PccEvidenceId, PccHardStopRef, PccScorecardPillarRef } from './pcc-evidence.types';
import { aggregateTouchTargetDiagnostics } from './pcc-live.touch-targets';
import type {
  PccAccessibilityIssueRegisterRow,
  PccAccessibilityIssueSeveritySignal,
  PccAccessibilityIssueType,
  PccAccessibilityEvidenceRun,
  PccAccessibilitySurfaceEvidence,
} from './pcc-live.accessibility.types';

const DISCLAIMER =
  'This output is accessibility, keyboard, focus, ARIA, contrast, reduced-motion, hover-only, touch-target, and dialog-focus evidence support for EV-72..EV-82 only. It is not a final scorecard result and does not mark any EV captured without operator review.';
const ISSUE_REGISTER_DISCLAIMER =
  'Review support only. Expert review required. No final score is calculated. No hard stop is passed or failed. No EV is finally captured. No WCAG conformance result is claimed. No Phase 4 readiness is approved.';

const UNSAFE_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookies?|tokens?|auth|sessions?|secrets|trace|video|har/i;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookies?|tokens?|auth|sessions?|secrets)\b/gi,
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
  issueRegisterJsonPath: string;
  issueRegisterMarkdownPath: string;
  issueRegisterIssueCount: number;
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

const ACCESSIBILITY_ISSUE_TYPES: readonly PccAccessibilityIssueType[] = [
  'axe-violation',
  'aria-name-missing',
  'disabled-reason-missing',
  'focus-indicator-missing',
  'contrast-needs-review',
  'touch-target-size',
  'hover-only-risk',
  'reduced-motion-risk',
  'dialog-focus-needs-review',
] as const;

const ISSUE_TYPE_EV_REFS: Readonly<Record<PccAccessibilityIssueType, readonly PccEvidenceId[]>> = {
  'axe-violation': ['EV-72', 'EV-73', 'EV-77', 'EV-82'],
  'aria-name-missing': ['EV-72', 'EV-74', 'EV-78', 'EV-82'],
  'disabled-reason-missing': ['EV-74', 'EV-75', 'EV-78', 'EV-82'],
  'focus-indicator-missing': ['EV-73', 'EV-75', 'EV-78', 'EV-82'],
  'contrast-needs-review': ['EV-76', 'EV-77', 'EV-82'],
  'touch-target-size': ['EV-79', 'EV-80', 'EV-82'],
  'hover-only-risk': ['EV-78', 'EV-81', 'EV-82'],
  'reduced-motion-risk': ['EV-78', 'EV-81', 'EV-82'],
  'dialog-focus-needs-review': ['EV-73', 'EV-74', 'EV-78', 'EV-82'],
};

function evContextForIssue(issueType: PccAccessibilityIssueType): {
  evRefs: readonly PccEvidenceId[];
  pillarRefs: readonly PccScorecardPillarRef[];
  hardStopRefs: readonly PccHardStopRef[];
} {
  const evRefs = ISSUE_TYPE_EV_REFS[issueType].filter((evId) =>
    PCC_EVIDENCE_REGISTRY.some((record) => record.id === evId),
  );
  const pillarSet = new Set<PccScorecardPillarRef>();
  const hardStopSet = new Set<PccHardStopRef>();

  for (const evId of evRefs) {
    const record = PCC_EVIDENCE_REGISTRY.find((item) => item.id === evId);
    if (!record) continue;
    for (const pillar of record.pillarRefs) pillarSet.add(pillar);
    for (const hardStop of record.hardStopRefs) hardStopSet.add(hardStop);
  }

  return {
    evRefs,
    pillarRefs: Array.from(pillarSet).sort(),
    hardStopRefs: Array.from(hardStopSet).sort(),
  };
}

function hasDialogFocusGapFromNotes(notes: readonly string[]): boolean {
  return notes.some((note) =>
    /focus[- ]?(gap|missing|review|trap|order|indicator|restore|management)/i.test(note),
  );
}

function reviewPromptFor(issueType: PccAccessibilityIssueType): string {
  switch (issueType) {
    case 'axe-violation':
      return 'Review this summarized axe rule finding and validate impact and affected controls in context.';
    case 'aria-name-missing':
      return 'Confirm interactive elements expose an accessible name and context-specific purpose.';
    case 'disabled-reason-missing':
      return 'Confirm disabled controls communicate a clear reason and recovery path to users.';
    case 'focus-indicator-missing':
      return 'Confirm keyboard focus remains visible and unambiguous during navigation.';
    case 'contrast-needs-review':
      return 'Manually validate contrast behavior on critical status and action surfaces.';
    case 'touch-target-size':
      return 'Verify touch target size supports field/tablet interaction reliability.';
    case 'hover-only-risk':
      return 'Confirm critical information or actions are not hover-exclusive.';
    case 'reduced-motion-risk':
      return 'Validate reduced-motion preferences are respected for animations and transitions.';
    case 'dialog-focus-needs-review':
      return 'Validate dialog focus entry, trap behavior, and focus return after close.';
  }
}

function recommendedActionFor(issueType: PccAccessibilityIssueType): string {
  switch (issueType) {
    case 'axe-violation':
      return 'Inspect related component markup/state and rerun the accessibility lane after remediation.';
    case 'aria-name-missing':
      return 'Add or correct accessible naming and rerun keyboard + accessibility evidence.';
    case 'disabled-reason-missing':
      return 'Provide disabled-reason semantics and rerun accessibility evidence capture.';
    case 'focus-indicator-missing':
      return 'Fix focus-visible styling/logic and rerun keyboard focus observations.';
    case 'contrast-needs-review':
      return 'Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.';
    case 'touch-target-size':
      return 'Increase target dimensions/spacing and rerun touch-target observations.';
    case 'hover-only-risk':
      return 'Provide non-hover access paths and rerun hover-risk observations.';
    case 'reduced-motion-risk':
      return 'Honor reduced-motion settings for risky transitions and rerun reduced-motion checks.';
    case 'dialog-focus-needs-review':
      return 'Correct dialog focus management and rerun dialog-focus observations.';
  }
}

function issueSortValue(issue: PccAccessibilityIssueRegisterRow): string {
  return `${issue.issueType}|${issue.surfaceId}|${issue.selector ?? issue.ruleId ?? issue.focusStep ?? ''}|${issue.id}`;
}

function computeSeverity(
  issueType: PccAccessibilityIssueType,
  surfaceIssues: readonly PccAccessibilityIssueRegisterRow[],
  impact?: string,
): PccAccessibilityIssueSeveritySignal {
  const lowerImpact = (impact ?? '').toLowerCase();
  if (lowerImpact === 'critical') return 'major';
  if (
    issueType === 'dialog-focus-needs-review' &&
    surfaceIssues.some((row) => row.issueType === 'dialog-focus-needs-review')
  ) {
    return 'major';
  }
  const clustered =
    surfaceIssues.filter((row) =>
      ['aria-name-missing', 'disabled-reason-missing', 'touch-target-size'].includes(row.issueType),
    ).length > 1;
  if (clustered) return 'major';
  if (
    lowerImpact === 'serious' ||
    issueType === 'disabled-reason-missing' ||
    issueType === 'focus-indicator-missing' ||
    issueType === 'contrast-needs-review' ||
    issueType === 'aria-name-missing'
  ) {
    return 'moderate';
  }
  return 'review';
}

function buildAccessibilityIssues(
  surfaces: readonly PccAccessibilitySurfaceEvidence[],
): PccAccessibilityIssueRegisterRow[] {
  const rows: PccAccessibilityIssueRegisterRow[] = [];
  let idCounter = 0;

  const pushRow = (
    surface: PccAccessibilitySurfaceEvidence,
    issueType: PccAccessibilityIssueType,
    partial: Partial<PccAccessibilityIssueRegisterRow> = {},
  ): void => {
    idCounter += 1;
    const context = evContextForIssue(issueType);
    const surfaceRows = rows.filter((row) => row.surfaceId === surface.surfaceId);
    rows.push({
      id: `A11Y-ISSUE-${String(idCounter).padStart(4, '0')}`,
      surfaceId: surface.surfaceId,
      surfaceLabel: surface.label,
      issueType,
      severitySignal: computeSeverity(issueType, surfaceRows, partial.impact),
      evRefs: context.evRefs,
      pillarRefs: context.pillarRefs,
      hardStopRefs: context.hardStopRefs,
      operatorReviewRequired: true,
      artifactPolicy: 'operator-review-required',
      reviewPrompt: reviewPromptFor(issueType),
      recommendedAction: recommendedActionFor(issueType),
      ...partial,
    });
  };

  for (const surface of surfaces) {
    for (const violation of surface.axeViolations) {
      if (violation.count > 0) {
        pushRow(surface, 'axe-violation', {
          ruleId: violation.ruleId,
          impact: violation.impact,
          count: violation.count,
          details: violation.help,
        });
      }
    }

    for (const aria of surface.ariaLabels) {
      if (!aria.accessibleNamePresent) {
        pushRow(surface, 'aria-name-missing', {
          selector: aria.selector,
          role: aria.role,
          tagName: aria.tagName,
        });
      }
      if (aria.disabled && !aria.disabledReasonPresent) {
        pushRow(surface, 'disabled-reason-missing', {
          selector: aria.selector,
          role: aria.role,
          tagName: aria.tagName,
        });
      }
    }

    for (const focus of surface.keyboardFocus) {
      if (!focus.hasVisibleFocusIndicator) {
        pushRow(surface, 'focus-indicator-missing', {
          selector: focus.selector,
          focusStep: focus.focusStep,
          role: focus.role,
          tagName: focus.tagName,
          boundingWidth: focus.boundingWidth,
          boundingHeight: focus.boundingHeight,
        });
      }
    }

    for (const contrast of surface.contrast) {
      if (contrast.needsReview) {
        pushRow(surface, 'contrast-needs-review', {
          ruleId: contrast.ruleId,
          count: contrast.count,
          details: contrast.details,
        });
      }
    }

    for (const target of surface.touchTargets) {
      if (target.belowRecommendedSize) {
        pushRow(surface, 'touch-target-size', {
          selector: target.selector,
          role: target.role,
          tagName: target.tagName,
          width: target.width,
          height: target.height,
          thresholdPx: target.thresholdPx,
          measurementLane: target.measurementLane,
        });
      }
    }

    if (surface.hoverOnly.needsReview || surface.hoverOnly.hoverOnlyRiskCount > 0) {
      pushRow(surface, 'hover-only-risk', {
        count: surface.hoverOnly.hoverOnlyRiskCount,
        selector: surface.hoverOnly.selectors[0],
      });
    }

    if (
      surface.reducedMotion.needsReview ||
      surface.reducedMotion.animationRiskCount > 0 ||
      surface.reducedMotion.transitionRiskCount > 0
    ) {
      pushRow(surface, 'reduced-motion-risk', {
        count: surface.reducedMotion.animationRiskCount + surface.reducedMotion.transitionRiskCount,
      });
    }

    const dialogNeedsReview =
      surface.dialogFocus.status === 'needs-review' ||
      surface.dialogFocus.focusTrapObserved === false ||
      hasDialogFocusGapFromNotes(surface.dialogFocus.notes);
    if (dialogNeedsReview) {
      pushRow(surface, 'dialog-focus-needs-review', {
        count: surface.dialogFocus.dialogCount,
        status: surface.dialogFocus.status,
        details: surface.dialogFocus.notes.join('; '),
      });
    }
  }

  return rows.sort((a, b) => issueSortValue(a).localeCompare(issueSortValue(b)));
}

function issueCountByType(
  rows: readonly PccAccessibilityIssueRegisterRow[],
): Record<PccAccessibilityIssueType, number> {
  const counts = ACCESSIBILITY_ISSUE_TYPES.reduce(
    (acc, key) => ({ ...acc, [key]: 0 }),
    {} as Record<PccAccessibilityIssueType, number>,
  );
  for (const row of rows) counts[row.issueType] += 1;
  return counts;
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
    touchTargetDiagnostics: aggregateTouchTargetDiagnostics(
      surfaces.flatMap((surface) =>
        surface.touchTargetScopeDiagnostics ? [surface.touchTargetScopeDiagnostics] : [],
      ),
    ),
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
  const issueRegisterJsonPath = path.join(
    input.outputDir,
    'pcc-live-accessibility-issue-register.json',
  );
  const issueRegisterMarkdownPath = path.join(
    input.outputDir,
    'pcc-live-accessibility-issue-register.md',
  );

  const axeSummary = surfaces.flatMap((surface) => surface.axeViolations);
  const keyboardSummary = surfaces.flatMap((surface) => surface.keyboardFocus);
  const ariaSummary = surfaces.flatMap((surface) => surface.ariaLabels);
  const contrastSummary = surfaces.flatMap((surface) => surface.contrast);
  const issueRows = buildAccessibilityIssues(surfaces);
  const countsByType = issueCountByType(issueRows);
  const majorIssueCount = issueRows.filter((row) => row.severitySignal === 'major').length;
  const moderateIssueCount = issueRows.filter((row) => row.severitySignal === 'moderate').length;
  const reviewIssueCount = issueRows.filter((row) => row.severitySignal === 'review').length;

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
    'utf-8',
  );
  await fs.writeFile(axeSummaryPath, `${JSON.stringify(axeSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(keyboardSummaryPath, `${JSON.stringify(keyboardSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(ariaSummaryPath, `${JSON.stringify(ariaSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(contrastSummaryPath, `${JSON.stringify(contrastSummary, null, 2)}\n`, 'utf-8');
  await fs.writeFile(
    issueRegisterJsonPath,
    `${JSON.stringify(
      {
        runId: runPayload.runId,
        generatedAtIso: runPayload.generatedAtIso,
        summary: {
          totalIssueCount: issueRows.length,
          issueCountByType: countsByType,
          majorIssueCount,
          moderateIssueCount,
          reviewIssueCount,
        },
        issues: issueRows,
        disclaimer: ISSUE_REGISTER_DISCLAIMER,
      },
      null,
      2,
    )}\n`,
    'utf-8',
  );

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
  lines.push(
    `- Touch target diagnostics (candidate/measured/hidden/disabled/disabled-filtered/fallback-used): ${summary.touchTargetDiagnostics.candidateCount}/${summary.touchTargetDiagnostics.measuredCount}/${summary.touchTargetDiagnostics.hiddenFilteredCount}/${summary.touchTargetDiagnostics.disabledCount}/${summary.touchTargetDiagnostics.disabledFilteredCount}/${summary.touchTargetDiagnostics.fallbackUsedCount}`,
  );
  lines.push(`- Accessibility issue register count: ${issueRows.length}`);
  lines.push(`- Warning count: ${summary.totalWarnings}`);
  lines.push('');
  lines.push('## Touch Target Reconciliation Diagnostics');
  lines.push('- Accessibility lane purpose: accessibility/touch review measurement.');
  lines.push('- Accessibility threshold policy: 44px.');
  lines.push(
    '- Breakpoint and accessibility touch-target counts may differ by lane scope and threshold; count differences alone are not failure outcomes.',
  );
  lines.push('- Zero-measure reason counts:');
  lines.push(
    `  - root-not-found: ${summary.touchTargetDiagnostics.zeroMeasureReasonCounts['root-not-found']}`,
  );
  lines.push(
    `  - no-candidates-in-root: ${summary.touchTargetDiagnostics.zeroMeasureReasonCounts['no-candidates-in-root']}`,
  );
  lines.push(
    `  - all-candidates-hidden: ${summary.touchTargetDiagnostics.zeroMeasureReasonCounts['all-candidates-hidden']}`,
  );
  lines.push(
    `  - all-candidates-disabled-or-excluded: ${summary.touchTargetDiagnostics.zeroMeasureReasonCounts['all-candidates-disabled-or-excluded']}`,
  );
  lines.push(
    `  - measurement-error: ${summary.touchTargetDiagnostics.zeroMeasureReasonCounts['measurement-error']}`,
  );
  lines.push('');
  lines.push('## Accessibility Issue Register');
  lines.push(`- JSON: ${path.basename(issueRegisterJsonPath)}`);
  lines.push(`- Markdown: ${path.basename(issueRegisterMarkdownPath)}`);
  lines.push(`- Total issue rows: ${issueRows.length}`);
  lines.push('- Issue count by type:');
  for (const issueType of ACCESSIBILITY_ISSUE_TYPES) {
    lines.push(`  - ${issueType}: ${countsByType[issueType]}`);
  }
  lines.push(
    '- Issue rows are evidence-support signals only and are not automated WCAG/hard-stop/score outcomes.',
  );
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

  const issueMd: string[] = [];
  issueMd.push('# PCC Live Accessibility Issue Register');
  issueMd.push('');
  issueMd.push('- Review support only.');
  issueMd.push('- Expert review required.');
  issueMd.push('- No final score is calculated.');
  issueMd.push('- No hard stop is passed or failed.');
  issueMd.push('- No EV is finally captured.');
  issueMd.push('- No WCAG conformance result is claimed.');
  issueMd.push('- No Phase 4 readiness is approved.');
  issueMd.push('');
  issueMd.push('## How To Use This Register');
  issueMd.push('- Use this register for localized triage and remediation planning.');
  issueMd.push('- Verify each finding manually in source and live evidence context.');
  issueMd.push('- Confirm remediation and rerun the relevant accessibility lane.');
  issueMd.push('- Do not treat issue existence as an automated failure outcome.');
  issueMd.push('');
  issueMd.push(`- Run ID: ${runPayload.runId}`);
  issueMd.push(`- Generated: ${runPayload.generatedAtIso}`);
  issueMd.push(`- Total issue rows: ${issueRows.length}`);
  issueMd.push(
    `- Severity summary: major ${majorIssueCount}, moderate ${moderateIssueCount}, review ${reviewIssueCount}`,
  );
  issueMd.push('');
  issueMd.push('## Issue Counts By Type');
  for (const issueType of ACCESSIBILITY_ISSUE_TYPES) {
    issueMd.push(`- ${issueType}: ${countsByType[issueType]}`);
  }
  issueMd.push('');

  const bySurface = new Map<string, PccAccessibilityIssueRegisterRow[]>();
  for (const issue of issueRows) {
    const key = `${issue.surfaceId} (${issue.surfaceLabel ?? 'unlabeled surface'})`;
    if (!bySurface.has(key)) bySurface.set(key, []);
    bySurface.get(key)!.push(issue);
  }

  for (const [surface, rows] of bySurface) {
    issueMd.push(`## ${surface}`);
    issueMd.push('');
    const byType = new Map<PccAccessibilityIssueType, PccAccessibilityIssueRegisterRow[]>();
    for (const row of rows) {
      if (!byType.has(row.issueType)) byType.set(row.issueType, []);
      byType.get(row.issueType)!.push(row);
    }
    for (const issueType of ACCESSIBILITY_ISSUE_TYPES) {
      const typeRows = byType.get(issueType) ?? [];
      if (typeRows.length === 0) continue;
      issueMd.push(`### ${issueType}`);
      issueMd.push('');
      for (const row of typeRows) {
        issueMd.push(`- ID: ${row.id}`);
        issueMd.push(`- Severity: ${row.severitySignal}`);
        issueMd.push(`- Selector: ${row.selector ?? 'n/a'}`);
        issueMd.push(`- Rule: ${row.ruleId ?? 'n/a'}`);
        issueMd.push(`- Focus step: ${row.focusStep ?? 'n/a'}`);
        issueMd.push(`- Role/tag: ${row.role ?? 'n/a'} / ${row.tagName ?? 'n/a'}`);
        issueMd.push(
          `- Count/impact/status: ${row.count ?? 'n/a'} / ${row.impact ?? 'n/a'} / ${row.status ?? 'n/a'}`,
        );
        issueMd.push(
          `- Measurements: bounds ${row.boundingWidth ?? 'n/a'}x${row.boundingHeight ?? 'n/a'}; target ${row.width ?? 'n/a'}x${row.height ?? 'n/a'}`,
        );
        issueMd.push(
          `- Touch target context: threshold ${row.thresholdPx ?? 'n/a'}px; lane ${row.measurementLane ?? 'n/a'}`,
        );
        issueMd.push(`- Details: ${row.details ?? 'n/a'}`);
        issueMd.push(`- EV refs: ${row.evRefs.join(', ') || 'none'}`);
        issueMd.push(`- Pillar refs: ${row.pillarRefs.join(', ') || 'none'}`);
        issueMd.push(`- Hard-stop refs: ${row.hardStopRefs.join(', ') || 'none'}`);
        issueMd.push(`- Review prompt: ${row.reviewPrompt}`);
        issueMd.push(`- Recommended action: ${row.recommendedAction}`);
        issueMd.push(`- Artifact policy: ${row.artifactPolicy}; operator-review-required`);
        issueMd.push('');
      }
    }
  }

  issueMd.push('## Reviewer Action Matrix');
  issueMd.push(
    '| Issue Type | Likely Owner / Reviewer | Suggested Action | Evidence Artifact To Check | Rerun Guidance | Review Status |',
  );
  issueMd.push('|---|---|---|---|---|---|');
  issueMd.push(
    '| axe-violation | Accessibility engineer + UI owner | Validate rule context and remediate markup/state | pcc-live-axe-summary.json | Rerun accessibility spec after fix | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| aria-name-missing | UI owner + accessibility reviewer | Add/repair accessible names | pcc-live-aria-label-summary.json | Rerun aria + keyboard checks | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| disabled-reason-missing | UI owner + UX/content reviewer | Provide disabled reason semantics | pcc-live-aria-label-summary.json | Rerun accessibility spec | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| focus-indicator-missing | UI owner + accessibility reviewer | Restore visible focus behavior | pcc-live-keyboard-focus-summary.json | Rerun keyboard focus checks | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| contrast-needs-review | Design system + accessibility reviewer | Validate and adjust contrast palette values | pcc-live-contrast-summary.json | Rerun contrast checks | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| touch-target-size | UI owner + field usability reviewer | Increase hit area/spacing | pcc-live-accessibility-evidence.json | Rerun touch-target checks | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| hover-only-risk | UI owner + UX reviewer | Add non-hover pathways | pcc-live-accessibility-evidence.json | Rerun hover checks | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| reduced-motion-risk | UI owner + accessibility reviewer | Respect reduced-motion preferences | pcc-live-accessibility-evidence.json | Rerun reduced-motion checks | operator-review-required / expert-review-required |',
  );
  issueMd.push(
    '| dialog-focus-needs-review | UI owner + accessibility reviewer | Validate dialog trap/restore order | pcc-live-accessibility-evidence.json | Rerun dialog focus checks | operator-review-required / expert-review-required |',
  );
  issueMd.push('');
  issueMd.push(`> ${ISSUE_REGISTER_DISCLAIMER}`);

  await fs.writeFile(issueRegisterMarkdownPath, `${issueMd.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    axeSummaryPath,
    keyboardSummaryPath,
    ariaSummaryPath,
    contrastSummaryPath,
    issueRegisterJsonPath,
    issueRegisterMarkdownPath,
    issueRegisterIssueCount: issueRows.length,
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
