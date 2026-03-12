import type { IHandoffReviewState } from '../src/types/index.js';
import { createHandoffReviewParticipant } from '../src/model/index.js';

const merge = <T extends object>(base: T, overrides?: Partial<T>): T => ({
  ...base,
  ...(overrides ?? {}),
});

export const createMockHandoffReviewState = (
  overrides?: Partial<IHandoffReviewState>
): IHandoffReviewState => {
  const participant = createHandoffReviewParticipant({
    participantId: 'participant-mock',
    displayName: 'Pat PM',
    role: 'Project Manager',
    acknowledgedAt: null,
  });

  return merge(
    {
      reviewId: 'handoff-review-mock',
      scorecardId: 'scorecard-mock',
      startedAt: '2026-03-12T00:00:00.000Z',
      startedBy: 'bd-lead',
      participants: [participant],
      completionStatus: 'in-progress',
      outstandingCommitmentIds: ['commitment-mock'],
      version: {
        snapshotId: 'handoff-review-version',
        version: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        createdBy: {
          userId: 'strategic-intelligence-system',
          displayName: 'Strategic Intelligence System',
          role: 'system',
        },
        changeSummary: 'Deterministic handoff review mock.',
        tag: 'draft',
      },
    },
    overrides
  );
};
