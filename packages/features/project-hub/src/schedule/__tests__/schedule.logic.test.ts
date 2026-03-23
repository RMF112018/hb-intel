import { describe, expect, it } from 'vitest';

import {
  classifyPropagationAuthority,
  getLogicLayerAuthority,
  isPromotionEligibleLink,
} from '../logic/index.js';
import { createMockWorkPackageLinkRecord } from '../../../testing/createMockWorkPackageLinkRecord.js';

describe('P3-E5-T06 schedule logic', () => {
  describe('getLogicLayerAuthority (§10.1)', () => {
    it('SourceCPM is read-only, authority = upstream CPM tool', () => {
      const result = getLogicLayerAuthority('SourceCPM');
      expect(result.readOnly).toBe(true);
      expect(result.authority).toContain('CPM');
    });

    it('Scenario is editable, authority = PM', () => {
      const result = getLogicLayerAuthority('Scenario');
      expect(result.readOnly).toBe(false);
      expect(result.authority).toContain('PM');
    });

    it('WorkPackage is editable, authority = PM/field', () => {
      const result = getLogicLayerAuthority('WorkPackage');
      expect(result.readOnly).toBe(false);
      expect(result.authority).toContain('field');
    });
  });

  describe('isPromotionEligibleLink (§10.3)', () => {
    it('returns true when promotionEligible is true', () => {
      const link = createMockWorkPackageLinkRecord({ promotionEligible: true });
      expect(isPromotionEligibleLink(link)).toBe(true);
    });

    it('returns false when promotionEligible is false', () => {
      const link = createMockWorkPackageLinkRecord({ promotionEligible: false });
      expect(isPromotionEligibleLink(link)).toBe(false);
    });
  });

  describe('classifyPropagationAuthority (§10.4)', () => {
    it('SourceSchedulePropagated is authoritative, no approval needed', () => {
      const result = classifyPropagationAuthority('SourceSchedulePropagated');
      expect(result.isAuthoritative).toBe(true);
      expect(result.requiresApproval).toBeNull();
    });

    it('OperatingLayerProjected is not authoritative, requires PM approval', () => {
      const result = classifyPropagationAuthority('OperatingLayerProjected');
      expect(result.isAuthoritative).toBe(false);
      expect(result.requiresApproval).toContain('PM');
    });

    it('ScenarioLayerProjected is not authoritative, requires promotion approval', () => {
      const result = classifyPropagationAuthority('ScenarioLayerProjected');
      expect(result.isAuthoritative).toBe(false);
      expect(result.requiresApproval).toContain('promotion');
    });
  });
});
