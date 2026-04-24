import { describe, expect, it, vi } from 'vitest';
import {
  createBackendEventSink,
  createNoopEventSink,
  createSharePointEventSink,
  mapEnvelopeToSharePointRow,
  FOLEON_EVENTS_TITLE,
} from '../FoleonEventSink.js';
import type { FoleonTelemetryEnvelope } from '../../types/foleon-event.types.js';

const TEST_LIST_ID = '11111111-1111-1111-1111-111111111111';

function envelope(
  overrides: Partial<FoleonTelemetryEnvelope> = {},
): FoleonTelemetryEnvelope {
  return {
    schemaVersion: 1,
    eventId: 'evt-1',
    eventName: 'Card Click',
    eventVersion: 1,
    occurredAtUtc: '2026-04-24T12:00:00.000Z',
    correlationId: 'corr-1',
    sessionId: 'sess-1',
    route: 'highlights',
    pageContext: 'Homepage',
    foleonDocId: 42,
    contentRegistryItemId: 7,
    packageVersion: '1.0.5.0',
    manifestId: 'mfst-1',
    privacyClass: 'telemetry-minimal',
    ...overrides,
  };
}

describe('FoleonEventSink — noop', () => {
  it('is always kind "noop" and resolves silently', async () => {
    const sink = createNoopEventSink();
    expect(sink.kind).toBe('noop');
    await expect(sink.send(envelope())).resolves.toBeUndefined();
  });
});

describe('FoleonEventSink — SharePoint', () => {
  it('POSTs to the items endpoint with a request digest and mapped body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('{}', { status: 201 }),
    );
    const fetchDigest = vi.fn().mockResolvedValue('digest-abc');
    const sink = createSharePointEventSink({
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      eventsListId: TEST_LIST_ID,
      fetchImpl,
      fetchDigest,
    });
    await sink.send(envelope());
    expect(fetchDigest).toHaveBeenCalledWith('https://tenant.sharepoint.com/sites/HBCentral');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(
      `https://tenant.sharepoint.com/sites/HBCentral/_api/web/lists(guid'${TEST_LIST_ID}')/items`,
    );
    const req = init as RequestInit;
    expect(req.method).toBe('POST');
    expect((req.headers as Record<string, string>)['X-RequestDigest']).toBe('digest-abc');
    const body = JSON.parse(req.body as string);
    expect(body.EventId).toBe('evt-1');
    expect(body.EventType).toBe('Card Click');
    expect(body.FoleonDocId).toBe(42);
    expect(body.SessionId).toBe('sess-1');
    expect(body.PageContext).toBe('Homepage');
    expect(body.SearchQuery).toBeNull();
    expect(typeof body.ClientInfoJson).toBe('string');
    expect(JSON.parse(body.ClientInfoJson).correlationId).toBe('corr-1');
  });

  it('rejects invalid list GUIDs at construction time', () => {
    expect(() =>
      createSharePointEventSink({
        siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
        eventsListId: 'not-a-guid',
      }),
    ).toThrow();
  });

  it('throws when the response is not ok', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('server error', { status: 500, statusText: 'Internal Server Error' }),
    );
    const fetchDigest = vi.fn().mockResolvedValue('digest');
    const sink = createSharePointEventSink({
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      eventsListId: TEST_LIST_ID,
      fetchImpl,
      fetchDigest,
    });
    await expect(sink.send(envelope())).rejects.toThrow(
      new RegExp(`^${FOLEON_EVENTS_TITLE} write failed:`),
    );
  });
});

describe('FoleonEventSink — mapEnvelopeToSharePointRow privacy', () => {
  it('never writes raw search text into SearchQuery', () => {
    const row = mapEnvelopeToSharePointRow(
      envelope({ eventName: 'Search', searchQueryLength: 12 }),
    );
    expect(row.SearchQuery).toBeNull();
    const client = JSON.parse(row.ClientInfoJson as string);
    expect(client.searchQueryLength).toBe(12);
  });

  it('carries gateResult, errorCode, originHash, correlationId in ClientInfoJson', () => {
    const row = mapEnvelopeToSharePointRow(
      envelope({
        eventName: 'Embed Error',
        gateResult: 'embed-disallowed',
        errorCode: 'reader.embed_error',
        originHash: 'abcd1234',
      }),
    );
    const client = JSON.parse(row.ClientInfoJson as string);
    expect(client.gateResult).toBe('embed-disallowed');
    expect(client.errorCode).toBe('reader.embed_error');
    expect(client.originHash).toBe('abcd1234');
    expect(client.correlationId).toBe('corr-1');
    expect(client.privacyClass).toBe('telemetry-minimal');
  });

  it('auto-generates Title with eventName and foleonDocId', () => {
    const row = mapEnvelopeToSharePointRow(envelope({ eventName: 'Card Click', foleonDocId: 99 }));
    expect(row.Title).toBe('Card Click 99');
  });
});

describe('FoleonEventSink — backend', () => {
  it('POSTs to /api/foleon/events with the raw envelope', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 202 }));
    const sink = createBackendEventSink({
      baseUrl: 'https://api.hbintel.example.com',
      fetchImpl,
    });
    const env = envelope();
    await sink.send(env);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.hbintel.example.com/api/foleon/events');
    expect((init as RequestInit).method).toBe('POST');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(env);
  });

  it('strips a trailing slash from the base URL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 202 }));
    const sink = createBackendEventSink({
      baseUrl: 'https://api.hbintel.example.com/',
      fetchImpl,
    });
    await sink.send(envelope());
    expect(fetchImpl.mock.calls[0]![0]).toBe(
      'https://api.hbintel.example.com/api/foleon/events',
    );
  });

  it('throws when the backend returns non-ok', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('rate limited', { status: 429, statusText: 'Too Many Requests' }),
    );
    const sink = createBackendEventSink({
      baseUrl: 'https://api.hbintel.example.com',
      fetchImpl,
    });
    await expect(sink.send(envelope())).rejects.toThrow(/foleon backend events write failed/);
  });
});
