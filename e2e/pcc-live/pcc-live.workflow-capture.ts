import type { Page } from '@playwright/test';
import type { PccLivePageObject } from './pcc-live.page-object';
import type {
  PccApprovalsQueueObservation,
  PccContinuityObservation,
  PccExternalPlatformObservation,
  PccHbiAuthorityObservation,
  PccSourceOfRecordObservation,
  PccWorkflowActionKind,
  PccWorkflowActionObservation,
  PccWorkflowPriorityObservation,
  PccWorkflowStateObservation,
  PccWorkflowSurfaceEvidence,
} from './pcc-live.workflow.types';
import type { PccLiveSurfaceDefinition } from './pcc-live.surfaces';

const ACTION_SELECTOR =
  'button, a[href], [role="button"], [role="link"], [role="tab"], [data-pcc-action], [data-pcc-command], [data-pcc-launch], [data-pcc-external-system]';

const STATE_SELECTOR =
  '[role="alert"], [aria-busy], [data-pcc-state], [data-pcc-preview], [data-pcc-readonly], [data-pcc-read-only], [data-pcc-deferred], [data-pcc-source-confidence], [data-pcc-state-kind]';

const SOURCE_SELECTOR =
  '[data-pcc-source], [data-pcc-source-system], [data-pcc-system-of-record], [data-pcc-source-of-record], [data-pcc-source-confidence], [data-pcc-read-model], [data-pcc-fixture], [data-pcc-mock]';

const MUTATION_RE =
  /approve|reject|submit|save|delete|create|edit|update|upload|sync|send|sign|award|assign|provision|commit|certify/i;
const READONLY_CONTEXT_RE =
  /read-only|readonly|preview|deferred|unavailable|blocked|stale|unauthorized/i;
const OWNER_RE = /owner|responsible|assignee|role|trade|vendor|ball in court/i;
const NEXT_ACTION_RE =
  /next action|due|lifecycle|readiness|documents|approvals|site health|external systems/i;
const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noRawArtifacts = noCred
    .replace(/test-results/gi, '[redacted-artifact]')
    .replace(/playwright-report/gi, '[redacted-artifact]')
    .replace(/trace\.zip/gi, '[redacted-artifact]')
    .replace(/video\.webm/gi, '[redacted-artifact]')
    .replace(/network\.har/gi, '[redacted-artifact]')
    .replace(/\.auth/gi, '[redacted-cred]');
  const noPolicyClaims = noRawArtifacts
    .replace(/hard stop passed/gi, '[redacted-claim]')
    .replace(/hard stop failed/gi, '[redacted-claim]')
    .replace(/score-ready/gi, '[redacted-claim]')
    .replace(/Phase 4 ready/gi, '[redacted-claim]');
  const noHtml = noPolicyClaims.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function sanitizeSnippet(input: string, max = 120): string {
  return sanitizeText(input.replace(/\s+/g, ' ').trim()).slice(0, max);
}

function classifyActionKind(label: string): PccWorkflowActionKind {
  if (/approve/i.test(label)) return 'approve';
  if (/reject/i.test(label)) return 'reject';
  if (/submit/i.test(label)) return 'submit';
  if (/save/i.test(label)) return 'save';
  if (/delete/i.test(label)) return 'delete';
  if (/sync/i.test(label)) return 'sync';
  if (/export/i.test(label)) return 'export';
  if (/preview/i.test(label)) return 'preview';
  if (/read.?only/i.test(label)) return 'read-only';
  if (/filter/i.test(label)) return 'filter';
  if (/search|command/i.test(label)) return 'search';
  if (
    /launch|open|external platform|procore|sage|autodesk|adobe sign|document crunch/i.test(label)
  ) {
    return 'launch';
  }
  if (/tab|navigate|go to|view/i.test(label)) return 'navigation';
  return 'unknown';
}

function sourceSystemFromText(input: string): PccSourceOfRecordObservation['sourceSystem'] {
  if (/sharepoint/i.test(input)) return 'SharePoint';
  if (/procore/i.test(input)) return 'Procore';
  if (/sage/i.test(input)) return 'Sage';
  if (/autodesk/i.test(input)) return 'Autodesk';
  if (/document crunch/i.test(input)) return 'Document Crunch';
  if (/adobe sign/i.test(input)) return 'Adobe Sign';
  if (/\bhbi\b/i.test(input)) return 'HBI';
  if (/fixture/i.test(input)) return 'Fixture';
  if (/mock|demo|stub/i.test(input)) return 'Mock';
  if (/\bpcc\b/i.test(input)) return 'PCC';
  return 'Unknown';
}

export interface CapturePccWorkflowInput {
  page: Page;
  pageObject: PccLivePageObject;
  pageUrl: string;
  surfaces: readonly PccLiveSurfaceDefinition[];
  maxActionObservationsPerSurface?: number;
  maxStateObservationsPerSurface?: number;
  maxSourceObservationsPerSurface?: number;
}

export interface CapturePccWorkflowResult {
  surfaces: PccWorkflowSurfaceEvidence[];
  surfaceCount: number;
  actionObservationCount: number;
  primaryActionCount: number;
  disabledWithoutReasonCount: number;
  falseAffordanceNeedsReviewCount: number;
  stateObservationCount: number;
  sourceObservationCount: number;
  mockDemoSignalCount: number;
  hbiAuthorityRiskCount: number;
  externalPlatformsObservationCount: number;
  approvalsQueueObservationCount: number;
  continuitySignalCount: number;
  warningCount: number;
}

export async function capturePccWorkflow(
  input: CapturePccWorkflowInput,
): Promise<CapturePccWorkflowResult> {
  const maxActions = input.maxActionObservationsPerSurface ?? 160;
  const maxStates = input.maxStateObservationsPerSurface ?? 80;
  const maxSources = input.maxSourceObservationsPerSurface ?? 80;

  const surfaces: PccWorkflowSurfaceEvidence[] = [];

  await input.pageObject.goto(input.pageUrl);
  await input.pageObject.waitForPccRoot();

  for (const surface of input.surfaces) {
    const warnings: string[] = [];
    const smoke = await input.pageObject.assertSurfaceActive(surface);
    if (!smoke.passed && smoke.warning) warnings.push(sanitizeText(smoke.warning));

    const panelSelector = `[data-pcc-active-surface-panel="${surface.id}"]`;
    const hasPanel = (await input.page.locator(panelSelector).count()) > 0;
    const root = hasPanel ? panelSelector : 'body';

    const actions = await captureActions(input.page, surface.id, root, maxActions);
    const priority = await capturePriority(input.page, surface.id, root, actions);
    const states = await captureStates(input.page, surface.id, root, maxStates);
    const sources = await captureSources(input.page, surface.id, root, maxSources);
    const hbiAuthority = await captureHbiAuthority(input.page, surface.id, root);
    const externalPlatform = await captureExternalPlatform(input.page, surface.id, root, actions);
    const approvalsQueue = await captureApprovalsQueue(input.page, surface.id, root, actions);
    const continuity = await captureContinuity(input.page, surface.id, root);

    surfaces.push({
      surfaceId: surface.id,
      label: sanitizeSnippet(surface.label, 80),
      actions,
      priority,
      states,
      sources,
      hbiAuthority,
      externalPlatform,
      approvalsQueue,
      continuity,
      warnings,
    });
  }

  return {
    surfaces,
    surfaceCount: surfaces.length,
    actionObservationCount: surfaces.reduce((sum, s) => sum + s.actions.length, 0),
    primaryActionCount: surfaces.reduce((sum, s) => sum + s.priority.primaryActionCount, 0),
    disabledWithoutReasonCount: surfaces.reduce(
      (sum, s) =>
        sum +
        s.actions.filter((a) => (a.disabled || a.ariaDisabled) && !a.hasDisabledReason).length,
      0,
    ),
    falseAffordanceNeedsReviewCount: surfaces.reduce(
      (sum, s) =>
        sum +
        s.actions.filter(
          (a) =>
            a.falseAffordanceRisk === 'needs-review' ||
            a.falseAffordanceRisk === 'high' ||
            a.falseAffordanceRisk === 'medium',
        ).length,
      0,
    ),
    stateObservationCount: surfaces.reduce((sum, s) => sum + s.states.length, 0),
    sourceObservationCount: surfaces.reduce((sum, s) => sum + s.sources.length, 0),
    mockDemoSignalCount: surfaces.reduce(
      (sum, s) =>
        sum +
        s.states.filter((st) => st.stateKind === 'mock-demo' || st.stateKind === 'fixture').length,
      0,
    ),
    hbiAuthorityRiskCount: surfaces.reduce((sum, s) => sum + s.hbiAuthority.riskyKeywordCount, 0),
    externalPlatformsObservationCount: surfaces.reduce(
      (sum, s) => sum + (s.externalPlatform?.launchSurfaceObserved ? 1 : 0),
      0,
    ),
    approvalsQueueObservationCount: surfaces.reduce(
      (sum, s) => sum + (s.approvalsQueue?.queueObserved ? 1 : 0),
      0,
    ),
    continuitySignalCount: surfaces.reduce(
      (sum, s) =>
        sum +
        s.continuity.ownerSignalCount +
        s.continuity.responsibilitySignalCount +
        s.continuity.crossSurfaceReferenceCount +
        s.continuity.lifecycleLanguageCount +
        s.continuity.nextActionLanguageCount,
      0,
    ),
    warningCount: surfaces.reduce((sum, s) => sum + s.warnings.length, 0),
  };
}

async function captureActions(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
  cap: number,
): Promise<PccWorkflowActionObservation[]> {
  const locator = page.locator(`${rootSelector} ${ACTION_SELECTOR}`);
  const count = Math.min(await locator.count(), cap);
  const items: PccWorkflowActionObservation[] = [];

  for (let i = 0; i < count; i += 1) {
    const item = await locator.nth(i).evaluate((node, index) => {
      const el = node as HTMLElement;
      if (!el.offsetParent) return null;
      const role = el.getAttribute('role') ?? undefined;
      const tagName = el.tagName.toLowerCase();
      const label =
        el.getAttribute('aria-label') ?? el.getAttribute('title') ?? el.textContent ?? '';
      const href = el instanceof HTMLAnchorElement ? el.href : undefined;
      const disabled = el.hasAttribute('disabled');
      const ariaDisabled = el.getAttribute('aria-disabled') === 'true';
      const hasDisabledReason = Boolean(
        el.getAttribute('aria-describedby') ||
        el.getAttribute('data-pcc-disabled-reason') ||
        el.getAttribute('title'),
      );
      const contextText =
        (el.closest('[data-pcc-card]')?.textContent ?? '') +
        ' ' +
        (el.closest('[data-pcc-active-surface-panel]')?.textContent ?? '');

      return {
        selector: `${tagName}:nth-of-type(${index + 1})`,
        tagName,
        role,
        label,
        href,
        enabled: !disabled && !ariaDisabled,
        disabled,
        ariaDisabled,
        hasDisabledReason,
        hasAccessibleName: Boolean(
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.getAttribute('title') ||
          el.textContent?.trim(),
        ),
        readOnlyOrPreviewContext:
          /read-only|readonly|preview|deferred|unavailable|blocked|stale|unauthorized/i.test(
            contextText,
          ),
      };
    }, i);

    if (!item) continue;

    let destinationHost: string | undefined;
    let destinationPath: string | undefined;
    let destinationIsExternal = false;
    if (item.href) {
      try {
        const parsed = new URL(item.href);
        destinationHost = sanitizeSnippet(parsed.host, 80);
        destinationPath = sanitizeSnippet(parsed.pathname, 120);
        destinationIsExternal = !/sharepoint\.com$/i.test(parsed.hostname);
      } catch {
        destinationHost = undefined;
        destinationPath = undefined;
      }
    }

    const sanitizedLabel = sanitizeSnippet(item.label, 80);
    const kind =
      item.role === 'tab' || /\btab\b/i.test(item.selector)
        ? 'navigation'
        : classifyActionKind(sanitizedLabel);
    const mutationKeywordDetected = MUTATION_RE.test(sanitizedLabel);
    const mediumRisk = (item.disabled || item.ariaDisabled) && !item.hasDisabledReason;
    const highRisk = mutationKeywordDetected && item.enabled && item.readOnlyOrPreviewContext;
    const falseAffordanceRisk = highRisk
      ? 'high'
      : mediumRisk
        ? 'medium'
        : mutationKeywordDetected
          ? 'needs-review'
          : 'none-observed';

    items.push({
      surfaceId,
      selector: sanitizeSnippet(item.selector, 120),
      tagName: sanitizeSnippet(item.tagName, 40),
      role: item.role ? sanitizeSnippet(item.role, 40) : undefined,
      kind,
      enabled: item.enabled,
      disabled: item.disabled,
      ariaDisabled: item.ariaDisabled,
      hasDisabledReason: item.hasDisabledReason,
      hasAccessibleName: item.hasAccessibleName,
      labelSnippet: sanitizedLabel || undefined,
      destinationHost,
      destinationPath,
      destinationIsExternal,
      mutationKeywordDetected,
      readOnlyOrPreviewContext: item.readOnlyOrPreviewContext,
      falseAffordanceRisk,
      needsReview: highRisk || mediumRisk || mutationKeywordDetected,
    });
  }

  return items;
}

async function capturePriority(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
  actions: PccWorkflowActionObservation[],
): Promise<PccWorkflowPriorityObservation> {
  const cards = await page.locator(`${rootSelector} [data-pcc-card]`).evaluateAll((nodes) =>
    nodes.map((n, index) => ({
      index,
      hierarchy: n.getAttribute('data-pcc-card-hierarchy') ?? '',
      tier: n.getAttribute('data-pcc-card-tier') ?? '',
      region: n.getAttribute('data-pcc-card-region') ?? '',
      footprint: n.getAttribute('data-pcc-footprint') ?? '',
    })),
  );

  const priorityCards = cards.filter(
    (c) => /primary/i.test(c.hierarchy) || /tier1/i.test(c.tier) || /command/i.test(c.region),
  );
  const referenceCards = cards.filter((c) => /reference|rail/i.test(c.region));
  const firstPrimaryActionIndex = actions.findIndex((a) => a.kind !== 'unknown');
  const firstReferenceCardIndex = referenceCards[0]?.index;

  return {
    surfaceId,
    primaryActionCount: actions.filter((a) => a.kind !== 'unknown').length,
    priorityCardCount: priorityCards.length,
    referenceCardCount: referenceCards.length,
    firstPrimaryActionIndex: firstPrimaryActionIndex >= 0 ? firstPrimaryActionIndex : undefined,
    firstReferenceCardIndex,
    priorityBeforeReference:
      firstPrimaryActionIndex >= 0 &&
      (firstReferenceCardIndex === undefined || firstPrimaryActionIndex <= firstReferenceCardIndex),
    needsReview:
      firstPrimaryActionIndex < 0 ||
      (firstReferenceCardIndex !== undefined && firstPrimaryActionIndex > firstReferenceCardIndex),
    notes: [
      sanitizeSnippet('Priority ordering is evidence-only and requires operator review.', 120),
    ],
  };
}

async function captureStates(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
  cap: number,
): Promise<PccWorkflowStateObservation[]> {
  const kinds: PccWorkflowStateObservation['stateKind'][] = [
    'loading',
    'empty',
    'error',
    'blocked',
    'degraded',
    'preview',
    'read-only',
    'deferred',
    'unavailable',
    'unauthorized',
    'stale',
    'missing-config',
    'mock-demo',
    'fixture',
  ];

  const raw = await page.locator(`${rootSelector} ${STATE_SELECTOR}`).evaluateAll(
    (nodes, max) =>
      nodes.slice(0, max as number).map((node, index) => {
        const el = node as HTMLElement;
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        return {
          selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          text,
          attrs: [
            el.getAttribute('data-pcc-state') ?? '',
            el.getAttribute('data-pcc-state-kind') ?? '',
            el.getAttribute('data-pcc-preview') ?? '',
            el.getAttribute('data-pcc-readonly') ?? '',
            el.getAttribute('data-pcc-read-only') ?? '',
            el.getAttribute('data-pcc-deferred') ?? '',
          ].join(' '),
        };
      }),
    cap,
  );

  const haystack = raw.map((r) => `${r.text} ${r.attrs}`).join(' ');
  const observations: PccWorkflowStateObservation[] = [];

  for (const kind of kinds) {
    const regex =
      kind === 'read-only'
        ? /read-only|readonly/i
        : kind === 'missing-config'
          ? /missing configuration|missing config|not configured/i
          : kind === 'mock-demo'
            ? /mock|demo|stub/i
            : new RegExp(kind.replace('-', '[- ]?'), 'i');
    const matched = raw.find((r) => regex.test(`${r.text} ${r.attrs}`));
    const snippet = matched ? sanitizeSnippet(matched.text || matched.attrs, 120) : undefined;
    const observed = regex.test(haystack);
    const hasOwner = OWNER_RE.test(haystack);
    const hasNextStep = NEXT_ACTION_RE.test(haystack);

    observations.push({
      surfaceId,
      stateKind: kind,
      observed,
      selector: matched ? sanitizeSnippet(matched.selector, 120) : undefined,
      copySnippet: snippet,
      hasImpact: observed,
      hasOwner,
      hasNextStep,
      needsReview: observed,
    });
  }

  if (observations.length === 0) {
    observations.push({
      surfaceId,
      stateKind: 'unknown',
      observed: true,
      hasImpact: false,
      hasOwner: false,
      hasNextStep: false,
      needsReview: true,
    });
  }

  return observations;
}

async function captureSources(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
  cap: number,
): Promise<PccSourceOfRecordObservation[]> {
  const raw = await page.locator(`${rootSelector} ${SOURCE_SELECTOR}`).evaluateAll(
    (nodes, max) =>
      nodes.slice(0, max as number).map((node, index) => {
        const el = node as HTMLElement;
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        const attrs = [
          el.getAttribute('data-pcc-source') ?? '',
          el.getAttribute('data-pcc-source-system') ?? '',
          el.getAttribute('data-pcc-system-of-record') ?? '',
          el.getAttribute('data-pcc-source-of-record') ?? '',
          el.getAttribute('data-pcc-source-confidence') ?? '',
          el.getAttribute('data-pcc-read-model') ?? '',
          el.getAttribute('data-pcc-fixture') ?? '',
          el.getAttribute('data-pcc-mock') ?? '',
        ].join(' ');
        return {
          selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          text,
          attrs,
        };
      }),
    cap,
  );

  const observations: PccSourceOfRecordObservation[] = [];
  for (const entry of raw) {
    const sourceText = `${entry.text} ${entry.attrs}`;
    const sourceSystem = sourceSystemFromText(sourceText);
    observations.push({
      surfaceId,
      sourceSystem,
      observed: sourceSystem !== 'Unknown',
      selector: sanitizeSnippet(entry.selector, 120),
      ownershipSnippet: sanitizeSnippet(sourceText, 120),
      readOnlyBoundaryObserved: READONLY_CONTEXT_RE.test(sourceText),
      writeAuthorityClaimObserved: /write|commit|approve|submit|edit|update/i.test(sourceText),
      needsReview: true,
    });
  }

  if (observations.length === 0) {
    observations.push({
      surfaceId,
      sourceSystem: 'Unknown',
      observed: false,
      readOnlyBoundaryObserved: false,
      writeAuthorityClaimObserved: false,
      needsReview: true,
    });
  }

  return observations;
}

async function captureHbiAuthority(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
): Promise<PccHbiAuthorityObservation> {
  const text = await page
    .locator(rootSelector)
    .first()
    .evaluate((node) => {
      const el = node as HTMLElement;
      return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    });

  const riskyKeywordCount = (
    text.match(/approve|reject|certify|commit|sign|submit|mutate|write|sync|award/gi) ?? []
  ).length;

  return {
    surfaceId,
    selector: sanitizeSnippet(rootSelector, 120),
    hbiMentionObserved: /\bhbi\b/i.test(text),
    commandSearchObserved: /command|search/i.test(text),
    advisoryLanguageObserved: /advisory|suggest|recommend|review/i.test(text),
    mutationAuthorityClaimObserved: /approve|reject|commit|sign|submit|write/i.test(text),
    riskyKeywordCount,
    needsReview: riskyKeywordCount > 0,
  };
}

async function captureExternalPlatform(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
  actions: PccWorkflowActionObservation[],
): Promise<PccExternalPlatformObservation> {
  const links = actions.filter((a) => a.kind === 'launch' || a.destinationIsExternal);
  const destinationHosts = Array.from(
    new Set(links.map((link) => link.destinationHost).filter(Boolean)),
  ) as string[];
  const panelText = await page
    .locator(rootSelector)
    .first()
    .evaluate((node) => {
      const el = node as HTMLElement;
      return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    });

  const unsafeExecutableActionCount = actions.filter(
    (a) => a.enabled && a.mutationKeywordDetected,
  ).length;

  return {
    surfaceId,
    launchSurfaceObserved: links.length > 0 || /external platform/i.test(panelText),
    launchOnlyLanguageObserved: /launch|opens in|external platform/i.test(panelText),
    externalLinkCount: links.length,
    unsafeExecutableActionCount,
    destinationHosts: destinationHosts.map((host) => sanitizeSnippet(host, 80)),
    needsReview: unsafeExecutableActionCount > 0,
  };
}

async function captureApprovalsQueue(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
  actions: PccWorkflowActionObservation[],
): Promise<PccApprovalsQueueObservation> {
  const approveActionCount = actions.filter((a) => a.kind === 'approve').length;
  const rejectActionCount = actions.filter((a) => a.kind === 'reject').length;
  const submitActionCount = actions.filter((a) => a.kind === 'submit').length;
  const riskyExecutableActionCount = actions.filter(
    (a) => a.enabled && (a.kind === 'approve' || a.kind === 'reject' || a.kind === 'submit'),
  ).length;
  const disabledReasonCount = actions.filter(
    (a) => (a.disabled || a.ariaDisabled) && a.hasDisabledReason,
  ).length;

  const text = await page
    .locator(rootSelector)
    .first()
    .evaluate((node) => {
      const el = node as HTMLElement;
      return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    });

  return {
    surfaceId,
    queueObserved:
      /approval|queue/i.test(text) ||
      approveActionCount + rejectActionCount + submitActionCount > 0,
    approveActionCount,
    rejectActionCount,
    submitActionCount,
    readOnlyOrPreviewBoundaryObserved:
      /read-only|readonly|preview|deferred|blocked|unauthorized/i.test(text),
    disabledReasonCount,
    riskyExecutableActionCount,
    needsReview: riskyExecutableActionCount > 0,
  };
}

async function captureContinuity(
  page: Page,
  surfaceId: PccWorkflowSurfaceEvidence['surfaceId'],
  rootSelector: string,
): Promise<PccContinuityObservation> {
  const text = await page
    .locator(rootSelector)
    .first()
    .evaluate((node) => {
      const el = node as HTMLElement;
      return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    });

  return {
    surfaceId,
    ownerSignalCount: (
      text.match(/owner|responsible|assignee|role|trade|vendor|ball in court/gi) ?? []
    ).length,
    responsibilitySignalCount: (text.match(/responsible|assignee|ownership/gi) ?? []).length,
    crossSurfaceReferenceCount: (
      text.match(
        /documents|approvals|site health|external systems|team & access|project readiness/gi,
      ) ?? []
    ).length,
    lifecycleLanguageCount: (text.match(/lifecycle|stage|phase|readiness/gi) ?? []).length,
    nextActionLanguageCount: (text.match(/next action|due|follow up|owner action/gi) ?? []).length,
    needsReview: true,
  };
}
