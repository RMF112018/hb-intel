import { describe, it, expect, beforeEach } from 'vitest';
import { SavedViewModuleRegistry } from './SavedViewModuleRegistry.js';
import type { ISavedViewModuleRegistration } from './SavedViewModuleRegistry.js';
import { mockSchemaV1 } from '../../testing/mockSavedViewFixtures.js';

const mockReg: ISavedViewModuleRegistration = {
  moduleKey: 'test', workspaceKey: 'default', displayName: 'Test',
  mapper: { serialize: () => ({} as never), deserialize: () => ({}), currentSchemaVersion: () => 1, currentSchema: () => mockSchemaV1 },
  schema: mockSchemaV1,
};

describe('SavedViewModuleRegistry', () => {
  beforeEach(() => SavedViewModuleRegistry._resetForTesting());

  it('registers and retrieves', () => {
    SavedViewModuleRegistry.register([mockReg]);
    expect(SavedViewModuleRegistry.getByModule('test', 'default')?.displayName).toBe('Test');
  });

  it('freezes on write', () => {
    SavedViewModuleRegistry.register([mockReg]);
    expect(() => SavedViewModuleRegistry.register([{ ...mockReg, workspaceKey: 'other' }])).toThrow('frozen');
  });

  it('rejects duplicate', () => {
    expect(() => SavedViewModuleRegistry.register([mockReg, mockReg])).toThrow('Duplicate');
  });

  it('rejects empty moduleKey', () => {
    expect(() => SavedViewModuleRegistry.register([{ ...mockReg, moduleKey: '' }])).toThrow('moduleKey');
  });

  it('getAll returns entries', () => {
    SavedViewModuleRegistry.register([mockReg]);
    expect(SavedViewModuleRegistry.getAll()).toHaveLength(1);
  });

  it('_resetForTesting clears', () => {
    SavedViewModuleRegistry.register([mockReg]);
    SavedViewModuleRegistry._resetForTesting();
    expect(SavedViewModuleRegistry.getAll()).toHaveLength(0);
  });
});
