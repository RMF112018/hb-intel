/**
 * My Work read-model client — app-local API seam interface.
 *
 * B04 contract: two read-only methods, one per protected backend
 * route. React cards and surfaces consume this interface; the
 * factory decides whether the implementation is the deterministic
 * fixture client or the bearer-token-protected backend client.
 *
 * @module api/myWorkReadModelClient
 */

import {
  MY_WORK_READ_MODEL_ROUTE_PATHS,
  type AdobeSignActionLinkResolveResult,
  type MyProjectLinksReadModel,
  type MyWorkAdobeSignActionQueueQuery,
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkAdobeSignRecentCompletionsQuery,
  type MyWorkAdobeSignRecentCompletionsReadModel,
  type MyWorkHomeReadModel,
  type MyWorkReadModelEnvelope,
  type MyWorkReadModelRouteKey,
  type ResolveAdobeSignActionLinkRequest,
} from '@hbc/models/myWork';

export { MY_WORK_READ_MODEL_ROUTE_PATHS };
export type MyWorkReadModelRouteId = MyWorkReadModelRouteKey;

export const MY_WORK_READ_MODEL_ROUTE_IDS = [
  'home',
  'adobe-sign-action-queue',
  'adobe-sign-recent-completions',
  'project-links',
] as const satisfies readonly MyWorkReadModelRouteKey[];

export type MyWorkReadModelMode = 'fixture' | 'backend';

export type GetApiToken = () => Promise<string>;

export interface AdobeSignOAuthStartInput {
  /** Validated relative return path the callback should redirect to on completion. */
  readonly returnPath: string;
}

export interface AdobeSignOAuthStartResponse {
  /** Adobe-hosted consent URL the browser should navigate to. */
  readonly authorizationUrl: string;
  /** ISO-8601 UTC expiry of the issued OAuth state value. */
  readonly stateExpiresAtUtc: string;
}

export interface IMyWorkReadModelClient {
  getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>>;
  getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>;
  getAdobeSignRecentCompletions?(
    query?: MyWorkAdobeSignRecentCompletionsQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
  getMyProjectLinks(): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>>;
  resolveAdobeSignActionLink(
    input: ResolveAdobeSignActionLinkRequest,
  ): Promise<AdobeSignActionLinkResolveResult>;
  /**
   * Issue a fresh Adobe Sign OAuth `state` and return the
   * Adobe-hosted authorization URL the browser should navigate to.
   *
   * Backend route: `POST /api/my-work/me/adobe-sign/oauth/start`
   * (bearer-protected). The route validates the supplied
   * `returnPath` against the canonical allow-list before issuing
   * state.
   *
   * Throws closed-enum `Error` codes on failure:
   *   - `'adobe-sign-oauth-start-unauthorized'`        — 401 / 403.
   *   - `'adobe-sign-oauth-start-invalid-input'`       — 400.
   *   - `'adobe-sign-oauth-start-configuration-required'` — 503.
   *   - `'adobe-sign-oauth-start-unreachable'`         — network /
   *     malformed body / token-acquire failure.
   *
   * Not available in fixture mode — the fixture client rejects with
   * `'adobe-sign-oauth-start-not-available-in-fixture-mode'`.
   */
  startAdobeSignOAuth(input: AdobeSignOAuthStartInput): Promise<AdobeSignOAuthStartResponse>;
}
