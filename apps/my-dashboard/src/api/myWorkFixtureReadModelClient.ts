/**
 * My Work fixture read-model client — deterministic envelope source.
 *
 * Returns B04 scenario envelopes from `@hbc/models/myWork/fixtures`.
 * Default posture is the AVAILABLE scenario; when constructed with
 * `simulateBackendUnavailable: true` it returns the `backend-unavailable`
 * scenario for every route — the factory uses this posture as the
 * deterministic fallback when backend prerequisites are missing or a
 * live call fails.
 *
 * Contract-only: no HTTP, no token logic.
 *
 * @module api/myWorkFixtureReadModelClient
 */

import type {
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';
import { MY_WORK_FIXTURE_GENERATED_AT_UTC, MY_WORK_FIXTURES } from '@hbc/models/myWork/fixtures';

import type { IMyWorkReadModelClient } from './myWorkReadModelClient.js';

export interface MyWorkFixtureReadModelClientOptions {
  readonly simulateBackendUnavailable?: boolean;
  readonly now?: () => string;
}

class MyWorkFixtureReadModelClient implements IMyWorkReadModelClient {
  private readonly now: () => string;
  private readonly simulateBackendUnavailable: boolean;

  constructor(options: MyWorkFixtureReadModelClientOptions = {}) {
    this.now = options.now ?? (() => MY_WORK_FIXTURE_GENERATED_AT_UTC);
    this.simulateBackendUnavailable = options.simulateBackendUnavailable === true;
  }

  async getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>> {
    const base = this.simulateBackendUnavailable
      ? MY_WORK_FIXTURES.home['backend-unavailable']
      : MY_WORK_FIXTURES.home.available;
    return { ...base, generatedAtUtc: this.now() };
  }

  async getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
    if (this.simulateBackendUnavailable) {
      const base = MY_WORK_FIXTURES['adobe-sign-action-queue']['backend-unavailable'];
      return { ...base, generatedAtUtc: this.now() };
    }
    const scenario =
      typeof query?.cursor === 'string' && query.cursor.length > 0
        ? 'available-paged'
        : 'available';
    const base = MY_WORK_FIXTURES['adobe-sign-action-queue'][scenario];
    return { ...base, generatedAtUtc: this.now() };
  }
}

export function createMyWorkFixtureReadModelClient(
  options?: MyWorkFixtureReadModelClientOptions,
): IMyWorkReadModelClient {
  return new MyWorkFixtureReadModelClient(options);
}
