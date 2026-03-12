import React from 'react';
import { render, screen } from '@testing-library/react';
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

    rerender(<BidReadinessChecklist viewState={createViewState()} complexity="Standard" dataState="degraded" />);
    expect(screen.getByTestId('checklist-degraded-copy')).toBeInTheDocument();
  });
});
