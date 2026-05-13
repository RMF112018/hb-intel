/**
 * My Work read-model client composition seam.
 *
 * Production wiring path:
 *   <MyDashboardApp> mounts <MyWorkReadModelClientProvider getApiToken={fn}>
 *   → provider constructs an IMyWorkReadModelClient via createMyWorkReadModelClient(...)
 *   → useMyWorkReadModelClient() in any descendant returns that client
 *   → per-envelope hooks in ./useMyWorkReadModelEnvelope invoke the client methods.
 *
 * Test wiring path:
 *   render(<MyWorkReadModelClientProvider client={stub}>...</...>)
 *   → provider exposes the stub directly, bypassing the factory.
 *
 * The factory itself decides backend-vs-fixture based on runtimeConfig globals
 * (apps/my-dashboard/src/config/runtimeConfig.ts). When backend mode is selected
 * but backendBaseUrl or getApiToken is absent, the factory degrades to a fixture
 * client posing as backend-unavailable — surfaces never see a runtime crash.
 *
 * @module runtime/MyWorkReadModelClientProvider
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createMyWorkReadModelClient } from '../api/myWorkReadModelClientFactory.js';
import type { GetApiToken, IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';

const MyWorkReadModelClientContext = createContext<IMyWorkReadModelClient | null>(null);

export interface MyWorkReadModelClientProviderProps {
  /**
   * Test/override seam. When supplied, the provider exposes this instance
   * directly and never invokes the factory.
   */
  readonly client?: IMyWorkReadModelClient;
  /**
   * Production seam. Passed to the factory; production-mode backend client
   * acquires a bearer token via this callback.
   */
  readonly getApiToken?: GetApiToken;
  readonly children: ReactNode;
}

export function MyWorkReadModelClientProvider({
  client,
  getApiToken,
  children,
}: MyWorkReadModelClientProviderProps): JSX.Element {
  const resolvedClient = useMemo<IMyWorkReadModelClient>(() => {
    if (client) return client;
    return createMyWorkReadModelClient(getApiToken ? { getApiToken } : {});
  }, [client, getApiToken]);

  return (
    <MyWorkReadModelClientContext.Provider value={resolvedClient}>
      {children}
    </MyWorkReadModelClientContext.Provider>
  );
}

export function useMyWorkReadModelClient(): IMyWorkReadModelClient {
  const ctx = useContext(MyWorkReadModelClientContext);
  if (!ctx) {
    throw new Error('useMyWorkReadModelClient must be used inside <MyWorkReadModelClientProvider>');
  }
  return ctx;
}
