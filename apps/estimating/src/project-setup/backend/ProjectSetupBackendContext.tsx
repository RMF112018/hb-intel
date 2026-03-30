import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient, useProvisioningStore } from '@hbc/provisioning';
import {
  getBackendMode,
  getAllowBackendModeSwitch,
  getFunctionAppUrl,
  type BackendMode,
} from '../../config/runtimeConfig.js';
import { resolveSessionToken } from '../../utils/resolveSessionToken.js';
import { createUiReviewProjectSetupClient } from './uiReviewProjectSetupClient.js';
import type { IProjectSetupClient } from './types.js';

export const PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY =
  'hb-intel:estimating:project-setup:backend-mode-override';

export interface IProjectSetupBackendContextValue {
  backendMode: BackendMode;
  isUiReview: boolean;
  client: IProjectSetupClient;
  functionAppUrl?: string;
  canSwitchBackendMode: boolean;
  setBackendMode: (mode: BackendMode) => void;
}

const ProjectSetupBackendContext =
  createContext<IProjectSetupBackendContextValue | null>(null);

function readStoredBackendModeOverride(): BackendMode | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY);
    return stored === 'production' || stored === 'ui-review' ? stored : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredBackendModeOverride(mode: BackendMode | undefined): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (mode) {
      window.localStorage.setItem(PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY, mode);
      return;
    }
    window.localStorage.removeItem(PROJECT_SETUP_BACKEND_MODE_OVERRIDE_STORAGE_KEY);
  } catch {
    // Ignore localStorage failures; runtime defaults still apply.
  }
}

function resetProvisioningRuntimeState(): void {
  useProvisioningStore.setState({
    requests: [],
    requestsLoading: false,
    requestsError: null,
    statusByProjectId: {},
    latestEventByProjectId: {},
    signalRConnected: false,
  });
}

function createLiveProjectSetupClient(
  functionAppUrl: string,
  getToken: () => Promise<string>,
): IProjectSetupClient {
  const client = createProvisioningApiClient(functionAppUrl, getToken);
  return {
    listRequests: () => client.listRequests(),
    submitRequest: (data) => client.submitRequest(data),
    getProvisioningStatus: (projectId) => client.getProvisioningStatus(projectId),
    retryProvisioning: (projectId) => client.retryProvisioning(projectId),
    escalateProvisioning: (projectId, escalatedBy) =>
      client.escalateProvisioning(projectId, escalatedBy),
  };
}

export function ProjectSetupBackendProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const session = useCurrentSession();
  const configuredBackendMode = getBackendMode();
  const canSwitchBackendMode = getAllowBackendModeSwitch();
  const resolvedConfiguredMode = canSwitchBackendMode
    ? readStoredBackendModeOverride() ?? configuredBackendMode
    : configuredBackendMode;
  const [backendMode, setBackendModeState] = useState<BackendMode>(() => (
    resolvedConfiguredMode
  ));
  const isUiReview = backendMode === 'ui-review';

  const setBackendMode = useCallback((mode: BackendMode) => {
    if (!canSwitchBackendMode) {
      return;
    }

    writeStoredBackendModeOverride(mode === configuredBackendMode ? undefined : mode);
    resetProvisioningRuntimeState();
    setBackendModeState(mode);
  }, [canSwitchBackendMode, configuredBackendMode]);

  useEffect(() => {
    setBackendModeState((currentMode) => (
      currentMode === resolvedConfiguredMode ? currentMode : resolvedConfiguredMode
    ));
  }, [resolvedConfiguredMode]);

  const contextValue = useMemo<IProjectSetupBackendContextValue>(() => {
    if (isUiReview) {
      const submittedBy =
        session?.user?.email ?? session?.providerIdentityRef ?? 'ui-review@hbintel.local';
      return {
        backendMode,
        isUiReview: true,
        client: createUiReviewProjectSetupClient(submittedBy),
        canSwitchBackendMode,
        setBackendMode,
      };
    }

    const functionAppUrl = getFunctionAppUrl();
    const authToken = resolveSessionToken(session);
    return {
      backendMode,
      isUiReview: false,
      functionAppUrl,
      client: createLiveProjectSetupClient(functionAppUrl, async () => authToken),
      canSwitchBackendMode,
      setBackendMode,
    };
  }, [backendMode, canSwitchBackendMode, isUiReview, session, setBackendMode]);

  return (
    <ProjectSetupBackendContext.Provider value={contextValue}>
      {children}
    </ProjectSetupBackendContext.Provider>
  );
}

export function useProjectSetupBackend(): IProjectSetupBackendContextValue {
  const context = useContext(ProjectSetupBackendContext);
  if (!context) {
    throw new Error(
      'useProjectSetupBackend must be used within ProjectSetupBackendProvider.',
    );
  }
  return context;
}
