/**
 * PCC SPFx read-model client factory (Phase 3 / Wave 4 / Prompts 02 + 03).
 *
 * Authoritative read-model mode contract for the SPFx app. Owns the
 * public types `PccReadModelMode` and `IPccReadModelConfig` so the
 * API seam does not depend on the app entry point. Mount-side config
 * (`IPccMountConfig.readModel`) carries the same type forward via a
 * type-only import.
 *
 * Mode behavior:
 *   - default mode is `fixture`;
 *   - `fixture` mode returns the fixture client;
 *   - `backend` mode with a non-empty `backendBaseUrl` returns the
 *     real backend HTTP client (Prompt 03);
 *   - `backend` mode with missing/empty/whitespace `backendBaseUrl`
 *     returns the fixture client configured with
 *     `simulateBackendUnavailable: true`, surfacing
 *     `sourceStatus: 'backend-unavailable'` per W4-OD-007.
 */

import type { IPccReadModelClient } from './pccReadModelClient.js';
import { createPccFixtureReadModelClient } from './pccFixtureReadModelClient.js';
import { createPccBackendReadModelClient } from './pccBackendReadModelClient.js';

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
    const trimmedBaseUrl = resolved.backendBaseUrl?.trim() ?? '';
    if (!trimmedBaseUrl) {
      return createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    }
    return createPccBackendReadModelClient({ backendBaseUrl: trimmedBaseUrl });
  }

  return createPccFixtureReadModelClient({
    simulateBackendUnavailable: resolved.simulateBackendUnavailable,
  });
}
