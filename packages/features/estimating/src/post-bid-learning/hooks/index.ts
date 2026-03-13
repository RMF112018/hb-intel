import { useMemo } from 'react';
import {
  createPostBidAutopsyStateQueryKey,
  usePostBidAutopsyQueue,
  usePostBidAutopsyReview,
  usePostBidAutopsyState,
} from '@hbc/post-bid-autopsy';

import {
  mapPostBidAutopsyToEstimatingView,
  type IEstimatingPostBidLearningView,
} from '../adapters/index.js';
import type { IEstimatingPostBidLearningProfile } from '../profiles/index.js';

export interface IUseEstimatingPostBidLearningInput {
  readonly pursuitId: string;
  readonly profile: IEstimatingPostBidLearningProfile;
}

export interface IEstimatingTrustIndicator {
  readonly confidenceTier: string | null;
  readonly blockerCount: number;
  readonly evidenceComplete: boolean;
}

export interface IEstimatingTriageAction {
  readonly actionId: string;
  readonly label: string;
  readonly route: string;
  readonly urgency: 'normal' | 'high';
}

export interface IEstimatingAvatarOwnership {
  readonly primaryOwner: string | null;
  readonly escalationOwner: string | null;
}

export interface IEstimatingMyWorkPlacement {
  readonly bucket: 'my-work' | 'review-queue' | 'published-learning';
  readonly route: string | null;
}

export interface IEstimatingPostBidLearningHookState {
  readonly view: IEstimatingPostBidLearningView | null;
  readonly trustIndicator: IEstimatingTrustIndicator;
  readonly triageActions: readonly IEstimatingTriageAction[];
  readonly avatarOwnership: IEstimatingAvatarOwnership;
  readonly myWorkPlacement: IEstimatingMyWorkPlacement;
  readonly route: string | null;
}

export interface IUseEstimatingPostBidLearningResult {
  readonly state: IEstimatingPostBidLearningHookState;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

const EMPTY_STATE: IEstimatingPostBidLearningHookState = {
  view: null,
  trustIndicator: {
    confidenceTier: null,
    blockerCount: 0,
    evidenceComplete: false,
  },
  triageActions: [],
  avatarOwnership: {
    primaryOwner: null,
    escalationOwner: null,
  },
  myWorkPlacement: {
    bucket: 'my-work',
    route: null,
  },
  route: null,
};

export const createEstimatingPostBidLearningQueryKey = (pursuitId: string) =>
  ['estimating', 'post-bid-learning', ...createPostBidAutopsyStateQueryKey(pursuitId)] as const;

export const useEstimatingPostBidLearning = (
  input: IUseEstimatingPostBidLearningInput
): IUseEstimatingPostBidLearningResult => {
  const state = usePostBidAutopsyState({ pursuitId: input.pursuitId });
  const review = usePostBidAutopsyReview({ pursuitId: input.pursuitId });
  const queue = usePostBidAutopsyQueue({ pursuitId: input.pursuitId });

  const projectedState = useMemo<IEstimatingPostBidLearningHookState>(() => {
    const autopsy = state.state.autopsy;
    if (!autopsy) {
      return EMPTY_STATE;
    }

    const view = mapPostBidAutopsyToEstimatingView(autopsy, input.profile);
    const route = `/estimating/post-bid-learning/${autopsy.pursuitId}`;
    const lastEscalation = review.state.escalationEvents.at(-1);
    const triageActions: IEstimatingTriageAction[] = [];

    if (!state.completeness.evidenceComplete) {
      triageActions.push({
        actionId: 'add-evidence',
        label: 'Add evidence',
        route: `${route}/sections`,
        urgency: 'high',
      });
    }

    if (review.triage.hasOpenDisagreements) {
      triageActions.push({
        actionId: 'review-disagreements',
        label: 'Review disagreements',
        route: `${route}/review`,
        urgency: 'high',
      });
    }

    if (queue.state.optimisticStatusLabel) {
      triageActions.push({
        actionId: 'check-sync',
        label: queue.state.optimisticStatusLabel,
        route: `${route}/queue`,
        urgency: 'normal',
      });
    }

    return {
      view,
      trustIndicator: {
        confidenceTier: autopsy.confidence.tier,
        blockerCount: state.publicationBlockers.blockers.length,
        evidenceComplete: state.completeness.evidenceComplete,
      },
      triageActions,
      avatarOwnership: {
        primaryOwner: review.state.reviewDecisions.at(-1)?.reviewer ?? null,
        escalationOwner: lastEscalation?.target.displayName ?? null,
      },
      myWorkPlacement: {
        bucket: autopsy.status === 'published' ? 'published-learning' : review.triage.hasOpenDisagreements ? 'review-queue' : 'my-work',
        route,
      },
      route,
    };
  }, [input.profile, queue.state.optimisticStatusLabel, review.state.escalationEvents, review.state.reviewDecisions, review.triage.hasOpenDisagreements, state.completeness.evidenceComplete, state.publicationBlockers.blockers.length, state.state.autopsy]);

  return {
    state: projectedState,
    loading: state.loading || review.loading || queue.loading,
    error: state.error ?? review.error ?? queue.error,
    refresh: async () => {
      await Promise.all([state.refresh(), review.refresh(), queue.refresh()]);
    },
  };
};
