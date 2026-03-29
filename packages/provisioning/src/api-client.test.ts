import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProvisioningApiClient, ApiError } from './api-client.js';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response;
}

const BASE = 'https://fn.example.com';
const TOKEN = 'test-token';
const getToken = () => Promise.resolve(TOKEN);

const STUB_REQUEST = {
  requestId: 'r1',
  projectId: 'p1',
  projectName: 'Test',
  state: 'Submitted',
};

const STUB_STATUS = {
  projectId: 'p1',
  projectNumber: '001',
  overallStatus: 'Completed',
};

let fetchMock: ReturnType<typeof vi.fn>;
let client: ReturnType<typeof createProvisioningApiClient>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  client = createProvisioningApiClient(BASE, getToken);
});

/* ------------------------------------------------------------------ */
/*  Single-item envelope unwrapping                                   */
/* ------------------------------------------------------------------ */

describe('single-item envelope unwrapping', () => {
  it('submitRequest unwraps { data } envelope', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: STUB_REQUEST }, 201));

    const result = await client.submitRequest({ projectName: 'Test' });

    expect(result).toEqual(STUB_REQUEST);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/project-setup-requests`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('advanceState unwraps { data } envelope', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { ...STUB_REQUEST, state: 'UnderReview' } }),
    );

    const result = await client.advanceState('r1', 'UnderReview' as never);

    expect(result.state).toBe('UnderReview');
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/project-setup-requests/r1/state`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('getProvisioningStatus unwraps { data } envelope', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: STUB_STATUS }));

    const result = await client.getProvisioningStatus('p1');

    expect(result).toEqual(STUB_STATUS);
  });
});

/* ------------------------------------------------------------------ */
/*  List envelope unwrapping                                          */
/* ------------------------------------------------------------------ */

describe('list envelope unwrapping', () => {
  const listEnvelope = {
    items: [STUB_REQUEST],
    pagination: { total: 1, page: 1, pageSize: 25, totalPages: 1 },
  };

  it('listRequests unwraps { items } envelope', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(listEnvelope));

    const result = await client.listRequests();

    expect(result).toEqual([STUB_REQUEST]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/project-setup-requests`,
      expect.any(Object),
    );
  });

  it('listRequests passes state query param', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(listEnvelope));

    await client.listRequests('Submitted' as never);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/project-setup-requests?state=Submitted`,
      expect.any(Object),
    );
  });

  it('listMyRequests unwraps { items } envelope and passes submitterId', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(listEnvelope));

    const result = await client.listMyRequests('user@example.com');

    expect(result).toEqual([STUB_REQUEST]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('submitterId=user%40example.com'),
      expect.any(Object),
    );
  });

  it('listFailedRuns unwraps { items } envelope', async () => {
    const envelope = {
      items: [STUB_STATUS],
      pagination: { total: 1, page: 1, pageSize: 25, totalPages: 1 },
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(envelope));

    const result = await client.listFailedRuns();

    expect(result).toEqual([STUB_STATUS]);
  });

  it('listProvisioningRuns unwraps { items } envelope', async () => {
    const envelope = {
      items: [STUB_STATUS],
      pagination: { total: 1, page: 1, pageSize: 25, totalPages: 1 },
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(envelope));

    const result = await client.listProvisioningRuns();

    expect(result).toEqual([STUB_STATUS]);
  });
});

/* ------------------------------------------------------------------ */
/*  404 → null handling                                               */
/* ------------------------------------------------------------------ */

describe('getProvisioningStatus 404 handling', () => {
  it('returns null when backend responds 404', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Not found', code: 'NOT_FOUND' }, 404),
    );

    const result = await client.getProvisioningStatus('missing');

    expect(result).toBeNull();
  });

  it('propagates non-404 errors', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Server error', code: 'INTERNAL' }, 500),
    );

    await expect(client.getProvisioningStatus('p1')).rejects.toThrow(ApiError);
  });
});

/* ------------------------------------------------------------------ */
/*  Error handling                                                    */
/* ------------------------------------------------------------------ */

describe('error handling', () => {
  it('ApiError carries status and code from backend { message, code } envelope', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Validation failed', code: 'INVALID_INPUT' }, 400),
    );

    try {
      await client.submitRequest({});
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.message).toBe('Validation failed');
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('INVALID_INPUT');
    }
  });

  it('falls back to statusText when body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('not json')),
      headers: new Headers(),
    } as unknown as Response);

    await expect(client.listRequests()).rejects.toThrow('Bad Gateway');
  });
});

/* ------------------------------------------------------------------ */
/*  Void methods                                                      */
/* ------------------------------------------------------------------ */

describe('void methods', () => {
  it('retryProvisioning does not throw on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'ok' }, 202));
    await expect(client.retryProvisioning('p1')).resolves.toBeUndefined();
  });

  it('escalateProvisioning does not throw on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));
    await expect(client.escalateProvisioning('p1', 'admin@co.com')).resolves.toBeUndefined();
  });

  it('archiveFailure does not throw on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));
    await expect(client.archiveFailure('p1')).resolves.toBeUndefined();
  });

  it('acknowledgeEscalation does not throw on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));
    await expect(client.acknowledgeEscalation('p1')).resolves.toBeUndefined();
  });

  it('forceStateTransition does not throw on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));
    await expect(client.forceStateTransition('p1', 'Completed')).resolves.toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/*  Undefined base URL guard                                          */
/* ------------------------------------------------------------------ */

describe('undefined base URL behavior', () => {
  it('client created with undefined base URL produces invalid fetch URL', async () => {
    const badClient = createProvisioningApiClient(undefined as any, getToken);
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Not Found' }, 404));

    // The fetch URL will be "undefined/api/project-setup-requests"
    await badClient.listRequests().catch(() => {});
    if (fetchMock.mock.calls.length > 0) {
      const calledUrl = fetchMock.mock.calls[0][0];
      expect(calledUrl).toContain('undefined');
    }
  });

  it('client with empty string base URL produces /api/... relative URL', async () => {
    const badClient = createProvisioningApiClient('', getToken);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ items: [], pagination: { total: 0, page: 1, pageSize: 25, totalPages: 0 } }),
    );

    await badClient.listRequests();
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toBe('/api/project-setup-requests');
  });
});

/* ------------------------------------------------------------------ */
/*  Auth header                                                       */
/* ------------------------------------------------------------------ */

describe('auth header', () => {
  it('sends Bearer token on every request', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ items: [], pagination: { total: 0, page: 1, pageSize: 25, totalPages: 0 } }),
    );

    await client.listRequests();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
  });
});
