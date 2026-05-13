/**
 * My Work — shared read-model contracts.
 *
 * Type-only contract family for the My Dashboard My Work BFF/DTO
 * layer. Defines the envelope, mode/source-status/warning vocabularies,
 * actor / home-summary / source-readiness DTOs, the home Adobe queue
 * projection, the home read model, the route registry, and the response
 * map consumed by both the frontend read-model client (B04 Prompt 03)
 * and the backend host (B04 Prompt 04).
 *
 * This namespace is a narrow BFF/DTO layer and does not replace the
 * personal work aggregation primitives owned by `@hbc/my-work-feed`.
 *
 * Contract-only: no fetch, OAuth, provider, or ranking/dedupe logic.
 *
 * @module myWork/MyWorkReadModels
 */

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignActionQueueSummary,
} from './AdobeSignActionQueue.js';
import type { MyProjectLinksReadModel } from './MyProjectLinksReadModel.js';

export const MY_WORK_READ_MODEL_MODES = ['fixture', 'backend'] as const;

export type MyWorkReadModelMode = (typeof MY_WORK_READ_MODEL_MODES)[number];

/**
 * Classification of how an envelope was produced. Distinguishes:
 *
 *   - `'backend-live'` — the protected backend was reached and returned this
 *     envelope. Production-acceptable when paired with a non-fixture data
 *     payload.
 *   - `'backend-unavailable-fallback'` — production posture; the backend was
 *     unreachable or misconfigured and the SPFx client substituted a
 *     fixture envelope. Hosted screenshots showing this value indicate a
 *     production-fallback condition, not real data.
 *   - `'fixture-ui-review'` — explicit `ui-review` mode; fixture data is
 *     intentional (visual review / preview). Never expected on a
 *     production tenant.
 *
 * Optional on the envelope contract so backend producers and existing
 * fixtures can omit it; the SPFx my-dashboard client tree stamps the
 * correct value before surfaces consume the envelope.
 */
export const MY_WORK_READ_MODEL_DATA_PATHS = [
  'backend-live',
  'backend-unavailable-fallback',
  'fixture-ui-review',
] as const;

export type MyWorkReadModelDataPath = (typeof MY_WORK_READ_MODEL_DATA_PATHS)[number];

export const MY_WORK_READ_MODEL_SOURCE_STATUSES = [
  'available',
  'partial',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
] as const;

export type MyWorkReadModelSourceStatus = (typeof MY_WORK_READ_MODEL_SOURCE_STATUSES)[number];

export const MY_WORK_READ_MODEL_WARNING_CODES = [
  'partial-source-data',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
  'stale-cache-used',
  'result-set-truncated',
  'source-open-url-omitted',
  'source-open-url-policy-rejected',
  'unsupported-source-status-filtered',
] as const;

export type MyWorkReadModelWarningCode = (typeof MY_WORK_READ_MODEL_WARNING_CODES)[number];

export interface MyWorkReadModelWarning {
  readonly code: MyWorkReadModelWarningCode;
  readonly message?: string;
}

export interface MyWorkReadModelEnvelope<T> {
  readonly mode: MyWorkReadModelMode;
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly readOnly: true;
  readonly warnings: readonly MyWorkReadModelWarning[];
  readonly generatedAtUtc: string;
  readonly data: T;
  /**
   * SPFx-stamped data-path classification. Optional so backend responses
   * and shared fixtures can omit it; the my-dashboard client tree
   * overwrites this with the truthful classification before surfaces
   * consume the envelope.
   */
  readonly dataPath?: MyWorkReadModelDataPath;
}

export interface MyWorkActorSummary {
  readonly displayName: string;
  readonly principalName: string;
  readonly hbcUserId?: string;
}

export interface MyWorkHomeSummary {
  readonly totalActionItemCount: number;
}

export interface MyWorkSourceReadinessItem {
  readonly sourceSystem: 'adobe-sign';
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly warnings: readonly MyWorkReadModelWarning[];
}

export interface MyWorkAdobeSignActionQueueHomeProjection {
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly previewItems: readonly MyWorkAdobeSignActionQueueItem[];
  readonly previewItemLimit: 5;
}

export interface MyWorkHomeReadModel {
  readonly actor: MyWorkActorSummary;
  readonly summary: MyWorkHomeSummary;
  readonly sourceReadiness: readonly MyWorkSourceReadinessItem[];
  readonly adobeSignActionQueue: MyWorkAdobeSignActionQueueHomeProjection;
}

export const MY_WORK_READ_MODEL_ROUTE_PATHS = {
  home: 'my-work/me/home',
  'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
  'project-links': 'my-work/me/project-links',
} as const;

export type MyWorkReadModelRouteKey = keyof typeof MY_WORK_READ_MODEL_ROUTE_PATHS;

export interface MyWorkReadModelResponseMap {
  readonly home: MyWorkReadModelEnvelope<MyWorkHomeReadModel>;
  readonly 'adobe-sign-action-queue': MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>;
  readonly 'project-links': MyWorkReadModelEnvelope<MyProjectLinksReadModel>;
}
