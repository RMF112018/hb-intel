import type { ProjectSetupRequestState } from '@hbc/models';
import type { StatusVariant } from '@hbc/ui-kit';

export const STATE_BADGE_MAP: Record<ProjectSetupRequestState, StatusVariant> = {
  Submitted: 'pending',
  UnderReview: 'inProgress',
  NeedsClarification: 'warning',
  AwaitingExternalSetup: 'pending',
  ReadyToProvision: 'pending',
  Provisioning: 'inProgress',
  Completed: 'completed',
  Failed: 'error',
};

export function getStateBadgeVariant(state: ProjectSetupRequestState): StatusVariant {
  return STATE_BADGE_MAP[state] ?? 'neutral';
}

export const STATE_CONTEXT_TEXT: Record<ProjectSetupRequestState, string> = {
  Submitted: 'Your request has been submitted and is awaiting review by the Accounting team.',
  UnderReview: 'The Accounting team is reviewing your request. You will be notified if clarification is needed.',
  NeedsClarification: 'The reviewer has questions about your request. Please return to the setup form to provide the requested information.',
  AwaitingExternalSetup: 'Your request requires external IT or security setup before provisioning can proceed.',
  ReadyToProvision: 'Your request has been approved and is queued for site provisioning.',
  Provisioning: 'Your project site is being provisioned. This typically takes a few minutes.',
  Completed: 'Your project site has been provisioned and is ready to use.',
  Failed: 'Site provisioning encountered an error. An administrator has been notified.',
};

export function getStateContextText(state: ProjectSetupRequestState): string {
  return STATE_CONTEXT_TEXT[state] ?? 'Status unknown.';
}
