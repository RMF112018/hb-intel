import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADOBE_SIGN_QUEUE_AVAILABLE, MY_WORK_HOME_AVAILABLE } from '@hbc/models/myWork/fixtures';

import { _resetConfig, setRuntimeConfig } from '../config/runtimeConfig.js';

import type { MyWorkReadModelFetch } from './myWorkBackendReadModelClient.js';
import { createMyWorkReadModelClient } from './myWorkReadModelClientFactory.js';

const makeJsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  _resetConfig();
});

afterEach(() => {
  _resetConfig();
});

describe('createMyWorkReadModelClient — default and explicit fixture mode', () => {
  it('defaults to fixture mode when runtime mode is ui-review', async () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    const client = createMyWorkReadModelClient();
    const envelope = await client.getMyWorkHome();
    expect(envelope.mode).toBe('fixture');
    expect(envelope.sourceStatus).toBe('available');
  });

  it('returns the AVAILABLE envelope when explicit fixture mode is requested', async () => {
    const client = createMyWorkReadModelClient({ readModelMode: 'fixture' });
    const home = await client.getMyWorkHome();
    const queue = await client.getAdobeSignActionQueue();
    expect(home.sourceStatus).toBe('available');
    expect(queue.sourceStatus).toBe('available');
  });

  it('returns BACKEND_UNAVAILABLE envelopes when simulateBackendUnavailable is set in fixture mode', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'fixture',
      simulateBackendUnavailable: true,
    });
    const home = await client.getMyWorkHome();
    const queue = await client.getAdobeSignActionQueue();
    expect(home.sourceStatus).toBe('backend-unavailable');
    expect(queue.sourceStatus).toBe('backend-unavailable');
  });
});

describe('createMyWorkReadModelClient — backend mode dispatch', () => {
  it('routes to the backend client when URL and getApiToken are supplied', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_WORK_HOME_AVAILABLE }));
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
    });
    const envelope = await client.getMyWorkHome();
    expect(envelope).toEqual({ ...MY_WORK_HOME_AVAILABLE, dataPath: 'backend-live' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url] = fetchSpy.mock.calls[0]!;
    expect(url).toContain('/api/my-work/me/');
  });

  it('falls back to backend-unavailable fixture when backend mode lacks a base URL', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      getApiToken: async () => 'tok',
    });
    const envelope = await client.getMyWorkHome();
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.mode).toBe('fixture');
  });

  it('falls back to backend-unavailable fixture when backend mode lacks a getApiToken', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid',
    });
    const envelope = await client.getMyWorkHome();
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.mode).toBe('fixture');
  });

  it('resolves the base URL from runtime config when no explicit URL is supplied', async () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://runtime.example.invalid',
    });
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: ADOBE_SIGN_QUEUE_AVAILABLE }));
    const client = createMyWorkReadModelClient({
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
    });
    await client.getAdobeSignActionQueue();
    const [url] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://runtime.example.invalid/api/my-work/me/adobe-sign/action-queue');
  });
});

describe('createMyWorkReadModelClient — clock override propagation', () => {
  it('threads the now() callback through the fixture client', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'fixture',
      now: () => '2030-06-15T00:00:00.000Z',
    });
    const envelope = await client.getMyWorkHome();
    expect(envelope.generatedAtUtc).toBe('2030-06-15T00:00:00.000Z');
  });

  it('threads the now() callback through the backend-unavailable fallback path', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      now: () => '2030-06-15T00:00:00.000Z',
    });
    const envelope = await client.getMyWorkHome();
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.generatedAtUtc).toBe('2030-06-15T00:00:00.000Z');
  });
});

describe('createMyWorkReadModelClient — data-path classification', () => {
  it('stamps fixture-ui-review on the explicit fixture/ui-review mode', async () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    const client = createMyWorkReadModelClient();
    const home = await client.getMyWorkHome();
    const queue = await client.getAdobeSignActionQueue();
    expect(home.dataPath).toBe('fixture-ui-review');
    expect(queue.dataPath).toBe('fixture-ui-review');
  });

  it('stamps fixture-ui-review when explicit readModelMode:"fixture" is requested', async () => {
    const client = createMyWorkReadModelClient({ readModelMode: 'fixture' });
    const home = await client.getMyWorkHome();
    expect(home.dataPath).toBe('fixture-ui-review');
  });

  it('stamps fixture-ui-review even when ui-review mode also requests simulateBackendUnavailable', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'fixture',
      simulateBackendUnavailable: true,
    });
    const home = await client.getMyWorkHome();
    expect(home.sourceStatus).toBe('backend-unavailable');
    expect(home.dataPath).toBe('fixture-ui-review');
  });

  it('stamps backend-unavailable-fallback when production posture is missing a backend base URL', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      getApiToken: async () => 'tok',
    });
    const home = await client.getMyWorkHome();
    expect(home.dataPath).toBe('backend-unavailable-fallback');
  });

  it('stamps backend-unavailable-fallback when production posture is missing the token provider', async () => {
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid',
    });
    const home = await client.getMyWorkHome();
    expect(home.dataPath).toBe('backend-unavailable-fallback');
  });

  it('stamps backend-live when the backend responds successfully', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_WORK_HOME_AVAILABLE }));
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
    });
    const home = await client.getMyWorkHome();
    expect(home.dataPath).toBe('backend-live');
  });

  it('stamps backend-unavailable-fallback when production-mode backend fetch fails', async () => {
    const fetchSpy = vi.fn<MyWorkReadModelFetch>().mockRejectedValue(new Error('network down'));
    const client = createMyWorkReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
    });
    const home = await client.getMyWorkHome();
    expect(home.dataPath).toBe('backend-unavailable-fallback');
    expect(home.sourceStatus).toBe('backend-unavailable');
  });
});
