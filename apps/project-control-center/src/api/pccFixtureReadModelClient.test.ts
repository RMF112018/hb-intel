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
