import { describe, expect, it } from 'vitest';
import {
  CHECKPOINT_SOURCE_MODULES,
  EMPTY_APPROVALS_READ_MODEL,
  PROJECT_READINESS_SOURCE_MODULES,
  SAMPLE_APPROVALS_READ_MODEL,
  type CheckpointSourceModule,
  type PccApprovalRequestId,
  type PccApprovalsReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
  type ProjectReadinessSourceModuleId,
} from '@hbc/models/pcc';
import {
  APPROVALS_READINESS_REFERENCE_CAPTION,
  buildApprovalsReadinessReferences,
  mapCheckpointSourceModuleToReadinessSourceModuleId,
} from '../viewModels/approvalsReadinessReferencesAdapter';

const PROJECT_ID = 'p-w14-approvals-readiness-test' as PccProjectId;

function envelope(
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
): PccReadModelEnvelope<PccApprovalsReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

describe('mapCheckpointSourceModuleToReadinessSourceModuleId — exhaustive coverage', () => {
  const READINESS_SET: ReadonlySet<ProjectReadinessSourceModuleId> = new Set(
    PROJECT_READINESS_SOURCE_MODULES,
  );

  it.each(CHECKPOINT_SOURCE_MODULES)(
    'maps %s to a valid ProjectReadinessSourceModuleId',
    (sourceModule) => {
      const target = mapCheckpointSourceModuleToReadinessSourceModuleId(
        sourceModule as CheckpointSourceModule,
      );
      expect(READINESS_SET.has(target)).toBe(true);
    },
  );

  it('maps the four user-confirmed entries to their canonical readiness ids', () => {
    expect(mapCheckpointSourceModuleToReadinessSourceModuleId('estimating-workbench-wave-13g')).toBe(
      'approvals-checkpoints',
    );
    expect(
      mapCheckpointSourceModuleToReadinessSourceModuleId('permit-and-inspection-control-center'),
    ).toBe('permit-log');
    expect(mapCheckpointSourceModuleToReadinessSourceModuleId('team-and-access')).toBe('team-access');
    expect(
      mapCheckpointSourceModuleToReadinessSourceModuleId('project-lifecycle-readiness-center'),
    ).toBe('project-lifecycle-readiness');
  });

  it('maps the source-modules that have no direct readiness equivalent to the approvals-checkpoints catch-all', () => {
    for (const source of [
      'project-readiness',
      'priority-actions',
      'executive-oversight',
      'admin-review-surfaces',
    ] as const) {
      expect(mapCheckpointSourceModuleToReadinessSourceModuleId(source)).toBe(
        'approvals-checkpoints',
      );
    }
  });
});

describe('buildApprovalsReadinessReferences — empty / undefined paths', () => {
  it('returns empty array when envelope is undefined (runtime degraded)', () => {
    const rows = buildApprovalsReadinessReferences(undefined);
    expect(rows).toEqual([]);
  });

  it('returns empty array when envelope queue is empty', () => {
    const rows = buildApprovalsReadinessReferences(envelope(EMPTY_APPROVALS_READ_MODEL));
    expect(rows).toEqual([]);
  });

  it('skips queue entries with no matching checkpoint instance — never synthesizes a source module', () => {
    const customEnvelope = envelope({
      ...EMPTY_APPROVALS_READ_MODEL,
      queue: {
        entries: [
          {
            approvalRequestId: 'r-orphan' as PccApprovalRequestId,
            projectId: PROJECT_ID,
            state: 'pending-review',
            createdAtUtc: '2026-04-15T08:00:00Z',
            title: 'Orphan queue entry',
          },
        ],
      },
    });
    const rows = buildApprovalsReadinessReferences(customEnvelope);
    expect(rows).toEqual([]);
  });
});

describe('buildApprovalsReadinessReferences — projection from SAMPLE composite', () => {
  it('produces at least one reference row from the SAMPLE envelope', () => {
    const rows = buildApprovalsReadinessReferences(envelope());
    expect(rows.length).toBeGreaterThan(0);
  });

  it('every row carries the canonical reference caption', () => {
    const rows = buildApprovalsReadinessReferences(envelope());
    for (const row of rows) {
      expect(row.referenceCaption).toBe(APPROVALS_READINESS_REFERENCE_CAPTION);
    }
  });

  it('each row preserves the original CheckpointSourceModule on a separate field from the mapped sourceModuleId', () => {
    const rows = buildApprovalsReadinessReferences(envelope());
    for (const row of rows) {
      // checkpointSourceModule must be a CheckpointSourceModule literal.
      expect((CHECKPOINT_SOURCE_MODULES as readonly string[]).includes(row.checkpointSourceModule)).toBe(
        true,
      );
      // readinessSourceModuleId must be a ProjectReadinessSourceModuleId literal.
      expect(
        (PROJECT_READINESS_SOURCE_MODULES as readonly string[]).includes(row.readinessSourceModuleId),
      ).toBe(true);
      // Mapping must agree with the helper.
      expect(row.readinessSourceModuleId).toBe(
        mapCheckpointSourceModuleToReadinessSourceModuleId(row.checkpointSourceModule),
      );
    }
  });

  it('skips queue entries whose state is terminal even when a checkpoint instance exists', () => {
    const sample = SAMPLE_APPROVALS_READ_MODEL;
    const terminalStates = new Set(['approved', 'rejected-returned', 'waived', 'cancelled']);
    const rows = buildApprovalsReadinessReferences(envelope(sample));
    for (const row of rows) {
      expect(terminalStates.has(row.state)).toBe(false);
    }
  });
});
