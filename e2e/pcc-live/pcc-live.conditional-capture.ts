import fs from 'node:fs';
import type { Browser, Page } from '@playwright/test';
import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLiveEnv } from './pcc-live.env';
import type { PccLivePageObject } from './pcc-live.page-object';
import type { PccLiveSurfaceDefinition, PccLiveSurfaceId } from './pcc-live.surfaces';
import { sanitizePccLiveText } from './pcc-live.sanitization';
import {
  PCC_CONDITIONAL_CORE_EVIDENCE_IDS,
  PCC_CONDITIONAL_EVIDENCE_IDS,
  type PccConditionalAuthObservation,
  type PccConditionalFocusObservation,
  type PccConditionalLaneId,
  type PccConditionalLaneStatus,
  type PccConditionalLayoutObservation,
  type PccConditionalSetupStatus,
  type PccConditionalStateObservation,
} from './pcc-live.conditional.types';

const ACTION_SELECTOR =
  'button, a[href], [role="button"], [role="link"], [data-pcc-action], [data-pcc-command], [data-pcc-launch], [data-pcc-external-system]';

const LANE_EV_REFS: Record<PccConditionalLaneId, readonly PccEvidenceId[]> = {
  'edit-mode': ['EV-57', 'EV-94', 'EV-96', 'EV-102'],
  'high-zoom': ['EV-67', 'EV-68'],
  'short-height': ['EV-67', 'EV-68'],
  'drawer-modal': ['EV-82'],
  unauthorized: ['EV-96', 'EV-102'],
  'special-state': [...PCC_CONDITIONAL_CORE_EVIDENCE_IDS],
};

function sanitizeText(input: string): string {
  return sanitizePccLiveText(input, { maxLength: 240, redactPolicyClaims: true });
}

function sanitizeSnippet(input: string, max = 120): string {
  return sanitizeText(input.replace(/\s+/g, ' ').trim()).slice(0, max);
}

function sameTenantHttpsUrl(
  target: string,
  siteUrl: string,
): { ok: true } | { ok: false; reason: string } {
  try {
    const targetUrl = new URL(target);
    const tenantUrl = new URL(siteUrl);
    if (targetUrl.protocol !== 'https:') {
      return { ok: false, reason: 'URL must be HTTPS for conditional lane.' };
    }
    if (targetUrl.hostname !== tenantUrl.hostname) {
      return { ok: false, reason: 'URL host mismatch from configured tenant host.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'URL parsing failed for conditional lane target.' };
  }
}

function containsMutationKeyword(input: string): boolean {
  return /approve|reject|submit|save|delete|create|edit|update|upload|sync|send|sign|award|assign|provision|commit|certify/i.test(
    input,
  );
}

function hasDisabledReason(el: Element): boolean {
  return Boolean(
    el.getAttribute('aria-describedby') ||
    el.getAttribute('data-pcc-disabled-reason') ||
    el.getAttribute('title'),
  );
}

function setupStatus(
  laneId: PccConditionalLaneId,
  status: PccConditionalLaneStatus,
  configured: boolean,
  attempted: boolean,
  reason: string,
): PccConditionalSetupStatus {
  return {
    laneId,
    status,
    configured,
    attempted,
    reason: sanitizeSnippet(reason, 180),
    evRefs: LANE_EV_REFS[laneId],
  };
}

function countStateSignals(
  text: string,
): Pick<PccConditionalStateObservation, 'hasImpact' | 'hasOwner' | 'hasNextStep'> {
  return {
    hasImpact:
      /impact|blocked|degraded|unavailable|error|stale|unauthorized|read-only|preview|deferred/i.test(
        text,
      ),
    hasOwner: /owner|responsible|assignee|role|trade|vendor|ball in court/i.test(text),
    hasNextStep: /next action|due|follow up|retry|contact|resolve/i.test(text),
  };
}

async function collectStateObservations(
  page: Page,
  laneId: PccConditionalLaneId,
  rootSelector: string,
  surfaceId?: PccLiveSurfaceId,
): Promise<PccConditionalStateObservation[]> {
  const stateKinds: Array<PccConditionalStateObservation['stateKind']> = [
    'edit-mode',
    'read-only',
    'preview',
    'deferred',
    'unavailable',
    'unauthorized',
    'stale',
    'missing-config',
    'blocked',
    'degraded',
    'drawer',
    'modal',
    'dialog',
    'mock-demo',
    'source-owned',
  ];

  const raw = await page
    .locator(rootSelector)
    .first()
    .evaluate((node) => {
      const el = node as HTMLElement;
      return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
  const markerCounts = await page.evaluate(() => ({
    drawer: document.querySelectorAll('[data-pcc-drawer]').length,
    modal: document.querySelectorAll('[data-pcc-modal],[aria-modal="true"]').length,
    dialog: document.querySelectorAll('[role="dialog"],[data-pcc-dialog]').length,
  }));

  const normalized = raw.toLowerCase();
  const baseSignals = countStateSignals(normalized);

  return stateKinds.map((stateKind) => {
    const observed =
      stateKind === 'edit-mode'
        ? /edit mode|editing|edit page/.test(normalized)
        : stateKind === 'read-only'
          ? /read-only|readonly/.test(normalized)
          : stateKind === 'preview'
            ? /preview/.test(normalized)
            : stateKind === 'deferred'
              ? /deferred/.test(normalized)
              : stateKind === 'unavailable'
                ? /unavailable/.test(normalized)
                : stateKind === 'unauthorized'
                  ? /unauthorized|access denied|forbidden|permission denied|sign in/.test(
                      normalized,
                    )
                  : stateKind === 'stale'
                    ? /stale|out of date/.test(normalized)
                    : stateKind === 'missing-config'
                      ? /missing config|missing configuration|not configured/.test(normalized)
                      : stateKind === 'blocked'
                        ? /blocked/.test(normalized)
                        : stateKind === 'degraded'
                          ? /degraded/.test(normalized)
                          : stateKind === 'drawer'
                            ? /drawer/.test(normalized) || markerCounts.drawer > 0
                            : stateKind === 'modal'
                              ? /modal/.test(normalized) || markerCounts.modal > 0
                              : stateKind === 'dialog'
                                ? /dialog/.test(normalized) || markerCounts.dialog > 0
                                : stateKind === 'mock-demo'
                                  ? /mock|demo|fixture|stub/.test(normalized)
                                  : /source of record|system of record|read model|source owned|source-owned/.test(
                                      normalized,
                                    );

    return {
      laneId,
      surfaceId,
      stateKind,
      observed,
      selector: observed ? sanitizeSnippet(rootSelector, 120) : undefined,
      snippet: observed ? sanitizeSnippet(raw, 120) : undefined,
      hasImpact: baseSignals.hasImpact,
      hasOwner: baseSignals.hasOwner,
      hasNextStep: baseSignals.hasNextStep,
      needsReview: observed,
    };
  });
}

async function collectLayoutObservation(
  page: Page,
  laneId: PccConditionalLaneId,
  viewportWidth: number,
  viewportHeight: number,
  zoomOrScaleLabel: string,
  surfaceId?: PccLiveSurfaceId,
): Promise<PccConditionalLayoutObservation> {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const cards = Array.from(document.querySelectorAll('[data-pcc-card]')) as HTMLElement[];
    const clippedElementCount = cards.filter(
      (card) =>
        card.scrollWidth > card.clientWidth + 1 || card.scrollHeight > card.clientHeight + 1,
    ).length;
    const primaryActionVisible =
      Array.from(
        document.querySelectorAll(
          'button,[role="button"],a[href],[data-pcc-action],[data-pcc-command],[data-pcc-launch]',
        ),
      ).findIndex((node) => (node as HTMLElement).offsetParent !== null) >= 0;
    const activePanelVisible =
      Array.from(document.querySelectorAll('[data-pcc-active-surface-panel]')).findIndex(
        (node) => (node as HTMLElement).offsetParent !== null,
      ) >= 0;

    return {
      horizontalOverflowDetected: doc.scrollWidth > doc.clientWidth + 1,
      clippedElementCount,
      primaryActionVisible,
      activePanelVisible,
    };
  });

  return {
    laneId,
    surfaceId,
    viewportWidth,
    viewportHeight,
    zoomOrScaleLabel: sanitizeSnippet(zoomOrScaleLabel, 80),
    horizontalOverflowDetected: metrics.horizontalOverflowDetected,
    clippedElementCount: metrics.clippedElementCount,
    primaryActionVisible: metrics.primaryActionVisible,
    activePanelVisible: metrics.activePanelVisible,
    needsReview:
      metrics.horizontalOverflowDetected ||
      metrics.clippedElementCount > 0 ||
      !metrics.primaryActionVisible ||
      !metrics.activePanelVisible,
  };
}

async function collectDrawerFocusObservation(
  page: Page,
  laneId: PccConditionalLaneId,
  surfaceId?: PccLiveSurfaceId,
): Promise<PccConditionalFocusObservation> {
  const counts = await page.evaluate(() => {
    const dialogs = document.querySelectorAll('[role="dialog"],[data-pcc-dialog]').length;
    const modals = document.querySelectorAll('[aria-modal="true"],[data-pcc-modal]').length;
    const drawers = document.querySelectorAll('[data-pcc-drawer]').length;
    const focusable = document.querySelectorAll(
      'button,a[href],[role="button"],[role="tab"],input,select,textarea,[tabindex]:not([tabindex="-1"])',
    ).length;
    return { dialogs, modals, drawers, focusable };
  });

  const focusRiskCount =
    counts.focusable === 0 && counts.dialogs + counts.modals + counts.drawers > 0 ? 1 : 0;
  const status: PccConditionalLaneStatus =
    counts.dialogs + counts.modals + counts.drawers > 0 ? 'needs-review' : 'operator-pending';

  return {
    laneId,
    surfaceId,
    dialogCount: counts.dialogs,
    modalCount: counts.modals,
    drawerCount: counts.drawers,
    focusableCount: counts.focusable,
    focusRiskCount,
    status,
    notes: [
      sanitizeSnippet(
        counts.dialogs + counts.modals + counts.drawers > 0
          ? 'Dialog/modal/drawer observed; focus behavior requires operator review.'
          : 'No dialog/modal/drawer observed in current conditional lane context.',
        180,
      ),
    ],
  };
}

async function collectEditLaneActionWarnings(page: Page, rootSelector: string): Promise<string[]> {
  const warnings = await page.locator(`${rootSelector} ${ACTION_SELECTOR}`).evaluateAll((nodes) => {
    const notes: string[] = [];
    for (const node of nodes) {
      const el = node as HTMLElement;
      if (!el.offsetParent) continue;
      const label =
        el.getAttribute('aria-label') ?? el.getAttribute('title') ?? el.textContent ?? '';
      const lowered = label.toLowerCase();
      const isMutation =
        /approve|reject|submit|save|delete|create|edit|update|upload|sync|send|sign|award|assign|provision|commit|certify/.test(
          lowered,
        );
      if (!isMutation) continue;

      const disabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
      const reason =
        !disabled &&
        /read-only|readonly|preview|deferred|unavailable|blocked/.test(
          document.body.textContent ?? '',
        )
          ? 'Enabled mutation-looking control visible in read-only/preview context.'
          : disabled &&
              !(
                el.getAttribute('aria-describedby') ||
                el.getAttribute('data-pcc-disabled-reason') ||
                el.getAttribute('title')
              )
            ? 'Disabled mutation-looking control missing explicit disabled reason.'
            : undefined;
      if (reason) notes.push(reason);
    }
    return notes;
  });

  return warnings.map((w) => sanitizeSnippet(w, 180));
}

export interface CapturePccConditionalInput {
  browser: Browser;
  page: Page;
  pageObject: PccLivePageObject;
  env: PccLiveEnv;
  surfaces: readonly PccLiveSurfaceDefinition[];
}

export interface CapturePccConditionalResult {
  evRefs: readonly PccEvidenceId[];
  setup: PccConditionalSetupStatus[];
  stateObservations: PccConditionalStateObservation[];
  layoutObservations: PccConditionalLayoutObservation[];
  focusObservations: PccConditionalFocusObservation[];
  authObservations: PccConditionalAuthObservation[];
  warnings: string[];
  completedLaneCount: number;
  operatorPendingLaneCount: number;
  notConfiguredLaneCount: number;
  needsReviewCount: number;
}

export async function capturePccConditional(
  input: CapturePccConditionalInput,
): Promise<CapturePccConditionalResult> {
  const setup: PccConditionalSetupStatus[] = [];
  const stateObservations: PccConditionalStateObservation[] = [];
  const layoutObservations: PccConditionalLayoutObservation[] = [];
  const focusObservations: PccConditionalFocusObservation[] = [];
  const authObservations: PccConditionalAuthObservation[] = [];
  const warnings: string[] = [];

  const laneIds: PccConditionalLaneId[] = [
    'edit-mode',
    'high-zoom',
    'short-height',
    'drawer-modal',
    'unauthorized',
    'special-state',
  ];

  if (!input.env.conditionalEnabled) {
    for (const lane of laneIds) {
      setup.push(
        setupStatus(
          lane,
          lane === 'edit-mode' || lane === 'unauthorized' ? 'not-configured' : 'operator-pending',
          false,
          false,
          'Conditional gate disabled; lane marked operator-pending until enabled.',
        ),
      );
    }

    return {
      evRefs: PCC_CONDITIONAL_EVIDENCE_IDS,
      setup,
      stateObservations,
      layoutObservations,
      focusObservations,
      authObservations,
      warnings,
      completedLaneCount: 0,
      operatorPendingLaneCount: setup.filter((s) => s.status === 'operator-pending').length,
      notConfiguredLaneCount: setup.filter((s) => s.status === 'not-configured').length,
      needsReviewCount: 0,
    };
  }

  await input.pageObject.goto(input.env.pageUrl);
  await input.pageObject.waitForPccRoot();

  const firstSurface = input.surfaces[0];
  if (firstSurface) {
    await input.pageObject.assertSurfaceActive(firstSurface);
  }

  const editUrl = input.env.editPageUrl;
  if (!editUrl) {
    setup.push(
      setupStatus(
        'edit-mode',
        'not-configured',
        false,
        false,
        'Edit page URL not configured for conditional edit-mode lane.',
      ),
    );
  } else {
    const editSafety = sameTenantHttpsUrl(editUrl, input.env.siteUrl);
    if (!editSafety.ok) {
      setup.push(setupStatus('edit-mode', 'blocked', true, false, editSafety.reason));
      warnings.push(sanitizeSnippet(`Edit lane blocked: ${editSafety.reason}`, 180));
    } else {
      setup.push(
        setupStatus(
          'edit-mode',
          'needs-review',
          true,
          true,
          'Edit lane captured in inspection-only mode.',
        ),
      );
      await input.page.goto(editUrl, { waitUntil: 'domcontentloaded' });
      const editStates = await collectStateObservations(input.page, 'edit-mode', 'body');
      stateObservations.push(...editStates);
      const editWarnings = await collectEditLaneActionWarnings(input.page, 'body');
      warnings.push(...editWarnings);
    }
  }

  await input.pageObject.goto(input.env.pageUrl);
  await input.pageObject.waitForPccRoot();

  setup.push(
    setupStatus('high-zoom', 'needs-review', true, true, 'High-zoom simulated via CSS zoom.'),
  );
  await input.page.setViewportSize({ width: 1024, height: 768 });
  await input.page.evaluate(() => {
    document.documentElement.style.zoom = '200%';
  });
  layoutObservations.push(
    await collectLayoutObservation(input.page, 'high-zoom', 1024, 768, 'simulated-css-zoom-200'),
  );
  stateObservations.push(...(await collectStateObservations(input.page, 'high-zoom', 'body')));
  await input.page.evaluate(() => {
    document.documentElement.style.zoom = '';
  });

  setup.push(
    setupStatus(
      'short-height',
      'needs-review',
      true,
      true,
      'Short-height constrained viewport captured.',
    ),
  );
  await input.page.setViewportSize({ width: 1366, height: 560 });
  layoutObservations.push(
    await collectLayoutObservation(input.page, 'short-height', 1366, 560, 'viewport-1366x560'),
  );
  stateObservations.push(...(await collectStateObservations(input.page, 'short-height', 'body')));

  const drawerFocus = await collectDrawerFocusObservation(input.page, 'drawer-modal');
  focusObservations.push(drawerFocus);
  setup.push(
    setupStatus(
      'drawer-modal',
      drawerFocus.status,
      true,
      true,
      drawerFocus.status === 'operator-pending'
        ? 'Drawer/modal/dialog not observed in this runtime state.'
        : 'Drawer/modal/dialog observed; evidence recorded for review.',
    ),
  );

  const unauthorizedConfigured = Boolean(input.env.unauthorizedStorageStatePath);
  if (!unauthorizedConfigured) {
    setup.push(
      setupStatus(
        'unauthorized',
        'not-configured',
        false,
        false,
        'Unauthorized storageState path not configured for conditional unauthorized lane.',
      ),
    );
    authObservations.push({
      laneId: 'unauthorized',
      attemptedUrl: undefined,
      unauthorizedStorageConfigured: false,
      pageLoaded: false,
      unauthorizedStateObserved: false,
      signInRedirectObserved: false,
      accessDeniedObserved: false,
      pccContentVisible: false,
      needsReview: true,
      notes: ['Unauthorized lane not configured; operator setup required.'],
    });
  } else if (!fs.existsSync(input.env.unauthorizedStorageStatePath!)) {
    setup.push(
      setupStatus(
        'unauthorized',
        'blocked',
        true,
        false,
        'Unauthorized storageState reference missing at configured location.',
      ),
    );
    authObservations.push({
      laneId: 'unauthorized',
      attemptedUrl: undefined,
      unauthorizedStorageConfigured: true,
      pageLoaded: false,
      unauthorizedStateObserved: false,
      signInRedirectObserved: false,
      accessDeniedObserved: false,
      pccContentVisible: false,
      needsReview: true,
      notes: ['Unauthorized lane blocked because configured storageState file is not available.'],
    });
  } else {
    const targetUrl = input.env.unauthorizedPageUrl ?? input.env.pageUrl;
    const targetSafety = sameTenantHttpsUrl(targetUrl, input.env.siteUrl);
    if (!targetSafety.ok) {
      setup.push(setupStatus('unauthorized', 'blocked', true, false, targetSafety.reason));
      warnings.push(sanitizeSnippet(`Unauthorized lane blocked: ${targetSafety.reason}`, 180));
      authObservations.push({
        laneId: 'unauthorized',
        attemptedUrl: undefined,
        unauthorizedStorageConfigured: true,
        pageLoaded: false,
        unauthorizedStateObserved: false,
        signInRedirectObserved: false,
        accessDeniedObserved: false,
        pccContentVisible: false,
        needsReview: true,
        notes: ['Unauthorized lane blocked by tenant URL boundary validation.'],
      });
    } else {
      setup.push(
        setupStatus(
          'unauthorized',
          'needs-review',
          true,
          true,
          'Unauthorized lane attempted with configured isolated context.',
        ),
      );

      const context = await input.browser.newContext({
        storageState: input.env.unauthorizedStorageStatePath,
      });
      const page = await context.newPage();
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

      const url = page.url();
      const pageText = sanitizeSnippet(await page.locator('body').innerText(), 200);
      const signInRedirectObserved = /login|signin|sign in|oauth|microsoftonline/i.test(
        url + pageText,
      );
      const accessDeniedObserved = /access denied|forbidden|unauthorized|permission/i.test(
        pageText,
      );
      const pccContentVisible = (await page.locator('[data-pcc-horizontal-tabs]').count()) > 0;

      authObservations.push({
        laneId: 'unauthorized',
        attemptedUrl: sanitizeSnippet(url, 120),
        unauthorizedStorageConfigured: true,
        pageLoaded: true,
        unauthorizedStateObserved: signInRedirectObserved || accessDeniedObserved,
        signInRedirectObserved,
        accessDeniedObserved,
        pccContentVisible,
        needsReview: true,
        notes: ['Unauthorized lane observation recorded; operator review required.'],
      });

      await context.close();
    }
  }

  setup.push(
    setupStatus(
      'special-state',
      'needs-review',
      true,
      true,
      'Special state/source observation captured from available runtime states.',
    ),
  );
  stateObservations.push(...(await collectStateObservations(input.page, 'special-state', 'body')));

  const completedLaneCount = setup.filter((s) => s.status === 'completed').length;
  const operatorPendingLaneCount = setup.filter((s) => s.status === 'operator-pending').length;
  const notConfiguredLaneCount = setup.filter((s) => s.status === 'not-configured').length;
  const needsReviewCount =
    setup.filter((s) => s.status === 'needs-review').length +
    stateObservations.filter((s) => s.needsReview).length +
    layoutObservations.filter((s) => s.needsReview).length +
    focusObservations.filter((s) => s.focusRiskCount > 0).length +
    authObservations.filter((s) => s.needsReview).length;

  return {
    evRefs: PCC_CONDITIONAL_EVIDENCE_IDS,
    setup,
    stateObservations,
    layoutObservations,
    focusObservations,
    authObservations,
    warnings,
    completedLaneCount,
    operatorPendingLaneCount,
    notConfiguredLaneCount,
    needsReviewCount,
  };
}
