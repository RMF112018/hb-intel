import type { IPostBidAutopsy } from '@hbc/post-bid-autopsy';
import { createPostBidAutopsyRecordQueryKey } from '@hbc/post-bid-autopsy';

import {
  mapPostBidAutopsyToBusinessDevelopmentView,
  type IBusinessDevelopmentPostBidLearningView,
} from '../adapters/index.js';
import type { IBusinessDevelopmentPostBidLearningProfile } from '../profiles/index.js';

export interface IUseBusinessDevelopmentPostBidLearningInput {
  readonly autopsyId: string;
  readonly profile: IBusinessDevelopmentPostBidLearningProfile;
}

export interface IUseBusinessDevelopmentPostBidLearningResult {
  readonly state: IBusinessDevelopmentPostBidLearningView | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

export const createBusinessDevelopmentPostBidLearningQueryKey = (autopsyId: string) =>
  ['business-development', 'post-bid-learning', ...createPostBidAutopsyRecordQueryKey(autopsyId)] as const;

export const createBusinessDevelopmentPostBidLearningHookScaffold = (
  autopsyId: string,
  record: IPostBidAutopsy,
  profile: IBusinessDevelopmentPostBidLearningProfile
): IUseBusinessDevelopmentPostBidLearningResult => ({
  state: mapPostBidAutopsyToBusinessDevelopmentView(record, profile),
  loading: false,
  error: null,
  refresh: async () => undefined,
});
