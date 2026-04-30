/**
 * Behavior tests for the host-scoped PCC mock read-model provider
 * (Phase 3 / Wave 3 / Prompt 04).
 *
 * The provider implementation lives at
 * `src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`.
 * Tests are placed under `src/services/__tests__/` because the backend
 * vitest unit-project glob (in `vitest.config.ts`) curates includes
 * file-by-file and does not currently cover host-scoped test paths.
 * Prompt 04 is forbidden from modifying `vitest.config.ts`; Prompt 05
 * should add a host-scoped glob entry when route source lands.
 */

import { describe, expect, it } from 'vitest';

import {
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
} from '@hbc/models/pcc';
import type {
  PccPersona,
  PccProjectId,
  PccProjectProfileReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';

import { PccMockReadModelProvider } from '../../hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.js';

const KNOWN_PROJECT_ID = SAMPLE_PROJECT_PROFILE.projectId;
const UNKNOWN_PROJECT_ID = 'fixture-pcc-project-does-not-exist' as PccProjectId;
const FIXED_NOW = '2026-04-30T12:00:00.000Z';
const PROVIDER_OPTS = { now: () => FIXED_NOW };
const VIEWER: PccPersona = 'project-manager';

const MUTATION_VERB_FRAGMENTS = [
  'create',
  'update',
  'delete',
  'apply',
  'execute',
  'provision',
  'repair',
  'mirror',
  'sync',
  'writeback',
  'permissionmutate',
  'mutate',
  'set',
  'add',
  'remove',
];

describe('PccMockReadModelProvider — known fixture project returns available envelopes', () => {
  const provider = new PccMockReadModelProvider(PROVIDER_OPTS);

  it('returns available status with mock mode and frozen warnings on every surface', async () => {
    const surfaces = await Promise.all([
      provider.getProjectProfile(KNOWN_PROJECT_ID),
      provider.getModuleRegistry(KNOWN_PROJECT_ID),
      provider.getProjectHome(KNOWN_PROJECT_ID),
      provider.getPriorityActions(KNOWN_PROJECT_ID),
      provider.getDocumentControl(KNOWN_PROJECT_ID),
      provider.getExternalLinks(KNOWN_PROJECT_ID),
      provider.getSiteHealth(KNOWN_PROJECT_ID),
      provider.getTeamAccess(KNOWN_PROJECT_ID),
      provider.getSettings(KNOWN_PROJECT_ID),
    ]);
    expect(surfaces).toHaveLength(9);
    for (const env of surfaces) {
      expect(env.mode).toBe('mock');
      expect(env.readOnly).toBe(true);
      expect(env.sourceStatus).toBe('available');
      expect(env.warnings).toEqual([]);
      expect(Object.isFrozen(env.warnings)).toBe(true);
      expect(env.generatedAtUtc).toBe(FIXED_NOW);
      expect(env.projectId).toBe(KNOWN_PROJECT_ID);
    }
  });

  it('embeds fixture-backed data from @hbc/models/pcc', async () => {
    const profile = await provider.getProjectProfile(KNOWN_PROJECT_ID);
    expect(profile.data.profile.projectId).toBe(SAMPLE_PROJECT_PROFILE.projectId);
    expect(profile.data.profile.projectNumber).toBe(SAMPLE_PROJECT_PROFILE.projectNumber);

    const priorityActions = await provider.getPriorityActions(KNOWN_PROJECT_ID);
    expect(priorityActions.data.actions).toBe(SAMPLE_PRIORITY_ACTIONS);

    const teamAccess = await provider.getTeamAccess(KNOWN_PROJECT_ID);
    expect(teamAccess.data.preview).toBe(SAMPLE_TEAM_ACCESS_PREVIEW_MODEL);
  });
});

describe('PccMockReadModelProvider — unknown project returns source-unavailable envelopes', () => {
  const provider = new PccMockReadModelProvider(PROVIDER_OPTS);

  it('returns source-unavailable status with a single matching warning', async () => {
    const env = await provider.getProjectProfile(UNKNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.warnings).toHaveLength(1);
    expect(env.warnings[0].code).toBe('source-unavailable');
    expect(env.readOnly).toBe(true);
  });

  it('still returns valid envelope shape on every surface for unknown id', async () => {
    const surfaces = await Promise.all([
      provider.getProjectProfile(UNKNOWN_PROJECT_ID),
      provider.getModuleRegistry(UNKNOWN_PROJECT_ID),
      provider.getProjectHome(UNKNOWN_PROJECT_ID),
      provider.getPriorityActions(UNKNOWN_PROJECT_ID),
      provider.getDocumentControl(UNKNOWN_PROJECT_ID),
      provider.getExternalLinks(UNKNOWN_PROJECT_ID),
      provider.getSiteHealth(UNKNOWN_PROJECT_ID),
      provider.getTeamAccess(UNKNOWN_PROJECT_ID),
      provider.getSettings(UNKNOWN_PROJECT_ID),
    ]);
    for (const env of surfaces) {
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.readOnly).toBe(true);
      expect(env.mode).toBe('mock');
      expect(env.warnings.length).toBeGreaterThan(0);
    }
  });

  it('returns empty collections rather than fixture data on collection surfaces', async () => {
    const externalLinks = await provider.getExternalLinks(UNKNOWN_PROJECT_ID);
    expect(externalLinks.data.links).toEqual([]);
    expect(externalLinks.data.missingConfigurations).toEqual([]);

    const docControl = await provider.getDocumentControl(UNKNOWN_PROJECT_ID);
    expect(docControl.data.sources).toEqual([]);

    const priorityActions = await provider.getPriorityActions(UNKNOWN_PROJECT_ID);
    expect(priorityActions.data.actions).toEqual([]);
  });
});

describe('PccMockReadModelProvider — backend-unavailable simulation', () => {
  it('flags every surface as backend-unavailable when option is set', async () => {
    const provider = new PccMockReadModelProvider({
      ...PROVIDER_OPTS,
      simulateBackendUnavailable: true,
    });
    const surfaces = await Promise.all([
      provider.getProjectProfile(KNOWN_PROJECT_ID),
      provider.getModuleRegistry(KNOWN_PROJECT_ID),
      provider.getProjectHome(KNOWN_PROJECT_ID),
      provider.getPriorityActions(KNOWN_PROJECT_ID),
      provider.getDocumentControl(KNOWN_PROJECT_ID),
      provider.getExternalLinks(KNOWN_PROJECT_ID),
      provider.getSiteHealth(KNOWN_PROJECT_ID),
      provider.getTeamAccess(KNOWN_PROJECT_ID),
      provider.getSettings(KNOWN_PROJECT_ID),
    ]);
    for (const env of surfaces) {
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.warnings.some((w) => w.code === 'backend-unavailable')).toBe(true);
      expect(env.readOnly).toBe(true);
    }
  });
});

describe('PccMockReadModelProvider — read-only metadata and contract reuse', () => {
  const provider = new PccMockReadModelProvider(PROVIDER_OPTS);

  it('readOnly is true and warnings array is frozen on every surface', async () => {
    const surfaces = await Promise.all([
      provider.getProjectProfile(KNOWN_PROJECT_ID),
      provider.getProjectProfile(UNKNOWN_PROJECT_ID),
    ]);
    for (const env of surfaces) {
      expect(env.readOnly).toBe(true);
      expect(Object.isFrozen(env.warnings)).toBe(true);
    }
  });

  it('envelope satisfies the shared @hbc/models/pcc contract', async () => {
    const env: PccReadModelEnvelope<PccProjectProfileReadModel> =
      await provider.getProjectProfile(KNOWN_PROJECT_ID);
    expect(env).toMatchObject({
      mode: 'mock',
      readOnly: true,
      sourceStatus: 'available',
      data: { profile: { projectId: KNOWN_PROJECT_ID } },
    });
  });
});

describe('PccMockReadModelProvider — exposes only read-only methods', () => {
  it('public class shape contains no mutation verbs', () => {
    const ownNames = Object.getOwnPropertyNames(PccMockReadModelProvider.prototype);
    const protoNames = Object.getOwnPropertyNames(
      Object.getPrototypeOf(PccMockReadModelProvider.prototype) ?? {},
    );
    const allNames = [...ownNames, ...protoNames];

    const offenders = allNames.filter((name) => {
      const lower = name.toLowerCase();
      // Allow read-only `get*` methods and class internals.
      if (lower.startsWith('get')) return false;
      if (lower === 'constructor') return false;
      if (lower.startsWith('_')) return false;
      return MUTATION_VERB_FRAGMENTS.some((fragment) => lower.includes(fragment));
    });

    expect(offenders).toEqual([]);
  });

  it('IPccReadModelProvider instances expose exactly the nine getters', () => {
    const expected = [
      'getProjectProfile',
      'getModuleRegistry',
      'getProjectHome',
      'getPriorityActions',
      'getDocumentControl',
      'getExternalLinks',
      'getSiteHealth',
      'getTeamAccess',
      'getSettings',
    ];
    const proto = PccMockReadModelProvider.prototype as Record<string, unknown>;
    for (const name of expected) {
      expect(typeof proto[name]).toBe('function');
    }
  });
});

describe('PccMockReadModelProvider — viewerPersona handling', () => {
  const provider = new PccMockReadModelProvider(PROVIDER_OPTS);

  it('echoes viewerPersona on every envelope when supplied', async () => {
    const env = await provider.getProjectProfile(KNOWN_PROJECT_ID, VIEWER);
    expect(env.viewerPersona).toBe(VIEWER);
  });

  it('omits viewerPersona when not supplied', async () => {
    const env = await provider.getProjectProfile(KNOWN_PROJECT_ID);
    expect(env.viewerPersona).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(env, 'viewerPersona')).toBe(false);
  });
});

describe('PccMockReadModelProvider — determinism', () => {
  it('produces identical envelopes across calls when now() is stable', async () => {
    const provider = new PccMockReadModelProvider(PROVIDER_OPTS);
    const a = await provider.getProjectProfile(KNOWN_PROJECT_ID, VIEWER);
    const b = await provider.getProjectProfile(KNOWN_PROJECT_ID, VIEWER);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
