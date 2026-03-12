import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mapHealthIndicatorStateToBidReadinessView, mapPursuitToHealthIndicatorItem } from '../adapters/index.js';
import { BidReadinessDashboard } from './index.js';

function createViewState() {
  const healthState = mapPursuitToHealthIndicatorItem({
    pursuitId: 'p-3001',
    costSectionsPopulated: false,
    bidBondConfirmed: true,
    addendaAcknowledged: false,
    subcontractorCoverageMet: true,
    bidDocumentsAttached: false,
    ceSignOff: false,
    dueAt: '2030-01-01T00:00:00.000Z',
  });

  return mapHealthIndicatorStateToBidReadinessView(healthState);
}

describe('BidReadinessDashboard', () => {
  it('renders coordinated signal cards and completeness/recommendations', () => {
    const state = createViewState();

    render(<BidReadinessDashboard state={state} complexity="Standard" dataState="success" />);

    expect(screen.getByTestId('dashboard-submission-eligibility')).toHaveTextContent('Submission Eligibility');
    expect(screen.getByTestId('dashboard-bid-readiness-score')).toHaveTextContent('Bid Readiness Score');
    expect(screen.getByTestId('dashboard-estimate-confidence')).toHaveTextContent('Estimate Confidence');
    expect(screen.getByTestId('dashboard-completeness')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-recommendations')).toBeInTheDocument();
  });

  it('preserves deterministic blocker-first ordering in criteria list', () => {
    const state = createViewState();

    render(<BidReadinessDashboard state={state} complexity="Expert" dataState="success" />);

    const criteriaList = screen.getByTestId('dashboard-criteria-list');
    const criteriaItems = Array.from(criteriaList.querySelectorAll('li')).map((node) => node.textContent ?? '');
    const firstNonBlockerIndex = criteriaItems.findIndex((item) => item.includes(' · non-blocker · '));
    const blockerAfterNonBlocker = criteriaItems.findIndex(
      (item, index) => index > firstNonBlockerIndex && item.includes(' · blocker · '),
    );

    if (firstNonBlockerIndex >= 0) {
      expect(blockerAfterNonBlocker).toBe(-1);
    }

    expect(screen.getByTestId('dashboard-diagnostics')).toBeInTheDocument();
  });

  it('renders deterministic loading/error/empty states', () => {
    const { rerender } = render(<BidReadinessDashboard state={null} complexity="Standard" dataState="loading" />);
    expect(screen.getByText('Loading bid readiness dashboard...')).toBeInTheDocument();

    rerender(<BidReadinessDashboard state={null} complexity="Standard" dataState="error" />);
    expect(screen.getByText('Unable to load bid readiness dashboard.')).toBeInTheDocument();

    rerender(<BidReadinessDashboard state={null} complexity="Standard" dataState="empty" />);
    expect(screen.getByText('No bid readiness dashboard data is available.')).toBeInTheDocument();
  });

  it('renders degraded fallback copy for stale/partial dashboard data', () => {
    const state = createViewState();

    render(<BidReadinessDashboard state={state} complexity="Standard" dataState="degraded" />);

    expect(screen.getByTestId('dashboard-degraded-copy')).toHaveTextContent('degraded');
    expect(screen.getByTestId('dashboard-status-headline')).toBeInTheDocument();
  });

  it('supports policy filters and deterministic empty-section fallback', () => {
    const state = createViewState();

    render(
      <BidReadinessDashboard
        state={state}
        complexity="Standard"
        dataState="success"
        criterionVisibilityFilter={() => false}
        recommendationVisibilityFilter={() => false}
      />,
    );

    expect(screen.getByTestId('dashboard-no-visible-criteria')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-no-recommendations')).toBeInTheDocument();
  });
});
