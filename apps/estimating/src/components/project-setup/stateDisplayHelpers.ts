import type { ProjectSetupRequestState } from '@hbc/models';
import type { StatusVariant } from '@hbc/ui-kit';
import { STATE_BADGE_VARIANTS as _STATE_BADGE_VARIANTS, getStateBadgeVariant as _getStateBadgeVariant } from '@hbc/provisioning';

// W0-G4-T06: Centralized badge variant mapping from @hbc/provisioning.
// Narrow string → StatusVariant at the consumer boundary (Rule R6: provisioning is headless).
export const STATE_BADGE_MAP = _STATE_BADGE_VARIANTS as unknown as Record<ProjectSetupRequestState, StatusVariant>;

export function getStateBadgeVariant(state: ProjectSetupRequestState): StatusVariant {
  return _getStateBadgeVariant(state) as StatusVariant;
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
