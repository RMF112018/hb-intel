import type { ProjectSetupRequestState } from '@hbc/models';
import type { StatusVariant } from '@hbc/ui-kit';

/**
 * W0-G4-T03: State-to-badge-variant mapping for controller queue and review surfaces.
 */
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
