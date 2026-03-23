import { describe, expect, it } from 'vitest';

import {
  SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS,
  SCHEDULE_COMPLEXITY_TIER_CONFIGS,
  SCHEDULE_LINKED_ARTIFACT_OBJECTS,
  SCHEDULE_NOTIFICATION_CONFIGS,
  SCHEDULE_POLICY_AREAS,
  SCHEDULE_RELATED_ITEM_TYPES,
  SCHEDULE_WORK_ITEM_CONFIGS,
  SCHEDULE_WORKFLOW_HANDOFF_TYPES,
} from '../constants/index.js';

describe('P3-E5-T09 contract stability', () => {
  describe('§18.1 related items', () => {
    it('has 11 relationship types', () => { expect(SCHEDULE_RELATED_ITEM_TYPES).toHaveLength(11); });
    it('has 11 linked artifact objects', () => { expect(SCHEDULE_LINKED_ARTIFACT_OBJECTS).toHaveLength(11); });
  });

  describe('§18.2 workflow handoff', () => {
    it('has 5 handoff types', () => { expect(SCHEDULE_WORKFLOW_HANDOFF_TYPES).toHaveLength(5); });
  });

  describe('§18.3 work feed', () => {
    it('has 10 work item configs', () => { expect(SCHEDULE_WORK_ITEM_CONFIGS).toHaveLength(10); });
  });

  describe('§18.4 notifications', () => {
    it('has 6 notification configs', () => { expect(SCHEDULE_NOTIFICATION_CONFIGS).toHaveLength(6); });
  });

  describe('§18.5 complexity tiers', () => {
    it('has 3 tiers', () => { expect(SCHEDULE_COMPLEXITY_TIER_CONFIGS).toHaveLength(3); });
    it('Essential has fewest features', () => {
      const essential = SCHEDULE_COMPLEXITY_TIER_CONFIGS.find((c) => c.tier === 'Essential');
      const expert = SCHEDULE_COMPLEXITY_TIER_CONFIGS.find((c) => c.tier === 'Expert');
      expect(essential!.features.length).toBeLessThan(expert!.features.length);
    });
  });

  describe('§23 annotatable surfaces', () => {
    it('has 5 annotatable surface configs', () => { expect(SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS).toHaveLength(5); });
    it('each surface has at least one annotatable field', () => {
      for (const config of SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS) {
        expect(config.annotatableFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe('§20 policy areas', () => {
    it('has 20 policy areas', () => { expect(SCHEDULE_POLICY_AREAS).toHaveLength(20); });
    it('each area has a description', () => {
      for (const area of SCHEDULE_POLICY_AREAS) {
        expect(area.description).toBeTruthy();
      }
    });
  });
});
