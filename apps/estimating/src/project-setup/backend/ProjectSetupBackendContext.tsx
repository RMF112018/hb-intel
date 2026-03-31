/**
 * P3-07: Project Setup Auth Architecture Freeze
 *
 * Canonical auth model for the Project Setup domain:
 *
 * 1. TOKEN ACQUISITION (frontend → backend):
 *    - SPFx production: `createSpfxApiTokenProvider()` in mount.tsx acquires
 *      audience-scoped tokens via SPFx `aadTokenProviderFactory`. The audience
 *      is `API_AUDIENCE` (app registration client ID). Tokens refresh automatically.
 *    - PWA/dev fallback: `createSessionTokenFactory()` extracts session token
 *      from MSAL. Single-capture — safe for short sessions, not for production.
 *    - ui-review mode: `createDevTokenFactory()` returns a placeholder. No real
 *      backend calls are made; local mock client handles all requests.
 *
 * 2. TOKEN VALIDATION (backend):
 *    - `validateToken()` in middleware/validateToken.ts verifies JWT against
 *      Azure Entra ID JWKS. Accepts v1 and v2 issuers. Requires explicit
 *      `API_AUDIENCE` env var in production (no implicit fallback).
 *    - `withAuth()` in middleware/auth.ts wraps all HTTP routes (except health
 *      and timer triggers, documented in AUTH_EXCEPTIONS).
 *
 * 3. MODE GATING:
 *    - `getBackendMode()` in runtimeConfig.ts resolves production vs ui-review.
 *    - `checkProductionReadiness()` verifies Function App URL + token provider.
 *    - This context falls back to ui-review if production prerequisites fail.
 *
 * 4. TRANSITIONAL SURFACES (out of Project Setup domain scope):
 *    - Accounting and Admin apps still use deprecated `resolveSessionToken()`
 *      for PWA-based auth. These are separate app surfaces with their own
 *      auth lifecycle and are not gated by Project Setup readiness.
 *
 * @see ADR-0053 (auth dual-mode foundation)
 * @see Phase-3_Auth_Action-Plan.md
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient, useProvisioningStore } from '@hbc/provisioning';
import {
  getBackendMode,
  getAllowBackendModeSwitch,
  getFunctionAppUrl,
  checkProductionReadiness,
  type BackendMode,
  type IProductionModeReadiness,
} from '../../config/runtimeConfig.js';
import {
  createSpfxTokenFactory,
  createSessionTokenFactory,
  createDevTokenFactory,
} from '../../utils/resolveSessionToken.js';
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
  /**
   * P3-02: Production-mode readiness assessment.
   * `null` when mode is ui-review (readiness not applicable).
   */
  productionReadiness: IProductionModeReadiness | null;
  /**
   * P3-02: True when production mode was requested but prerequisites
   * blocked activation and the provider fell back to ui-review.
   */
  productionBlocked: boolean;
  /**
   * P3-02: Token factory for consumers that need direct token access
   * (e.g., SignalR negotiate). Returns a fresh token on each call in
   * production mode. Returns a dev placeholder in ui-review mode.
   */
  getToken: () => Promise<string>;
}

export interface ProjectSetupBackendProviderProps {
  children: ReactNode;
  /**
   * P3-02: SPFx API token provider created via `createSpfxApiTokenProvider()`.
   * When provided, production mode uses this for fresh, audience-scoped tokens.
   * When absent, production readiness will report a missing token provider.
   */
  getApiToken?: () => Promise<string>;
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

/**
 * P3-02: Resolve the best available token factory for the current runtime.
 *
 * Priority:
 *   1. SPFx API token provider (fresh, audience-scoped — preferred production path)
 *   2. Session-based token extraction (PWA/MSAL fallback)
 *   3. Dev placeholder (non-production only)
 */
function resolveTokenFactory(
  getApiToken: (() => Promise<string>) | undefined,
  getSession: () => ReturnType<typeof useCurrentSession>,
  isProduction: boolean,
): () => Promise<string> {
  // Preferred: SPFx API token provider
  if (getApiToken) {
    return createSpfxTokenFactory(getApiToken);
  }

  // Fallback: session-based extraction (PWA/MSAL)
  // This path is valid when running outside SPFx (e.g., Vite dev with MSAL)
  if (isProduction) {
    return createSessionTokenFactory(getSession);
  }

  // Non-production: dev placeholder
  return createDevTokenFactory();
}

export function ProjectSetupBackendProvider({
  children,
  getApiToken,
}: ProjectSetupBackendProviderProps): ReactNode {
  const session = useCurrentSession();
  const configuredBackendMode = getBackendMode();
  const canSwitchBackendMode = getAllowBackendModeSwitch();
  const resolvedConfiguredMode = canSwitchBackendMode
    ? readStoredBackendModeOverride() ?? configuredBackendMode
    : configuredBackendMode;
  const [requestedMode, setRequestedModeState] = useState<BackendMode>(() => (
    resolvedConfiguredMode
  ));

  const setBackendMode = useCallback((mode: BackendMode) => {
    if (!canSwitchBackendMode) {
      return;
    }

    writeStoredBackendModeOverride(mode === configuredBackendMode ? undefined : mode);
    resetProvisioningRuntimeState();
    setRequestedModeState(mode);
  }, [canSwitchBackendMode, configuredBackendMode]);

  useEffect(() => {
    setRequestedModeState((currentMode) => (
      currentMode === resolvedConfiguredMode ? currentMode : resolvedConfiguredMode
    ));
  }, [resolvedConfiguredMode]);

  const contextValue = useMemo<IProjectSetupBackendContextValue>(() => {
    // P3-02: Check production readiness when production mode is requested.
    const productionRequested = requestedMode === 'production';
    const readiness = productionRequested
      ? checkProductionReadiness(!!getApiToken)
      : null;

    // P3-02: If production prerequisites aren't met, fall back to ui-review
    // with a diagnostic flag so the UI can explain the blockage.
    const productionBlocked = productionRequested && readiness !== null && !readiness.ready;
    const effectiveMode: BackendMode = productionBlocked ? 'ui-review' : requestedMode;
    const isUiReview = effectiveMode === 'ui-review';

    if (isUiReview) {
      const submittedBy =
        session?.user?.email ?? session?.providerIdentityRef ?? 'ui-review@hbintel.local';
      return {
        backendMode: effectiveMode,
        isUiReview: true,
        client: createUiReviewProjectSetupClient(submittedBy),
        canSwitchBackendMode,
        setBackendMode,
        productionReadiness: readiness,
        productionBlocked,
        getToken: createDevTokenFactory(),
      };
    }

    const functionAppUrl = getFunctionAppUrl();
    const getSessionRef = (): ReturnType<typeof useCurrentSession> => session;
    const tokenFactory = resolveTokenFactory(getApiToken, getSessionRef, true);

    return {
      backendMode: effectiveMode,
      isUiReview: false,
      functionAppUrl,
      client: createLiveProjectSetupClient(functionAppUrl, tokenFactory),
      canSwitchBackendMode,
      setBackendMode,
      productionReadiness: readiness,
      productionBlocked: false,
      getToken: tokenFactory,
    };
  }, [requestedMode, canSwitchBackendMode, getApiToken, session, setBackendMode]);

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
