import { describe, expect, it } from 'vitest';

import {
  createEstimatingPostBidLearningReferenceIntegrations,
  projectEstimatingAutopsyRoutes,
} from './index.js';
import { createMockAutopsyRecordSnapshot, createMockDisagreementAutopsyRecordSnapshot } from '@hbc/post-bid-autopsy/testing';

describe('estimating post-bid-learning integrations', () => {
  it('projects estimating routes and preserves primitive reminder gating', () => {
    const disagreement = createMockDisagreementAutopsyRecordSnapshot();
    const blocked = createMockAutopsyRecordSnapshot();
    const integrations = createEstimatingPostBidLearningReferenceIntegrations();

    expect(projectEstimatingAutopsyRoutes(disagreement).reviewRoute).toContain('/estimating/post-bid-learning/');
    expect(integrations.resolveNotifications(disagreement).some((item) => item.type === 'disagreement-escalation')).toBe(true);
    expect(integrations.resolveNotifications(blocked).some((item) => item.type === 'publication-reminder')).toBe(false);
  });
});
