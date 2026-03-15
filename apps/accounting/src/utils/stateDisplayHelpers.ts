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
  Submitted: 'This request has been submitted and is awaiting review.',
  UnderReview: 'This request is under review by the controller.',
  NeedsClarification: 'Clarification has been requested from the requester.',
  AwaitingExternalSetup: 'This request is on hold pending external IT or security setup.',
  ReadyToProvision: 'This request has been approved and is queued for site provisioning.',
  Provisioning: 'The project site is being provisioned.',
  Completed: 'The project site has been provisioned and is ready to use.',
  Failed: 'Site provisioning encountered an error. Route to Admin for resolution.',
};

export function getStateContextText(state: ProjectSetupRequestState): string {
  return STATE_CONTEXT_TEXT[state] ?? 'Status unknown.';
}
