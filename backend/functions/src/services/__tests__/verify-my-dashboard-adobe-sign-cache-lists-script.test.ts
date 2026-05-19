import { describe, expect, it } from 'vitest';

import {
  formatReport,
  main,
  parseArgs,
  selectExitCode,
  validateMyDashboardSiteUrl,
  type IListFieldQuery,
} from '../../../../../scripts/verify-my-dashboard-adobe-sign-cache-lists.js';
import {
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
} from '../adobe-sign-cache/cache-list-descriptors.js';
import type { AdobeSignCacheListFieldSnapshot } from '../adobe-sign-cache/cache-list-schema-readiness.js';
import type { IListDefinition } from '../sharepoint-service.js';

const NOW = '2026-05-19T00:00:00.000Z';
const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

const TYPE_TO_LIVE_TYPE_AS_STRING: Record<string, string> = {
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

function liveSnapshot(descriptor: IListDefinition): AdobeSignCacheListFieldSnapshot[] {
  return descriptor.fields.map((field) => ({
    internalName: field.internalName,
    typeAsString: TYPE_TO_LIVE_TYPE_AS_STRING[field.type] ?? 'Text',
    enforceUniqueValues: field.unique === true,
  }));
}

function makeQuery(
  snapshots: Map<string, AdobeSignCacheListFieldSnapshot[] | null>,
): IListFieldQuery {
  return {
    listFields: async (listTitle: string) => snapshots.get(listTitle) ?? null,
  };
}

// ─── parseArgs ─────────────────────────────────────────────────────────────

describe('parseArgs', () => {
  it('defaults to text output', () => {
    expect(parseArgs([])).toEqual({ json: false, siteUrl: undefined });
  });

  it('parses --json', () => {
    expect(parseArgs(['--json'])).toEqual({ json: true, siteUrl: undefined });
  });

  it('parses --site-url', () => {
    expect(parseArgs(['--site-url', SITE_URL])).toMatchObject({ siteUrl: SITE_URL });
  });

  it('rejects --apply with the read-only refusal message', () => {
    expect(() => parseArgs(['--apply'])).toThrow(
      /verify-my-dashboard-adobe-sign-cache-lists is read-only/,
    );
  });

  it('rejects --site-url without value', () => {
    expect(() => parseArgs(['--site-url'])).toThrow(/Missing value for --site-url/);
    expect(() => parseArgs(['--site-url', '--json'])).toThrow(/Missing value for --site-url/);
  });

  it('rejects unknown arguments', () => {
    expect(() => parseArgs(['--unknown'])).toThrow(/Unknown argument/);
  });

  it('throws usage on --help', () => {
    expect(() => parseArgs(['--help'])).toThrow(/Usage:/);
  });
});

// ─── validateMyDashboardSiteUrl ────────────────────────────────────────────

describe('validateMyDashboardSiteUrl (verifier)', () => {
  it('accepts MyDashboard host + path', () => {
    expect(validateMyDashboardSiteUrl(SITE_URL)).toBe(SITE_URL);
  });

  it('rejects wrong site and wrong host', () => {
    expect(() =>
      validateMyDashboardSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'),
    ).toThrow(/Site URL must be MyDashboard/);
    expect(() =>
      validateMyDashboardSiteUrl('https://contoso.sharepoint.com/sites/MyDashboard'),
    ).toThrow(/Site URL must be MyDashboard/);
  });
});

// ─── formatReport + selectExitCode ─────────────────────────────────────────

describe('formatReport + selectExitCode', () => {
  it('exits 0 when the report is ready', () => {
    expect(selectExitCode({ ready: true, generatedAtUtc: NOW, targets: [] })).toBe(0);
  });

  it('exits 1 when the report is not ready', () => {
    expect(selectExitCode({ ready: false, generatedAtUtc: NOW, targets: [] })).toBe(1);
  });

  it('emits JSON when asJson=true', () => {
    const text = formatReport({ ready: true, generatedAtUtc: NOW, targets: [] }, true);
    expect(() => JSON.parse(text)).not.toThrow();
    expect(JSON.parse(text)).toMatchObject({ ready: true });
  });

  it('emits a text report when asJson=false', () => {
    const text = formatReport({ ready: true, generatedAtUtc: NOW, targets: [] }, false);
    expect(text).toMatch(/verify-my-dashboard-adobe-sign-cache-lists/);
    expect(text).toMatch(/ready: true/);
  });
});

// ─── main ──────────────────────────────────────────────────────────────────

describe('main', () => {
  it('exits 0 with ready=true when every list is live-verified', async () => {
    const snapshots = new Map<string, AdobeSignCacheListFieldSnapshot[] | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      snapshots.set(descriptor.title, liveSnapshot(descriptor));
    }
    const lines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: makeQuery(snapshots),
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
    );
    expect(code).toBe(0);
    const report = JSON.parse(lines.join('\n'));
    expect(report.ready).toBe(true);
    expect(report.targets).toHaveLength(4);
  });

  it('exits 1 with the missing-list flagged as listFound=false when one list is absent', async () => {
    const snapshots = new Map<string, AdobeSignCacheListFieldSnapshot[] | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      if (descriptor.title === MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE) {
        snapshots.set(descriptor.title, null);
      } else {
        snapshots.set(descriptor.title, liveSnapshot(descriptor));
      }
    }
    const lines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: makeQuery(snapshots),
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    expect(report.ready).toBe(false);
    const syncRunsTarget = report.targets.find(
      (t: { listName: string }) => t.listName === MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
    );
    expect(syncRunsTarget.listFound).toBe(false);
    expect(syncRunsTarget.ready).toBe(false);
  });

  it('exits 1 when a single field is missing on a present list', async () => {
    const snapshots = new Map<string, AdobeSignCacheListFieldSnapshot[] | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      if (descriptor.title === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE) {
        snapshots.set(
          descriptor.title,
          liveSnapshot(descriptor).filter((f) => f.internalName !== 'FreshnessState'),
        );
      } else {
        snapshots.set(descriptor.title, liveSnapshot(descriptor));
      }
    }
    const lines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: makeQuery(snapshots),
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    const userCacheTarget = report.targets.find(
      (t: { listName: string }) => t.listName === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    const entry = userCacheTarget.entries.find(
      (e: { internalName: string }) => e.internalName === 'FreshnessState',
    );
    expect(entry.state).toBe('missing');
  });

  it('exits 1 when a unique-key field lacks EnforceUniqueValues', async () => {
    const snapshots = new Map<string, AdobeSignCacheListFieldSnapshot[] | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      if (descriptor.title === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE) {
        snapshots.set(
          descriptor.title,
          liveSnapshot(descriptor).map((f) =>
            f.internalName === 'AdobeActorKey' ? { ...f, enforceUniqueValues: false } : f,
          ),
        );
      } else {
        snapshots.set(descriptor.title, liveSnapshot(descriptor));
      }
    }
    const lines: string[] = [];
    const code = await main(
      { json: true },
      {
        listFieldQuery: makeQuery(snapshots),
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    const userCacheTarget = report.targets.find(
      (t: { listName: string }) => t.listName === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    const entry = userCacheTarget.entries.find(
      (e: { internalName: string }) => e.internalName === 'AdobeActorKey',
    );
    expect(entry.state).toBe('wrong-unique');
  });
});
