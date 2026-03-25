/**
 * P3-J1 E6 document-publish-seams constants.
 * Enum arrays, label maps, publish intent event contracts, workflow integration
 * bindings, notification seam definitions, and publish seam scope guard.
 */

import type {
  NotificationSeamType,
  PublishIntentEvent,
  PublishSeamScope,
  WorkflowBindingTarget,
} from './enums.js';
import type {
  INotificationSeamDefinition,
  IPublishIntentEventContract,
  IPublishSeamScopeGuard,
  IWorkflowIntegrationBinding,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const PUBLISH_INTENT_EVENTS = [
  'PUBLISH_REQUESTED',
  'DESTINATION_SUGGESTED',
  'HANDOFF_REQUESTED',
  'PUBLISH_COMPLETED',
  'PUBLISH_FAILED',
] as const satisfies ReadonlyArray<PublishIntentEvent>;

export const WORKFLOW_BINDING_TARGETS = [
  'WORKFLOW_HANDOFF',
  'PUBLISH_WORKFLOW',
  'NOTIFICATION_INTELLIGENCE',
] as const satisfies ReadonlyArray<WorkflowBindingTarget>;

export const NOTIFICATION_SEAM_TYPES = [
  'STATUS_UPDATE',
  'FAILURE_ALERT',
  'COMPLETION_CONFIRMATION',
  'HANDOFF_ACKNOWLEDGMENT',
] as const satisfies ReadonlyArray<NotificationSeamType>;

export const PUBLISH_SEAM_SCOPES = [
  'SEAM_ONLY',
  'FULL_LIFECYCLE_DEFERRED',
] as const satisfies ReadonlyArray<PublishSeamScope>;

// -- Label Maps -------------------------------------------------------------------

export const PUBLISH_INTENT_EVENT_LABELS: Readonly<Record<PublishIntentEvent, string>> = {
  PUBLISH_REQUESTED: 'Publish Requested',
  DESTINATION_SUGGESTED: 'Destination Suggested',
  HANDOFF_REQUESTED: 'Handoff Requested',
  PUBLISH_COMPLETED: 'Publish Completed',
  PUBLISH_FAILED: 'Publish Failed',
};

export const WORKFLOW_BINDING_TARGET_LABELS: Readonly<Record<WorkflowBindingTarget, string>> = {
  WORKFLOW_HANDOFF: 'Workflow Handoff',
  PUBLISH_WORKFLOW: 'Publish Workflow',
  NOTIFICATION_INTELLIGENCE: 'Notification Intelligence',
};

export const NOTIFICATION_SEAM_TYPE_LABELS: Readonly<Record<NotificationSeamType, string>> = {
  STATUS_UPDATE: 'Status Update',
  FAILURE_ALERT: 'Failure Alert',
  COMPLETION_CONFIRMATION: 'Completion Confirmation',
  HANDOFF_ACKNOWLEDGMENT: 'Handoff Acknowledgment',
};

// -- Publish Intent Event Contracts -----------------------------------------------

export const PUBLISH_INTENT_EVENT_CONTRACTS: ReadonlyArray<IPublishIntentEventContract> = [
  { event: 'PUBLISH_REQUESTED', description: 'User initiates a document publish action', triggeredBy: 'user-action', payloadFields: ['documentId', 'destinationType'], isPhase3Implemented: false },
  { event: 'DESTINATION_SUGGESTED', description: 'System suggests a publish destination based on document context', triggeredBy: 'system-suggestion', payloadFields: ['documentId', 'suggestedDestination', 'confidence'], isPhase3Implemented: false },
  { event: 'HANDOFF_REQUESTED', description: 'User requests handoff of document to another workflow stage', triggeredBy: 'user-action', payloadFields: ['documentId', 'handoffTarget', 'reason'], isPhase3Implemented: false },
  { event: 'PUBLISH_COMPLETED', description: 'Document publish action completed successfully', triggeredBy: 'system-lifecycle', payloadFields: ['documentId', 'publishedLocation', 'timestamp'], isPhase3Implemented: false },
  { event: 'PUBLISH_FAILED', description: 'Document publish action failed with an error', triggeredBy: 'system-lifecycle', payloadFields: ['documentId', 'errorCode', 'errorMessage'], isPhase3Implemented: false },
];

// -- Workflow Integration Bindings ------------------------------------------------

export const WORKFLOW_INTEGRATION_BINDINGS: ReadonlyArray<IWorkflowIntegrationBinding> = [
  { target: 'WORKFLOW_HANDOFF', packageName: '@hbc/workflow-handoff', bindingDescription: 'Seam contract for document handoff between workflow stages', isPhase3Ready: true, phase5Action: 'Implement live workflow handoff execution and state transitions' },
  { target: 'PUBLISH_WORKFLOW', packageName: '@hbc/publish-workflow', bindingDescription: 'Seam contract for end-to-end document publish workflow orchestration', isPhase3Ready: true, phase5Action: 'Implement full publish pipeline with validation, routing, and confirmation' },
  { target: 'NOTIFICATION_INTELLIGENCE', packageName: '@hbc/notification-intelligence', bindingDescription: 'Seam contract for publish event notification routing and delivery', isPhase3Ready: true, phase5Action: 'Implement intelligent notification routing, batching, and delivery' },
];

// -- Notification Seam Definitions ------------------------------------------------

export const NOTIFICATION_SEAM_DEFINITIONS: ReadonlyArray<INotificationSeamDefinition> = [
  { seamType: 'STATUS_UPDATE', description: 'Notification seam for publish status change events', routesThrough: '@hbc/notification-intelligence', isPhase3Defined: true },
  { seamType: 'FAILURE_ALERT', description: 'Notification seam for publish failure alert events', routesThrough: '@hbc/notification-intelligence', isPhase3Defined: true },
  { seamType: 'COMPLETION_CONFIRMATION', description: 'Notification seam for publish completion confirmation events', routesThrough: '@hbc/notification-intelligence', isPhase3Defined: true },
  { seamType: 'HANDOFF_ACKNOWLEDGMENT', description: 'Notification seam for handoff acknowledgment events', routesThrough: '@hbc/notification-intelligence', isPhase3Defined: true },
];

// -- Publish Seam Scope Guard -----------------------------------------------------

export const PUBLISH_SEAM_SCOPE_GUARD: Readonly<IPublishSeamScopeGuard> = {
  guardId: 'publish-seam-phase3-scope',
  scope: 'SEAM_ONLY',
  description: 'Phase 3 defines publish and handoff seam contracts only; full lifecycle UI and execution are deferred to Phase 5',
  overbuildsUi: false,
};
