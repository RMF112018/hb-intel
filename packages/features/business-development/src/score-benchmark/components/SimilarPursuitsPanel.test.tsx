import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimilarPursuitsPanel } from './SimilarPursuitsPanel.js';

describe('SimilarPursuitsPanel', () => {
  it('renders similarity strength framing and deep-link return path', () => {
    render(
      <SimilarPursuitsPanel
        pursuits={[{
          pursuitId: 'p-1',
          pursuitLabel: 'Pursuit One',
          similarity: 0.82,
          outcome: 'won',
          closedAt: new Date().toISOString(),
        }]}
        similarityBand="highly-similar"
        complexity="Expert"
        returnPath="/business-development/score-benchmark?sbPanel=similar-pursuits"
      />,
    );

    expect(screen.getByTestId('similar-pursuits-strength')).toHaveTextContent('highly similar');
    const link = screen.getByRole('link', { name: 'Pursuit One' });
    expect(link.getAttribute('href')).toContain('returnTo=');
  });

  it('renders essential badge for essential mode', () => {
    render(
      <SimilarPursuitsPanel
        pursuits={[]}
        similarityBand="loosely-similar"
        complexity="Essential"
        returnPath="/bd"
      />,
    );

    expect(screen.getByTestId('similar-pursuits-essential-copy')).toHaveTextContent('Benchmark context available');
  });
});
