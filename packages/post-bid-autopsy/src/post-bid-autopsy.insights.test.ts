import { describe, expect, it } from 'vitest';

import {
  POST_BID_AUTOPSY_COMPONENT_CONTRACTS,
  createPostBidAutopsyComponentContracts,
} from './components/index.js';

describe('post-bid autopsy insights', () => {
  it('keeps the T06 list and dashboard contracts public at the primitive boundary', () => {
    const contractIds = createPostBidAutopsyComponentContracts().map((contract) => contract.componentId);

    expect(contractIds).toContain('AutopsyListView');
    expect(contractIds).toContain('LearningInsightsDashboard');
    expect(POST_BID_AUTOPSY_COMPONENT_CONTRACTS).toHaveLength(4);
  });
});
