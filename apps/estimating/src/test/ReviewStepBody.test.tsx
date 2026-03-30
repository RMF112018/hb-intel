import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { ReviewStepBody } from '../components/project-setup/ReviewStepBody.js';
import { createTestRequest } from './factories.js';
import { renderWithProviders } from './renderWithProviders.js';

describe('ReviewStepBody', () => {
  it('renders structured location fields and procore project value', () => {
    renderWithProviders(
      <ReviewStepBody
        request={createTestRequest({
          clientName: 'Client A',
          startDate: '2026-05-01',
          procoreProject: 'No',
          officeDivision: 'HB HQ General Commercial (01-43)',
          contractType: 'Design-Build (DB) Contract',
        })}
        mode="new-request"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
      />,
    );

    expect(screen.getByText(/Street Address:/)).toBeInTheDocument();
    expect(screen.getByText(/123 Blake Street/)).toBeInTheDocument();
    expect(screen.getByText(/City:/)).toBeInTheDocument();
    expect(screen.getAllByText(/Denver/)).toHaveLength(2);
    expect(screen.getByText(/County:/)).toBeInTheDocument();
    expect(screen.getByText(/State:/)).toBeInTheDocument();
    expect(screen.getByText(/Zip:/)).toBeInTheDocument();
    expect(screen.getByText(/Expected Project Start Date:/)).toBeInTheDocument();
    expect(screen.getByText(/2026-05-01/)).toBeInTheDocument();
    expect(screen.getByText(/Procore Project:/)).toBeInTheDocument();
    expect(screen.getByText(/^No$/)).toBeInTheDocument();
    expect(screen.getByText(/Office & Division:/)).toBeInTheDocument();
    expect(screen.getByText(/HB HQ General Commercial \(01-43\)/)).toBeInTheDocument();
    expect(screen.getByText(/Project Stage:/)).toBeInTheDocument();
    expect(screen.getByText(/Construction/)).toBeInTheDocument();
    expect(screen.getByText(/Contract Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Design-Build \(DB\) Contract/)).toBeInTheDocument();
  });
});
