import type { IMyWorkTeamFeedResult } from '../src/types/index.js';
import { createMockMyWorkItem } from './createMockMyWorkItem.js';

/** Factory for mock `IMyWorkTeamFeedResult` with pre-configured team items */
export function createMockMyWorkTeamScenario(
  overrides?: Partial<IMyWorkTeamFeedResult>,
): IMyWorkTeamFeedResult {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    items: [
      createMockMyWorkItem({
        workItemId: 'team-aging-001',
        title: 'Delegated aging item',
        delegatedTo: { type: 'user', id: 'user-002', label: 'Bob' },
        isOverdue: true,
        state: 'active',
        timestamps: {
          createdAtIso: thirtyDaysAgo,
          updatedAtIso: thirtyDaysAgo,
          markedReadAtIso: null,
          markedDeferredAtIso: null,
          deferredUntilIso: null,
        },
      }),
      createMockMyWorkItem({
        workItemId: 'team-blocked-001',
        title: 'Blocked escalation candidate',
        isBlocked: true,
        isOverdue: true,
        state: 'blocked',
        delegatedBy: { type: 'user', id: 'user-003', label: 'Carol' },
      }),
      createMockMyWorkItem({
        workItemId: 'team-active-001',
        title: 'Team-visible active item',
        state: 'active',
        owner: { type: 'role', id: 'role-001', label: 'Project Manager' },
      }),
    ],
    totalCount: 3,
    agingCount: 1,
    blockedCount: 1,
    escalationCandidateCount: 1,
    lastRefreshedIso: new Date().toISOString(),
    ...overrides,
  };
}
