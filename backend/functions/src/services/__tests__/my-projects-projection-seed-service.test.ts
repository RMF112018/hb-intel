import { describe, expect, it } from 'vitest';

import {
  ProjectionSeedService,
  type IProjectionSeedServiceDeps,
  type ISeedRunResult,
} from '../my-projects-projection/engine/projection-seed-service.js';
import type { IProjectionSourceFetchClient } from '../my-projects-projection/engine/projection-source-fetch-client.js';
import type {
  IMyProjectsRegistryExistingRow,
  IMyProjectsRegistryRowFields,
  IMyProjectsRegistryRowPatch,
} from '../my-projects-projection/registry/my-projects-registry-row-mapper.js';
import type { IMyProjectsRegistryRepository } from '../my-projects-projection/registry/my-projects-registry-repository.js';
import { computeProjectionKey } from '../my-projects-projection/projection-content-hash.js';
import type {
  ILegacyRegistrySourceRow,
  IProjectSourceRow,
} from '../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';

const NOW = new Date('2026-05-18T13:00:00.000Z');

interface IFakeRepoState {
  inserts: IMyProjectsRegistryRowFields[];
  patches: Array<{ listItemId: number; fields: IMyProjectsRegistryRowPatch }>;
  rowsById: Map<number, IMyProjectsRegistryExistingRow>;
}

function makeRepo(state: IFakeRepoState): IMyProjectsRegistryRepository {
  let next = 1000;
  return {
    async findByProjectionKey(key) {
      for (const row of state.rowsById.values()) if (row.projectionKey === key) return row;
      return null;
    },
    async findByProjectsListItemId(id) {
      return [...state.rowsById.values()].filter((r) => r.projectsListItemId === id);
    },
    async findByLegacyRegistryItemId(id) {
      return [...state.rowsById.values()].filter((r) => r.legacyRegistryItemId === id);
    },
    async insertRow(fields) {
      state.inserts.push(fields);
      const id = ++next;
      state.rowsById.set(id, {
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
      state.patches.push({ listItemId, fields });
      const existing = state.rowsById.get(listItemId);
      if (existing) {
        state.rowsById.set(listItemId, {
          ...existing,
          isActive: fields.IsActive === undefined ? existing.isActive : !!fields.IsActive,
          projectionContentHash:
            typeof fields.ProjectionContentHash === 'string'
              ? fields.ProjectionContentHash
              : existing.projectionContentHash,
        });
      }
    },
  };
}

interface IFakeLeaseState {
  acquireCalls: number;
  releaseCalls: number;
  acquireOutcome:
    | { acquired: true; expiresAtUtc: string }
    | { acquired: false; reason: 'active'; currentOwner: string; expiresAtUtc: string }
    | { acquired: false; reason: 'race-conflict' };
}

function makeLease(state: IFakeLeaseState): IProjectionSeedServiceDeps['leaseRepository'] {
  return {
    async tryAcquire() {
      state.acquireCalls += 1;
      return state.acquireOutcome;
    },
    async release() {
      state.releaseCalls += 1;
      return { released: true };
    },
  } as unknown as IProjectionSeedServiceDeps['leaseRepository'];
}

interface IFakeRunRepoState {
  starts: Array<Record<string, unknown>>;
  finalizes: Array<Record<string, unknown>>;
}

function makeRunRepo(state: IFakeRunRepoState): IProjectionSeedServiceDeps['runRepository'] {
  return {
    async start(args) {
      state.starts.push({ ...args });
      return { rowKey: `Run:${args.startedAtUtc}:${args.runId}` };
    },
    async finalize(args) {
      state.finalizes.push({ ...args });
    },
  } as unknown as IProjectionSeedServiceDeps['runRepository'];
}

function makeSourceClient(args: {
  projects: readonly IProjectSourceRow[];
  registry: readonly ILegacyRegistrySourceRow[];
}): IProjectionSourceFetchClient {
  return {
    async fetchProjectsRow() {
      return null;
    },
    async fetchRegistryRow() {
      return null;
    },
    async findRegistryRowsByMatchedProjectId() {
      return [];
    },
    async findRegistryRowsByNumberYear() {
      return [];
    },
    async findProjectsRowsByNumberYear() {
      return [];
    },
    async listAllProjectsRows() {
      return args.projects;
    },
    async listAllRegistryRows() {
      return args.registry;
    },
  };
}

function makeProject(overrides: Partial<IProjectSourceRow> = {}): IProjectSourceRow {
  return {
    id: 101,
    projectNumber: '24-101',
    projectName: 'Riverwalk',
    year: 2024,
    siteUrl: 'https://contoso.example/sites/riverwalk',
    roleArrays: { leadEstimatorUpns: ['lead@hb.example.com'] },
    legacyRoleFallbacks: {},
    ...overrides,
  };
}

function makeRegistry(overrides: Partial<ILegacyRegistrySourceRow> = {}): ILegacyRegistrySourceRow {
  return {
    id: 9,
    projectNumber: '24-001',
    projectNameRaw: 'Legacy Plaza',
    legacyYear: 2021,
    isActive: true,
    matchStatus: 'unmatched',
    matchedProjectListItemId: null,
    roleArrays: { leadEstimatorUpns: ['legacy@hb.example.com'] },
    ...overrides,
  };
}

function makeService(args: {
  projects: readonly IProjectSourceRow[];
  registry: readonly ILegacyRegistrySourceRow[];
  repoState: IFakeRepoState;
  leaseState: IFakeLeaseState;
  runState: IFakeRunRepoState;
}): ProjectionSeedService {
  return new ProjectionSeedService({
    sourceFetchClient: makeSourceClient({ projects: args.projects, registry: args.registry }),
    registryRepository: makeRepo(args.repoState),
    leaseRepository: makeLease(args.leaseState),
    runRepository: makeRunRepo(args.runState),
    now: () => NOW,
  });
}

const BASE_REQUEST = {
  runId: 'run-1',
  projectionBatchId: 'batch-1',
  leaseOwner: 'tester',
  rebuildLeaseTtlMinutes: 30,
} as const;

describe('ProjectionSeedService — full rebuild', () => {
  it('writes expected helper rows for every assigned UPN and finalizes the run as succeeded', async () => {
    const repoState: IFakeRepoState = { inserts: [], patches: [], rowsById: new Map() };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: { acquired: true, expiresAtUtc: NOW.toISOString() },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [makeProject()],
      registry: [makeRegistry()],
      repoState,
      leaseState,
      runState,
    });

    const result = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'full-rebuild' },
    });

    expect(result.status).toBe('succeeded');
    expect(result.runType).toBe('manual-rebuild');
    expect(result.counts.helperRowsInserted).toBeGreaterThan(0);
    expect(result.counts.expectedRows).toEqual(repoState.inserts.length);
    expect(leaseState.acquireCalls).toEqual(1);
    expect(leaseState.releaseCalls).toEqual(1);
    expect(runState.starts).toHaveLength(1);
    expect(runState.finalizes).toHaveLength(1);
    expect(runState.finalizes[0].status).toBe('succeeded');
  });

  it('seed kind records runType=seed', async () => {
    const repoState: IFakeRepoState = { inserts: [], patches: [], rowsById: new Map() };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: { acquired: true, expiresAtUtc: NOW.toISOString() },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [makeProject()],
      registry: [],
      repoState,
      leaseState,
      runState,
    });

    const result = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'seed' },
    });
    expect(result.runType).toBe('seed');
    expect(runState.starts[0].runType).toBe('seed');
  });

  it('soft-deactivates active helper rows whose ProjectionKey is not in the expected set with reason rebuild-obsolete', async () => {
    // Prior active row for a user no longer assigned.
    const staleKey = computeProjectionKey('formerly-assigned@hb.example.com', 'projects:101');
    const repoState: IFakeRepoState = {
      inserts: [],
      patches: [],
      rowsById: new Map([
        [
          501,
          {
            listItemId: 501,
            projectionKey: staleKey,
            userUpn: 'formerly-assigned@hb.example.com',
            isActive: true,
            projectionContentHash: 'stale',
            recordKey: 'projects:101',
            projectsListItemId: 101,
            legacyRegistryItemId: null,
          },
        ],
      ]),
    };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: { acquired: true, expiresAtUtc: NOW.toISOString() },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [makeProject()],
      registry: [],
      repoState,
      leaseState,
      runState,
    });

    const result: ISeedRunResult = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'full-rebuild' },
    });

    expect(result.status).toBe('succeeded');
    expect(result.counts.helperRowsDeactivated).toEqual(1);
    const deactivationPatch = repoState.patches.find(
      (p) => p.fields.DeactivationReason === 'rebuild-obsolete',
    );
    expect(deactivationPatch).toBeDefined();
    expect(deactivationPatch!.listItemId).toEqual(501);
  });

  it('source-rebuild scoped to LegacyRegistry does not load Projects and does not deactivate Projects-scoped stale rows', async () => {
    const projectScopedKey = computeProjectionKey('projects-user@hb.example.com', 'projects:777');
    const repoState: IFakeRepoState = {
      inserts: [],
      patches: [],
      rowsById: new Map([
        [
          801,
          {
            listItemId: 801,
            projectionKey: projectScopedKey,
            userUpn: 'projects-user@hb.example.com',
            isActive: true,
            projectionContentHash: 'h',
            recordKey: 'projects:777',
            projectsListItemId: 777,
            legacyRegistryItemId: null,
          },
        ],
      ]),
    };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: { acquired: true, expiresAtUtc: NOW.toISOString() },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [],
      registry: [makeRegistry()],
      repoState,
      leaseState,
      runState,
    });

    const result = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'source-rebuild', sourceListKind: 'LegacyRegistry' },
    });

    expect(result.status).toBe('succeeded');
    // Project-scoped row should remain untouched.
    expect(
      repoState.patches.find((p) => p.listItemId === 801 && p.fields.IsActive === false),
    ).toBeUndefined();
    expect(result.sourceListKind).toBe('LegacyRegistry');
  });

  it('dry-run writes no rows and reports counts only', async () => {
    const repoState: IFakeRepoState = { inserts: [], patches: [], rowsById: new Map() };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: { acquired: true, expiresAtUtc: NOW.toISOString() },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [makeProject()],
      registry: [makeRegistry()],
      repoState,
      leaseState,
      runState,
    });

    const result = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'full-rebuild', dryRun: true },
    });

    expect(result.status).toBe('succeeded');
    expect(result.dryRun).toBe(true);
    expect(repoState.inserts).toHaveLength(0);
    expect(repoState.patches).toHaveLength(0);
    expect(result.counts.helperRowsInserted).toBeGreaterThan(0);
  });

  it('returns status=skipped with failureCode=rebuild-lease-active when the rebuild lease is held', async () => {
    const repoState: IFakeRepoState = { inserts: [], patches: [], rowsById: new Map() };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: {
        acquired: false,
        reason: 'active',
        currentOwner: 'other-operator',
        expiresAtUtc: NOW.toISOString(),
      },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [],
      registry: [],
      repoState,
      leaseState,
      runState,
    });

    const result = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'full-rebuild' },
    });

    expect(result.status).toBe('skipped');
    expect(result.failureCode).toBe('rebuild-lease-active');
    expect(runState.starts).toHaveLength(0);
    expect(runState.finalizes).toHaveLength(0);
    expect(leaseState.releaseCalls).toEqual(0);
  });

  it('rejects source-rebuild without sourceListKind', async () => {
    const repoState: IFakeRepoState = { inserts: [], patches: [], rowsById: new Map() };
    const leaseState: IFakeLeaseState = {
      acquireCalls: 0,
      releaseCalls: 0,
      acquireOutcome: { acquired: true, expiresAtUtc: NOW.toISOString() },
    };
    const runState: IFakeRunRepoState = { starts: [], finalizes: [] };
    const svc = makeService({
      projects: [],
      registry: [],
      repoState,
      leaseState,
      runState,
    });

    const result = await svc.runSeedOrRebuild({
      ...BASE_REQUEST,
      request: { rebuildKind: 'source-rebuild' },
    });

    expect(result.status).toBe('failed');
    expect(result.failureCode).toBe('invalid-request');
    expect(leaseState.acquireCalls).toEqual(0);
  });
});
