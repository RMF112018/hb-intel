import fs from 'node:fs/promises';
import path from 'node:path';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
import type { PccEvidenceId, PccHardStopRef, PccScorecardPillarRef } from './pcc-evidence.types';
import type {
  PccLiveBreakpointEvidenceRun,
  PccLiveBreakpointIssueRegisterRow,
  PccLiveBreakpointIssueSeveritySignal,
  PccLiveBreakpointIssueType,
  PccLiveBreakpointSurfaceEvidence,
} from './pcc-live.breakpoint.types';

const DISCLAIMER =
  'This output is breakpoint, container, overflow, rowspan, and touch evidence support for EV-59..EV-71 only. It is not a final scorecard result and does not mark any EV captured without operator review.';
const ISSUE_REGISTER_DISCLAIMER =
  'Review support only. No final score is calculated. No hard stop is passed or failed. No EV is finally captured. No Phase 4 readiness is approved.';

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
  issueRegisterJsonPath: string;
  issueRegisterMarkdownPath: string;
  issueRegisterIssueCount: number;
  screenshotCount: number;
  surfaceViewportCount: number;
  cardMeasurementCount: number;
  touchTargetMeasurementCount: number;
  warningCount: number;
}

const ISSUE_TYPE_EV_REFS: Readonly<Record<PccLiveBreakpointIssueType, readonly PccEvidenceId[]>> = {
  'mode-mismatch': ['EV-59', 'EV-60', 'EV-69', 'EV-70', 'EV-71'],
  'horizontal-overflow': ['EV-63', 'EV-64', 'EV-65', 'EV-69', 'EV-70'],
  'card-clipping': ['EV-61', 'EV-62', 'EV-63', 'EV-64', 'EV-69'],
  'card-overflow-x': ['EV-63', 'EV-64', 'EV-69', 'EV-70'],
  'card-overflow-y': ['EV-61', 'EV-62', 'EV-63', 'EV-64'],
  'direct-child-invariant': ['EV-61', 'EV-62', 'EV-63', 'EV-69'],
  'touch-target-size': ['EV-67', 'EV-68', 'EV-69', 'EV-70', 'EV-71'],
  'missing-grid': ['EV-59', 'EV-60', 'EV-61', 'EV-62', 'EV-69'],
};

function evContextForIssue(issueType: PccLiveBreakpointIssueType): {
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

function issueSortValue(issue: PccLiveBreakpointIssueRegisterRow): string {
  const cardOrSelector =
    issue.cardIndex !== undefined ? `${issue.cardIndex}` : (issue.selector ?? '');
  return `${issue.issueType}|${issue.surfaceId}|${issue.viewportId}|${cardOrSelector}|${issue.id}`;
}

function computeSeverity(
  issueType: PccLiveBreakpointIssueType,
  surfaceIssueTypes: Set<PccLiveBreakpointIssueType>,
): PccLiveBreakpointIssueSeveritySignal {
  if (issueType === 'missing-grid') return 'major';
  if (
    issueType === 'horizontal-overflow' &&
    (surfaceIssueTypes.has('card-clipping') ||
      surfaceIssueTypes.has('card-overflow-x') ||
      surfaceIssueTypes.has('card-overflow-y'))
  ) {
    return 'major';
  }
  if (
    issueType === 'direct-child-invariant' &&
    (surfaceIssueTypes.has('horizontal-overflow') ||
      surfaceIssueTypes.has('card-clipping') ||
      surfaceIssueTypes.has('card-overflow-x') ||
      surfaceIssueTypes.has('card-overflow-y'))
  ) {
    return 'major';
  }
  if (issueType === 'horizontal-overflow' || issueType === 'direct-child-invariant')
    return 'moderate';
  if (issueType === 'touch-target-size') return 'review';
  return 'review';
}

function reviewPromptFor(issueType: PccLiveBreakpointIssueType): string {
  switch (issueType) {
    case 'mode-mismatch':
      return 'Confirm viewport mode derivation and CSS mode signaling are aligned for this surface and viewport.';
    case 'horizontal-overflow':
      return 'Review container/grid width behavior and identify the component causing viewport overflow.';
    case 'card-clipping':
      return 'Review clipped card content and confirm whether critical action or status content is hidden.';
    case 'card-overflow-x':
      return 'Review horizontal overflow in this card and confirm text/control wrapping behavior.';
    case 'card-overflow-y':
      return 'Review vertical overflow in this card and confirm content truncation and scroll affordance.';
    case 'direct-child-invariant':
      return 'Confirm card hierarchy remains grid-direct where required for responsive stability.';
    case 'touch-target-size':
      return 'Review touch target sizing for field/tablet usability and identify controls requiring resizing.';
    case 'missing-grid':
      return 'Confirm grid instrumentation presence and structural layout evidence for this surface and viewport.';
  }
}

function recommendedActionFor(issueType: PccLiveBreakpointIssueType): string {
  switch (issueType) {
    case 'mode-mismatch':
      return 'Capture a follow-up viewport screenshot and inspect mode-boundary CSS/data attributes.';
    case 'horizontal-overflow':
      return 'Inspect container width constraints and rerun breakpoint capture after layout correction.';
    case 'card-clipping':
      return 'Adjust card sizing/content density and rerun the affected surface/viewport pair.';
    case 'card-overflow-x':
      return 'Adjust wrapping/overflow policy for card content and rerun this viewport.';
    case 'card-overflow-y':
      return 'Adjust card height/content hierarchy and rerun the affected viewport.';
    case 'direct-child-invariant':
      return 'Restore required grid child structure and rerun capture for this surface.';
    case 'touch-target-size':
      return 'Increase target dimensions to meet guidance and rerun touch-target measurements.';
    case 'missing-grid':
      return 'Resolve missing grid signal/instrumentation and rerun breakpoint capture for this lane.';
  }
}

function buildBreakpointIssues(
  surfaces: readonly PccLiveBreakpointSurfaceEvidence[],
): PccLiveBreakpointIssueRegisterRow[] {
  const issues: PccLiveBreakpointIssueRegisterRow[] = [];
  let index = 0;

  for (const surface of surfaces) {
    const surfaceIssueTypes = new Set<PccLiveBreakpointIssueType>();
    const hasModeMismatch =
      !!surface.grid.observedMode &&
      String(surface.grid.observedMode) !== String(surface.grid.derivedMode);
    const hasHorizontalOverflow =
      surface.grid.horizontalScrollDetected ||
      surface.grid.viewportOverflowX > 0 ||
      surface.grid.documentScrollWidth > surface.grid.documentClientWidth;
    const hasMissingGridWarning = surface.warnings.some((warning) =>
      /missing[- ]grid|grid missing|grid unavailable/i.test(warning),
    );

    if (hasModeMismatch) surfaceIssueTypes.add('mode-mismatch');
    if (hasHorizontalOverflow) surfaceIssueTypes.add('horizontal-overflow');
    if (hasMissingGridWarning) surfaceIssueTypes.add('missing-grid');

    for (const card of surface.cards) {
      if (card.clipped) surfaceIssueTypes.add('card-clipping');
      if (card.overflowX) surfaceIssueTypes.add('card-overflow-x');
      if (card.overflowY) surfaceIssueTypes.add('card-overflow-y');
      if (!card.directChildOfGrid) surfaceIssueTypes.add('direct-child-invariant');
      if (card.minTouchTargetIssueCount > 0) surfaceIssueTypes.add('touch-target-size');
    }
    for (const target of surface.touchTargets) {
      if (target.belowRecommendedSize) surfaceIssueTypes.add('touch-target-size');
    }

    const pushIssue = (
      issueType: PccLiveBreakpointIssueType,
      patch: Partial<PccLiveBreakpointIssueRegisterRow> = {},
    ): void => {
      const ctx = evContextForIssue(issueType);
      index += 1;
      issues.push({
        id: `BP-ISSUE-${String(index).padStart(4, '0')}`,
        surfaceId: surface.surfaceId,
        surfaceLabel: surface.label,
        viewportId: surface.viewportId,
        viewportLabel: surface.viewportLabel,
        issueType,
        severitySignal: computeSeverity(issueType, surfaceIssueTypes),
        viewportWidth: surface.grid.browserViewportWidth,
        viewportHeight: surface.grid.browserViewportHeight,
        observedMode: surface.grid.observedMode ? String(surface.grid.observedMode) : undefined,
        derivedMode: surface.grid.derivedMode,
        expectedColumns: surface.grid.expectedColumns,
        measuredContainerWidth: surface.grid.measuredContainerWidth,
        measuredContainerHeight: surface.grid.measuredContainerHeight,
        documentScrollWidth: surface.grid.documentScrollWidth,
        documentClientWidth: surface.grid.documentClientWidth,
        viewportOverflowX: surface.grid.viewportOverflowX,
        evRefs: ctx.evRefs,
        pillarRefs: ctx.pillarRefs,
        hardStopRefs: ctx.hardStopRefs,
        operatorReviewRequired: true,
        artifactPolicy: 'operator-review-required',
        reviewPrompt: reviewPromptFor(issueType),
        recommendedAction: recommendedActionFor(issueType),
        ...patch,
      });
    };

    if (hasModeMismatch) {
      pushIssue('mode-mismatch');
    }
    if (hasHorizontalOverflow) {
      pushIssue('horizontal-overflow');
    }
    if (hasMissingGridWarning) {
      pushIssue('missing-grid');
    }

    for (const card of surface.cards) {
      const cardPatch: Partial<PccLiveBreakpointIssueRegisterRow> = {
        cardIndex: card.index,
        footprint: card.footprint,
        hierarchy: card.hierarchy,
        tier: card.tier,
        region: card.region,
        boundingWidth: card.boundingWidth,
        boundingHeight: card.boundingHeight,
        columnSpan: card.columnSpan,
        rowSpan: card.rowSpan,
        measuredHeight: card.measuredHeight,
      };
      if (card.clipped) pushIssue('card-clipping', cardPatch);
      if (card.overflowX) pushIssue('card-overflow-x', cardPatch);
      if (card.overflowY) pushIssue('card-overflow-y', cardPatch);
      if (!card.directChildOfGrid) pushIssue('direct-child-invariant', cardPatch);
      if (card.minTouchTargetIssueCount > 0) pushIssue('touch-target-size', cardPatch);
    }
    for (const target of surface.touchTargets) {
      if (!target.belowRecommendedSize) continue;
      pushIssue('touch-target-size', {
        selector: target.selector,
        touchTargetWidth: target.width,
        touchTargetHeight: target.height,
      });
    }
  }

  return issues.sort((a, b) => issueSortValue(a).localeCompare(issueSortValue(b)));
}

function issueCountsByType(
  issues: readonly PccLiveBreakpointIssueRegisterRow[],
): Record<PccLiveBreakpointIssueType, number> {
  const counts: Record<PccLiveBreakpointIssueType, number> = {
    'mode-mismatch': 0,
    'horizontal-overflow': 0,
    'card-clipping': 0,
    'card-overflow-x': 0,
    'card-overflow-y': 0,
    'direct-child-invariant': 0,
    'touch-target-size': 0,
    'missing-grid': 0,
  };
  for (const issue of issues) counts[issue.issueType] += 1;
  return counts;
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
  const issueRegisterJsonPath = path.join(
    input.outputDir,
    'pcc-live-breakpoint-issue-register.json',
  );
  const issueRegisterMarkdownPath = path.join(
    input.outputDir,
    'pcc-live-breakpoint-issue-register.md',
  );

  const matrix = surfaces.map((surface) => ({
    surfaceId: surface.surfaceId,
    viewportId: surface.viewportId,
    viewportLabel: surface.viewportLabel,
    grid: surface.grid,
    warningCount: surface.warnings.length,
  }));
  const cardMeasurements = surfaces.flatMap((surface) => surface.cards);
  const touchTargets = surfaces.flatMap((surface) => surface.touchTargets);
  const issues = buildBreakpointIssues(surfaces);
  const countsByType = issueCountsByType(issues);

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
  await fs.writeFile(
    issueRegisterJsonPath,
    `${JSON.stringify(
      {
        runId: runPayload.runId,
        generatedAtIso: runPayload.generatedAtIso,
        summary: {
          totalIssueCount: issues.length,
          issueCountByType: countsByType,
        },
        issues,
        disclaimer: ISSUE_REGISTER_DISCLAIMER,
      },
      null,
      2,
    )}\n`,
    'utf-8',
  );

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
  lines.push(`- Breakpoint issue register count: ${issues.length}`);
  lines.push('');
  lines.push('## Breakpoint Issue Register');
  lines.push(`- JSON: ${path.basename(issueRegisterJsonPath)}`);
  lines.push(`- Markdown: ${path.basename(issueRegisterMarkdownPath)}`);
  lines.push(`- Total issues: ${issues.length}`);
  lines.push('- Issue counts by type:');
  for (const [type, count] of Object.entries(countsByType)) {
    lines.push(`  - ${type}: ${count}`);
  }
  lines.push('- Issue rows are evidence-support signals and are not automated failure outcomes.');
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

  const issueLines: string[] = [];
  issueLines.push('# PCC Live Breakpoint Issue Register');
  issueLines.push('');
  issueLines.push('- Review support only.');
  issueLines.push('- No final score is calculated.');
  issueLines.push('- No hard stop is passed or failed.');
  issueLines.push('- No EV is finally captured.');
  issueLines.push('- No Phase 4 readiness is approved.');
  issueLines.push('');
  issueLines.push(`- Run ID: ${runPayload.runId}`);
  issueLines.push(`- Generated: ${runPayload.generatedAtIso}`);
  issueLines.push(`- Total issues: ${issues.length}`);
  issueLines.push('');
  issueLines.push('## Issue Count By Type');
  for (const [type, count] of Object.entries(countsByType)) {
    issueLines.push(`- ${type}: ${count}`);
  }
  issueLines.push('');

  const grouped = new Map<string, Map<string, PccLiveBreakpointIssueRegisterRow[]>>();
  for (const issue of issues) {
    const typeKey = issue.issueType;
    const surfaceKey = `${issue.surfaceId} (${issue.surfaceLabel ?? 'unlabeled surface'})`;
    if (!grouped.has(typeKey)) grouped.set(typeKey, new Map());
    const bySurface = grouped.get(typeKey)!;
    if (!bySurface.has(surfaceKey)) bySurface.set(surfaceKey, []);
    bySurface.get(surfaceKey)!.push(issue);
  }

  for (const [type, bySurface] of grouped) {
    issueLines.push(`## ${type}`);
    issueLines.push('');
    for (const [surfaceKey, rows] of bySurface) {
      issueLines.push(`### ${surfaceKey}`);
      issueLines.push('');
      const byViewport = new Map<string, PccLiveBreakpointIssueRegisterRow[]>();
      for (const row of rows) {
        const viewportKey = `${row.viewportId} (${row.viewportLabel ?? 'unlabeled viewport'})`;
        if (!byViewport.has(viewportKey)) byViewport.set(viewportKey, []);
        byViewport.get(viewportKey)!.push(row);
      }
      for (const [viewportKey, viewportRows] of byViewport) {
        issueLines.push(`#### ${viewportKey}`);
        issueLines.push('');
        for (const row of viewportRows) {
          issueLines.push(`- ID: ${row.id}`);
          issueLines.push(`- Severity signal: ${row.severitySignal}`);
          issueLines.push(`- Card index: ${row.cardIndex ?? 'n/a'}`);
          issueLines.push(`- Selector: ${row.selector ?? 'n/a'}`);
          issueLines.push(
            `- Measurements: viewport ${row.viewportWidth}x${row.viewportHeight}; card ${row.boundingWidth ?? 'n/a'}x${row.boundingHeight ?? 'n/a'}; touch ${row.touchTargetWidth ?? 'n/a'}x${row.touchTargetHeight ?? 'n/a'}`,
          );
          issueLines.push(
            `- Grid/meta: observedMode ${row.observedMode ?? 'n/a'}; derivedMode ${row.derivedMode ?? 'n/a'}; expectedColumns ${row.expectedColumns ?? 'n/a'}; overflowX ${row.viewportOverflowX ?? 'n/a'}`,
          );
          issueLines.push(`- EV refs: ${row.evRefs.join(', ') || 'none'}`);
          issueLines.push(`- Pillar refs: ${row.pillarRefs.join(', ') || 'none'}`);
          issueLines.push(`- Hard-stop refs: ${row.hardStopRefs.join(', ') || 'none'}`);
          issueLines.push(`- Review prompt: ${row.reviewPrompt}`);
          issueLines.push(`- Recommended action: ${row.recommendedAction}`);
          issueLines.push(`- Artifact policy: ${row.artifactPolicy}; operator-review-required`);
          issueLines.push('');
        }
      }
    }
  }

  issueLines.push(`> ${ISSUE_REGISTER_DISCLAIMER}`);
  await fs.writeFile(issueRegisterMarkdownPath, `${issueLines.join('\n')}\n`, 'utf-8');

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    matrixJsonPath,
    cardMeasurementsJsonPath,
    touchTargetsJsonPath,
    issueRegisterJsonPath,
    issueRegisterMarkdownPath,
    issueRegisterIssueCount: issues.length,
    screenshotCount: summary.totalScreenshots,
    surfaceViewportCount: summary.totalSurfaceViewportPairs,
    cardMeasurementCount: summary.totalCardsMeasured,
    touchTargetMeasurementCount: summary.totalTouchTargetsMeasured,
    warningCount: summary.totalWarnings,
  };
}
