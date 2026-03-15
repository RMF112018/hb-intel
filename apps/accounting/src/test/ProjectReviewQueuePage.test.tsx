import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './renderWithProviders';
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

  // G4-T03-001: Verify HbcDataTable renders at standard tier with column headers.
  // Note: virtualized rows require DOM layout measurements unavailable in jsdom,
  // so we verify the table structure via column headers and data-hbc-ui attribute.
  it('renders HbcDataTable with defined columns at standard tier', () => {
    const requests = [
      createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'standard',
      requests,
    });

    // Table structure renders with column headers
    expect(document.querySelector('[data-hbc-ui="data-table"]')).toBeTruthy();
    expect(screen.getByText('Project Name')).toBeTruthy();
    expect(screen.getByText('Department')).toBeTruthy();
    expect(screen.getByText('State')).toBeTruthy();
    expect(screen.getByText('Submitted By')).toBeTruthy();
    expect(screen.getByText('Submitted')).toBeTruthy();
  });

  // G4-T03-002: Default filter shows UnderReview only.
  // Uses essential tier to exercise the <ul> fallback (no virtualization).
  it('default filter shows UnderReview requests only', () => {
    const requests = [
      createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
      createTestRequest({ requestId: 'req-2', projectName: 'Beta', state: 'NeedsClarification' }),
      createTestRequest({ requestId: 'req-3', projectName: 'Gamma', state: 'Failed' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'essential',
      requests,
    });

    // Only UnderReview should be visible by default (pending tab)
    expect(screen.getByText(/Alpha/)).toBeTruthy();
    expect(screen.queryByText(/Beta/)).toBeNull();
    expect(screen.queryByText(/Gamma/)).toBeNull();
  });

  // G4-T03-003: Tab switch filters content.
  // Uses essential tier for the <ul> list fallback.
  it('tab switch filters content to show matching state', () => {
    const requests = [
      createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
      createTestRequest({ requestId: 'req-3', projectName: 'Gamma', state: 'Failed' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'essential',
      requests,
    });

    // Default tab shows Alpha
    expect(screen.getByText(/Alpha/)).toBeTruthy();
    expect(screen.queryByText(/Gamma/)).toBeNull();

    // Click the "Failed / Needs Routing" tab
    const failedTab = screen.getByRole('tab', { name: 'Failed / Needs Routing' });
    fireEvent.click(failedTab);

    // Gamma visible, Alpha hidden
    expect(screen.getByText(/Gamma/)).toBeTruthy();
    expect(screen.queryByText(/Alpha/)).toBeNull();
  });

  // G4-T03-004: "Open" button navigates to detail route.
  // The handleOpen callback is wired via the data table column, but since
  // virtualization prevents row rendering in jsdom, we verify the navigate
  // function integration by calling it through the Link in the essential-tier
  // fallback list (which renders <a> tags with the correct route).
  it('"Open" link navigates to detail route via essential-tier list', () => {
    const requests = [
      createTestRequest({ requestId: 'req-42', projectName: 'Delta', state: 'UnderReview' }),
    ];
    mockClient.listRequests.mockResolvedValue(requests);

    renderWithProviders(<ProjectReviewQueuePage />, {
      tier: 'essential',
      requests,
    });

    // The essential-tier <ul> renders links with href to the detail route
    const link = screen.getByText(/Delta/);
    expect(link.closest('a')).toBeTruthy();
    expect(link.closest('a')?.getAttribute('href')).toBe('/project-review/$requestId');
  });

  // ── Failure modes (W0-G4-T07) ──────────────────────────────────────────
  describe('failure modes', () => {
    // G4-T07-003: Queue table fits at 768px
    it('queue page renders without error (768px layout is CSS — manual per R3)', () => {
      const requests = [
        createTestRequest({ requestId: 'req-1', projectName: 'Alpha', state: 'UnderReview' }),
      ];
      mockClient.listRequests.mockResolvedValue(requests);

      renderWithProviders(<ProjectReviewQueuePage />, {
        tier: 'essential',
        requests,
      });

      expect(screen.getByText(/Alpha/)).toBeTruthy();
      // jsdom cannot test CSS layout; this confirms the component tree is valid.
    });
  });
});
