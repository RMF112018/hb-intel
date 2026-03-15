import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createTestSession } from './renderWithProviders';
import { createTestRequest } from './factories';
import { ProjectReviewQueuePage } from '../pages/ProjectReviewQueuePage';

// ── Module-level mocks ──────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockClient = {
  listRequests: vi.fn().mockResolvedValue([]),
  getProvisioningStatus: vi.fn().mockResolvedValue(null),
  submitRequest: vi.fn().mockResolvedValue({ requestId: 'req-new' }),
  advanceState: vi.fn().mockResolvedValue(undefined),
  retryProvisioning: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/provisioning')>();
  return { ...actual, createProvisioningApiClient: vi.fn(() => mockClient) };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// ── Test suite ──────────────────────────────────────────────────────────────

describe('ProjectReviewQueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.listRequests.mockResolvedValue([]);
  });

  // G4-T03-001
  it('renders HbcDataTable with defined columns at standard tier', async () => {
    const requests = [
      createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'standard',
      requests,
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeTruthy();
    });

    // Verify column headers render
    expect(screen.getByText('Project Name')).toBeTruthy();
    expect(screen.getByText('Department')).toBeTruthy();
    expect(screen.getByText('State')).toBeTruthy();
    expect(screen.getByText('Submitted By')).toBeTruthy();
    expect(screen.getByText('Submitted')).toBeTruthy();
  });

  // G4-T03-002
  it('default filter shows UnderReview requests only', async () => {
    const requests = [
      createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
      createTestRequest({ requestId: 'req-2', projectName: 'Beta', state: 'NeedsClarification' }),
      createTestRequest({ requestId: 'req-3', projectName: 'Gamma', state: 'Failed' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'standard',
      requests,
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeTruthy();
    });

    // Only UnderReview should be visible by default (pending tab)
    expect(screen.queryByText('Beta')).toBeNull();
    expect(screen.queryByText('Gamma')).toBeNull();
  });

  // G4-T03-003
  it('tab switch filters content to show matching state', async () => {
    const requests = [
      createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
      createTestRequest({ requestId: 'req-3', projectName: 'Gamma', state: 'Failed' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'standard',
      requests,
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeTruthy();
    });

    // Click the "Failed / Needs Routing" tab
    const failedTab = screen.getByRole('tab', { name: 'Failed / Needs Routing' });
    fireEvent.click(failedTab);

    await waitFor(() => {
      expect(screen.getByText('Gamma')).toBeTruthy();
    });
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  // G4-T03-004
  it('"Open" button navigates to detail route', async () => {
    const requests = [
      createTestRequest({ requestId: 'req-42', projectName: 'Delta', state: 'UnderReview' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'standard',
      requests,
    });

    await waitFor(() => {
      expect(screen.getByText('Delta')).toBeTruthy();
    });

    const openButton = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(openButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/project-review/$requestId',
        params: { requestId: 'req-42' },
      }),
    );
  });
});
