import { describe, it, expect, beforeEach } from 'vitest';
import { BulkActionModuleRegistry } from './BulkActionModuleRegistry.js';
import type { IBulkActionModuleRegistration } from './BulkActionModuleRegistry.js';

const mockReg: IBulkActionModuleRegistration = { moduleKey: 'test', displayName: 'Test', actions: [] };

describe('BulkActionModuleRegistry', () => {
  beforeEach(() => BulkActionModuleRegistry._resetForTesting());
  it('registers and retrieves', () => { BulkActionModuleRegistry.register([mockReg]); expect(BulkActionModuleRegistry.getByModule('test')?.displayName).toBe('Test'); });
  it('freezes', () => { BulkActionModuleRegistry.register([mockReg]); expect(() => BulkActionModuleRegistry.register([{ ...mockReg, moduleKey: 'other' }])).toThrow('frozen'); });
  it('rejects duplicate', () => { expect(() => BulkActionModuleRegistry.register([mockReg, mockReg])).toThrow('Duplicate'); });
  it('rejects empty key', () => { expect(() => BulkActionModuleRegistry.register([{ ...mockReg, moduleKey: '' }])).toThrow('moduleKey'); });
  it('getAll', () => { BulkActionModuleRegistry.register([mockReg]); expect(BulkActionModuleRegistry.getAll()).toHaveLength(1); });
  it('getActionsForModule', () => { BulkActionModuleRegistry.register([mockReg]); expect(BulkActionModuleRegistry.getActionsForModule('test')).toEqual([]); });
  it('getActionsForModule unknown', () => { expect(BulkActionModuleRegistry.getActionsForModule('unknown')).toEqual([]); });
  it('reset', () => { BulkActionModuleRegistry.register([mockReg]); BulkActionModuleRegistry._resetForTesting(); expect(BulkActionModuleRegistry.getAll()).toHaveLength(0); });
});
