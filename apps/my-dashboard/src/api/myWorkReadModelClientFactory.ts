/**
 * My Work read-model client factory.
 *
 * Selects between the deterministic fixture client and the protected
 * backend client based on the B02 runtime mode (`production` →
 * `backend`, `ui-review` → `fixture`) or an explicit override. When
 * backend mode is requested but the base URL or token callback is
 * absent, the factory returns a fixture client posing as
 * backend-unavailable so React surfaces never see a runtime error.
 *
 * @module api/myWorkReadModelClientFactory
 */

import { getBackendMode, getFunctionAppUrl } from '../config/runtimeConfig.js';

import {
  createMyWorkBackendReadModelClient,
  type MyWorkReadModelFetch,
} from './myWorkBackendReadModelClient.js';
import { createMyWorkFixtureReadModelClient } from './myWorkFixtureReadModelClient.js';
import type {
  GetApiToken,
  IMyWorkReadModelClient,
  MyWorkReadModelMode,
} from './myWorkReadModelClient.js';

export interface MyWorkReadModelClientFactoryConfig {
  readonly readModelMode?: MyWorkReadModelMode;
  readonly backendBaseUrl?: string;
  readonly getApiToken?: GetApiToken;
  readonly simulateBackendUnavailable?: boolean;
  readonly now?: () => string;
  readonly fetch?: MyWorkReadModelFetch;
}

const resolveModeFromRuntime = (): MyWorkReadModelMode =>
  getBackendMode() === 'production' ? 'backend' : 'fixture';

const tryGetFunctionAppUrl = (): string | undefined => {
  try {
    return getFunctionAppUrl();
  } catch {
    return undefined;
  }
};

export function createMyWorkReadModelClient(
  config: MyWorkReadModelClientFactoryConfig = {},
): IMyWorkReadModelClient {
  const mode = config.readModelMode ?? resolveModeFromRuntime();

  if (mode !== 'backend') {
    return createMyWorkFixtureReadModelClient({
      now: config.now,
      simulateBackendUnavailable: config.simulateBackendUnavailable === true,
      dataPath: 'fixture-ui-review',
    });
  }

  const resolvedBaseUrl = config.backendBaseUrl?.trim() || tryGetFunctionAppUrl() || '';
  if (!resolvedBaseUrl || !config.getApiToken) {
    return createMyWorkFixtureReadModelClient({
      now: config.now,
      simulateBackendUnavailable: true,
      dataPath: 'backend-unavailable-fallback',
    });
  }

  const fallback = createMyWorkFixtureReadModelClient({
    now: config.now,
    simulateBackendUnavailable: true,
    dataPath: 'backend-unavailable-fallback',
  });

  return createMyWorkBackendReadModelClient({
    backendBaseUrl: resolvedBaseUrl,
    getApiToken: config.getApiToken,
    fallback,
    fetch: config.fetch,
  });
}
