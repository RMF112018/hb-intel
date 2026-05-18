/**
 * View-model selectors for My Dashboard cards.
 *
 * Pure functions; no React. Each selector takes an optional read-model
 * envelope and returns a stable per-card view-model. When the envelope is
 * absent (no provider data, loading window not yet resolved, etc.) the
 * selector returns a VM with nullable / fallback fields so cards never
 * crash. Cards consume the VM as an optional prop and fall back to legacy
 * placeholder copy when it is undefined, which keeps preview/test contexts
 * stable.
 *
 * Status-to-copy mapping is closed-set (one entry per
 * `MyWorkReadModelSourceStatus` value) so non-ready guidance never
 * collapses into a single generic "pending connection" message — each
 * failure class gets its own truthful copy.
 *
 * @module state/myWorkCardViewModel
 */

import type {
  MyProjectLinksReadModel,
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsSummary,
  MyWorkAdobeSignRequiredAction,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';

// Used internally; suppressed from public surface — exported for re-export by tests.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _PreserveProjectLinksImport = MyProjectLinksReadModel;

// ─── Generic helpers ──────────────────────────────────────────────────────

const PENDING_REFRESH_FALLBACK = 'Pending source connection';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

/**
 * Formats an ISO-8601 UTC timestamp as a stable, UTC-anchored label so
 * tests render identically on any CI time zone. Returns
 * `'Pending source connection'` when the input is absent so legacy
 * non-ready states retain their truthful copy.
 */
export function formatGeneratedAtUtc(iso: string | undefined): string {
  if (!iso) return PENDING_REFRESH_FALLBACK;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return PENDING_REFRESH_FALLBACK;
  return DATE_TIME_FORMATTER.format(date);
}

export function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

// ─── Source-status copy ───────────────────────────────────────────────────

export interface SourceStatusCopy {
  readonly stateLabel: string;
  readonly guidance: string;
  readonly ctaApplicable: boolean;
}

const SOURCE_STATUS_COPY: Readonly<Record<MyWorkReadModelSourceStatus, SourceStatusCopy>> = {
  available: {
    stateLabel: 'Connected',
    guidance: 'Adobe Sign is connected and reporting actionable agreements.',
    ctaApplicable: false,
  },
  partial: {
    stateLabel: 'Partial data',
    guidance:
      'Some agreements may be missing — the latest source read was incomplete. Counts and items reflect what was returned.',
    ctaApplicable: false,
  },
  'configuration-required': {
    stateLabel: 'Configuration required',
    guidance:
      'Adobe Sign credentials need to be configured by an administrator before your queue can load.',
    ctaApplicable: false,
  },
  'authorization-required': {
    stateLabel: 'Authorization required',
    guidance:
      "You haven't authorized the Adobe Sign connection yet — connect to start loading your queue.",
    ctaApplicable: true,
  },
  'principal-unresolved': {
    stateLabel: 'Account not resolved',
    guidance:
      "Your HB account couldn't be matched to an Adobe Sign user. Contact an administrator.",
    ctaApplicable: false,
  },
  'source-unavailable': {
    stateLabel: 'Adobe Sign unavailable',
    guidance:
      "Adobe Sign isn't reachable right now. Your queue will resume once the source is back online.",
    ctaApplicable: false,
  },
  'backend-unavailable': {
    stateLabel: 'Service unavailable',
    guidance: "The HB read-model service isn't responding. Try again shortly.",
    ctaApplicable: false,
  },
};

const UNKNOWN_STATUS_COPY: SourceStatusCopy = {
  stateLabel: 'Source state unknown',
  guidance: 'The source status has not been reported yet.',
  ctaApplicable: false,
};

export function sourceStatusCopy(
  status: MyWorkReadModelSourceStatus | undefined,
): SourceStatusCopy {
  if (!status) return UNKNOWN_STATUS_COPY;
  return SOURCE_STATUS_COPY[status];
}

// ─── Required-action label mapping ────────────────────────────────────────

const REQUIRED_ACTION_LABEL: Readonly<Record<MyWorkAdobeSignRequiredAction, string>> = {
  signature: 'Signature required',
  approval: 'Approval required',
  acceptance: 'Acceptance required',
  acknowledgement: 'Acknowledgement required',
  'form-filling': 'Form filling required',
  delegation: 'Delegation required',
};

export function requiredActionLabel(action: MyWorkAdobeSignRequiredAction): string {
  return REQUIRED_ACTION_LABEL[action];
}

// ─── Adobe Sign action queue — consolidated card (Prompt 03) ──────────────

/**
 * Extracts the Adobe Sign source's specific status from the home envelope's
 * `sourceReadiness` array. Returns `undefined` when the envelope is absent
 * or the lookup fails — the consolidated card falls back to an explicit
 * `sourceStatus` prop in that case.
 */
export function selectAdobeSignSourceStatus(
  env: MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined,
): MyWorkReadModelSourceStatus | undefined {
  if (!env) return undefined;
  const item = env.data.sourceReadiness.find((it) => it.sourceSystem === 'adobe-sign');
  return item?.sourceStatus;
}

// ─── Adobe Sign queue summary (consolidated card metrics) ─────────────────

export interface AdobeQueueSummaryVm {
  readonly pendingAgreementsCount: number | null;
  readonly signatureActionsCount: number | null;
  /** Review-class actions = approval + acceptance + acknowledgement. */
  readonly reviewActionsCount: number | null;
  readonly lastRefreshedLabel: string;
}

const ADOBE_QUEUE_SUMMARY_FALLBACK: AdobeQueueSummaryVm = {
  pendingAgreementsCount: null,
  signatureActionsCount: null,
  reviewActionsCount: null,
  lastRefreshedLabel: PENDING_REFRESH_FALLBACK,
};

/**
 * Derives the metrics view-model directly from a summary object so the
 * consolidated card can consume the home projection's
 * `adobeSignActionQueue.summary` without a queue envelope.
 */
export function selectAdobeQueueSummaryVmFromSummary(
  summary: MyWorkAdobeSignActionQueueSummary | undefined,
  generatedAtUtc?: string,
): AdobeQueueSummaryVm {
  if (!summary) return ADOBE_QUEUE_SUMMARY_FALLBACK;
  return {
    pendingAgreementsCount: summary.totalActionItemCount,
    signatureActionsCount: summary.signatureCount,
    reviewActionsCount:
      summary.approvalCount + summary.acceptanceCount + summary.acknowledgementCount,
    lastRefreshedLabel: formatGeneratedAtUtc(generatedAtUtc),
  };
}

// ─── Adobe Sign agreement list (consolidated card items) ──────────────────

export interface AdobeAgreementListItem {
  readonly itemId: string;
  readonly agreementId: string;
  readonly agreementName: string;
  readonly requiredAction: MyWorkAdobeSignRequiredAction;
  readonly requiredActionLabel: string;
  readonly actionHandoff: MyWorkAdobeSignActionQueueItem['actionHandoff'];
  readonly senderLabel: string | null;
  readonly receivedAtLabel: string | null;
  readonly expiresLabel: string | null;
  /**
   * Policy-approved, backend-derived row-level launch URL. When present the
   * consolidated card renders an `Open in Adobe Sign` anchor; when absent
   * the card renders no anchor (no synthesized URLs).
   */
  readonly sourceOpenUrl?: string;
}

export interface AdobeAgreementListVm {
  readonly items: readonly AdobeAgreementListItem[];
  readonly isEmpty: boolean;
  readonly hasMore: boolean;
}

export interface AdobeRecentCompletionsSummaryVm {
  readonly completedAgreementCount: number | null;
  readonly windowDays: 30 | null;
  readonly lastRefreshedLabel: string;
}

const ADOBE_RECENT_COMPLETIONS_SUMMARY_FALLBACK: AdobeRecentCompletionsSummaryVm = {
  completedAgreementCount: null,
  windowDays: null,
  lastRefreshedLabel: PENDING_REFRESH_FALLBACK,
};

export function selectAdobeRecentCompletionsSummaryVmFromSummary(
  summary: MyWorkAdobeSignRecentCompletionsSummary | undefined,
  generatedAtUtc?: string,
): AdobeRecentCompletionsSummaryVm {
  if (!summary) return ADOBE_RECENT_COMPLETIONS_SUMMARY_FALLBACK;
  return {
    completedAgreementCount: summary.completedAgreementCount,
    windowDays: summary.windowDays,
    lastRefreshedLabel: formatGeneratedAtUtc(generatedAtUtc),
  };
}

export function selectAdobeQueuePreviewContext(
  displayedCount: number,
  totalCount: number | null,
): string | null {
  if (totalCount === null || totalCount <= displayedCount) return null;
  return `Showing ${displayedCount} of ${totalCount} agreements requiring action.`;
}

export function selectAdobeCompletedPreviewContext(
  displayedCount: number,
  totalCount: number | null,
): string | null {
  if (totalCount === null || totalCount <= displayedCount) return null;
  return `Showing latest ${displayedCount} of ${totalCount} completed agreements.`;
}

export function selectAdobeCompletedSummaryRail(
  summary: AdobeRecentCompletionsSummaryVm,
): string | null {
  if (summary.completedAgreementCount === null) return null;
  if (summary.windowDays === null) {
    return `${summary.completedAgreementCount} completed in the recent reporting window`;
  }
  return `${summary.completedAgreementCount} completed in the last ${summary.windowDays} days`;
}

export interface AdobeRecentCompletionsListItemVm {
  readonly itemId: string;
  readonly agreementName: string;
  readonly senderLabel: string | null;
  readonly dateLabel: string | null;
  readonly sourceOpenUrl?: string;
}

export interface AdobeRecentCompletionsListVm {
  readonly items: readonly AdobeRecentCompletionsListItemVm[];
  readonly isEmpty: boolean;
  readonly hasMore: boolean;
}

export function selectAdobeRecentCompletionsListVmFromItems(
  items: readonly MyWorkAdobeSignRecentCompletionsItem[] | undefined,
  hasMore = false,
): AdobeRecentCompletionsListVm {
  if (!items) {
    return { items: [], isEmpty: true, hasMore: false };
  }

  const mapped = items.map<AdobeRecentCompletionsListItemVm>((it) => {
    const dateLabel = it.completedAtUtc
      ? `Completed ${formatGeneratedAtUtc(it.completedAtUtc)}`
      : it.modifiedAtUtc
        ? `Updated ${formatGeneratedAtUtc(it.modifiedAtUtc)}`
        : null;
    return {
      itemId: it.itemId,
      agreementName: it.agreementName,
      senderLabel: it.sender?.displayName ?? null,
      dateLabel,
      sourceOpenUrl: it.sourceOpenUrl,
    };
  });

  return {
    items: mapped,
    isEmpty: mapped.length === 0,
    hasMore,
  };
}

export interface AdobeSignCompletedViewStateCopy {
  readonly body: string;
}

export function selectAdobeSignCompletedViewStateCopy(
  status: MyWorkReadModelSourceStatus | undefined,
): AdobeSignCompletedViewStateCopy {
  if (status === 'partial') {
    return {
      body: 'Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.',
    };
  }

  if (status === 'available') {
    return {
      body: 'No completed Adobe Sign agreements were found in the last 30 days.',
    };
  }

  return {
    body: 'Recently completed Adobe Sign agreements are temporarily unavailable.',
  };
}

/**
 * Projects raw queue items (from either the home projection's `previewItems`
 * or a focused-queue envelope's `items`) into the view-model. `sourceOpenUrl`
 * is mapped through verbatim from the read-model.
 */
export function selectAdobeAgreementListVmFromItems(
  items: readonly MyWorkAdobeSignActionQueueItem[] | undefined,
  hasMore = false,
): AdobeAgreementListVm {
  if (!items) {
    return { items: [], isEmpty: true, hasMore: false };
  }
  const mapped = items.map<AdobeAgreementListItem>((it) => ({
    itemId: it.itemId,
    agreementId: it.agreementId,
    agreementName: it.agreementName,
    requiredAction: it.requiredAction,
    requiredActionLabel: requiredActionLabel(it.requiredAction),
    actionHandoff: it.actionHandoff,
    senderLabel: it.sender?.displayName ?? null,
    receivedAtLabel: it.createdAtUtc
      ? `Received ${formatGeneratedAtUtc(it.createdAtUtc)}`
      : it.modifiedAtUtc
        ? `Updated ${formatGeneratedAtUtc(it.modifiedAtUtc)}`
        : null,
    expiresLabel: it.expirationAtUtc ? formatGeneratedAtUtc(it.expirationAtUtc) : null,
    sourceOpenUrl: it.sourceOpenUrl,
  }));
  return {
    items: mapped,
    isEmpty: mapped.length === 0,
    hasMore,
  };
}

// ─── Adobe Sign state copy (consolidated card badge + body) ───────────────

export interface AdobeSignActionQueueStateCopy {
  /** Locked badge label (e.g. `Ready`, `Connect required`, `Loading`). */
  readonly badge: string;
  /** Primary body copy. Empty string when the state suppresses body copy in favor of metrics + item list. */
  readonly body: string;
  /** Optional secondary line (currently used only for `principal-unresolved`). */
  readonly secondaryBody?: string;
  /** CTA button label when present. */
  readonly ctaLabel?: string;
  /** Whether the Connect CTA renders. False unless `sourceStatus === 'authorization-required'` AND `hasOnConnect`. */
  readonly ctaVisible: boolean;
}

/**
 * Closed-set copy table for the consolidated Adobe Sign Action Queue card.
 * Mirrors `docs/05-Target-Module-State-Matrices.md` + `docs/06-Target-Copy-Library.md`
 * verbatim. Source-status only — the `available-empty` vs `available-items`
 * display distinction and the `loading` / backend `error` states are
 * resolved inside `AdobeSignActionQueueCard` (the selector does not know
 * the item count or readiness variant).
 */
export function selectAdobeSignActionQueueStateCopy(
  status: MyWorkReadModelSourceStatus | undefined,
  hasOnConnect: boolean,
): AdobeSignActionQueueStateCopy {
  switch (status) {
    case 'available':
      return { badge: 'Ready', body: '', ctaVisible: false };
    case 'partial':
      return {
        badge: 'Partial data',
        body: 'Some queue details may be incomplete. Showing the latest available Adobe Sign results.',
        ctaVisible: false,
      };
    case 'authorization-required':
      return {
        badge: 'Connect required',
        body: 'Connect Adobe Sign to load agreements that need your review, signature, approval, or other action.',
        ctaLabel: 'Connect Adobe Sign',
        ctaVisible: hasOnConnect,
      };
    case 'configuration-required':
      return {
        badge: 'Configuration required',
        body: 'Adobe Sign must be configured before your action queue can load.',
        ctaVisible: false,
      };
    case 'principal-unresolved':
      return {
        badge: 'Account needs attention',
        body: 'Your HB account could not be matched to an Adobe Sign user for this queue.',
        secondaryBody: 'Contact an administrator if this persists.',
        ctaVisible: false,
      };
    case 'source-unavailable':
      return {
        badge: 'Temporarily unavailable',
        body: 'Adobe Sign is temporarily unavailable. Your queue will resume once the source is reachable.',
        ctaVisible: false,
      };
    case 'backend-unavailable':
      return {
        badge: 'Temporarily unavailable',
        body: 'The My Dashboard service is not responding right now. Try again shortly.',
        ctaVisible: false,
      };
    default:
      // Defensive: unknown / missing status — treat as backend-unavailable so the user
      // sees a truthful "service down" message rather than a silent empty card.
      return {
        badge: 'Temporarily unavailable',
        body: 'The My Dashboard service is not responding right now. Try again shortly.',
        ctaVisible: false,
      };
  }
}

/** Zero-item ready-state body copy (selector cannot see item count). */
export const ADOBE_SIGN_ACTION_QUEUE_READY_EMPTY_BODY =
  'No Adobe Sign agreements currently need your action.';

/** Loading-state body copy. */
export const ADOBE_SIGN_ACTION_QUEUE_LOADING_BODY = 'Loading your Adobe Sign queue…';
