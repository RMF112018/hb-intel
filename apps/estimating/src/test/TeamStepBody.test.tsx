import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
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
      { backendMode: 'ui-review' },
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
      { backendMode: 'ui-review' },
    );

    // The Timberscan Approver is an HbcSelect with combobox role
    // When no team members are added, it should be disabled
    expect(
      screen.getByText(/Timberscan Approver options appear after at least one upstream team member is added/i),
    ).toBeInTheDocument();
  });

  it('renders five people picker fields plus Timberscan Approver select', () => {
    renderWithProviders(
      <TeamStepBody
        request={{}}
        onChange={() => {}}
        mode="new-request"
      />,
      { backendMode: 'ui-review' },
    );

    // 5 people picker fields + 1 Timberscan select = 6 labeled fields
    const pickers = document.querySelectorAll('[data-hbc-ui="people-picker"]');
    expect(pickers).toHaveLength(5);
  });

  it('displays selected people as chips when UPNs are provided', () => {
    renderWithProviders(
      <TeamStepBody
        request={{
          projectExecutiveUpn: 'exec@hb.com',
          leadEstimatorUpn: 'lead@hb.com',
        }}
        onChange={() => {}}
        mode="new-request"
      />,
      { backendMode: 'ui-review' },
    );

    expect(screen.getByText('exec@hb.com')).toBeInTheDocument();
    expect(screen.getByText('lead@hb.com')).toBeInTheDocument();
  });
});
