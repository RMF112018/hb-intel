import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';

vi.mock('../hooks/index.js', () => ({
  useBusinessDevelopmentPostBidLearning: () => ({
    state: {
      view: {
        row: {
          autopsyId: 'autopsy-1',
          pursuitId: 'pursuit-1',
          scorecardId: 'scorecard-1',
          status: 'published',
          outcome: 'lost',
          confidenceTier: 'moderate',
          publicationReady: true,
          blockerCount: 0,
        },
        summary: {
          autopsyId: 'autopsy-1',
          profileId: 'bd-post-bid-learning',
          status: 'published',
          evidenceCount: 2,
          rootCauseLabels: ['Pricing discipline'],
          reviewDecisionCount: 2,
          sensitivityVisibility: 'project-scoped',
        },
        evidenceReferences: [
          {
            evidenceId: 'e-1',
            type: 'cost-artifact',
            sourceRef: 'Estimate revision 7',
            sensitivity: 'restricted-project',
          },
        ],
        benchmarkEnrichment: {
          autopsyId: 'autopsy-1',
          publishable: true,
          minimumConfidenceTier: 'moderate',
          blockerCount: 0,
          rootCauseCodes: ['pricing-discipline'],
        },
      },
    },
    loading: false,
    error: null,
  }),
}));

import { AutopsySummaryCard } from './AutopsySummaryCard.js';

describe('AutopsySummaryCard', () => {
  it('renders outcome, trust, evidence markers, deep links, and downstream chips', () => {
    render(
      <HbcThemeProvider>
        <AutopsySummaryCard
          pursuitId="pursuit-1"
          relatedFindingLinks={[{ linkId: 'finding-1', label: 'Related finding', href: '/related' }]}
          seededIntelligenceLinks={[{ linkId: 'intel-1', label: 'Seeded intelligence', href: '/intelligence' }]}
          impactPreview={{
            title: 'Impact',
            summary: 'Preview',
            benchmarkHint: 'Benchmark update ready',
            intelligenceHint: 'Intelligence seed ready',
          }}
        />
      </HbcThemeProvider>,
    );

    expect(screen.getByText('AutopsySummaryCard')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('Confidence moderate')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Pricing discipline')).toBeInTheDocument();
    expect(screen.getByText('Root cause emphasized: Pricing discipline')).toBeInTheDocument();
    expect(screen.getByText('Evidence marker: 1 source / cost-artifact')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Related finding: Related finding' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Seeded intelligence: Seeded intelligence' })).toBeInTheDocument();
    expect(screen.getByText('Benchmark update ready')).toBeInTheDocument();
    expect(screen.getByText('Intelligence seed ready')).toBeInTheDocument();
  });
});
