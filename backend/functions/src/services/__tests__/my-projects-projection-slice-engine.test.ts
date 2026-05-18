import { describe, expect, it } from 'vitest';

import {
  ProjectionSliceEngine,
  type IProjectionSliceEngineDeps,
} from '../my-projects-projection/engine/projection-slice-engine.js';
import type { IProjectionSourceFetchClient } from '../my-projects-projection/engine/projection-source-fetch-client.js';
import type {
  IMyProjectsRegistryExistingRow,
  IMyProjectsRegistryRowFields,
  IMyProjectsRegistryRowPatch,
} from '../my-projects-projection/registry/my-projects-registry-row-mapper.js';
import type { IMyProjectsRegistryRepository } from '../my-projects-projection/registry/my-projects-registry-repository.js';
import type {
  ILegacyRegistrySourceRow,
  IProjectSourceRow,
} from '../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';
import {
  computeProjectionContentHash,
  computeProjectionKey,
} from '../my-projects-projection/projection-content-hash.js';
import { reconcileProjectLinks } from '../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';

const NOW = '2026-05-18T12:00:00.000Z';

function makeNow(): () => string {
  return () => NOW;
}

interface IFakeRecorder {
  inserts: IMyProjectsRegistryRowFields[];
  patches: Array<{ listItemId: number; fields: IMyProjectsRegistryRowPatch }>;
  rowsById: Map<number, IMyProjectsRegistryExistingRow>;
}

function makeRecorder(seedRows: readonly IMyProjectsRegistryExistingRow[] = []): IFakeRecorder {
  const rowsById = new Map<number, IMyProjectsRegistryExistingRow>();
  for (const r of seedRows) rowsById.set(r.listItemId, r);
  return { inserts: [], patches: [], rowsById };
}

function makeRepository(recorder: IFakeRecorder): IMyProjectsRegistryRepository {
  let nextId = 1000;
  return {
    async findByProjectionKey(projectionKey) {
      for (const row of recorder.rowsById.values()) {
        if (row.projectionKey === projectionKey) return row;
      }
      return null;
    },
    async findByProjectsListItemId(id) {
      return [...recorder.rowsById.values()].filter((r) => r.projectsListItemId === id);
    },
    async findByLegacyRegistryItemId(id) {
      return [...recorder.rowsById.values()].filter((r) => r.legacyRegistryItemId === id);
    },
    async insertRow(fields) {
      recorder.inserts.push(fields);
      const id = ++nextId;
      recorder.rowsById.set(id, {
        listItemId: id,
        projectionKey: fields.ProjectionKey,
        userUpn: fields.UserUpn,
        isActive: fields.IsActive,
        projectionContentHash: fields.ProjectionContentHash,
        recordKey: fields.RecordKey,
        projectsListItemId: fields.ProjectsListItemId ?? null,
        legacyRegistryItemId: fields.LegacyRegistryItemId ?? null,
      });
      return { listItemId: id };
    },
    async patchRow(listItemId, fields) {
      recorder.patches.push({ listItemId, fields });
      const existing = recorder.rowsById.get(listItemId);
      if (existing) {
        recorder.rowsById.set(listItemId, {
          ...existing,
          isActive: fields.IsActive === undefined ? existing.isActive : fields.IsActive,
          projectionContentHash:
            typeof fields.ProjectionContentHash === 'string'
              ? fields.ProjectionContentHash
              : existing.projectionContentHash,
        });
      }
    },
  };
}

interface IFakeSourceState {
  projects: Map<number, IProjectSourceRow>;
  registry: Map<number, ILegacyRegistrySourceRow>;
}

function makeSourceState(): IFakeSourceState {
  return { projects: new Map(), registry: new Map() };
}

function makeSourceClient(state: IFakeSourceState): IProjectionSourceFetchClient {
  return {
    async fetchProjectsRow(id) {
      return state.projects.get(id) ?? null;
    },
    async fetchRegistryRow(id) {
      return state.registry.get(id) ?? null;
    },
    async findRegistryRowsByMatchedProjectId(id) {
      return [...state.registry.values()].filter((r) => r.matchedProjectListItemId === id);
    },
    async findRegistryRowsByNumberYear(projectNumber, year) {
      return [...state.registry.values()].filter(
        (r) => r.projectNumber === projectNumber && r.legacyYear === year,
      );
    },
    async findProjectsRowsByNumberYear(projectNumber, year) {
      return [...state.projects.values()].filter(
        (p) => p.projectNumber === projectNumber && p.year === year,
      );
    },
    async listAllProjectsRows() {
      return [...state.projects.values()];
    },
    async listAllRegistryRows() {
      return [...state.registry.values()];
    },
  };
}

function makeProjectsRow(overrides: Partial<IProjectSourceRow> = {}): IProjectSourceRow {
  return {
    id: 101,
    projectNumber: '24-101',
    projectName: 'Riverwalk Tower',
    year: 2024,
    projectStage: 'Construction',
    siteUrl: 'https://contoso.example/sites/riverwalk',
    procoreProject: 'riverwalk',
    buildingConnectedUrl: undefined,
    documentCrunchUrl: undefined,
    roleArrays: {
      leadEstimatorUpns: ['lead@hb.example.com'],
      projectManagerUpns: ['pm@hb.example.com'],
    },
    legacyRoleFallbacks: {},
    ...overrides,
  };
}

function makeRegistryRow(
  overrides: Partial<ILegacyRegistrySourceRow> = {},
): ILegacyRegistrySourceRow {
  return {
    id: 9,
    projectNumber: '24-101',
    projectNameRaw: 'Riverwalk Tower (Legacy)',
    legacyYear: 2024,
    isActive: true,
    folderWebUrl: 'https://contoso.example/sites/legacy/Riverwalk',
    matchStatus: 'matched',
    matchConfidence: 'high',
    matchMethod: 'explicit',
    matchedProjectListItemId: 101,
    procoreProject: undefined,
    projectStage: undefined,
    buildingConnectedUrl: undefined,
    documentCrunchUrl: undefined,
    roleArrays: {
      leadEstimatorUpns: ['lead@hb.example.com'],
    },
    ...overrides,
  };
}

function buildEngine(args: { state: IFakeSourceState; recorder: IFakeRecorder }): {
  engine: ProjectionSliceEngine;
  deps: IProjectionSliceEngineDeps;
} {
  const deps: IProjectionSliceEngineDeps = {
    sourceFetchClient: makeSourceClient(args.state),
    registryRepository: makeRepository(args.recorder),
    now: makeNow(),
  };
  return { engine: new ProjectionSliceEngine(deps), deps };
}

const REQUEST_BASE = {
  projectionBatchId: 'batch-1',
  correlationId: 'corr-1',
} as const;

describe('ProjectionSliceEngine — Projects changed', () => {
  it('inserts a projects-only row when a Projects item has Projects-side role assignment and no Registry counterpart', async () => {
    const state = makeSourceState();
    state.projects.set(101, makeProjectsRow());
    const recorder = makeRecorder();
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.counts.helperRowsInserted).toEqual(2); // lead + pm
    expect(outcome.counts.helperRowsUpdated).toEqual(0);
    expect(outcome.counts.helperRowsDeactivated).toEqual(0);
    expect(recorder.inserts).toHaveLength(2);
    const sources = new Set(recorder.inserts.map((f) => f.ProjectionSource));
    expect(sources).toEqual(new Set(['projects-only']));
    const upns = new Set(recorder.inserts.map((f) => f.UserUpn));
    expect(upns).toEqual(new Set(['lead@hb.example.com', 'pm@hb.example.com']));
  });

  it('inserts merged rows when a Registry counterpart matches by MatchedProjectListItemId', async () => {
    const state = makeSourceState();
    state.projects.set(101, makeProjectsRow());
    state.registry.set(9, makeRegistryRow());
    const recorder = makeRecorder();
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    expect(recorder.inserts).toHaveLength(2);
    for (const insert of recorder.inserts) {
      expect(insert.ProjectionSource).toEqual('merged');
      expect(insert.ProjectsListItemId).toEqual(101);
      expect(insert.LegacyRegistryItemId).toEqual(9);
    }
  });

  it('soft-deactivates a prior helper row when the corresponding user is no longer in the assignment set', async () => {
    const state = makeSourceState();
    state.projects.set(
      101,
      makeProjectsRow({ roleArrays: { leadEstimatorUpns: ['lead@hb.example.com'] } }),
    );
    // Prior active row for a user no longer assigned (pm@hb.example.com).
    const removedKey = computeProjectionKey('pm@hb.example.com', 'projects:101');
    const recorder = makeRecorder([
      {
        listItemId: 555,
        projectionKey: removedKey,
        userUpn: 'pm@hb.example.com',
        isActive: true,
        projectionContentHash: 'old-hash',
        recordKey: 'projects:101',
        projectsListItemId: 101,
        legacyRegistryItemId: null,
      },
    ]);
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.counts.helperRowsInserted).toEqual(1);
    expect(outcome.counts.helperRowsDeactivated).toEqual(1);
    const dpatch = recorder.patches.find((p) => p.listItemId === 555);
    expect(dpatch).toBeDefined();
    expect(dpatch!.fields.IsActive).toBe(false);
    expect(dpatch!.fields.DeactivationReason).toEqual('assignment-removed');
  });

  it('reactivates a previously inactive row when the same projection key qualifies again', async () => {
    const state = makeSourceState();
    state.projects.set(
      101,
      makeProjectsRow({ roleArrays: { leadEstimatorUpns: ['lead@hb.example.com'] } }),
    );
    const reactivateKey = computeProjectionKey('lead@hb.example.com', 'projects:101');
    const recorder = makeRecorder([
      {
        listItemId: 777,
        projectionKey: reactivateKey,
        userUpn: 'lead@hb.example.com',
        isActive: false,
        projectionContentHash: 'old-hash',
        recordKey: 'projects:101',
        projectsListItemId: 101,
        legacyRegistryItemId: null,
      },
    ]);
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.counts.helperRowsReactivated).toEqual(1);
    expect(outcome.counts.helperRowsInserted).toEqual(0);
    const rpatch = recorder.patches.find((p) => p.listItemId === 777);
    expect(rpatch).toBeDefined();
    expect(rpatch!.fields.IsActive).toBe(true);
    expect(rpatch!.fields.DeactivatedAtUtc).toBeNull();
    expect(rpatch!.fields.DeactivationReason).toBeNull();
  });

  it('content-hash short-circuits — same hash → no update, no insert', async () => {
    const state = makeSourceState();
    const project = makeProjectsRow({ roleArrays: { leadEstimatorUpns: ['lead@hb.example.com'] } });
    state.projects.set(101, project);

    // Compute the exact expected content hash for the projected item.
    const projectedItems = reconcileProjectLinks('lead@hb.example.com', [project], [], {
      projects: { ok: true, bounded: false },
      registry: { ok: true, bounded: false },
    });
    const item = projectedItems[0];
    const sameHash = computeProjectionContentHash({
      upn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item,
    });
    const projectionKey = computeProjectionKey('lead@hb.example.com', 'projects:101');
    const recorder = makeRecorder([
      {
        listItemId: 888,
        projectionKey,
        userUpn: 'lead@hb.example.com',
        isActive: true,
        projectionContentHash: sameHash,
        recordKey: 'projects:101',
        projectsListItemId: 101,
        legacyRegistryItemId: null,
      },
    ]);
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.counts.helperRowsInserted).toEqual(0);
    expect(outcome.counts.helperRowsUpdated).toEqual(0);
    expect(outcome.counts.helperRowsReactivated).toEqual(0);
    expect(outcome.counts.helperRowsDeactivated).toEqual(0);
    expect(recorder.patches).toHaveLength(0);
  });

  it('patches business fields when hash differs', async () => {
    const state = makeSourceState();
    state.projects.set(
      101,
      makeProjectsRow({ roleArrays: { leadEstimatorUpns: ['lead@hb.example.com'] } }),
    );
    const projectionKey = computeProjectionKey('lead@hb.example.com', 'projects:101');
    const recorder = makeRecorder([
      {
        listItemId: 999,
        projectionKey,
        userUpn: 'lead@hb.example.com',
        isActive: true,
        projectionContentHash: 'stale-hash',
        recordKey: 'projects:101',
        projectsListItemId: 101,
        legacyRegistryItemId: null,
      },
    ]);
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.counts.helperRowsUpdated).toEqual(1);
    const update = recorder.patches.find((p) => p.listItemId === 999);
    expect(update).toBeDefined();
    expect(update!.fields.IsActive).toBe(true);
    expect(update!.fields.ProjectionBatchId).toEqual('batch-1');
  });
});

describe('ProjectionSliceEngine — Registry changed', () => {
  it('emits a legacy-only row when no Projects counterpart resolves', async () => {
    const state = makeSourceState();
    state.registry.set(
      9,
      makeRegistryRow({ matchedProjectListItemId: null, matchStatus: 'unmatched' }),
    );
    const recorder = makeRecorder();
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'LegacyRegistry',
      changedItemIds: ['9'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    expect(recorder.inserts).toHaveLength(1);
    expect(recorder.inserts[0].ProjectionSource).toEqual('legacy-only');
    expect(recorder.inserts[0].UserUpn).toEqual('lead@hb.example.com');
    expect(recorder.inserts[0].LegacyRegistryItemId).toEqual(9);
  });

  it('emits merged rows via Projects slice when a Projects counterpart matches', async () => {
    const state = makeSourceState();
    state.projects.set(101, makeProjectsRow());
    state.registry.set(9, makeRegistryRow());
    const recorder = makeRecorder();
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'LegacyRegistry',
      changedItemIds: ['9'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(true);
    const merged = recorder.inserts.filter((f) => f.ProjectionSource === 'merged');
    expect(merged.length).toBeGreaterThanOrEqual(2);
    for (const m of merged) {
      expect(m.LegacyRegistryItemId).toEqual(9);
      expect(m.ProjectsListItemId).toEqual(101);
    }
  });
});

describe('ProjectionSliceEngine — deletion recovery', () => {
  it('Projects deletion soft-deactivates merged helpers and recovers Registry as legacy-only', async () => {
    const state = makeSourceState();
    // Registry counterpart survives.
    state.registry.set(9, makeRegistryRow({ matchedProjectListItemId: 101 }));
    // Prior merged helper rows tied to the deleted Projects item.
    const projectionKey = computeProjectionKey('lead@hb.example.com', 'projects:101');
    const recorder = makeRecorder([
      {
        listItemId: 555,
        projectionKey,
        userUpn: 'lead@hb.example.com',
        isActive: true,
        projectionContentHash: 'h',
        recordKey: 'projects:101',
        projectsListItemId: 101,
        legacyRegistryItemId: 9,
      },
    ]);
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: [],
      deletedItemIds: ['101'],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    // One soft-deactivation with project-source-deleted reason.
    const dpatch = recorder.patches.find(
      (p) => p.fields.DeactivationReason === 'project-source-deleted',
    );
    expect(dpatch).toBeDefined();
    expect(dpatch!.listItemId).toEqual(555);
    // Plus a recovery insert for the legacy-only row.
    const legacyInserts = recorder.inserts.filter((f) => f.ProjectionSource === 'legacy-only');
    expect(legacyInserts.length).toEqual(1);
    expect(legacyInserts[0].LegacyRegistryItemId).toEqual(9);
  });

  it('Registry deletion soft-deactivates legacy-only helpers and recovers Projects as projects-only', async () => {
    const state = makeSourceState();
    state.projects.set(101, makeProjectsRow());
    // Prior legacy-only helper row tied to the deleted Registry item.
    const legacyKey = computeProjectionKey('lead@hb.example.com', 'legacy:9');
    const recorder = makeRecorder([
      {
        listItemId: 444,
        projectionKey: legacyKey,
        userUpn: 'lead@hb.example.com',
        isActive: true,
        projectionContentHash: 'h',
        recordKey: 'legacy:9',
        projectsListItemId: 101,
        legacyRegistryItemId: 9,
      },
    ]);
    const { engine } = buildEngine({ state, recorder });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'LegacyRegistry',
      changedItemIds: [],
      deletedItemIds: ['9'],
    });

    expect(outcome.ok).toBe(true);
    const dpatch = recorder.patches.find(
      (p) => p.fields.DeactivationReason === 'registry-source-deleted',
    );
    expect(dpatch).toBeDefined();
    expect(dpatch!.listItemId).toEqual(444);
    const projectsInserts = recorder.inserts.filter((f) => f.ProjectionSource === 'projects-only');
    expect(projectsInserts.length).toEqual(2);
    for (const p of projectsInserts) {
      expect(p.ProjectsListItemId).toEqual(101);
    }
  });
});

describe('ProjectionSliceEngine — failure path', () => {
  it('returns ok=false with partialCounts when the registry repository throws', async () => {
    const state = makeSourceState();
    state.projects.set(
      101,
      makeProjectsRow({ roleArrays: { leadEstimatorUpns: ['lead@hb.example.com'] } }),
    );
    const failingRepo: IMyProjectsRegistryRepository = {
      async findByProjectionKey() {
        return null;
      },
      async findByProjectsListItemId() {
        return [];
      },
      async findByLegacyRegistryItemId() {
        return [];
      },
      async insertRow() {
        throw new Error('graph 500 internal: simulated');
      },
      async patchRow() {
        // not reached
      },
    };
    const engine = new ProjectionSliceEngine({
      sourceFetchClient: makeSourceClient(state),
      registryRepository: failingRepo,
      now: makeNow(),
    });

    const outcome = await engine.recompute({
      ...REQUEST_BASE,
      sourceListKind: 'Projects',
      changedItemIds: ['101'],
      deletedItemIds: [],
    });

    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.failureCode).toEqual('projection-write-failed');
    expect(outcome.sanitizedReason).toContain('graph');
    expect(outcome.partialCounts).toBeDefined();
  });
});
