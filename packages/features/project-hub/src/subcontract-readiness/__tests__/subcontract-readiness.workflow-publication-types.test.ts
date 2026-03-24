import { describe, expect, it } from 'vitest';

import {
  PROHIBITED_LOCAL_SUBSTITUTE_DEFINITIONS,
  PROHIBITED_LOCAL_SUBSTITUTES,
  READINESS_ACTIVITY_EVENT_DEFINITIONS,
  READINESS_ACTIVITY_EVENT_TYPE_LABELS,
  READINESS_ACTIVITY_EVENT_TYPES,
  READINESS_ESCALATION_DEFINITIONS,
  READINESS_ESCALATION_TYPES,
  READINESS_HEALTH_METRIC_DEFINITIONS,
  READINESS_HEALTH_METRIC_TYPE_LABELS,
  READINESS_HEALTH_METRIC_TYPES,
  READINESS_NOTIFICATION_DEFINITIONS,
  READINESS_NOTIFICATION_TYPES,
  READINESS_RELATED_ITEM_DEFINITIONS,
  READINESS_RELATED_ITEM_TYPES,
  READINESS_TIMER_DEFINITIONS,
  READINESS_TIMER_TYPE_LABELS,
  READINESS_TIMER_TYPES,
  READINESS_WORK_ITEM_DEFINITIONS,
  READINESS_WORK_ITEM_TYPES,
  READINESS_WORK_QUEUE_DEFINITIONS,
  READINESS_WORK_QUEUE_TYPES,
  READINESS_WORKFLOW_STAGE_LABELS,
  READINESS_WORKFLOW_STAGES,
  REQUIRED_SHARED_PACKAGES,
  SHARED_PACKAGE_REQUIREMENTS,
} from '../../index.js';

describe('P3-E13-T08 Stage 5 workflow-publication contract stability', () => {
  describe('ReadinessWorkflowStage', () => {
    it('has exactly 9 stages per T05 §1', () => { expect(READINESS_WORKFLOW_STAGES).toHaveLength(9); });
  });
  describe('ReadinessTimerType', () => {
    it('has exactly 5 types per T05 §2.1', () => { expect(READINESS_TIMER_TYPES).toHaveLength(5); });
  });
  describe('ReadinessWorkItemType', () => {
    it('has exactly 7 types per T05 §3.1', () => { expect(READINESS_WORK_ITEM_TYPES).toHaveLength(7); });
  });
  describe('ReadinessNotificationType', () => {
    it('has exactly 6 types per T05 §3.2', () => { expect(READINESS_NOTIFICATION_TYPES).toHaveLength(6); });
  });
  describe('ReadinessEscalationType', () => {
    it('has exactly 3 types per T05 §3.3', () => { expect(READINESS_ESCALATION_TYPES).toHaveLength(3); });
  });
  describe('ReadinessActivityEventType', () => {
    it('has exactly 10 events per T05 §4.1', () => { expect(READINESS_ACTIVITY_EVENT_TYPES).toHaveLength(10); });
  });
  describe('ReadinessWorkQueueType', () => {
    it('has exactly 5 types per T05 §4.2', () => { expect(READINESS_WORK_QUEUE_TYPES).toHaveLength(5); });
  });
  describe('ReadinessHealthMetricType', () => {
    it('has exactly 5 metrics per T05 §4.3', () => { expect(READINESS_HEALTH_METRIC_TYPES).toHaveLength(5); });
  });
  describe('ReadinessRelatedItemType', () => {
    it('has exactly 3 types per T05 §4.4', () => { expect(READINESS_RELATED_ITEM_TYPES).toHaveLength(3); });
  });
  describe('RequiredSharedPackage', () => {
    it('has exactly 10 packages per T05 §5', () => { expect(REQUIRED_SHARED_PACKAGES).toHaveLength(10); });
  });
  describe('ProhibitedLocalSubstitute', () => {
    it('has exactly 6 substitutes per T05 §5.1', () => { expect(PROHIBITED_LOCAL_SUBSTITUTES).toHaveLength(6); });
  });

  // -- Label maps
  describe('label maps', () => {
    it('READINESS_WORKFLOW_STAGE_LABELS covers 9', () => { expect(Object.keys(READINESS_WORKFLOW_STAGE_LABELS)).toHaveLength(9); });
    it('READINESS_TIMER_TYPE_LABELS covers 5', () => { expect(Object.keys(READINESS_TIMER_TYPE_LABELS)).toHaveLength(5); });
    it('READINESS_ACTIVITY_EVENT_TYPE_LABELS covers 10', () => { expect(Object.keys(READINESS_ACTIVITY_EVENT_TYPE_LABELS)).toHaveLength(10); });
    it('READINESS_HEALTH_METRIC_TYPE_LABELS covers 5', () => { expect(Object.keys(READINESS_HEALTH_METRIC_TYPE_LABELS)).toHaveLength(5); });
  });

  // -- Definition arrays
  describe('definition arrays', () => {
    it('READINESS_TIMER_DEFINITIONS has 5', () => { expect(READINESS_TIMER_DEFINITIONS).toHaveLength(5); });
    it('READINESS_WORK_ITEM_DEFINITIONS has 7', () => { expect(READINESS_WORK_ITEM_DEFINITIONS).toHaveLength(7); });
    it('READINESS_NOTIFICATION_DEFINITIONS has 6', () => { expect(READINESS_NOTIFICATION_DEFINITIONS).toHaveLength(6); });
    it('READINESS_ESCALATION_DEFINITIONS has 3', () => { expect(READINESS_ESCALATION_DEFINITIONS).toHaveLength(3); });
    it('READINESS_ACTIVITY_EVENT_DEFINITIONS has 10', () => { expect(READINESS_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(10); });
    it('READINESS_WORK_QUEUE_DEFINITIONS has 5', () => { expect(READINESS_WORK_QUEUE_DEFINITIONS).toHaveLength(5); });
    it('READINESS_HEALTH_METRIC_DEFINITIONS has 5', () => { expect(READINESS_HEALTH_METRIC_DEFINITIONS).toHaveLength(5); });
    it('READINESS_RELATED_ITEM_DEFINITIONS has 3', () => { expect(READINESS_RELATED_ITEM_DEFINITIONS).toHaveLength(3); });
    it('SHARED_PACKAGE_REQUIREMENTS has 10', () => { expect(SHARED_PACKAGE_REQUIREMENTS).toHaveLength(10); });
    it('PROHIBITED_LOCAL_SUBSTITUTE_DEFINITIONS has 6', () => { expect(PROHIBITED_LOCAL_SUBSTITUTE_DEFINITIONS).toHaveLength(6); });
  });
});
