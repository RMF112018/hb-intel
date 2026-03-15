import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { usePermissionStore } from '@hbc/auth';
import { renderWithProviders } from './renderWithProviders';
import { createTestProvisioningStatus } from './factories';
import { ProvisioningOversightPage } from '../pages/ProvisioningOversightPage';

/** G6-T01: Full admin permissions for tests that need action buttons visible. */
const FULL_ADMIN_PERMISSIONS = [
  'admin:access-control:view',
  'admin:provisioning:retry',
  'admin:provisioning:escalate',
  'admin:provisioning:archive',
  'admin:provisioning:force-state',
];

// ── Module-level mocks ──────────────────────────────────────────────────────

const mockClient = {
  listProvisioningRuns: vi.fn().mockResolvedValue([]),
  listFailedRuns: vi.fn().mockResolvedValue([]),
  retryProvisioning: vi.fn().mockResolvedValue(undefined),
  archiveFailure: vi.fn().mockResolvedValue(undefined),
  acknowledgeEscalation: vi.fn().mockResolvedValue(undefined),
  forceStateTransition: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/provisioning')>();
  return { ...actual, createProvisioningApiClient: vi.fn(() => mockClient) };
});

// ─────────────────────────────────────────────────────────────────────────────

// Lazily import the mocked factory so we can restore its implementation after reset
const getFactory = async () => {
  const mod = await import('@hbc/provisioning');
  return mod.createProvisioningApiClient as ReturnType<typeof vi.fn>;
};

describe('ProvisioningOversightPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Restore default implementations after vi.resetAllMocks() from setup.ts
    mockClient.listProvisioningRuns.mockResolvedValue([]);
    mockClient.listFailedRuns.mockResolvedValue([]);
    mockClient.retryProvisioning.mockResolvedValue(undefined);
    mockClient.archiveFailure.mockResolvedValue(undefined);
    mockClient.acknowledgeEscalation.mockResolvedValue(undefined);
    mockClient.forceStateTransition.mockResolvedValue(undefined);
    const factory = await getFactory();
    factory.mockImplementation(() => mockClient);

    // G6-T01: Seed full admin permissions so existing action tests continue to pass
    usePermissionStore.setState({ permissions: FULL_ADMIN_PERMISSIONS });

    // Reset query params
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '' },
      writable: true,
    });
  });

  // G4-T04-001: Default tabs and table load
  it('renders with Failures tab active and displays failed runs in data table', async () => {
    const failedRuns = [
      createTestProvisioningStatus({ projectId: 'p-1', projectName: 'Project Alpha' }),
      createTestProvisioningStatus({ projectId: 'p-2', projectName: 'Project Beta', projectNumber: '25-002-01' }),
    ];
    mockClient.listProvisioningRuns.mockResolvedValueOnce(failedRuns);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Failures')).toBeInTheDocument();
    });

    // Verify Failures tab is the active/default tab
    const failuresTab = screen.getByText('Failures');
    expect(failuresTab).toBeInTheDocument();

    // Verify data table renders rows with project names
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });

  // G4-T04-002: Force-retry button for failed requests
  it('shows Retry button for failed runs', async () => {
    const failedRun = createTestProvisioningStatus({ projectId: 'p-1', overallStatus: 'Failed' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Retry (0/3)')).toBeInTheDocument();
    });
  });

  // G4-T04-003: Force-retry confirm shows risk warning
  it('shows danger confirmation dialog with risk warning when Retry is clicked', async () => {
    const failedRun = createTestProvisioningStatus({ projectId: 'p-1', overallStatus: 'Failed' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Retry (0/3)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry (0/3)'));

    await waitFor(() => {
      expect(screen.getByText(/structural or permissions failure/)).toBeInTheDocument();
      expect(screen.getByText(/duplicate partial state/)).toBeInTheDocument();
    });
  });

  // G4-T04-004: Force-retry calls API after confirmation
  it('calls retryProvisioning with projectId after confirming force retry', async () => {
    const failedRun = createTestProvisioningStatus({ projectId: 'p-1', overallStatus: 'Failed' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);
    // After retry, the reload call
    mockClient.listProvisioningRuns.mockResolvedValueOnce([]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Retry (0/3)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry (0/3)'));

    await waitFor(() => {
      expect(screen.getByText(/structural or permissions failure/)).toBeInTheDocument();
    });

    // The confirm button in the dialog has confirmLabel="Force Retry"
    // The title "Force Retry" also appears as an h3, so use getAllByText and pick the button
    const forceRetryElements = screen.getAllByText('Force Retry');
    const confirmButton = forceRetryElements.find((el) => el.tagName === 'BUTTON') ?? forceRetryElements[forceRetryElements.length - 1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockClient.retryProvisioning).toHaveBeenCalledWith('p-1');
    });
  });

  // G4-T04-005: Archive button + confirmation works
  it('shows Archive button for failed run and calls archiveFailure after confirmation', async () => {
    const failedRun = createTestProvisioningStatus({ projectId: 'p-1', overallStatus: 'Failed' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);
    mockClient.listProvisioningRuns.mockResolvedValueOnce([]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Archive')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Archive'));

    // Verify confirm dialog appears
    await waitFor(() => {
      expect(screen.getByText(/removed from the active failures queue/)).toBeInTheDocument();
    });

    // The confirm button in the archive dialog has confirmLabel="Archive"
    const archiveButtons = screen.getAllByText('Archive');
    fireEvent.click(archiveButtons[archiveButtons.length - 1]);

    await waitFor(() => {
      expect(mockClient.archiveFailure).toHaveBeenCalledWith('p-1');
    });
  });

  // G4-T04-006: Escalation badge on escalated rows
  it('renders Escalated badge and Ack Escalation button for escalated runs', async () => {
    const escalatedRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
      escalatedBy: 'coordinator@hb.com',
      escalatedAt: '2026-01-15T13:00:00.000Z',
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([escalatedRun]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Escalated')).toBeInTheDocument();
      expect(screen.getByText('Ack Escalation')).toBeInTheDocument();
    });
  });

  // G4-T04-007: Expert diagnostics hidden at standard tier
  it('hides expert diagnostics at standard tier but shows them at expert tier', async () => {
    const failedRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
      steps: [
        { stepNumber: 1, stepName: 'Create Site', status: 'Completed', startedAt: '2026-01-15T12:00:00.000Z', completedAt: '2026-01-15T12:00:01.000Z' },
        { stepNumber: 2, stepName: 'Apply Template', status: 'Failed', startedAt: '2026-01-15T12:00:01.000Z', errorMessage: 'Permission denied', metadata: { detail: 'test' } },
      ],
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);

    // Standard tier
    const { unmount } = renderWithProviders(<ProvisioningOversightPage />, { tier: 'standard' });

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Details'));

    await waitFor(() => {
      // Standard tier should show Provisioning Steps
      expect(screen.getByText('Provisioning Steps')).toBeInTheDocument();
    });

    // Expert-only headings should NOT be present
    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Internal Identifiers')).not.toBeInTheDocument();

    unmount();

    // Expert tier
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);
    renderWithProviders(<ProvisioningOversightPage />, { tier: 'expert' });

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Details'));

    await waitFor(() => {
      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Internal Identifiers')).toBeInTheDocument();
    });
  });

  // G4-T04-008: Manual state override at expert tier only
  it('shows Manual State Override at expert tier for transitional runs and hides it at standard', async () => {
    // isStuckInTransitional returns true when overallStatus is not Completed/Failed
    const stuckRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'InProgress',
      failureClass: undefined,
      steps: [
        { stepNumber: 1, stepName: 'Create Site', status: 'Completed', startedAt: '2026-01-15T12:00:00.000Z', completedAt: '2026-01-15T12:00:01.000Z' },
        { stepNumber: 2, stepName: 'Apply Template', status: 'InProgress', startedAt: '2026-01-15T12:00:01.000Z' },
      ],
    });

    // Expert tier - should show override
    mockClient.listProvisioningRuns.mockResolvedValueOnce([stuckRun]);
    const { unmount } = renderWithProviders(<ProvisioningOversightPage />, { tier: 'expert' });

    // Switch to "Active Runs" tab since InProgress won't show on Failures
    await waitFor(() => {
      expect(screen.getByText('Active Runs')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Active Runs'));

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Details'));

    await waitFor(() => {
      expect(screen.getByText('Manual State Override')).toBeInTheDocument();
    });

    unmount();

    // Standard tier - should NOT show override
    mockClient.listProvisioningRuns.mockResolvedValueOnce([stuckRun]);
    renderWithProviders(<ProvisioningOversightPage />, { tier: 'standard' });

    await waitFor(() => {
      expect(screen.getByText('Active Runs')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Active Runs'));

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Details'));

    // Standard tier should not show Manual State Override
    await waitFor(() => {
      expect(screen.getByText('Provisioning Steps')).toBeInTheDocument();
    });
    expect(screen.queryByText('Manual State Override')).not.toBeInTheDocument();
  });

  // G4-T04-009: ?projectId= pre-selects request
  it('auto-opens detail modal when ?projectId= matches a run', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?projectId=p-1' },
      writable: true,
    });

    const run = createTestProvisioningStatus({ projectId: 'p-1', projectName: 'Auto-Select Project' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([run]);

    renderWithProviders(<ProvisioningOversightPage />);

    // The detail modal should open automatically with the matching project
    await waitFor(() => {
      expect(screen.getByText('Auto-Select Project — Provisioning Detail')).toBeInTheDocument();
    });
  });

  // G4-T04-010: No approve/clarify/hold buttons
  it('does not render Approve, Request Clarification, or Place on Hold buttons', async () => {
    const run = createTestProvisioningStatus({ projectId: 'p-1', overallStatus: 'Failed' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([run]);

    renderWithProviders(<ProvisioningOversightPage />, { tier: 'standard' });

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Request Clarification')).not.toBeInTheDocument();
    expect(screen.queryByText('Place on Hold')).not.toBeInTheDocument();
  });

  // G4-T04-011: No guided setup wizard
  it('does not render any wizard-related content', async () => {
    const run = createTestProvisioningStatus({ projectId: 'p-1', overallStatus: 'Failed' });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([run]);

    renderWithProviders(<ProvisioningOversightPage />, { tier: 'expert' });

    await waitFor(() => {
      expect(screen.getByText(/Retry/)).toBeInTheDocument();
    });

    // No wizard-related content should be present
    expect(screen.queryByText(/wizard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guided setup/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/step wizard/i)).not.toBeInTheDocument();
  });

  // ── G6-T01: Action boundary enforcement ──────────────────────────────────

  // G6-T01-001 / G6-T02-001: Post-ceiling shows escalation guidance instead of retry button
  it('shows escalation guidance when retryCount reaches threshold', async () => {
    const exhaustedRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
      retryCount: 3,
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([exhaustedRun]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText(/Retry limit reached/)).toBeInTheDocument();
    });

    expect(screen.getByText(/escalation required/)).toBeInTheDocument();
    // No retry button should be present
    expect(screen.queryByText(/Retry \(\d\/\d\)/)).not.toBeInTheDocument();
  });

  // G6-T01-002: Retry count shown in button label
  it('shows retry count in retry button label', async () => {
    const run = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
      retryCount: 1,
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([run]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Retry (1/3)')).toBeInTheDocument();
    });
  });

  // G6-T01-003: Actions hidden for read-only users (no provisioning permissions)
  it('hides action buttons for users without provisioning override permissions', async () => {
    const failedRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
      escalatedBy: 'coordinator@hb.com',
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);

    // Seed only view permission — no provisioning override permissions
    usePermissionStore.setState({ permissions: ['admin:access-control:view'] });

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Details button should still be visible (not permission-gated)
    expect(screen.getByText('Details')).toBeInTheDocument();

    // Action buttons should be hidden
    expect(screen.queryByText(/Retry/)).not.toBeInTheDocument();
    expect(screen.queryByText('Archive')).not.toBeInTheDocument();
    expect(screen.queryByText('Ack Escalation')).not.toBeInTheDocument();
  });

  // G6-T01-004: Force-state hidden without permission
  it('hides Manual State Override without force-state permission at expert tier', async () => {
    const stuckRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'InProgress',
      failureClass: undefined,
      steps: [
        { stepNumber: 1, stepName: 'Create Site', status: 'Completed', startedAt: '2026-01-15T12:00:00.000Z', completedAt: '2026-01-15T12:00:01.000Z' },
        { stepNumber: 2, stepName: 'Apply Template', status: 'InProgress', startedAt: '2026-01-15T12:00:01.000Z' },
      ],
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([stuckRun]);

    // Grant all permissions EXCEPT force-state
    usePermissionStore.setState({
      permissions: [
        'admin:access-control:view',
        'admin:provisioning:retry',
        'admin:provisioning:escalate',
        'admin:provisioning:archive',
      ],
    });

    renderWithProviders(<ProvisioningOversightPage />, { tier: 'expert' });

    await waitFor(() => {
      expect(screen.getByText('Active Runs')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Active Runs'));

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Details'));

    // Expert-only content should be visible
    await waitFor(() => {
      expect(screen.getByText('Internal Identifiers')).toBeInTheDocument();
    });

    // But Manual State Override should NOT be visible (no force-state permission)
    expect(screen.queryByText('Manual State Override')).not.toBeInTheDocument();
  });

  // G6-T01-006: Retry count visible in confirmation dialog
  it('shows retry attempt number in force retry confirmation dialog', async () => {
    const run = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
      retryCount: 2,
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([run]);

    renderWithProviders(<ProvisioningOversightPage />);

    await waitFor(() => {
      expect(screen.getByText('Retry (2/3)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry (2/3)'));

    await waitFor(() => {
      expect(screen.getByText(/retry attempt 3 of 3/)).toBeInTheDocument();
    });
  });

  // ── G6-T05: Embedded guidance ──────────────────────────────────────────

  // G6-T05-001: Failed requests show coaching callout
  it('shows coaching callout with runbook link when failed requests are visible', async () => {
    const failedRun = createTestProvisioningStatus({
      projectId: 'p-1',
      overallStatus: 'Failed',
    });
    mockClient.listProvisioningRuns.mockResolvedValueOnce([failedRun]);

    renderWithProviders(<ProvisioningOversightPage />, { showCoaching: true });

    await waitFor(() => {
      expect(screen.getByText(/Provisioning failure detected/)).toBeInTheDocument();
    });

    expect(screen.getByText('Open Runbook')).toBeInTheDocument();
  });
});
