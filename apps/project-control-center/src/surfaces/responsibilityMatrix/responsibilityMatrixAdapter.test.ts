import { describe, expect, it } from 'vitest';
import {
  RESPONSIBILITY_CONTRACT_PARTIES,
  RESPONSIBILITY_EXCEPTION_CODES,
  SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
} from '@hbc/models/pcc';
import type {
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccResponsibilityMatrixReadModel,
} from '@hbc/models/pcc';
import { buildPccResponsibilityMatrixViewModel } from './responsibilityMatrixAdapter.js';

const PROJECT_ID = 'p-rm-0001' as PccProjectId;

const EMPTY_READ_MODEL: PccResponsibilityMatrixReadModel = {
  templates: [],
  projectInstances: [],
  exceptions: [],
  healthScore: SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
  workbookSourceSummary: {
    defaultItemsTotal: 0,
    pmItems: 0,
    fieldItems: 0,
    strictMarkedRows: 0,
    ambiguousItemsTotal: 0,
    ownerContractActiveDefaultObligations: 0,
    sourceFiles: [],
  },
  sourcePosture: {
    sourceStatus: 'source-unavailable',
    pendingHumanReviewCount: 0,
  },
  snapshotHistory: [],
  auditEvents: [],
};

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccResponsibilityMatrixReadModel,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccResponsibilityMatrixReadModel> {
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

describe('buildPccResponsibilityMatrixViewModel — happy path (available)', () => {
  const vm = buildPccResponsibilityMatrixViewModel(
    envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL),
  );

  it('returns ready status with all eight lanes', () => {
    expect(vm.status).toBe('ready');
    if (vm.status !== 'ready') return;
    expect(vm.overview).toBeDefined();
    expect(vm.matrixView).toBeDefined();
    expect(vm.itemRegister).toBeDefined();
    expect(vm.ownerContract).toBeDefined();
    expect(vm.myResponsibilities).toBeDefined();
    expect(vm.gapsConflicts).toBeDefined();
    expect(vm.handoffs).toBeDefined();
    expect(vm.templateAdmin).toBeDefined();
  });

  it('exposes the integration signals view-model on the ready variant', () => {
    if (vm.status !== 'ready') return;
    expect(vm.integrationSignals).toBeDefined();
    expect(vm.integrationSignals.priorityActions).toBeDefined();
    expect(vm.integrationSignals.readinessSignals).toBeDefined();
    expect(vm.integrationSignals.approvalsReferences).toBeDefined();
    expect(vm.integrationSignals.teamAccessReferences).toBeDefined();
    expect(vm.integrationSignals.documentControlReferences).toBeDefined();
  });

  it('overview count posture surfaces 109 / 98 / 0 numerics from workbookSourceSummary', () => {
    if (vm.status !== 'ready') return;
    const cp = vm.overview.countPosture;
    expect(cp.defaultItemsTotal).toBe(109);
    expect(cp.pmItems).toBe(82);
    expect(cp.fieldItems).toBe(27);
    expect(cp.strictMarkedRows).toBe(98);
    expect(cp.ambiguousItemsTotal).toBe(47);
    expect(cp.ownerContractActiveDefaultObligations).toBe(0);
    expect(cp.headlineCaption).toContain('109');
    expect(cp.headlineCaption).toContain('98');
    expect(cp.headlineCaption).toContain('0 owner-contract active default obligations');
  });

  it('overview health badge resolves to computed at-risk band with full counts', () => {
    if (vm.status !== 'ready') return;
    expect(vm.overview.healthBadge.state).toBe('computed');
    expect(vm.overview.healthBadge.band).toBe('at-risk');
    expect(vm.overview.healthBadge.counts).toBeDefined();
    expect(vm.overview.healthBadge.counts!.openCriticalExceptions).toBe(1);
  });

  it('overview Who-Owns lookup contains entries for the healthy and overdue instances', () => {
    if (vm.status !== 'ready') return;
    const ids = vm.overview.whoOwnsResults.map((r) => r.instanceId);
    expect(ids).toContain('RM-INS-0001');
    expect(ids).toContain('RM-INS-0003');
    const inactive = vm.overview.whoOwnsResults.find((r) => r.personIsActive === false);
    expect(inactive).toBeDefined();
  });

  it('overview RACI vs contract-party caption clarifies separate axes', () => {
    if (vm.status !== 'ready') return;
    expect(vm.overview.raciVsContractPartyCaption).toContain('Contract-party');
    expect(vm.overview.raciVsContractPartyCaption).toContain('Consulted');
    expect(vm.overview.raciVsContractPartyCaption).toContain('Contractor');
  });

  it('matrix view rows describe ball-in-court for the overdue instance', () => {
    if (vm.status !== 'ready') return;
    const overdue = vm.matrixView.rows.find((r) => r.instanceId === 'RM-INS-0003');
    expect(overdue).toBeDefined();
    expect(overdue!.ballInCourtCaption).toContain('Ball-in-court');
  });

  it('item register surfaces overdue + lifecycle + exception codes per row', () => {
    if (vm.status !== 'ready') return;
    const overdueRow = vm.itemRegister.rows.find((r) => r.instanceId === 'RM-INS-0003');
    expect(overdueRow).toBeDefined();
    expect(overdueRow!.isOverdue).toBe(true);
    expect(overdueRow!.exceptionCodes).toContain('OVERDUE_ACTION');
  });

  it('owner-contract lane reports placeholder posture, 0 active obligations, and template + instance rows', () => {
    if (vm.status !== 'ready') return;
    expect(vm.ownerContract.activeDefaultObligationsCount).toBe(0);
    expect(vm.ownerContract.placeholderCaption).toContain('placeholder');
    expect(vm.ownerContract.placeholderCaption).toContain('0 active default obligations');
    expect(vm.ownerContract.templateRows.length).toBeGreaterThanOrEqual(1);
    const placeholder = vm.ownerContract.templateRows.find((r) =>
      r.templateItemId.startsWith('RM-OC-PLACEHOLDER'),
    );
    expect(placeholder).toBeDefined();
    expect(placeholder!.requiresUserReview).toBe(true);
    expect(vm.ownerContract.instanceRows.length).toBeGreaterThanOrEqual(1);
  });

  it('owner-contract lane fails closed when an unknown contract-party value appears', () => {
    if (vm.status !== 'ready') return;
    const tampered: PccResponsibilityMatrixReadModel = {
      ...SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
      templates: [
        ...SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.templates,
        {
          ...SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL.templates[0],
          templateItemId: 'RM-TAMPER-0001',
          baselineContractPartyMapping: {
            // Cast through unknown to simulate a tampered envelope.
            contractParty:
              'NotARealParty' as unknown as (typeof RESPONSIBILITY_CONTRACT_PARTIES)[number],
            requiresUserReview: true,
          },
        },
      ],
    };
    const tamperedVm = buildPccResponsibilityMatrixViewModel(envelope('available', tampered));
    if (tamperedVm.status !== 'ready') return;
    expect(tamperedVm.ownerContract.droppedNonRegistryPartyCount).toBe(1);
    expect(
      tamperedVm.ownerContract.templateRows.find((r) => r.templateItemId === 'RM-TAMPER-0001'),
    ).toBeUndefined();
  });

  it('gaps & conflicts groups exceptions by code with severity ordering', () => {
    if (vm.status !== 'ready') return;
    const codes = vm.gapsConflicts.groups.map((g) => g.code);
    for (const c of codes) {
      expect(RESPONSIBILITY_EXCEPTION_CODES).toContain(c);
    }
    const overdueGroup = vm.gapsConflicts.groups.find((g) => g.code === 'OVERDUE_ACTION');
    expect(overdueGroup).toBeDefined();
    expect(overdueGroup!.severityHighest).toBe('critical');
    expect(vm.gapsConflicts.unresolvedDecisionRightsGapsCaption).toContain(
      'No unresolved decision-rights gaps',
    );
  });

  it('handoffs lane lists the pending handoff from the inactive instance', () => {
    if (vm.status !== 'ready') return;
    expect(vm.handoffs.rows.length).toBeGreaterThanOrEqual(1);
    const pending = vm.handoffs.rows.find((r) => r.handoffId === 'RM-HND-0001');
    expect(pending).toBeDefined();
    expect(pending!.accepted).toBe(false);
    expect(pending!.statusLabel).toContain('Pending');
  });

  it('template admin lane lists templates and audit events with labeled types', () => {
    if (vm.status !== 'ready') return;
    expect(vm.templateAdmin.templates.length).toBeGreaterThanOrEqual(1);
    expect(vm.templateAdmin.auditEvents.length).toBeGreaterThanOrEqual(1);
    expect(vm.templateAdmin.nonExplicitMarkPolicyCaption).toContain('Support');
    expect(vm.templateAdmin.nonExplicitMarkPolicyCaption).toContain('Sign-Off');
    const placeholderRow = vm.templateAdmin.templates.find((t) =>
      t.templateItemId.startsWith('RM-OC-PLACEHOLDER'),
    );
    expect(placeholderRow?.requiresUserReview).toBe(true);
  });
});

describe('buildPccResponsibilityMatrixViewModel — health score branches', () => {
  it('returns insufficient-data badge when health score is insufficient-data', () => {
    const vm = buildPccResponsibilityMatrixViewModel(
      envelope('available', {
        ...SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
        healthScore: SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
      }),
    );
    if (vm.status !== 'ready') return;
    expect(vm.overview.healthBadge.state).toBe('insufficient-data');
    expect(vm.overview.healthBadge.insufficientReason).toBe(
      SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE.reason,
    );
    expect(vm.overview.healthBadge.counts).toBeUndefined();
    expect(vm.gapsConflicts.unresolvedDecisionRightsGapsCaption).toContain('insufficient');
  });
});

describe('buildPccResponsibilityMatrixViewModel — envelope sourceStatus branches', () => {
  it('renders ready with empty lanes when sourceStatus is source-unavailable', () => {
    const vm = buildPccResponsibilityMatrixViewModel(
      envelope('source-unavailable', EMPTY_READ_MODEL),
    );
    if (vm.status !== 'ready') return;
    expect(vm.sourceStatus).toBe('source-unavailable');
    expect(vm.matrixView.rows).toHaveLength(0);
    expect(vm.itemRegister.rows).toHaveLength(0);
    expect(vm.handoffs.rows).toHaveLength(0);
    expect(vm.templateAdmin.templates).toHaveLength(0);
    expect(vm.overview.countPosture.defaultItemsTotal).toBe(0);
  });

  it('renders ready with empty lanes when sourceStatus is backend-unavailable', () => {
    const vm = buildPccResponsibilityMatrixViewModel(
      envelope('backend-unavailable', EMPTY_READ_MODEL),
    );
    if (vm.status !== 'ready') return;
    expect(vm.sourceStatus).toBe('backend-unavailable');
    expect(vm.cardState).toBe('error');
    expect(vm.matrixView.rows).toHaveLength(0);
  });
});

describe('buildPccResponsibilityMatrixViewModel — viewer persona', () => {
  it('passes viewer persona caption when persona is provided', () => {
    const vm = buildPccResponsibilityMatrixViewModel(
      envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL, 'project-manager'),
    );
    if (vm.status !== 'ready') return;
    expect(vm.myResponsibilities.viewerPersona).toBe('project-manager');
    expect(vm.myResponsibilities.viewerPersonaCaption).toContain('project-manager');
  });

  it('falls back to no-persona caption when persona is undefined', () => {
    const vm = buildPccResponsibilityMatrixViewModel(
      envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL),
    );
    if (vm.status !== 'ready') return;
    expect(vm.myResponsibilities.viewerPersona).toBeUndefined();
    expect(vm.myResponsibilities.viewerPersonaCaption).toContain('No viewer persona');
  });
});

describe('buildPccResponsibilityMatrixViewModel — source mark mapping policy', () => {
  it('exposes ambiguous template with non-explicit marks unchanged', () => {
    const vm = buildPccResponsibilityMatrixViewModel(
      envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL),
    );
    if (vm.status !== 'ready') return;
    const ambiguous = vm.templateAdmin.templates.find((t) => t.templateItemId === 'RM-PM-0041');
    expect(ambiguous).toBeDefined();
    expect(ambiguous!.requiresUserReview).toBe(true);
    expect(ambiguous!.sourceMarksDisplay).toContain('Support');
    expect(ambiguous!.sourceMarksDisplay).toContain('Review');
    expect(ambiguous!.mappingNotes).toContain('Non-explicit');
  });
});
