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

describe('createPccBackendReadModelClient — URL & method (all 7 routes)', () => {
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

  it('never generates POST/PUT/PATCH/DELETE requests across all 7 methods', async () => {
    const fetchImpl: PccReadModelFetch = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({ data: buildOkEnvelope() }));
    const client = createPccBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      fetch: fetchImpl,
    });
    for (const tuple of ROUTE_METHOD_TUPLES) {
      const method = client[tuple.clientMethod] as (
        id: PccProjectId,
      ) => Promise<unknown>;
      await method.call(client, KNOWN_PROJECT_ID);
    }
    const calls = (fetchImpl as unknown as { mock: { calls: [unknown, RequestInit][] } })
      .mock.calls;
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

describe('createPccBackendReadModelClient — failure paths return backend-unavailable', () => {
  async function expectBackendUnavailable(
    fetchMock: PccReadModelFetch,
  ): Promise<void> {
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
    const fetchImpl = vi
      .fn<PccReadModelFetch>()
      .mockRejectedValue(new TypeError('network'));
    await expectBackendUnavailable(fetchImpl);
  });

  it('malformed JSON → backend-unavailable', async () => {
    const fetchImpl = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse(undefined, { jsonThrows: true }));
    await expectBackendUnavailable(fetchImpl);
  });

  it("missing 'data' field → backend-unavailable", async () => {
    const fetchImpl = vi
      .fn<PccReadModelFetch>()
      .mockResolvedValue(jsonResponse({}));
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
  it('empty backendBaseUrl → all 7 methods return backend-unavailable, no fetch invoked', async () => {
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

  it('whitespace-only backendBaseUrl → all 7 methods return backend-unavailable, no fetch invoked', async () => {
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

  it('no global fetch and no options.fetch → constructor does not throw; all 7 methods return backend-unavailable', async () => {
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
