import { describe, expect, it } from 'vitest';

import {
  VIEWS_SCOPE,
  PERMIT_VIEW_SURFACES,
  PERMIT_ANNOTATION_TYPES,
  PERMIT_REPORT_TYPES,
  PERMIT_QUICK_ACTIONS,
  PERMIT_DETAIL_SECTIONS,
  INLINE_DEFICIENCY_ACTIONS,
  PERMIT_LIST_COLUMNS,
  PERMIT_HEALTH_INDICATORS,
  PERMIT_DETAIL_VIEW_SECTIONS,
  PERMIT_EDIT_CONSTRAINTS,
  PERMIT_QUICK_ACTION_CONFIGS,
  COMPLIANCE_DASHBOARD_TILES,
  PERMIT_REPORT_CONFIGS,
  PERMIT_EXPORT_FIELDS,
  PERMIT_ANNOTATION_UX_CONFIGS,
} from '../../index.js';

describe('P3-E7-T06 contract stability', () => {
  it('VIEWS_SCOPE is "permits/views"', () => {
    expect(VIEWS_SCOPE).toBe('permits/views');
  });

  it('locks PERMIT_VIEW_SURFACES to exactly 5 values', () => {
    expect(PERMIT_VIEW_SURFACES).toHaveLength(5);
  });

  it('locks PERMIT_ANNOTATION_TYPES to exactly 3 values', () => {
    expect(PERMIT_ANNOTATION_TYPES).toEqual(['Note', 'Flag', 'Recommendation']);
  });

  it('locks PERMIT_REPORT_TYPES to exactly 6 values', () => {
    expect(PERMIT_REPORT_TYPES).toHaveLength(6);
  });

  it('locks PERMIT_QUICK_ACTIONS to exactly 5 values', () => {
    expect(PERMIT_QUICK_ACTIONS).toHaveLength(5);
  });

  it('locks PERMIT_DETAIL_SECTIONS to exactly 11 values', () => {
    expect(PERMIT_DETAIL_SECTIONS).toHaveLength(11);
  });

  it('locks INLINE_DEFICIENCY_ACTIONS to exactly 5 values', () => {
    expect(INLINE_DEFICIENCY_ACTIONS).toHaveLength(5);
  });

  it('PERMIT_LIST_COLUMNS has exactly 12 columns', () => {
    expect(PERMIT_LIST_COLUMNS).toHaveLength(12);
  });

  it('default-visible columns include permitNumber and status', () => {
    const visible = PERMIT_LIST_COLUMNS.filter((c) => c.defaultVisible);
    expect(visible.map((c) => c.columnKey)).toContain('permitNumber');
    expect(visible.map((c) => c.columnKey)).toContain('status');
  });

  it('PERMIT_HEALTH_INDICATORS has exactly 4 entries', () => {
    expect(PERMIT_HEALTH_INDICATORS).toHaveLength(4);
  });

  it('CRITICAL health indicator is Red', () => {
    const critical = PERMIT_HEALTH_INDICATORS.find((h) => h.tier === 'CRITICAL');
    expect(critical?.color).toBe('Red');
  });

  it('PERMIT_DETAIL_VIEW_SECTIONS has exactly 11 entries', () => {
    expect(PERMIT_DETAIL_VIEW_SECTIONS).toHaveLength(11);
  });

  it('Annotations section is for PER-surface only', () => {
    const annotations = PERMIT_DETAIL_VIEW_SECTIONS.find((s) => s.section === 'Annotations');
    expect(annotations?.content).toContain('PER-surface');
  });

  it('PERMIT_EDIT_CONSTRAINTS has exactly 8 entries', () => {
    expect(PERMIT_EDIT_CONSTRAINTS).toHaveLength(8);
  });

  it('Status is via lifecycle action only', () => {
    const status = PERMIT_EDIT_CONSTRAINTS.find((c) => c.fieldGroup === 'Status');
    expect(status?.whoMayEdit).toContain('lifecycle action');
  });

  it('PERMIT_QUICK_ACTION_CONFIGS has exactly 5', () => {
    expect(PERMIT_QUICK_ACTION_CONFIGS).toHaveLength(5);
  });

  it('COMPLIANCE_DASHBOARD_TILES has exactly 6', () => {
    expect(COMPLIANCE_DASHBOARD_TILES).toHaveLength(6);
  });

  it('PERMIT_REPORT_CONFIGS has exactly 6', () => {
    expect(PERMIT_REPORT_CONFIGS).toHaveLength(6);
  });

  it('PERMIT_EXPORT_FIELDS has exactly 11', () => {
    expect(PERMIT_EXPORT_FIELDS).toHaveLength(11);
  });

  it('PERMIT_ANNOTATION_UX_CONFIGS has exactly 3', () => {
    expect(PERMIT_ANNOTATION_UX_CONFIGS).toHaveLength(3);
  });

  it('Flag annotation is amber', () => {
    const flag = PERMIT_ANNOTATION_UX_CONFIGS.find((c) => c.annotationType === 'Flag');
    expect(flag?.color).toBe('amber');
  });
});
