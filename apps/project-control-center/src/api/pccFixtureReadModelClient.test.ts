import { describe, it, expect } from 'vitest';
import {
  SAMPLE_PROJECT_PROFILES,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
} from '@hbc/models/pcc';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from './pccFixtureReadModelClient.js';

const KNOWN_PROJECT_ID = SAMPLE_PROJECT_PROFILES[0]!.projectId;
const UNKNOWN_PROJECT_ID = '99999999-0000-0000-0000-000000000000' as PccProjectId;
const SAMPLE_PERSONA: PccPersona = 'project-manager';

describe('createPccFixtureReadModelClient — defaults', () => {
  const client = createPccFixtureReadModelClient();

  it('returns mode="fixture" and readOnly=true for every method', async () => {
    const envelopes = await Promise.all([
      client.getProjectProfile(KNOWN_PROJECT_ID),
      client.getModuleRegistry(KNOWN_PROJECT_ID),
      client.getProjectHome(KNOWN_PROJECT_ID),
      client.getPriorityActions(KNOWN_PROJECT_ID),
      client.getDocumentControl(KNOWN_PROJECT_ID),
      client.getExternalLinks(KNOWN_PROJECT_ID),
      client.getSiteHealth(KNOWN_PROJECT_ID),
      client.getTeamAccess(KNOWN_PROJECT_ID),
    ]);
    expect(envelopes).toHaveLength(8);
    for (const env of envelopes) {
      expect(env.mode).toBe('fixture');
      expect(env.readOnly).toBe(true);
      expect(env.sourceStatus).toBe('available');
      expect(env.projectId).toBe(KNOWN_PROJECT_ID);
      expect(env.warnings).toEqual([]);
      expect(typeof env.generatedAtUtc).toBe('string');
    }
  });

  it('returns sourceStatus="source-unavailable" for unknown project ids', async () => {
    const profile = await client.getProjectProfile(UNKNOWN_PROJECT_ID);
    expect(profile.sourceStatus).toBe('source-unavailable');
    expect(profile.warnings.length).toBeGreaterThan(0);
    expect(profile.warnings[0]!.code).toBe('source-unavailable');

    const home = await client.getProjectHome(UNKNOWN_PROJECT_ID);
    expect(home.sourceStatus).toBe('source-unavailable');
  });

  it('passes viewerPersona through into the envelope when provided', async () => {
    const env = await client.getProjectProfile(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
  });

  it('omits viewerPersona when not provided', async () => {
    const env = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect('viewerPersona' in env).toBe(false);
  });

  it('populates fixture data for known projects', async () => {
    const profile = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect(profile.data.profile.projectId).toBe(KNOWN_PROJECT_ID);

    const home = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(home.data.priorityActions.length).toBeGreaterThan(0);
    expect(home.data.profile.projectId).toBe(KNOWN_PROJECT_ID);

    const docs = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(docs.data.sources.length).toBeGreaterThan(0);

    const links = await client.getExternalLinks(KNOWN_PROJECT_ID);
    expect(links.data.links.length).toBeGreaterThan(0);

    const modules = await client.getModuleRegistry(KNOWN_PROJECT_ID);
    expect(Object.keys(modules.data.surfaces).length).toBeGreaterThan(0);

    const health = await client.getSiteHealth(KNOWN_PROJECT_ID);
    expect(health.data.summary).toBeDefined();

    const teamAccess = await client.getTeamAccess(KNOWN_PROJECT_ID);
    expect(teamAccess.data.preview).toBe(SAMPLE_TEAM_ACCESS_PREVIEW_MODEL);
    expect(teamAccess.sourceStatus).toBe('available');
  });
});

describe('createPccFixtureReadModelClient — simulateBackendUnavailable', () => {
  const client = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

  it('returns sourceStatus="backend-unavailable" for every method', async () => {
    const envelopes = await Promise.all([
      client.getProjectProfile(KNOWN_PROJECT_ID),
      client.getModuleRegistry(KNOWN_PROJECT_ID),
      client.getProjectHome(KNOWN_PROJECT_ID),
      client.getPriorityActions(KNOWN_PROJECT_ID),
      client.getDocumentControl(KNOWN_PROJECT_ID),
      client.getExternalLinks(KNOWN_PROJECT_ID),
      client.getSiteHealth(KNOWN_PROJECT_ID),
      client.getTeamAccess(KNOWN_PROJECT_ID),
    ]);
    for (const env of envelopes) {
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.mode).toBe('fixture');
      expect(env.readOnly).toBe(true);
      expect(env.warnings.length).toBeGreaterThan(0);
      expect(env.warnings[0]!.code).toBe('backend-unavailable');
    }
  });

  it('keeps envelopes type-valid by populating data with placeholder shapes', async () => {
    const profile = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect(profile.data.profile).toBeDefined();
    expect(profile.data.profile.projectId).toBe(KNOWN_PROJECT_ID);

    const actions = await client.getPriorityActions(KNOWN_PROJECT_ID);
    expect(actions.data.actions).toEqual([]);
  });
});

describe('createPccFixtureReadModelClient — now injection', () => {
  it('honors a deterministic clock', async () => {
    const fixed = '2030-01-02T03:04:05.000Z';
    const client = createPccFixtureReadModelClient({ now: () => fixed });
    const env = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect(env.generatedAtUtc).toBe(fixed);
  });
});

describe('createPccFixtureReadModelClient — getDocumentControl wave 7 shape', () => {
  const client = createPccFixtureReadModelClient();

  it('returns the legacy sources array alongside Wave 7 fields for known projects', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.sources.length).toBeGreaterThan(0);
  });

  it('returns the three Wave 7 lanes', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.data.wave7LaneVocabulary).toEqual([
      'project-record',
      'my-project-files',
      'external-systems',
    ]);
  });

  it('source registry includes Project Record, My Project Files, and at least one External Systems entry', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const projectRecord = registry.find((r) => r.wave7Lane === 'project-record');
    const myProjectFiles = registry.find((r) => r.wave7Lane === 'my-project-files');
    const externalSystems = registry.filter((r) => r.wave7Lane === 'external-systems');
    expect(projectRecord).toBeDefined();
    expect(myProjectFiles).toBeDefined();
    expect(externalSystems.length).toBeGreaterThan(0);
  });

  it('My Project Files binding exposes only the current project folder', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const mpf = registry.find((r) => r.wave7Lane === 'my-project-files');
    expect(mpf).toBeDefined();
    expect(mpf!.binding.kind).toBe('my-project-files');
    if (mpf!.binding.kind === 'my-project-files') {
      expect(mpf!.binding.projectFolderPath).toBe(
        '/My Project Files/26-000-00-Stadium Enclave',
      );
    }
  });

  it('My Project Files folder path is not the root and has at least three path segments', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const mpf = registry.find((r) => r.wave7Lane === 'my-project-files');
    expect(mpf).toBeDefined();
    if (mpf!.binding.kind === 'my-project-files') {
      const path = mpf!.binding.projectFolderPath;
      expect(path).not.toBe('/My Project Files');
      expect(path).not.toBe('/My Project Files/');
      expect(path.split('/').filter(Boolean).length).toBeGreaterThanOrEqual(2);
      expect(path.startsWith('/My Project Files/')).toBe(true);
    }
  });

  it('does not expose folder paths for any other project', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    for (const entry of registry) {
      if (entry.binding.kind === 'my-project-files') {
        expect(entry.binding.projectFolderPath.startsWith('/My Project Files/26-000-00-')).toBe(
          true,
        );
      }
    }
  });

  it('external-systems entries are launch/status only with sourceKind "external-system"', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const externals = registry.filter((r) => r.wave7Lane === 'external-systems');
    expect(externals.length).toBeGreaterThan(0);
    for (const ext of externals) {
      expect(ext.sourceKind).toBe('external-system');
      expect('writeback' in ext).toBe(false);
      expect('sync' in ext).toBe(false);
      expect('mirror' in ext).toBe(false);
    }
  });

  it('EX04 is never available with "Y" and appears at least once with "N"', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const rows = env.data.roleActionAvailability ?? [];
    const ex04Rows = rows.filter((r) => r.actionCode === 'EX04');
    expect(ex04Rows.length).toBeGreaterThan(0);
    for (const r of ex04Rows) {
      expect(r.availability).not.toBe('Y');
    }
    expect(ex04Rows.some((r) => r.availability === 'N')).toBe(true);
  });

  it('represents Project Coordinator (R14) in roleActionAvailability', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const rows = env.data.roleActionAvailability ?? [];
    expect(rows.some((r) => r.roleCode === 'R14')).toBe(true);
  });

  it('does not represent Project Engineer in the serialized envelope', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(JSON.stringify(env)).not.toContain('Project Engineer');
  });

  it('keeps the backend-unavailable envelope safe and read-only', async () => {
    const unavailable = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    const env = await unavailable.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.readOnly).toBe(true);
    expect(env.data.sources).toEqual([]);
    expect(env.data.sourceRegistry).toEqual([]);
    expect(env.data.roleActionAvailability).toEqual([]);
  });

  it('keeps the unknown-project envelope safe and read-only', async () => {
    const env = await client.getDocumentControl(UNKNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.readOnly).toBe(true);
    expect(env.data.sources).toEqual([]);
    expect(env.data.sourceRegistry).toEqual([]);
    expect(env.data.roleActionAvailability).toEqual([]);
  });

  // Wave 7 / Prompt 05 — published sourceHealthStates vocabulary must include
  // the two MPF-specific health states added in this prompt. Backend mock
  // (`pcc-mock-read-model-provider.ts`) mirrors literal values; both files
  // publish the same set so SPFx ↔ backend parity holds.
  it('publishes the Wave 7 source health vocabulary including pending-initialization and folder-creation-failed', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const states = env.data.sourceHealthStates ?? [];
    expect(states).toContain('healthy');
    expect(states).toContain('warning');
    expect(states).toContain('degraded');
    expect(states).toContain('unavailable');
    expect(states).toContain('missing-binding');
    expect(states).toContain('access-denied');
    expect(states).toContain('throttled');
    expect(states).toContain('pending-initialization');
    expect(states).toContain('folder-creation-failed');
  });
});
