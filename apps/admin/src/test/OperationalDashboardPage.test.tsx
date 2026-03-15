import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComplexityProvider } from '@hbc/complexity';
import { HbcThemeProvider, HbcToastProvider } from '@hbc/ui-kit';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { OperationalDashboardPage } from '../pages/OperationalDashboardPage';
import { createTestSession } from './renderWithProviders';
import { createTestRequest } from './factories';

// ── Module-level mocks ──────────────────────────────────────────────────────

const mockClient = {
  listRequests: vi.fn().mockResolvedValue([]),
  listProvisioningRuns: vi.fn().mockResolvedValue([]),
  listFailedRuns: vi.fn().mockResolvedValue([]),
};

vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/provisioning')>();
  return { ...actual, createProvisioningApiClient: vi.fn(() => mockClient) };
});

const FULL_ADMIN_PERMISSIONS = [
  'admin:access-control:view',
  'admin:provisioning:retry',
  'admin:provisioning:escalate',
  'admin:provisioning:archive',
  'admin:provisioning:force-state',
  'admin:provisioning:alert:full-detail',
  'admin:approval:manage',
];

/**
 * Render with QueryClientProvider needed by AdminAlertDashboard and ImplementationTruthDashboard.
 */
function renderWithProviders(
  ui: React.ReactElement,
  options: { permissions?: string[] } = {},
): ReturnType<typeof render> {
  const { permissions = FULL_ADMIN_PERMISSIONS } = options;
  const session = createTestSession();
  useAuthStore.setState({ session });
  usePermissionStore.setState({ permissions });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HbcThemeProvider>
        <HbcToastProvider>
          <ComplexityProvider _testPreference={{ tier: 'essential', showCoaching: false }}>
            {ui}
          </ComplexityProvider>
        </HbcToastProvider>
      </HbcThemeProvider>
    </QueryClientProvider>,
  );
}

describe('OperationalDashboardPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient.listRequests.mockResolvedValue([]);
    const mod = await import('@hbc/provisioning');
    (mod.createProvisioningApiClient as ReturnType<typeof vi.fn>).mockImplementation(() => mockClient);
  });

  // G6-T03-001: Queue overview renders state counts
  it('renders queue health summary and state counts', async () => {
    mockClient.listRequests.mockResolvedValueOnce([
      createTestRequest({ state: 'Submitted' }),
      createTestRequest({ state: 'Failed', requestId: 'r2' }),
      createTestRequest({ state: 'Completed', requestId: 'r3', completedAt: new Date().toISOString() }),
    ]);

    renderWithProviders(<OperationalDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Queue Health Summary')).toBeInTheDocument();
    });

    // Health summary cards
    expect(screen.getByText('Active Requests')).toBeInTheDocument();
    expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    expect(screen.getByText('Queue Overview')).toBeInTheDocument();
  });

  // G6-T03-002: Business-ops user sees summary but not dashboards
  it('hides alert and probe dashboards for business-ops users', async () => {
    mockClient.listRequests.mockResolvedValueOnce([]);

    renderWithProviders(<OperationalDashboardPage />, {
      permissions: ['admin:access-control:view'],
    });

    await waitFor(() => {
      expect(screen.getByText('Queue Health Summary')).toBeInTheDocument();
    });

    // Queue overview visible
    expect(screen.getByText('Queue Overview')).toBeInTheDocument();

    // Dashboards should NOT be visible
    expect(screen.queryByText('Alert Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Infrastructure Health')).not.toBeInTheDocument();
  });

  // G6-T03-003: Technical admin sees all three sections
  it('shows alert and probe dashboards for technical admins', async () => {
    mockClient.listRequests.mockResolvedValueOnce([]);

    renderWithProviders(<OperationalDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Queue Health Summary')).toBeInTheDocument();
    });

    expect(screen.getByText('Alert Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure Health')).toBeInTheDocument();
  });

  // G6-T03-004: Bottleneck indicators for failed requests
  it('renders bottleneck indicator for failed requests', async () => {
    mockClient.listRequests.mockResolvedValueOnce([
      createTestRequest({ state: 'Failed' }),
    ]);

    renderWithProviders(<OperationalDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed request.*requiring attention/)).toBeInTheDocument();
    });
  });

  // G6-T03-005: Empty state when no requests
  it('shows empty state when no provisioning requests exist', async () => {
    mockClient.listRequests.mockResolvedValueOnce([]);

    renderWithProviders(<OperationalDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No provisioning requests')).toBeInTheDocument();
    });
  });

  // G6-T03-006: Health shows degraded when failures exist
  it('shows degraded health when failed requests exist', async () => {
    mockClient.listRequests.mockResolvedValueOnce([
      createTestRequest({ state: 'Failed' }),
    ]);

    renderWithProviders(<OperationalDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Degraded')).toBeInTheDocument();
    });
  });

  // G6-T03-007: Stub data banners shown
  it('shows stub data info banners for alert and probe dashboards', async () => {
    mockClient.listRequests.mockResolvedValueOnce([]);

    renderWithProviders(<OperationalDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/stub until T04/)).toBeInTheDocument();
      expect(screen.getByText(/stub until T06/)).toBeInTheDocument();
    });
  });
});
