/**
 * P3-J1 E6 document-publish-seams TypeScript contracts.
 * Publish intent event contracts, workflow integration bindings,
 * notification seam definitions, and publish seam scope guards.
 */

import type {
  NotificationSeamType,
  PublishIntentEvent,
  PublishSeamScope,
  WorkflowBindingTarget,
} from './enums.js';

export interface IPublishIntentEventContract {
  readonly event: PublishIntentEvent;
  readonly description: string;
  readonly triggeredBy: string;
  readonly payloadFields: readonly string[];
  readonly isPhase3Implemented: boolean;
}

export interface IWorkflowIntegrationBinding {
  readonly target: WorkflowBindingTarget;
  readonly packageName: string;
  readonly bindingDescription: string;
  readonly isPhase3Ready: boolean;
  readonly phase5Action: string;
}

export interface INotificationSeamDefinition {
  readonly seamType: NotificationSeamType;
  readonly description: string;
  readonly routesThrough: string;
  readonly isPhase3Defined: boolean;
}

export interface IPublishSeamScopeGuard {
  readonly guardId: string;
  readonly scope: PublishSeamScope;
  readonly description: string;
  readonly overbuildsUi: boolean;
}
