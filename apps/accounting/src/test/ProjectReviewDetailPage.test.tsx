import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './renderWithProviders';
import { createTestRequest } from './factories';
import { ProjectReviewDetailPage } from '../pages/ProjectReviewDetailPage';
import type * as ProvisioningModule from '@hbc/provisioning';
import type * as RouterModule from '@tanstack/react-router';

// ── Module-level mocks ──────────────────────────────────────────────────────

const mockNavigate = vi.fn();
type MockLinkProps = React.PropsWithChildren<{
  to: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>>;

const mockClient = {
  listRequests: vi.fn().mockResolvedValue([]),
  getProvisioningStatus: vi.fn().mockResolvedValue(null),
  submitRequest: vi.fn().mockResolvedValue({ requestId: 'req-new' }),
  advanceState: vi.fn().mockResolvedValue(undefined),
  retryProvisioning: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof ProvisioningModule>();
  return { ...actual, createProvisioningApiClient: vi.fn(() => mockClient) };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof RouterModule>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ requestId: 'req-1' })),
    useNavigate: vi.fn(() => mockNavigate),
    Link: ({ children, to, ...props }: MockLinkProps) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('../utils/crossAppUrls.js', () => ({
  getAdminAppUrl: vi.fn(() => 'https://admin.example.com'),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Seeds mock listRequests so the useEffect does not overwrite store data. */
function seedListRequests(requests: ReturnType<typeof createTestRequest>[]) {
  mockClient.listRequests.mockResolvedValue(requests);
}

// ── Test suite ──────────────────────────────────────────────────────────────

describe('ProjectReviewDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.listRequests.mockResolvedValue([]);
    mockClient.advanceState.mockResolvedValue(undefined);
  });

  // G4-T03-005
  it('renders all core summary fields for an UnderReview request', () => {
    const request = createTestRequest({
      requestId: 'req-1',
      projectName: 'Summit Tower',
      state: 'UnderReview',
      projectType: 'Commercial',
      projectStage: 'Active',
      submittedBy: 'coordinator@hb.com',
      submittedAt: '2026-01-15T12:00:00.000Z',
    });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    // Project name appears in heading (HbcTypography heading2)
    const heading = screen.getByText('Summit Tower', { selector: '[data-hbc-ui="typography"]' });
    expect(heading).toBeTruthy();
    expect(screen.getByText('Commercial')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('coordinator@hb.com')).toBeTruthy();
    expect(screen.getByText(new Date('2026-01-15T12:00:00.000Z').toLocaleDateString())).toBeTruthy();
  });

  // G4-T03-006
  it('approve fires API with project number and navigates to queue', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve Request' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('##-###-##')).toBeTruthy();
    });

    // Enter a valid project number before approving
    fireEvent.change(screen.getByPlaceholderText('##-###-##'), { target: { value: '25-001-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(mockClient.advanceState).toHaveBeenCalledWith('req-1', 'ReadyToProvision', { projectNumber: '25-001-01' });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/project-review' }));
    });
  });

  // G4-T03-007
  it('shows confirm dialog before calling approve API', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve Request' }));

    await waitFor(() => {
      expect(screen.getByText('Approve this project setup request? It will be queued for provisioning.')).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();

    // API should NOT have been called yet
    expect(mockClient.advanceState).not.toHaveBeenCalled();
  });

  // G4-T03-008
  it('clarification modal with textarea appears on button click', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Clarification' }));

    await waitFor(() => {
      expect(screen.getByText('Clarification Note')).toBeTruthy();
    });
    expect(screen.getByPlaceholderText('Describe what information is needed from the requester...')).toBeTruthy();
  });

  // G4-T03-009
  it('clarification submit calls API with note', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Clarification' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Describe what information is needed from the requester...')).toBeTruthy();
    });

    const textarea = screen.getByPlaceholderText('Describe what information is needed from the requester...');
    fireEvent.change(textarea, { target: { value: 'Please clarify the budget allocation.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(mockClient.advanceState).toHaveBeenCalledWith(
        'req-1',
        'NeedsClarification',
        { clarificationNote: 'Please clarify the budget allocation.' },
      );
    });
  });

  // G4-T03-010
  it('"Send to Admin" visible only when state is Failed', () => {
    const failedRequest = createTestRequest({ requestId: 'req-1', state: 'Failed' });
    seedListRequests([failedRequest]);

    const { unmount } = renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [failedRequest],
    });

    expect(screen.getByRole('button', { name: 'Send to Admin' })).toBeTruthy();
    unmount();

    const underReviewRequest = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([underReviewRequest]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [underReviewRequest],
    });

    expect(screen.queryByRole('button', { name: 'Send to Admin' })).toBeNull();
  });

  // G4-T03-011
  it('audit trail panel renders at expert tier only', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    const { unmount } = renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'expert',
      requests: [request],
    });

    expect(document.querySelector('[data-hbc-ui="HbcAuditTrailPanel"]')).toBeTruthy();
    unmount();

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(document.querySelector('[data-hbc-ui="HbcAuditTrailPanel"]')).toBeNull();
  });

  // G4-T03-012
  it('standard-tier content is gated correctly', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    const { unmount } = renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'essential',
      requests: [request],
    });

    expect(screen.queryByText('Request Details')).toBeNull();
    unmount();

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(screen.getByText('Request Details')).toBeTruthy();
  });

  // G4-T03-013
  it('API failure on approve shows error banner', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);
    mockClient.advanceState.mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve Request' }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('##-###-##')).toBeTruthy();
    });

    // Enter a valid project number so the approve action fires
    fireEvent.change(screen.getByPlaceholderText('##-###-##'), { target: { value: '25-001-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(screen.getByText(/Action failed/)).toBeTruthy();
    });
  });

  // D-REGR-F5: Approve button disabled without valid project number (deficiency regression)
  it('approve button is disabled until valid project number is entered', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve Request' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('##-###-##')).toBeTruthy();
    });

    // Approve button should be disabled when project number is empty
    const approveBtn = screen.getByRole('button', { name: 'Approve' });
    expect(approveBtn).toHaveProperty('disabled', true);

    // Enter invalid format — still disabled
    fireEvent.change(screen.getByPlaceholderText('##-###-##'), { target: { value: '123' } });
    expect(approveBtn).toHaveProperty('disabled', true);

    // Enter valid format — now enabled
    fireEvent.change(screen.getByPlaceholderText('##-###-##'), { target: { value: '25-001-01' } });
    expect(approveBtn).toHaveProperty('disabled', false);
  });

  // P3-02-002: Begin Review button visible for Submitted state
  it('"Begin Review" visible only when state is Submitted', () => {
    const submittedRequest = createTestRequest({ requestId: 'req-1', state: 'Submitted' });
    seedListRequests([submittedRequest]);

    const { unmount } = renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [submittedRequest],
    });

    expect(screen.getByRole('button', { name: 'Begin Review' })).toBeTruthy();
    // Approve should NOT be visible for Submitted
    expect(screen.queryByRole('button', { name: 'Approve Request' })).toBeNull();
    unmount();

    const underReviewRequest = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([underReviewRequest]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [underReviewRequest],
    });

    expect(screen.queryByRole('button', { name: 'Begin Review' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Approve Request' })).toBeTruthy();
  });

  // P3-02-003: Begin Review fires API and navigates to queue
  it('"Begin Review" calls advanceState with UnderReview', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'Submitted' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Begin Review' }));

    await waitFor(() => {
      expect(mockClient.advanceState).toHaveBeenCalledWith('req-1', 'UnderReview', undefined);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/project-review' }));
    });
  });

  // P3-03-001: Resolve Hold button visible for AwaitingExternalSetup state
  it('"Resolve Hold" visible only when state is AwaitingExternalSetup', () => {
    const awaitingRequest = createTestRequest({ requestId: 'req-1', state: 'AwaitingExternalSetup' });
    seedListRequests([awaitingRequest]);

    const { unmount } = renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [awaitingRequest],
    });

    expect(screen.getByRole('button', { name: 'Resolve Hold' })).toBeTruthy();
    // Approve should NOT be visible for AwaitingExternalSetup
    expect(screen.queryByRole('button', { name: 'Approve Request' })).toBeNull();
    unmount();

    const underReviewRequest = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([underReviewRequest]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [underReviewRequest],
    });

    expect(screen.queryByRole('button', { name: 'Resolve Hold' })).toBeNull();
  });

  // P3-03-002: Resolve Hold opens modal with project number field
  it('"Resolve Hold" opens modal requiring project number', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'AwaitingExternalSetup' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Resolve Hold' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('##-###-##')).toBeTruthy();
    });

    // Modal is open with project number field
    expect(screen.getByText('External setup is complete. Assign a project number to approve this request and begin provisioning.')).toBeTruthy();

    // Approve button should be disabled when project number is empty
    const approveBtn = screen.getByRole('button', { name: 'Approve' });
    expect(approveBtn).toHaveProperty('disabled', true);
  });

  // P3-03-003: Resolve Hold fires advanceState with ReadyToProvision and project number
  it('"Resolve Hold" calls advanceState with ReadyToProvision and project number', async () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'AwaitingExternalSetup' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Resolve Hold' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('##-###-##')).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText('##-###-##'), { target: { value: '26-010-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(mockClient.advanceState).toHaveBeenCalledWith('req-1', 'ReadyToProvision', { projectNumber: '26-010-01' });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/project-review' }));
    });
  });

  // G4-T03-014
  it('no retry/recovery actions in review surface', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'UnderReview' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /force retry/i })).toBeNull();
  });

  // ── Status banners and UX hardening (P3-04) ────────────────────────────

  // P3-04-001: NeedsClarification shows warning banner
  it('shows clarification warning banner when state is NeedsClarification', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'NeedsClarification' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(screen.getByText(/Waiting for the requester to respond before review can continue/)).toBeTruthy();
  });

  // P3-04-002: AwaitingExternalSetup shows warning banner with guidance
  it('shows external setup warning banner when state is AwaitingExternalSetup', () => {
    const request = createTestRequest({ requestId: 'req-1', state: 'AwaitingExternalSetup' });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(screen.getByText(/on hold pending external prerequisites/)).toBeTruthy();
  });

  // P3-04-003: Operational detail shows "Approved By" for approved requests
  it('shows approved-by in operational detail for approved requests', () => {
    const request = createTestRequest({
      requestId: 'req-1',
      state: 'ReadyToProvision',
      approvedBy: 'controller@hb.com',
      projectNumber: '26-001-01',
    });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(screen.getByText('controller@hb.com')).toBeTruthy();
    expect(screen.getByText('Approved By:')).toBeTruthy();
  });

  // P3-04-004: ReadyToProvision banner shows correct auto-trigger messaging
  it('shows provisioning auto-start banner for ReadyToProvision state', () => {
    const request = createTestRequest({
      requestId: 'req-1',
      state: 'ReadyToProvision',
      projectNumber: '26-001-01',
    });
    seedListRequests([request]);

    renderWithProviders(<ProjectReviewDetailPage />, {
      tier: 'standard',
      requests: [request],
    });

    expect(screen.getByText(/Provisioning is starting automatically/)).toBeTruthy();
    expect(screen.getByText(/26-001-01/)).toBeTruthy();
  });

  // ── Failure modes (W0-G4-T07) ──────────────────────────────────────────
  describe('failure modes', () => {
    // G4-T07-009: Cross-app URL missing → warning banner
    it('shows warning banner and hides "Send to Admin" when admin URL is missing', async () => {
      const crossAppUrls = await import('../utils/crossAppUrls.js');
      vi.mocked(crossAppUrls.getAdminAppUrl).mockReturnValue(null);

      const failedRequest = createTestRequest({ requestId: 'req-1', state: 'Failed' });
      seedListRequests([failedRequest]);

      renderWithProviders(<ProjectReviewDetailPage />, {
        tier: 'standard',
        requests: [failedRequest],
      });

      expect(screen.getByText(/Admin navigation is not configured/)).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Send to Admin' })).toBeNull();

      // Restore the mock
      vi.mocked(crossAppUrls.getAdminAppUrl).mockReturnValue('https://admin.example.com');
    });
  });
});
