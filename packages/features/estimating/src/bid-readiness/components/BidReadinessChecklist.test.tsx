import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mapHealthIndicatorStateToBidReadinessView, mapPursuitToHealthIndicatorItem } from '../adapters/index.js';
import { BidReadinessChecklist } from './index.js';

function createViewState() {
  const state = mapPursuitToHealthIndicatorItem({
    pursuitId: 'p-checklist-ui',
    costSectionsPopulated: true,
    bidBondConfirmed: false,
    addendaAcknowledged: false,
    subcontractorCoverageMet: true,
    bidDocumentsAttached: true,
    ceSignOff: false,
  });
  return mapHealthIndicatorStateToBidReadinessView(state);
}

describe('BidReadinessChecklist', () => {
  it('renders checklist sections and completion indicator', () => {
    const viewState = createViewState();
    render(<BidReadinessChecklist viewState={viewState} complexity="Standard" dataState="success" />);

    expect(screen.getByTestId('checklist-completion-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-section-blockers')).toBeInTheDocument();
  });

  it('renders deterministic degraded/empty states', () => {
    const { rerender } = render(<BidReadinessChecklist viewState={null} complexity="Standard" dataState="empty" />);
    expect(screen.getByText('No checklist items are available.')).toBeInTheDocument();

    rerender(<BidReadinessChecklist viewState={null} complexity="Standard" dataState="loading" />);
    expect(screen.getByText('Loading bid readiness checklist...')).toBeInTheDocument();

    rerender(<BidReadinessChecklist viewState={null} complexity="Standard" dataState="error" />);
    expect(screen.getByText('Unable to load bid readiness checklist.')).toBeInTheDocument();

    rerender(<BidReadinessChecklist viewState={createViewState()} complexity="Standard" dataState="degraded" />);
    expect(screen.getByTestId('checklist-degraded-copy')).toBeInTheDocument();
  });

  it('renders blocker-only section in essential mode', () => {
    const viewState = createViewState();
    render(<BidReadinessChecklist viewState={viewState} complexity="Essential" dataState="success" />);

    expect(screen.getByTestId('checklist-section-blockers')).toBeInTheDocument();
    expect(screen.queryByTestId('checklist-section-incomplete')).not.toBeInTheDocument();
    expect(screen.queryByTestId('checklist-section-complete')).not.toBeInTheDocument();
  });

  it('supports default dataState derivation and recompute transition copy', () => {
    const viewState = createViewState();
    render(<BidReadinessChecklist viewState={viewState} complexity="Standard" />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(screen.getByTestId('checklist-recompute-required')).toHaveTextContent('pending');
  });

  it('applies criterion visibility filter and supports non-canonical state fallback copy', () => {
    const viewState = createViewState();

    const { rerender } = render(
      <BidReadinessChecklist
        viewState={viewState}
        complexity="Standard"
        dataState="success"
        criterionVisibilityFilter={(criterion) => criterion.criterionId !== 'ce-sign-off'}
      />,
    );

    expect(screen.getByTestId('bid-readiness-checklist')).toBeInTheDocument();

    rerender(
      <BidReadinessChecklist
        viewState={null}
        complexity="Standard"
        dataState={'unexpected-state' as unknown as 'loading'}
      />,
    );

    expect(screen.getByTestId('bid-readiness-checklist-state')).toBeInTheDocument();
  });
});
