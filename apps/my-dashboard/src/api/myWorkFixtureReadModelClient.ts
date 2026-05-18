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
  AdobeSignActionLinkResolveResult,
  MyProjectLinksReadModel,
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkHomeReadModel,
  MyWorkReadModelDataPath,
  MyWorkReadModelEnvelope,
  ResolveAdobeSignActionLinkRequest,
} from '@hbc/models/myWork';
import { MY_WORK_FIXTURE_GENERATED_AT_UTC, MY_WORK_FIXTURES } from '@hbc/models/myWork/fixtures';

import type {
  AdobeSignOAuthStartInput,
  AdobeSignOAuthStartResponse,
  IMyWorkReadModelClient,
} from './myWorkReadModelClient.js';

export interface MyWorkFixtureReadModelClientOptions {
  readonly simulateBackendUnavailable?: boolean;
  readonly now?: () => string;
  /**
   * Truthful data-path classification stamped on every envelope returned
   * by this client. The factory passes `'backend-unavailable-fallback'`
   * for production-posture fallbacks and `'fixture-ui-review'` for
   * explicit ui-review usage. Direct test/preview callers default to
   * `'fixture-ui-review'` — never to `'backend-live'` (only the backend
   * client may stamp that).
   */
  readonly dataPath?: MyWorkReadModelDataPath;
}

class MyWorkFixtureReadModelClient implements IMyWorkReadModelClient {
  private readonly now: () => string;
  private readonly simulateBackendUnavailable: boolean;
  private readonly dataPath: MyWorkReadModelDataPath;

  constructor(options: MyWorkFixtureReadModelClientOptions = {}) {
    this.now = options.now ?? (() => MY_WORK_FIXTURE_GENERATED_AT_UTC);
    this.simulateBackendUnavailable = options.simulateBackendUnavailable === true;
    this.dataPath = options.dataPath ?? 'fixture-ui-review';
  }

  async getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>> {
    const base = this.simulateBackendUnavailable
      ? MY_WORK_FIXTURES.home['backend-unavailable']
      : MY_WORK_FIXTURES.home.available;
    return { ...base, generatedAtUtc: this.now(), dataPath: this.dataPath };
  }

  async getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
    if (this.simulateBackendUnavailable) {
      const base = MY_WORK_FIXTURES['adobe-sign-action-queue']['backend-unavailable'];
      return { ...base, generatedAtUtc: this.now(), dataPath: this.dataPath };
    }
    const scenario =
      typeof query?.cursor === 'string' && query.cursor.length > 0
        ? 'available-paged'
        : 'available';
    const base = MY_WORK_FIXTURES['adobe-sign-action-queue'][scenario];
    return { ...base, generatedAtUtc: this.now(), dataPath: this.dataPath };
  }

  async getMyProjectLinks(): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>> {
    const base = this.simulateBackendUnavailable
      ? MY_WORK_FIXTURES['project-links']['backend-unavailable']
      : MY_WORK_FIXTURES['project-links'].available;
    return { ...base, generatedAtUtc: this.now(), dataPath: this.dataPath };
  }

  async getAdobeSignRecentCompletions(
    query?: MyWorkAdobeSignRecentCompletionsQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>> {
    if (this.simulateBackendUnavailable) {
      const base = MY_WORK_FIXTURES['adobe-sign-recent-completions']['backend-unavailable'];
      return { ...base, generatedAtUtc: this.now(), dataPath: this.dataPath };
    }
    const scenario =
      typeof query?.cursor === 'string' && query.cursor.length > 0
        ? 'available-paged'
        : 'available';
    const base = MY_WORK_FIXTURES['adobe-sign-recent-completions'][scenario];
    return { ...base, generatedAtUtc: this.now(), dataPath: this.dataPath };
  }

  async startAdobeSignOAuth(
    _input: AdobeSignOAuthStartInput,
  ): Promise<AdobeSignOAuthStartResponse> {
    // Fixture mode is deliberate-no-network; the consent flow can only run
    // in backend mode. Parents must only call this in backend-mode contexts.
    throw new Error('adobe-sign-oauth-start-not-available-in-fixture-mode');
  }

  async disconnectAdobeSignOAuth(): Promise<{ readonly status: 'disconnected' }> {
    // Fixture mode is deliberate-no-network; the disconnect flow can only
    // run in backend mode. Parents must only call this in backend-mode
    // contexts.
    throw new Error('adobe-sign-oauth-disconnect-not-available-in-fixture-mode');
  }

  async resolveAdobeSignActionLink(
    _input: ResolveAdobeSignActionLinkRequest,
  ): Promise<AdobeSignActionLinkResolveResult> {
    return { status: 'source-unavailable' };
  }
}

export function createMyWorkFixtureReadModelClient(
  options?: MyWorkFixtureReadModelClientOptions,
): IMyWorkReadModelClient {
  return new MyWorkFixtureReadModelClient(options);
}
