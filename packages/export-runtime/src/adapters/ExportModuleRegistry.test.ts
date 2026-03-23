import { describe, it, expect, beforeEach } from 'vitest';
import { ExportModuleRegistry } from './ExportModuleRegistry.js';
import type { IExportModuleRegistration } from './ExportModuleRegistry.js';

const mockRegistration: IExportModuleRegistration = {
  moduleKey: 'test-module',
  displayName: 'Test Module',
  supportedFormats: ['csv', 'xlsx'],
  supportedIntents: ['working-data'],
  complexityTier: 'essential',
  truthProvider: {
    moduleKey: 'test-module',
    getSourceTruthStamp: () => ({
      moduleKey: 'test-module',
      projectId: 'proj-001',
      recordId: 'rec-001',
      snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
      snapshotType: 'current-view' as const,
      appliedFilters: null,
      appliedSort: null,
      visibleColumns: null,
    }),
    buildPayload: () => ({
      kind: 'table' as const,
      columns: [],
      rowCount: 0,
      selectedRowIds: null,
      filterSummary: null,
      sortSummary: null,
    }),
  },
};

describe('ExportModuleRegistry', () => {
  beforeEach(() => {
    ExportModuleRegistry._resetForTesting();
  });

  it('registers and retrieves a module', () => {
    ExportModuleRegistry.register([mockRegistration]);
    expect(ExportModuleRegistry.getByModule('test-module')).toBeDefined();
    expect(ExportModuleRegistry.getByModule('test-module')?.displayName).toBe('Test Module');
  });

  it('freezes on write', () => {
    ExportModuleRegistry.register([mockRegistration]);
    expect(() => ExportModuleRegistry.register([{ ...mockRegistration, moduleKey: 'another' }])).toThrow('frozen');
  });

  it('rejects duplicate moduleKey', () => {
    expect(() => ExportModuleRegistry.register([mockRegistration, mockRegistration])).toThrow('Duplicate');
  });

  it('rejects mismatched truthProvider.moduleKey', () => {
    const bad = { ...mockRegistration, truthProvider: { ...mockRegistration.truthProvider, moduleKey: 'wrong' } };
    expect(() => ExportModuleRegistry.register([bad])).toThrow('does not match');
  });

  it('getAll returns all entries', () => {
    ExportModuleRegistry.register([mockRegistration]);
    expect(ExportModuleRegistry.getAll()).toHaveLength(1);
  });

  it('_resetForTesting clears state', () => {
    ExportModuleRegistry.register([mockRegistration]);
    ExportModuleRegistry._resetForTesting();
    expect(ExportModuleRegistry.getAll()).toHaveLength(0);
  });

  it('getEnabled returns all registered entries', () => {
    ExportModuleRegistry.register([mockRegistration]);
    expect(ExportModuleRegistry.getEnabled()).toHaveLength(1);
  });

  it('getByModule returns undefined for unknown key', () => {
    expect(ExportModuleRegistry.getByModule('unknown')).toBeUndefined();
  });

  it('rejects empty moduleKey', () => {
    const bad = { ...mockRegistration, moduleKey: '', truthProvider: { ...mockRegistration.truthProvider, moduleKey: '' } };
    expect(() => ExportModuleRegistry.register([bad])).toThrow('moduleKey is required');
  });
});
