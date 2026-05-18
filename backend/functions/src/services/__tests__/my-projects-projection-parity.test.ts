/**
 * My Projects projection parity harness — Prompt 10.
 *
 * For each representative scenario, runs the same source-row state through:
 *   (A) the legacy aggregation path (`reconcileProjectLinks` directly), and
 *   (B) the projection pipeline:
 *         ProjectionSliceEngine.recompute → fake registry → findActiveByUserUpn
 *         → mapRegistryRowToProjectLinkItem → sortItems.
 *
 * Asserts the two `MyProjectLinkItem[]` are byte-equivalent on every business
 * dimension (recordKey, source, projectName/Number/Stage, assignmentRoles,
 * four launch actions with state/label/href, provenance fields, warnings,
 * summary counts).
 *
 * Source-loading warnings (`assignment-source-bounded`,
 * `projects-source-partial`, `legacy-registry-source-partial`) are read-time
 * concerns; the harness runs with `ok: true, bounded: false` flags so those
 * warnings never fire in either path. See parity-evidence.md.
 */

import { describe, expect, it } from 'vitest';

import {
  buildSummary,
  reconcileProjectLinks,
  sortItems,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
  type IReconcileSourceStatuses,
} from '../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';
import { ProjectionSliceEngine } from '../my-projects-projection/engine/projection-slice-engine.js';
import type { IProjectionSourceFetchClient } from '../my-projects-projection/engine/projection-source-fetch-client.js';
import type { IMyProjectsRegistryRepository } from '../my-projects-projection/registry/my-projects-registry-repository.js';
import {
  mapRegistryRowToProjectLinkItem,
  type IMyProjectsRegistryExistingRow,
  type IMyProjectsRegistryReadRow,
  type IMyProjectsRegistryRowFields,
  type IMyProjectsRegistryRowPatch,
} from '../my-projects-projection/registry/my-projects-registry-row-mapper.js';
import type { MyProjectLinkItem } from '@hbc/models/myWork';

const OK_FLAGS: IReconcileSourceStatuses = Object.freeze({
  projects: { ok: true, bounded: false },
  registry: { ok: true, bounded: false },
});

const NOW = '2026-05-18T16:00:00.000Z';

interface IFakeRegistryState {
  rowsById: Map<number, IFakeStoredRow>;
  nextId: number;
}

interface IFakeStoredRow {
  listItemId: number;
  fields: IMyProjectsRegistryRowFields;
  isActive: boolean;
  deactivationReason: string | null;
}

function makeRegistryState(): IFakeRegistryState {
  return { rowsById: new Map(), nextId: 1000 };
}

function fieldsToReadRow(stored: IFakeStoredRow): IMyProjectsRegistryReadRow {
  const f = stored.fields;
  return {
    listItemId: stored.listItemId,
    projectionKey: f.ProjectionKey,
    recordKey: f.RecordKey,
    userUpn: f.UserUpn,
    isActive: stored.isActive,
    projectionSource: f.ProjectionSource,
    projectionContentHash: f.ProjectionContentHash,
    projectNumber: f.ProjectNumber,
    projectName: f.ProjectName,
    projectStage: f.ProjectStage ?? null,
    assignmentRoles: JSON.parse(f.AssignmentRolesJson),
    projectsListItemId: f.ProjectsListItemId ?? null,
    legacyRegistryItemId: f.LegacyRegistryItemId ?? null,
    legacyMatchedProjectListItemId: f.LegacyMatchedProjectListItemId ?? null,
    fallbackMatchMethod: f.FallbackMatchMethod ?? null,
    fallbackMatchConfidence: f.FallbackMatchConfidence ?? null,
    sharePointActionState: f.SharePointActionState,
    sharePointActionKind: f.SharePointActionKind,
    sharePointActionLabel: f.SharePointActionLabel,
    sharePointActionHref: f.SharePointActionHref ?? null,
    procoreActionState: f.ProcoreActionState,
    procoreActionLabel: f.ProcoreActionLabel,
    procoreActionHref: f.ProcoreActionHref ?? null,
    procoreProject: f.ProcoreProject ?? null,
    buildingConnectedActionState: f.BuildingConnectedActionState,
    buildingConnectedActionLabel: f.BuildingConnectedActionLabel,
    buildingConnectedActionHref: f.BuildingConnectedActionHref ?? null,
    documentCrunchActionState: f.DocumentCrunchActionState,
    documentCrunchActionLabel: f.DocumentCrunchActionLabel,
    documentCrunchActionHref: f.DocumentCrunchActionHref ?? null,
    warnings: f.WarningsJson ? JSON.parse(f.WarningsJson) : [],
    lastProjectedAtUtc: f.LastProjectedAtUtc,
    projectionBatchId: f.ProjectionBatchId,
  };
}

function fieldsToExisting(stored: IFakeStoredRow): IMyProjectsRegistryExistingRow {
  return {
    listItemId: stored.listItemId,
    projectionKey: stored.fields.ProjectionKey,
    userUpn: stored.fields.UserUpn,
    isActive: stored.isActive,
    projectionContentHash: stored.fields.ProjectionContentHash,
    recordKey: stored.fields.RecordKey,
    projectsListItemId: stored.fields.ProjectsListItemId ?? null,
    legacyRegistryItemId: stored.fields.LegacyRegistryItemId ?? null,
  };
}

function makeRegistryRepo(state: IFakeRegistryState): IMyProjectsRegistryRepository {
  return {
    async findByProjectionKey(key) {
      for (const stored of state.rowsById.values()) {
        if (stored.fields.ProjectionKey === key) return fieldsToExisting(stored);
      }
      return null;
    },
    async findByProjectsListItemId(id) {
      const out: IMyProjectsRegistryExistingRow[] = [];
      for (const stored of state.rowsById.values()) {
        if (stored.fields.ProjectsListItemId === id) out.push(fieldsToExisting(stored));
      }
      return out;
    },
    async findByLegacyRegistryItemId(id) {
      const out: IMyProjectsRegistryExistingRow[] = [];
      for (const stored of state.rowsById.values()) {
        if (stored.fields.LegacyRegistryItemId === id) out.push(fieldsToExisting(stored));
      }
      return out;
    },
    async findActiveByUserUpn(upn) {
      const out: IMyProjectsRegistryReadRow[] = [];
      for (const stored of state.rowsById.values()) {
        if (stored.fields.UserUpn === upn && stored.isActive) out.push(fieldsToReadRow(stored));
      }
      return out;
    },
    async insertRow(fields) {
      const id = ++state.nextId;
      state.rowsById.set(id, {
        listItemId: id,
        fields: { ...fields },
        isActive: fields.IsActive,
        deactivationReason: null,
      });
      return { listItemId: id };
    },
    async patchRow(listItemId, patch) {
      const stored = state.rowsById.get(listItemId);
      if (!stored) return;
      const merged: IMyProjectsRegistryRowFields = { ...stored.fields };
      let isActive = stored.isActive;
      let deactivationReason = stored.deactivationReason;
      for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
        if (value === undefined) continue;
        if (key === 'IsActive') {
          isActive = value === true;
          (merged as unknown as Record<string, unknown>)[key] = isActive;
          continue;
        }
        if (key === 'DeactivationReason') {
          deactivationReason = value === null ? null : (value as string);
          if (value === null) {
            delete (merged as unknown as Record<string, unknown>)[key];
          } else {
            (merged as unknown as Record<string, unknown>)[key] = value;
          }
          continue;
        }
        if (value === null) {
          delete (merged as unknown as Record<string, unknown>)[key];
        } else {
          (merged as unknown as Record<string, unknown>)[key] = value;
        }
      }
      state.rowsById.set(listItemId, {
        listItemId,
        fields: merged,
        isActive,
        deactivationReason,
      });
    },
  };
}

function makeSourceFetchClient(args: {
  projects: readonly IProjectSourceRow[];
  registry: readonly ILegacyRegistrySourceRow[];
}): IProjectionSourceFetchClient {
  return {
    async fetchProjectsRow(id) {
      return args.projects.find((p) => p.id === id) ?? null;
    },
    async fetchRegistryRow(id) {
      return args.registry.find((r) => r.id === id) ?? null;
    },
    async findRegistryRowsByMatchedProjectId(id) {
      return args.registry.filter((r) => r.matchedProjectListItemId === id);
    },
    async findRegistryRowsByNumberYear(num, year) {
      return args.registry.filter((r) => r.projectNumber === num && r.legacyYear === year);
    },
    async findProjectsRowsByNumberYear(num, year) {
      return args.projects.filter((p) => p.projectNumber === num && p.year === year);
    },
    async listAllProjectsRows() {
      return [...args.projects];
    },
    async listAllRegistryRows() {
      return [...args.registry];
    },
  };
}

async function runProjectionFlow(args: {
  actor: string;
  projects: readonly IProjectSourceRow[];
  registry: readonly ILegacyRegistrySourceRow[];
}): Promise<{
  state: IFakeRegistryState;
  items: readonly MyProjectLinkItem[];
}> {
  const state = makeRegistryState();
  const repo = makeRegistryRepo(state);
  const engine = new ProjectionSliceEngine({
    sourceFetchClient: makeSourceFetchClient({
      projects: args.projects,
      registry: args.registry,
    }),
    registryRepository: repo,
    now: () => NOW,
  });

  // Drive the engine via Projects-side changes for every project, then
  // Registry-side changes for every registry row (handles legacy-only).
  const projectIds = args.projects.map((p) => String(p.id));
  const registryIds = args.registry.map((r) => String(r.id));
  if (projectIds.length > 0) {
    const r = await engine.recompute({
      sourceListKind: 'Projects',
      changedItemIds: projectIds,
      deletedItemIds: [],
      projectionBatchId: 'parity-batch',
      correlationId: 'parity-corr',
    });
    if (!r.ok) throw new Error(`projection parity flow failed (Projects): ${r.sanitizedReason}`);
  }
  if (registryIds.length > 0) {
    const r = await engine.recompute({
      sourceListKind: 'LegacyRegistry',
      changedItemIds: registryIds,
      deletedItemIds: [],
      projectionBatchId: 'parity-batch',
      correlationId: 'parity-corr',
    });
    if (!r.ok)
      throw new Error(`projection parity flow failed (LegacyRegistry): ${r.sanitizedReason}`);
  }

  const rows = await repo.findActiveByUserUpn(args.actor);
  const items = sortItems(rows.map((row) => mapRegistryRowToProjectLinkItem(row)));
  return { state, items };
}

interface IParityScenario {
  readonly id: string;
  readonly actor: string;
  readonly projects: readonly IProjectSourceRow[];
  readonly registry: readonly ILegacyRegistrySourceRow[];
}

const ACTOR = 'avery.lead@hb.example.com';

const SCENARIOS: readonly IParityScenario[] = [
  {
    id: 'projects-only',
    actor: ACTOR,
    projects: [
      {
        id: 101,
        projectNumber: '24-001',
        projectName: 'Alpha',
        year: 2024,
        siteUrl: 'https://contoso.example/sites/alpha',
        procoreProject: 'alpha_token',
        buildingConnectedUrl: 'https://buildingconnected.example/projects/alpha',
        documentCrunchUrl: 'https://documentcrunch.example/projects/alpha',
        roleArrays: { leadEstimatorUpns: [ACTOR] },
        legacyRoleFallbacks: {},
      },
    ],
    registry: [],
  },
  {
    id: 'merged-explicit-match',
    actor: ACTOR,
    projects: [
      {
        id: 102,
        projectNumber: '24-002',
        projectName: 'Bravo',
        year: 2024,
        projectStage: 'Construction',
        siteUrl: 'https://contoso.example/sites/bravo',
        roleArrays: { projectManagerUpns: [ACTOR] },
        legacyRoleFallbacks: {},
      },
    ],
    registry: [
      {
        id: 9,
        projectNumber: '24-002',
        projectNameRaw: 'Bravo (legacy)',
        legacyYear: 2024,
        isActive: true,
        folderWebUrl: 'https://contoso.example/sites/legacy/bravo',
        matchStatus: 'matched',
        matchConfidence: 'high',
        matchMethod: 'explicit',
        matchedProjectListItemId: 102,
        roleArrays: { projectManagerUpns: [ACTOR] },
      },
    ],
  },
  {
    id: 'merged-fallback-number-year',
    actor: ACTOR,
    projects: [
      {
        id: 103,
        projectNumber: '24-003',
        projectName: 'Charlie',
        year: 2024,
        siteUrl: 'https://contoso.example/sites/charlie',
        roleArrays: { leadEstimatorUpns: [ACTOR] },
        legacyRoleFallbacks: {},
      },
    ],
    registry: [
      {
        id: 10,
        projectNumber: '24-003',
        projectNameRaw: 'Charlie (legacy)',
        legacyYear: 2024,
        isActive: true,
        folderWebUrl: 'https://contoso.example/sites/legacy/charlie',
        matchStatus: 'unmatched',
        matchedProjectListItemId: null,
        matchMethod: 'fallback-number-year',
        matchConfidence: 'medium',
        roleArrays: { leadEstimatorUpns: [ACTOR] },
      },
    ],
  },
  {
    id: 'legacy-only',
    actor: ACTOR,
    projects: [],
    registry: [
      {
        id: 11,
        projectNumber: '22-100',
        projectNameRaw: 'Delta Legacy',
        legacyYear: 2022,
        isActive: true,
        folderWebUrl: 'https://contoso.example/sites/legacy/delta',
        matchStatus: 'unmatched',
        matchedProjectListItemId: null,
        roleArrays: { projectExecutiveUpns: [ACTOR] },
      },
    ],
  },
  {
    id: 'missing-launch-url-warnings',
    actor: ACTOR,
    projects: [
      {
        id: 104,
        projectNumber: '24-004',
        projectName: 'Echo',
        year: 2024,
        // No siteUrl, no procoreProject, no buildingConnectedUrl, no documentCrunchUrl.
        roleArrays: { leadEstimatorUpns: [ACTOR] },
        legacyRoleFallbacks: {},
      },
    ],
    registry: [],
  },
  {
    id: 'invalid-procore-token',
    actor: ACTOR,
    projects: [
      {
        id: 105,
        projectNumber: '24-005',
        projectName: 'Foxtrot',
        year: 2024,
        siteUrl: 'https://contoso.example/sites/foxtrot',
        procoreProject: 'has spaces and !!!chars',
        roleArrays: { leadEstimatorUpns: [ACTOR] },
        legacyRoleFallbacks: {},
      },
    ],
    registry: [],
  },
  {
    id: 'projects-role-fallback',
    actor: ACTOR,
    projects: [
      {
        id: 106,
        projectNumber: '24-006',
        projectName: 'Golf',
        year: 2024,
        siteUrl: 'https://contoso.example/sites/golf',
        // Canonical role arrays absent — fallback fields supply the UPN.
        roleArrays: {},
        legacyRoleFallbacks: { leadEstimatorUpn: ACTOR },
      },
    ],
    registry: [],
  },
];

function normalizeItem(item: MyProjectLinkItem): MyProjectLinkItem {
  // Strip `kind` defaults so legacy and projection compare byte-equivalent.
  // Both paths produce the same kind today; this is a defensive normalization.
  return {
    ...item,
    warnings: [...item.warnings].sort((a, b) =>
      `${a.code}:${a.message ?? ''}`.localeCompare(`${b.code}:${b.message ?? ''}`),
    ),
  };
}

describe('My Projects projection parity harness (Prompt 10)', () => {
  for (const scenario of SCENARIOS) {
    it(`scenario "${scenario.id}": legacy aggregation matches projection round-trip`, async () => {
      const legacyItems = sortItems([
        ...reconcileProjectLinks(scenario.actor, scenario.projects, scenario.registry, OK_FLAGS),
      ]);
      const { items: projectionItems } = await runProjectionFlow({
        actor: scenario.actor,
        projects: scenario.projects,
        registry: scenario.registry,
      });

      expect(projectionItems).toHaveLength(legacyItems.length);
      const legacyNormalized = legacyItems.map(normalizeItem);
      const projectionNormalized = projectionItems.map(normalizeItem);
      expect(projectionNormalized).toEqual(legacyNormalized);

      // Summary parity.
      const legacySummary = buildSummary(legacyItems);
      const projectionSummary = buildSummary(projectionItems);
      expect(projectionSummary).toEqual(legacySummary);
    });
  }

  it('soft-deactivation/reactivation: removing then restoring an assignment writes the expected lifecycle through the registry', async () => {
    const ACTOR_LOCAL = ACTOR;
    const projects = (assigned: boolean): readonly IProjectSourceRow[] => [
      {
        id: 200,
        projectNumber: '24-200',
        projectName: 'Hotel',
        year: 2024,
        siteUrl: 'https://contoso.example/sites/hotel',
        roleArrays: assigned ? { leadEstimatorUpns: [ACTOR_LOCAL] } : {},
        legacyRoleFallbacks: {},
      },
    ];

    const state = makeRegistryState();
    const repo = makeRegistryRepo(state);

    const buildEngine = (assigned: boolean): ProjectionSliceEngine =>
      new ProjectionSliceEngine({
        sourceFetchClient: makeSourceFetchClient({ projects: projects(assigned), registry: [] }),
        registryRepository: repo,
        now: () => NOW,
      });

    // Pass 1: actor assigned → insert.
    const r1 = await buildEngine(true).recompute({
      sourceListKind: 'Projects',
      changedItemIds: ['200'],
      deletedItemIds: [],
      projectionBatchId: 'pass-1',
      correlationId: 'parity-deact-reactivate',
    });
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    expect(r1.counts.helperRowsInserted).toBe(1);
    let active = await repo.findActiveByUserUpn(ACTOR_LOCAL);
    expect(active).toHaveLength(1);

    // Pass 2: assignment removed → soft-deactivate.
    const r2 = await buildEngine(false).recompute({
      sourceListKind: 'Projects',
      changedItemIds: ['200'],
      deletedItemIds: [],
      projectionBatchId: 'pass-2',
      correlationId: 'parity-deact-reactivate',
    });
    expect(r2.ok).toBe(true);
    if (!r2.ok) return;
    expect(r2.counts.helperRowsDeactivated).toBe(1);
    active = await repo.findActiveByUserUpn(ACTOR_LOCAL);
    expect(active).toHaveLength(0);
    // Stored row is inactive with the assignment-removed reason.
    const stored = [...state.rowsById.values()][0];
    expect(stored.isActive).toBe(false);
    expect(stored.deactivationReason).toBe('assignment-removed');

    // Pass 3: assignment restored → reactivate.
    const r3 = await buildEngine(true).recompute({
      sourceListKind: 'Projects',
      changedItemIds: ['200'],
      deletedItemIds: [],
      projectionBatchId: 'pass-3',
      correlationId: 'parity-deact-reactivate',
    });
    expect(r3.ok).toBe(true);
    if (!r3.ok) return;
    expect(r3.counts.helperRowsReactivated).toBe(1);
    active = await repo.findActiveByUserUpn(ACTOR_LOCAL);
    expect(active).toHaveLength(1);
    const restored = [...state.rowsById.values()][0];
    expect(restored.isActive).toBe(true);
    expect(restored.deactivationReason).toBeNull();
  });
});
