/**
 * Wave 7 / Prompt 06 — Document Control reviews & approvals messaging.
 *
 * Local, surface-scoped product-safe label/tone resolver for review-type
 * and review-state ids published by the document-control read model.
 * Lives inside the Documents surface (not in `@hbc/models`) so wave-
 * specific UI copy stays surface-local. Pure — no React, no runtime
 * side effects, no live workflow calls.
 *
 * Raw enum ids remain available as machine markers on the reviews card;
 * this module supplies only the visible product-safe text.
 */

import type {
  DocumentControlReviewState,
  DocumentControlReviewType,
} from '@hbc/models/pcc';

export type ReviewStateTone = 'info' | 'warning' | 'error';

export interface IReviewStateMessage {
  readonly label: string;
  readonly tone: ReviewStateTone;
}

const REVIEW_TYPE_LABELS: Readonly<Record<DocumentControlReviewType, string>> = {
  'chief-estimator-review': 'Chief Estimator Review',
  'legal-review': 'Legal Review',
  'compliance-review': 'Compliance Review',
  'leadership-review': 'Leadership Review',
  'project-execution-review': 'Project Execution Review',
};

const REVIEW_STATE_MESSAGES: Readonly<Record<DocumentControlReviewState, IReviewStateMessage>> = {
  'not-required': { label: 'Not required', tone: 'info' },
  pending: { label: 'Pending', tone: 'warning' },
  'in-review': { label: 'In review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'info' },
  rejected: { label: 'Rejected', tone: 'error' },
  waived: { label: 'Waived', tone: 'info' },
};

export function resolveReviewTypeLabel(typeId: DocumentControlReviewType): string {
  return REVIEW_TYPE_LABELS[typeId];
}

export function resolveReviewStateMessage(
  stateId: DocumentControlReviewState,
): IReviewStateMessage {
  return REVIEW_STATE_MESSAGES[stateId];
}
