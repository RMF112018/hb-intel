import { describe, expect, it } from 'vitest';
import {
  CHECKPOINT_SOURCE_MODULES,
  EMPTY_APPROVALS_READ_MODEL,
  SAMPLE_APPROVALS_READ_MODEL,
  type PccApprovalsReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { buildPccApprovalsViewModel } from '../surfaces/approvals/approvalsAdapter';
import {
  PCC_APPROVALS_DISABLED_ACTION_KEYS,
  PCC_APPROVALS_LANE_IDS,
  type IPccApprovalsReadyViewModel,
} from '../surfaces/approvals/approvalsViewModel';

const PROJECT_ID = 'p-w14-approvals-adapter' as PccProjectId;

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccApprovalsReadModel> {
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

describe('buildPccApprovalsViewModel — sourceStatus → cardState mapping', () => {
  const cases: ReadonlyArray<readonly [PccReadModelSourceStatus, string]> = [
    ['available', 'preview'],
    ['source-unavailable', 'unavailable-fixture'],
    ['backend-unavailable', 'error'],
    ['missing-config', 'missing-config'],
    ['stale', 'preview'],
    ['unauthorized', 'unauthorized-persona'],
    ['forbidden', 'unauthorized-persona'],
  ];

  for (const [sourceStatus, expectedCardState] of cases) {
    it(`maps ${sourceStatus} → cardState=${expectedCardState} and passes sourceStatus through`, () => {
      const vm = buildPccApprovalsViewModel(envelope(sourceStatus));
      expect(vm.status).toBe('ready');
      expect(vm.cardState).toBe(expectedCardState);
      expect(vm.sourceStatus).toBe(sourceStatus);
    });
  }
});

describe('buildPccApprovalsViewModel — adapter is pure envelope-in', () => {
  it('does not produce loading or error discriminants for any sourceStatus', () => {
    for (const status of [
      'available',
      'source-unavailable',
      'backend-unavailable',
      'missing-config',
      'stale',
      'unauthorized',
      'forbidden',
    ] as const) {
      const vm = buildPccApprovalsViewModel(envelope(status));
      expect(vm.status).not.toBe('loading');
      expect(vm.status).not.toBe('error');
      expect(vm.status).toBe('ready');
    }
  });
});

describe('buildPccApprovalsViewModel — viewerPersona envelope echo passthrough', () => {
  it('passes viewerPersona through to the view-model when supplied', () => {
    const vm = buildPccApprovalsViewModel(
      envelope('available', SAMPLE_APPROVALS_READ_MODEL, 'project-executive'),
    );
    expect(vm.viewerPersona).toBe('project-executive');
  });

  it('leaves viewerPersona undefined when the envelope does not carry one', () => {
    const vm = buildPccApprovalsViewModel(envelope('available'));
    expect(vm.viewerPersona).toBeUndefined();
  });
});

describe('buildPccApprovalsViewModel — lane row counts mirror envelope.data', () => {
  function ready(
    sourceStatus: PccReadModelSourceStatus = 'available',
    data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
  ): IPccApprovalsReadyViewModel {
    return buildPccApprovalsViewModel(envelope(sourceStatus, data));
  }

  it('queue.rows length equals data.queue.entries length', () => {
    const vm = ready();
    expect(vm.queue.rows.length).toBe(SAMPLE_APPROVALS_READ_MODEL.queue.entries.length);
  });

  it('myApprovals.rows length equals data.myApprovals.entries length', () => {
    const vm = ready();
    expect(vm.myApprovals.rows.length).toBe(
      SAMPLE_APPROVALS_READ_MODEL.myApprovals.entries.length,
    );
  });

  it('myApprovals viewer fields mirror data', () => {
    const vm = ready();
    expect(vm.myApprovals.viewerPrincipalKey).toBe(
      SAMPLE_APPROVALS_READ_MODEL.myApprovals.viewerPrincipalKey,
    );
  });

  it('escalation.rows length equals data.escalation.entries length', () => {
    const vm = ready();
    expect(vm.escalation.rows.length).toBe(
      SAMPLE_APPROVALS_READ_MODEL.escalation.entries.length,
    );
  });

  it('adminVerification.rows length equals data.adminVerification.entries length', () => {
    const vm = ready();
    expect(vm.adminVerification.rows.length).toBe(
      SAMPLE_APPROVALS_READ_MODEL.adminVerification.entries.length,
    );
  });

  it('registry counts mirror data.registry definition + instance arrays', () => {
    const vm = ready();
    expect(vm.registry.definitionCount).toBe(
      SAMPLE_APPROVALS_READ_MODEL.registry.definitions.length,
    );
    expect(vm.registry.instanceCount).toBe(
      SAMPLE_APPROVALS_READ_MODEL.registry.checkpointInstances.length,
    );
    expect(vm.registry.definitionRows.length).toBe(vm.registry.definitionCount);
    expect(vm.registry.instanceRows.length).toBe(vm.registry.instanceCount);
  });

  it('policy counts mirror data.policy.policies + policy.versions', () => {
    const vm = ready();
    expect(vm.policy.policyCount).toBe(SAMPLE_APPROVALS_READ_MODEL.policy.policies.length);
    expect(vm.policy.versionCount).toBe(SAMPLE_APPROVALS_READ_MODEL.policy.versions.length);
    expect(vm.policy.rows.length).toBe(SAMPLE_APPROVALS_READ_MODEL.policy.policies.length);
  });

  it('home totals come straight from analytics — no synthesis', () => {
    const vm = ready();
    expect(vm.home.totalRequests).toBe(SAMPLE_APPROVALS_READ_MODEL.analytics.totalRequests);
    const stateEntryCount = Object.keys(SAMPLE_APPROVALS_READ_MODEL.analytics.countsByState).length;
    expect(vm.home.stateCounts.length).toBe(stateEntryCount);
    const modeEntryCount = Object.keys(SAMPLE_APPROVALS_READ_MODEL.analytics.countsByMode).length;
    expect(vm.home.modeCounts.length).toBe(modeEntryCount);
  });

  it('handles EMPTY_APPROVALS_READ_MODEL with all-zero counts and zero rows', () => {
    const vm = ready('available', EMPTY_APPROVALS_READ_MODEL);
    expect(vm.queue.rows).toHaveLength(0);
    expect(vm.myApprovals.rows).toHaveLength(0);
    expect(vm.escalation.rows).toHaveLength(0);
    expect(vm.adminVerification.rows).toHaveLength(0);
    expect(vm.registry.definitionCount).toBe(0);
    expect(vm.registry.instanceCount).toBe(0);
    expect(vm.policy.policyCount).toBe(0);
    expect(vm.policy.versionCount).toBe(0);
    expect(vm.home.totalRequests).toBe(0);
  });
});

describe('buildPccApprovalsViewModel — moduleIntegration ordering', () => {
  it('rows iterate CHECKPOINT_SOURCE_MODULES in canonical order with counts from analytics', () => {
    const vm = buildPccApprovalsViewModel(envelope('available'));
    const expectedOrder = [...CHECKPOINT_SOURCE_MODULES];
    expect(vm.moduleIntegration.rows.map((r) => r.sourceModule)).toEqual(expectedOrder);
    for (const row of vm.moduleIntegration.rows) {
      expect(row.count).toBe(
        SAMPLE_APPROVALS_READ_MODEL.analytics.countsBySourceModule[row.sourceModule],
      );
    }
  });

  it('lineageSeam reuses the same canonical-ordered source-module rows', () => {
    const vm = buildPccApprovalsViewModel(envelope('available'));
    expect(vm.lineageSeam.sourceModuleSummaryRows.map((r) => r.sourceModule)).toEqual([
      ...CHECKPOINT_SOURCE_MODULES,
    ]);
  });
});

describe('buildPccApprovalsViewModel — deferred-posture seams carry no row arrays', () => {
  it('decisionHistorySeam exposes only fixed copy and a deferred reason', () => {
    const vm = buildPccApprovalsViewModel(envelope('available'));
    const seam = vm.decisionHistorySeam;
    expect(seam.title).toContain('Decision history');
    expect(seam.description.length).toBeGreaterThan(0);
    expect(seam.deferredReason.length).toBeGreaterThan(0);
    expect(Object.keys(seam)).toEqual(['title', 'description', 'deferredReason']);
  });

  it('lineageSeam exposes counts and source-module rows but no link/reference rows', () => {
    const vm = buildPccApprovalsViewModel(envelope('available'));
    const seam = vm.lineageSeam;
    expect(seam.title).toContain('Source / evidence lineage');
    expect(seam.deferredReason.length).toBeGreaterThan(0);
    expect(seam.registryDefinitionCount).toBe(
      SAMPLE_APPROVALS_READ_MODEL.registry.definitions.length,
    );
    expect(seam.registryInstanceCount).toBe(
      SAMPLE_APPROVALS_READ_MODEL.registry.checkpointInstances.length,
    );
    // Only documented fields — no evidence-link rows, no source-reference rows.
    expect(Object.keys(seam).sort()).toEqual(
      [
        'title',
        'description',
        'deferredReason',
        'registryDefinitionCount',
        'registryInstanceCount',
        'sourceModuleSummaryRows',
      ].sort(),
    );
  });
});

describe('buildPccApprovalsViewModel — disabled actions catalog', () => {
  it('enumerates one entry per PCC_APPROVALS_DISABLED_ACTION_KEYS key with reason text', () => {
    const vm = buildPccApprovalsViewModel(envelope('available'));
    const keys = vm.disabledActions.map((a) => a.key);
    expect(keys).toEqual([...PCC_APPROVALS_DISABLED_ACTION_KEYS]);
    for (const action of vm.disabledActions) {
      expect(action.label.length).toBeGreaterThan(0);
      expect(action.reason.length).toBeGreaterThan(0);
    }
  });
});

describe('PCC_APPROVALS_LANE_IDS — canonical lane tuple', () => {
  it('exposes the eleven Wave 14 lane ids in canonical order', () => {
    expect([...PCC_APPROVALS_LANE_IDS]).toEqual([
      'home',
      'queue',
      'my-approvals',
      'registry',
      'escalation',
      'admin-verification',
      'policy',
      'module-integration',
      'decision-history',
      'lineage',
      'hbi-boundary',
    ]);
  });
});
