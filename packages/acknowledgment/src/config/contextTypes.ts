/**
 * ACK_CONTEXT_TYPES — Authoritative registry of acknowledgment context identifiers.
 *
 * IMPORTANT: All values in this registry must be unique kebab-case strings.
 * These values are stored verbatim in the HbcAcknowledgmentEvents SharePoint list
 * and in audit logs. Changing a value after production data exists will split
 * the audit trail for that context type.
 *
 * To add a new context type:
 * 1. Add a new key/value pair to this object.
 * 2. Open a PR to @hbc/acknowledgment with a brief description of the use case.
 * 3. Import ACK_CONTEXT_TYPES in your module config — never use raw strings.
 */
export const ACK_CONTEXT_TYPES = {
  /** Project Hub — PMP section approval (parallel multi-party) */
  PROJECT_HUB_PMP: 'project-hub-pmp',
  /** Project Hub — Turnover Meeting sign-off (sequential multi-party) */
  PROJECT_HUB_TURNOVER: 'project-hub-turnover',
  /** Project Hub — Monthly Review step completion (single-party) */
  PROJECT_HUB_MONTHLY_REVIEW: 'project-hub-monthly-review',
  /** Business Development — Go/No-Go scorecard approval (single-party) */
  BD_SCORECARD: 'bd-scorecard',
  /** Estimating — Bid document receipt confirmation (single-party) */
  ESTIMATING_BID_RECEIPT: 'estimating-bid-receipt',
  /** Admin — Provisioning task sign-off (single-party) */
  ADMIN_PROVISIONING: 'admin-provisioning',
  /** @hbc/workflow-handoff — Handoff receipt acknowledgment (single-party) */
  WORKFLOW_HANDOFF: 'workflow-handoff',
} as const;

/** Union type of all registered context type values. */
export type AckContextType = (typeof ACK_CONTEXT_TYPES)[keyof typeof ACK_CONTEXT_TYPES];
