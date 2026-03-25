import { describe, expect, it } from 'vitest';

import {
  getWarrantyWorkQueueRulePriority,
  isWarrantyActivityEventFireAndObserve,
  isWarrantyDownstreamWriteProhibited,
  isWarrantyHealthMetricFromAdapter,
  isWarrantyTelemetryNonBlocking,
  isWarrantyWorkQueueRuleDismissible,
} from '../../index.js';

describe('P3-E14-T10 Stage 8 reports-publication business rules', () => {
  describe('invariant guards', () => {
    it('activity events fire-and-observe', () => { expect(isWarrantyActivityEventFireAndObserve()).toBe(true); });
    it('downstream write prohibited', () => { expect(isWarrantyDownstreamWriteProhibited()).toBe(true); });
    it('health metrics from adapter', () => { expect(isWarrantyHealthMetricFromAdapter()).toBe(true); });
    it('telemetry non-blocking', () => { expect(isWarrantyTelemetryNonBlocking()).toBe(true); });
  });

  describe('getWarrantyWorkQueueRulePriority', () => {
    it('WQ-WAR-01 is Normal', () => { expect(getWarrantyWorkQueueRulePriority('WQ-WAR-01')).toBe('Normal'); });
    it('WQ-WAR-08 is Critical', () => { expect(getWarrantyWorkQueueRulePriority('WQ-WAR-08')).toBe('Critical'); });
    it('WQ-WAR-15 is Advisory', () => { expect(getWarrantyWorkQueueRulePriority('WQ-WAR-15')).toBe('Advisory'); });
    it('WQ-WAR-04 is Elevated', () => { expect(getWarrantyWorkQueueRulePriority('WQ-WAR-04')).toBe('Elevated'); });
  });

  describe('isWarrantyWorkQueueRuleDismissible', () => {
    it('WQ-WAR-01 is not dismissible', () => { expect(isWarrantyWorkQueueRuleDismissible('WQ-WAR-01')).toBe(false); });
    it('WQ-WAR-02 is dismissible', () => { expect(isWarrantyWorkQueueRuleDismissible('WQ-WAR-02')).toBe(true); });
    it('WQ-WAR-08 is not dismissible', () => { expect(isWarrantyWorkQueueRuleDismissible('WQ-WAR-08')).toBe(false); });
    it('WQ-WAR-15 is dismissible', () => { expect(isWarrantyWorkQueueRuleDismissible('WQ-WAR-15')).toBe(true); });
  });
});
