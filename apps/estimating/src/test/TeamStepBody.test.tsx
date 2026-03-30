import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { normalizeProjectSetupRequestFields } from '@hbc/features-estimating';
import { TeamStepBody } from '../components/project-setup/TeamStepBody.js';
import { renderWithProviders } from './renderWithProviders.js';

function expectBefore(first: HTMLElement, second: HTMLElement): void {
  expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
}

describe('TeamStepBody', () => {
  it('renders the requested Step 3 fields in the revised order', () => {
    renderWithProviders(
      <TeamStepBody
        request={{}}
        onChange={() => {}}
        mode="new-request"
      />,
    );

    const projectExecutive = screen.getByText(/^Project Executive$/);
    const projectManager = screen.getByText(/^Project Manager$/);
    const leadEstimator = screen.getByText(/^Lead Estimator$/);
    const supportingEstimators = screen.getByText(/^Supporting Estimators$/);
    const additionalTeamMembers = screen.getByText(/^Additional Team Members$/);
    const timberscanApprover = screen.getByText(/^Timberscan Approver$/);

    expectBefore(projectExecutive, projectManager);
    expectBefore(projectManager, leadEstimator);
    expectBefore(leadEstimator, supportingEstimators);
    expectBefore(supportingEstimators, additionalTeamMembers);
    expectBefore(additionalTeamMembers, timberscanApprover);
  });

  it('shows Timberscan Approver as disabled until upstream people are added', () => {
    renderWithProviders(
      <TeamStepBody
        request={{}}
        onChange={() => {}}
        mode="new-request"
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Timberscan Approver' })).toBeDisabled();
    expect(
      screen.getByText(/Timberscan Approver options appear after at least one upstream team member is added/i),
    ).toBeInTheDocument();
  });

  it('deduplicates Timberscan Approver options from overlapping team selections', () => {
    renderWithProviders(
      <TeamStepBody
        request={{
          projectExecutiveUpn: 'exec@hb.com',
          projectManagerUpn: 'pm@hb.com',
          leadEstimatorUpn: 'lead@hb.com',
          supportingEstimatorUpns: ['pm@hb.com', 'support@hb.com'],
          additionalTeamMemberUpns: ['lead@hb.com', 'team@hb.com'],
        }}
        onChange={() => {}}
        mode="new-request"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Timberscan Approver' }));

    expect(screen.getAllByRole('option', { name: 'pm@hb.com' })).toHaveLength(1);
    expect(screen.getAllByRole('option', { name: 'lead@hb.com' })).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'exec@hb.com' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'support@hb.com' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'team@hb.com' })).toBeInTheDocument();
  });

  it('clears Timberscan Approver when upstream selections change and it becomes invalid', () => {
    function Harness() {
      const [request, setRequest] = useState<any>({
        projectExecutiveUpn: 'exec@hb.com',
        leadEstimatorUpn: 'lead@hb.com',
        timberscanApproverUpn: 'lead@hb.com',
      });

      return (
        <>
          <TeamStepBody
            request={request}
            onChange={(updates) =>
              setRequest((prev: any) => normalizeProjectSetupRequestFields({ ...prev, ...updates }))
            }
            mode="new-request"
          />
          <div data-testid="current-approver">{request.timberscanApproverUpn ?? ''}</div>
        </>
      );
    }

    renderWithProviders(<Harness />);

    expect(screen.getByTestId('current-approver')).toHaveTextContent('lead@hb.com');
    fireEvent.change(screen.getByRole('textbox', { name: 'Lead Estimator' }), { target: { value: '' } });
    expect(screen.getByTestId('current-approver')).toHaveTextContent('');
  });
});
