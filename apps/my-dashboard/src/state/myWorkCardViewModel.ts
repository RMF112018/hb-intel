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
  MyWorkAdobeSignActionQueueReadModel,
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

// ─── Work summary (home) ──────────────────────────────────────────────────

export interface WorkSummaryVm {
  readonly actionItemCount: number | null;
  readonly connectedSourcesLabel: string;
  readonly lastRefreshedLabel: string;
}

const WORK_SUMMARY_FALLBACK: WorkSummaryVm = {
  actionItemCount: null,
  connectedSourcesLabel: 'Adobe Sign',
  lastRefreshedLabel: PENDING_REFRESH_FALLBACK,
};

export function selectWorkSummaryVm(
  env: MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined,
): WorkSummaryVm {
  if (!env) return WORK_SUMMARY_FALLBACK;
  return {
    actionItemCount: env.data.summary.totalActionItemCount,
    connectedSourcesLabel: 'Adobe Sign',
    lastRefreshedLabel: formatGeneratedAtUtc(env.generatedAtUtc),
  };
}

// ─── Source readiness (home non-ready) ────────────────────────────────────

export interface SourceReadinessVmItem {
  readonly sourceSystem: 'adobe-sign';
  readonly label: string;
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly statusCopy: SourceStatusCopy;
}

export interface SourceReadinessVm {
  readonly items: readonly SourceReadinessVmItem[];
}

const SOURCE_LABEL_BY_SYSTEM: Readonly<Record<'adobe-sign', string>> = {
  'adobe-sign': 'Adobe Sign',
};

export function selectSourceReadinessVm(
  env: MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined,
): SourceReadinessVm {
  if (!env) return { items: [] };
  const items = env.data.sourceReadiness.map((item) => ({
    sourceSystem: item.sourceSystem,
    label: SOURCE_LABEL_BY_SYSTEM[item.sourceSystem],
    sourceStatus: item.sourceStatus,
    statusCopy: sourceStatusCopy(item.sourceStatus),
  }));
  return { items };
}

// ─── Adobe Sign action queue — home card ──────────────────────────────────

export interface AdobeQueueHomeVm {
  readonly pendingAgreementsCount: number | null;
  readonly awaitingActionCount: number | null;
  readonly lastRefreshedLabel: string;
}

const ADOBE_QUEUE_HOME_FALLBACK: AdobeQueueHomeVm = {
  pendingAgreementsCount: null,
  awaitingActionCount: null,
  lastRefreshedLabel: PENDING_REFRESH_FALLBACK,
};

export function selectAdobeQueueHomeVm(
  env: MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined,
): AdobeQueueHomeVm {
  if (!env) return ADOBE_QUEUE_HOME_FALLBACK;
  const total = env.data.adobeSignActionQueue.summary.totalActionItemCount;
  return {
    pendingAgreementsCount: total,
    awaitingActionCount: total,
    lastRefreshedLabel: formatGeneratedAtUtc(env.generatedAtUtc),
  };
}

// ─── Adobe Sign queue state (used in both non-ready surfaces) ─────────────

export interface AdobeQueueStateVm {
  readonly sourceStatus: MyWorkReadModelSourceStatus | undefined;
  readonly stateLabel: string;
  readonly guidance: string;
}

function selectAdobeReadinessStatusFromHome(
  env: MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined,
): MyWorkReadModelSourceStatus | undefined {
  if (!env) return undefined;
  const item = env.data.sourceReadiness.find((it) => it.sourceSystem === 'adobe-sign');
  return item?.sourceStatus;
}

export function selectAdobeQueueStateVmFromHome(
  env: MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined,
  fallbackStatus: MyWorkReadModelSourceStatus | undefined,
): AdobeQueueStateVm {
  const status = selectAdobeReadinessStatusFromHome(env) ?? fallbackStatus;
  const copy = sourceStatusCopy(status);
  return { sourceStatus: status, stateLabel: copy.stateLabel, guidance: copy.guidance };
}

export function selectAdobeQueueStateVmFromQueue(
  env: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> | undefined,
  fallbackStatus: MyWorkReadModelSourceStatus | undefined,
): AdobeQueueStateVm {
  const status = env?.sourceStatus ?? fallbackStatus;
  const copy = sourceStatusCopy(status);
  return { sourceStatus: status, stateLabel: copy.stateLabel, guidance: copy.guidance };
}

// ─── Adobe Sign queue summary (focused module ready) ──────────────────────

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

export function selectAdobeQueueSummaryVm(
  env: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> | undefined,
): AdobeQueueSummaryVm {
  if (!env) return ADOBE_QUEUE_SUMMARY_FALLBACK;
  const s = env.data.summary;
  return {
    pendingAgreementsCount: s.totalActionItemCount,
    signatureActionsCount: s.signatureCount,
    reviewActionsCount: s.approvalCount + s.acceptanceCount + s.acknowledgementCount,
    lastRefreshedLabel: formatGeneratedAtUtc(env.generatedAtUtc),
  };
}

// ─── Adobe Sign agreement list (focused module ready) ─────────────────────

export interface AdobeAgreementListItem {
  readonly itemId: string;
  readonly agreementName: string;
  readonly requiredAction: MyWorkAdobeSignRequiredAction;
  readonly requiredActionLabel: string;
  readonly senderLabel: string | null;
  readonly expiresLabel: string | null;
}

export interface AdobeAgreementListVm {
  readonly items: readonly AdobeAgreementListItem[];
  readonly isEmpty: boolean;
  readonly hasMore: boolean;
}

const ADOBE_AGREEMENT_LIST_FALLBACK: AdobeAgreementListVm = {
  items: [],
  isEmpty: true,
  hasMore: false,
};

export function selectAdobeAgreementListVm(
  env: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> | undefined,
): AdobeAgreementListVm {
  if (!env) return ADOBE_AGREEMENT_LIST_FALLBACK;
  const items = env.data.items.map<AdobeAgreementListItem>((it) => ({
    itemId: it.itemId,
    agreementName: it.agreementName,
    requiredAction: it.requiredAction,
    requiredActionLabel: requiredActionLabel(it.requiredAction),
    senderLabel: it.sender?.displayName ?? null,
    expiresLabel: it.expirationAtUtc ? formatGeneratedAtUtc(it.expirationAtUtc) : null,
  }));
  return {
    items,
    isEmpty: items.length === 0,
    hasMore: env.data.pagination.hasMore,
  };
}

// ─── Adobe Sign connection guidance (focused module non-ready) ────────────

export interface ConnectionGuidanceVm {
  readonly sourceStatus: MyWorkReadModelSourceStatus | undefined;
  readonly headline: string;
  readonly guidance: string;
  readonly ctaVisible: boolean;
}

export function selectConnectionGuidanceVm(
  status: MyWorkReadModelSourceStatus | undefined,
): ConnectionGuidanceVm {
  const copy = sourceStatusCopy(status);
  return {
    sourceStatus: status,
    headline: copy.stateLabel,
    guidance: copy.guidance,
    ctaVisible: copy.ctaApplicable,
  };
}
