import type { IBicNextMoveConfig } from '../src/types/IBicNextMove';
import type { MockBicItem } from './MockBicItem';
import { createMockBicOwner } from './createMockBicOwner';

/**
 * Creates a complete IBicNextMoveConfig<MockBicItem> with sensible defaults (D-10).
 * All 8 resolver functions are implemented against MockBicItem fields.
 * Override any resolver for specific test scenarios.
 *
 * @example — Default config (all fields populated)
 * const config = createMockBicConfig();
 *
 * @example — Override specific resolvers
 * const config = createMockBicConfig({
 *   resolveIsBlocked: () => true,
 *   resolveBlockedReason: () => 'Waiting on signed drawings',
 * });
 *
 * @example — Config with transfer history
 * const config = createMockBicConfig({
 *   resolveTransferHistory: (item) => item.transferHistory.map(t => ({
 *     fromOwner: t.fromOwnerId ? createMockBicOwner({ userId: t.fromOwnerId, displayName: t.fromOwnerName! }) : null,
 *     toOwner: createMockBicOwner({ userId: t.toOwnerId, displayName: t.toOwnerName, role: t.toOwnerRole }),
 *     transferredAt: t.transferredAt,
 *     action: t.action,
 *   })),
 * });
 */
export function createMockBicConfig(
  overrides?: Partial<IBicNextMoveConfig<MockBicItem>>
): IBicNextMoveConfig<MockBicItem> {
  const defaultConfig: IBicNextMoveConfig<MockBicItem> = {
    ownershipModel: 'direct-assignee',

    resolveCurrentOwner: (item) => {
      if (!item.currentOwnerId || !item.currentOwnerName) return null;
      return createMockBicOwner({
        userId: item.currentOwnerId,
        displayName: item.currentOwnerName,
        role: item.currentOwnerRole,
      });
    },

    resolveExpectedAction: (item) => item.expectedAction,

    resolveDueDate: (item) => item.dueDate,

    resolveIsBlocked: (item) => item.isBlocked,

    resolveBlockedReason: (item) => item.blockedReason,

    resolvePreviousOwner: (item) => {
      if (!item.previousOwnerId || !item.previousOwnerName) return null;
      return createMockBicOwner({
        userId: item.previousOwnerId,
        displayName: item.previousOwnerName,
        role: 'Previous Role',
      });
    },

    resolveNextOwner: (item) => {
      if (!item.nextOwnerId || !item.nextOwnerName) return null;
      return createMockBicOwner({
        userId: item.nextOwnerId,
        displayName: item.nextOwnerName,
        role: 'Next Role',
      });
    },

    resolveEscalationOwner: (item) => {
      if (!item.escalationOwnerId || !item.escalationOwnerName) return null;
      return createMockBicOwner({
        userId: item.escalationOwnerId,
        displayName: item.escalationOwnerName,
        role: 'VP Operations',
      });
    },

    // D-08: Transfer history — omitted by default; provide via override when needed
    resolveTransferHistory: undefined,

    // D-01: No threshold overrides by default — platform defaults apply
    urgencyThresholds: undefined,
  };

  return { ...defaultConfig, ...overrides };
}
