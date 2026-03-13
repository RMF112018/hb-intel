import { describe, expect, it } from 'vitest';

import { storybookMatrix } from './PostBidLearningMatrix.stories.js';

describe('post-bid-learning storybook-matrix', () => {
  it('captures the intended wizard and summary-card state combinations', () => {
    expect(storybookMatrix.complexityModes).toEqual(['Essential', 'Standard', 'Expert']);
    expect(storybookMatrix.wizardStates).toContain('expert-diagnostics');
    expect(storybookMatrix.summaryStates).toContain('blocked-publication');
    expect(storybookMatrix.inlineAiStates).toContain('citation-required');
    expect(storybookMatrix.disagreementStates).toContain('escalated');
  });
});
