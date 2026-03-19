import { describe, it, expect, vi, afterEach } from 'vitest';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { AuthContext } from '../middleware/auth.js';
import { withTelemetry } from './withTelemetry.js';

const loggedEvents: Array<{ name: string; properties: Record<string, unknown> }> = [];

vi.mock('./logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackEvent: (name: string, properties: Record<string, unknown>) => {
      loggedEvents.push({ name, properties });
    },
    trackMetric: vi.fn(),
  }),
}));

const makeRequest = (method: string, requestId?: string): HttpRequest =>
  ({
    method,
    headers: {
      get: (name: string) => (name === 'X-Request-Id' ? requestId ?? null : null),
    },
  }) as unknown as HttpRequest;

const makeContext = (): InvocationContext => ({}) as unknown as InvocationContext;

const makeAuth = (): AuthContext => ({
  userToken: 'test-token',
  claims: { upn: 'user@hb.com', oid: 'oid-1', roles: [], displayName: 'User', jobTitle: undefined },
});

const meta = { domain: 'leads', operation: 'getLeads' };

afterEach(() => {
  loggedEvents.length = 0;
});

describe('P1-C3 withTelemetry', () => {
  it('emits handler.invoke on entry with meta and correlationId', async () => {
    const handler = vi.fn().mockResolvedValue({ status: 200, jsonBody: {} } as HttpResponseInit);
    const wrapped = withTelemetry(handler, meta);
    await wrapped(makeRequest('GET', 'req-123'), makeContext(), makeAuth());

    const invokeEvent = loggedEvents.find((e) => e.name === 'handler.invoke');
    expect(invokeEvent).toBeDefined();
    expect(invokeEvent!.properties.domain).toBe('leads');
    expect(invokeEvent!.properties.operation).toBe('getLeads');
    expect(invokeEvent!.properties.correlationId).toBe('req-123');
    expect(invokeEvent!.properties.method).toBe('GET');
  });

  it('emits handler.success with durationMs and statusCode on success', async () => {
    const handler = vi.fn().mockResolvedValue({ status: 201, jsonBody: {} } as HttpResponseInit);
    const wrapped = withTelemetry(handler, meta);
    await wrapped(makeRequest('POST'), makeContext(), makeAuth());

    const successEvent = loggedEvents.find((e) => e.name === 'handler.success');
    expect(successEvent).toBeDefined();
    expect(successEvent!.properties.statusCode).toBe(201);
    expect(typeof successEvent!.properties.durationMs).toBe('number');
    expect(successEvent!.properties.domain).toBe('leads');
  });

  it('emits handler.error with errorCode and errorMessage, then re-throws', async () => {
    const error = Object.assign(new Error('Something broke'), { code: 'SERVER_ERROR' });
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = withTelemetry(handler, meta);

    await expect(wrapped(makeRequest('POST'), makeContext(), makeAuth())).rejects.toThrow('Something broke');

    const errorEvent = loggedEvents.find((e) => e.name === 'handler.error');
    expect(errorEvent).toBeDefined();
    expect(errorEvent!.properties.errorCode).toBe('SERVER_ERROR');
    expect(errorEvent!.properties.errorMessage).toBe('Something broke');
    expect(typeof errorEvent!.properties.durationMs).toBe('number');
  });

  it('uses X-Request-Id from request header as correlationId', async () => {
    const handler = vi.fn().mockResolvedValue({ status: 200 } as HttpResponseInit);
    const wrapped = withTelemetry(handler, meta);
    await wrapped(makeRequest('GET', 'custom-correlation-id'), makeContext(), makeAuth());

    const invokeEvent = loggedEvents.find((e) => e.name === 'handler.invoke');
    expect(invokeEvent!.properties.correlationId).toBe('custom-correlation-id');
  });

  it('generates UUID correlationId when header absent', async () => {
    const handler = vi.fn().mockResolvedValue({ status: 200 } as HttpResponseInit);
    const wrapped = withTelemetry(handler, meta);
    await wrapped(makeRequest('GET'), makeContext(), makeAuth());

    const invokeEvent = loggedEvents.find((e) => e.name === 'handler.invoke');
    const id = invokeEvent!.properties.correlationId as string;
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
