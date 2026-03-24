import { describe, expect, it } from 'vitest';

import {
  WARRANTY_ADJACENT_MODULE_BOUNDARIES,
  WARRANTY_ADJACENT_MODULE_LABELS,
  WARRANTY_ADJACENT_MODULES,
  WARRANTY_COVERAGE_SOURCE_DEFINITIONS,
  WARRANTY_COVERAGE_SOURCE_LABELS,
  WARRANTY_COVERAGE_SOURCES,
  WARRANTY_KEY_ACTOR_LABELS,
  WARRANTY_KEY_ACTORS,
  WARRANTY_LAYER2_SEAM_FIELD_DEFINITIONS,
  WARRANTY_LAYER2_SEAM_FIELDS,
  WARRANTY_LOCKED_INVARIANTS,
  WARRANTY_OPERATING_LAYER_LABELS,
  WARRANTY_OPERATING_LAYERS,
  WARRANTY_OPERATIONAL_FLOW_STAGE_DEFINITIONS,
  WARRANTY_OPERATIONAL_FLOW_STAGES,
  WARRANTY_OUT_OF_SCOPE_DEFINITIONS,
  WARRANTY_OUT_OF_SCOPE_ITEMS,
  WARRANTY_OUT_OF_SCOPE_LABELS,
  WARRANTY_SOT_AUTHORITIES,
  WARRANTY_SOT_BOUNDARIES,
  WARRANTY_SOT_RELATIONSHIPS,
} from '../../index.js';

describe('P3-E14-T10 Stage 1 Warranty foundation contract stability', () => {
  describe('WarrantyOperatingLayer', () => {
    it('has exactly 2 layers per T01 §4.1', () => { expect(WARRANTY_OPERATING_LAYERS).toHaveLength(2); });
  });
  describe('WarrantyKeyActor', () => {
    it('has exactly 8 actors (4 L1 + 4 L2 deferred) per T01 §4.1', () => { expect(WARRANTY_KEY_ACTORS).toHaveLength(8); });
  });
  describe('WarrantySoTAuthority', () => {
    it('has exactly 9 authorities per T01 §5.1', () => { expect(WARRANTY_SOT_AUTHORITIES).toHaveLength(9); });
  });
  describe('WarrantySoTRelationship', () => {
    it('has exactly 6 relationships per T01 §5.1', () => { expect(WARRANTY_SOT_RELATIONSHIPS).toHaveLength(6); });
  });
  describe('WarrantyAdjacentModule', () => {
    it('has exactly 5 modules per T01 §5.2', () => { expect(WARRANTY_ADJACENT_MODULES).toHaveLength(5); });
  });
  describe('WarrantyCoverageSource', () => {
    it('has exactly 3 sources per T01 §3.1', () => { expect(WARRANTY_COVERAGE_SOURCES).toHaveLength(3); });
  });
  describe('WarrantyOperationalFlowStage', () => {
    it('has exactly 7 stages per T01 §3.1', () => { expect(WARRANTY_OPERATIONAL_FLOW_STAGES).toHaveLength(7); });
  });
  describe('WarrantyOutOfScopeItem', () => {
    it('has exactly 10 items per T01 §6', () => { expect(WARRANTY_OUT_OF_SCOPE_ITEMS).toHaveLength(10); });
  });
  describe('WarrantyLayer2SeamField', () => {
    it('has exactly 3 fields per T01 §4.3', () => { expect(WARRANTY_LAYER2_SEAM_FIELDS).toHaveLength(3); });
  });

  describe('label maps', () => {
    it('WARRANTY_OPERATING_LAYER_LABELS covers 2', () => { expect(Object.keys(WARRANTY_OPERATING_LAYER_LABELS)).toHaveLength(2); });
    it('WARRANTY_KEY_ACTOR_LABELS covers 8', () => { expect(Object.keys(WARRANTY_KEY_ACTOR_LABELS)).toHaveLength(8); });
    it('WARRANTY_ADJACENT_MODULE_LABELS covers 5', () => { expect(Object.keys(WARRANTY_ADJACENT_MODULE_LABELS)).toHaveLength(5); });
    it('WARRANTY_COVERAGE_SOURCE_LABELS covers 3', () => { expect(Object.keys(WARRANTY_COVERAGE_SOURCE_LABELS)).toHaveLength(3); });
    it('WARRANTY_OUT_OF_SCOPE_LABELS covers 10', () => { expect(Object.keys(WARRANTY_OUT_OF_SCOPE_LABELS)).toHaveLength(10); });
  });

  describe('definition arrays', () => {
    it('WARRANTY_SOT_BOUNDARIES has 12 per T01 §5.1', () => { expect(WARRANTY_SOT_BOUNDARIES).toHaveLength(12); });
    it('WARRANTY_ADJACENT_MODULE_BOUNDARIES has 5 per T01 §5.2', () => { expect(WARRANTY_ADJACENT_MODULE_BOUNDARIES).toHaveLength(5); });
    it('WARRANTY_OPERATIONAL_FLOW_STAGE_DEFINITIONS has 7', () => { expect(WARRANTY_OPERATIONAL_FLOW_STAGE_DEFINITIONS).toHaveLength(7); });
    it('WARRANTY_COVERAGE_SOURCE_DEFINITIONS has 3', () => { expect(WARRANTY_COVERAGE_SOURCE_DEFINITIONS).toHaveLength(3); });
    it('WARRANTY_OUT_OF_SCOPE_DEFINITIONS has 10', () => { expect(WARRANTY_OUT_OF_SCOPE_DEFINITIONS).toHaveLength(10); });
    it('WARRANTY_LAYER2_SEAM_FIELD_DEFINITIONS has 3', () => { expect(WARRANTY_LAYER2_SEAM_FIELD_DEFINITIONS).toHaveLength(3); });
    it('WARRANTY_LOCKED_INVARIANTS has 4', () => { expect(WARRANTY_LOCKED_INVARIANTS).toHaveLength(4); });
  });

  describe('SoT boundary correctness', () => {
    it('Warranty module owns coverage definitions', () => {
      const row = WARRANTY_SOT_BOUNDARIES.find((b) => b.dataConcern === 'Warranty coverage definitions');
      expect(row?.sotOwner).toBe('WARRANTY_MODULE');
      expect(row?.warrantyRelationship).toBe('AUTHOR_AND_MAINTAIN');
    });
    it('Closeout owns source warranty documents', () => {
      const row = WARRANTY_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('Source warranty documents'));
      expect(row?.sotOwner).toBe('CLOSEOUT_MODULE');
      expect(row?.warrantyRelationship).toBe('CONSUME_AS_REFERENCE');
    });
    it('Financial boundary is advisory only', () => {
      const row = WARRANTY_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('Back-charge'));
      expect(row?.sotOwner).toBe('FINANCIAL_MODULE');
      expect(row?.warrantyRelationship).toBe('PUBLISH_ADVISORY');
    });
  });
});
