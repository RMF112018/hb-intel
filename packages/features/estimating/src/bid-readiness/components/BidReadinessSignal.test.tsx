import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mapHealthIndicatorStateToBidReadinessView, mapPursuitToHealthIndicatorItem } from '../adapters/index.js';
import { BidReadinessSignal } from './index.js';

function createViewState() {
  const healthState = mapPursuitToHealthIndicatorItem({
    pursuitId: 'p-2001',
    costSectionsPopulated: true,
    bidBondConfirmed: false,
    addendaAcknowledged: true,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: true,
    ceSignOff: false,
  });

  return mapHealthIndicatorStateToBidReadinessView(healthState);
}

describe('BidReadinessSignal', () => {
  it('renders coordinated signal labels and readiness status in essential mode', () => {
    const state = createViewState();

    render(<BidReadinessSignal state={state} complexity="Essential" dataState="success" />);

    expect(screen.getByTestId('signal-submission-eligibility')).toHaveTextContent('Submission Eligibility');
    expect(screen.getByTestId('signal-bid-readiness-score')).toHaveTextContent('Bid Readiness Score');
    expect(screen.getByTestId('signal-estimate-confidence')).toHaveTextContent('Estimate Confidence');
    expect(screen.queryByTestId('signal-summary')).not.toBeInTheDocument();
  });

  it('renders standard/expert details and supports dashboard callback', () => {
    const state = createViewState();
    const onOpenDashboard = vi.fn();

    render(
      <BidReadinessSignal
        state={state}
        complexity="Expert"
        dataState="success"
        onOpenDashboard={onOpenDashboard}
      />,
    );

    expect(screen.getByTestId('signal-summary')).toBeInTheDocument();
    expect(screen.getByTestId('signal-diagnostics')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('signal-open-dashboard'));
    expect(onOpenDashboard).toHaveBeenCalledTimes(1);
  });

  it('supports deterministic loading/error/empty states without invalid UI', () => {
    const { rerender } = render(<BidReadinessSignal state={null} complexity="Standard" dataState="loading" />);
    expect(screen.getByText('Loading bid readiness signal...')).toBeInTheDocument();

    rerender(<BidReadinessSignal state={null} complexity="Standard" dataState="error" />);
    expect(screen.getByText('Unable to load bid readiness signal.')).toBeInTheDocument();

    rerender(<BidReadinessSignal state={null} complexity="Standard" dataState="empty" />);
    expect(screen.getByText('No bid readiness signal is available.')).toBeInTheDocument();
  });

  it('renders degraded copy when degraded state has fallback snapshot', () => {
    const state = createViewState();

    render(<BidReadinessSignal state={state} complexity="Standard" dataState="degraded" />);

    expect(screen.getByTestId('bid-readiness-signal-degraded-copy')).toHaveTextContent('degraded');
    expect(screen.getByTestId('signal-bid-readiness-score')).toBeInTheDocument();
  });

  it('applies policy visibility filtering deterministically', () => {
    const state = createViewState();

    render(
      <BidReadinessSignal
        state={state}
        complexity="Standard"
        dataState="success"
        criterionVisibilityFilter={(criterion) => criterion.criterionId !== 'ce-sign-off'}
      />, 
    );

    const summary = screen.getByTestId('signal-summary').textContent ?? '';
    expect(summary).toContain('Visible criteria: 5');
  });
});
