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
});

describe('createPccReadModelClient — backend non-cutover (Wave 4 Prompt 02)', () => {
  it('returns a fixture-backed client with backend-unavailable envelopes when backend mode is requested', async () => {
    const client = createPccReadModelClient({
      readModelMode: 'backend',
      backendBaseUrl: 'https://example.invalid/api/',
    });
    const envelopes = await Promise.all([
      client.getProjectProfile(KNOWN_PROJECT_ID),
      client.getModuleRegistry(KNOWN_PROJECT_ID),
      client.getProjectHome(KNOWN_PROJECT_ID),
      client.getPriorityActions(KNOWN_PROJECT_ID),
      client.getDocumentControl(KNOWN_PROJECT_ID),
      client.getExternalLinks(KNOWN_PROJECT_ID),
      client.getSiteHealth(KNOWN_PROJECT_ID),
    ]);
    for (const env of envelopes) {
      expect(env.mode).toBe('fixture');
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.warnings.length).toBeGreaterThan(0);
      expect(env.warnings[0]!.code).toBe('backend-unavailable');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not throw when backend mode is requested without backendBaseUrl', async () => {
    const client = createPccReadModelClient({ readModelMode: 'backend' });
    const env = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('createPccReadModelClient — IPccReadModelClient shape', () => {
  it('exposes all seven IPccReadModelClient methods returning thenables', () => {
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
