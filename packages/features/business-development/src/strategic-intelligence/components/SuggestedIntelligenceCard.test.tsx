import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';
import { SuggestedIntelligenceCard } from './SuggestedIntelligenceCard.js';

describe('SuggestedIntelligenceCard', () => {
  it('renders suggestion metadata and wires accept/dismiss/defer/explainability actions', () => {
    const onOutcome = vi.fn();
    const onOpenExplainability = vi.fn();

    const suggestion = createSuggestedIntelligenceMatch({
      suggestionId: 'suggestion-card-1',
      reason: 'heritage context match',
      matchedDimensions: ['client', 'sector'],
      reuseHistoryCount: 4,
      matchScore: 0.82,
    });

    render(
      <SuggestedIntelligenceCard
        suggestion={suggestion}
        onOutcome={onOutcome}
        onOpenExplainability={onOpenExplainability}
      />
    );

    expect(screen.getByText('Suggested Heritage')).toBeInTheDocument();
    expect(screen.getByText(/Match score: 82%/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Accept suggested intelligence' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss suggested intelligence' }));
    fireEvent.click(screen.getByRole('button', { name: 'Defer suggested intelligence' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open suggestion explainability' }));

    expect(onOutcome).toHaveBeenNthCalledWith(1, 'suggestion-card-1', 'accepted');
    expect(onOutcome).toHaveBeenNthCalledWith(2, 'suggestion-card-1', 'dismissed');
    expect(onOutcome).toHaveBeenNthCalledWith(3, 'suggestion-card-1', 'deferred');
    expect(onOpenExplainability).toHaveBeenCalledWith('suggestion-card-1');
  });
});
