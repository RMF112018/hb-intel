import type { IPostBidAutopsyComponentContract } from '../types/index.js';

export const POST_BID_AUTOPSY_COMPONENT_CONTRACTS: readonly IPostBidAutopsyComponentContract[] =
  Object.freeze([
    {
      componentId: 'PostBidAutopsyWizard',
      ownership: 'primitive',
      role: 'contract',
    },
    {
      componentId: 'AutopsySummaryCard',
      ownership: 'primitive',
      role: 'headless',
    },
    {
      componentId: 'LearningInsightsDashboard',
      ownership: 'primitive',
      role: 'contract',
    },
  ]);

export const createPostBidAutopsyComponentContracts = () => POST_BID_AUTOPSY_COMPONENT_CONTRACTS;
