import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_PACKAGE_LAYERS, CLOSEOUT_SURFACE_TARGETS, CLOSEOUT_SHARED_PACKAGES,
  CLOSEOUT_SPINE_CONTRACTS, CLOSEOUT_LANE_CAPABILITIES,
  CLOSEOUT_PACKAGE_IDENTITY, CLOSEOUT_EXTERNAL_OWNERSHIP,
  CLOSEOUT_SURFACE_CLASSIFICATIONS, CLOSEOUT_SPFX_CONSTRAINTS, CLOSEOUT_PWA_FEATURES,
  CLOSEOUT_RELATED_ITEMS_PAIRS, CLOSEOUT_VERSIONED_RECORDS,
  CLOSEOUT_ANNOTATION_ATTACHMENT_POINTS, CLOSEOUT_WORKFLOW_HANDOFF_TRIGGERS,
  CLOSEOUT_ACKNOWLEDGMENT_USE_CASES, CLOSEOUT_BIC_PROMPTS, CLOSEOUT_NOTIFICATIONS,
  CLOSEOUT_SPINE_PUBLICATION_CONTRACTS, CLOSEOUT_PROHIBITED_DEPENDENCIES,
  CLOSEOUT_LANE_CAPABILITY_ENTRIES, CLOSEOUT_LANE_CAPABILITY_LABELS, CLOSEOUT_SHARED_PACKAGE_LABELS,
} from '../../index.js';

describe('P3-E10-T10 Closeout integration contract stability', () => {
  describe('Enums', () => {
    it('has 4 package layers', () => { expect(CLOSEOUT_PACKAGE_LAYERS).toHaveLength(4); });
    it('has 2 surface targets', () => { expect(CLOSEOUT_SURFACE_TARGETS).toHaveLength(2); });
    it('has 7 shared packages', () => { expect(CLOSEOUT_SHARED_PACKAGES).toHaveLength(7); });
    it('has 3 spine contracts', () => { expect(CLOSEOUT_SPINE_CONTRACTS).toHaveLength(3); });
    it('has 7 lane capabilities', () => { expect(CLOSEOUT_LANE_CAPABILITIES).toHaveLength(7); });
  });

  describe('Package identity', () => {
    it('is @hbc/project-closeout at Feature layer', () => {
      expect(CLOSEOUT_PACKAGE_IDENTITY.name).toBe('@hbc/project-closeout');
      expect(CLOSEOUT_PACKAGE_IDENTITY.layer).toBe('Feature');
    });
  });

  describe('External ownership', () => {
    it('has 6 items per §1.3', () => { expect(CLOSEOUT_EXTERNAL_OWNERSHIP).toHaveLength(6); });
  });

  describe('Surface classifications', () => {
    it('has 5 sub-surfaces per §2.1', () => { expect(CLOSEOUT_SURFACE_CLASSIFICATIONS).toHaveLength(5); });
  });

  describe('SPFx constraints', () => {
    it('has 6 constraints per §2.2', () => { expect(CLOSEOUT_SPFX_CONSTRAINTS).toHaveLength(6); });
  });

  describe('PWA features', () => {
    it('has 4 features per §2.3', () => { expect(CLOSEOUT_PWA_FEATURES).toHaveLength(4); });
  });

  describe('Shared package contracts', () => {
    it('has 4 related-items pairs per §3.1', () => { expect(CLOSEOUT_RELATED_ITEMS_PAIRS).toHaveLength(4); });
    it('has 6 versioned records per §3.1', () => { expect(CLOSEOUT_VERSIONED_RECORDS).toHaveLength(6); });
    it('has 8 annotation points per §3.1', () => { expect(CLOSEOUT_ANNOTATION_ATTACHMENT_POINTS).toHaveLength(8); });
    it('has 5 handoff triggers per §3.1', () => { expect(CLOSEOUT_WORKFLOW_HANDOFF_TRIGGERS).toHaveLength(5); });
    it('has 2 acknowledgment use cases per §3.1', () => { expect(CLOSEOUT_ACKNOWLEDGMENT_USE_CASES).toHaveLength(2); });
    it('has 5 BIC prompts per §3.1', () => { expect(CLOSEOUT_BIC_PROMPTS).toHaveLength(5); });
    it('has 5 notifications per §3.1', () => { expect(CLOSEOUT_NOTIFICATIONS).toHaveLength(5); });
  });

  describe('Spine publication', () => {
    it('has 3 contracts per §4', () => { expect(CLOSEOUT_SPINE_PUBLICATION_CONTRACTS).toHaveLength(3); });
  });

  describe('Prohibited dependencies', () => {
    it('has 6 per §5.1', () => { expect(CLOSEOUT_PROHIBITED_DEPENDENCIES).toHaveLength(6); });
    it('includes @hbc/financial', () => {
      expect(CLOSEOUT_PROHIBITED_DEPENDENCIES.some((d) => d.importPackage === '@hbc/financial')).toBe(true);
    });
  });

  describe('Lane capabilities', () => {
    it('has 7 per §6', () => { expect(CLOSEOUT_LANE_CAPABILITY_ENTRIES).toHaveLength(7); });
  });

  describe('Labels', () => {
    it('labels all 7 lanes', () => { expect(Object.keys(CLOSEOUT_LANE_CAPABILITY_LABELS)).toHaveLength(7); });
    it('labels all 7 shared packages', () => { expect(Object.keys(CLOSEOUT_SHARED_PACKAGE_LABELS)).toHaveLength(7); });
  });
});
