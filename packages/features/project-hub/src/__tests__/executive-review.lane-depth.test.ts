import { describe, expect, it } from 'vitest';

import {
  REVIEW_LANE_DEPTHS,
  REVIEW_CAPABILITIES,
  ESCALATION_TRIGGER_CASES,
  APPLICATION_LANES,
  ESCALATION_DEEP_LINK_VIEWS,
  REVIEW_LANE_CAPABILITY_MATRIX,
  LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS,
  isCapabilityAvailableInLane,
  requiresEscalationToPWA,
  isInLaneForSpfx,
  getEscalationDeepLinkTemplate,
  buildEscalationDeepLink,
  isContextPreservationRequired,
  enforceLaneDepth,
  isPwaFullDepthForAllCapabilities,
  isSpfxBroadForCommonOperations,
  isNonPerUserAffectedByLaneDepth,
} from '../index.js';

describe('Stage 8.5 executive review lane depth enforcement', () => {
  // Contract stability
  describe('contract stability', () => {
    it('REVIEW_LANE_DEPTHS has 3', () => { expect(REVIEW_LANE_DEPTHS).toHaveLength(3); });
    it('REVIEW_CAPABILITIES has 9', () => { expect(REVIEW_CAPABILITIES).toHaveLength(9); });
    it('ESCALATION_TRIGGER_CASES has 3', () => { expect(ESCALATION_TRIGGER_CASES).toHaveLength(3); });
    it('APPLICATION_LANES has 2', () => { expect(APPLICATION_LANES).toHaveLength(2); });
    it('ESCALATION_DEEP_LINK_VIEWS has 3', () => { expect(ESCALATION_DEEP_LINK_VIEWS).toHaveLength(3); });
    it('REVIEW_LANE_CAPABILITY_MATRIX has 9 rows', () => { expect(REVIEW_LANE_CAPABILITY_MATRIX).toHaveLength(9); });
    it('LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS has 3', () => { expect(LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS).toHaveLength(3); });
    it('all capabilities have PWA_FULL', () => {
      for (const cap of REVIEW_LANE_CAPABILITY_MATRIX) {
        expect(cap.pwaDepth).toBe('PWA_FULL');
      }
    });
    it('6 capabilities are SPFX_BROAD', () => {
      const broad = REVIEW_LANE_CAPABILITY_MATRIX.filter((c) => c.spfxDepth === 'SPFX_BROAD');
      expect(broad).toHaveLength(6);
    });
    it('3 capabilities are SPFX_ESCALATE_TO_PWA', () => {
      const escalate = REVIEW_LANE_CAPABILITY_MATRIX.filter((c) => c.spfxDepth === 'SPFX_ESCALATE_TO_PWA');
      expect(escalate).toHaveLength(3);
    });
    it('all escalation triggers have contextPreservationRequired true', () => {
      for (const def of LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS) {
        expect(def.contextPreservationRequired).toBe(true);
      }
    });
    it('THREAD_MANAGEMENT deep link contains artifact param', () => {
      const threadDef = LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS.find((d) => d.triggerCase === 'THREAD_MANAGEMENT');
      expect(threadDef?.deepLinkTemplate).toContain('{reviewArtifactId}');
    });
    it('MULTI_RUN_COMPARISON deep link contains view=compare', () => {
      const compareDef = LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS.find((d) => d.triggerCase === 'MULTI_RUN_COMPARISON');
      expect(compareDef?.deepLinkTemplate).toContain('view=compare');
    });
    it('FULL_HISTORY_BROWSING deep link contains view=history', () => {
      const historyDef = LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS.find((d) => d.triggerCase === 'FULL_HISTORY_BROWSING');
      expect(historyDef?.deepLinkTemplate).toContain('view=history');
    });
  });

  // Business rules
  describe('isCapabilityAvailableInLane', () => {
    it('VIEW_SURFACES available in PWA', () => { expect(isCapabilityAvailableInLane('VIEW_SURFACES', 'PWA')).toBe(true); });
    it('VIEW_SURFACES available in SPFX', () => { expect(isCapabilityAvailableInLane('VIEW_SURFACES', 'SPFX')).toBe(true); });
    it('THREAD_MANAGEMENT available in PWA', () => { expect(isCapabilityAvailableInLane('THREAD_MANAGEMENT', 'PWA')).toBe(true); });
    it('THREAD_MANAGEMENT NOT available in SPFX', () => { expect(isCapabilityAvailableInLane('THREAD_MANAGEMENT', 'SPFX')).toBe(false); });
    it('MULTI_RUN_COMPARISON NOT available in SPFX', () => { expect(isCapabilityAvailableInLane('MULTI_RUN_COMPARISON', 'SPFX')).toBe(false); });
    it('REVIEW_HISTORY_BROWSING NOT available in SPFX', () => { expect(isCapabilityAvailableInLane('REVIEW_HISTORY_BROWSING', 'SPFX')).toBe(false); });
    it('PUSH_TO_TEAM available in SPFX', () => { expect(isCapabilityAvailableInLane('PUSH_TO_TEAM', 'SPFX')).toBe(true); });
  });

  describe('requiresEscalationToPWA', () => {
    it('THREAD_MANAGEMENT requires escalation', () => { expect(requiresEscalationToPWA('THREAD_MANAGEMENT')).toBe(true); });
    it('MULTI_RUN_COMPARISON requires escalation', () => { expect(requiresEscalationToPWA('MULTI_RUN_COMPARISON')).toBe(true); });
    it('REVIEW_HISTORY_BROWSING requires escalation', () => { expect(requiresEscalationToPWA('REVIEW_HISTORY_BROWSING')).toBe(true); });
    it('VIEW_SURFACES does NOT require escalation', () => { expect(requiresEscalationToPWA('VIEW_SURFACES')).toBe(false); });
    it('PLACE_ANNOTATIONS does NOT require escalation', () => { expect(requiresEscalationToPWA('PLACE_ANNOTATIONS')).toBe(false); });
  });

  describe('isInLaneForSpfx', () => {
    it('VIEW_SURFACES is in-lane', () => { expect(isInLaneForSpfx('VIEW_SURFACES')).toBe(true); });
    it('THREAD_MANAGEMENT is NOT in-lane', () => { expect(isInLaneForSpfx('THREAD_MANAGEMENT')).toBe(false); });
  });

  describe('buildEscalationDeepLink', () => {
    it('builds THREAD_MANAGEMENT deep link with artifact', () => {
      const link = buildEscalationDeepLink('THREAD_MANAGEMENT', 'proj-1', 'art-1', null);
      expect(link.resolvedUrl).toContain('/project-hub/proj-1/review');
      expect(link.resolvedUrl).toContain('artifact=art-1');
      expect(link.resolvedUrl).toContain('view=thread');
      expect(link.view).toBe('THREAD');
      expect(link.contextPreserved).toBe(true);
    });
    it('builds MULTI_RUN_COMPARISON deep link', () => {
      const link = buildEscalationDeepLink('MULTI_RUN_COMPARISON', 'proj-2', null, '/spfx-surface');
      expect(link.resolvedUrl).toContain('/project-hub/proj-2/review');
      expect(link.resolvedUrl).toContain('view=compare');
      expect(link.resolvedUrl).toContain('returnTo=');
      expect(link.view).toBe('COMPARE');
    });
    it('builds FULL_HISTORY_BROWSING deep link', () => {
      const link = buildEscalationDeepLink('FULL_HISTORY_BROWSING', 'proj-3', null, null);
      expect(link.resolvedUrl).toContain('view=history');
      expect(link.view).toBe('HISTORY');
    });
  });

  describe('enforceLaneDepth', () => {
    it('VIEW_SURFACES in SPFX is allowed, no escalation', () => {
      const result = enforceLaneDepth('VIEW_SURFACES', 'SPFX');
      expect(result.isAllowedInLane).toBe(true);
      expect(result.escalationRequired).toBe(false);
    });
    it('THREAD_MANAGEMENT in SPFX is NOT allowed, escalation required', () => {
      const result = enforceLaneDepth('THREAD_MANAGEMENT', 'SPFX');
      expect(result.isAllowedInLane).toBe(false);
      expect(result.escalationRequired).toBe(true);
    });
    it('THREAD_MANAGEMENT in PWA is allowed, no escalation', () => {
      const result = enforceLaneDepth('THREAD_MANAGEMENT', 'PWA');
      expect(result.isAllowedInLane).toBe(true);
      expect(result.escalationRequired).toBe(false);
    });
  });

  describe('invariants', () => {
    it('isContextPreservationRequired always true', () => { expect(isContextPreservationRequired()).toBe(true); });
    it('isPwaFullDepthForAllCapabilities always true', () => { expect(isPwaFullDepthForAllCapabilities()).toBe(true); });
    it('isSpfxBroadForCommonOperations always true', () => { expect(isSpfxBroadForCommonOperations()).toBe(true); });
    it('isNonPerUserAffectedByLaneDepth always false', () => { expect(isNonPerUserAffectedByLaneDepth()).toBe(false); });
  });
});
