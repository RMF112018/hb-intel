/**
 * W0-G4-T08 Phase 1: RequestDetailPage test suite (5 tests).
 * Tests core summary, state context, clarification banner, checklist, and not-found.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from './renderWithProviders.js';
import { createTestRequest, createTestProvisioningStatus } from './factories.js';
import { STATE_CONTEXT_TEXT } from '../components/project-setup/stateDisplayHelpers.js';
import type { ProjectSetupRequestState } from '@hbc/models';

// ---------------------------------------------------------------------------
// Shared mock state
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
const mockClient = {
  listRequests: vi.fn().mockResolvedValue([]),
  submitRequest: vi.fn().mockResolvedValue({ requestId: 'req-new' }),
  getProvisioningStatus: vi.fn().mockResolvedValue(null),
  retryProvisioning: vi.fn().mockResolvedValue(undefined),
  escalateProvisioning: vi.fn().mockResolvedValue(undefined),
};

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------
vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/provisioning')>();
  return {
    ...actual,
    createProvisioningApiClient: vi.fn(() => mockClient),
    useProvisioningSignalR: vi.fn(() => ({ isConnected: true })),
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ requestId: 'req-1' })),
    useNavigate: vi.fn(() => mockNavigate),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// Lazy imports after mocks
const { RequestDetailPage } = await import('../pages/RequestDetailPage.js');
const { createProvisioningApiClient, useProvisioningSignalR } = await import('@hbc/provisioning');
const { useParams, useNavigate } = await import('@tanstack/react-router');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderDetail(options: Parameters<typeof renderWithProviders>[1] = {}) {
  return renderWithProviders(<RequestDetailPage />, options);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('RequestDetailPage', () => {
  beforeEach(() => {
    // Restore mock implementations after vi.resetAllMocks() from setup.ts
    mockClient.listRequests.mockResolvedValue([]);
    mockClient.getProvisioningStatus.mockResolvedValue(null);
    vi.mocked(createProvisioningApiClient).mockReturnValue(mockClient as any);
    vi.mocked(useProvisioningSignalR).mockReturnValue({ isConnected: true } as any);
    vi.mocked(useParams).mockReturnValue({ requestId: 'req-1' } as any);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate as any);
  });

  // G4-T01-016
  it('renders core summary fields for a request', () => {
    const request = createTestRequest({ state: 'Submitted' });
    renderDetail({ requests: [request] });
    // Project name appears in breadcrumb + heading; verify at least one renders
    expect(screen.getAllByText('Test Project').length).toBeGreaterThanOrEqual(1);
  });

  // G4-T01-017
  it('renders state context text for each state', () => {
    const states: ProjectSetupRequestState[] = [
      'Submitted',
      'UnderReview',
      'NeedsClarification',
      'ReadyToProvision',
      'Provisioning',
      'Completed',
      'Failed',
    ];

    for (const state of states) {
      const request = createTestRequest({ state });
      const status =
        state === 'Provisioning' || state === 'Completed' || state === 'Failed'
          ? createTestProvisioningStatus({ overallStatus: state === 'Completed' ? 'Completed' : state === 'Failed' ? 'Failed' : 'InProgress' })
          : undefined;
      const { unmount } = renderDetail({
        requests: [request],
        statusByProjectId: status ? { 'p-1': status } : {},
      });
      expect(screen.getByText(STATE_CONTEXT_TEXT[state])).toBeInTheDocument();
      unmount();
    }
  });

  // G4-T01-018
  it('shows ClarificationBanner only on NeedsClarification', () => {
    // NeedsClarification — banner present
    const clarRequest = createTestRequest({ state: 'NeedsClarification', clarificationNote: 'Please clarify scope' });
    const { unmount } = renderDetail({ requests: [clarRequest] });
    expect(screen.getByText('Please clarify scope')).toBeInTheDocument();
    unmount();

    // Submitted — no clarification banner
    const subRequest = createTestRequest({ state: 'Submitted' });
    renderDetail({ requests: [subRequest] });
    expect(screen.queryByText('Please clarify scope')).not.toBeInTheDocument();
  });

  // G4-T01-019
  it('shows ProvisioningChecklist for Provisioning/Completed states when status exists', () => {
    const request = createTestRequest({ state: 'Completed', submittedBy: 'test@hb.com' });
    const status = createTestProvisioningStatus({ overallStatus: 'Completed' });
    // Session email matches submittedBy → visibility=full → checklist renders
    renderDetail({
      requests: [request],
      statusByProjectId: { 'p-1': status },
    });
    // The checklist renders the project number and name
    expect(screen.getByText(/Site Setup Progress/)).toBeInTheDocument();
  });

  // G4-T01-020
  // Also covers G4-T07-007: Unknown requestId → HbcEmptyState
  it('shows empty state when request is not found', () => {
    renderDetail({ requests: [] });
    expect(screen.getByText('Request Not Found')).toBeInTheDocument();
    expect(screen.getByText(/was not found/)).toBeInTheDocument();
  });

  // ── Failure modes (W0-G4-T07) ──────────────────────────────────────────
  describe('failure modes', () => {
    // G4-T07-004: API failure → error shell with retry
    it('shows error shell when API call throws', async () => {
      mockClient.listRequests.mockRejectedValueOnce(new Error('Network error'));
      renderDetail({ requests: [] });

      await waitFor(() => {
        expect(screen.getByText(/Unable to load request data/)).toBeInTheDocument();
      });
    });

    // G4-T07-005: SignalR fail → polling fallback warning banner
    it('shows real-time connection warning when SignalR is disconnected during Provisioning', () => {
      vi.mocked(useProvisioningSignalR).mockReturnValue({ isConnected: false } as any);

      const request = createTestRequest({ state: 'Provisioning' });
      const status = createTestProvisioningStatus({ overallStatus: 'InProgress' });
      renderDetail({
        requests: [request],
        statusByProjectId: { 'p-1': status },
      });

      expect(screen.getByText(/Real-time connection lost/)).toBeInTheDocument();
    });

    // G4-T07-006: Null session → loading state
    it('renders loading shell when session is null', () => {
      renderDetail({ session: null, requests: [] });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // G4-T07-007: Unknown requestId → HbcEmptyState — covered by G4-T01-020 above.

    // G4-T07-008: Completed + missing siteUrl → warning — covered by G4-T05-004
    // in RequestDetailPage.completion.test.tsx (CompletionConfirmationCard shows
    // "not yet available" warning when siteUrl is missing).
  });
});
