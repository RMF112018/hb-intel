/**
 * Canonical mock item type for @hbc/bic-next-move testing (D-10).
 *
 * Designed to exercise all fields in IBicNextMoveConfig<T>.
 * Module authors import this to avoid reimplementing boilerplate.
 *
 * @example
 * import { MockBicItem, createMockBicConfig } from '@hbc/bic-next-move/testing';
 */
export interface MockBicItem {
  id: string;
  currentOwnerId: string | null;
  currentOwnerName: string | null;
  currentOwnerRole: string;
  previousOwnerId: string | null;
  previousOwnerName: string | null;
  nextOwnerId: string | null;
  nextOwnerName: string | null;
  escalationOwnerId: string | null;
  escalationOwnerName: string | null;
  expectedAction: string;
  dueDate: string | null;
  isBlocked: boolean;
  blockedReason: string | null;
  transferHistory: Array<{
    fromOwnerId: string | null;
    fromOwnerName: string | null;
    toOwnerId: string;
    toOwnerName: string;
    toOwnerRole: string;
    transferredAt: string;
    action: string;
  }>;
}
