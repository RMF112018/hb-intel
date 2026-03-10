import type { IHandoffPackage, HandoffStatus } from '../src/types/IWorkflowHandoff';
import { createMockHandoffPackage } from './createMockHandoffPackage';

/**
 * Type for the canonical mock handoff state fixtures.
 * Provides one IHandoffPackage for each of the 5 lifecycle states (D-02).
 */
export type MockHandoffStates = {
  [K in HandoffStatus]: IHandoffPackage<unknown, unknown>;
};

/**
 * Canonical handoff state fixtures — one package per lifecycle state (D-02).
 * All packages share the same sender/recipient/route for consistency.
 *
 * @example
 * const sentPkg = mockHandoffStates.sent;
 * expect(sentPkg.status).toBe('sent');
 * expect(sentPkg.sentAt).not.toBeNull();
 */
export const mockHandoffStates: MockHandoffStates = {
  draft: createMockHandoffPackage({
    handoffId: 'state-draft',
    status: 'draft',
  }),
  sent: createMockHandoffPackage({
    handoffId: 'state-sent',
    status: 'sent',
  }),
  received: createMockHandoffPackage({
    handoffId: 'state-received',
    status: 'received',
  }),
  acknowledged: createMockHandoffPackage({
    handoffId: 'state-acknowledged',
    status: 'acknowledged',
  }),
  rejected: createMockHandoffPackage({
    handoffId: 'state-rejected',
    status: 'rejected',
  }),
};
