import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { ComplexityProvider } from '@hbc/complexity';
import { HbcThemeProvider, HbcToastProvider } from '@hbc/ui-kit';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useProvisioningStore } from '@hbc/provisioning';
import type { NormalizedAuthSession } from '@hbc/auth';
import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';

interface RenderOptions {
  tier?: 'essential' | 'standard' | 'expert';
  showCoaching?: boolean;
  session?: NormalizedAuthSession | null;
  permissions?: string[];
  requests?: IProjectSetupRequest[];
  statusByProjectId?: Record<string, IProvisioningStatus>;
}

/**
 * Creates a minimal valid NormalizedAuthSession for test use.
 */
export function createTestSession(
  overrides?: Partial<NormalizedAuthSession>,
): NormalizedAuthSession {
  const now = new Date().toISOString();
  return {
    user: {
      id: 'user-1',
      displayName: 'Test User',
      email: 'test@hb.com',
      roles: [{ id: 'role-1', name: 'Admin', permissions: ['view', 'create', 'approve', 'admin'] }],
    },
    providerIdentityRef: 'test-identity-ref',
    resolvedRoles: ['Admin'],
    permissionSummary: { grants: ['view', 'create', 'approve', 'admin'], overrides: [] },
    runtimeMode: 'mock',
    issuedAt: now,
    validatedAt: now,
    restoreMetadata: { source: 'memory' },
    ...overrides,
  };
}

/**
 * Renders a component wrapped with the providers used by the Admin app.
 * Includes HbcToastProvider (required by pages that call useToast()).
 * Pre-seeds auth and provisioning Zustand stores for test isolation.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {},
): RenderResult {
  const {
    tier = 'essential',
    showCoaching = false,
    session = createTestSession(),
    permissions,
    requests = [],
    statusByProjectId = {},
  } = options;

  // Pre-seed Zustand stores before render
  useAuthStore.setState({ session });
  useProvisioningStore.setState({ requests, statusByProjectId });
  if (permissions) {
    usePermissionStore.setState({ permissions });
  }

  function TestWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <HbcThemeProvider>
        <HbcToastProvider>
          <ComplexityProvider _testPreference={{ tier, showCoaching }}>
            {children}
          </ComplexityProvider>
        </HbcToastProvider>
      </HbcThemeProvider>
    );
  }

  return render(ui, { wrapper: TestWrapper });
}
