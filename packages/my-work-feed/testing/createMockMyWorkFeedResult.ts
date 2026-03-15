import type { IMyWorkFeedResult } from '../src/types/index.js';
import { createMockMyWorkItem } from './createMockMyWorkItem.js';

/** Factory for mock `IMyWorkFeedResult` instances */
export function createMockMyWorkFeedResult(overrides?: Partial<IMyWorkFeedResult>): IMyWorkFeedResult {
  return {
    items: [createMockMyWorkItem()],
    totalCount: 1,
    unreadCount: 1,
    nowCount: 1,
    blockedCount: 0,
    waitingCount: 0,
    deferredCount: 0,
    lastRefreshedIso: '2026-01-15T10:00:00.000Z',
    isStale: false,
    ...overrides,
  };
}
