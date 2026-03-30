import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { ReviewStepBody } from '../components/project-setup/ReviewStepBody.js';
import { createTestRequest } from './factories.js';
import { renderWithProviders } from './renderWithProviders.js';

describe('ReviewStepBody', () => {
  it('renders review cards with structured label/value display', () => {
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

    // Section headings present
    expect(screen.getByText('Project Information')).toBeInTheDocument();
    expect(screen.getByText('Department & Type')).toBeInTheDocument();
    expect(screen.getByText('Project Team')).toBeInTheDocument();

    // Project info values via HbcDescriptionList
    expect(screen.getByText('Street Address')).toBeInTheDocument();
    expect(screen.getByText('123 Blake Street')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('2026-05-01')).toBeInTheDocument();

    // Department & type values
    expect(screen.getByText('HB HQ General Commercial (01-43)')).toBeInTheDocument();
    expect(screen.getByText('Design-Build (DB) Contract')).toBeInTheDocument();

    // Team values
    expect(screen.getByText('exec@hb.com')).toBeInTheDocument();
    expect(screen.getByText('pm@hb.com')).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: 'Submit Project Setup Request' })).toBeInTheDocument();
  });
});
