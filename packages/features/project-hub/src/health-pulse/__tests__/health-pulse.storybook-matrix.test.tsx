import { describe, expect, it } from 'vitest';

import { storybookMatrix } from '../components/ProjectHealthPulseMatrix.stories.js';

describe('health pulse storybook-matrix', () => {
  it('covers required status/confidence/complexity combinations', () => {
    expect(storybookMatrix.statusByConfidenceByComplexity).toEqual(
      expect.arrayContaining([
        'on-track/high/essential',
        'watch/moderate/standard',
        'at-risk/low/expert',
        'critical/moderate/expert',
        'data-pending/unreliable/standard',
      ])
    );
  });

  it('covers explainability, compound risk, governance/suppression, and triage variants', () => {
    expect(storybookMatrix.explainabilityVariants).toEqual(
      expect.arrayContaining(['why', 'changed', 'contributors', 'matters-most'])
    );
    expect(storybookMatrix.compoundRiskVariants).toEqual(
      expect.arrayContaining(['none', 'moderate', 'critical'])
    );
    expect(storybookMatrix.governanceSuppressionVariants).toEqual(
      expect.arrayContaining(['manual-influence-heavy', 'office-suppression-active'])
    );
    expect(storybookMatrix.triageVariants).toEqual(
      expect.arrayContaining(['attention-now', 'trending-down', 'data-quality-risk', 'recovering'])
    );
  });
});
