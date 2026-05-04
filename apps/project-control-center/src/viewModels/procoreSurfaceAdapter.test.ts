/**
 * Wave 13 Prompt 13E — Procore surface adapter tests.
 *
 * Pure adapter tests: each of the seven canonical degraded-state IDs,
 * fail-closed behavior for unknown projects / unavailable envelopes,
 * discriminated-union state narrowing for the project mapping, and
 * vocabulary sourced from `@hbc/models/pcc` (no duplicated literals).
 */

import { describe, expect, it } from 'vitest';
import {
  PCC_PROCORE_PROJECT_MAPPING_STATES,
  PCC_PROCORE_SOURCE_STATES,
  PCC_PROCORE_SYNC_STATES,
  SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  SAMPLE_PROJECT_PROFILE,
} from '@hbc/models/pcc';
import type {
  PccProcoreProjectMappingReadModel,
  PccProcoreSyncHealthEntry,
  PccProcoreSyncHealthReadModel,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import {
  PROCORE_DEGRADED_STATE_IDS,
  buildPccProcoreSurfaceViewModel,
  buildProcorePriorityActionsForRail,
  type PccProcoreDegradedStateId,
} from './procoreSurfaceAdapter.js';

const PROJECT_ID = SAMPLE_PROJECT_PROFILE.projectId;
const UNKNOWN_PROJECT_ID = 'unknown-project-zzz' as PccProjectId;
const GENERATED_AT = '2026-04-30T00:00:00.000Z';

function mappingEnvelope(
  status: PccReadModelSourceStatus,
  data: PccProcoreProjectMappingReadModel = SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
): PccReadModelEnvelope<PccProcoreProjectMappingReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus: status,
    readOnly: true,
    warnings: [],
    generatedAtUtc: GENERATED_AT,
    data,
  };
}

function syncEnvelope(
  status: PccReadModelSourceStatus,
  data: PccProcoreSyncHealthReadModel = SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
): PccReadModelEnvelope<PccProcoreSyncHealthReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus: status,
    readOnly: true,
    warnings: [],
    generatedAtUtc: GENERATED_AT,
    data,
  };
}

function syncEnvelopeWithEntries(
  entries: readonly PccProcoreSyncHealthEntry[],
): PccReadModelEnvelope<PccProcoreSyncHealthReadModel> {
  return syncEnvelope('available', {
    ...SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
    syncHealthEntries: entries,
    derivedSignals: [],
  });
}

const HEALTHY_ENTRY: PccProcoreSyncHealthEntry = {
  subjectArea: 'projects',
  syncState: 'synced-fresh',
  sourceState: 'available',
  freshnessBand: 'fresh',
  openObjectCount: 0,
  derivedSignalCount: 0,
  errors: [],
};

function makeEntry(
  subjectArea: PccProcoreSyncHealthEntry['subjectArea'],
  sourceState: PccProcoreSyncHealthEntry['sourceState'],
  syncState: PccProcoreSyncHealthEntry['syncState'] = 'sync-degraded',
): PccProcoreSyncHealthEntry {
  return {
    subjectArea,
    syncState,
    sourceState,
    freshnessBand: 'unknown',
    openObjectCount: 0,
    derivedSignalCount: 0,
    errors: [],
  };
}

describe('buildPccProcoreSurfaceViewModel — canonical degraded-state IDs', () => {
  it('exports exactly the seven canonical IDs called for by Prompt 13E', () => {
    expect([...PROCORE_DEGRADED_STATE_IDS]).toEqual([
      'unmapped',
      'stale',
      'permission-denied',
      'tool-disabled',
      'rate-limited',
      'partial-sync',
      'backend-unavailable',
    ]);
  });

  it("envelope=backend-unavailable maps to 'backend-unavailable'", () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('backend-unavailable'),
      syncHealth: syncEnvelope('backend-unavailable'),
    });
    expect(vm.degradedStateId).toBe('backend-unavailable');
    expect(vm.cardState).toBe('error');
  });

  it("envelope=unauthorized maps to 'permission-denied'", () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('unauthorized'),
      syncHealth: syncEnvelope('unauthorized'),
    });
    expect(vm.degradedStateId).toBe('permission-denied');
  });

  it("subject-area sourceState='permission-denied' maps to 'permission-denied'", () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([HEALTHY_ENTRY, makeEntry('rfis', 'permission-denied')]),
    });
    expect(vm.degradedStateId).toBe('permission-denied');
  });

  it("subject-area sourceState='tool-disabled' maps to 'tool-disabled'", () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([
        HEALTHY_ENTRY,
        makeEntry('observations', 'tool-disabled'),
      ]),
    });
    expect(vm.degradedStateId).toBe('tool-disabled');
  });

  it("subject-area sourceState='rate-limited' maps to 'rate-limited'", () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([HEALTHY_ENTRY, makeEntry('submittals', 'rate-limited')]),
    });
    expect(vm.degradedStateId).toBe('rate-limited');
  });

  it("unknown project mapping maps to 'unmapped'", () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: UNKNOWN_PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([HEALTHY_ENTRY]),
    });
    expect(vm.degradedStateId).toBe('unmapped');
    expect(vm.mappingSummary.state).toBe('unmapped');
  });

  it("known mapping with sync entry sourceState='stale' maps to 'stale'", () => {
    // Direct stale-only test: pin to an existing fixture mapping so
    // project-mapping precedence (unmapped) does not pre-empt the stale
    // classification; the sync entry is the only degraded source.
    const knownMappingProjectId =
      SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.mappings[0]!.pccProjectId;
    const staleVm = buildPccProcoreSurfaceViewModel({
      projectId: knownMappingProjectId,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([HEALTHY_ENTRY, makeEntry('drawings', 'stale')]),
    });
    expect(staleVm.degradedStateId).toBe('stale');
  });

  it("mixed degraded + available entries with healthy mapping maps to 'partial-sync'", () => {
    const knownMappingProjectId =
      SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.mappings.find(
        (m) => m.state === 'mapping-confirmed',
      )?.pccProjectId ?? SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.mappings[0]!.pccProjectId;
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: knownMappingProjectId,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([
        HEALTHY_ENTRY,
        makeEntry('rfis', 'available', 'sync-degraded'),
      ]),
    });
    // 'partial-sync' fires when sync-degraded is present without higher-priority degraded states
    expect(vm.degradedStateId).toBe('partial-sync');
  });

  it('healthy mapping + all-available entries returns degradedStateId=null and pillTone=success', () => {
    const knownMappingProjectId =
      SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.mappings.find(
        (m) => m.state === 'mapping-confirmed',
      )?.pccProjectId ?? SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.mappings[0]!.pccProjectId;
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: knownMappingProjectId,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([HEALTHY_ENTRY]),
    });
    expect(vm.degradedStateId).toBeNull();
    expect(vm.pillTone).toBe('success');
  });
});

describe('buildPccProcoreSurfaceViewModel — fail-closed semantics', () => {
  it('drops project-bound outputs when mapping envelope is source-unavailable', () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('source-unavailable'),
      syncHealth: syncEnvelope('available'),
    });
    expect(vm.mappingSummary.state).toBe('unmapped');
    expect(vm.subjectAreaEntries.length).toBeGreaterThan(0);
    // mapping-bound outputs are empty; sync still flows through
    expect(vm.mappingSummary.procoreCompanyId).toBeUndefined();
    expect(vm.mappingSummary.procoreProjectId).toBeUndefined();
  });

  it('drops project-bound outputs when sync envelope is backend-unavailable', () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelope('backend-unavailable'),
    });
    expect(vm.subjectAreaEntries).toEqual([]);
    expect(vm.priorityActionCandidates).toEqual([]);
    expect(vm.readinessImpactSignals).toEqual([]);
    expect(vm.topCuratedSummary).toBeUndefined();
  });

  it('redacts errors via redactProcoreSyncErrorMessage', () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelopeWithEntries([
        {
          ...HEALTHY_ENTRY,
          subjectArea: 'rfis',
          sourceState: 'permission-denied',
          syncState: 'sync-failed',
          errors: ['Bearer abc.def.ghi failed at https://example.com/path'],
        },
      ]),
    });
    const entry = vm.subjectAreaEntries.find((e) => e.subjectArea === 'rfis')!;
    expect(entry.redactedErrors[0]).not.toContain('abc.def.ghi');
    expect(entry.redactedErrors[0]).toContain('[redacted-token]');
    expect(entry.redactedErrors[0]).toContain('[redacted-url]');
  });
});

describe('buildPccProcoreSurfaceViewModel — vocabulary sourced from @hbc/models', () => {
  it('every mappingSummary.state is a member of PCC_PROCORE_PROJECT_MAPPING_STATES or "unmapped"', () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelope('available'),
    });
    const allowed: readonly string[] = ['unmapped', ...PCC_PROCORE_PROJECT_MAPPING_STATES];
    expect(allowed).toContain(vm.mappingSummary.state);
  });

  it('every subjectAreaEntries[].sourceState is a member of PCC_PROCORE_SOURCE_STATES', () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelope('available'),
    });
    for (const entry of vm.subjectAreaEntries) {
      expect(PCC_PROCORE_SOURCE_STATES).toContain(entry.sourceState);
    }
  });

  it('every subjectAreaEntries[].syncState is a member of PCC_PROCORE_SYNC_STATES', () => {
    const vm = buildPccProcoreSurfaceViewModel({
      projectId: PROJECT_ID,
      mapping: mappingEnvelope('available'),
      syncHealth: syncEnvelope('available'),
    });
    for (const entry of vm.subjectAreaEntries) {
      expect(PCC_PROCORE_SYNC_STATES).toContain(entry.syncState);
    }
  });

  it('pillTone is always one of the five allowed PccStatusPill tones', () => {
    const allowedTones: readonly string[] = ['info', 'success', 'warning', 'danger', 'neutral'];
    for (const status of [
      'available',
      'backend-unavailable',
      'source-unavailable',
      'unauthorized',
      'forbidden',
      'stale',
      'missing-config',
    ] as const) {
      const vm = buildPccProcoreSurfaceViewModel({
        projectId: PROJECT_ID,
        mapping: mappingEnvelope(status),
        syncHealth: syncEnvelope(status),
      });
      expect(allowedTones).toContain(vm.pillTone);
    }
  });
});

describe('buildProcorePriorityActionsForRail', () => {
  it("emits IPriorityAction items with category='procore-sync' for every actionable priority-action signal", () => {
    const items = buildProcorePriorityActionsForRail(
      SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.derivedSignals,
    );
    for (const item of items) {
      expect(item.category).toBe('procore-sync');
      expect(typeof item.id).toBe('string');
      expect(typeof item.title).toBe('string');
    }
  });

  it('never invents IPriorityAction record fields (only id/category/title/severity emitted)', () => {
    const items = buildProcorePriorityActionsForRail(
      SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.derivedSignals,
    );
    for (const item of items) {
      expect(item.dueDate).toBeUndefined();
      expect(item.assigneePersona).toBeUndefined();
      expect(item.relatedWorkCenter).toBeUndefined();
      expect(item.relatedWorkflowItemId).toBeUndefined();
    }
  });

  it('drops info-severity signals (only attention/critical with non-empty Procore IDs flow through)', () => {
    const items = buildProcorePriorityActionsForRail(
      SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.derivedSignals,
    );
    // every emitted item must have severity not 'Info' (info → IPriorityAction.severity='Info')
    for (const item of items) {
      expect(['Warning', 'Repair Required']).toContain(item.severity);
    }
  });
});

describe('buildPccProcoreSurfaceViewModel — degraded state ID type', () => {
  it('exposes the canonical type via the exported ID list', () => {
    // Compile-time ensure the literal-union maps to PROCORE_DEGRADED_STATE_IDS
    const id: PccProcoreDegradedStateId = 'unmapped';
    expect(PROCORE_DEGRADED_STATE_IDS).toContain(id);
  });
});
