import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROJECT_PROFILES } from '@hbc/models/pcc';
import type { PccProjectId } from '@hbc/models/pcc';
import {
  createPccReadModelClient,
  resolvePccReadModelConfig,
} from './pccReadModelClientFactory.js';

const KNOWN_PROJECT_ID = SAMPLE_PROJECT_PROFILES[0]!.projectId;

const READ_MODEL_METHODS = [
  'getProjectProfile',
  'getModuleRegistry',
  'getProjectHome',
  'getPriorityActions',
  'getDocumentControl',
  'getExternalLinks',
  'getSiteHealth',
  'getTeamAccess',
  'getProjectReadiness',
  'getLifecycleReadiness',
] as const;

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn(() => {
    throw new Error('fetch must not be called by the Wave 4 Prompt 02 factory');
  });
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolvePccReadModelConfig', () => {
  it('defaults readModelMode to "fixture" when omitted', () => {
    expect(resolvePccReadModelConfig()).toEqual({
      readModelMode: 'fixture',
      backendBaseUrl: undefined,
      simulateBackendUnavailable: false,
    });
  });

  it('defaults simulateBackendUnavailable to false when omitted', () => {
    const resolved = resolvePccReadModelConfig({ readModelMode: 'fixture' });
    expect(resolved.simulateBackendUnavailable).toBe(false);
  });

  it('preserves explicit backend base URL and simulate flag', () => {
    const resolved = resolvePccReadModelConfig({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid/api/',
      simulateBackendUnavailable: true,
    });
    expect(resolved).toEqual({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid/api/',
      simulateBackendUnavailable: true,
    });
  });
});

describe('createPccReadModelClient — fixture default', () => {
  it('returns a client whose envelopes report mode="fixture" when no config is passed', async () => {
    const client = createPccReadModelClient();
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.sourceStatus).toBe('available');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns a client whose envelopes report mode="fixture" for explicit fixture mode', async () => {
    const client = createPccReadModelClient({ readModelMode: 'fixture' });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.sourceStatus).toBe('available');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('forwards simulateBackendUnavailable for fixture mode', async () => {
    const client = createPccReadModelClient({
      readModelMode: 'fixture',
      simulateBackendUnavailable: true,
    });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns fixture-mode lifecycle-readiness envelope without invoking fetch', async () => {
    const client = createPccReadModelClient();
    const env = await client.getLifecycleReadiness(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.sourceStatus).toBe('available');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('createPccReadModelClient — backend mode config-fallback (no fetch)', () => {
  it('does not invoke fetch when backendBaseUrl is missing', async () => {
    const client = createPccReadModelClient({ readModelMode: 'backend' });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not invoke fetch when backendBaseUrl is whitespace-only', async () => {
    const client = createPccReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: '   ',
    });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('createPccReadModelClient — backend mode wires the HTTP client', () => {
  it('invokes the global fetch with the configured base URL when backend mode + base URL are provided', async () => {
    const okEnvelope = {
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
    const okResponse = {
      ok: true,
      status: 200,
      json: async () => ({ data: okEnvelope }),
    } as unknown as Response;
    const okFetch = vi.fn().mockResolvedValue(okResponse);
    vi.stubGlobal('fetch', okFetch);

    const client = createPccReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid',
    });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(okFetch).toHaveBeenCalledTimes(1);
    expect(okFetch).toHaveBeenCalledWith(
      `https://example.invalid/api/pcc/projects/${encodeURIComponent(KNOWN_PROJECT_ID)}/home`,
      { method: 'GET' },
    );
  });
});

describe('createPccReadModelClient — IPccReadModelClient shape', () => {
  it('exposes all ten IPccReadModelClient methods returning thenables', () => {
    const client = createPccReadModelClient();
    for (const method of READ_MODEL_METHODS) {
      expect(typeof (client as unknown as Record<string, unknown>)[method]).toBe(
        'function',
      );
      const result = (client as unknown as Record<string, (id: PccProjectId) => unknown>)[
        method
      ]!(KNOWN_PROJECT_ID);
      expect(typeof (result as Promise<unknown>).then).toBe('function');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
