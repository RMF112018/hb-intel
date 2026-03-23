import { describe, it, expect, beforeEach } from 'vitest';
import { PublishModuleRegistry } from './PublishModuleRegistry.js';
import type { IPublishModuleRegistration } from './PublishModuleRegistry.js';

const mockReg: IPublishModuleRegistration = {
  moduleKey: 'test', displayName: 'Test', defaultTargets: [], approvalRules: [],
  supportsSupersession: true, supportsRevocation: false,
};

describe('PublishModuleRegistry', () => {
  beforeEach(() => PublishModuleRegistry._resetForTesting());
  it('registers and retrieves', () => { PublishModuleRegistry.register([mockReg]); expect(PublishModuleRegistry.getByModule('test')?.displayName).toBe('Test'); });
  it('freezes', () => { PublishModuleRegistry.register([mockReg]); expect(() => PublishModuleRegistry.register([{ ...mockReg, moduleKey: 'other' }])).toThrow('frozen'); });
  it('rejects duplicate', () => { expect(() => PublishModuleRegistry.register([mockReg, mockReg])).toThrow('Duplicate'); });
  it('rejects empty key', () => { expect(() => PublishModuleRegistry.register([{ ...mockReg, moduleKey: '' }])).toThrow('moduleKey'); });
  it('getAll', () => { PublishModuleRegistry.register([mockReg]); expect(PublishModuleRegistry.getAll()).toHaveLength(1); });
  it('reset', () => { PublishModuleRegistry.register([mockReg]); PublishModuleRegistry._resetForTesting(); expect(PublishModuleRegistry.getAll()).toHaveLength(0); });
});
