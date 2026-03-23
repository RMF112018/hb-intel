import { describe, it, expect, beforeEach } from 'vitest';
import { createModuleExportRequest } from './createModuleExportRequest.js';
import { ExportModuleRegistry } from './ExportModuleRegistry.js';
import type { IExportModuleRegistration } from './ExportModuleRegistry.js';

const mockRegistration: IExportModuleRegistration = {
  moduleKey: 'test-module',
  displayName: 'Test Module',
  supportedFormats: ['csv', 'xlsx'],
  supportedIntents: ['working-data', 'current-view'],
  complexityTier: 'standard',
  truthProvider: {
    moduleKey: 'test-module',
    getSourceTruthStamp: (recordId, projectId) => ({
      moduleKey: 'test-module',
      projectId,
      recordId,
      snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
      snapshotType: 'current-view' as const,
      appliedFilters: null,
      appliedSort: null,
      visibleColumns: null,
    }),
    buildPayload: () => ({
      kind: 'table' as const,
      columns: [],
      rowCount: 25,
      selectedRowIds: null,
      filterSummary: null,
      sortSummary: null,
    }),
  },
};

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createModuleExportRequest', () => {
  beforeEach(() => {
    ExportModuleRegistry._resetForTesting();
  });

  it('creates request from registered module', () => {
    ExportModuleRegistry.register([mockRegistration]);
    const req = createModuleExportRequest('test-module', 'rec-001', 'proj-001', 'csv', 'working-data', undefined, fixedNow);
    expect(req.format).toBe('csv');
    expect(req.intent).toBe('working-data');
    expect(req.context.moduleKey).toBe('test-module');
    expect(req.receipt?.status).toBe('saved-locally');
  });

  it('throws for unregistered module', () => {
    expect(() => createModuleExportRequest('unknown', 'rec-001', 'proj-001', 'csv', 'working-data', undefined, fixedNow)).toThrow('not registered');
  });

  it('throws for unsupported format', () => {
    ExportModuleRegistry.register([mockRegistration]);
    expect(() => createModuleExportRequest('test-module', 'rec-001', 'proj-001', 'pdf', 'working-data', undefined, fixedNow)).toThrow('does not support format');
  });

  it('throws for unsupported intent', () => {
    ExportModuleRegistry.register([mockRegistration]);
    expect(() => createModuleExportRequest('test-module', 'rec-001', 'proj-001', 'csv', 'composite-report', undefined, fixedNow)).toThrow('does not support intent');
  });
});
