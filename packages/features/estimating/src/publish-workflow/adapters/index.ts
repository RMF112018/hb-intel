/** Estimating publish adapter — SF25-T07. */
import type { IPublishModuleRegistration } from '@hbc/publish-workflow';

export const ESTIMATING_PUBLISH_MODULE_KEY = 'estimating';

export const estimatingPublishRegistration: IPublishModuleRegistration = {
  moduleKey: ESTIMATING_PUBLISH_MODULE_KEY,
  displayName: 'Estimating',
  defaultTargets: [{ targetId: 'sp-bids', targetType: 'sharepoint', label: 'SharePoint Bids Library', recipientScope: 'estimating-team' }],
  approvalRules: [],
  supportsSupersession: false,
  supportsRevocation: false,
};
