import { describe, expect, it } from 'vitest';

import {
  CANVAS_TILE_CONTENT,
  CASE_WORKSPACE_SYSTEM_VIEWS,
  CASE_WORKSPACE_TABS,
  CASE_WORKSPACE_ZONES,
  COMPLEXITY_ROLE_DEFAULTS,
  COVERAGE_REGISTRY_SYSTEM_VIEWS,
  HBI_ASSISTIVE_BEHAVIORS,
  NEXT_MOVE_ACTION_CATALOG,
  NEXT_MOVE_URGENCIES,
  PERMISSION_EXPLAINABILITY_CASES,
  RELATED_ITEM_INBOUND_CONSUMPTIONS,
  RELATED_ITEM_OUTBOUND_PUBLICATIONS,
  SAVED_VIEW_SCOPES,
  WARRANTY_COMPLEXITY_TIERS,
  WARRANTY_PRIMARY_SURFACES,
} from '../../index.js';

describe('P3-E14-T10 Stage 7 ux-surfaces contract stability', () => {
  describe('enum arrays', () => {
    it('WarrantyPrimarySurface has 3', () => { expect(WARRANTY_PRIMARY_SURFACES).toHaveLength(3); });
    it('CaseWorkspaceZone has 3', () => { expect(CASE_WORKSPACE_ZONES).toHaveLength(3); });
    it('CaseWorkspaceTab has 5', () => { expect(CASE_WORKSPACE_TABS).toHaveLength(5); });
    it('NextMoveUrgency has 4', () => { expect(NEXT_MOVE_URGENCIES).toHaveLength(4); });
    it('SavedViewScope has 3', () => { expect(SAVED_VIEW_SCOPES).toHaveLength(3); });
    it('WarrantyComplexityTier has 3', () => { expect(WARRANTY_COMPLEXITY_TIERS).toHaveLength(3); });
  });

  describe('Next Move action catalog', () => {
    it('has 15 entries per T07 §5.3', () => { expect(NEXT_MOVE_ACTION_CATALOG).toHaveLength(15); });
    it('Open case has coverage evaluation action', () => {
      expect(NEXT_MOVE_ACTION_CATALOG.find((e) => e.caseStatus === 'Open')?.action).toContain('coverage');
    });
  });

  describe('saved views', () => {
    it('Coverage Registry has 5 system views per T07 §6.3', () => { expect(COVERAGE_REGISTRY_SYSTEM_VIEWS).toHaveLength(5); });
    it('Case Workspace has 8 system views per T07 §6.4', () => { expect(CASE_WORKSPACE_SYSTEM_VIEWS).toHaveLength(8); });
    it('total system views = 13', () => { expect(COVERAGE_REGISTRY_SYSTEM_VIEWS.length + CASE_WORKSPACE_SYSTEM_VIEWS.length).toBe(13); });
  });

  describe('Related Items', () => {
    it('7 outbound publications per T07 §7.1', () => { expect(RELATED_ITEM_OUTBOUND_PUBLICATIONS).toHaveLength(7); });
    it('3 inbound consumptions per T07 §7.1', () => { expect(RELATED_ITEM_INBOUND_CONSUMPTIONS).toHaveLength(3); });
  });

  describe('complexity and UX', () => {
    it('COMPLEXITY_ROLE_DEFAULTS has 5 per T07 §8.4', () => { expect(COMPLEXITY_ROLE_DEFAULTS).toHaveLength(5); });
    it('PERMISSION_EXPLAINABILITY_CASES has 4 per T07 §9.1', () => { expect(PERMISSION_EXPLAINABILITY_CASES).toHaveLength(4); });
    it('HBI_ASSISTIVE_BEHAVIORS has 5 per T07 §10.2', () => { expect(HBI_ASSISTIVE_BEHAVIORS).toHaveLength(5); });
    it('CANVAS_TILE_CONTENT has 3 tiers per T07 §11.1', () => { expect(CANVAS_TILE_CONTENT).toHaveLength(3); });
  });
});
