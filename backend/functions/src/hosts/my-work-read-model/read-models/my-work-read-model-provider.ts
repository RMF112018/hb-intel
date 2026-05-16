/**
 * My Work read-model provider — backend host interface.
 *
 * Defines the contract route handlers depend on. The B04 mock
 * provider returns fixture envelopes; the future B07 provider will
 * call into a real Adobe Sign data plane behind the same shape.
 *
 * `MyWorkReadContext` is derived inside the route handler from the
 * validated auth claims and passes the actor principal + correlation
 * request id down to the provider so future implementations can
 * attribute live calls to the signed-in user without re-doing auth.
 *
 * @module hosts/my-work-read-model/read-models/my-work-read-model-provider
 */

import type {
  MyWorkActorSummary,
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkHomeReadModel,
  MyProjectLinksReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';
import type { AdobeSignRuntimeDiagnosticReporter } from './adobe-sign/adobe-sign-runtime-diagnostics.js';
import type { MyProjectLinksRuntimeDiagnosticReporter } from './project-links/my-project-links-runtime-diagnostics.js';

export interface MyWorkReadContext {
  readonly actor: MyWorkActorSummary;
  readonly requestId: string;
  readonly diagnostics?: AdobeSignRuntimeDiagnosticReporter;
  readonly projectLinksDiagnostics?: MyProjectLinksRuntimeDiagnosticReporter;
}

export interface IMyWorkReadModelProvider {
  getMyWorkHome(context: MyWorkReadContext): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>>;

  getAdobeSignActionQueue(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>;
  getAdobeSignRecentCompletions(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignRecentCompletionsQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;

  getMyProjectLinks(
    context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>>;
}

export interface MyWorkMockReadModelProviderOptions {
  readonly simulateBackendUnavailable?: boolean;
  readonly now?: () => string;
}
