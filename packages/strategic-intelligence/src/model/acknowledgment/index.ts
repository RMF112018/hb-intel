import type { IHandoffReviewParticipant } from '../../types/index.js';

export const createHandoffReviewParticipant = (
  overrides?: Partial<IHandoffReviewParticipant>
): IHandoffReviewParticipant => ({
  participantId: 'participant-default',
  displayName: 'Participant',
  role: 'project-manager',
  acknowledgedAt: null,
  ...overrides,
});
