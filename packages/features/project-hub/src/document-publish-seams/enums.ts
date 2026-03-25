/**
 * P3-J1 E6 document-publish-seams enumerations.
 * Publish intent events, workflow binding targets, notification seam types,
 * and publish seam scope for Phase 3 seam-only contracts.
 */

// -- Publish Intent Event ---------------------------------------------------------

export type PublishIntentEvent =
  | 'PUBLISH_REQUESTED'
  | 'DESTINATION_SUGGESTED'
  | 'HANDOFF_REQUESTED'
  | 'PUBLISH_COMPLETED'
  | 'PUBLISH_FAILED';

// -- Workflow Binding Target ------------------------------------------------------

export type WorkflowBindingTarget =
  | 'WORKFLOW_HANDOFF'
  | 'PUBLISH_WORKFLOW'
  | 'NOTIFICATION_INTELLIGENCE';

// -- Notification Seam Type -------------------------------------------------------

export type NotificationSeamType =
  | 'STATUS_UPDATE'
  | 'FAILURE_ALERT'
  | 'COMPLETION_CONFIRMATION'
  | 'HANDOFF_ACKNOWLEDGMENT';

// -- Publish Seam Scope -----------------------------------------------------------

export type PublishSeamScope =
  | 'SEAM_ONLY'
  | 'FULL_LIFECYCLE_DEFERRED';
