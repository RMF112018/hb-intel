/**
 * P3-J1 E6 document-publish-seams contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  PUBLISH_INTENT_EVENTS,
  WORKFLOW_BINDING_TARGETS,
  NOTIFICATION_SEAM_TYPES,
  PUBLISH_SEAM_SCOPES,
  // Label maps
  PUBLISH_INTENT_EVENT_LABELS,
  WORKFLOW_BINDING_TARGET_LABELS,
  NOTIFICATION_SEAM_TYPE_LABELS,
  // Contracts & constants
  PUBLISH_INTENT_EVENT_CONTRACTS,
  WORKFLOW_INTEGRATION_BINDINGS,
  NOTIFICATION_SEAM_DEFINITIONS,
  PUBLISH_SEAM_SCOPE_GUARD,
  // Business rules
  isPublishLifecycleUiBuiltInPhase3,
  canPhase5AddWorkflowWithoutContractChange,
  isSeamOnlyScope,
  isFullPublishLifecycleDeferred,
  doesPhase3OverbuildPublishUi,
  getEventContract,
  getWorkflowBinding,
  isNotificationSeamDefined,
  // Types (compile-time checks)
  type IPublishIntentEventContract,
  type IWorkflowIntegrationBinding,
  type INotificationSeamDefinition,
  type IPublishSeamScopeGuard,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-publish-seams contract stability', () => {
  it('PUBLISH_INTENT_EVENTS has 5 members', () => {
    expect(PUBLISH_INTENT_EVENTS).toHaveLength(5);
  });

  it('WORKFLOW_BINDING_TARGETS has 3 members', () => {
    expect(WORKFLOW_BINDING_TARGETS).toHaveLength(3);
  });

  it('NOTIFICATION_SEAM_TYPES has 4 members', () => {
    expect(NOTIFICATION_SEAM_TYPES).toHaveLength(4);
  });

  it('PUBLISH_SEAM_SCOPES has 2 members', () => {
    expect(PUBLISH_SEAM_SCOPES).toHaveLength(2);
  });

  it('PUBLISH_INTENT_EVENT_LABELS has 5 keys', () => {
    expect(Object.keys(PUBLISH_INTENT_EVENT_LABELS)).toHaveLength(5);
  });

  it('WORKFLOW_BINDING_TARGET_LABELS has 3 keys', () => {
    expect(Object.keys(WORKFLOW_BINDING_TARGET_LABELS)).toHaveLength(3);
  });

  it('NOTIFICATION_SEAM_TYPE_LABELS has 4 keys', () => {
    expect(Object.keys(NOTIFICATION_SEAM_TYPE_LABELS)).toHaveLength(4);
  });

  it('PUBLISH_INTENT_EVENT_CONTRACTS has 5 rows', () => {
    expect(PUBLISH_INTENT_EVENT_CONTRACTS).toHaveLength(5);
  });

  it('all PUBLISH_INTENT_EVENT_CONTRACTS have isPhase3Implemented false', () => {
    for (const contract of PUBLISH_INTENT_EVENT_CONTRACTS) {
      expect(contract.isPhase3Implemented).toBe(false);
    }
  });

  it('WORKFLOW_INTEGRATION_BINDINGS has 3 rows', () => {
    expect(WORKFLOW_INTEGRATION_BINDINGS).toHaveLength(3);
  });

  it('all WORKFLOW_INTEGRATION_BINDINGS have isPhase3Ready true', () => {
    for (const binding of WORKFLOW_INTEGRATION_BINDINGS) {
      expect(binding.isPhase3Ready).toBe(true);
    }
  });

  it('NOTIFICATION_SEAM_DEFINITIONS has 4 rows', () => {
    expect(NOTIFICATION_SEAM_DEFINITIONS).toHaveLength(4);
  });

  it('all NOTIFICATION_SEAM_DEFINITIONS have isPhase3Defined true', () => {
    for (const def of NOTIFICATION_SEAM_DEFINITIONS) {
      expect(def.isPhase3Defined).toBe(true);
    }
  });

  it('PUBLISH_SEAM_SCOPE_GUARD has overbuildsUi false', () => {
    expect(PUBLISH_SEAM_SCOPE_GUARD.overbuildsUi).toBe(false);
  });

  it('type IPublishIntentEventContract is importable', () => {
    const check: IPublishIntentEventContract = PUBLISH_INTENT_EVENT_CONTRACTS[0];
    expect(check.event).toBeDefined();
  });

  it('type IWorkflowIntegrationBinding is importable', () => {
    const check: IWorkflowIntegrationBinding = WORKFLOW_INTEGRATION_BINDINGS[0];
    expect(check.target).toBeDefined();
  });

  it('type INotificationSeamDefinition is importable', () => {
    const check: INotificationSeamDefinition = NOTIFICATION_SEAM_DEFINITIONS[0];
    expect(check.seamType).toBeDefined();
  });

  it('type IPublishSeamScopeGuard is importable', () => {
    const check: IPublishSeamScopeGuard = PUBLISH_SEAM_SCOPE_GUARD;
    expect(check.guardId).toBeDefined();
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-publish-seams business rules', () => {
  it('isPublishLifecycleUiBuiltInPhase3 returns false', () => {
    expect(isPublishLifecycleUiBuiltInPhase3()).toBe(false);
  });

  it('canPhase5AddWorkflowWithoutContractChange returns true', () => {
    expect(canPhase5AddWorkflowWithoutContractChange()).toBe(true);
  });

  it('isSeamOnlyScope returns true', () => {
    expect(isSeamOnlyScope()).toBe(true);
  });

  it('isFullPublishLifecycleDeferred returns true', () => {
    expect(isFullPublishLifecycleDeferred()).toBe(true);
  });

  it('doesPhase3OverbuildPublishUi returns false', () => {
    expect(doesPhase3OverbuildPublishUi()).toBe(false);
  });

  it('getEventContract returns contract for PUBLISH_REQUESTED', () => {
    const result = getEventContract('PUBLISH_REQUESTED');
    expect(result).not.toBeNull();
    expect(result!.event).toBe('PUBLISH_REQUESTED');
  });

  it('getEventContract returns contract for DESTINATION_SUGGESTED', () => {
    const result = getEventContract('DESTINATION_SUGGESTED');
    expect(result).not.toBeNull();
    expect(result!.event).toBe('DESTINATION_SUGGESTED');
  });

  it('getEventContract returns contract for HANDOFF_REQUESTED', () => {
    const result = getEventContract('HANDOFF_REQUESTED');
    expect(result).not.toBeNull();
    expect(result!.event).toBe('HANDOFF_REQUESTED');
  });

  it('getEventContract returns contract for PUBLISH_COMPLETED', () => {
    const result = getEventContract('PUBLISH_COMPLETED');
    expect(result).not.toBeNull();
    expect(result!.event).toBe('PUBLISH_COMPLETED');
  });

  it('getEventContract returns contract for PUBLISH_FAILED', () => {
    const result = getEventContract('PUBLISH_FAILED');
    expect(result).not.toBeNull();
    expect(result!.event).toBe('PUBLISH_FAILED');
  });

  it('getEventContract returns null for unknown event', () => {
    expect(getEventContract('UNKNOWN_EVENT' as never)).toBeNull();
  });

  it('getWorkflowBinding returns binding for WORKFLOW_HANDOFF', () => {
    const result = getWorkflowBinding('WORKFLOW_HANDOFF');
    expect(result).not.toBeNull();
    expect(result!.target).toBe('WORKFLOW_HANDOFF');
  });

  it('getWorkflowBinding returns binding for PUBLISH_WORKFLOW', () => {
    const result = getWorkflowBinding('PUBLISH_WORKFLOW');
    expect(result).not.toBeNull();
    expect(result!.target).toBe('PUBLISH_WORKFLOW');
  });

  it('getWorkflowBinding returns binding for NOTIFICATION_INTELLIGENCE', () => {
    const result = getWorkflowBinding('NOTIFICATION_INTELLIGENCE');
    expect(result).not.toBeNull();
    expect(result!.target).toBe('NOTIFICATION_INTELLIGENCE');
  });

  it('getWorkflowBinding returns null for unknown target', () => {
    expect(getWorkflowBinding('UNKNOWN_TARGET' as never)).toBeNull();
  });

  it('isNotificationSeamDefined returns true for STATUS_UPDATE', () => {
    expect(isNotificationSeamDefined('STATUS_UPDATE')).toBe(true);
  });

  it('isNotificationSeamDefined returns true for FAILURE_ALERT', () => {
    expect(isNotificationSeamDefined('FAILURE_ALERT')).toBe(true);
  });

  it('isNotificationSeamDefined returns true for COMPLETION_CONFIRMATION', () => {
    expect(isNotificationSeamDefined('COMPLETION_CONFIRMATION')).toBe(true);
  });

  it('isNotificationSeamDefined returns true for HANDOFF_ACKNOWLEDGMENT', () => {
    expect(isNotificationSeamDefined('HANDOFF_ACKNOWLEDGMENT')).toBe(true);
  });

  it('isNotificationSeamDefined returns false for unknown seam type', () => {
    expect(isNotificationSeamDefined('UNKNOWN_SEAM' as never)).toBe(false);
  });
});
