import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '@hbc/auth';
import type * as ProvisioningModule from '@hbc/provisioning';
import {
  AccountingBackendProvider,
  useAccountingBackend,
} from '../backend/AccountingBackendContext.js';
import { createTestSession } from './renderWithProviders.js';

// Mock provisioning client
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

/** Test consumer that renders context values for assertion. */
function ContextInspector(): React.ReactElement {
  const { client, productionReadiness } = useAccountingBackend();
  return (
    <div>
      <span data-testid="has-client">{client ? 'yes' : 'no'}</span>
      <span data-testid="prod-ready">{productionReadiness.ready ? 'yes' : 'no'}</span>
      <span data-testid="prod-issues">{productionReadiness.issues.length}</span>
    </div>
  );
}

describe('AccountingBackendContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ session: createTestSession() });
  });

  it('provides a client to child components', () => {
    render(
      <AccountingBackendProvider>
        <ContextInspector />
      </AccountingBackendProvider>,
    );
    expect(screen.getByTestId('has-client').textContent).toBe('yes');
  });

  it('reports not production-ready without getApiToken', () => {
    render(
      <AccountingBackendProvider>
        <ContextInspector />
      </AccountingBackendProvider>,
    );
    expect(screen.getByTestId('prod-ready').textContent).toBe('no');
  });

  it('reports production-ready issues when token provider is missing', () => {
    render(
      <AccountingBackendProvider>
        <ContextInspector />
      </AccountingBackendProvider>,
    );
    // At least 1 issue: token provider not available
    const issueCount = Number(screen.getByTestId('prod-issues').textContent);
    expect(issueCount).toBeGreaterThanOrEqual(1);
  });

  it('reports closer to production-ready with getApiToken', () => {
    const mockTokenProvider = vi.fn().mockResolvedValue('test-token');
    render(
      <AccountingBackendProvider getApiToken={mockTokenProvider}>
        <ContextInspector />
      </AccountingBackendProvider>,
    );
    // Token provider issue is resolved; may still have URL issue in test env
    const issueCount = Number(screen.getByTestId('prod-issues').textContent);
    // Without getApiToken we had >=1 issues from token; with it, that issue is gone
    expect(issueCount).toBeLessThanOrEqual(1);
  });

  it('throws when useAccountingBackend is used outside provider', () => {
    // Suppress React error boundary console output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ContextInspector />)).toThrow(
      'useAccountingBackend must be used within AccountingBackendProvider',
    );
    spy.mockRestore();
  });
});
