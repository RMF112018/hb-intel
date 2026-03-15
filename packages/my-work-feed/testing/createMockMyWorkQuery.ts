import type { IMyWorkQuery } from '../src/types/index.js';

/** Factory for mock `IMyWorkQuery` instances */
export function createMockMyWorkQuery(overrides?: Partial<IMyWorkQuery>): IMyWorkQuery {
  return {
    ...overrides,
  };
}
