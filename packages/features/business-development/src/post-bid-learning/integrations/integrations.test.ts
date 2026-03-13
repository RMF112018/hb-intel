import { describe, expect, it } from 'vitest';

import {
  createBusinessDevelopmentPostBidLearningReferenceIntegrations,
  projectBusinessDevelopmentAutopsyRoutes,
} from './index.js';
import { createMockAutopsyRecordSnapshot, createMockPublishableAutopsyRecordSnapshot } from '@hbc/post-bid-autopsy/testing';

describe('business development post-bid-learning integrations', () => {
  it('projects routes and preserves primitive gating decisions', () => {
    const publishable = createMockPublishableAutopsyRecordSnapshot();
    const blocked = createMockAutopsyRecordSnapshot();
    const integrations = createBusinessDevelopmentPostBidLearningReferenceIntegrations();

    expect(projectBusinessDevelopmentAutopsyRoutes(publishable).detailRoute).toContain('/business-development/post-bid-learning/');
    expect(integrations.resolveNotifications(publishable).some((item) => item.type === 'publication-reminder')).toBe(true);
    expect(integrations.resolveNotifications(blocked).some((item) => item.type === 'publication-reminder')).toBe(false);
  });
});
