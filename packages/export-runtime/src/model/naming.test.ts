import { describe, it, expect } from 'vitest';
import { generateExportFileName } from './naming.js';
import { createMockExportRequest } from '../../testing/createMockExportRequest.js';

describe('generateExportFileName', () => {
  it('generates deterministic name with correct pattern', () => {
    const req = createMockExportRequest({
      format: 'csv',
      intent: 'working-data',
      context: {
        moduleKey: 'financial',
        projectId: 'proj-001',
        recordId: 'rec-001',
        snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
        snapshotType: 'current-view',
        appliedFilters: null,
        appliedSort: null,
        visibleColumns: null,
      },
    });
    const name = generateExportFileName(req);
    expect(name).toBe('financial_rec-001_working-data_20260323_140000.csv');
  });

  it('maps xlsx format correctly', () => {
    const req = createMockExportRequest({ format: 'xlsx' });
    expect(generateExportFileName(req)).toMatch(/\.xlsx$/);
  });

  it('maps pdf format correctly', () => {
    const req = createMockExportRequest({ format: 'pdf' });
    expect(generateExportFileName(req)).toMatch(/\.pdf$/);
  });

  it('maps print to pdf extension', () => {
    const req = createMockExportRequest({ format: 'print' });
    expect(generateExportFileName(req)).toMatch(/\.pdf$/);
  });

  it('sanitizes special characters in moduleKey', () => {
    const req = createMockExportRequest({
      context: {
        moduleKey: 'business development!@#',
        projectId: 'proj-001',
        recordId: 'rec-001',
        snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
        snapshotType: 'current-view',
        appliedFilters: null,
        appliedSort: null,
        visibleColumns: null,
      },
    });
    const name = generateExportFileName(req);
    expect(name).not.toMatch(/[!@# ]/);
  });

  it('produces same output for same input', () => {
    const req = createMockExportRequest();
    expect(generateExportFileName(req)).toBe(generateExportFileName(req));
  });

  it('falls back to bin extension for unknown format', () => {
    const req = createMockExportRequest({ format: 'unknown' as never });
    expect(generateExportFileName(req)).toMatch(/\.bin$/);
  });
});
