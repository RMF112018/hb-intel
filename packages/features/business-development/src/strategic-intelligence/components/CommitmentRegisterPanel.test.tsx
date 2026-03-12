import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { CommitmentRegisterPanel } from './CommitmentRegisterPanel.js';

describe('CommitmentRegisterPanel', () => {
  it('renders concise essential summary', () => {
    const state = createMockStrategicIntelligenceState('commitment-panel-test-1');

    render(
      <CommitmentRegisterPanel
        commitments={state.commitmentRegister}
        complexity="Essential"
      />
    );

    expect(screen.getByTestId('commitment-register-panel')).toHaveTextContent('Commitments: 1');
  });

  it('renders unresolved escalation linkage and expert fulfillment status updates', () => {
    const state = createMockStrategicIntelligenceState('commitment-panel-test-2');
    state.commitmentRegister = [
      {
        ...state.commitmentRegister[0],
        commitmentId: 'commitment-risk',
        description: 'Maintain weekly executive touchpoint.',
        fulfillmentStatus: 'open',
        bicRecordId: 'bic-commitment-1',
      },
    ];

    const onUpdateFulfillmentStatus = vi.fn();

    render(
      <CommitmentRegisterPanel
        commitments={state.commitmentRegister}
        complexity="Expert"
        onUpdateFulfillmentStatus={onUpdateFulfillmentStatus}
      />
    );

    expect(screen.getByText('Status: open (at risk)')).toBeInTheDocument();
    expect(screen.getByTestId('commitment-bic-commitment-risk')).toHaveTextContent('bic-commitment-1');

    fireEvent.change(
      screen.getByLabelText('Update fulfillment status for commitment-risk'),
      { target: { value: 'fulfilled' } }
    );

    expect(onUpdateFulfillmentStatus).toHaveBeenCalledWith('commitment-risk', 'fulfilled');
  });

  it('renders standard mode without expert update controls and handles non-risk commitments', () => {
    const state = createMockStrategicIntelligenceState('commitment-panel-test-3');
    state.commitmentRegister = [
      {
        ...state.commitmentRegister[0],
        commitmentId: 'commitment-safe',
        fulfillmentStatus: 'fulfilled',
      },
    ];

    render(<CommitmentRegisterPanel commitments={state.commitmentRegister} complexity="Standard" />);

    expect(screen.getByText('Status: fulfilled')).toBeInTheDocument();
    expect(screen.queryByText(/at risk/)).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Update fulfillment status for commitment-safe')
    ).not.toBeInTheDocument();
  });
});
