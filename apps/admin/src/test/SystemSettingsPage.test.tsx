import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComplexityProvider } from '@hbc/complexity';
import { HbcThemeProvider, HbcToastProvider } from '@hbc/ui-kit';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { SystemSettingsPage } from '../pages/SystemSettingsPage';
import { createTestSession } from './renderWithProviders';

/**
 * SystemSettingsPage needs a QueryClientProvider because ApprovalAuthorityTable
 * uses useApprovalAuthority() which depends on TanStack React Query.
 */
function renderWithQueryClient(ui: React.ReactElement): ReturnType<typeof render> {
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

describe('SystemSettingsPage', () => {
  beforeEach(() => {
    const session = createTestSession();
    useAuthStore.setState({ session });
    usePermissionStore.setState({ permissions: [] });
  });

  // G6-T02-002: Approval authority section visible to technical admin
  it('shows Approval Authority Configuration when admin:approval:manage is granted', async () => {
    usePermissionStore.setState({
      permissions: ['admin:access-control:view', 'admin:approval:manage'],
    });

    renderWithQueryClient(<SystemSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Approval Authority Configuration')).toBeInTheDocument();
    });
  });

  // G6-T02-003: Approval authority section hidden without permission
  it('hides Approval Authority Configuration without admin:approval:manage', async () => {
    usePermissionStore.setState({
      permissions: ['admin:access-control:view'],
    });

    renderWithQueryClient(<SystemSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });

    expect(screen.queryByText('Approval Authority Configuration')).not.toBeInTheDocument();
  });

  // G6-T02-004: Wave 0 stub banner shown
  it('shows Wave 0 non-persistence warning banner', async () => {
    usePermissionStore.setState({
      permissions: ['admin:access-control:view', 'admin:approval:manage'],
    });

    renderWithQueryClient(<SystemSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/not persisted in Wave 0/)).toBeInTheDocument();
    });
  });
});
