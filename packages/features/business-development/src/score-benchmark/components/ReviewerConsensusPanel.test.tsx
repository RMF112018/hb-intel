import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReviewerConsensusPanel } from './ReviewerConsensusPanel.js';

describe('ReviewerConsensusPanel', () => {
  it('renders consensus strength, disagreement detail, role comparisons, and escalation callout', () => {
    render(
      <ReviewerConsensusPanel
        consensus={{
          variance: 0.33,
          consensusStrength: 0.44,
          largestDisagreements: [{ criterionId: 'c1', spread: 0.6 }],
          roleComparisons: [
            { role: 'business-development', avgScore: 0.4 },
            { role: 'estimating', avgScore: 0.5 },
          ],
          escalationRecommended: true,
        }}
        complexity="Expert"
      />,
    );

    expect(screen.getByTestId('reviewer-consensus-variance')).toHaveTextContent('0.33');
    expect(screen.getByTestId('reviewer-consensus-role-comparisons')).toBeInTheDocument();
    expect(screen.getByTestId('reviewer-consensus-escalation-callout')).toBeInTheDocument();
  });
});
