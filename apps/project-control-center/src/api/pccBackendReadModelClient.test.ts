import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROJECT_PROFILES } from '@hbc/models/pcc';
import type {
  PccPersona,
  PccProjectHomeReadModel,
  PccProjectId,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';
import {
  createPccBackendReadModelClient,
  type PccReadModelFetch,
} from './pccBackendReadModelClient.js';
import { PCC_READ_MODEL_ROUTE_PATHS } from './pccReadModelClient.js';

const KNOWN_PROJECT_ID = SAMPLE_PROJECT_PROFILES[0]!.projectId;
const ENCODED_KNOWN_PROJECT_ID = encodeURIComponent(KNOWN_PROJECT_ID);
const PROJECT_ID_NEEDS_ENCODING = 'a b/c?d&e' as PccProjectId;
const SAMPLE_PERSONA: PccPersona = 'project-manager';

interface IRouteMethodTuple {
  readonly routeId: keyof typeof PCC_READ_MODEL_ROUTE_PATHS;
  readonly clientMethod: keyof ReturnType<typeof createPccBackendReadModelClient>;
}

const ROUTE_METHOD_TUPLES: readonly IRouteMethodTuple[] = [
  { routeId: 'profile', clientMethod: 'getProjectProfile' },
  { routeId: 'modules', clientMethod: 'getModuleRegistry' },
  { routeId: 'home', clientMethod: 'getProjectHome' },
  { routeId: 'priority-actions', clientMethod: 'getPriorityActions' },
  { routeId: 'document-control', clientMethod: 'getDocumentControl' },
  { routeId: 'external-links', clientMethod: 'getExternalLinks' },
  { routeId: 'site-health', clientMethod: 'getSiteHealth' },
  { routeId: 'team-access', clientMethod: 'getTeamAccess' },
  { routeId: 'project-readiness', clientMethod: 'getProjectReadiness' },
  { routeId: 'lifecycle-readiness', clientMethod: 'getLifecycleReadiness' },
  {
    routeId: 'permit-inspection-control-center',
    clientMethod: 'getPermitInspectionControlCenter',
  },
  { routeId: 'responsibility-matrix', clientMethod: 'getResponsibilityMatrix' },
  { routeId: 'constraints-log', clientMethod: 'getConstraintsLog' },
  { routeId: 'buyout-log', clientMethod: 'getBuyoutLog' },
  { routeId: 'procore-project-mapping', clientMethod: 'getProcoreProjectMapping' },
  { routeId: 'procore-sync-health', clientMethod: 'getProcoreSyncHealth' },
  { routeId: 'unified-lifecycle', clientMethod: 'getUnifiedLifecycle' },
  { routeId: 'project-memory', clientMethod: 'getProjectMemory' },
  { routeId: 'project-lenses', clientMethod: 'getProjectLenses' },
  { routeId: 'project-traceability', clientMethod: 'getProjectTraceability' },
  { routeId: 'warranty-trace', clientMethod: 'getWarrantyTrace' },
  { routeId: 'cross-project-knowledge', clientMethod: 'getCrossProjectKnowledge' },
  { routeId: 'unified-search', clientMethod: 'getUnifiedSearch' },
  // Wave 14 / Prompt 04 — composite approvals/checkpoints read-model.
  { routeId: 'approvals', clientMethod: 'getApprovals' },
];

function buildOkEnvelope(): PccReadModelEnvelope<PccProjectHomeReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      profile: SAMPLE_PROJECT_PROFILES[0]!,
      priorityActions: [],
      missingConfigurations: [],
    },
  };
}

function jsonResponse(
  body: unknown,
  init: { status?: number; jsonThrows?: boolean } = {},
): Response {
  const status = init.status ?? 200;
  const ok = status >= 200 && status < 300;
  const json = init.jsonThrows
    ? () => Promise.reject(new SyntaxError('malformed json'))
    : () => Promise.resolve(body);
  return { ok, status, json } as unknown as Response;
}

let originalGlobalFetch: typeof globalThis.fetch | undefined;

beforeEach(() => {
  originalGlobalFetch = globalThis.fetch;
});

afterEach(() => {
  if (originalGlobalFetch === undefined) {
    delete (globalThis as { fetch?: unknown }).fetch;
  } else {
    (globalThis as { fetch?: typeof globalThis.fetch }).fetch = originalGlobalFetch;
  }
  vi.restoreAllMocks();
});

describe('createPccBackendReadModelClient — URL & method (all 24 routes)', () => {
  for (const tuple of ROUTE_METHOD_TUPLES) {
    it(`builds GET ${PCC_READ_MODEL_ROUTE_PATHS[tuple.routeId]}`, async () => {
      const okEnvelope: PccReadModelEnvelope<unknown> = {
        ...buildOkEnvelope(),
        data: { surfaces: {} } as never,
      };
      const fetchImpl: PccReadModelFetch = vi
        .fn<PccReadModelFetch>()
        .mockResolvedValue(jsonResponse({ data: okEnvelope }));
      const client = createPccBackendReadModelClient({
        backendBaseUrl: 'https://example.invalid',
        fetch: fetchImpl,
      });

      const method = client[tuple.clientMethod] as (
        id: PccProjectId,
        vp?: PccPersona,
      ) => Promise<PccReadModelEnvelope<unknown>>;
      await method.call(client, KNOWN_PROJECT_ID, SAMPLE_PERSONA);

      const path = PCC_READ_MODEL_ROUTE_PATHS[tuple.routeId].replace(
        '{projectId}',
        ENCODED_KNOWN_PROJECT_ID,
      );
      const expectedUrl = `https://example.invalid/api/${path}`;
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      expect(fetchImpl).toHaveBeenCalledWith(expectedUrl, { method: 'GET' });
    });
  }

  it('never generates POST/PUT/PATCH/DELETE requests across all 22 methods', async () => {
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: buildOkEnvelope() }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    for (const tuple of ROUTE_METHOD_TUPLES) {
      const method = client[tuple.clientMethod] as (id: PccProjectId) => Promise<unknown>;
      await method.call(client, KNOWN_PROJECT_ID);
    }
    const calls = (fetchImpl as unknown as { mock: { calls: [unknown, RequestInit][] } }).mock
      .calls;
    for (const [, init] of calls) {
      expect(init?.method).toBe('GET');
    }
  });
});

describe('createPccBackendReadModelClient — base URL normalization', () => {
  const baseUrlForms = [
    'https://example.invalid',
    'https://example.invalid/',
    'https://example.invalid/api',
    'https://example.invalid/api/',
  ] as const;

  const expectedHomeUrl = `https://example.invalid/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/home`;

  for (const form of baseUrlForms) {
    it(`'${form}' produces single /api/ segment`, async () => {
      const fetchImpl: PccReadModelFetch = vi
        .fn<PccReadModelFetch>()
        .mockResolvedValue(jsonResponse({ data: buildOkEnvelope() }));
      const client = createPccBackendReadModelClient({
        backendBaseUrl: form,
        fetch: fetchImpl,
      });
      await client.getProjectHome(KNOWN_PROJECT_ID);
      expect(fetchImpl).toHaveBeenCalledWith(expectedHomeUrl, { method: 'GET' });
    });
  }
});

describe('createPccBackendReadModelClient — projectId encoding', () => {
  it('URL-encodes projectId via encodeURIComponent', async () => {
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: buildOkEnvelope() }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid/api',
      fetch: fetchImpl,
    });
    await client.getProjectHome(PROJECT_ID_NEEDS_ENCODING);
    const expected = `https://example.invalid/api/pcc/projects/${encodeURIComponent(
      PROJECT_ID_NEEDS_ENCODING,
    )}/home`;
    expect(fetchImpl).toHaveBeenCalledWith(expected, { method: 'GET' });
  });
});

describe('createPccBackendReadModelClient — success path', () => {
  it('returns the envelope verbatim from { data: envelope }', async () => {
    const envelope: PccReadModelEnvelope<PccProjectHomeReadModel> = buildOkEnvelope();
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: envelope }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const result = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(result).toEqual(envelope);
  });
});

describe('createPccBackendReadModelClient — responsibility-matrix success path', () => {
  it('builds GET pcc/projects/{projectId}/responsibility-matrix and passes envelope through', async () => {
    const envelope: PccReadModelEnvelope<unknown> = {
      ...buildOkEnvelope(),
      data: {
        templates: [],
        projectInstances: [],
        exceptions: [],
        healthScore: { state: 'insufficient-data', reason: 'mock' },
        workbookSourceSummary: {
          defaultItemsTotal: 109,
          pmItems: 82,
          fieldItems: 27,
          strictMarkedRows: 98,
          ambiguousItemsTotal: 47,
          ownerContractActiveDefaultObligations: 0,
          sourceFiles: [],
        },
        sourcePosture: {
          sourceStatus: 'available',
          pendingHumanReviewCount: 0,
        },
        snapshotHistory: [],
        auditEvents: [],
      } as never,
    };
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: envelope }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const result = await client.getResponsibilityMatrix(KNOWN_PROJECT_ID);
    expect(result).toEqual(envelope);
    const expectedUrl = `https://example.invalid/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/responsibility-matrix`;
    expect(fetchImpl).toHaveBeenCalledWith(expectedUrl, { method: 'GET' });
  });

  it('fetch reject → fixture fallback envelope with sourceStatus="backend-unavailable"', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>().mockRejectedValue(new TypeError('network'));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const env = await client.getResponsibilityMatrix(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.mode).toBe('fixture');
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    expect(env.data.templates).toEqual([]);
    expect(env.data.healthScore.state).toBe('insufficient-data');
  });
});

describe('createPccBackendReadModelClient — constraints-log success path', () => {
  it('builds GET pcc/projects/{projectId}/constraints-log and passes envelope through', async () => {
    const envelope: PccReadModelEnvelope<unknown> = {
      ...buildOkEnvelope(),
      data: {
        moduleIdentity: {
          moduleId: 'constraints-log',
          displayName: 'Constraints Log',
          subtitle: 'Make-Ready Constraint & Risk Exposure Center',
          governance: 'project-readiness',
          workCenterId: 'risk-issues-decision',
        },
        riskMatrixConfig: {
          likelihoodLabels: [],
          impactLabels: [],
          urgencyLabels: [],
          impactDimensions: [],
        },
        exposureBands: [],
        overrideRules: {},
        seedCategories: [],
        riskItems: [],
        constraintItems: [],
        exposureSummary: {
          riskCountsByBand: {},
          constraintCountsByBand: {},
          overdueConstraintCount: 0,
          awaitingExternalPartyCount: 0,
          delayExposureReviewQueueCount: 0,
          changeExposureReviewQueueCount: 0,
          priorityActionsCandidateCount: 0,
        },
        sourcePosture: {
          sourceStatus: 'available',
          pendingHumanReviewCount: 0,
        },
        snapshotHistory: [],
        auditEvents: [],
      } as never,
    };
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: envelope }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const result = await client.getConstraintsLog(KNOWN_PROJECT_ID);
    expect(result).toEqual(envelope);
    const expectedUrl = `https://example.invalid/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/constraints-log`;
    expect(fetchImpl).toHaveBeenCalledWith(expectedUrl, { method: 'GET' });
  });

  it('fetch reject → fixture fallback envelope with sourceStatus="backend-unavailable"', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>().mockRejectedValue(new TypeError('network'));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const env = await client.getConstraintsLog(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.mode).toBe('fixture');
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    expect(env.data.riskItems).toEqual([]);
    expect(env.data.constraintItems).toEqual([]);
    expect(env.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
    expect(env.data.moduleIdentity.moduleId).toBe('constraints-log');
  });
});

describe('createPccBackendReadModelClient — buyout-log success path', () => {
  it('builds GET pcc/projects/{projectId}/buyout-log and passes envelope through', async () => {
    const envelope: PccReadModelEnvelope<unknown> = {
      ...buildOkEnvelope(),
      data: {
        moduleIdentity: {
          moduleId: 'buyout-log',
          displayName: 'Buyout Log',
          subtitle: 'Buyout Control Center',
          governance: 'project-readiness',
          workCenterId: 'procurement-and-buyout',
          mvpTier: 'MVP',
          futureAffinityWorkCenter: 'procurement-and-buyout-center',
        },
        packages: [],
        scopeLines: [],
        budgetAllocations: [],
        commitmentLinks: [],
        complianceRequirements: [],
        procurementMilestones: [],
        evidenceLinks: [],
        reconciliationIssues: [],
        priorityActionCandidates: [],
        auditEvents: [],
        projectMemoryContributions: [],
        traceabilityEdgeContributions: [],
        hbiEligibilityMarkers: [],
        sourcePosture: {
          sourceStatus: 'available',
          pendingHumanReviewCount: 0,
        },
        snapshotHistory: [],
      } as never,
    };
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: envelope }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const result = await client.getBuyoutLog(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(result).toEqual(envelope);
    const expectedUrl = `https://example.invalid/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/buyout-log`;
    expect(fetchImpl).toHaveBeenCalledWith(expectedUrl, { method: 'GET' });
    // viewerPersona must NOT be serialized into URL or query string.
    const calledUrl = vi.mocked(fetchImpl).mock.calls[0]![0] as string;
    expect(calledUrl).not.toContain(SAMPLE_PERSONA);
    expect(calledUrl).not.toContain('viewerPersona');
  });

  it('fetch reject → fixture fallback envelope with sourceStatus="backend-unavailable" and viewerPersona passed through', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>().mockRejectedValue(new TypeError('network'));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const env = await client.getBuyoutLog(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.mode).toBe('fixture');
    // viewerPersona is passed through to the fixture-fallback unchanged on
    // fetch failure (proves the persona reaches the fallback even though it
    // is never serialized into the request URL).
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    expect(env.data.packages).toEqual([]);
    expect(env.data.commitmentLinks).toEqual([]);
    expect(env.data.priorityActionCandidates).toEqual([]);
    expect(env.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
    expect(env.data.moduleIdentity.moduleId).toBe('buyout-log');
    expect(env.data.moduleIdentity.subtitle).toBe('Buyout Control Center');
  });
});

// ─────────────────────────────────────────────────────────────────
// Wave 14 / Prompt 04 — composite approvals/checkpoints read-model.
// ─────────────────────────────────────────────────────────────────

describe('createPccBackendReadModelClient — approvals success path', () => {
  it('returns the backend envelope as-is on success — no client-side mutation, no viewerPersona injection', async () => {
    // Backend route does NOT echo viewerPersona on a successful response
    // (the route handler does not forward viewerPersona to the provider).
    // The client must return the backend envelope unchanged.
    const envelope: PccReadModelEnvelope<unknown> = {
      ...buildOkEnvelope(),
      data: {
        queue: { entries: [] },
        myApprovals: { viewerPrincipalKey: '', viewerRole: 'viewer', entries: [] },
        registry: { definitions: [], checkpointInstances: [] },
        escalation: { entries: [] },
        adminVerification: { entries: [] },
        policy: { policies: [], versions: [] },
        analytics: {
          totalRequests: 0,
          countsByState: {},
          countsByMode: {},
          countsBySourceModule: {},
        },
      } as never,
    };
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: envelope }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const result = await client.getApprovals(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(result).toEqual(envelope);
    // Successful backend response did NOT carry viewerPersona — client must not inject it.
    expect('viewerPersona' in result).toBe(false);
    const expectedUrl = `https://example.invalid/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/approvals`;
    expect(fetchImpl).toHaveBeenCalledWith(expectedUrl, { method: 'GET' });
  });

  it('viewerPersona is NOT serialized into URL or query for getApprovals', async () => {
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: buildOkEnvelope() }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    await client.getApprovals(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    const calledUrl = vi.mocked(fetchImpl).mock.calls[0]![0] as string;
    expect(calledUrl).toBe(
      `https://example.invalid/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/approvals`,
    );
    expect(calledUrl).not.toContain(SAMPLE_PERSONA);
    expect(calledUrl).not.toContain('viewerPersona');
    expect(calledUrl).not.toContain('?');
  });

  it('fetch reject → fixture fallback envelope with viewerPersona passed through to the fixture (per fixture convention)', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>().mockRejectedValue(new TypeError('network'));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    const env = await client.getApprovals(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.mode).toBe('fixture');
    // viewerPersona reaches the fixture fallback (which echoes it on the
    // envelope per fixture convention). This is NOT a route-mirror —
    // a successful backend response would not carry viewerPersona.
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    // Empty composite shape preserved across all sub-models.
    expect(env.data.queue.entries).toEqual([]);
    expect(env.data.myApprovals.entries).toEqual([]);
    expect(env.data.registry.definitions).toEqual([]);
    expect(env.data.registry.checkpointInstances).toEqual([]);
    expect(env.data.escalation.entries).toEqual([]);
    expect(env.data.adminVerification.entries).toEqual([]);
    expect(env.data.policy.policies).toEqual([]);
    expect(env.data.policy.versions).toEqual([]);
    expect(env.data.analytics.totalRequests).toBe(0);
  });
});

describe('createPccBackendReadModelClient — getUnifiedSearch q-param wiring', () => {
  const baseUrl = 'https://example.invalid';
  const basePath = `${baseUrl}/api/pcc/projects/${ENCODED_KNOWN_PROJECT_ID}/unified-search`;

  function makeClient(): {
    client: ReturnType<typeof createPccBackendReadModelClient>;
    fetchImpl: PccReadModelFetch;
  } {
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: buildOkEnvelope() }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: baseUrl,
      fetch: fetchImpl,
    });
    return { client, fetchImpl };
  }

  it('appends ?q=<encoded> when query is provided (viewerPersona omitted)', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID, undefined, 'risk register');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(`${basePath}?q=risk%20register`, { method: 'GET' });
  });

  it('URL-encodes special characters in q', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID, undefined, 'foo&bar=baz?qux/zap');
    expect(fetchImpl).toHaveBeenCalledWith(
      `${basePath}?q=${encodeURIComponent('foo&bar=baz?qux/zap')}`,
      { method: 'GET' },
    );
  });

  it('omits ?q= entirely when query is undefined (no third arg passed)', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID);
    expect(fetchImpl).toHaveBeenCalledWith(basePath, { method: 'GET' });
    expect(
      (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock
        .calls[0]![0] as string,
    ).not.toContain('?q=');
  });

  it('omits ?q= when query is the empty string', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID, undefined, '');
    expect(fetchImpl).toHaveBeenCalledWith(basePath, { method: 'GET' });
  });

  it('omits ?q= when query is whitespace only', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID, undefined, '   ');
    expect(fetchImpl).toHaveBeenCalledWith(basePath, { method: 'GET' });
  });

  // Position-proof: viewerPersona must NOT be serialized to the URL or
  // mistaken for the query arg. With only (projectId, viewerPersona) passed,
  // the URL must be the bare unified-search path with no query string.
  it('does not treat viewerPersona as a query (no ?q=, persona absent from URL)', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const calledWith = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0]![0] as string;
    expect(calledWith).toBe(basePath);
    expect(calledWith).not.toContain('?');
    expect(calledWith).not.toContain(SAMPLE_PERSONA);
    expect(calledWith).not.toContain('q=');
  });

  it('passes both viewerPersona (passthrough only) and query (q-param) when both provided', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getUnifiedSearch(KNOWN_PROJECT_ID, SAMPLE_PERSONA, 'memory');
    const calledWith = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0]![0] as string;
    expect(calledWith).toBe(`${basePath}?q=memory`);
    expect(calledWith).not.toContain(SAMPLE_PERSONA);
  });

  it('no other route receives a ?q= query string under the same usage', async () => {
    const { client, fetchImpl } = makeClient();
    await client.getProjectMemory(KNOWN_PROJECT_ID);
    await client.getCrossProjectKnowledge(KNOWN_PROJECT_ID);
    await client.getProjectTraceability(KNOWN_PROJECT_ID);
    const calls = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls;
    for (const [url] of calls) {
      expect(url as string).not.toContain('?q=');
    }
  });
});

describe('createPccBackendReadModelClient — failure paths return backend-unavailable', () => {
  async function expectBackendUnavailable(fetchMock: PccReadModelFetch): Promise<void> {
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchMock,
    });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.mode).toBe('fixture');
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
  }

  it('non-2xx response → backend-unavailable', async () => {
    const fetchImpl = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({}, { status: 500 }));
    await expectBackendUnavailable(fetchImpl);
  });

  it('fetch reject → backend-unavailable', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>().mockRejectedValue(new TypeError('network'));
    await expectBackendUnavailable(fetchImpl);
  });

  it('malformed JSON → backend-unavailable', async () => {
    const fetchImpl = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse(undefined, { jsonThrows: true }));
    await expectBackendUnavailable(fetchImpl);
  });

  it("missing 'data' field → backend-unavailable", async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>().mockResolvedValue(jsonResponse({}));
    await expectBackendUnavailable(fetchImpl);
  });

  it('non-envelope data shape → backend-unavailable', async () => {
    const fetchImpl = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: { foo: 1 } }));
    await expectBackendUnavailable(fetchImpl);
  });
});

describe('createPccBackendReadModelClient — config-fallback paths', () => {
  it('empty backendBaseUrl → all 22 methods return backend-unavailable, no fetch invoked', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>();
    const client = createPccBackendReadModelClient({
      backendBaseUrl: '',
      fetch: fetchImpl,
    });
    for (const tuple of ROUTE_METHOD_TUPLES) {
      const method = client[tuple.clientMethod] as (
        id: PccProjectId,
      ) => Promise<{ sourceStatus: string }>;
      const env = await method.call(client, KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('whitespace-only backendBaseUrl → all 22 methods return backend-unavailable, no fetch invoked', async () => {
    const fetchImpl = vi.fn<PccReadModelFetch>();
    const client = createPccBackendReadModelClient({
      backendBaseUrl: '   ',
      fetch: fetchImpl,
    });
    for (const tuple of ROUTE_METHOD_TUPLES) {
      const method = client[tuple.clientMethod] as (
        id: PccProjectId,
      ) => Promise<{ sourceStatus: string }>;
      const env = await method.call(client, KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('no global fetch and no options.fetch → constructor does not throw; all 22 methods return backend-unavailable', async () => {
    delete (globalThis as { fetch?: unknown }).fetch;
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
    });
    for (const tuple of ROUTE_METHOD_TUPLES) {
      const method = client[tuple.clientMethod] as (
        id: PccProjectId,
      ) => Promise<{ sourceStatus: string }>;
      const env = await method.call(client, KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
    }
  });
});
