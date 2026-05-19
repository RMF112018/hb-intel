import { describe, expect, it } from 'vitest';

import { ProjectionMyProjectLinksReadModelProvider } from './my-project-links-projection-provider.js';
import type { MyWorkReadContext } from '../my-work-read-model-provider.js';
import type {
  MyProjectLinksRuntimeDiagnosticProperties,
  MyProjectLinksRuntimeDiagnosticReporter,
  MyProjectLinksRuntimeEventName,
} from './my-project-links-runtime-diagnostics.js';
import type { IMyProjectsRegistryRepository } from '../../../../services/my-projects-projection/registry/my-projects-registry-repository.js';
import type { IMyProjectsRegistryReadRow } from '../../../../services/my-projects-projection/registry/my-projects-registry-row-mapper.js';
import type { SourceListKind } from '../../../../services/my-projects-projection/projection-types.js';
import type { IProjectionDeltaStateEntity } from '../../../../services/my-projects-projection/projection-state-entities.js';

const FIXED_NOW = '2026-05-18T15:00:00.000Z';

function makeContext(overrides: Partial<MyWorkReadContext['actor']> = {}): {
  context: MyWorkReadContext;
  events: Array<{
    name: MyProjectLinksRuntimeEventName;
    properties: MyProjectLinksRuntimeDiagnosticProperties;
  }>;
} {
  const events: Array<{
    name: MyProjectLinksRuntimeEventName;
    properties: MyProjectLinksRuntimeDiagnosticProperties;
  }> = [];
  const reporter: MyProjectLinksRuntimeDiagnosticReporter = {
    trackMyProjectLinksRuntimeEvent(name, properties) {
      events.push({ name, properties });
    },
  };
  const context: MyWorkReadContext = {
    actor: {
      principalName: 'Avery.Lead@HB.example.com',
      displayName: 'Avery Lead',
      hbcUserId: 'oid-1',
      tenantId: 'tenant-1',
      ...overrides,
    },
    requestId: 'req-1',
    projectLinksDiagnostics: reporter,
  };
  return { context, events };
}

function makeReadRow(
  overrides: Partial<IMyProjectsRegistryReadRow> = {},
): IMyProjectsRegistryReadRow {
  return {
    listItemId: 1,
    projectionKey: 'key-1',
    recordKey: 'projects:101',
    userUpn: 'avery.lead@hb.example.com',
    isActive: true,
    projectionSource: 'projects-only',
    projectionContentHash: 'hash-1',
    projectNumber: '24-101',
    projectName: 'Riverwalk Tower',
    projectStage: 'Construction',
    assignmentRoles: ['leadEstimator'],
    projectsListItemId: 101,
    legacyRegistryItemId: null,
    legacyMatchedProjectListItemId: null,
    fallbackMatchMethod: null,
    fallbackMatchConfidence: null,
    sharePointActionState: 'available',
    sharePointActionKind: 'project-site',
    sharePointActionLabel: 'Open SharePoint Site',
    sharePointActionHref: 'https://contoso.example/sites/riverwalk',
    procoreActionState: 'unavailable',
    procoreActionLabel: 'Procore unavailable',
    procoreActionHref: null,
    procoreProject: null,
    buildingConnectedActionState: 'unavailable',
    buildingConnectedActionLabel: 'BuildingConnected unavailable',
    buildingConnectedActionHref: null,
    documentCrunchActionState: 'unavailable',
    documentCrunchActionLabel: 'Document Crunch unavailable',
    documentCrunchActionHref: null,
    warnings: [],
    lastProjectedAtUtc: '2026-05-18T14:30:00.000Z',
    projectionBatchId: 'batch-A',
    ...overrides,
  };
}

function makeRepo(
  args: { rows: readonly IMyProjectsRegistryReadRow[] } | { throws: Error },
): IMyProjectsRegistryRepository {
  return {
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
      return { listItemId: 0 };
    },
    async patchRow() {
      /* no-op */
    },
    async findActiveByUserUpn() {
      if ('throws' in args) throw args.throws;
      return args.rows;
    },
  };
}

function makeDeltaState(
  sourceListKind: SourceListKind,
  overrides: Partial<IProjectionDeltaStateEntity> = {},
): IProjectionDeltaStateEntity {
  return {
    partitionKey: 'MyProjectsProjection',
    rowKey: `DeltaState:${sourceListKind}`,
    SourceListKind: sourceListKind,
    DeltaLink: 'token=latest',
    NeedsResync: false,
    LastDeltaPullStartedUtc: '2026-05-18T14:00:00.000Z',
    LastDeltaPullSucceededUtc: '2026-05-18T14:01:00.000Z',
    LastDeltaPullFailedUtc: undefined,
    LastFailureCode: undefined,
    LastChangedItemCount: 0,
    LastDeletedItemCount: 0,
    LastProjectionBatchId: 'batch-A',
    ...overrides,
  };
}

function makeSourceSyncRepo(args: {
  bySource: Partial<Record<SourceListKind, IProjectionDeltaStateEntity | null>>;
}) {
  return {
    async get(sourceListKind: SourceListKind): Promise<IProjectionDeltaStateEntity | null> {
      if (!(sourceListKind in args.bySource)) return null;
      return args.bySource[sourceListKind] ?? null;
    },
  };
}

const NOW = (): string => FIXED_NOW;

describe('ProjectionMyProjectLinksReadModelProvider — happy path', () => {
  it('reconstructs MyProjectLinkItem[] from active helper rows and stamps projectionMode + freshness diagnostics', async () => {
    const { context, events } = makeContext();
    const rows = [
      makeReadRow({
        listItemId: 1,
        projectionKey: 'k-1',
        recordKey: 'projects:101',
        projectName: 'Alpha',
        projectNumber: '24-001',
        lastProjectedAtUtc: '2026-05-18T13:00:00.000Z',
        projectionBatchId: 'batch-A',
      }),
      makeReadRow({
        listItemId: 2,
        projectionKey: 'k-2',
        recordKey: 'projects:102',
        projectName: 'Beta',
        projectNumber: '24-002',
        lastProjectedAtUtc: '2026-05-18T14:30:00.000Z', // most recent
        projectionBatchId: 'batch-B',
      }),
    ];
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ rows }),
      now: NOW,
    });

    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.items).toHaveLength(2);
    expect(envelope.data.diagnostics?.projectionMode).toBe('projection');
    expect(envelope.data.diagnostics?.projectionMaxLastProjectedAtUtc).toBe(
      '2026-05-18T14:30:00.000Z',
    );
    // String-max picks 'batch-B' over 'batch-A' lexicographically.
    expect(envelope.data.diagnostics?.projectionBatchId).toBe('batch-B');
    expect(envelope.data.summary.assignedProjectCount).toBe(2);
    expect(envelope.data.summary.sharePointReadyCount).toBe(2);
    expect(envelope.data.actor.principalName).toBe('avery.lead@hb.example.com');

    const loadEvent = events.find((e) => e.name === 'myProjectLinks.read.projection.load.result');
    expect(loadEvent).toBeDefined();
    expect(loadEvent!.properties.projectionRowCount).toBe(2);
  });

  it('sorts items by availability then projectName (delegates to shared sortItems)', async () => {
    const { context } = makeContext();
    const rows = [
      makeReadRow({
        listItemId: 1,
        projectionKey: 'k-2',
        recordKey: 'projects:200',
        projectName: 'Zeta',
        projectNumber: '24-200',
      }),
      makeReadRow({
        listItemId: 2,
        projectionKey: 'k-1',
        recordKey: 'projects:100',
        projectName: 'Alpha',
        projectNumber: '24-100',
      }),
    ];
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ rows }),
      now: NOW,
    });
    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.data.items[0].projectName).toBe('Alpha');
    expect(envelope.data.items[1].projectName).toBe('Zeta');
  });

  it('adds projectionSourceSyncHealth=healthy when source sync lanes are initialized and not marked resync', async () => {
    const { context } = makeContext();
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ rows: [makeReadRow()] }),
      sourceSyncStateRepository: makeSourceSyncRepo({
        bySource: {
          Projects: makeDeltaState('Projects', { NeedsResync: false }),
          LegacyRegistry: makeDeltaState('LegacyRegistry', { NeedsResync: false }),
        },
      }),
      now: NOW,
    });

    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.data.diagnostics?.projectionSourceSyncHealth).toBe('healthy');
  });
});

describe('ProjectionMyProjectLinksReadModelProvider — empty rows', () => {
  it('returns zero-match-available-sources classification with empty items', async () => {
    const { context } = makeContext();
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ rows: [] }),
      now: NOW,
    });
    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.items).toHaveLength(0);
    expect(envelope.data.diagnostics?.classification).toBe('zero-match-available-sources');
    expect(envelope.data.diagnostics?.projectionMode).toBe('projection');
    expect(envelope.data.summary.assignedProjectCount).toBe(0);
  });
});

describe('ProjectionMyProjectLinksReadModelProvider — principal-unresolved', () => {
  it('returns principal-unresolved envelope and does NOT call the repository when UPN is missing', async () => {
    let calls = 0;
    const repo: IMyProjectsRegistryRepository = {
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
        return { listItemId: 0 };
      },
      async patchRow() {},
      async findActiveByUserUpn() {
        calls += 1;
        return [];
      },
    };
    const { context } = makeContext({ principalName: '   ' });
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: repo,
      now: NOW,
    });
    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.sourceStatus).toBe('principal-unresolved');
    expect(envelope.data.diagnostics?.classification).toBe('principal-unresolved');
    expect(envelope.data.diagnostics?.principalUnresolvedReason).toBe('missing-upn');
    expect(envelope.data.diagnostics?.projectionMode).toBe('projection');
    expect(envelope.warnings).toEqual([{ code: 'principal-unresolved' }]);
    expect(calls).toBe(0);
  });
});

describe('ProjectionMyProjectLinksReadModelProvider — repository failure (no auto-fallback)', () => {
  it('returns source-unavailable, emits a failed telemetry event, and DOES NOT fall back to the legacy source', async () => {
    const { context, events } = makeContext();
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ throws: new Error('graph 503 service unavailable') }),
      now: NOW,
    });
    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.data.diagnostics?.classification).toBe('source-unavailable');
    expect(envelope.data.diagnostics?.projectionMode).toBe('projection');
    expect(envelope.data.items).toHaveLength(0);
    expect(envelope.warnings).toEqual([{ code: 'source-unavailable' }]);

    const failedEvent = events.find((e) => e.name === 'myProjectLinks.read.projection.failed');
    expect(failedEvent).toBeDefined();
    expect(typeof failedEvent!.properties.stage).toBe('string');
  });
});

describe('ProjectionMyProjectLinksReadModelProvider — projection source sync health', () => {
  it('reports needs-resync when any source lane is marked NeedsResync', async () => {
    const { context } = makeContext();
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ rows: [makeReadRow()] }),
      sourceSyncStateRepository: makeSourceSyncRepo({
        bySource: {
          Projects: makeDeltaState('Projects', { NeedsResync: true }),
          LegacyRegistry: makeDeltaState('LegacyRegistry', { NeedsResync: false }),
        },
      }),
      now: NOW,
    });
    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.data.diagnostics?.projectionSourceSyncHealth).toBe('needs-resync');
  });

  it('reports uninitialized when a source lane has no persisted baseline row', async () => {
    const { context } = makeContext();
    const provider = new ProjectionMyProjectLinksReadModelProvider({
      registryRepository: makeRepo({ rows: [makeReadRow()] }),
      sourceSyncStateRepository: makeSourceSyncRepo({
        bySource: {
          Projects: makeDeltaState('Projects'),
          LegacyRegistry: null,
        },
      }),
      now: NOW,
    });
    const envelope = await provider.getMyProjectLinks(context);
    expect(envelope.data.diagnostics?.projectionSourceSyncHealth).toBe('uninitialized');
  });
});
