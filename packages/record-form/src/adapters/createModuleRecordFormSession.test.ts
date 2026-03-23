import { describe, it, expect, beforeEach } from 'vitest';
import { createModuleRecordFormSession } from './createModuleRecordFormSession.js';
import { RecordFormModuleRegistry } from './RecordFormModuleRegistry.js';
import type { IRecordFormModuleRegistration } from './RecordFormModuleRegistry.js';

const mockReg: IRecordFormModuleRegistration = {
  moduleKey: 'test',
  displayName: 'Test',
  supportedModes: ['create', 'edit'],
  supportedRecordTypes: ['test-record'],
  complexityTier: 'standard',
  schemaProvider: { moduleKey: 'test', getFieldDefinitions: () => [], getValidationRules: () => [] },
};
const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createModuleRecordFormSession', () => {
  beforeEach(() => RecordFormModuleRegistry._resetForTesting());

  it('creates session from registered module', () => {
    RecordFormModuleRegistry.register([mockReg]);
    const s = createModuleRecordFormSession('test', 'proj-001', 'create', 'pm@example.com', undefined, fixedNow);
    expect(s.draft.moduleKey).toBe('test');
    expect(s.draft.mode).toBe('create');
  });

  it('throws for unregistered module', () => {
    expect(() => createModuleRecordFormSession('unknown', 'p1', 'create', 'u@e.com', undefined, fixedNow)).toThrow('not registered');
  });

  it('throws for unsupported mode', () => {
    RecordFormModuleRegistry.register([mockReg]);
    expect(() => createModuleRecordFormSession('test', 'p1', 'template', 'u@e.com', undefined, fixedNow)).toThrow('does not support mode');
  });

  it('passes options through', () => {
    RecordFormModuleRegistry.register([mockReg]);
    const s = createModuleRecordFormSession('test', 'p1', 'edit', 'u@e.com', { recordId: 'r1', schemaVersion: '2.0' }, fixedNow);
    expect(s.draft.schemaVersion).toBe('2.0');
  });
});
