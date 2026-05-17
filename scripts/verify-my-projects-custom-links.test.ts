import { describe, expect, it, vi } from 'vitest';
import { MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR } from '../backend/functions/src/services/my-projects-custom-links/list-descriptor.js';
import type { CustomLinksListFieldSnapshot } from '../backend/functions/src/services/my-projects-custom-links/custom-links-schema-readiness.js';
import {
  createGraphListFieldQuery,
  formatReport,
  main,
  parseArgs,
  selectExitCode,
  type IListFieldQuery,
} from './verify-my-projects-custom-links';

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
const NOW = '2026-05-17T00:00:00.000Z';
const LIST_TITLE = MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.title;

const TYPE_TO_LIVE: Record<string, string> = {
  Text: 'Text',
  Number: 'Number',
  Boolean: 'Boolean',
  DateTime: 'DateTime',
  Choice: 'Choice',
  MultiLineText: 'Note',
  URL: 'URL',
  User: 'User',
  Lookup: 'Lookup',
};

function liveSnapshot(): CustomLinksListFieldSnapshot[] {
  return MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.map((field) => ({
    internalName: field.internalName,
    typeAsString: TYPE_TO_LIVE[field.type] ?? 'Text',
  }));
}

function stubQuery(map: Record<string, readonly CustomLinksListFieldSnapshot[]>): IListFieldQuery {
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
  it('returns 0 when ready', () => {
    expect(
      selectExitCode({
        ready: true,
        generatedAtUtc: NOW,
        listName: LIST_TITLE,
        entries: [],
      }),
    ).toBe(0);
  });

  it('returns 1 when not ready', () => {
    expect(
      selectExitCode({
        ready: false,
        generatedAtUtc: NOW,
        listName: LIST_TITLE,
        entries: [],
      }),
    ).toBe(1);
  });
});

describe('formatReport', () => {
  const baseReport = {
    ready: false,
    generatedAtUtc: NOW,
    listName: LIST_TITLE,
    entries: [
      {
        internalName: 'Visibility',
        expectedTypeAsString: 'Choice',
        observedTypeAsString: null,
        state: 'missing' as const,
      },
    ],
  };

  it('round-trips through JSON when asJson is true', () => {
    expect(JSON.parse(formatReport(baseReport, true))).toEqual(baseReport);
  });

  it('produces a human-readable text block when asJson is false', () => {
    const text = formatReport(baseReport, false);
    expect(text).toContain('schema readiness');
    expect(text).toContain(`list: ${LIST_TITLE}`);
    expect(text).toContain('ready: false');
    expect(text).toContain('Visibility');
    expect(text).toContain('state=missing');
    expect(text).toContain('observed=(absent)');
  });
});

describe('main', () => {
  it('returns 0 and emits a ready report when the list is live-verified', async () => {
    const stdoutLines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: stubQuery({ [LIST_TITLE]: liveSnapshot() }),
        now: () => NOW,
        stdout: (line) => stdoutLines.push(line),
      },
    );
    expect(code).toBe(0);
    const parsed = JSON.parse(stdoutLines[0]!);
    expect(parsed.ready).toBe(true);
    expect(parsed.listName).toBe(LIST_TITLE);
  });

  it('returns 1 and reports the missing field when Visibility is absent', async () => {
    const stdoutLines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: stubQuery({
          [LIST_TITLE]: liveSnapshot().filter((f) => f.internalName !== 'Visibility'),
        }),
        now: () => NOW,
        stdout: (line) => stdoutLines.push(line),
      },
    );
    expect(code).toBe(1);
    const parsed = JSON.parse(stdoutLines[0]!);
    expect(parsed.ready).toBe(false);
    const entry = parsed.entries.find(
      (e: { internalName: string }) => e.internalName === 'Visibility',
    );
    expect(entry.state).toBe('missing');
    expect(entry.expectedTypeAsString).toBe('Choice');
  });

  it('queries exactly the canonical list title once', async () => {
    const listFieldQuery = stubQuery({ [LIST_TITLE]: liveSnapshot() });
    await main({ json: false }, { listFieldQuery, now: () => NOW, stdout: () => {} });
    expect(listFieldQuery.listFields).toHaveBeenCalledTimes(1);
    expect(listFieldQuery.listFields).toHaveBeenCalledWith(LIST_TITLE);
  });
});

describe('createGraphListFieldQuery', () => {
  it('passes the bearer token to fetch and maps SP fields into snapshots', async () => {
    const getSharePointToken = vi.fn(async (siteUrl: string) => `token-for:${siteUrl}`);
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            value: [
              { InternalName: 'Visibility', TypeAsString: 'Choice' },
              { InternalName: 'IsActive', TypeAsString: 'Boolean' },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    );
    const query = createGraphListFieldQuery({
      siteUrl: SITE_URL,
      tokenService: { getSharePointToken },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const snapshots = await query.listFields(LIST_TITLE);
    expect(getSharePointToken).toHaveBeenCalledWith(SITE_URL);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(
      `${SITE_URL}/_api/web/lists/getByTitle('${encodeURIComponent(LIST_TITLE)}')/fields`,
    );
    const headers = (init.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer token-for:${SITE_URL}`);
    expect(snapshots).toEqual([
      { internalName: 'Visibility', typeAsString: 'Choice' },
      { internalName: 'IsActive', typeAsString: 'Boolean' },
    ]);
  });

  it('throws when SharePoint returns a non-OK status (never silently empty)', async () => {
    const fetchImpl = vi.fn(async () => new Response('Unauthorized', { status: 401 }));
    const query = createGraphListFieldQuery({
      siteUrl: SITE_URL,
      tokenService: { getSharePointToken: vi.fn(async () => 'token') },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(query.listFields(LIST_TITLE)).rejects.toThrow(/status 401/);
  });
});
