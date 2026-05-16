import { describe, expect, it, vi } from 'vitest';

import { MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS } from '@hbc/models/myWork';

import {
  createGraphListFieldQuery,
  formatReport,
  main,
  parseArgs,
  selectExitCode,
  type IListFieldQuery,
} from './verify-my-project-role-fields';
import type { ListFieldSnapshot } from '../backend/functions/src/services/projects-role-schema-readiness';

const NOW = '2026-05-13T00:00:00.000Z';

function liveProjectsSnapshot(): ListFieldSnapshot[] {
  return [
    ...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS.map((internalName) => ({
      internalName,
      typeAsString: 'Note',
    })),
    { internalName: 'buildingConnectedUrl', typeAsString: 'Text' },
    { internalName: 'documentCrunchUrl', typeAsString: 'Text' },
  ];
}

function liveRegistrySnapshot(): ListFieldSnapshot[] {
  return [
    ...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS.map((internalName) => ({
      internalName,
      typeAsString: 'Note',
    })),
    { internalName: 'procoreProject', typeAsString: 'Text' },
    { internalName: 'buildingConnectedUrl', typeAsString: 'Text' },
    { internalName: 'documentCrunchUrl', typeAsString: 'Text' },
    { internalName: 'projectStage', typeAsString: 'Text' },
  ];
}

function stubQuery(map: Record<string, readonly ListFieldSnapshot[]>): IListFieldQuery {
  return {
    listFields: vi.fn(async (listTitle: string) => map[listTitle] ?? []),
  };
}

describe('parseArgs', () => {
  it('returns json:false by default', () => {
    expect(parseArgs([])).toEqual({ json: false });
  });

  it('parses --json', () => {
    expect(parseArgs(['--json'])).toEqual({ json: true });
  });

  it('rejects --apply because the script is read-only', () => {
    expect(() => parseArgs(['--apply'])).toThrow(/read-only/);
  });
});

describe('selectExitCode', () => {
  it('returns 0 when the report is ready', () => {
    expect(
      selectExitCode({
        ready: true,
        generatedAtUtc: NOW,
        projects: { listName: 'Projects', ready: true, entries: [] },
        legacyRegistry: { listName: 'Legacy', ready: true, entries: [] },
      }),
    ).toBe(0);
  });

  it('returns 1 when the report is not ready', () => {
    expect(
      selectExitCode({
        ready: false,
        generatedAtUtc: NOW,
        projects: { listName: 'Projects', ready: false, entries: [] },
        legacyRegistry: { listName: 'Legacy', ready: true, entries: [] },
      }),
    ).toBe(1);
  });
});

describe('formatReport', () => {
  it('serializes to JSON when asJson is true', () => {
    const report = {
      ready: true,
      generatedAtUtc: NOW,
      projects: { listName: 'Projects', ready: true, entries: [] },
      legacyRegistry: { listName: 'Legacy Project Fallback Registry', ready: true, entries: [] },
    } as const;
    const serialized = formatReport(report, true);
    expect(JSON.parse(serialized)).toEqual(report);
  });

  it('produces a human-readable text block when asJson is false', () => {
    const report = {
      ready: false,
      generatedAtUtc: NOW,
      projects: {
        listName: 'Projects',
        ready: false,
        entries: [
          {
            internalName: 'projectManagerUpns',
            expectedTypeAsString: 'Note',
            observedTypeAsString: null,
            state: 'missing' as const,
          },
        ],
      },
      legacyRegistry: { listName: 'Legacy Project Fallback Registry', ready: true, entries: [] },
    };
    const text = formatReport(report, false);
    expect(text).toContain('schema readiness');
    expect(text).toContain('ready: false');
    expect(text).toContain('projectManagerUpns');
    expect(text).toContain('state=missing');
    expect(text).toContain('observed=(absent)');
  });
});

describe('main', () => {
  it('returns 0 and emits a ready report when both lists are live-verified', async () => {
    const stdoutLines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: stubQuery({
          Projects: liveProjectsSnapshot(),
          'Legacy Project Fallback Registry': liveRegistrySnapshot(),
        }),
        now: () => NOW,
        stdout: (line) => stdoutLines.push(line),
      },
    );
    expect(code).toBe(0);
    expect(stdoutLines).toHaveLength(1);
    const parsed = JSON.parse(stdoutLines[0]!);
    expect(parsed.ready).toBe(true);
    expect(parsed.projects.ready).toBe(true);
    expect(parsed.legacyRegistry.ready).toBe(true);
  });

  it('returns 1 and reports the missing field when Projects is missing a canonical column', async () => {
    const stdoutLines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: stubQuery({
          Projects: liveProjectsSnapshot().filter((f) => f.internalName !== 'projectManagerUpns'),
          'Legacy Project Fallback Registry': liveRegistrySnapshot(),
        }),
        now: () => NOW,
        stdout: (line) => stdoutLines.push(line),
      },
    );
    expect(code).toBe(1);
    const parsed = JSON.parse(stdoutLines[0]!);
    expect(parsed.ready).toBe(false);
    const entry = parsed.projects.entries.find(
      (e: { internalName: string }) => e.internalName === 'projectManagerUpns',
    );
    expect(entry.state).toBe('missing');
  });

  it('returns 1 and reports buildingConnectedUrl missing on Projects', async () => {
    const stdoutLines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: stubQuery({
          Projects: liveProjectsSnapshot().filter((f) => f.internalName !== 'buildingConnectedUrl'),
          'Legacy Project Fallback Registry': liveRegistrySnapshot(),
        }),
        now: () => NOW,
        stdout: (line) => stdoutLines.push(line),
      },
    );
    expect(code).toBe(1);
    const parsed = JSON.parse(stdoutLines[0]!);
    expect(parsed.ready).toBe(false);
    const entry = parsed.projects.entries.find(
      (e: { internalName: string }) => e.internalName === 'buildingConnectedUrl',
    );
    expect(entry.state).toBe('missing');
    expect(entry.expectedTypeAsString).toBe('Text');
  });

  it('returns 1 and reports projectStage missing on the Legacy Registry', async () => {
    const stdoutLines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: stubQuery({
          Projects: liveProjectsSnapshot(),
          'Legacy Project Fallback Registry': liveRegistrySnapshot().filter(
            (f) => f.internalName !== 'projectStage',
          ),
        }),
        now: () => NOW,
        stdout: (line) => stdoutLines.push(line),
      },
    );
    expect(code).toBe(1);
    const parsed = JSON.parse(stdoutLines[0]!);
    expect(parsed.ready).toBe(false);
    const entry = parsed.legacyRegistry.entries.find(
      (e: { internalName: string }) => e.internalName === 'projectStage',
    );
    expect(entry.state).toBe('missing');
    expect(entry.expectedTypeAsString).toBe('Text');
  });

  it('createGraphListFieldQuery calls getSharePointToken with the site URL and passes the bearer to fetch', async () => {
    const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
    const getSharePointToken = vi.fn(async (siteUrl: string) => `token-for:${siteUrl}`);
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ value: [{ InternalName: 'Title', TypeAsString: 'Text' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const query = createGraphListFieldQuery({
      siteUrl: SITE_URL,
      tokenService: { getSharePointToken },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const snapshots = await query.listFields('Projects');
    expect(getSharePointToken).toHaveBeenCalledWith(SITE_URL);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`${SITE_URL}/_api/web/lists/getByTitle('Projects')/fields`);
    const headers = (init.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer token-for:${SITE_URL}`);
    expect(snapshots).toEqual([{ internalName: 'Title', typeAsString: 'Text' }]);
  });

  it('queries both lists exactly once', async () => {
    const listFieldQuery = stubQuery({
      Projects: liveProjectsSnapshot(),
      'Legacy Project Fallback Registry': liveRegistrySnapshot(),
    });
    await main({ json: false }, { listFieldQuery, now: () => NOW, stdout: () => {} });
    expect(listFieldQuery.listFields).toHaveBeenCalledTimes(2);
    expect(listFieldQuery.listFields).toHaveBeenCalledWith('Projects');
    expect(listFieldQuery.listFields).toHaveBeenCalledWith('Legacy Project Fallback Registry');
  });
});
