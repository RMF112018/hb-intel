import type { IMyWorkRuntimeContext } from '../src/types/index.js';

/** Factory for mock `IMyWorkRuntimeContext` instances */
export function createMockRuntimeContext(overrides?: Partial<IMyWorkRuntimeContext>): IMyWorkRuntimeContext {
  return {
    currentUserId: 'user-001',
    roleKeys: ['approver'],
    isOffline: false,
    complexityTier: 'standard',
    ...overrides,
  };
}
