/**
 * My Work — Adobe Sign Action Queue contracts.
 *
 * Type-only DTO vocabulary for the focused Adobe Sign action queue
 * surface inside the My Dashboard My Work shell. Defines the
 * actionable Adobe recipient statuses, the six normalized required
 * actions, the status-to-action mapping, and the queue item / summary
 * / pagination / freshness / focused-read-model shapes.
 *
 * Contract-only: no fetch, OAuth, or provider logic lives here. The
 * Adobe Sign data-plane client is owned by B04 Prompt 04 (backend) and
 * B04 Prompt 03 (frontend read-model client seam).
 *
 * @module myWork/AdobeSignActionQueue
 */

export const ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES = [
  'WAITING_FOR_MY_SIGNATURE',
  'WAITING_FOR_MY_APPROVAL',
  'WAITING_FOR_MY_ACCEPTANCE',
  'WAITING_FOR_MY_ACKNOWLEDGEMENT',
  'WAITING_FOR_MY_FORM_FILLING',
  'WAITING_FOR_MY_DELEGATION',
] as const;

export type AdobeSignActionableRecipientStatus =
  (typeof ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES)[number];

export const MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS = [
  'signature',
  'approval',
  'acceptance',
  'acknowledgement',
  'form-filling',
  'delegation',
] as const;

export type MyWorkAdobeSignRequiredAction = (typeof MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS)[number];

export const ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION: Readonly<
  Record<AdobeSignActionableRecipientStatus, MyWorkAdobeSignRequiredAction>
> = {
  WAITING_FOR_MY_SIGNATURE: 'signature',
  WAITING_FOR_MY_APPROVAL: 'approval',
  WAITING_FOR_MY_ACCEPTANCE: 'acceptance',
  WAITING_FOR_MY_ACKNOWLEDGEMENT: 'acknowledgement',
  WAITING_FOR_MY_FORM_FILLING: 'form-filling',
  WAITING_FOR_MY_DELEGATION: 'delegation',
};

export interface MyWorkAdobeSignSenderSummary {
  readonly displayName?: string;
  readonly emailAddress?: string;
}

export interface MyWorkAdobeSignActionQueueItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly requiredAction: MyWorkAdobeSignRequiredAction;
  readonly adobeRecipientStatus: AdobeSignActionableRecipientStatus;
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  /**
   * Optional, backend-derived, policy-approved row-level launch URL for
   * the Adobe Sign agreement view. Present **only** when a backend
   * candidate URL passed the canonical HB/PCC URL-policy doctrine
   * (`evaluateExternalUrlPolicy` in `@hbc/models/pcc`); omitted
   * otherwise. SPFx surfaces MUST NOT synthesize an Adobe URL: row
   * CTAs (e.g. "Open in Adobe Sign") render only when this field is
   * present, and absence MUST NOT render a broken button or link.
   * Signing-endpoint URLs are not eligible — this carries an agreement
   * view URL only.
   */
  readonly sourceOpenUrl?: string;
}

export interface MyWorkAdobeSignActionQueueSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly totalActionItemCount: number;
  readonly signatureCount: number;
  readonly approvalCount: number;
  readonly acceptanceCount: number;
  readonly acknowledgementCount: number;
  readonly formFillingCount: number;
  readonly delegationCount: number;
  readonly expiringSoonCount: number;
}

export interface MyWorkAdobeSignActionQueueQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}

export interface MyWorkAdobeSignActionQueuePagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

export type MyWorkFreshnessState = 'fresh' | 'stale' | 'unknown';

export interface MyWorkAdobeSignActionQueueFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}

export interface MyWorkAdobeSignActionQueueReadModel {
  readonly moduleId: 'adobe-sign-action-queue';
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly items: readonly MyWorkAdobeSignActionQueueItem[];
  readonly pagination: MyWorkAdobeSignActionQueuePagination;
  readonly freshness: MyWorkAdobeSignActionQueueFreshness;
}
