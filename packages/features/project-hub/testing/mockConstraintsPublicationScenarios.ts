import { createMockLedgerRecordSnapshot } from './createMockLedgerRecordSnapshot.js';
import { createMockReviewPackage } from './createMockReviewPackage.js';

/** Pre-built scenarios for publication, review packages, and snapshots. */
export const mockConstraintsPublicationScenarios = {
  /** Active review package covering all four ledgers. */
  activeReviewPackage: createMockReviewPackage(),

  /** Superseded review package. */
  supersededReviewPackage: createMockReviewPackage({
    reviewPackageId: 'rp-002',
    packageNumber: 'RP-002',
    reviewPeriod: 'February 2026 Monthly Review',
    status: 'Superseded',
  }),

  /** Archived review package. */
  archivedReviewPackage: createMockReviewPackage({
    reviewPackageId: 'rp-003',
    packageNumber: 'RP-003',
    reviewPeriod: 'January 2026 Monthly Review',
    status: 'Archived',
  }),

  /** Partial-scope review package (Risk + Constraint only). */
  partialScopePackage: createMockReviewPackage({
    reviewPackageId: 'rp-004',
    packageNumber: 'RP-004',
    ledgersIncluded: ['Risk', 'Constraint'],
    reviewPeriod: 'March 2026 Risk & Constraint Focus',
  }),

  /** Active record snapshot. */
  activeSnapshot: createMockLedgerRecordSnapshot(),

  /** Superseded record snapshot. */
  supersededSnapshot: createMockLedgerRecordSnapshot({
    snapshotId: 'snap-002',
    supersededAt: '2026-03-20T14:00:00Z',
    supersededBy: 'snap-003',
  }),

  /** Risk ledger snapshot. */
  riskSnapshot: createMockLedgerRecordSnapshot({
    snapshotId: 'snap-003',
    ledgerType: 'Risk',
    recordId: 'risk-005',
    recordNumber: 'RISK-005',
    snapshotData: { title: 'Geotechnical uncertainty', status: 'MaterializationPending', riskScore: 20 },
  }),
} as const;
