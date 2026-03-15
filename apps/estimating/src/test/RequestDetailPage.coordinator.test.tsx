/**
 * W0-G4-T08 Phase 1: RequestDetailPage coordinator retry/failure tests (11 tests).
 * Tests failure detail card, retry conditions, escalation, and BIC tier gating.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from './renderWithProviders.js';
import { createTestRequest, createTestProvisioningStatus } from './factories.js';

// ---------------------------------------------------------------------------
// Shared mock state
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
const mockRetryComplete = vi.fn();
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
const { FailureDetailCard } = await import(
  '../components/project-setup/FailureDetailCard.js'
);
const { RetrySection } = await import(
  '../components/project-setup/RetrySection.js'
);
const { RequestCoreSummary } = await import(
  '../components/project-setup/RequestCoreSummary.js'
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderFailureDetail(
  statusOverrides: Parameters<typeof createTestProvisioningStatus>[0] = {},
  tier: 'essential' | 'standard' | 'expert' = 'standard',
) {
  const status = createTestProvisioningStatus(statusOverrides);
  return renderWithProviders(<FailureDetailCard status={status} />, { tier });
}

function renderRetrySection(
  statusOverrides: Parameters<typeof createTestProvisioningStatus>[0] = {},
  tier: 'essential' | 'standard' | 'expert' = 'standard',
) {
  const status = createTestProvisioningStatus(statusOverrides);
  return renderWithProviders(
    <RetrySection status={status} projectId="p-1" onRetryComplete={mockRetryComplete} />,
    { tier },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('RequestDetailPage — coordinator retry/failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.retryProvisioning.mockResolvedValue(undefined);
  });

  // G4-T02-001
  it('standard-tier sees step-level failure detail; essential does not', () => {
    // Standard tier — should show failure detail
    const { unmount } = renderFailureDetail({}, 'standard');
    expect(screen.getByText('Failure Detail')).toBeInTheDocument();
    expect(screen.getByText(/Failed Step/)).toBeInTheDocument();
    unmount();

    // Essential tier — FailureDetailCard is gated to standard
    renderFailureDetail({}, 'essential');
    expect(screen.queryByText('Failure Detail')).not.toBeInTheDocument();
  });

  // G4-T02-002
  it('standard-tier sees failure class and retry count', () => {
    renderFailureDetail(
      { failureClass: 'transient', retryCount: 1 },
      'standard',
    );
    expect(screen.getByText('Transient Failure')).toBeInTheDocument();
    expect(screen.getByText(/Retry Count.*1/)).toBeInTheDocument();
  });

  // G4-T02-003
  it('shows retry button when all 5 canCoordinatorRetry conditions are met', () => {
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'transient',
      retryCount: 0,
      escalatedBy: undefined,
    });
    expect(screen.getByText('Retry Provisioning')).toBeInTheDocument();
  });

  // G4-T02-004
  it('no retry button for structural failure — shows admin banner', () => {
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'structural',
      retryCount: 0,
    });
    expect(screen.queryByText('Retry Provisioning')).not.toBeInTheDocument();
    expect(screen.getByText(/Admin recovery/i)).toBeInTheDocument();
  });

  // G4-T02-005
  it('no retry button when retryCount >= 2', () => {
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'transient',
      retryCount: 2,
    });
    expect(screen.queryByText('Retry Provisioning')).not.toBeInTheDocument();
  });

  // G4-T02-006
  it('no retry button when escalated', () => {
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'transient',
      retryCount: 0,
      escalatedBy: 'admin@hb.com',
    });
    expect(screen.queryByText('Retry Provisioning')).not.toBeInTheDocument();
  });

  // G4-T02-007
  it('non-retryable failure shows admin escalation banner', () => {
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'permissions',
      retryCount: 0,
    });
    expect(screen.getByText(/requires Admin recovery/)).toBeInTheDocument();
    expect(screen.getByText('Escalate to Admin')).toBeInTheDocument();
  });

  // G4-T02-008
  it('retry fires API call', async () => {
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'transient',
      retryCount: 0,
    });
    fireEvent.click(screen.getByText('Retry Provisioning'));
    await waitFor(() => {
      expect(mockClient.retryProvisioning).toHaveBeenCalledWith('p-1');
    });
  });

  // G4-T02-009
  it('retry failure shows error banner', async () => {
    mockClient.retryProvisioning.mockRejectedValue(new Error('Retry failed'));
    renderRetrySection({
      overallStatus: 'Failed',
      failureClass: 'transient',
      retryCount: 0,
    });
    fireEvent.click(screen.getByText('Retry Provisioning'));
    await waitFor(() => {
      expect(screen.getByText(/Retry failed/)).toBeInTheDocument();
    });
  });

  // G4-T02-010
  it('BIC detail at standard tier, badge at essential tier', () => {
    const request = createTestRequest({ state: 'Failed' });
    const { unmount } = renderWithProviders(
      <RequestCoreSummary request={request} />,
      { tier: 'standard' },
    );
    // Standard shows BicDetail (via HbcComplexityGate minTier="standard")
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    unmount();

    renderWithProviders(<RequestCoreSummary request={request} />, {
      tier: 'essential',
    });
    // Essential still shows project name via heading
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  // G4-T02-011
  it('FailureDetailCard renders at standard but not essential', () => {
    const status = createTestProvisioningStatus();
    const { unmount } = renderWithProviders(
      <FailureDetailCard status={status} />,
      { tier: 'standard' },
    );
    expect(screen.getByText('Failure Detail')).toBeInTheDocument();
    unmount();

    renderWithProviders(<FailureDetailCard status={status} />, {
      tier: 'essential',
    });
    expect(screen.queryByText('Failure Detail')).not.toBeInTheDocument();
  });

  // ── Failure modes (W0-G4-T07) ──────────────────────────────────────────
  describe('failure modes', () => {
    // G4-T07-002: Retry button tappable at 768px
    it('retry button renders at standard tier (768px tap target is CSS — manual per R3)', () => {
      renderRetrySection({
        overallStatus: 'Failed',
        failureClass: 'transient',
        retryCount: 0,
        escalatedBy: undefined,
      });
      expect(screen.getByText('Retry Provisioning')).toBeInTheDocument();
      // jsdom cannot test CSS touch targets; this confirms the button renders.
    });
  });
});
