import { describe, expect, it } from 'vitest';
import {
  SAMPLE_BUYOUT_LOG_READ_MODEL,
  type PccBuyoutLogReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { buildPccBuyoutLogViewModel } from '../surfaces/buyoutLog/buyoutLogAdapter';
import {
  PCC_BL_REGION_IDS,
  type IPccBuyoutLogViewModel,
} from '../surfaces/buyoutLog/buyoutLogViewModel';
import { PCC_STATUS_PILL_TONES, PccStatusPill } from '../ui/PccStatusPill';

const PROJECT_ID = 'p-w13-bl-test' as PccProjectId;

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccBuyoutLogReadModel = SAMPLE_BUYOUT_LOG_READ_MODEL,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccBuyoutLogReadModel> {
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

function ready(vm: IPccBuyoutLogViewModel): Extract<IPccBuyoutLogViewModel, { status: 'ready' }> {
  if (vm.status !== 'ready') throw new Error(`expected ready, got ${vm.status}`);
  return vm;
}

describe('buildPccBuyoutLogViewModel — sourceStatus branches', () => {
  it('returns ready for available envelopes with cardState=preview and sourceStatus passthrough', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.cardState).toBe('preview');
    expect(vm.sourceStatus).toBe('available');
  });

  it('returns ready for source-unavailable envelopes with cardState=unavailable-fixture', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('source-unavailable')));
    expect(vm.cardState).toBe('unavailable-fixture');
    expect(vm.sourceStatus).toBe('source-unavailable');
  });

  it('returns ready for backend-unavailable envelopes with cardState=error', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('backend-unavailable')));
    expect(vm.cardState).toBe('error');
    expect(vm.sourceStatus).toBe('backend-unavailable');
  });

  it('does not produce a "loading" status — adapter is pure envelope-in', () => {
    for (const status of ['available', 'source-unavailable', 'backend-unavailable'] as const) {
      const vm = buildPccBuyoutLogViewModel(envelope(status));
      // Type-narrow: only ready/error are valid envelope-driven outputs;
      // 'loading' must not be produced by the pure adapter.
      expect(vm.status).not.toBe('loading');
      expect(vm.status).toBe('ready');
    }
  });
});

describe('buildPccBuyoutLogViewModel — module identity passthrough', () => {
  it('passes through moduleIdentity from the envelope', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.moduleIdentity.moduleId).toBe('buyout-log');
    expect(vm.moduleIdentity.displayName).toBe('Buyout Log');
    expect(vm.moduleIdentity.subtitle).toBe('Buyout Control Center');
    expect(vm.moduleIdentity.governance).toBe('project-readiness');
    expect(vm.moduleIdentity.workCenterId).toBe('procurement-and-buyout');
    expect(vm.moduleIdentity.mvpTier).toBe('MVP');
  });
});

describe('buildPccBuyoutLogViewModel — region tuple coverage', () => {
  it('declares ten canonical region ids', () => {
    expect(PCC_BL_REGION_IDS).toEqual([
      'command-center',
      'package-table',
      'budget-vs-commitment',
      'unbought-scope',
      'procore-reconciliation',
      'package-detail',
      'compliance-sdi-bond',
      'procurement-leadtime',
      'evidence-lineage',
      'audit-history',
    ]);
  });
});

describe('buildPccBuyoutLogViewModel — command center counts', () => {
  it('emits the recorded package, exception, and source-posture metrics', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    const cc = vm.commandCenter;
    expect(cc.totalPackageCount).toBe(SAMPLE_BUYOUT_LOG_READ_MODEL.packages.length);
    expect(cc.blockedPackageCount).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.packages.filter((p) => p.status === 'blocked').length,
    );
    expect(cc.completePackageCount).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.packages.filter((p) => p.status === 'complete').length,
    );
    expect(cc.activePackageCount).toBeGreaterThan(0);
    const critical = SAMPLE_BUYOUT_LOG_READ_MODEL.priorityActionCandidates.filter(
      (c) => c.severity === 'critical',
    ).length;
    const attention = SAMPLE_BUYOUT_LOG_READ_MODEL.priorityActionCandidates.filter(
      (c) => c.severity === 'attention',
    ).length;
    expect(cc.criticalExceptionCount).toBe(critical);
    expect(cc.attentionExceptionCount).toBe(attention);
    expect(cc.sourcePosture.sourceStatus).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.sourcePosture.sourceStatus,
    );
    expect(cc.sourcePosture.pendingHumanReviewCount).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.sourcePosture.pendingHumanReviewCount,
    );
  });

  it('command-center boundary caption is reference-only / no-determination', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.commandCenter.boundaryCaption.toLowerCase()).toMatch(
      /reference-only|no legal determination/,
    );
  });
});

describe('buildPccBuyoutLogViewModel — package table source lineage labels', () => {
  it('surfaces PCC-manual, Procore-imported, and workbook-template source-system labels', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    const sourceSystems = vm.packageTable.rows.map((r) => r.sourceLineageDisplay.sourceSystem);
    expect(sourceSystems).toContain('pcc');
    expect(sourceSystems).toContain('procore');
    expect(sourceSystems).toContain('workbook-template');
    const labels = vm.packageTable.rows.map((r) => r.sourceLineageDisplay.sourceSystemLabel);
    expect(labels).toContain('PCC (manual)');
    expect(labels).toContain('Procore (imported)');
    expect(labels).toContain('Workbook template');
  });

  it('emits one row per recorded package', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.packageTable.totalCount).toBe(SAMPLE_BUYOUT_LOG_READ_MODEL.packages.length);
  });
});

describe('buildPccBuyoutLogViewModel — pill tones limited to existing PccStatusPill set', () => {
  it('package-table status, compliance status, milestone status, and risk tones are all in the existing PccStatusPill set', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    const allowed = new Set<string>(PCC_STATUS_PILL_TONES);
    for (const row of vm.packageTable.rows) {
      expect(allowed.has(row.statusToneKey)).toBe(true);
    }
    for (const group of vm.compliance.groups) {
      for (const row of group.rows) {
        expect(allowed.has(row.statusToneKey)).toBe(true);
      }
    }
    for (const group of vm.procurementLeadTime.groups) {
      for (const row of group.rows) {
        expect(allowed.has(row.statusToneKey)).toBe(true);
        expect(allowed.has(row.riskToneKey)).toBe(true);
      }
    }
  });
});

describe('buildPccBuyoutLogViewModel — package detail HBI eligibility', () => {
  it('every detail entry exposes a future-gated, citation-required HBI eligibility notice', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.packageDetail.entries.size).toBe(SAMPLE_BUYOUT_LOG_READ_MODEL.packages.length);
    for (const entry of vm.packageDetail.entries.values()) {
      expect(entry.hbiEligibilityNotice.headlineCaption.toLowerCase()).toContain('future-gated');
      expect(entry.hbiEligibilityNotice.citationCaption.toLowerCase()).toContain(
        'eligibility is recorded for future grounded-answer surfaces',
      );
    }
  });

  it('detail entry boundary caption is reference-only', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    const first = vm.packageDetail.entries.get(vm.packageDetail.defaultEntryId ?? '');
    expect(first).toBeDefined();
    expect(first!.boundaryCaption.toLowerCase()).toContain('reference-only');
  });
});

describe('buildPccBuyoutLogViewModel — evidence lineage and HBI summary', () => {
  it('reflects fixture HBI eligibility marker counts and surfaces future-gated caption', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    const eligible = SAMPLE_BUYOUT_LOG_READ_MODEL.hbiEligibilityMarkers.filter(
      (m) => m.eligible,
    ).length;
    const ineligible = SAMPLE_BUYOUT_LOG_READ_MODEL.hbiEligibilityMarkers.length - eligible;
    expect(vm.evidenceLineage.hbiEligibilitySummary.eligibleCount).toBe(eligible);
    expect(vm.evidenceLineage.hbiEligibilitySummary.ineligibleCount).toBe(ineligible);
    expect(vm.evidenceLineage.hbiEligibilitySummary.headlineCaption.toLowerCase()).toContain(
      'future-gated',
    );
  });

  it('evidence boundary caption flags reference-only posture', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.evidenceLineage.boundaryCaption.toLowerCase()).toMatch(/reference|document control/);
  });
});

describe('buildPccBuyoutLogViewModel — audit history reference posture', () => {
  it('project-memory and traceability captions describe reference-only posture', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.auditHistory.projectMemoryCaption.toLowerCase()).toContain('reference-only');
    expect(vm.auditHistory.traceabilityCaption.toLowerCase()).toContain('reference-only');
  });

  it('emits one audit-event row per recorded fixture event', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.auditHistory.auditEvents.length).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.auditEvents.length,
    );
    expect(vm.auditHistory.projectMemoryContributions.length).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.projectMemoryContributions.length,
    );
    expect(vm.auditHistory.traceabilityEdges.length).toBe(
      SAMPLE_BUYOUT_LOG_READ_MODEL.traceabilityEdgeContributions.length,
    );
  });
});

describe('buildPccBuyoutLogViewModel — unbought scope queue', () => {
  it('only flagged scope lines (partial / uncovered) appear in the queue', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    for (const row of vm.unboughtScopeQueue.rows) {
      expect(row.scopeStatus === 'partial' || row.scopeStatus === 'uncovered').toBe(true);
    }
    const expectedFlagged = SAMPLE_BUYOUT_LOG_READ_MODEL.scopeLines.filter(
      (s) => s.scopeStatus === 'partial' || s.scopeStatus === 'uncovered',
    ).length;
    expect(vm.unboughtScopeQueue.rows.length).toBe(expectedFlagged);
  });
});

describe('buildPccBuyoutLogViewModel — Procore reconciliation reference-only', () => {
  it('reconciliation boundary caption forbids Procore writeback / mutation', () => {
    const vm = ready(buildPccBuyoutLogViewModel(envelope('available')));
    expect(vm.procoreReconciliation.boundaryCaption.toLowerCase()).toMatch(
      /no procore call|no.*writeback|no.*mutation/,
    );
  });
});

describe('PccStatusPill primitive remains the only pill rendering primitive', () => {
  it('PccStatusPill exports the canonical five tones used by the buyout-log view-model', () => {
    expect(typeof PccStatusPill).toBe('function');
    expect(PCC_STATUS_PILL_TONES).toEqual(['info', 'success', 'warning', 'danger', 'neutral']);
  });
});
