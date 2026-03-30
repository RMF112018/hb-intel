import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from './renderWithProviders.js';
import {
  resetUiReviewProjectSetupStorage,
  UI_REVIEW_REQUESTS_STORAGE_KEY,
} from '../project-setup/backend/uiReviewProjectSetupClient.js';

const mockNavigate = vi.fn();
const liveClient = {
  listRequests: vi.fn(async () => []),
  submitRequest: vi.fn(async () => ({ requestId: 'req-live-created', projectId: 'proj-live-created' })),
  getProvisioningStatus: vi.fn(async () => undefined),
  retryProvisioning: vi.fn(async () => undefined),
  escalateProvisioning: vi.fn(async () => undefined),
};

vi.mock('@hbc/provisioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/provisioning')>();
  return {
    ...actual,
    createProvisioningApiClient: vi.fn(() => liveClient),
    useProvisioningSignalR: vi.fn(() => ({ isConnected: true })),
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ requestId: 'req-ui-review-failed' })),
    useNavigate: vi.fn(() => mockNavigate),
    useSearch: vi.fn(() => ({ mode: 'new-request', requestId: undefined })),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    Outlet: () => <div data-testid="root-outlet" />,
    createRootRoute: vi.fn(({ component }) => ({ component })),
  };
});

vi.mock('@hbc/features-estimating', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/features-estimating')>();
  return {
    ...actual,
    useProjectSetupDraft: vi.fn(() => ({
      draft: null,
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      resumeContext: { decision: 'fresh-start' as const },
      isSavePending: false,
      lastSavedAt: null,
    })),
  };
});

vi.mock('@hbc/step-wizard', () => ({
  HbcStepWizard: ({ config }: any) => (
    <div data-testid="step-wizard">
      <button data-testid="wizard-submit" onClick={() => config.onAllComplete()}>
        Submit All
      </button>
    </div>
  ),
}));

vi.mock('@hbc/session-state', () => ({
  HbcConnectivityBar: () => <div data-testid="connectivity-bar" />,
  HbcSyncStatusBadge: () => <div data-testid="sync-badge" />,
}));

vi.mock('../components/project-setup/ResumeBanner.js', () => ({
  ResumeBanner: () => null,
}));
vi.mock('../components/project-setup/DepartmentStepBody.js', () => ({
  DepartmentStepBody: () => <div data-testid="department-step" />,
}));
vi.mock('../components/project-setup/ProjectInfoStepBody.js', () => ({
  ProjectInfoStepBody: () => <div data-testid="project-info-step" />,
}));
vi.mock('../components/project-setup/TeamStepBody.js', () => ({
  TeamStepBody: () => <div data-testid="team-step" />,
}));
vi.mock('../components/project-setup/TemplateAddOnsStepBody.js', () => ({
  TemplateAddOnsStepBody: () => <div data-testid="template-addons-step" />,
}));
vi.mock('../components/project-setup/ReviewStepBody.js', () => ({
  ReviewStepBody: () => <div data-testid="review-step" />,
}));

const { ProjectSetupPage } = await import('../pages/ProjectSetupPage.js');
const { NewRequestPage } = await import('../pages/NewRequestPage.js');
const { RequestDetailPage } = await import('../pages/RequestDetailPage.js');
const { RootComponent } = await import('../router/root-route.js');
const {
  PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY,
  useProjectSetupBackend,
} = await import('../project-setup/backend/ProjectSetupBackendContext.js');
const { useProvisioningSignalR, createProvisioningApiClient } = await import(
  '@hbc/provisioning'
);
const { useParams, useSearch, useNavigate } = await import('@tanstack/react-router');

function BackendModeHarness({ children }: { children: React.ReactNode }) {
  const { setBackendMode } = useProjectSetupBackend();

  return (
    <>
      <button type="button" onClick={() => setBackendMode('ui-review')}>
        Harness UI Review
      </button>
      <button type="button" onClick={() => setBackendMode('production')}>
        Harness Production
      </button>
      {children}
    </>
  );
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('Estimating ui-review mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUiReviewProjectSetupStorage();
    window.localStorage.removeItem(PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY);
    liveClient.listRequests.mockResolvedValue([]);
    liveClient.submitRequest.mockResolvedValue({
      requestId: 'req-live-created',
      projectId: 'proj-live-created',
    });
    liveClient.getProvisioningStatus.mockResolvedValue(undefined);
    liveClient.retryProvisioning.mockResolvedValue(undefined);
    liveClient.escalateProvisioning.mockResolvedValue(undefined);
    vi.mocked(useParams).mockReturnValue({ requestId: 'req-ui-review-failed' } as any);
    vi.mocked(useSearch).mockReturnValue({ mode: 'new-request', requestId: undefined } as any);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate as any);
    vi.mocked(useProvisioningSignalR).mockReturnValue({ isConnected: true } as any);
  });

  it('renders the non-error review banner from the root route', () => {
    renderWithProviders(<RootComponent />, { backendMode: 'ui-review' });
    expect(
      screen.getByText(
        'UI Review mode is active. Backend connections are disabled, and Project Setup is using local sample data saved in this browser.',
      ),
    ).toBeInTheDocument();
  });

  it('hides the backend mode toggle unless runtime config enables it', () => {
    renderWithProviders(<RootComponent />, { backendMode: 'ui-review' });

    expect(screen.queryByText('Backend Mode')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'UI Review' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Production' })).not.toBeInTheDocument();
  });

  it('shows the backend mode toggle when runtime config enables it', () => {
    renderWithProviders(<RootComponent />, {
      backendMode: 'ui-review',
      allowBackendModeSwitch: true,
    });

    expect(screen.getByText('Backend Mode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UI Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Production' })).toBeInTheDocument();
    expect(screen.getByText('Mode: UI Review. Saved in this browser.')).toBeInTheDocument();
  });

  it('prefers the persisted browser override when switching is enabled', () => {
    window.localStorage.setItem(PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY, 'ui-review');

    renderWithProviders(<RootComponent />, {
      backendMode: 'production',
      allowBackendModeSwitch: true,
    });

    expect(screen.getByText('Mode: UI Review. Saved in this browser.')).toBeInTheDocument();
    expect(createProvisioningApiClient).not.toHaveBeenCalled();
  });

  it('switches between production and ui-review without navigating away', async () => {
    renderWithProviders(<RootComponent />, {
      backendMode: 'ui-review',
      allowBackendModeSwitch: true,
    });

    expect(createProvisioningApiClient).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Production' }));

    await waitFor(() => {
      expect(screen.getByText('Mode: Production. Saved in this browser.')).toBeInTheDocument();
    });
    expect(createProvisioningApiClient).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'UI Review' }));

    await waitFor(() => {
      expect(screen.getByText('Mode: UI Review. Saved in this browser.')).toBeInTheDocument();
    });
    expect(createProvisioningApiClient).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders seeded project setup requests without creating the live client', async () => {
    renderWithProviders(<ProjectSetupPage />, { backendMode: 'ui-review' });

    await waitFor(() => {
      expect(screen.getByText(/Raleigh Mixed-Use Tower/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Ballantyne Medical Office/)).toBeInTheDocument();
    expect(createProvisioningApiClient).not.toHaveBeenCalled();
  });

  it('creates a request in ui-review mode and persists it to localStorage', async () => {
    renderWithProviders(<NewRequestPage />, { backendMode: 'ui-review' });

    fireEvent.click(screen.getByTestId('wizard-submit'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/project-setup/$requestId',
        }),
      );
    });

    const requests = JSON.parse(
      window.localStorage.getItem(UI_REVIEW_REQUESTS_STORAGE_KEY) ?? '[]',
    ) as Array<{ requestId: string; projectName: string }>;
    expect(requests.length).toBe(6);
    const createdRequestId = vi.mocked(mockNavigate).mock.calls[0]?.[0]?.params?.requestId;
    expect(requests.some((request) => request.requestId === createdRequestId)).toBe(true);
  });

  it('renders detail against local sample data without live SignalR behavior', async () => {
    renderWithProviders(<RequestDetailPage />, {
      backendMode: 'ui-review',
      tier: 'standard',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Ballantyne Medical Office').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Failure Detail')).toBeInTheDocument();
    expect(screen.queryByText(/Real-time connection lost/)).not.toBeInTheDocument();
    expect(vi.mocked(useProvisioningSignalR).mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ enabled: false }),
    );
    expect(createProvisioningApiClient).not.toHaveBeenCalled();
  });

  it('ignores a stale production list response after switching to ui-review', async () => {
    const deferred = createDeferred<any[]>();
    liveClient.listRequests.mockReturnValueOnce(deferred.promise);

    renderWithProviders(
      <BackendModeHarness>
        <ProjectSetupPage />
      </BackendModeHarness>,
      {
        backendMode: 'production',
        allowBackendModeSwitch: true,
      },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Harness UI Review' }));

    await waitFor(() => {
      expect(screen.getByText(/Raleigh Mixed-Use Tower/)).toBeInTheDocument();
    });

    deferred.resolve([]);

    await waitFor(() => {
      expect(screen.queryByText('Unable to load project setup requests. Check your connection and try again.')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Raleigh Mixed-Use Tower/)).toBeInTheDocument();
  });

  it('keeps the new-request wizard rendered across backend mode switches', async () => {
    renderWithProviders(
      <BackendModeHarness>
        <NewRequestPage />
      </BackendModeHarness>,
      {
        backendMode: 'production',
        allowBackendModeSwitch: true,
      },
    );

    expect(screen.getByTestId('step-wizard')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Harness UI Review' }));

    await waitFor(() => {
      expect(screen.getByTestId('step-wizard')).toBeInTheDocument();
    });
  });

  it('retries failed requests against localStorage-backed data', async () => {
    renderWithProviders(<RequestDetailPage />, {
      backendMode: 'ui-review',
      tier: 'standard',
    });

    await waitFor(() => {
      expect(screen.getByText('Retry Provisioning')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry Provisioning'));

    await waitFor(() => {
      const storedRequests = JSON.parse(
        window.localStorage.getItem(UI_REVIEW_REQUESTS_STORAGE_KEY) ?? '[]',
      ) as Array<{ projectId: string; state: string }>;
      expect(
        storedRequests.find((request) => request.projectId === 'proj-ui-review-failed')?.state,
      ).toBe('Provisioning');
    });
  });
});
