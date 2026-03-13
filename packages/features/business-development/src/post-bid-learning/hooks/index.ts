import { useMemo } from 'react';
import {
  createPostBidAutopsyStateQueryKey,
  usePostBidAutopsyQueue,
  usePostBidAutopsyReview,
  usePostBidAutopsyState,
} from '@hbc/post-bid-autopsy';

import {
  mapPostBidAutopsyToBusinessDevelopmentView,
  type IBusinessDevelopmentPostBidLearningView,
} from '../adapters/index.js';
import type { IBusinessDevelopmentPostBidLearningProfile } from '../profiles/index.js';

export interface IUseBusinessDevelopmentPostBidLearningInput {
  readonly pursuitId: string;
  readonly profile: IBusinessDevelopmentPostBidLearningProfile;
}

export interface IBusinessDevelopmentTrustIndicator {
  readonly confidenceTier: string | null;
  readonly reasonCount: number;
  readonly publicationReady: boolean;
}

export interface IBusinessDevelopmentTriageAction {
  readonly actionId: string;
  readonly label: string;
  readonly route: string;
  readonly urgency: 'normal' | 'high';
}

export interface IBusinessDevelopmentAvatarOwnership {
  readonly primaryOwner: string | null;
  readonly coOwners: readonly string[];
}

export interface IBusinessDevelopmentMyWorkPlacement {
  readonly bucket: 'my-work' | 'review-queue' | 'published-learning';
  readonly route: string | null;
}

export interface IBusinessDevelopmentPostBidLearningHookState {
  readonly view: IBusinessDevelopmentPostBidLearningView | null;
  readonly trustIndicator: IBusinessDevelopmentTrustIndicator;
  readonly triageActions: readonly IBusinessDevelopmentTriageAction[];
  readonly avatarOwnership: IBusinessDevelopmentAvatarOwnership;
  readonly myWorkPlacement: IBusinessDevelopmentMyWorkPlacement;
  readonly route: string | null;
}

export interface IUseBusinessDevelopmentPostBidLearningResult {
  readonly state: IBusinessDevelopmentPostBidLearningHookState;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

const EMPTY_STATE: IBusinessDevelopmentPostBidLearningHookState = {
  view: null,
  trustIndicator: {
    confidenceTier: null,
    reasonCount: 0,
    publicationReady: false,
  },
  triageActions: [],
  avatarOwnership: {
    primaryOwner: null,
    coOwners: [],
  },
  myWorkPlacement: {
    bucket: 'my-work',
    route: null,
  },
  route: null,
};

export const createBusinessDevelopmentPostBidLearningQueryKey = (pursuitId: string) =>
  ['business-development', 'post-bid-learning', ...createPostBidAutopsyStateQueryKey(pursuitId)] as const;

export const useBusinessDevelopmentPostBidLearning = (
  input: IUseBusinessDevelopmentPostBidLearningInput
): IUseBusinessDevelopmentPostBidLearningResult => {
  const state = usePostBidAutopsyState({ pursuitId: input.pursuitId });
  const review = usePostBidAutopsyReview({ pursuitId: input.pursuitId });
  const queue = usePostBidAutopsyQueue({ pursuitId: input.pursuitId });

  const projectedState = useMemo<IBusinessDevelopmentPostBidLearningHookState>(() => {
    const autopsy = state.state.autopsy;
    if (!autopsy) {
      return EMPTY_STATE;
    }

    const view = mapPostBidAutopsyToBusinessDevelopmentView(autopsy, input.profile);
    const route = `/business-development/post-bid-learning/${autopsy.pursuitId}`;
    const triageActions: IBusinessDevelopmentTriageAction[] = [];

    if (review.triage.hasOpenDisagreements) {
      triageActions.push({
        actionId: 'resolve-disagreements',
        label: 'Resolve disagreements',
        route: `${route}/review`,
        urgency: 'high',
      });
    }

    if (queue.state.optimisticStatusLabel) {
      triageActions.push({
        actionId: 'monitor-sync',
        label: queue.state.optimisticStatusLabel,
        route: `${route}/queue`,
        urgency: 'normal',
      });
    }

    if (state.publicationBlockers.blockers.length > 0) {
      triageActions.push({
        actionId: 'clear-publication-blockers',
        label: 'Clear publication blockers',
        route: `${route}/review`,
        urgency: 'high',
      });
    }

    const lastReview = review.state.reviewDecisions.at(-1);

    return {
      view,
      trustIndicator: {
        confidenceTier: autopsy.confidence.tier,
        reasonCount: autopsy.confidence.reasons.length,
        publicationReady: state.publicationBlockers.publishable,
      },
      triageActions,
      avatarOwnership: {
        primaryOwner: lastReview?.reviewer ?? null,
        coOwners: review.state.disagreements.flatMap((item) => item.participants),
      },
      myWorkPlacement: {
        bucket: autopsy.status === 'published' ? 'published-learning' : review.triage.hasOpenDisagreements ? 'review-queue' : 'my-work',
        route,
      },
      route,
    };
  }, [input.profile, input.pursuitId, queue.state.optimisticStatusLabel, review.state.disagreements, review.state.reviewDecisions, review.triage.hasOpenDisagreements, state.publicationBlockers.blockers.length, state.publicationBlockers.publishable, state.state.autopsy]);

  return {
    state: projectedState,
    loading: state.loading || review.loading || queue.loading,
    error: state.error ?? review.error ?? queue.error,
    refresh: async () => {
      await Promise.all([state.refresh(), review.refresh(), queue.refresh()]);
    },
  };
};
