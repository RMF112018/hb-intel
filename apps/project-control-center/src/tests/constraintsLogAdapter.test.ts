import { describe, expect, it } from 'vitest';
import {
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  mapSeverityBand,
  type PccConstraintsLogReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { buildPccConstraintsLogViewModel } from '../surfaces/constraintsLog/constraintsLogAdapter';
import type { IPccConstraintsLogViewModel } from '../surfaces/constraintsLog/constraintsLogViewModel';

const PROJECT_ID = 'p-w12-cl-test' as PccProjectId;

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccConstraintsLogReadModel = SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccConstraintsLogReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    viewerPersona,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

function ready(
  vm: IPccConstraintsLogViewModel,
): Extract<IPccConstraintsLogViewModel, { status: 'ready' }> {
  if (vm.status !== 'ready') throw new Error(`expected ready, got ${vm.status}`);
  return vm;
}

describe('buildPccConstraintsLogViewModel — sourceStatus branches', () => {
  it('returns ready for available envelopes with cardState=preview and sourceStatus passthrough', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.cardState).toBe('preview');
    expect(vm.sourceStatus).toBe('available');
  });

  it('returns ready for source-unavailable envelopes with cardState=unavailable-fixture', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('source-unavailable')));
    expect(vm.cardState).toBe('unavailable-fixture');
    expect(vm.sourceStatus).toBe('source-unavailable');
  });

  it('returns ready for backend-unavailable envelopes with cardState=error', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('backend-unavailable')));
    expect(vm.cardState).toBe('error');
    expect(vm.sourceStatus).toBe('backend-unavailable');
  });
});

describe('buildPccConstraintsLogViewModel — module identity passthrough', () => {
  it('passes through moduleIdentity from the envelope', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.moduleIdentity.moduleId).toBe('constraints-log');
    expect(vm.moduleIdentity.displayName).toBe('Constraints Log');
    expect(vm.moduleIdentity.subtitle).toBe('Make-Ready Constraint & Risk Exposure Center');
    expect(vm.moduleIdentity.governance).toBe('project-readiness');
    expect(vm.moduleIdentity.workCenterId).toBe('risk-issues-decision');
  });
});

describe('buildPccConstraintsLogViewModel — command center counts', () => {
  it('emits the exposure summary band counts and queue volumes from the envelope', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const cc = vm.commandCenter;
    const summary = SAMPLE_CONSTRAINTS_LOG_READ_MODEL.exposureSummary;
    expect(cc.overdueConstraintCount).toBe(summary.overdueConstraintCount);
    expect(cc.awaitingExternalPartyCount).toBe(summary.awaitingExternalPartyCount);
    expect(cc.delayExposureReviewQueueCount).toBe(summary.delayExposureReviewQueueCount);
    expect(cc.changeExposureReviewQueueCount).toBe(summary.changeExposureReviewQueueCount);
    expect(cc.priorityActionsCandidateCount).toBe(summary.priorityActionsCandidateCount);
  });

  it('returns one band-count row per band for both risks and constraints', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.commandCenter.riskBandCounts.map((b) => b.band)).toEqual([
      'low',
      'moderate',
      'high',
      'very-high',
      'critical',
    ]);
    expect(vm.commandCenter.constraintBandCounts.map((b) => b.band)).toEqual([
      'low',
      'moderate',
      'high',
      'very-high',
      'critical',
    ]);
  });
});

describe('buildPccConstraintsLogViewModel — make-ready board columns', () => {
  it('renders one column per ConstraintState in canonical order', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.makeReadyBoard.columns.map((c) => c.state)).toEqual([
      'draft',
      'identified',
      'accepted',
      'action-planned',
      'in-progress',
      'awaiting-external-party',
      'at-risk',
      'overdue',
      'resolved-pending-validation',
      'resolved',
    ]);
  });

  it('places the overdue constraint in the overdue column', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const overdueColumn = vm.makeReadyBoard.columns.find((c) => c.state === 'overdue');
    expect(overdueColumn).toBeDefined();
    expect(overdueColumn!.entries.some((e) => e.id === 'constraint-w12-004')).toBe(true);
  });

  it('places the awaiting-external-party constraint in its column', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const awaiting = vm.makeReadyBoard.columns.find((c) => c.state === 'awaiting-external-party');
    expect(awaiting).toBeDefined();
    expect(awaiting!.entries.some((e) => e.id === 'constraint-w12-005')).toBe(true);
  });
});

describe('buildPccConstraintsLogViewModel — risk matrix', () => {
  it('emits a 5x5 cell grid', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.riskMatrix.cells).toHaveLength(5);
    for (const row of vm.riskMatrix.cells) expect(row).toHaveLength(5);
  });

  it('places risks at their initial likelihood × governing impact cell', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const r5 = vm.riskMatrix.entries.find((e) => e.id === 'risk-w12-005');
    expect(r5).toBeDefined();
    const cell = vm.riskMatrix.cells[r5!.likelihood - 1][r5!.governingImpact - 1];
    expect(cell.itemIds).toContain('risk-w12-005');
  });

  it('cell band matches mapSeverityBand(score) for every cell', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    for (const row of vm.riskMatrix.cells) {
      for (const cell of row) {
        expect(cell.band).toBe(mapSeverityBand(cell.score));
      }
    }
  });

  it('surfaces residual score when present and applied override codes when present', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const r3 = vm.riskMatrix.entries.find((e) => e.id === 'risk-w12-003');
    expect(r3?.residualScore).toBe(6);
    expect(r3?.residualBand).toBe('moderate');
    const r5 = vm.riskMatrix.entries.find((e) => e.id === 'risk-w12-005');
    expect(r5?.appliedOverrideCodes).toContain('safety-immediate-command-attention');
  });
});

describe('buildPccConstraintsLogViewModel — constraint exposure matrix', () => {
  it('emits a 5x5 cell grid', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.constraintExposureMatrix.cells).toHaveLength(5);
    for (const row of vm.constraintExposureMatrix.cells) expect(row).toHaveLength(5);
  });

  it('places constraints at their urgency × governing impact cell', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const c5 = vm.constraintExposureMatrix.entries.find((e) => e.id === 'constraint-w12-005');
    expect(c5).toBeDefined();
    const cell = vm.constraintExposureMatrix.cells[c5!.urgency - 1][c5!.governingImpact - 1];
    expect(cell.itemIds).toContain('constraint-w12-005');
  });
});

describe('buildPccConstraintsLogViewModel — log table', () => {
  it('unifies risks and constraints into a single row set', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const expected =
      SAMPLE_CONSTRAINTS_LOG_READ_MODEL.riskItems.length +
      SAMPLE_CONSTRAINTS_LOG_READ_MODEL.constraintItems.length;
    expect(vm.logTable.totalCount).toBe(expected);
    expect(vm.logTable.rows.filter((r) => r.kind === 'risk')).toHaveLength(
      SAMPLE_CONSTRAINTS_LOG_READ_MODEL.riskItems.length,
    );
    expect(vm.logTable.rows.filter((r) => r.kind === 'constraint')).toHaveLength(
      SAMPLE_CONSTRAINTS_LOG_READ_MODEL.constraintItems.length,
    );
  });

  it('flags risks with applied override codes via hasOverrides', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const r5 = vm.logTable.rows.find((r) => r.id === 'risk-w12-005');
    expect(r5?.hasOverrides).toBe(true);
  });

  it('flags risks with residual reduction via hasResidualReduction', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const r3 = vm.logTable.rows.find((r) => r.id === 'risk-w12-003');
    expect(r3?.hasResidualReduction).toBe(true);
  });
});

describe('buildPccConstraintsLogViewModel — detail panel state-conditional fields', () => {
  it('preserves externalPartyReference for awaiting-external-party constraints', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const entry = vm.detailPanel.entries.get('constraint-w12-005');
    expect(entry?.externalPartyReference).toBe('vendor-switchgear-acme-electrical-supply');
  });

  it('preserves dueDateDisplay for overdue constraints', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const entry = vm.detailPanel.entries.get('constraint-w12-004');
    expect(entry?.dueDateDisplay).toBe('2026-04-28');
  });

  it('preserves convertedToConstraintId for converted risks', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const entry = vm.detailPanel.entries.get('risk-w12-006');
    expect(entry?.convertedToConstraintId).toBe('constraint-w12-005');
  });

  it('exposes mitigation rationale for residual-reduced risks', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const entry = vm.detailPanel.entries.get('risk-w12-003');
    expect(entry?.mitigationRationale).toBeDefined();
    expect(entry?.residualScore).toBe(6);
  });

  it('emits the legal/claim/delay boundary caption on every detail entry', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    for (const entry of vm.detailPanel.entries.values()) {
      expect(entry.boundaryCaption.toLowerCase()).toContain('no claim entitlement');
    }
  });

  it('selects the first risk as defaultEntryId when present', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.detailPanel.defaultEntryId).toBe('risk-w12-001');
  });
});

describe('buildPccConstraintsLogViewModel — weekly huddle sections', () => {
  it('routes overdue, awaiting-external, and triggered items to the right sections', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const overdueIds = vm.weeklyHuddle.sections
      .find((s) => s.key === 'overdue')!
      .entries.map((e) => e.id);
    expect(overdueIds).toContain('constraint-w12-004');

    const awaitingIds = vm.weeklyHuddle.sections
      .find((s) => s.key === 'awaiting-external-party')!
      .entries.map((e) => e.id);
    expect(awaitingIds).toContain('constraint-w12-005');

    const triggeredIds = vm.weeklyHuddle.sections
      .find((s) => s.key === 'triggered-risks')!
      .entries.map((e) => e.id);
    expect(triggeredIds).toContain('risk-w12-005');
  });

  it('passes through priority actions candidate count from the envelope', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.weeklyHuddle.priorityActionsCandidateCount).toBe(
      SAMPLE_CONSTRAINTS_LOG_READ_MODEL.exposureSummary.priorityActionsCandidateCount,
    );
  });
});

describe('buildPccConstraintsLogViewModel — root cause and lessons learned', () => {
  it('builds residual delta rows only when residual reduction is present', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.rootCauseLessonsLearned.residualDeltas.map((r) => r.id)).toEqual(['risk-w12-003']);
  });

  it('counts override usage from both risks and constraints', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const codes = vm.rootCauseLessonsLearned.overrideUsage.map((u) => u.code);
    expect(codes).toContain('safety-immediate-command-attention');
    expect(codes).toContain('regulatory-permitting-deadline');
    expect(codes).toContain('contractual-milestone-exposure');
  });

  it('emits the legal/claim/delay boundary caption on the root-cause lane', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.rootCauseLessonsLearned.boundaryCaption.toLowerCase()).toContain(
      'no forensic schedule analysis',
    );
  });
});

describe('buildPccConstraintsLogViewModel — executive exposure summary', () => {
  it('totals critical and very-high counts across risks and constraints', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    const summary = SAMPLE_CONSTRAINTS_LOG_READ_MODEL.exposureSummary;
    expect(vm.executiveExposureSummary.totalCriticalCount).toBe(
      (summary.riskCountsByBand.critical ?? 0) + (summary.constraintCountsByBand.critical ?? 0),
    );
    expect(vm.executiveExposureSummary.totalVeryHighCount).toBe(
      (summary.riskCountsByBand['very-high'] ?? 0) +
        (summary.constraintCountsByBand['very-high'] ?? 0),
    );
  });

  it('emits the legal/claim/delay boundary caption on the executive lane', () => {
    const vm = ready(buildPccConstraintsLogViewModel(envelope('available')));
    expect(vm.executiveExposureSummary.boundaryCaption.toLowerCase()).toContain(
      'no compensability determination',
    );
  });
});
