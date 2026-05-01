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

  it('marks Wave 11 RACI (responsibility-matrix) as preview-deferred', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const wave11 = vm.downstreamModules.find(
      (m) => m.sourceModuleId === 'responsibility-matrix',
    );
    expect(wave11).toBeDefined();
    expect(wave11!.waveStatus).toBe('preview-deferred');
    expect(wave11!.waveLabel).toBe('Wave 11');
    expect(wave11!.sourceModuleLabel).toContain('RACI');
  });

  it('marks Wave 10, 12, 13, 14 downstream modules as preview-deferred', () => {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const deferredIds = ['permit-log', 'constraints-log', 'buyout-log', 'approvals-checkpoints'] as const;
    for (const id of deferredIds) {
      const entry = vm.downstreamModules.find((m) => m.sourceModuleId === id);
      expect(entry, `expected ${id} entry`).toBeDefined();
      expect(entry!.waveStatus).toBe('preview-deferred');
    }
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

  it('still preserves downstream module Wave 9 and Wave 11 RACI as preview-deferred under degraded sources', () => {
    const vm = buildPccProjectReadinessViewModel(envelope('source-unavailable'));
    if (vm.status !== 'preview') throw new Error('expected preview');
    const wave9 = vm.downstreamModules.find(
      (m) => m.sourceModuleId === 'project-lifecycle-readiness',
    );
    const wave11 = vm.downstreamModules.find(
      (m) => m.sourceModuleId === 'responsibility-matrix',
    );
    expect(wave9?.waveStatus).toBe('preview-deferred');
    expect(wave11?.waveStatus).toBe('preview-deferred');
  });
});
