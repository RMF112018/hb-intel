import { describe, expect, it } from 'vitest';

import { storybookMatrix } from './PostBidLearningMatrix.stories.js';

describe('post-bid-learning storybook-matrix', () => {
  it('captures the intended wizard, list, summary-card, and dashboard state combinations', () => {
    expect(storybookMatrix.complexityModes).toEqual(['Essential', 'Standard', 'Expert']);
    expect(storybookMatrix.wizardStates).toContain('expert-diagnostics');
    expect(storybookMatrix.summaryStates).toContain('blocked-publication');
    expect(storybookMatrix.listStates).toContain('stale-superseded-conflict');
    expect(storybookMatrix.dashboardStates).toContain('expert-comparator');
    expect(storybookMatrix.inlineAiStates).toContain('citation-required');
    expect(storybookMatrix.disagreementStates).toContain('escalated');
  });
});
