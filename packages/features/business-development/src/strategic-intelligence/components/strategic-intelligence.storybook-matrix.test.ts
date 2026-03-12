import { describe, expect, it } from 'vitest';
import {
  ExplainabilitySurface,
  HeritagePanelStandard,
  LivingFeedExpert,
  RedactedFeedStandard,
  storybookMatrix,
} from './StrategicIntelligenceMatrix.stories.js';

describe('strategic intelligence storybook matrix', () => {
  it('covers required matrix dimensions', () => {
    expect(storybookMatrix.complexityModes).toEqual(['Essential', 'Standard', 'Expert']);
    expect(storybookMatrix.lifecycleStates).toContain('conflicted');
    expect(storybookMatrix.trustTiers).toEqual(['high', 'moderate', 'low', 'review-required']);
    expect(storybookMatrix.provenanceClasses).toContain('ai-assisted-draft');
    expect(storybookMatrix.visibilityStates).toContain('redacted');
    expect(storybookMatrix.suggestionVariants).toContain('Suggested Heritage');
    expect(storybookMatrix.suggestionVariants).toContain('Suggested Intelligence');
    expect(storybookMatrix.syncVariants).toContain('queued-to-sync');
  });

  it('exposes deterministic render stories', () => {
    expect(HeritagePanelStandard).toBeTypeOf('function');
    expect(LivingFeedExpert).toBeTypeOf('function');
    expect(RedactedFeedStandard).toBeTypeOf('function');
    expect(ExplainabilitySurface).toBeTypeOf('function');
  });
});
