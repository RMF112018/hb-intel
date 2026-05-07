import type { Page } from '@playwright/test';
import type { PccEvidenceId } from './pcc-evidence.types';
import type { PccLivePageObject } from './pcc-live.page-object';
import type { PccLiveSurfaceDefinition } from './pcc-live.surfaces';
import {
  PCC_CONTENT_LANGUAGE_EVIDENCE_IDS,
  type PccContentReviewFinding,
  type PccContentSurfaceSummary,
  type PccVisibleCopyKind,
  type PccVisibleCopyRecord,
} from './pcc-live.content.types';

const MAX_SNIPPET = 160;
const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;

const COPY_SELECTOR = [
  '[data-pcc-card-heading]',
  '[data-pcc-heading-level]',
  '[data-pcc-card-region]',
  '[data-pcc-card-tier]',
  '[data-pcc-state]',
  '[data-pcc-state-kind]',
  '[data-pcc-source]',
  '[data-pcc-source-system]',
  '[data-pcc-system-of-record]',
  '[data-pcc-source-of-record]',
  '[data-pcc-source-confidence]',
  '[data-pcc-read-model]',
  '[data-pcc-fixture]',
  '[data-pcc-mock]',
  '[data-pcc-hbi]',
  '[data-pcc-command-search]',
  'h1',
  'h2',
  'h3',
  'button',
  'a[href]',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="alert"]',
  '[aria-busy]',
  '[disabled]',
  '[aria-disabled="true"]',
].join(',');

function sanitizeText(input: string): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  const noQuery = normalized.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noArtifacts = noCred
    .replace(/test-results/gi, '[redacted-artifact]')
    .replace(/playwright-report/gi, '[redacted-artifact]')
    .replace(/trace\.zip/gi, '[redacted-artifact]')
    .replace(/video\.webm/gi, '[redacted-artifact]')
    .replace(/network\.har/gi, '[redacted-artifact]')
    .replace(/\.auth/gi, '[redacted-cred]');
  const noClaims = noArtifacts
    .replace(/hard stop passed/gi, '[redacted-claim]')
    .replace(/hard stop failed/gi, '[redacted-claim]')
    .replace(/score-ready/gi, '[redacted-claim]')
    .replace(/Phase 4 ready/gi, '[redacted-claim]');
  const noHtml = noClaims.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, MAX_SNIPPET);
}

function hashSnippet(snippet: string): string {
  let h = 0;
  for (let i = 0; i < snippet.length; i += 1) {
    h = (h << 5) - h + snippet.charCodeAt(i);
    h |= 0;
  }
  return `tx-${Math.abs(h)}`;
}

function inferKind(
  selector: string,
  text: string,
  markers?: {
    hasCardHeading: boolean;
    inCard: boolean;
    isState: boolean;
    isSource: boolean;
    isHbi: boolean;
  },
): PccVisibleCopyKind {
  const t = text.toLowerCase();
  if (/^h[1-3](\b|:)/.test(selector) || /heading/.test(selector)) return 'heading';
  if (markers?.hasCardHeading || (markers?.inCard && /card/.test(t))) return 'card-title';
  if (/disabled/.test(selector) || /because|reason/.test(t)) return 'disabled-reason';
  if (markers?.isState || /state|alert|aria-busy/.test(selector)) return 'state-copy';
  if (markers?.isSource || /source|record|read-model/.test(selector)) return 'source-label';
  if (/confidence/.test(selector)) return 'source-confidence';
  if (/fresh|stale|updated|timestamp/.test(t)) return 'freshness-label';
  if (markers?.isHbi || /hbi|command/.test(selector) || /hbi|command/.test(t)) return 'hbi-copy';
  if (/mock|fixture|demo/.test(t) || /data-pcc-mock|data-pcc-fixture/.test(selector)) {
    return 'mock-fixture-label';
  }
  if (/owner|responsible|assignee|next action/.test(t)) return 'owner-responsibility';
  if (/role="tab"|data-pcc-tab/.test(selector)) return 'navigation-label';
  if (/documents|approvals|site health|external systems|project readiness/.test(t)) {
    return 'cross-module-reference';
  }
  if (/button|role="button"|role="link"|a\[href\]/.test(selector)) return 'action-label';
  return 'unknown';
}

function buildSignals(text: string) {
  const t = text.toLowerCase();
  const hbiMutationAuthorityRisk =
    /approve|reject|certify|commit|sign|submit|write|sync|award/.test(t);
  return {
    constructionVocabulary: /rfi|submittal|change order|permit|turnover|closeout|punch/.test(t),
    ownershipLanguage: /owner|responsible|assignee|role|vendor|trade/.test(t),
    nextActionLanguage: /next action|due|follow up|required/.test(t),
    sourceBoundaryLanguage: /source of record|system of record|read-only|source-owned/.test(t),
    sourceConfidenceLanguage: /confidence|trusted|verified|unverified/.test(t),
    freshnessLanguage: /fresh|stale|updated|as of|age/.test(t),
    hbiMention: /\bhbi\b|command search/.test(t),
    hbiAdvisoryLanguage: /suggest|recommend|review|assist|draft|explain/.test(t),
    hbiMutationAuthorityRisk,
    readOnlyPreviewDeferredLanguage: /read-only|readonly|preview|deferred|unavailable/.test(t),
    disabledReasonLanguage: /because|reason|blocked|requires/.test(t),
    mockFixtureDemoLanguage: /mock|fixture|demo|sample/.test(t),
    crossModuleLanguage: /documents|approvals|site health|external systems|project readiness/.test(
      t,
    ),
  };
}

function createFinding(
  category: PccContentReviewFinding['category'],
  title: string,
  rationale: string,
  hashes: string[],
  evidenceIds: readonly PccEvidenceId[],
  disposition: PccContentReviewFinding['disposition'],
  reviewerPrompt: string,
  surfaceId?: PccLiveSurfaceDefinition['id'],
): PccContentReviewFinding {
  return {
    category,
    disposition,
    surfaceId,
    evidenceIds,
    title,
    rationale: sanitizeText(rationale),
    supportingCopyHashes: hashes,
    reviewerPrompt: sanitizeText(reviewerPrompt),
  };
}

export interface CapturePccContentInput {
  page: Page;
  pageObject: PccLivePageObject;
  pageUrl: string;
  surfaces: readonly PccLiveSurfaceDefinition[];
  maxCopyRecordsPerSurface?: number;
}

export interface CapturePccContentResult {
  evRefs: readonly PccEvidenceId[];
  surfaces: PccContentSurfaceSummary[];
  copyRecords: PccVisibleCopyRecord[];
  findings: PccContentReviewFinding[];
  warnings: string[];
}

export async function capturePccContent(
  input: CapturePccContentInput,
): Promise<CapturePccContentResult> {
  const maxPerSurface = input.maxCopyRecordsPerSurface ?? 180;
  const copyRecords: PccVisibleCopyRecord[] = [];
  const surfaces: PccContentSurfaceSummary[] = [];
  const findings: PccContentReviewFinding[] = [];
  const warnings: string[] = [];

  await input.pageObject.goto(input.pageUrl);
  await input.pageObject.waitForPccRoot();

  for (const surface of input.surfaces) {
    const smoke = await input.pageObject.assertSurfaceActive(surface);
    if (!smoke.passed && smoke.warning) warnings.push(sanitizeText(smoke.warning));

    const rootSelector = `[data-pcc-active-surface-panel="${surface.id}"]`;
    const raw = await input.page.locator(`${rootSelector} ${COPY_SELECTOR}`).evaluateAll(
      (nodes, cap) =>
        nodes.slice(0, cap as number).map((node, index) => {
          const el = node as HTMLElement;
          const visible = !!el.offsetParent;
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute('role');
          const text =
            el.getAttribute('aria-label') ??
            el.getAttribute('title') ??
            el.getAttribute('data-pcc-disabled-reason') ??
            el.textContent ??
            '';

          let disabledReason = '';
          const ariaDescribedBy = el.getAttribute('aria-describedby');
          if (ariaDescribedBy) {
            const ref = document.getElementById(ariaDescribedBy);
            disabledReason = ref?.textContent ?? '';
          }

          return {
            selector: `${tag}${role ? `[role="${role}"]` : ''}:nth-of-type(${index + 1})`,
            text,
            disabledReason,
            visible,
            disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
            hasCardHeading: el.hasAttribute('data-pcc-card-heading'),
            inCard: !!el.closest('[data-pcc-card]'),
            isState:
              el.hasAttribute('data-pcc-state') ||
              el.hasAttribute('data-pcc-state-kind') ||
              role === 'alert' ||
              el.hasAttribute('aria-busy'),
            isSource:
              el.hasAttribute('data-pcc-source') ||
              el.hasAttribute('data-pcc-source-system') ||
              el.hasAttribute('data-pcc-system-of-record') ||
              el.hasAttribute('data-pcc-source-of-record') ||
              el.hasAttribute('data-pcc-read-model'),
            isHbi: el.hasAttribute('data-pcc-hbi') || el.hasAttribute('data-pcc-command-search'),
          };
        }),
      maxPerSurface,
    );

    const surfaceRecords: PccVisibleCopyRecord[] = [];
    for (const row of raw) {
      const snippet = sanitizeText(`${row.text} ${row.disabledReason}`);
      if (!snippet) continue;
      const kind = inferKind(row.selector, snippet, {
        hasCardHeading: row.hasCardHeading,
        inCard: row.inCard,
        isState: row.isState,
        isSource: row.isSource,
        isHbi: row.isHbi,
      });
      const signals = buildSignals(snippet);
      const needsReview =
        signals.hbiMutationAuthorityRisk ||
        (row.disabled && !row.disabledReason) ||
        kind === 'unknown';

      surfaceRecords.push({
        surfaceId: surface.id,
        kind,
        selector: sanitizeText(row.selector),
        textSnippet: snippet,
        textHash: hashSnippet(snippet),
        charCount: snippet.length,
        wordCount: snippet.split(/\s+/).filter(Boolean).length,
        visible: row.visible,
        signals,
        needsReview,
      });
    }

    const byKind = (kind: PccVisibleCopyKind) =>
      surfaceRecords.filter((r) => r.kind === kind).length;

    surfaces.push({
      surfaceId: surface.id,
      label: sanitizeText(surface.label),
      visibleCopyCount: surfaceRecords.length,
      headingCount: byKind('heading') + byKind('card-title'),
      actionLabelCount: byKind('action-label'),
      disabledReasonCount: byKind('disabled-reason'),
      stateCopyCount: byKind('state-copy') + byKind('status-label'),
      sourceLabelCount:
        byKind('source-label') + byKind('source-confidence') + byKind('freshness-label'),
      hbiCopyCount: byKind('hbi-copy') + byKind('hbi-authority'),
      ownerResponsibilityCount: byKind('owner-responsibility'),
      mockFixtureLabelCount: byKind('mock-fixture-label'),
      needsReviewCount: surfaceRecords.filter((r) => r.needsReview).length,
    });

    copyRecords.push(...surfaceRecords);

    const disabledWithoutReason = surfaceRecords.filter(
      (r) => (r.kind === 'action-label' || r.kind === 'disabled-reason') && r.needsReview,
    );
    if (disabledWithoutReason.length > 0) {
      findings.push(
        createFinding(
          'disabled-reason-copy',
          'Disabled controls missing clear reason copy',
          'Disabled or blocked affordances are visible without explicit reason language in nearby text.',
          disabledWithoutReason.slice(0, 8).map((r) => r.textHash),
          ['EV-87', 'EV-88', 'EV-89', 'EV-90'],
          'needs-review',
          'Confirm each disabled control explains condition, impact, and next step.',
          surface.id,
        ),
      );
    }

    const hbiRisk = surfaceRecords.filter((r) => r.signals.hbiMutationAuthorityRisk);
    if (hbiRisk.length > 0) {
      findings.push(
        createFinding(
          'hbi-authority-language',
          'HBI authority boundary risk terms detected',
          'Mutation-authority verbs appear in HBI/command-adjacent visible copy and require human boundary review.',
          hbiRisk.slice(0, 8).map((r) => r.textHash),
          ['EV-100', 'EV-101', 'EV-102', 'EV-103'],
          'needs-review',
          'Verify HBI language remains advisory and does not imply autonomous mutation authority.',
          surface.id,
        ),
      );
    }

    const sourceRelated = surfaceRecords.filter(
      (r) =>
        r.signals.sourceBoundaryLanguage ||
        r.signals.sourceConfidenceLanguage ||
        r.signals.freshnessLanguage,
    );
    if (sourceRelated.length > 0) {
      findings.push(
        createFinding(
          'source-of-record-language',
          'Source boundary/confidence copy observed',
          'Source-of-record and confidence/freshness language is present and ready for operator review.',
          sourceRelated.slice(0, 8).map((r) => r.textHash),
          ['EV-93', 'EV-94', 'EV-95', 'EV-96', 'EV-97', 'EV-98', 'EV-99'],
          'review-support',
          'Confirm source ownership boundaries and freshness/confidence wording are clear and non-conflicting.',
          surface.id,
        ),
      );
    }

    const construction = surfaceRecords.filter((r) => r.signals.constructionVocabulary);
    findings.push(
      createFinding(
        'construction-language',
        construction.length > 0
          ? 'Construction operations language signals observed'
          : 'Construction operations language not clearly observed',
        construction.length > 0
          ? 'Construction-domain terms are present in visible-copy snippets.'
          : 'No strong construction-domain terms were detected in bounded snippets for this surface.',
        construction.slice(0, 8).map((r) => r.textHash),
        ['EV-83', 'EV-84', 'EV-85', 'EV-86'],
        construction.length > 0 ? 'review-support' : 'not-observed',
        'Assess whether copy reflects jobsite operations language rather than generic dashboard language.',
        surface.id,
      ),
    );

    const stateRecords = surfaceRecords.filter(
      (r) => r.kind === 'state-copy' || r.signals.readOnlyPreviewDeferredLanguage,
    );
    findings.push(
      createFinding(
        'state-copy-quality',
        stateRecords.length > 0
          ? 'State copy extracted for review'
          : 'State copy not clearly observed',
        stateRecords.length > 0
          ? 'State-oriented visible copy is available for quality review.'
          : 'No clear state-copy snippets observed for this surface in bounded extraction.',
        stateRecords.slice(0, 8).map((r) => r.textHash),
        ['EV-93', 'EV-94', 'EV-95', 'EV-96'],
        stateRecords.length > 0 ? 'review-support' : 'operator-pending',
        'Review whether state copy communicates condition, impact, owner, and next step.',
        surface.id,
      ),
    );

    const ownerAction = surfaceRecords.filter(
      (r) => r.signals.ownershipLanguage || r.signals.nextActionLanguage,
    );
    findings.push(
      createFinding(
        'owner-action-responsibility',
        ownerAction.length > 0
          ? 'Owner/action/responsibility language observed'
          : 'Owner/action/responsibility language not clearly observed',
        ownerAction.length > 0
          ? 'Ownership and next-action language exists in extracted snippets.'
          : 'Ownership/next-action signals were limited in extracted snippets.',
        ownerAction.slice(0, 8).map((r) => r.textHash),
        ['EV-91', 'EV-92', 'EV-105'],
        ownerAction.length > 0 ? 'review-support' : 'operator-pending',
        'Verify who owns the next action and whether urgency/priority are clear.',
        surface.id,
      ),
    );

    const mockFixture = surfaceRecords.filter((r) => r.signals.mockFixtureDemoLanguage);
    findings.push(
      createFinding(
        'mock-fixture-transparency',
        mockFixture.length > 0
          ? 'Mock/fixture/demo transparency labels observed'
          : 'Mock/fixture/demo transparency not clearly observed',
        mockFixture.length > 0
          ? 'Mock/fixture/demo markers are visible and can be audited for clarity.'
          : 'No clear mock/fixture/demo markers were detected in bounded snippets.',
        mockFixture.slice(0, 8).map((r) => r.textHash),
        ['EV-106'],
        mockFixture.length > 0 ? 'review-support' : 'operator-pending',
        'Confirm non-production data is explicitly labeled for operators.',
        surface.id,
      ),
    );
  }

  return {
    evRefs: PCC_CONTENT_LANGUAGE_EVIDENCE_IDS,
    surfaces,
    copyRecords,
    findings,
    warnings,
  };
}
