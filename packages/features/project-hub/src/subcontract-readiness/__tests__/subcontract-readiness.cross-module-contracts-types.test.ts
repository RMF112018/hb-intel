import { describe, expect, it } from 'vitest';

import {
  CROSS_MODULE_ACTIVITY_EVENT_DEFINITIONS,
  CROSS_MODULE_ACTIVITY_EVENTS,
  DOWNSTREAM_CONSUMER_DEFINITIONS,
  DOWNSTREAM_CONSUMERS,
  EXTERNAL_DISPLACEMENT_PROHIBITION_DEFINITIONS,
  EXTERNAL_DISPLACEMENT_PROHIBITIONS,
  FINANCIAL_PROHIBITION_DEFINITIONS,
  FINANCIAL_PROHIBITIONS,
  FUTURE_EXTERNAL_INPUT_DEFINITIONS,
  FUTURE_EXTERNAL_INPUT_TYPES,
  GATE_PROJECTION_FIELDS,
  READINESS_RELATED_ITEM_PAIRS,
  RELATED_ITEM_PAIR_DEFINITIONS,
  STARTUP_ALLOWED_CONSUMPTIONS,
  STARTUP_BOUNDARY_ALLOWED_DEFINITIONS,
  STARTUP_BOUNDARY_PROHIBITED_DEFINITIONS,
  STARTUP_PROHIBITED_CONSUMPTIONS,
} from '../../index.js';

describe('P3-E13-T08 Stage 7 cross-module-contracts contract stability', () => {
  describe('GateProjectionField', () => {
    it('has exactly 7 fields per T07 §1.2', () => { expect(GATE_PROJECTION_FIELDS).toHaveLength(7); });
  });
  describe('FinancialProhibition', () => {
    it('has exactly 4 per T07 §1.3', () => { expect(FINANCIAL_PROHIBITIONS).toHaveLength(4); });
  });
  describe('StartupAllowedConsumption', () => {
    it('has exactly 3 per T07 §2', () => { expect(STARTUP_ALLOWED_CONSUMPTIONS).toHaveLength(3); });
  });
  describe('StartupProhibitedConsumption', () => {
    it('has exactly 4 per T07 §2', () => { expect(STARTUP_PROHIBITED_CONSUMPTIONS).toHaveLength(4); });
  });
  describe('DownstreamConsumer', () => {
    it('has exactly 3 per T07 §3', () => { expect(DOWNSTREAM_CONSUMERS).toHaveLength(3); });
  });
  describe('ReadinessRelatedItemPair', () => {
    it('has exactly 4 per T07 §4.1', () => { expect(READINESS_RELATED_ITEM_PAIRS).toHaveLength(4); });
  });
  describe('CrossModuleActivityEvent', () => {
    it('has exactly 10 per T07 §4.2', () => { expect(CROSS_MODULE_ACTIVITY_EVENTS).toHaveLength(10); });
  });
  describe('FutureExternalInputType', () => {
    it('has exactly 5 per T07 §5', () => { expect(FUTURE_EXTERNAL_INPUT_TYPES).toHaveLength(5); });
  });
  describe('ExternalDisplacementProhibition', () => {
    it('has exactly 4 per T07 §5', () => { expect(EXTERNAL_DISPLACEMENT_PROHIBITIONS).toHaveLength(4); });
  });

  describe('definition arrays', () => {
    it('FINANCIAL_PROHIBITION_DEFINITIONS has 4', () => { expect(FINANCIAL_PROHIBITION_DEFINITIONS).toHaveLength(4); });
    it('STARTUP_BOUNDARY_ALLOWED_DEFINITIONS has 3', () => { expect(STARTUP_BOUNDARY_ALLOWED_DEFINITIONS).toHaveLength(3); });
    it('STARTUP_BOUNDARY_PROHIBITED_DEFINITIONS has 4', () => { expect(STARTUP_BOUNDARY_PROHIBITED_DEFINITIONS).toHaveLength(4); });
    it('DOWNSTREAM_CONSUMER_DEFINITIONS has 3', () => { expect(DOWNSTREAM_CONSUMER_DEFINITIONS).toHaveLength(3); });
    it('RELATED_ITEM_PAIR_DEFINITIONS has 4', () => { expect(RELATED_ITEM_PAIR_DEFINITIONS).toHaveLength(4); });
    it('CROSS_MODULE_ACTIVITY_EVENT_DEFINITIONS has 10', () => { expect(CROSS_MODULE_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(10); });
    it('FUTURE_EXTERNAL_INPUT_DEFINITIONS has 5', () => { expect(FUTURE_EXTERNAL_INPUT_DEFINITIONS).toHaveLength(5); });
    it('EXTERNAL_DISPLACEMENT_PROHIBITION_DEFINITIONS has 4', () => { expect(EXTERNAL_DISPLACEMENT_PROHIBITION_DEFINITIONS).toHaveLength(4); });
  });
});
