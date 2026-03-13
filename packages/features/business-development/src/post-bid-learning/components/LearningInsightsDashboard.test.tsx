import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';
import {
  PostBidAutopsyApi,
  resetPostBidAutopsyStateStore,
  setPostBidAutopsyApi,
} from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyRecordSnapshot,
  createMockPostBidAutopsyRecord,
} from '@hbc/post-bid-autopsy/testing';

import { LearningInsightsDashboard } from './LearningInsightsDashboard.js';

const renderWithTheme = (node: React.ReactElement) =>
  render(<HbcThemeProvider>{node}</HbcThemeProvider>);

const seedInsightsApi = () => {
  const api = new PostBidAutopsyApi();

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-1',
        pursuitId: 'pursuit-1',
        status: 'published',
        publicationGate: {
          publishable: true,
          blockers: [],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        rootCauseTags: [{ tagId: 'r1', domain: 'pricing', label: 'Pricing discipline', normalizedCode: 'pricing-discipline' }],
        telemetry: {
          autopsyCompletionLatency: 3,
          repeatErrorReductionRate: 0.3,
          intelligenceSeedingConversionRate: 0.5,
          benchmarkAccuracyLift: 0.4,
          corroborationRate: 0.8,
          staleIntelligenceRate: 0,
          revalidationLatency: 0,
          reinsertionAdoptionRate: 0.6,
          autopsyCes: 0.7,
        },
      }),
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-2',
        pursuitId: 'pursuit-2',
        status: 'review',
        publicationGate: {
          publishable: false,
          blockers: ['needs-corroboration'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        rootCauseTags: [{ tagId: 'r2', domain: 'client', label: 'Client timing', normalizedCode: 'client-timing' }],
        telemetry: {
          autopsyCompletionLatency: 5,
          repeatErrorReductionRate: 0.1,
          intelligenceSeedingConversionRate: 0.2,
          benchmarkAccuracyLift: 0.1,
          corroborationRate: 0.4,
          staleIntelligenceRate: 0.2,
          revalidationLatency: 2,
          reinsertionAdoptionRate: 0.1,
          autopsyCes: 0.5,
        },
      }),
    })
  );

  setPostBidAutopsyApi('bd-insights', api);
};

describe('LearningInsightsDashboard', () => {
  beforeEach(() => {
    resetPostBidAutopsyStateStore();
    seedInsightsApi();
  });

  it('renders KPI cards, trend views, repeat patterns, reinsertion, stale backlog, and expert comparator controls', async () => {
    renderWithTheme(
      <LearningInsightsDashboard
        apiScope="bd-insights"
        complexityTier="Expert"
        pursuitMetadata={[
          { pursuitId: 'pursuit-1', pursuitName: 'Ready Pursuit', projectType: 'Healthcare' },
          { pursuitId: 'pursuit-2', pursuitName: 'Review Pursuit', projectType: 'Commercial' },
        ]}
      />,
    );

    expect(screen.getByText('LearningInsightsDashboard')).toBeInTheDocument();
    expect(screen.getByText('Ready to Publish')).toBeInTheDocument();
    expect(screen.getByText('Needs Corroboration')).toBeInTheDocument();
    expect(screen.getByText('Repeat patterns')).toBeInTheDocument();
    expect(screen.getByText('Pricing discipline: 1')).toBeInTheDocument();
    expect(screen.getByText('Reinsertion opportunities')).toBeInTheDocument();
    expect(screen.getByText(/Stale and revalidation backlog remains visible/i)).toBeInTheDocument();
    expect(screen.getByText('Expert comparator')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Open backlog drill-in/i }));
    await waitFor(() => {
      expect(screen.getByText('Backlog and reinsertion drill-in')).toBeInTheDocument();
    });
  });
});
