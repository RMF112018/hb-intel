import { describe, expect, it } from 'vitest';

import {
  POST_BID_AUTOPSY_COMPONENT_CONTRACTS,
  createPostBidAutopsyComponentContracts,
} from './components/index.js';

describe('post-bid autopsy components', () => {
  it('keeps the wizard, list, summary, and insights contracts visible at the primitive boundary', () => {
    expect(createPostBidAutopsyComponentContracts()).toEqual(POST_BID_AUTOPSY_COMPONENT_CONTRACTS);
    expect(POST_BID_AUTOPSY_COMPONENT_CONTRACTS.map((contract) => contract.componentId)).toEqual([
      'PostBidAutopsyWizard',
      'AutopsySummaryCard',
      'AutopsyListView',
      'LearningInsightsDashboard',
    ]);
  });
});
