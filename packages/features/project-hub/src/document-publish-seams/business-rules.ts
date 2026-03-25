/**
 * P3-J1 E6 document-publish-seams business rules.
 * Phase 3 scope guards, workflow contract stability checks, event contract
 * lookups, workflow binding lookups, and notification seam verification.
 */

import type { NotificationSeamType, PublishIntentEvent, WorkflowBindingTarget } from './enums.js';
import type { IPublishIntentEventContract, IWorkflowIntegrationBinding } from './types.js';
import {
  NOTIFICATION_SEAM_DEFINITIONS,
  PUBLISH_INTENT_EVENT_CONTRACTS,
  WORKFLOW_INTEGRATION_BINDINGS,
} from './constants.js';

export const isPublishLifecycleUiBuiltInPhase3 = (): false => false;

export const canPhase5AddWorkflowWithoutContractChange = (): true => true;

export const isSeamOnlyScope = (): true => true;

export const isFullPublishLifecycleDeferred = (): true => true;

export const doesPhase3OverbuildPublishUi = (): false => false;

export const getEventContract = (event: PublishIntentEvent): IPublishIntentEventContract | null =>
  PUBLISH_INTENT_EVENT_CONTRACTS.find((c) => c.event === event) ?? null;

export const getWorkflowBinding = (target: WorkflowBindingTarget): IWorkflowIntegrationBinding | null =>
  WORKFLOW_INTEGRATION_BINDINGS.find((b) => b.target === target) ?? null;

export const isNotificationSeamDefined = (seamType: NotificationSeamType): boolean =>
  NOTIFICATION_SEAM_DEFINITIONS.some((d) => d.seamType === seamType);
