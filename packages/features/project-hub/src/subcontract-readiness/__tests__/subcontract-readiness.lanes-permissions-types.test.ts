import { describe, expect, it } from 'vitest';

import {
  ANNOTATION_INVARIANTS,
  ANNOTATION_TARGET_DEFINITIONS,
  ANNOTATION_TARGETS,
  APPLICATION_LANES,
  DISTINCT_ACTION_DEFINITIONS,
  DISTINCT_ACTION_TYPE_LABELS,
  DISTINCT_ACTION_TYPES,
  PWA_DEPTH_CAPABILITIES,
  PWA_DEPTH_CAPABILITY_DEFINITIONS,
  READINESS_AUTHORITY_ROLE_T06_LABELS,
  READINESS_AUTHORITY_ROLES_T06,
  ROLE_BEHAVIOR_DEFINITIONS,
  SPFX_DEPTH_CAPABILITIES,
  SPFX_DEPTH_CAPABILITY_DEFINITIONS,
  UX_SURFACE_EXPECTATION_DEFINITIONS,
  UX_SURFACE_EXPECTATIONS,
  VISIBILITY_TIER_DEFINITIONS,
  VISIBILITY_TIER_LABELS,
  VISIBILITY_TIERS,
} from '../../index.js';

describe('P3-E13-T08 Stage 6 lanes-permissions contract stability', () => {
  describe('ReadinessAuthorityRoleT06', () => {
    it('has exactly 7 roles per T06 §1.1', () => { expect(READINESS_AUTHORITY_ROLES_T06).toHaveLength(7); });
  });
  describe('DistinctActionType', () => {
    it('has exactly 4 types per T06 §2', () => { expect(DISTINCT_ACTION_TYPES).toHaveLength(4); });
  });
  describe('AnnotationTarget', () => {
    it('has exactly 6 targets per T06 §3', () => { expect(ANNOTATION_TARGETS).toHaveLength(6); });
  });
  describe('ApplicationLane', () => {
    it('has exactly 2 lanes per T06 §4', () => { expect(APPLICATION_LANES).toHaveLength(2); });
  });
  describe('PWADepthCapability', () => {
    it('has exactly 7 capabilities per T06 §4.1', () => { expect(PWA_DEPTH_CAPABILITIES).toHaveLength(7); });
  });
  describe('SPFxDepthCapability', () => {
    it('has exactly 5 capabilities per T06 §4.2', () => { expect(SPFX_DEPTH_CAPABILITIES).toHaveLength(5); });
  });
  describe('UXSurfaceExpectation', () => {
    it('has exactly 8 expectations per T06 §5', () => { expect(UX_SURFACE_EXPECTATIONS).toHaveLength(8); });
  });
  describe('VisibilityTier', () => {
    it('has exactly 3 tiers per T06 §6', () => { expect(VISIBILITY_TIERS).toHaveLength(3); });
  });

  describe('label maps', () => {
    it('READINESS_AUTHORITY_ROLE_T06_LABELS covers 7', () => { expect(Object.keys(READINESS_AUTHORITY_ROLE_T06_LABELS)).toHaveLength(7); });
    it('DISTINCT_ACTION_TYPE_LABELS covers 4', () => { expect(Object.keys(DISTINCT_ACTION_TYPE_LABELS)).toHaveLength(4); });
    it('VISIBILITY_TIER_LABELS covers 3', () => { expect(Object.keys(VISIBILITY_TIER_LABELS)).toHaveLength(3); });
  });

  describe('definition arrays', () => {
    it('ROLE_BEHAVIOR_DEFINITIONS has 7', () => { expect(ROLE_BEHAVIOR_DEFINITIONS).toHaveLength(7); });
    it('DISTINCT_ACTION_DEFINITIONS has 4', () => { expect(DISTINCT_ACTION_DEFINITIONS).toHaveLength(4); });
    it('ANNOTATION_TARGET_DEFINITIONS has 6', () => { expect(ANNOTATION_TARGET_DEFINITIONS).toHaveLength(6); });
    it('ANNOTATION_INVARIANTS has 4', () => { expect(ANNOTATION_INVARIANTS).toHaveLength(4); });
    it('PWA_DEPTH_CAPABILITY_DEFINITIONS has 7', () => { expect(PWA_DEPTH_CAPABILITY_DEFINITIONS).toHaveLength(7); });
    it('SPFX_DEPTH_CAPABILITY_DEFINITIONS has 5', () => { expect(SPFX_DEPTH_CAPABILITY_DEFINITIONS).toHaveLength(5); });
    it('UX_SURFACE_EXPECTATION_DEFINITIONS has 8', () => { expect(UX_SURFACE_EXPECTATION_DEFINITIONS).toHaveLength(8); });
    it('VISIBILITY_TIER_DEFINITIONS has 3', () => { expect(VISIBILITY_TIER_DEFINITIONS).toHaveLength(3); });
  });
});
