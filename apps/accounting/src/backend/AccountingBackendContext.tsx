/**
 * Centralized backend context for the Accounting surface.
 *
 * Manages API client lifecycle, token factory resolution, and production
 * readiness awareness. Pages consume the client via useAccountingBackend()
 * instead of creating inline instances.
 *
 * Simplified from the Project Setup pattern — no backend mode switching
 * or ui-review mock client, since Accounting is a reviewer-only surface.
 */
import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient, type IProvisioningApiClient } from '@hbc/provisioning';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';
import {
  getFunctionAppUrl,
  checkProductionReadiness,
  type IProductionModeReadiness,
} from '../config/runtimeConfig.js';

export interface IAccountingBackendContextValue {
  /** Provisioning API client — always available (may use best-effort config). */
  client: IProvisioningApiClient;
  /** Token factory used by the client. */
  getToken: () => Promise<string>;
  /** Production readiness assessment. */
  productionReadiness: IProductionModeReadiness;
}

const AccountingBackendContext = createContext<IAccountingBackendContextValue | null>(null);

interface AccountingBackendProviderProps {
  children: ReactNode;
  /** SPFx API token provider from mount.tsx — preferred production path. */
  getApiToken?: () => Promise<string>;
}

/**
 * Provides a centralized API client and token factory to all Accounting pages.
 *
 * Token resolution priority:
 *   1. SPFx API token provider (audience-scoped, production)
 *   2. Session-based token extraction (dev/fallback)
 *   3. Placeholder (pre-auth, surfaces clear error on API call)
 */
export function AccountingBackendProvider({
  children,
  getApiToken,
}: AccountingBackendProviderProps): ReactNode {
  const session = useCurrentSession();

  // Stable reference for session-based token factory
  const sessionRef = useCallback(() => session, [session]);

  // Resolve token factory with priority chain
  const getToken = useMemo<() => Promise<string>>(() => {
    // 1. SPFx audience-scoped token provider (production)
    if (getApiToken) return getApiToken;
    // 2. Session-based extraction (dev/MSAL fallback)
    if (session) return createSessionTokenFactory(sessionRef);
    // 3. Pre-auth placeholder — API calls will fail with a clear error
    return async () => {
      throw new Error(
        '[HB-Intel Accounting] No auth token available. ' +
        'Session has not been established yet.',
      );
    };
  }, [getApiToken, session, sessionRef]);

  // Resolve Function App URL — graceful fallback for dev/test
  const functionAppUrl = useMemo(() => {
    try {
      return getFunctionAppUrl();
    } catch {
      // In dev/test mode without VITE_FUNCTION_APP_URL configured,
      // fall back to empty string. API calls will fail with a clear
      // network error rather than a config error during rendering.
      return '';
    }
  }, []);

  // Create the API client
  const client = useMemo(
    () => createProvisioningApiClient(functionAppUrl, getToken),
    [functionAppUrl, getToken],
  );

  // Assess production readiness
  const productionReadiness = useMemo(
    () => checkProductionReadiness(!!getApiToken),
    [getApiToken],
  );

  const value = useMemo<IAccountingBackendContextValue>(
    () => ({ client, getToken, productionReadiness }),
    [client, getToken, productionReadiness],
  );

  return (
    <AccountingBackendContext.Provider value={value}>
      {children}
    </AccountingBackendContext.Provider>
  );
}

/**
 * Access the Accounting backend context.
 * Must be used within an AccountingBackendProvider.
 */
export function useAccountingBackend(): IAccountingBackendContextValue {
  const context = useContext(AccountingBackendContext);
  if (!context) {
    throw new Error(
      'useAccountingBackend must be used within AccountingBackendProvider.',
    );
  }
  return context;
}
