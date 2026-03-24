import { describe, expect, it } from 'vitest';

import {
  WORKFLOW_SCOPE,
  PERMIT_ACTIVITY_EVENT_TYPES,
  PERMIT_WORK_QUEUE_RULE_IDS,
  PERMIT_RELATIONSHIP_TYPES,
  PERMIT_HANDOFF_SCENARIOS,
  PERMIT_ANNOTATABLE_RECORD_TYPES,
  PERMIT_ACTIVITY_EVENT_CONFIGS,
  PERMIT_PER_PERMIT_HEALTH_METRICS,
  PERMIT_PROJECT_AGGREGATE_METRICS,
  PERMIT_WORK_QUEUE_RULES,
  PERMIT_RELATED_ITEM_CONFIGS,
  PERMIT_HANDOFF_CONFIGS,
  PERMIT_BIC_NEXT_MOVE_PROMPTS,
  PERMIT_ANNOTATION_SCOPES,
} from '../../index.js';

describe('P3-E7-T05 contract stability', () => {
  it('WORKFLOW_SCOPE is "permits/workflow"', () => {
    expect(WORKFLOW_SCOPE).toBe('permits/workflow');
  });

  it('locks PERMIT_ACTIVITY_EVENT_TYPES to exactly 21 values', () => {
    expect(PERMIT_ACTIVITY_EVENT_TYPES).toHaveLength(21);
  });

  it('locks PERMIT_WORK_QUEUE_RULE_IDS to exactly 15 values', () => {
    expect(PERMIT_WORK_QUEUE_RULE_IDS).toHaveLength(15);
  });

  it('locks PERMIT_RELATIONSHIP_TYPES to exactly 5 values', () => {
    expect(PERMIT_RELATIONSHIP_TYPES).toHaveLength(5);
  });

  it('locks PERMIT_HANDOFF_SCENARIOS to exactly 6 values', () => {
    expect(PERMIT_HANDOFF_SCENARIOS).toHaveLength(6);
  });

  it('locks PERMIT_ANNOTATABLE_RECORD_TYPES to exactly 4 values', () => {
    expect(PERMIT_ANNOTATABLE_RECORD_TYPES).toHaveLength(4);
    expect(PERMIT_ANNOTATABLE_RECORD_TYPES).not.toContain('PermitLifecycleAction');
  });

  it('PERMIT_ACTIVITY_EVENT_CONFIGS has 21 entries matching enum', () => {
    expect(PERMIT_ACTIVITY_EVENT_CONFIGS).toHaveLength(21);
    for (const type of PERMIT_ACTIVITY_EVENT_TYPES) {
      expect(PERMIT_ACTIVITY_EVENT_CONFIGS.find((c) => c.eventType === type)).toBeTruthy();
    }
  });

  it('each activity event has non-empty payload fields', () => {
    for (const config of PERMIT_ACTIVITY_EVENT_CONFIGS) {
      expect(config.additionalPayloadFields.length).toBeGreaterThan(0);
    }
  });

  it('PERMIT_PER_PERMIT_HEALTH_METRICS has exactly 11 metrics', () => {
    expect(PERMIT_PER_PERMIT_HEALTH_METRICS).toHaveLength(11);
  });

  it('PERMIT_PROJECT_AGGREGATE_METRICS has exactly 7 metrics', () => {
    expect(PERMIT_PROJECT_AGGREGATE_METRICS).toHaveLength(7);
  });

  it('PERMIT_WORK_QUEUE_RULES has exactly 15 rules matching enum', () => {
    expect(PERMIT_WORK_QUEUE_RULES).toHaveLength(15);
    for (const ruleId of PERMIT_WORK_QUEUE_RULE_IDS) {
      expect(PERMIT_WORK_QUEUE_RULES.find((r) => r.ruleId === ruleId)).toBeTruthy();
    }
  });

  it('WQ-PRM-12 (STOP_WORK) is URGENT priority', () => {
    const rule = PERMIT_WORK_QUEUE_RULES.find((r) => r.ruleId === 'WQ-PRM-12');
    expect(rule?.priority).toBe('URGENT');
  });

  it('each work queue rule has resolution trigger', () => {
    for (const rule of PERMIT_WORK_QUEUE_RULES) {
      expect(rule.resolutionTrigger).toBeTruthy();
    }
  });

  it('PERMIT_RELATED_ITEM_CONFIGS has exactly 5 entries', () => {
    expect(PERMIT_RELATED_ITEM_CONFIGS).toHaveLength(5);
  });

  it('PERMIT_HANDOFF_CONFIGS has exactly 6 entries', () => {
    expect(PERMIT_HANDOFF_CONFIGS).toHaveLength(6);
  });

  it('PERMIT_BIC_NEXT_MOVE_PROMPTS has exactly 7 entries', () => {
    expect(PERMIT_BIC_NEXT_MOVE_PROMPTS).toHaveLength(7);
  });

  it('PERMIT_ANNOTATION_SCOPES has exactly 4 entries (no PermitLifecycleAction)', () => {
    expect(PERMIT_ANNOTATION_SCOPES).toHaveLength(4);
    const types = PERMIT_ANNOTATION_SCOPES.map((s) => s.recordType);
    expect(types).not.toContain('PermitLifecycleAction');
  });

  it('IssuedPermit has wildcard annotatable fields', () => {
    const scope = PERMIT_ANNOTATION_SCOPES.find((s) => s.recordType === 'IssuedPermit');
    expect(scope?.annotatableFields).toContain('*');
  });
});
