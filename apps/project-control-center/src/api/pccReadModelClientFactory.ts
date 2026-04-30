/**
 * PCC SPFx read-model client factory (Phase 3 / Wave 4 / Prompt 02).
 *
 * Authoritative read-model mode contract for the SPFx app. Owns the
 * public types `PccReadModelMode` and `IPccReadModelConfig` so that
 * the API seam does not depend on the app entry point. Mount-side
 * config (`IPccMountConfig.readModel`) carries the same type forward
 * via a type-only import.
 *
 * Wave 4 / Prompt 02 contract:
 *   - default mode is `fixture`;
 *   - `fixture` mode returns the existing fixture client;
 *   - `backend` mode is recognized but does NOT cut over to a real
 *     HTTP client in this prompt. Instead it returns the fixture
 *     client configured with `simulateBackendUnavailable: true`,
 *     surfacing `sourceStatus: 'backend-unavailable'` per W4-OD-007;
 *   - missing `backendBaseUrl` does not throw and does not fetch;
 *   - no `fetch(`, no HTTP, no tenant runtime.
 *
 * Prompt 03 will replace the backend-mode branch with the real
 * backend HTTP client behind this same factory entry point.
 */

import type { IPccReadModelClient } from './pccReadModelClient.js';
import { createPccFixtureReadModelClient } from './pccFixtureReadModelClient.js';

export type PccReadModelMode = 'fixture' | 'backend';

export interface IPccReadModelConfig {
  readonly readModelMode?: PccReadModelMode;
  readonly backendBaseUrl?: string;
  readonly simulateBackendUnavailable?: boolean;
}

export interface IResolvedPccReadModelConfig {
  readonly readModelMode: PccReadModelMode;
  readonly backendBaseUrl?: string;
  readonly simulateBackendUnavailable: boolean;
}

export function resolvePccReadModelConfig(
  input?: IPccReadModelConfig,
): IResolvedPccReadModelConfig {
  return {
    readModelMode: input?.readModelMode ?? 'fixture',
    backendBaseUrl: input?.backendBaseUrl,
    simulateBackendUnavailable: input?.simulateBackendUnavailable ?? false,
  };
}

export function createPccReadModelClient(
  config?: IPccReadModelConfig,
): IPccReadModelClient {
  const resolved = resolvePccReadModelConfig(config);

  if (resolved.readModelMode === 'backend') {
    return createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
  }

  return createPccFixtureReadModelClient({
    simulateBackendUnavailable: resolved.simulateBackendUnavailable,
  });
}
