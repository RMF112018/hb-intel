import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../App.js';
import { createTestSession } from './renderWithProviders.js';
import { useAuthStore } from '@hbc/auth';
import { useProvisioningStore } from '@hbc/provisioning';
import {
  _resetConfig,
  setRuntimeConfig,
} from '../config/runtimeConfig.js';
import {
  resetUiReviewProjectSetupStorage,
} from '../project-setup/backend/uiReviewProjectSetupClient.js';

vi.mock('@hbc/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/auth')>();
  return {
    ...actual,
    useCurrentSession: vi.fn(() => actual.useAuthStore.getState().session),
  };
});

describe('Estimating App route session-state integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUiReviewProjectSetupStorage();
    _resetConfig();
    setRuntimeConfig({ backendMode: 'ui-review' });
    useAuthStore.setState({ session: createTestSession() });
    useProvisioningStore.setState({
      requests: [],
      requestsLoading: false,
      requestsError: null,
      statusByProjectId: {},
      latestEventByProjectId: {},
      signalRConnected: false,
    });
  });

  it('navigates from list to new request without session-state provider errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Project Setup Requests')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'New Project Setup Request' }));

    await waitFor(() => {
      expect(screen.getByText('New Project Setup Request')).toBeInTheDocument();
    });

    expect(screen.queryByText(/useSessionState must be used within a SessionStateProvider/i)).not.toBeInTheDocument();
    expect(
      errorSpy.mock.calls.some((call) => call.some(
        (arg) => typeof arg === 'string' && arg.includes('useSessionState must be used within a SessionStateProvider'),
      )),
    ).toBe(false);

    errorSpy.mockRestore();
  });
});
