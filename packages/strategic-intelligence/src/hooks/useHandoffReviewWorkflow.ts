import { StrategicIntelligenceApi } from '../api/StrategicIntelligenceApi.js';
import type { IHandoffReviewState } from '../types/index.js';
import {
  unresolvedCommitmentEscalations,
  type IUnresolvedCommitmentEscalation,
} from './selectors.js';

const defaultApi = new StrategicIntelligenceApi();

export interface UseHandoffReviewWorkflowInput {
  projectId: string;
  actorUserId: string;
  scorecardId?: string;
}

export interface UseHandoffReviewWorkflowResult {
  review: IHandoffReviewState | null;
  snapshotAligned: boolean;
  completionGate: {
    isComplete: boolean;
    unresolvedCommitments: string[];
    unacknowledgedParticipantIds: string[];
  };
  escalation: {
    unresolvedCommitments: IUnresolvedCommitmentEscalation[];
  };
  actions: {
    acknowledgeParticipant: (
      participantId: string,
      acknowledgmentNote?: string
    ) => UseHandoffReviewWorkflowResult;
    markCompletion: (completionNotes?: string) => UseHandoffReviewWorkflowResult;
  };
}

const computeCompletionGate = (
  review: IHandoffReviewState | null,
  unresolvedCommitmentIds: string[]
) => {
  const unacknowledgedParticipantIds =
    review?.participants
      .filter((participant) => participant.acknowledgedAt === null)
      .map((participant) => participant.participantId) ?? [];

  return {
    isComplete: unresolvedCommitmentIds.length === 0 && unacknowledgedParticipantIds.length === 0,
    unresolvedCommitments: unresolvedCommitmentIds,
    unacknowledgedParticipantIds,
  };
};

export const useHandoffReviewWorkflow = (
  input: UseHandoffReviewWorkflowInput,
  deps?: {
    api?: StrategicIntelligenceApi;
    now?: () => Date;
  }
): UseHandoffReviewWorkflowResult => {
  const api = deps?.api ?? defaultApi;
  const now = deps?.now ?? (() => new Date());
  const scorecardId = input.scorecardId ?? input.projectId;
  const state = api.getState(scorecardId);
  const review = api.getHandoffReview(scorecardId);
  const escalation = unresolvedCommitmentEscalations(state);
  const unresolvedCommitmentIds = escalation.map((commitment) => commitment.commitmentId);
  const completionGate = computeCompletionGate(review, unresolvedCommitmentIds);

  return {
    review,
    snapshotAligned: Boolean(review && review.scorecardId === state.heritageSnapshot.scorecardId),
    completionGate,
    escalation: {
      unresolvedCommitments: escalation,
    },
    actions: {
      acknowledgeParticipant: (participantId, acknowledgmentNote) => {
        const existing = review?.participants.find((participant) => participant.participantId === participantId);
        if (existing?.acknowledgedAt) {
          return useHandoffReviewWorkflow(input, {
            api,
            now,
          });
        }

        api.persistAcknowledgment(
          scorecardId,
          participantId,
          now().toISOString(),
          acknowledgmentNote
        );

        return useHandoffReviewWorkflow(input, {
          api,
          now,
        });
      },
      markCompletion: (completionNotes) => {
        const currentReview = api.getHandoffReview(scorecardId);
        if (!currentReview) {
          return useHandoffReviewWorkflow(input, {
            api,
            now,
          });
        }

        const refreshedState = api.getState(scorecardId);
        const refreshedUnresolvedCommitments = unresolvedCommitmentEscalations(refreshedState).map(
          (commitment) => commitment.commitmentId
        );
        const nextCompletionGate = computeCompletionGate(
          currentReview,
          refreshedUnresolvedCommitments
        );

        api.persistReviewUpdate(scorecardId, {
          ...currentReview,
          completionStatus: nextCompletionGate.isComplete ? 'completed' : 'in-progress',
          completionNotes,
          outstandingCommitmentIds: nextCompletionGate.unresolvedCommitments,
        });

        return useHandoffReviewWorkflow(input, {
          api,
          now,
        });
      },
    },
  };
};
