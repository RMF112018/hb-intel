/**
 * Canonical inventory of every Application Insights `customEvents` name that
 * the My Projects projection subsystem actually emits.
 *
 * Source of truth for:
 *   - the App Insights KQL pack at
 *     `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/resources/App_Insights_KQL_Query_Pack.md`,
 *   - the operator telemetry evidence doc at
 *     `docs/architecture/blueprint/sp-project-control-center/my-projects-projection/telemetry-evidence.md`,
 *   - the inventory lint test at
 *     `backend/functions/src/services/__tests__/my-projects-projection-telemetry-inventory.test.ts`.
 *
 * The lint test scans the emitting source files for literal event-name strings
 * and asserts every string is in this array (and that every entry in this
 * array is emitted by at least one source file). New event names MUST be
 * added here in the same commit that introduces them.
 *
 * Doc 08 (`08_Telemetry_Observability_And_Operational_Runbooks.md`) is the
 * forward-looking spec. Where committed code names differ from Doc 08 (e.g.,
 * the projection-read events use `.read.projection.load.result/.failed`
 * rather than `.projection.read.start/.success/.failure`) the live code
 * wins — see telemetry-evidence.md for the diff table.
 */

export const MY_PROJECTS_PROJECTION_EVENT_NAMES = [
  // -- Notification ingress (webhook handler) --
  'myProjectsProjection.notification.validation.request',
  'myProjectsProjection.notification.validation.success',
  'myProjectsProjection.notification.payload.received',
  'myProjectsProjection.notification.clientState.invalid',
  'myProjectsProjection.notification.queue.accepted',
  'myProjectsProjection.notification.queue.failed',
  'myProjectsProjection.notification.duplicate.bucketed',
  'myProjectsProjection.notification.persistence.failed',

  // -- Pending Work processor --
  'myProjectsProjection.pendingWork.scan.start',
  'myProjectsProjection.pendingWork.scan.completed',
  'myProjectsProjection.pendingWork.claim.succeeded',
  'myProjectsProjection.pendingWork.claim.skipped',
  'myProjectsProjection.pendingWork.item.succeeded',
  'myProjectsProjection.pendingWork.retry.scheduled',
  'myProjectsProjection.pendingWork.deadLettered',
  'myProjectsProjection.pendingWork.persistence.failed',

  // -- Queue sync worker --
  'myProjectsProjection.worker.message.received',
  'myProjectsProjection.worker.message.completed',
  'myProjectsProjection.worker.lease.acquired',
  'myProjectsProjection.worker.lease.skipped',
  'myProjectsProjection.worker.delta.start',
  'myProjectsProjection.worker.delta.page',
  'myProjectsProjection.worker.delta.success',
  'myProjectsProjection.worker.delta.failure',
  'myProjectsProjection.worker.delta.resyncRequired',
  'myProjectsProjection.worker.projection.write.success',
  'myProjectsProjection.worker.projection.write.failure',

  // -- Subscription manager --
  'myProjectsProjection.subscription.create.start',
  'myProjectsProjection.subscription.create.success',
  'myProjectsProjection.subscription.create.failure',
  'myProjectsProjection.subscription.renew.start',
  'myProjectsProjection.subscription.renew.success',
  'myProjectsProjection.subscription.renew.failure',
  'myProjectsProjection.subscription.health.nearingExpiry',
  'myProjectsProjection.subscription.health.missing',

  // -- My Project Links runtime read provider (legacy + projection paths) --
  'projects-loader.failed',
  'registry-loader.failed',
  'myProjectLinks.read.sources.result',
  'myProjectLinks.read.reconcile.result',
  'myProjectLinks.read.projection.load.result',
  'myProjectLinks.read.projection.failed',
] as const;

export type MyProjectsProjectionEventName = (typeof MY_PROJECTS_PROJECTION_EVENT_NAMES)[number];

/**
 * Subsystem grouping for the evidence doc — read by tests and humans. Each
 * group corresponds to a section in `telemetry-evidence.md`.
 */
export const MY_PROJECTS_PROJECTION_EVENT_GROUPS = {
  notificationIngress: [
    'myProjectsProjection.notification.validation.request',
    'myProjectsProjection.notification.validation.success',
    'myProjectsProjection.notification.payload.received',
    'myProjectsProjection.notification.clientState.invalid',
    'myProjectsProjection.notification.queue.accepted',
    'myProjectsProjection.notification.queue.failed',
    'myProjectsProjection.notification.duplicate.bucketed',
    'myProjectsProjection.notification.persistence.failed',
  ],
  pendingWorkProcessor: [
    'myProjectsProjection.pendingWork.scan.start',
    'myProjectsProjection.pendingWork.scan.completed',
    'myProjectsProjection.pendingWork.claim.succeeded',
    'myProjectsProjection.pendingWork.claim.skipped',
    'myProjectsProjection.pendingWork.item.succeeded',
    'myProjectsProjection.pendingWork.retry.scheduled',
    'myProjectsProjection.pendingWork.deadLettered',
    'myProjectsProjection.pendingWork.persistence.failed',
  ],
  queueWorker: [
    'myProjectsProjection.worker.message.received',
    'myProjectsProjection.worker.message.completed',
    'myProjectsProjection.worker.lease.acquired',
    'myProjectsProjection.worker.lease.skipped',
    'myProjectsProjection.worker.delta.start',
    'myProjectsProjection.worker.delta.page',
    'myProjectsProjection.worker.delta.success',
    'myProjectsProjection.worker.delta.failure',
    'myProjectsProjection.worker.delta.resyncRequired',
    'myProjectsProjection.worker.projection.write.success',
    'myProjectsProjection.worker.projection.write.failure',
  ],
  subscriptionManager: [
    'myProjectsProjection.subscription.create.start',
    'myProjectsProjection.subscription.create.success',
    'myProjectsProjection.subscription.create.failure',
    'myProjectsProjection.subscription.renew.start',
    'myProjectsProjection.subscription.renew.success',
    'myProjectsProjection.subscription.renew.failure',
    'myProjectsProjection.subscription.health.nearingExpiry',
    'myProjectsProjection.subscription.health.missing',
  ],
  runtimeRead: [
    'projects-loader.failed',
    'registry-loader.failed',
    'myProjectLinks.read.sources.result',
    'myProjectLinks.read.reconcile.result',
    'myProjectLinks.read.projection.load.result',
    'myProjectLinks.read.projection.failed',
  ],
} as const satisfies Record<string, readonly MyProjectsProjectionEventName[]>;
