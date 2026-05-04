import { describe, expect, it } from 'vitest';
import {
  PROJECT_READINESS_DOMAINS,
  PROJECT_READINESS_LIFECYCLE_GATES,
  PROJECT_READINESS_SOURCE_MODULES,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
} from '@hbc/models/pcc';
import type {
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccProjectReadinessFrameworkReadModel,
} from '@hbc/models/pcc';
import { buildPccProjectReadinessViewModel } from './projectReadinessAdapter.js';

const PROJECT_ID = 'fixture-pcc-project-001' as PccProjectId;

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccProjectReadinessFrameworkReadModel = SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
): PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

describe('buildPccProjectReadinessViewModel — available envelope', () => {
  const vm = buildPccProjectReadinessViewModel(envelope('available'));

  it('returns a preview view model', () => {
    expect(vm.status).toBe('preview');
  });

  it('exposes all 10 lifecycle gates with one marked active', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.lifecycleGates).toHaveLength(PROJECT_READINESS_LIFECYCLE_GATES.length);
    expect(vm.lifecycleGates.filter((g) => g.isActive)).toHaveLength(1);
  });

  it('exposes all 14 readiness domains', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.domains).toHaveLength(PROJECT_READINESS_DOMAINS.length);
  });

  it('captures escalated blocker fixture-pcc-readiness-003 in the blocker list', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const ids = vm.blockers.map((b) => b.id);
    expect(ids).toContain('fixture-pcc-readiness-003');
  });

  it('exposes evidence buckets and source-health entries derived from the snapshot', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.evidence.evidenceBuckets.length).toBeGreaterThan(0);
    expect(vm.evidence.sourceHealthEntries.length).toBeGreaterThan(0);
    const docControl = vm.evidence.sourceHealthEntries.find(
      (e) => e.sourceModuleId === 'document-control',
    );
    expect(docControl).toBeDefined();
  });

  it('lists every framework source module in downstream modules', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.downstreamModules).toHaveLength(PROJECT_READINESS_SOURCE_MODULES.length);
  });

  it('marks Wave 9 (project-lifecycle-readiness) as preview-deferred', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const wave9 = vm.downstreamModules.find(
      (m) => m.sourceModuleId === 'project-lifecycle-readiness',
    );
    expect(wave9).toBeDefined();
    expect(wave9!.waveStatus).toBe('preview-deferred');
    expect(wave9!.waveLabel).toBe('Wave 9');
  });

  it('marks Wave 11 RACI (responsibility-matrix) as implemented', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const wave11 = vm.downstreamModules.find((m) => m.sourceModuleId === 'responsibility-matrix');
    expect(wave11).toBeDefined();
    expect(wave11!.waveStatus).toBe('implemented');
    expect(wave11!.waveLabel).toBe('Wave 11');
    expect(wave11!.sourceModuleLabel).toContain('RACI');
  });

  it('marks Wave 12 / Wave 14 downstream modules as preview-deferred', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const deferredIds = ['constraints-log', 'approvals-checkpoints'] as const;
    for (const id of deferredIds) {
      const entry = vm.downstreamModules.find((m) => m.sourceModuleId === id);
      expect(entry, `expected ${id} entry`).toBeDefined();
      expect(entry!.waveStatus).toBe('preview-deferred');
    }
  });

  it('marks Wave 13 (buyout-log) as implemented with the Buyout Control Center status caption', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const entry = vm.downstreamModules.find((m) => m.sourceModuleId === 'buyout-log');
    expect(entry).toBeDefined();
    expect(entry!.waveStatus).toBe('implemented');
    expect(entry!.waveLabel).toBe('Wave 13');
    expect(entry!.sourceModuleLabel).toBe('Buyout Log');
  });

  it('marks Wave 10 (permit-log) as implemented with the Permit & Inspection Control Center label', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const entry = vm.downstreamModules.find((m) => m.sourceModuleId === 'permit-log');
    expect(entry).toBeDefined();
    expect(entry!.waveStatus).toBe('implemented');
    expect(entry!.waveLabel).toBe('Wave 10');
    expect(entry!.sourceModuleLabel).toBe('Permit & Inspection Control Center');
  });

  it('hero exposes read-only badge and no-execution caption', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.hero.readOnlyBadgeText).toBe('Read-only readiness framework preview');
    expect(vm.hero.noExecutionCaption).toBe('No workflow execution is enabled in Wave 8.');
  });

  it('passes sourceStatus through and maps to a card state', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.sourceStatus).toBe('available');
    expect(vm.cardState).toBe('preview');
  });
});

describe('buildPccProjectReadinessViewModel — degraded envelopes', () => {
  it('returns safe-empty arrays for source-unavailable envelope', () => {
    const vm = buildPccProjectReadinessViewModel(envelope('source-unavailable'));
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.lifecycleGates).toHaveLength(PROJECT_READINESS_LIFECYCLE_GATES.length);
    expect(vm.domains).toHaveLength(PROJECT_READINESS_DOMAINS.length);
    expect(vm.blockers).toHaveLength(0);
    expect(vm.evidence.evidenceBuckets).toHaveLength(0);
    expect(vm.evidence.sourceHealthEntries).toHaveLength(0);
    expect(vm.downstreamModules).toHaveLength(PROJECT_READINESS_SOURCE_MODULES.length);
    expect(vm.sourceStatus).toBe('source-unavailable');
  });

  it('returns safe-empty arrays for backend-unavailable envelope', () => {
    const vm = buildPccProjectReadinessViewModel(envelope('backend-unavailable'));
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.blockers).toHaveLength(0);
    expect(vm.evidence.evidenceBuckets).toHaveLength(0);
    expect(vm.sourceStatus).toBe('backend-unavailable');
    expect(vm.cardState).toBe('error');
  });

  it('preserves Wave 9 as preview-deferred and Wave 11 RACI as implemented under degraded sources', () => {
    const vm = buildPccProjectReadinessViewModel(envelope('source-unavailable'));
    if (vm.status !== 'preview') throw new Error('expected preview');
    const wave9 = vm.downstreamModules.find(
      (m) => m.sourceModuleId === 'project-lifecycle-readiness',
    );
    const wave11 = vm.downstreamModules.find((m) => m.sourceModuleId === 'responsibility-matrix');
    expect(wave9?.waveStatus).toBe('preview-deferred');
    expect(wave11?.waveStatus).toBe('implemented');
  });

  it('returns safe-empty ownership and priority-actions-preview slots under degraded source', () => {
    const vm = buildPccProjectReadinessViewModel(envelope('source-unavailable'));
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.ownershipAccountability.entries).toHaveLength(0);
    expect(vm.ownershipAccountability.totalUnassignedCount).toBe(0);
    expect(vm.ownershipAccountability.summaryCaption.length).toBeGreaterThan(0);
    expect(vm.priorityActionsPreview.items).toHaveLength(0);
    expect(vm.priorityActionsPreview.inertActionLabel).toContain('Preview only');
  });
});

describe('buildPccProjectReadinessViewModel — ownership and accountability', () => {
  const vm = buildPccProjectReadinessViewModel(envelope('available'));

  it('groups items by ownerPersona', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const personas = vm.ownershipAccountability.entries.map((e) => e.ownerPersona).sort();
    expect(personas).toEqual(
      [
        'project-coordinator',
        'project-executive',
        'project-manager',
        'safety-qaqc',
        'superintendent',
      ].sort(),
    );
  });

  it('reports total unassigned count of 4 (items 002, 004, 005, 006)', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.ownershipAccountability.totalUnassignedCount).toBe(4);
  });

  it('flags safety-qaqc owner with item 004 as unassigned', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const safety = vm.ownershipAccountability.entries.find((e) => e.ownerPersona === 'safety-qaqc');
    expect(safety).toBeDefined();
    expect(safety!.unassignedItemIds).toContain('fixture-pcc-readiness-004');
  });

  it('flags project-manager item 006 as unassigned alongside assigned items 001 and 003', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const pm = vm.ownershipAccountability.entries.find((e) => e.ownerPersona === 'project-manager');
    expect(pm).toBeDefined();
    expect([...pm!.assignedItemIds].sort()).toEqual(
      [
        'fixture-pcc-readiness-001',
        'fixture-pcc-readiness-003',
        'fixture-pcc-readiness-006',
      ].sort(),
    );
    expect(pm!.unassignedItemIds).toContain('fixture-pcc-readiness-006');
  });

  it('surfaces escalation personas from item 003 escalationPath on the project-manager entry', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const pm = vm.ownershipAccountability.entries.find((e) => e.ownerPersona === 'project-manager');
    expect(pm).toBeDefined();
    expect(pm!.escalationPersonas).toContain('project-executive');
    expect(pm!.escalationPersonas).toContain('manager-of-operational-excellence');
  });
});

describe('buildPccProjectReadinessViewModel — priority-actions preview', () => {
  const vm = buildPccProjectReadinessViewModel(envelope('available'));

  it('lists exactly the readiness items carrying relatedPriorityActionId', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.priorityActionsPreview.items).toHaveLength(1);
    const entry = vm.priorityActionsPreview.items[0];
    expect(entry.itemId).toBe('fixture-pcc-readiness-003');
    expect(entry.relatedPriorityActionId).toBe('priority-action-permit-001');
  });

  it('exposes an inert action label and an explanatory preview caption', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    expect(vm.priorityActionsPreview.inertActionLabel).toContain('Preview only');
    expect(vm.priorityActionsPreview.previewCaption.length).toBeGreaterThan(0);
  });
});

describe('buildPccProjectReadinessViewModel — risk tags', () => {
  const vm = buildPccProjectReadinessViewModel(envelope('available'));

  function blockerRiskTagFor(id: string): string | undefined {
    if (vm.status !== 'preview') throw new Error('expected preview');
    return vm.blockers.find((b) => b.id === id)?.riskTag;
  }

  it('tags item 003 (escalated) as open-blocker', () => {
    expect(blockerRiskTagFor('fixture-pcc-readiness-003')).toBe('open-blocker');
  });

  it('tags item 002 (open) as open-blocker', () => {
    expect(blockerRiskTagFor('fixture-pcc-readiness-002')).toBe('open-blocker');
  });

  it('tags item 001 (at-risk posture, blockerState none) as at-risk-warning', () => {
    expect(blockerRiskTagFor('fixture-pcc-readiness-001')).toBe('at-risk-warning');
  });

  it('tags item 004 (at-risk posture, blockerState mitigated) as at-risk-warning', () => {
    expect(blockerRiskTagFor('fixture-pcc-readiness-004')).toBe('at-risk-warning');
  });
});
