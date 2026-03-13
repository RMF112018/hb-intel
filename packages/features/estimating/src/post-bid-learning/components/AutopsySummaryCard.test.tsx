import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';

vi.mock('../hooks/index.js', () => ({
  useEstimatingPostBidLearning: () => ({
    state: {
      view: {
        row: {
          autopsyId: 'autopsy-1',
          pursuitId: 'pursuit-1',
          status: 'approved',
          outcome: 'lost',
          confidenceTier: 'moderate',
          evidenceCount: 2,
        },
        summary: {
          autopsyId: 'autopsy-1',
          profileId: 'estimating-post-bid-learning',
          status: 'approved',
          confidenceScore: 0.81,
          reviewDecisionCount: 2,
          disagreementCount: 1,
        },
        evidenceReferences: [
          {
            evidenceId: 'e-1',
            type: 'cost-artifact',
            sourceRef: 'Estimate revision 7',
            reliabilityHint: 'primary',
          },
        ],
        benchmarkRecommendation: {
          autopsyId: 'autopsy-1',
          publishable: true,
          blockerCount: 0,
          rootCauseCodes: ['pricing-discipline'],
          minimumConfidenceTier: 'moderate',
        },
      },
    },
    loading: false,
    error: null,
  }),
}));

import { AutopsySummaryCard } from './AutopsySummaryCard.js';

describe('AutopsySummaryCard', () => {
  it('renders estimating summary, evidence marker, links, and impact hints', () => {
    render(
      <HbcThemeProvider>
        <AutopsySummaryCard
          pursuitId="pursuit-1"
          relatedFindingLinks={[{ linkId: 'finding-1', label: 'Related finding', href: '/related' }]}
          seededIntelligenceLinks={[{ linkId: 'intel-1', label: 'Seeded intelligence', href: '/intelligence' }]}
          impactPreview={{
            title: 'Impact',
            summary: 'Preview',
            benchmarkHint: 'Benchmark ready',
            intelligenceHint: 'Seed ready',
          }}
        />
      </HbcThemeProvider>,
    );

    expect(screen.getByText('AutopsySummaryCard')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('Confidence moderate')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getAllByText('pricing-discipline')).toHaveLength(2);
    expect(screen.getByText('1 disagreement require review.')).toBeInTheDocument();
    expect(screen.getByText('Evidence marker: 1 source / cost-artifact')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Related finding: Related finding' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Seeded intelligence: Seeded intelligence' })).toBeInTheDocument();
    expect(screen.getByText('Benchmark ready')).toBeInTheDocument();
    expect(screen.getByText('Seed ready')).toBeInTheDocument();
  });
});
