import type { IVersionMetadata, IVersionSnapshot } from '../src/types';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const ALICE: IVersionMetadata['createdBy'] = {
  userId: 'user-alice',
  displayName: 'Alice Chen',
  role: 'Project Manager',
};

const BOB: IVersionMetadata['createdBy'] = {
  userId: 'user-bob',
  displayName: 'Bob Martinez',
  role: 'Director of Preconstruction',
};

const BASE_RECORD = {
  projectName: 'Harbor Bridge Renovation',
  totalScore: 42,
  riskScore: 8,
  bidAmount: 1_250_000,
  notes: 'Initial assessment complete.',
};

// ---------------------------------------------------------------------------
// State 1 — Empty history (no versions yet)
// ---------------------------------------------------------------------------

export const emptyHistoryState = {
  metadata: [] as IVersionMetadata[],
  snapshots: {} as Record<string, IVersionSnapshot<typeof BASE_RECORD>>,
  description: 'Record has no version history',
};

// ---------------------------------------------------------------------------
// State 2 — Single draft version
// ---------------------------------------------------------------------------

const draftMetadata: IVersionMetadata = {
  snapshotId: 'snap-draft-001',
  version: 1,
  createdAt: '2026-01-10T09:00:00Z',
  createdBy: ALICE,
  changeSummary: 'Initial draft created',
  tag: 'draft',
};

export const singleDraftState = {
  metadata: [draftMetadata],
  snapshots: {
    'snap-draft-001': {
      ...draftMetadata,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record has a single draft version',
};

// ---------------------------------------------------------------------------
// State 3 — Multiple versions across lifecycle stages
// ---------------------------------------------------------------------------

const multiVersionMetadata: IVersionMetadata[] = [
  {
    snapshotId: 'snap-v1',
    version: 1,
    createdAt: '2026-01-10T09:00:00Z',
    createdBy: ALICE,
    changeSummary: 'Initial submission',
    tag: 'submitted',
  },
  {
    snapshotId: 'snap-v2',
    version: 2,
    createdAt: '2026-01-15T14:30:00Z',
    createdBy: BOB,
    changeSummary: 'Score revised after site visit',
    tag: 'submitted',
  },
  {
    snapshotId: 'snap-v3',
    version: 3,
    createdAt: '2026-01-20T10:00:00Z',
    createdBy: BOB,
    changeSummary: 'Approved for bid submission',
    tag: 'approved',
  },
];

export const multiVersionState = {
  metadata: multiVersionMetadata,
  snapshots: {
    'snap-v1': {
      ...multiVersionMetadata[0]!,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
    'snap-v2': {
      ...multiVersionMetadata[1]!,
      snapshot: { ...BASE_RECORD, totalScore: 67, riskScore: 5, notes: 'Updated after site visit.' },
    } as IVersionSnapshot<typeof BASE_RECORD>,
    'snap-v3': {
      ...multiVersionMetadata[2]!,
      snapshot: { ...BASE_RECORD, totalScore: 75, riskScore: 4, notes: 'Final approved state.' },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record with multiple versions across submission and approval stages',
};

// ---------------------------------------------------------------------------
// State 4 — Approved version (legally significant terminal state)
// ---------------------------------------------------------------------------

const approvedMetadata: IVersionMetadata = {
  snapshotId: 'snap-approved',
  version: 3,
  createdAt: '2026-01-20T10:00:00Z',
  createdBy: BOB,
  changeSummary: 'Director approved v3 for bid submission',
  tag: 'approved',
};

export const approvedVersionState = {
  metadata: [
    { ...multiVersionMetadata[0]!, },
    { ...multiVersionMetadata[1]!, },
    approvedMetadata,
  ],
  snapshots: {
    ...multiVersionState.snapshots,
    'snap-approved': {
      ...approvedMetadata,
      snapshot: { ...BASE_RECORD, totalScore: 75, riskScore: 4, notes: 'Final approved state.' },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record has a director-approved terminal version',
};

// ---------------------------------------------------------------------------
// State 5 — Rollback in progress (superseded versions present)
// ---------------------------------------------------------------------------

const supersededMetadata: IVersionMetadata[] = [
  {
    snapshotId: 'snap-base',
    version: 1,
    createdAt: '2026-01-10T09:00:00Z',
    createdBy: ALICE,
    changeSummary: 'Initial submission',
    tag: 'submitted',
  },
  {
    snapshotId: 'snap-sup-1',
    version: 2,
    createdAt: '2026-01-15T14:30:00Z',
    createdBy: ALICE,
    changeSummary: 'Score revised (later superseded)',
    tag: 'superseded',
  },
  {
    snapshotId: 'snap-sup-2',
    version: 3,
    createdAt: '2026-01-18T11:00:00Z',
    createdBy: ALICE,
    changeSummary: 'Another revision (superseded)',
    tag: 'superseded',
  },
  {
    snapshotId: 'snap-restored',
    version: 4,
    createdAt: '2026-01-25T09:00:00Z',
    createdBy: BOB,
    changeSummary: 'Restored from v1 by Bob Martinez',
    tag: 'submitted',
  },
];

export const supersededVersionState = {
  metadata: supersededMetadata,
  snapshots: {
    'snap-base': {
      ...supersededMetadata[0]!,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
    'snap-restored': {
      ...supersededMetadata[3]!,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record after rollback — v2 and v3 are superseded; v4 is the restored current state',
};

// ---------------------------------------------------------------------------
// State 6 — Rollback in-progress (modal open, awaiting confirmation)
// ---------------------------------------------------------------------------

export const rollbackInProgressState = {
  metadata: multiVersionMetadata,
  rollbackTarget: multiVersionMetadata[0]!, // User has selected v1 for restore
  isRollingBack: false,
  description: 'Rollback confirmation modal is open; user is reviewing v1 restore details',
};

// ---------------------------------------------------------------------------
// Convenience re-export
// ---------------------------------------------------------------------------

export const versionedRecordStates = {
  emptyHistoryState,
  singleDraftState,
  multiVersionState,
  approvedVersionState,
  supersededVersionState,
  rollbackInProgressState,
};
