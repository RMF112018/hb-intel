import type { Locator, Page } from '@playwright/test';

export type PccTouchTargetMeasurementLane = 'breakpoint' | 'accessibility';

export type PccTouchTargetZeroMeasureReason =
  | 'root-not-found'
  | 'no-candidates-in-root'
  | 'all-candidates-hidden'
  | 'all-candidates-disabled-or-excluded'
  | 'measurement-error';

export interface PccTouchTargetScopeDiagnostics {
  rootSelector: string;
  rootFound: boolean;
  fallbackUsed: boolean;
  candidateCount: number;
  measuredCount: number;
  hiddenFilteredCount: number;
  disabledCount: number;
  disabledFilteredCount: number;
  thresholdPx: number;
  measurementLane: PccTouchTargetMeasurementLane;
  zeroMeasureReason?: PccTouchTargetZeroMeasureReason;
}

export interface PccSharedTouchTargetMeasurement {
  selector: string;
  role?: string;
  tagName: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  visible: boolean;
  disabled: boolean;
  belowRecommendedSize: boolean;
  thresholdPx: number;
  measurementLane: PccTouchTargetMeasurementLane;
}

const INTERACTIVE_SELECTOR =
  'button, a[href], [role="button"], [role="tab"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookies?|tokens?|auth|sessions?|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noHtml = noCred.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

async function resolveRoot(
  page: Page,
  primaryRootSelector: string,
  fallbackRootSelector: string | undefined,
): Promise<{
  root: Locator | null;
  rootFound: boolean;
  fallbackUsed: boolean;
  rootSelector: string;
}> {
  const primary = page.locator(primaryRootSelector).first();
  if ((await primary.count()) > 0) {
    return {
      root: primary,
      rootFound: true,
      fallbackUsed: false,
      rootSelector: primaryRootSelector,
    };
  }
  if (!fallbackRootSelector) {
    return { root: null, rootFound: false, fallbackUsed: false, rootSelector: primaryRootSelector };
  }
  const fallback = page.locator(fallbackRootSelector).first();
  if ((await fallback.count()) > 0) {
    return {
      root: fallback,
      rootFound: true,
      fallbackUsed: true,
      rootSelector: fallbackRootSelector,
    };
  }
  return { root: null, rootFound: false, fallbackUsed: true, rootSelector: fallbackRootSelector };
}

export interface MeasureTouchTargetsInput {
  page: Page;
  primaryRootSelector: string;
  fallbackRootSelector?: string;
  thresholdPx: number;
  measurementLane: PccTouchTargetMeasurementLane;
  cap: number;
  excludeDisabled: boolean;
}

export interface MeasureTouchTargetsResult {
  rows: PccSharedTouchTargetMeasurement[];
  diagnostics: PccTouchTargetScopeDiagnostics;
}

export async function measureTouchTargets(
  input: MeasureTouchTargetsInput,
): Promise<MeasureTouchTargetsResult> {
  const rootInfo = await resolveRoot(
    input.page,
    input.primaryRootSelector,
    input.fallbackRootSelector,
  );
  if (!rootInfo.root) {
    return {
      rows: [],
      diagnostics: {
        rootSelector: rootInfo.rootSelector,
        rootFound: false,
        fallbackUsed: rootInfo.fallbackUsed,
        candidateCount: 0,
        measuredCount: 0,
        hiddenFilteredCount: 0,
        disabledCount: 0,
        disabledFilteredCount: 0,
        thresholdPx: input.thresholdPx,
        measurementLane: input.measurementLane,
        zeroMeasureReason: 'root-not-found',
      },
    };
  }

  const nodes = rootInfo.root.locator(INTERACTIVE_SELECTOR);
  const candidateCount = Math.min(await nodes.count(), input.cap);
  if (candidateCount === 0) {
    return {
      rows: [],
      diagnostics: {
        rootSelector: rootInfo.rootSelector,
        rootFound: true,
        fallbackUsed: rootInfo.fallbackUsed,
        candidateCount,
        measuredCount: 0,
        hiddenFilteredCount: 0,
        disabledCount: 0,
        disabledFilteredCount: 0,
        thresholdPx: input.thresholdPx,
        measurementLane: input.measurementLane,
        zeroMeasureReason: 'no-candidates-in-root',
      },
    };
  }

  const rows: PccSharedTouchTargetMeasurement[] = [];
  let hiddenFilteredCount = 0;
  let disabledCount = 0;
  let disabledFilteredCount = 0;
  let measurementErrorCount = 0;

  for (let i = 0; i < candidateCount; i += 1) {
    const value = await nodes
      .nth(i)
      .evaluate(
        (node, payload) => {
          const el = node as HTMLElement;
          const visible = Boolean(el.offsetParent);
          const disabled =
            (el as HTMLInputElement).disabled ||
            el.hasAttribute('disabled') ||
            el.getAttribute('aria-disabled') === 'true';
          if (!visible) return { hidden: true };
          if (payload.excludeDisabled && disabled) return { disabledOnly: true };
          const rect = el.getBoundingClientRect();
          return {
            selector: `${el.tagName.toLowerCase()}:nth-of-type(${payload.index + 1})`,
            role: el.getAttribute('role') ?? undefined,
            tagName: el.tagName.toLowerCase(),
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
            disabled,
            visible,
          };
        },
        { index: i, excludeDisabled: input.excludeDisabled },
      )
      .catch(() => null);

    if (!value) {
      measurementErrorCount += 1;
      continue;
    }
    if ('hidden' in value) {
      hiddenFilteredCount += 1;
      continue;
    }
    if ('disabledOnly' in value) {
      disabledCount += 1;
      disabledFilteredCount += 1;
      continue;
    }
    if (value.disabled) disabledCount += 1;
    rows.push({
      selector: sanitizeText(value.selector),
      role: value.role ? sanitizeText(value.role) : undefined,
      tagName: sanitizeText(value.tagName),
      width: value.width,
      height: value.height,
      x: value.x,
      y: value.y,
      visible: value.visible,
      disabled: value.disabled,
      belowRecommendedSize: value.width < input.thresholdPx || value.height < input.thresholdPx,
      thresholdPx: input.thresholdPx,
      measurementLane: input.measurementLane,
    });
  }

  let zeroMeasureReason: PccTouchTargetZeroMeasureReason | undefined;
  if (rows.length === 0) {
    if (hiddenFilteredCount > 0) {
      zeroMeasureReason = 'all-candidates-hidden';
    } else if (disabledFilteredCount > 0) {
      zeroMeasureReason = 'all-candidates-disabled-or-excluded';
    } else if (measurementErrorCount > 0) {
      zeroMeasureReason = 'measurement-error';
    } else {
      zeroMeasureReason = 'no-candidates-in-root';
    }
  }

  return {
    rows,
    diagnostics: {
      rootSelector: rootInfo.rootSelector,
      rootFound: true,
      fallbackUsed: rootInfo.fallbackUsed,
      candidateCount,
      measuredCount: rows.length,
      hiddenFilteredCount,
      disabledCount,
      disabledFilteredCount,
      thresholdPx: input.thresholdPx,
      measurementLane: input.measurementLane,
      zeroMeasureReason,
    },
  };
}

export function aggregateTouchTargetDiagnostics(
  diagnostics: readonly PccTouchTargetScopeDiagnostics[],
): {
  candidateCount: number;
  measuredCount: number;
  hiddenFilteredCount: number;
  disabledCount: number;
  disabledFilteredCount: number;
  fallbackUsedCount: number;
  zeroMeasureReasonCounts: Record<PccTouchTargetZeroMeasureReason, number>;
} {
  const summary = {
    candidateCount: 0,
    measuredCount: 0,
    hiddenFilteredCount: 0,
    disabledCount: 0,
    disabledFilteredCount: 0,
    fallbackUsedCount: 0,
    zeroMeasureReasonCounts: {
      'root-not-found': 0,
      'no-candidates-in-root': 0,
      'all-candidates-hidden': 0,
      'all-candidates-disabled-or-excluded': 0,
      'measurement-error': 0,
    } as Record<PccTouchTargetZeroMeasureReason, number>,
  };

  for (const row of diagnostics) {
    summary.candidateCount += row.candidateCount;
    summary.measuredCount += row.measuredCount;
    summary.hiddenFilteredCount += row.hiddenFilteredCount;
    summary.disabledCount += row.disabledCount;
    summary.disabledFilteredCount += row.disabledFilteredCount;
    if (row.fallbackUsed) summary.fallbackUsedCount += 1;
    if (row.zeroMeasureReason) summary.zeroMeasureReasonCounts[row.zeroMeasureReason] += 1;
  }

  return summary;
}
