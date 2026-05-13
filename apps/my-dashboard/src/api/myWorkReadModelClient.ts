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
  type MyProjectLinksReadModel,
  type MyWorkAdobeSignActionQueueQuery,
  type MyWorkAdobeSignActionQueueReadModel,
  type MyWorkHomeReadModel,
  type MyWorkReadModelEnvelope,
  type MyWorkReadModelRouteKey,
} from '@hbc/models/myWork';

export { MY_WORK_READ_MODEL_ROUTE_PATHS };
export type MyWorkReadModelRouteId = MyWorkReadModelRouteKey;

export const MY_WORK_READ_MODEL_ROUTE_IDS = [
  'home',
  'adobe-sign-action-queue',
  'project-links',
] as const satisfies readonly MyWorkReadModelRouteKey[];

export type MyWorkReadModelMode = 'fixture' | 'backend';

export type GetApiToken = () => Promise<string>;

export interface IMyWorkReadModelClient {
  getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>>;
  getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>;
  getMyProjectLinks(): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>>;
}
