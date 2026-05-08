import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { PccLivePageObject } from './pcc-live.page-object';
import { measureTouchTargets } from './pcc-live.touch-targets';
import type {
  PccAccessibilitySurfaceEvidence,
  PccAriaLabelObservation,
  PccA11yTouchTargetObservation,
  PccAxeViolationSummary,
  PccContrastObservation,
  PccDialogFocusObservation,
  PccHoverOnlyObservation,
  PccKeyboardFocusObservation,
  PccReducedMotionObservation,
} from './pcc-live.accessibility.types';
import type { PccLiveSurfaceDefinition } from './pcc-live.surfaces';

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noHtml = noCred.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function sanitizeSelector(input: string): string {
  return sanitizeText(input.replace(/\s+/g, ' ').trim());
}

function cssPath(node: Element): string {
  const parts: string[] = [];
  let current: Element | null = node;
  while (current && parts.length < 4) {
    const name = current.tagName.toLowerCase();
    const role = current.getAttribute('role');
    const id = current.id ? `#${current.id}` : '';
    parts.unshift(`${name}${id}${role ? `[role="${role}"]` : ''}`);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

export function summarizeAxeViolations(
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  violations: Array<{
    id: string;
    impact?: string | null;
    help?: string;
    helpUrl?: string;
    tags?: string[];
    nodes?: Array<{
      target?: string[];
      html?: string;
      failureSummary?: string;
      any?: unknown[];
      all?: unknown[];
      none?: unknown[];
    }>;
  }>,
): PccAxeViolationSummary[] {
  return violations.map((violation) => {
    const sanitizedTargets = (violation.nodes ?? [])
      .flatMap((node) => node.target ?? [])
      .slice(0, 10)
      .map((target) => sanitizeSelector(target));

    return {
      surfaceId,
      ruleId: sanitizeText(violation.id),
      impact: violation.impact ? sanitizeText(violation.impact) : undefined,
      count: (violation.nodes ?? []).length,
      help: violation.help ? sanitizeText(violation.help) : undefined,
      helpUrl: violation.helpUrl ? sanitizeText(violation.helpUrl) : undefined,
      tags: (violation.tags ?? []).map((tag) => sanitizeText(tag)).slice(0, 10),
      sanitizedTargets,
    };
  });
}

export async function collectKeyboardFocusObservations(
  page: Page,
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  maxSteps: number,
): Promise<PccKeyboardFocusObservation[]> {
  const items: PccKeyboardFocusObservation[] = [];

  for (let i = 0; i < maxSteps; i += 1) {
    await page.keyboard.press('Tab');
    const entry = await page.evaluate((step) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body) return null;
      const rect = active.getBoundingClientRect();
      const style = window.getComputedStyle(active);
      const hasName =
        Boolean(active.getAttribute('aria-label')) ||
        Boolean(active.getAttribute('aria-labelledby')) ||
        Boolean(active.getAttribute('title')) ||
        Boolean(active.textContent?.trim());
      const outlineW = Number.parseFloat(style.outlineWidth || '0') || 0;
      const borderW = Number.parseFloat(style.borderWidth || '0') || 0;
      const hasFocus =
        outlineW > 0 || style.outlineStyle !== 'none' || style.boxShadow !== 'none' || borderW > 1;
      return {
        focusStep: step + 1,
        role: active.getAttribute('role') ?? undefined,
        tagName: active.tagName.toLowerCase(),
        selector: cssPath(active),
        hasAccessibleName: hasName,
        hasVisibleFocusIndicator: hasFocus,
        boundingWidth: rect.width,
        boundingHeight: rect.height,
      };

      function cssPath(node: Element): string {
        const parts: string[] = [];
        let current: Element | null = node;
        while (current && parts.length < 4) {
          const name = current.tagName.toLowerCase();
          const role = current.getAttribute('role');
          const id = current.id ? `#${current.id}` : '';
          parts.unshift(`${name}${id}${role ? `[role="${role}"]` : ''}`);
          current = current.parentElement;
        }
        return parts.join(' > ');
      }
    }, i);

    if (!entry) continue;

    items.push({
      surfaceId,
      ...entry,
      selector: sanitizeSelector(entry.selector),
    });
  }

  await page.keyboard.press('Escape');
  return items;
}

export async function collectAriaLabelObservations(
  page: Page,
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  rootSelector: string,
  cap: number,
): Promise<PccAriaLabelObservation[]> {
  const INTERACTIVE_SELECTOR =
    'button, a[href], [role="button"], [role="tab"], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const nodes = page.locator(`${rootSelector} ${INTERACTIVE_SELECTOR}`);
  const count = Math.min(await nodes.count(), cap);
  const items: PccAriaLabelObservation[] = [];

  for (let i = 0; i < count; i += 1) {
    const value = await nodes.nth(i).evaluate((node, idx) => {
      const el = node as HTMLElement;
      if (!el.offsetParent) return null;
      const ariaLabel = el.getAttribute('aria-label') ?? undefined;
      const ariaLabelledBy = el.getAttribute('aria-labelledby') ?? undefined;
      const ariaDescribedBy = el.getAttribute('aria-describedby') ?? undefined;
      const title = el.getAttribute('title');
      const hasName =
        Boolean(ariaLabel) ||
        Boolean(ariaLabelledBy) ||
        Boolean(title) ||
        Boolean(el.textContent?.trim()) ||
        (el instanceof HTMLImageElement && Boolean(el.alt));
      const disabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
      const disabledReasonPresent =
        Boolean(ariaDescribedBy) ||
        Boolean(el.getAttribute('data-pcc-disabled-reason')) ||
        Boolean(title);
      return {
        selector: cssPath(el, idx),
        tagName: el.tagName.toLowerCase(),
        role: el.getAttribute('role') ?? undefined,
        ariaLabel,
        ariaLabelledBy,
        ariaDescribedBy,
        accessibleNamePresent: hasName,
        disabled,
        disabledReasonPresent,
        needsReview: !hasName || (disabled && !disabledReasonPresent),
      };

      function cssPath(nodeEl: Element, index: number): string {
        const role = nodeEl.getAttribute('role');
        const id = nodeEl.id ? `#${nodeEl.id}` : '';
        return `${nodeEl.tagName.toLowerCase()}${id}${role ? `[role="${role}"]` : ''}:nth-of-type(${index + 1})`;
      }
    }, i);

    if (!value) continue;
    items.push({
      surfaceId,
      ...value,
      selector: sanitizeSelector(value.selector),
      ariaLabel: value.ariaLabel ? sanitizeText(value.ariaLabel) : undefined,
      ariaLabelledBy: value.ariaLabelledBy ? sanitizeText(value.ariaLabelledBy) : undefined,
      ariaDescribedBy: value.ariaDescribedBy ? sanitizeText(value.ariaDescribedBy) : undefined,
    });
  }

  return items;
}

export async function collectTouchTargetObservations(
  page: Page,
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  rootSelector: string,
  cap: number,
): Promise<{
  touchTargets: PccA11yTouchTargetObservation[];
  diagnostics: PccAccessibilitySurfaceEvidence['touchTargetScopeDiagnostics'];
}> {
  const measured = await measureTouchTargets({
    page,
    primaryRootSelector: rootSelector,
    thresholdPx: 44,
    measurementLane: 'accessibility',
    cap,
    excludeDisabled: false,
  });

  return {
    touchTargets: measured.rows.map((row) => ({
      surfaceId,
      selector: sanitizeSelector(row.selector),
      role: row.role ? sanitizeText(row.role) : undefined,
      tagName: sanitizeText(row.tagName),
      width: row.width,
      height: row.height,
      thresholdPx: row.thresholdPx,
      measurementLane: 'accessibility',
      disabled: row.disabled,
      visible: row.visible,
      x: row.x,
      y: row.y,
      belowRecommendedSize: row.belowRecommendedSize,
    })),
    diagnostics: measured.diagnostics,
  };
}

async function collectReducedMotionObservation(
  page: Page,
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  rootSelector: string,
): Promise<PccReducedMotionObservation> {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const risk = await page.evaluate((selector) => {
    const root = document.querySelector(selector) ?? document.body;
    const elements = Array.from(root.querySelectorAll('*')) as HTMLElement[];
    let animationRiskCount = 0;
    let transitionRiskCount = 0;
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      if (style.animationName && style.animationName !== 'none') animationRiskCount += 1;
      const duration = style.transitionDuration || '0s';
      const hasTransition = duration
        .split(',')
        .map((part) => Number.parseFloat(part) || 0)
        .some((value) => value > 0);
      if (hasTransition) transitionRiskCount += 1;
    }
    return { animationRiskCount, transitionRiskCount };
  }, rootSelector);

  return {
    surfaceId,
    reducedMotionEmulated: true,
    animationRiskCount: risk.animationRiskCount,
    transitionRiskCount: risk.transitionRiskCount,
    needsReview: risk.animationRiskCount > 0 || risk.transitionRiskCount > 0,
  };
}

async function collectHoverOnlyObservation(
  page: Page,
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  rootSelector: string,
): Promise<PccHoverOnlyObservation> {
  const value = await page.evaluate((selector) => {
    const root = document.querySelector(selector) ?? document.body;
    const hoverSelectors = ['[data-hover-only]', '[class*="hover"]', '[data-pcc-hover-only]'];
    const matched: string[] = [];
    for (const hoverSelector of hoverSelectors) {
      for (const node of Array.from(root.querySelectorAll(hoverSelector)).slice(0, 8)) {
        matched.push(node.tagName.toLowerCase());
      }
    }
    return { hoverOnlyRiskCount: matched.length, selectors: matched };
  }, rootSelector);

  return {
    surfaceId,
    hoverOnlyRiskCount: value.hoverOnlyRiskCount,
    selectors: value.selectors.map((selector) => sanitizeSelector(selector)),
    needsReview: true,
  };
}

async function collectDialogFocusObservation(
  page: Page,
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  rootSelector: string,
): Promise<PccDialogFocusObservation> {
  const value = await page.evaluate((selector) => {
    const root = document.querySelector(selector) ?? document.body;
    const dialogs = Array.from(
      root.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], [data-pcc-drawer], [data-pcc-modal]',
      ),
    );
    const visible = dialogs.filter((el) => (el as HTMLElement).offsetParent !== null);
    const modalCount = visible.filter((el) => el.getAttribute('aria-modal') === 'true').length;
    return {
      dialogCount: visible.length,
      modalCount,
      hasDialog: visible.length > 0,
    };
  }, rootSelector);

  if (!value.hasDialog) {
    return {
      surfaceId,
      status: 'not-observed',
      dialogCount: 0,
      modalCount: 0,
      notes: ['No visible dialog/drawer observed in this surface.'],
    };
  }

  return {
    surfaceId,
    status: 'needs-review',
    dialogCount: value.dialogCount,
    modalCount: value.modalCount,
    focusTrapObserved: undefined,
    notes: ['Dialog/drawer observed; focus trap requires operator review.'],
  };
}

async function collectContrastObservation(
  surfaceId: PccAccessibilitySurfaceEvidence['surfaceId'],
  axeViolations: PccAxeViolationSummary[],
): Promise<PccContrastObservation[]> {
  const axeContrastCount = axeViolations
    .filter((item) => item.ruleId === 'color-contrast')
    .reduce((sum, item) => sum + item.count, 0);

  return [
    {
      surfaceId,
      ruleId: 'color-contrast',
      count: axeContrastCount,
      needsReview: axeContrastCount > 0,
      details: sanitizeText('Axe color-contrast summary. Operator review required.'),
    },
    {
      surfaceId,
      ruleId: 'computed-contrast-heuristic',
      count: 0,
      needsReview: true,
      details: sanitizeText('Computed contrast heuristic is informational only.'),
    },
  ];
}

export interface CapturePccAccessibilityInput {
  page: Page;
  pageObject: PccLivePageObject;
  pageUrl: string;
  surfaces: readonly PccLiveSurfaceDefinition[];
  maxFocusStopsPerSurface?: number;
  maxAriaElementsPerSurface?: number;
  maxTouchTargetsPerSurface?: number;
  axeEnabled?: boolean;
}

export interface CapturePccAccessibilityResult {
  surfaces: PccAccessibilitySurfaceEvidence[];
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

export async function capturePccAccessibility(
  input: CapturePccAccessibilityInput,
): Promise<CapturePccAccessibilityResult> {
  const maxFocus = input.maxFocusStopsPerSurface ?? 40;
  const maxAria = input.maxAriaElementsPerSurface ?? 120;
  const maxTouchTargets = input.maxTouchTargetsPerSurface ?? 120;
  const axeEnabled = input.axeEnabled ?? true;

  const surfaces: PccAccessibilitySurfaceEvidence[] = [];

  await input.pageObject.goto(input.pageUrl);
  await input.pageObject.waitForPccRoot();

  for (const surface of input.surfaces) {
    const warnings: string[] = [];
    const smoke = await input.pageObject.assertSurfaceActive(surface);
    if (!smoke.passed && smoke.warning) warnings.push(sanitizeText(smoke.warning));

    const activeSelector = `[data-pcc-active-surface-panel="${surface.id}"]`;
    const activeCount = await input.page.locator(activeSelector).count();
    const rootSelector = activeCount > 0 ? activeSelector : 'body';

    let axeViolations: PccAxeViolationSummary[] = [];
    if (axeEnabled) {
      try {
        const builder = new AxeBuilder({ page: input.page });
        if (activeCount > 0) builder.include(activeSelector);
        const result = await builder.analyze();
        axeViolations = summarizeAxeViolations(surface.id, result.violations as never);
      } catch (error) {
        warnings.push(sanitizeText(`Axe analysis failed: ${String(error)}`));
      }
    }

    const keyboardFocus = await collectKeyboardFocusObservations(input.page, surface.id, maxFocus);
    const ariaLabels = await collectAriaLabelObservations(
      input.page,
      surface.id,
      rootSelector,
      maxAria,
    );
    const touchTargetResult = await collectTouchTargetObservations(
      input.page,
      surface.id,
      rootSelector,
      maxTouchTargets,
    );
    const touchTargets = touchTargetResult.touchTargets;
    const contrast = await collectContrastObservation(surface.id, axeViolations);
    const reducedMotion = await collectReducedMotionObservation(
      input.page,
      surface.id,
      rootSelector,
    );
    const hoverOnly = await collectHoverOnlyObservation(input.page, surface.id, rootSelector);
    const dialogFocus = await collectDialogFocusObservation(input.page, surface.id, rootSelector);

    surfaces.push({
      surfaceId: surface.id,
      label: surface.label,
      axeViolations,
      keyboardFocus,
      ariaLabels,
      contrast,
      reducedMotion,
      hoverOnly,
      dialogFocus,
      touchTargets,
      touchTargetScopeDiagnostics: touchTargetResult.diagnostics,
      warnings,
    });
  }

  return {
    surfaces,
    surfaceCount: surfaces.length,
    axeViolationSummaryCount: surfaces.reduce((sum, s) => sum + s.axeViolations.length, 0),
    keyboardFocusStopCount: surfaces.reduce((sum, s) => sum + s.keyboardFocus.length, 0),
    ariaNeedsReviewCount: surfaces.reduce(
      (sum, s) => sum + s.ariaLabels.filter((item) => item.needsReview).length,
      0,
    ),
    contrastNeedsReviewCount: surfaces.reduce(
      (sum, s) => sum + s.contrast.filter((item) => item.needsReview).length,
      0,
    ),
    reducedMotionRiskCount: surfaces.reduce(
      (sum, s) => sum + s.reducedMotion.animationRiskCount + s.reducedMotion.transitionRiskCount,
      0,
    ),
    hoverOnlyRiskCount: surfaces.reduce((sum, s) => sum + s.hoverOnly.hoverOnlyRiskCount, 0),
    touchTargetIssueCount: surfaces.reduce(
      (sum, s) => sum + s.touchTargets.filter((item) => item.belowRecommendedSize).length,
      0,
    ),
    dialogModalObservationCount: surfaces.reduce(
      (sum, s) => sum + (s.dialogFocus.status === 'not-observed' ? 0 : s.dialogFocus.dialogCount),
      0,
    ),
    warningCount: surfaces.reduce((sum, s) => sum + s.warnings.length, 0),
  };
}

export {
  sanitizeText as sanitizeA11yText,
  sanitizeSelector as sanitizeA11ySelector,
  cssPath as buildA11yCssPath,
};
