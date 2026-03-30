import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { ComplexityProvider } from '@hbc/complexity';
import { HbcThemeProvider } from '@hbc/ui-kit';
import { SessionStateProvider } from '@hbc/session-state';
import type { OperationExecutor } from '@hbc/session-state';
import { useAuthStore } from '@hbc/auth';
import { useProvisioningStore } from '@hbc/provisioning';
import type { NormalizedAuthSession } from '@hbc/auth';
import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';
import { ProjectSetupBackendProvider } from '../project-setup/backend/ProjectSetupBackendContext.js';
import { _resetConfig, setRuntimeConfig } from '../config/runtimeConfig.js';

const testSessionExecutor: OperationExecutor = async () => {};

interface RenderOptions {
  tier?: 'essential' | 'standard' | 'expert';
  session?: NormalizedAuthSession | null;
  requests?: IProjectSetupRequest[];
  statusByProjectId?: Record<string, IProvisioningStatus>;
  backendMode?: 'production' | 'ui-review';
  allowBackendModeSwitch?: boolean;
  functionAppUrl?: string;
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
      roles: [{ id: 'role-1', name: 'Estimator', permissions: ['view', 'create'] }],
    },
    providerIdentityRef: 'test-identity-ref',
    resolvedRoles: ['Estimator'],
    permissionSummary: { grants: ['view', 'create'], overrides: [] },
    runtimeMode: 'mock',
    issuedAt: now,
    validatedAt: now,
    restoreMetadata: { source: 'memory' },
    ...overrides,
  };
}

/**
 * Renders a component wrapped with the providers used by the Estimating app.
 * Pre-seeds auth and provisioning Zustand stores for test isolation.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {},
): RenderResult {
  const {
    tier = 'essential',
    session = createTestSession(),
    requests = [],
    statusByProjectId = {},
    backendMode = 'production',
    allowBackendModeSwitch = false,
    functionAppUrl = 'https://test-functions.azurewebsites.net',
  } = options;

  // Pre-seed Zustand stores before render
  useAuthStore.setState({ session });
  useProvisioningStore.setState({ requests, statusByProjectId });
  _resetConfig();
  setRuntimeConfig({
    backendMode,
    allowBackendModeSwitch,
    functionAppUrl: backendMode === 'production' ? functionAppUrl : undefined,
  });

  function TestWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <HbcThemeProvider>
        <ComplexityProvider _testPreference={{ tier, showCoaching: false }}>
          <SessionStateProvider executor={testSessionExecutor}>
            <ProjectSetupBackendProvider>{children}</ProjectSetupBackendProvider>
          </SessionStateProvider>
        </ComplexityProvider>
      </HbcThemeProvider>
    );
  }

  return render(ui, { wrapper: TestWrapper });
}
