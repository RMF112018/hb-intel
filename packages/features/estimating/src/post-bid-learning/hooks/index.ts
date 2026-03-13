import type { IPostBidAutopsy } from '@hbc/post-bid-autopsy';
import { createPostBidAutopsyRecordQueryKey } from '@hbc/post-bid-autopsy';

import {
  mapPostBidAutopsyToEstimatingView,
  type IEstimatingPostBidLearningView,
} from '../adapters/index.js';
import type { IEstimatingPostBidLearningProfile } from '../profiles/index.js';

export interface IUseEstimatingPostBidLearningInput {
  readonly autopsyId: string;
  readonly profile: IEstimatingPostBidLearningProfile;
}

export interface IUseEstimatingPostBidLearningResult {
  readonly state: IEstimatingPostBidLearningView | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

export const createEstimatingPostBidLearningQueryKey = (autopsyId: string) =>
  ['estimating', 'post-bid-learning', ...createPostBidAutopsyRecordQueryKey(autopsyId)] as const;

export const createEstimatingPostBidLearningHookScaffold = (
  autopsyId: string,
  record: IPostBidAutopsy,
  profile: IEstimatingPostBidLearningProfile
): IUseEstimatingPostBidLearningResult => ({
  state: mapPostBidAutopsyToEstimatingView(record, profile),
  loading: false,
  error: null,
  refresh: async () => undefined,
});
