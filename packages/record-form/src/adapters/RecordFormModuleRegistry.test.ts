import { describe, it, expect, beforeEach } from 'vitest';
import { RecordFormModuleRegistry } from './RecordFormModuleRegistry.js';
import type { IRecordFormModuleRegistration } from './RecordFormModuleRegistry.js';

const mockReg: IRecordFormModuleRegistration = {
  moduleKey: 'test',
  displayName: 'Test',
  supportedModes: ['create', 'edit'],
  supportedRecordTypes: ['test-record'],
  complexityTier: 'essential',
  schemaProvider: { moduleKey: 'test', getFieldDefinitions: () => [], getValidationRules: () => [] },
};

describe('RecordFormModuleRegistry', () => {
  beforeEach(() => RecordFormModuleRegistry._resetForTesting());

  it('registers and retrieves', () => {
    RecordFormModuleRegistry.register([mockReg]);
    expect(RecordFormModuleRegistry.getByModule('test')?.displayName).toBe('Test');
  });

  it('freezes on write', () => {
    RecordFormModuleRegistry.register([mockReg]);
    expect(() => RecordFormModuleRegistry.register([{ ...mockReg, moduleKey: 'other', schemaProvider: { ...mockReg.schemaProvider, moduleKey: 'other' } }])).toThrow('frozen');
  });

  it('rejects duplicate', () => {
    expect(() => RecordFormModuleRegistry.register([mockReg, mockReg])).toThrow('Duplicate');
  });

  it('rejects mismatched moduleKey', () => {
    expect(() => RecordFormModuleRegistry.register([{ ...mockReg, schemaProvider: { ...mockReg.schemaProvider, moduleKey: 'wrong' } }])).toThrow('does not match');
  });

  it('rejects empty moduleKey', () => {
    expect(() => RecordFormModuleRegistry.register([{ ...mockReg, moduleKey: '', schemaProvider: { ...mockReg.schemaProvider, moduleKey: '' } }])).toThrow('moduleKey is required');
  });

  it('getAll returns entries', () => {
    RecordFormModuleRegistry.register([mockReg]);
    expect(RecordFormModuleRegistry.getAll()).toHaveLength(1);
  });

  it('getEnabled returns entries', () => {
    RecordFormModuleRegistry.register([mockReg]);
    expect(RecordFormModuleRegistry.getEnabled()).toHaveLength(1);
  });

  it('_resetForTesting clears', () => {
    RecordFormModuleRegistry.register([mockReg]);
    RecordFormModuleRegistry._resetForTesting();
    expect(RecordFormModuleRegistry.getAll()).toHaveLength(0);
  });
});
