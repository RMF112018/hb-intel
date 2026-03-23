import { describe, expect, it } from 'vitest';

import {
  FORECAST_DERIVATION_REASONS,
  FORECAST_CHECKLIST_GROUPS,
  FORECAST_CHECKLIST_TEMPLATE,
} from '../../index.js';

describe('P3-E4-T03 versioning contract stability', () => {
  it('locks FORECAST_DERIVATION_REASONS to exactly 5 values', () => {
    expect(FORECAST_DERIVATION_REASONS).toEqual([
      'InitialSetup',
      'BudgetImport',
      'PostConfirmationEdit',
      'ScheduleRefresh',
      'ManualDerivation',
    ]);
    expect(FORECAST_DERIVATION_REASONS).toHaveLength(5);
  });

  it('locks FORECAST_CHECKLIST_GROUPS to exactly 4 values', () => {
    expect(FORECAST_CHECKLIST_GROUPS).toEqual([
      'RequiredDocuments',
      'ProfitForecast',
      'Schedule',
      'Additional',
    ]);
    expect(FORECAST_CHECKLIST_GROUPS).toHaveLength(4);
  });

  it('FORECAST_CHECKLIST_TEMPLATE has exactly 19 items', () => {
    expect(FORECAST_CHECKLIST_TEMPLATE).toHaveLength(19);
  });

  it('template has correct required/conditional breakdown', () => {
    const required = FORECAST_CHECKLIST_TEMPLATE.filter((i) => i.required);
    const conditional = FORECAST_CHECKLIST_TEMPLATE.filter((i) => !i.required);
    expect(required).toHaveLength(16);
    expect(conditional).toHaveLength(3);
  });

  it('template item IDs match T03 §4.1 specification', () => {
    const ids = FORECAST_CHECKLIST_TEMPLATE.map((i) => i.itemId);
    expect(ids).toContain('doc_procore_budget');
    expect(ids).toContain('doc_forecast_summary');
    expect(ids).toContain('doc_gc_gr_log');
    expect(ids).toContain('doc_cash_flow');
    expect(ids).toContain('doc_sdi_log');
    expect(ids).toContain('doc_buyout_log');
    expect(ids).toContain('profit_changes_noted');
    expect(ids).toContain('schedule_status_current');
    expect(ids).toContain('schedule_delay_notices_sent');
    expect(ids).toContain('reserve_contingency_confirmed');
    expect(ids).toContain('ar_aging_reviewed');
    expect(ids).toContain('buyout_savings_dispositioned');
    expect(ids).toContain('executive_approval_noted');
  });

  it('template groups match declared groups', () => {
    const groups = new Set(FORECAST_CHECKLIST_TEMPLATE.map((i) => i.group));
    expect(groups.size).toBe(4);
    for (const g of FORECAST_CHECKLIST_GROUPS) {
      expect(groups.has(g)).toBe(true);
    }
  });

  it('conditional items are the correct ones from §4.1', () => {
    const conditional = FORECAST_CHECKLIST_TEMPLATE.filter((i) => !i.required).map((i) => i.itemId);
    expect(conditional).toContain('schedule_delay_notices_sent');
    expect(conditional).toContain('buyout_savings_dispositioned');
    expect(conditional).toContain('executive_approval_noted');
  });

  it('RequiredDocuments group has exactly 6 items', () => {
    const docs = FORECAST_CHECKLIST_TEMPLATE.filter((i) => i.group === 'RequiredDocuments');
    expect(docs).toHaveLength(6);
  });
});
