import { PCC_LIVE_SURFACES, type PccLiveSurfaceDefinition } from './pcc-live.surfaces';
import {
  PCC_SURFACE_BLOCK_EVIDENCE_IDS,
  PCC_SURFACE_BLOCK_MAPPING,
  type PccCrossSurfaceEvidenceIndexSummary,
  type PccPrimitiveEvidenceBlockSummary,
  type PccSurfaceBlockEvidenceId,
  type PccSurfaceEvidenceBlock,
  type PccSurfaceEvidenceBlockArtifactRef,
  type PccSurfaceEvidenceBlockDisposition,
  type PccSurfaceEvidenceBlockRun,
  type PccSurfaceEvidenceGapItem,
} from './pcc-live.surface-blocks.types';

export const PCC_SURFACE_BLOCKS_DISCLAIMER =
  'This output is surface and primitive evidence block review support for EV-125 through EV-134 only. It is not a final scorecard result, does not mark any EV captured, and does not mark any hard stop passed or failed.';

const MAX_SNIPPET = 160;
const MAX_REFS_PER_LANE = 5;
const MAX_GAPS = 8;
const MAX_QUESTIONS = 8;
const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;
const OUT_OF_SCOPE_EV_RE = /\bEV-(\d+)\b/g;

function sanitizeText(input: string): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  const noQuery = normalized.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secret|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noArtifacts = noCred
    .replace(/test-results/gi, '[redacted-artifact]')
    .replace(/playwright-report/gi, '[redacted-artifact]')
    .replace(/trace\.zip/gi, '[redacted-artifact]')
    .replace(/video\.webm/gi, '[redacted-artifact]')
    .replace(/network\.har/gi, '[redacted-artifact]');
  const noClaims = noArtifacts
    .replace(/hard stop passed/gi, '[redacted-claim]')
    .replace(/hard stop failed/gi, '[redacted-claim]')
    .replace(/score-ready/gi, '[redacted-claim]')
    .replace(/Phase 4 ready/gi, '[redacted-claim]')
    .replace(/56\/56 achieved/gi, '[redacted-claim]')
    .replace(/100\/100/gi, '[redacted-claim]')
    .replace(/mold breaker achieved/gi, '[redacted-claim]')
    .replace(/\bcaptured\b/gi, '[redacted-claim]');
  const noHtml = noClaims.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  const scopedEv = noBlob.replace(OUT_OF_SCOPE_EV_RE, (_m, num) => {
    const id = Number(num);
    if (id >= 125 && id <= 134) return `EV-${id}`;
    return '[redacted-ev]';
  });
  return scopedEv.slice(0, MAX_SNIPPET);
}

function safeArtifactPath(pathLike: string): boolean {
  return !/(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|session|secret|trace|video|har/i.test(
    pathLike,
  );
}

function asNum(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toNotes(...items: unknown[]): string[] {
  return items
    .flatMap((item) => {
      if (typeof item === 'string') return [sanitizeText(item)];
      if (Array.isArray(item)) return item.map((x) => sanitizeText(String(x)));
      return [];
    })
    .filter(Boolean)
    .slice(0, 5);
}

function summarizeFromObject(source: unknown, keys: string[], fallback = 0): number {
  if (!source || typeof source !== 'object') return fallback;

  const resolvePath = (value: unknown, path: string): unknown => {
    const segments = path.split('.').filter(Boolean);
    let current: unknown = value;
    for (const segment of segments) {
      if (segment === 'length') {
        if (Array.isArray(current) || typeof current === 'string') {
          current = current.length;
          continue;
        }
        return undefined;
      }

      if (!current || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[segment];
    }
    return current;
  };

  for (const key of keys) {
    const value = resolvePath(source, key);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return fallback;
}

function collectArtifactRefs(
  block: PccSurfaceEvidenceBlock,
  artifactPaths: readonly string[],
): PccSurfaceEvidenceBlockArtifactRef[] {
  const byLane: Record<string, number> = {};
  const refs: PccSurfaceEvidenceBlockArtifactRef[] = [];
  const surfaceHint = block.surfaceId ?? block.blockId;

  for (const raw of artifactPaths) {
    if (!safeArtifactPath(raw)) continue;
    const p = sanitizeText(raw);
    if (!p) continue;
    const lower = p.toLowerCase();
    if (!lower.includes(surfaceHint.toLowerCase()) && block.blockType === 'surface') continue;

    const sourceLane = lower.includes('breakpoint')
      ? 'breakpoint'
      : lower.includes('accessibility') || lower.includes('axe')
        ? 'accessibility'
        : lower.includes('workflow')
          ? 'workflow'
          : lower.includes('conditional')
            ? 'conditional'
            : lower.includes('content')
              ? 'content'
              : lower.includes('doctrine')
                ? 'doctrine-source'
                : lower.includes('screenshot')
                  ? 'screenshot'
                  : lower.includes('surface-smoke')
                    ? 'surface-smoke'
                    : 'runtime';

    byLane[sourceLane] = (byLane[sourceLane] ?? 0) + 1;
    if (byLane[sourceLane] > MAX_REFS_PER_LANE) continue;

    refs.push({
      artifactKind: p.endsWith('.md') ? 'markdown-summary' : 'json-summary',
      sourceLane,
      path: p,
      description: sanitizeText(`Referenced ${sourceLane} artifact for ${surfaceHint}`),
      exists: true,
      operatorReviewRequired: true,
    });
  }

  refs.sort((a, b) => a.path.localeCompare(b.path));
  return refs;
}

function deriveDisposition(
  refs: readonly PccSurfaceEvidenceBlockArtifactRef[],
  gaps: readonly PccSurfaceEvidenceGapItem[],
): PccSurfaceEvidenceBlockDisposition {
  if (refs.length === 0 && gaps.length > 0) return 'source-missing';
  if (gaps.length > 0) return 'operator-review-pending';
  return 'expert-review-required';
}

export interface AssemblePccSurfaceBlocksInput {
  runId?: string;
  generatedAtIso?: string;
  tenantSiteUrl?: string;
  tenantPageUrl?: string;
  expectedPackageVersion?: string;
  surfaces?: readonly PccLiveSurfaceDefinition[];
  screenshotRun?: unknown;
  breakpointRun?: unknown;
  accessibilityRun?: unknown;
  workflowRun?: unknown;
  conditionalRun?: unknown;
  contentRun?: unknown;
  doctrineSourceRun?: unknown;
  surfaceSmokeRun?: unknown;
  runtimeErrorSummary?: unknown;
  artifactPaths?: readonly string[];
}

function buildBlock(
  input: AssemblePccSurfaceBlocksInput,
  mapItem: (typeof PCC_SURFACE_BLOCK_MAPPING)[number],
): PccSurfaceEvidenceBlock {
  const surfaces = input.surfaces ?? PCC_LIVE_SURFACES;
  const surface = mapItem.surfaceId ? surfaces.find((s) => s.id === mapItem.surfaceId) : undefined;
  const label = surface?.label ?? mapItem.blockId.replace(/-/g, ' ');

  const workflowSurface =
    input.workflowRun && typeof input.workflowRun === 'object'
      ? ((input.workflowRun as { surfaces?: unknown[] }).surfaces ?? []).find(
          (s) =>
            typeof s === 'object' &&
            s !== null &&
            (s as Record<string, unknown>).surfaceId === mapItem.surfaceId,
        )
      : undefined;

  const contentSurface =
    input.contentRun && typeof input.contentRun === 'object'
      ? ((input.contentRun as { surfaces?: unknown[] }).surfaces ?? []).find(
          (s) =>
            typeof s === 'object' &&
            s !== null &&
            (s as Record<string, unknown>).surfaceId === mapItem.surfaceId,
        )
      : undefined;

  const refs = collectArtifactRefs(
    {
      evId: mapItem.evId,
      blockId: mapItem.blockId,
      blockType: mapItem.blockType,
      surfaceId: mapItem.surfaceId,
      primitiveScope: mapItem.primitiveScope,
      label,
      disposition: 'expert-review-required',
      artifactRefs: [],
      screenshotSummary: { referenceCount: 0, hasSurfaceScreenshot: false, notes: [] },
      sourceStateSummary: {
        sourceMarkerCount: 0,
        stateMarkerCount: 0,
        needsReviewCount: 0,
        notes: [],
      },
      cardHierarchySummary: {
        cardCount: 0,
        primaryCardCount: 0,
        referenceCardCount: 0,
        hierarchySignals: [],
        notes: [],
      },
      workflowSummary: {
        actionCount: 0,
        disabledWithoutReasonCount: 0,
        falseAffordanceNeedsReviewCount: 0,
        notes: [],
      },
      accessibilitySummary: {
        axeViolationCount: 0,
        keyboardFocusStopCount: 0,
        ariaNeedsReviewCount: 0,
        contrastNeedsReviewCount: 0,
        notes: [],
      },
      breakpointSummary: {
        viewportCount: 0,
        overflowIssueCount: 0,
        clippedIssueCount: 0,
        touchIssueCount: 0,
        notes: [],
      },
      runtimeSummary: { warningCount: 0, runtimeErrorCount: 0, observed: false, notes: [] },
      contentSummary: { copySignalCount: 0, findingCount: 0, needsReviewCount: 0, notes: [] },
      doctrineSummary: {
        doctrineSignalCount: 0,
        moldBreakerSignalCount: 0,
        expertReviewRequiredCount: 0,
        notes: [],
      },
      pendingGaps: [],
      expertReviewQuestions: [],
    },
    input.artifactPaths ?? [],
  );

  const pendingGaps: PccSurfaceEvidenceGapItem[] = [];
  const requireSource = (sourceLane: PccSurfaceEvidenceGapItem['sourceLane'], present: boolean) => {
    if (!present && pendingGaps.length < MAX_GAPS) {
      pendingGaps.push({
        code: sanitizeText(`missing-${sourceLane}`),
        message: sanitizeText(`Missing ${sourceLane} source for ${label}`),
        sourceLane,
        disposition: 'operator-review-pending',
      });
    }
  };

  requireSource('screenshot', !!input.screenshotRun);
  requireSource('breakpoint', !!input.breakpointRun);
  requireSource('accessibility', !!input.accessibilityRun);
  requireSource('workflow', !!input.workflowRun);
  requireSource('content', !!input.contentRun);
  requireSource('doctrine-source', !!input.doctrineSourceRun);

  const screenshotSummary = {
    referenceCount: refs.filter((r) => r.sourceLane === 'screenshot').length,
    hasSurfaceScreenshot: refs.some((r) => r.sourceLane === 'screenshot'),
    notes: toNotes(
      summarizeFromObject(input.screenshotRun, ['summary.totalSurfaces', 'summary.surfaceCount'], 0)
        ? 'Screenshot lane linked.'
        : 'Screenshot lane not observed.',
    ),
  };

  const sourceStateSummary = {
    sourceMarkerCount: summarizeFromObject(workflowSurface, ['sources.length'], 0),
    stateMarkerCount: summarizeFromObject(workflowSurface, ['states.length'], 0),
    needsReviewCount: summarizeFromObject(workflowSurface, ['warnings.length'], 0),
    notes: toNotes('Source/state summary derived from workflow and conditional lanes.'),
  };

  const cardHierarchySummary = {
    cardCount: summarizeFromObject(
      input.breakpointRun,
      ['summary.totalCards', 'summary.cardCount'],
      0,
    ),
    primaryCardCount: summarizeFromObject(workflowSurface, ['priority.primaryActionCount'], 0),
    referenceCardCount: summarizeFromObject(workflowSurface, ['priority.referenceCardCount'], 0),
    hierarchySignals: toNotes('Card hierarchy and priority evidence aggregated for review.'),
    notes: toNotes('No card-level score computed.'),
  };

  const workflowSummary = {
    actionCount: summarizeFromObject(workflowSurface, ['actions.length'], 0),
    disabledWithoutReasonCount: summarizeFromObject(
      input.workflowRun,
      ['summary.totalDisabledWithoutReason'],
      0,
    ),
    falseAffordanceNeedsReviewCount: summarizeFromObject(
      input.workflowRun,
      ['summary.totalFalseAffordanceNeedsReview'],
      0,
    ),
    notes: toNotes('Workflow/actions summarized as review-support only.'),
  };

  const accessibilitySummary = {
    axeViolationCount: summarizeFromObject(
      input.accessibilityRun,
      ['summary.totalAxeViolationSummaries'],
      0,
    ),
    keyboardFocusStopCount: summarizeFromObject(
      input.accessibilityRun,
      ['summary.totalKeyboardFocusStops'],
      0,
    ),
    ariaNeedsReviewCount: summarizeFromObject(
      input.accessibilityRun,
      ['summary.totalAriaNeedsReview'],
      0,
    ),
    contrastNeedsReviewCount: summarizeFromObject(
      input.accessibilityRun,
      ['summary.totalContrastNeedsReview'],
      0,
    ),
    notes: toNotes('Accessibility lane aggregated without pass/fail.'),
  };

  const breakpointSummary = {
    viewportCount: summarizeFromObject(input.breakpointRun, ['summary.totalViewports'], 0),
    overflowIssueCount: summarizeFromObject(
      input.breakpointRun,
      ['summary.totalOverflowRiskCount'],
      0,
    ),
    clippedIssueCount: summarizeFromObject(input.breakpointRun, ['summary.totalClippedCount'], 0),
    touchIssueCount: summarizeFromObject(
      input.breakpointRun,
      ['summary.totalTouchTargetIssueCount'],
      0,
    ),
    notes: toNotes('Responsive/container evidence aggregated from breakpoint lane.'),
  };

  const runtimeSummary = {
    warningCount:
      summarizeFromObject(input.surfaceSmokeRun, ['warnings.length'], 0) +
      summarizeFromObject(input.runtimeErrorSummary, ['warningCount'], 0),
    runtimeErrorCount: summarizeFromObject(input.runtimeErrorSummary, ['errorCount'], 0),
    observed: !!input.surfaceSmokeRun || !!input.runtimeErrorSummary,
    notes: toNotes('Runtime summary is metadata-only and sanitized.'),
  };

  const contentSummary = {
    copySignalCount: summarizeFromObject(contentSurface, ['visibleCopyCount'], 0),
    findingCount: summarizeFromObject(input.contentRun, ['summary.findingCount'], 0),
    needsReviewCount: summarizeFromObject(input.contentRun, ['summary.needsReviewCount'], 0),
    notes: toNotes('Content/language signals linked for review support.'),
  };

  const doctrineSummary = {
    doctrineSignalCount: summarizeFromObject(
      input.doctrineSourceRun,
      ['summary.doctrineCategoryCount'],
      0,
    ),
    moldBreakerSignalCount: summarizeFromObject(
      input.doctrineSourceRun,
      ['summary.moldBreakerThemeCount'],
      0,
    ),
    expertReviewRequiredCount: summarizeFromObject(
      input.doctrineSourceRun,
      ['summary.expertReviewRequiredCount'],
      0,
    ),
    notes: toNotes('Doctrine/source/Mold Breaker references aggregated for expert review.'),
  };

  const expertReviewQuestions = [
    `Validate ${label} evidence block for completeness and consistency across source lanes.`,
    'Confirm screenshot/card/workflow/accessibility/breakpoint summaries align with operator expectations.',
    'Confirm no implied score, EV captured status, or hard-stop pass/fail claim is present.',
  ]
    .map(sanitizeText)
    .slice(0, MAX_QUESTIONS);

  const disposition = deriveDisposition(refs, pendingGaps);

  return {
    evId: mapItem.evId,
    blockId: mapItem.blockId,
    blockType: mapItem.blockType,
    surfaceId: mapItem.surfaceId,
    primitiveScope: mapItem.primitiveScope,
    label: sanitizeText(label),
    disposition,
    artifactRefs: refs,
    screenshotSummary,
    sourceStateSummary,
    cardHierarchySummary,
    workflowSummary,
    accessibilitySummary,
    breakpointSummary,
    runtimeSummary,
    contentSummary,
    doctrineSummary,
    pendingGaps,
    expertReviewQuestions,
  };
}

export function assemblePccSurfaceEvidenceBlocks(
  input: AssemblePccSurfaceBlocksInput = {},
): PccSurfaceEvidenceBlockRun {
  const blocks = PCC_SURFACE_BLOCK_MAPPING.map((item) => buildBlock(input, item));

  const primitiveBlock = blocks.find((b) => b.blockId === 'shared-primitive-system-block');
  const crossBlock = blocks.find((b) => b.blockId === 'cross-surface-evidence-index-block');

  const primitiveSummary: PccPrimitiveEvidenceBlockSummary = {
    sharedPrimitiveSignalCount:
      asNum(primitiveBlock?.workflowSummary.actionCount) +
      asNum(primitiveBlock?.cardHierarchySummary.cardCount),
    accessibilityPrimitiveSignalCount: asNum(
      primitiveBlock?.accessibilitySummary.axeViolationCount,
    ),
    responsivePrimitiveSignalCount:
      asNum(primitiveBlock?.breakpointSummary.viewportCount) +
      asNum(primitiveBlock?.breakpointSummary.overflowIssueCount),
    cardDistributionSignalCount:
      asNum(primitiveBlock?.cardHierarchySummary.primaryCardCount) +
      asNum(primitiveBlock?.cardHierarchySummary.referenceCardCount),
  };

  const presentLanes = new Set<string>();
  for (const block of blocks) {
    for (const ref of block.artifactRefs) presentLanes.add(ref.sourceLane);
  }

  const crossSurfaceSummary: PccCrossSurfaceEvidenceIndexSummary = {
    surfaceBlockCount: blocks.filter((b) => b.blockType === 'surface').length,
    presentSourceLaneCount: presentLanes.size,
    missingSourceLaneCount: Math.max(0, 9 - presentLanes.size),
    totalPendingGaps: blocks.reduce((sum, block) => sum + block.pendingGaps.length, 0),
  };

  const summary = {
    evidenceSourcePresence: {
      screenshot: !!input.screenshotRun,
      breakpoint: !!input.breakpointRun,
      accessibility: !!input.accessibilityRun,
      workflow: !!input.workflowRun,
      conditional: !!input.conditionalRun,
      content: !!input.contentRun,
      'doctrine-source': !!input.doctrineSourceRun,
      'surface-smoke': !!input.surfaceSmokeRun,
      runtime: !!input.runtimeErrorSummary,
    },
    totalArtifactRefs: blocks.reduce((sum, block) => sum + block.artifactRefs.length, 0),
    totalPendingGaps: blocks.reduce((sum, block) => sum + block.pendingGaps.length, 0),
    totalExpertReviewQuestions: blocks.reduce(
      (sum, block) => sum + block.expertReviewQuestions.length,
      0,
    ),
  };

  return {
    runId: sanitizeText(input.runId ?? `surface-blocks-${Date.now()}`),
    generatedAtIso: input.generatedAtIso ?? new Date().toISOString(),
    tenantSiteUrl: sanitizeText(
      input.tenantSiteUrl ??
        'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
    ),
    tenantPageUrl: sanitizeText(input.tenantPageUrl ?? 'operator-review-pending'),
    expectedPackageVersion: sanitizeText(input.expectedPackageVersion ?? 'operator-review-pending'),
    evRefs: [...PCC_SURFACE_BLOCK_EVIDENCE_IDS] as readonly PccSurfaceBlockEvidenceId[],
    blocks,
    summary,
    primitiveSummary,
    crossSurfaceSummary,
    warnings: [],
    disclaimer: PCC_SURFACE_BLOCKS_DISCLAIMER,
  };
}
