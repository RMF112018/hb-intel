/**
 * My Work mock read-model provider.
 *
 * Returns the B04 fixture envelopes from `@hbc/models/myWork/fixtures`.
 * `simulateBackendUnavailable: true` produces the `backend-unavailable`
 * scenario for both routes; a non-empty `query.cursor` selects the
 * `available-paged` scenario for the Adobe queue. The injected
 * `now()` callback stamps the top-level envelope `generatedAtUtc`
 * while leaving the fixture-baked inner timestamps untouched.
 *
 * Contract-only: no Adobe API call, no OAuth, no token store.
 *
 * @module hosts/my-work-read-model/read-models/my-work-mock-read-model-provider
 */

import type {
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkHomeReadModel,
  MyProjectLinksReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';
import { MY_WORK_FIXTURE_GENERATED_AT_UTC, MY_WORK_FIXTURES } from '@hbc/models/myWork/fixtures';

import type {
  IMyWorkReadModelProvider,
  MyWorkMockReadModelProviderOptions,
  MyWorkReadContext,
} from './my-work-read-model-provider.js';

export class MyWorkMockReadModelProvider implements IMyWorkReadModelProvider {
  private readonly simulateBackendUnavailable: boolean;
  private readonly now: () => string;

  constructor(options: MyWorkMockReadModelProviderOptions = {}) {
    this.simulateBackendUnavailable = options.simulateBackendUnavailable === true;
    this.now = options.now ?? (() => MY_WORK_FIXTURE_GENERATED_AT_UTC);
  }

  async getMyWorkHome(
    _context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>> {
    const base = this.simulateBackendUnavailable
      ? MY_WORK_FIXTURES.home['backend-unavailable']
      : MY_WORK_FIXTURES.home.available;
    return { ...base, generatedAtUtc: this.now() };
  }

  async getAdobeSignActionQueue(
    _context: MyWorkReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
    if (this.simulateBackendUnavailable) {
      const base = MY_WORK_FIXTURES['adobe-sign-action-queue']['backend-unavailable'];
      return { ...base, generatedAtUtc: this.now() };
    }
    const scenario =
      typeof query.cursor === 'string' && query.cursor.length > 0 ? 'available-paged' : 'available';
    const base = MY_WORK_FIXTURES['adobe-sign-action-queue'][scenario];
    return { ...base, generatedAtUtc: this.now() };
  }

  async getMyProjectLinks(
    _context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>> {
    const base = this.simulateBackendUnavailable
      ? MY_WORK_FIXTURES['project-links']['backend-unavailable']
      : MY_WORK_FIXTURES['project-links'].available;
    return { ...base, generatedAtUtc: this.now() };
  }
}
