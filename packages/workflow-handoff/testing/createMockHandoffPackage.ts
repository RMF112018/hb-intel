import type { IHandoffPackage, HandoffStatus } from '../src/types/IWorkflowHandoff';
import { createMockHandoffDocument } from './createMockHandoffDocument';
import { createMockContextNote } from './createMockContextNote';

let counter = 0;

/**
 * Creates a mock IHandoffPackage with sensible defaults.
 * Sender/recipient use IBicOwner objects. All nullable fields default to null.
 * Status-conditional timestamps: sentAt is null for 'draft', acknowledgedAt/rejectedAt
 * are set only for their respective terminal states.
 *
 * @example
 * const pkg = createMockHandoffPackage({ status: 'sent' });
 * const ackPkg = createMockHandoffPackage<MySource, MyDest>({ status: 'acknowledged' });
 */
export function createMockHandoffPackage<TSource = unknown, TDest = unknown>(
  overrides?: Partial<IHandoffPackage<TSource, TDest>> & { status?: HandoffStatus }
): IHandoffPackage<TSource, TDest> {
  counter += 1;
  const status: HandoffStatus = overrides?.status ?? 'draft';

  return {
    handoffId: `mock-handoff-${counter}`,
    sourceModule: 'business-development',
    sourceRecordType: 'bd-scorecard',
    sourceRecordId: `mock-source-${counter}`,
    destinationModule: 'estimating',
    destinationRecordType: 'estimating-pursuit',
    sourceSnapshot: { id: `mock-source-${counter}`, projectName: 'Test Project' } as unknown as TSource,
    destinationSeedData: { projectName: 'Test Project' } as unknown as Partial<TDest>,
    documents: [createMockHandoffDocument()],
    contextNotes: [createMockContextNote()],
    sender: {
      userId: 'mock-sender-001',
      displayName: 'John BD Director',
      role: 'BD Director',
    },
    recipient: {
      userId: 'mock-recipient-001',
      displayName: 'Jane Estimating',
      role: 'Estimating Coordinator',
    },
    status,
    sentAt: status !== 'draft' ? '2026-01-15T09:05:00Z' : null,
    acknowledgedAt: status === 'acknowledged' ? '2026-01-15T10:00:00Z' : null,
    rejectedAt: status === 'rejected' ? '2026-01-15T10:00:00Z' : null,
    rejectionReason: status === 'rejected' ? 'Missing final bid documents' : null,
    createdDestinationRecordId: status === 'acknowledged' ? `mock-dest-${counter}` : null,
    createdAt: '2026-01-15T09:00:00Z',
    ...overrides,
  };
}
