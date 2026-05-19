import { describe, expect, it } from 'vitest';
import { MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR } from '../backend/functions/src/services/my-projects-projection/storage-list-descriptor.js';
import {
  buildMyProjectsProjectionStorageReadinessReport,
  type IStorageLiveListSnapshot,
} from '../backend/functions/src/services/my-projects-projection/storage-schema-readiness.js';
import {
  formatReport,
  main,
  parseArgs,
  validateMyDashboardSiteUrl,
  type IStorageReadAdapter,
} from './verify-my-projects-projection-storage-core.js';

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

function typeAsString(t: string): string {
  if (t === 'MultiLineText') return 'Note';
  return t;
}

function liveList(listTitle: string): IStorageLiveListSnapshot {
  const descriptor = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.find((d) => d.title === listTitle)!;
  return {
    listTitle,
    fields: descriptor.fields.map((f) => ({
      InternalName: f.internalName,
      Title: f.displayName,
      TypeAsString: typeAsString(f.type),
      Required: f.required ?? false,
      Indexed: f.indexed ?? false,
      DefaultValue: f.defaultValue ?? '',
      Choices: f.choices ? [...f.choices] : [],
    })),
    enforceUniqueValues: Object.fromEntries(
      descriptor.fields.filter((f) => f.unique === true).map((f) => [f.internalName, true]),
    ),
  };
}

function adapterFromLive(live: readonly IStorageLiveListSnapshot[]): IStorageReadAdapter {
  return {
    async listFields(listTitle: string) {
      return live.find((l) => l.listTitle === listTitle)?.fields ?? [];
    },
    async listFieldUniqueness(listTitle: string) {
      return live.find((l) => l.listTitle === listTitle)?.enforceUniqueValues ?? {};
    },
  };
}

describe('verify-my-projects-projection-storage parse/guard', () => {
  it('parses --json and rejects --apply', () => {
    expect(parseArgs(['--json'])).toEqual({ json: true, siteUrl: undefined });
    expect(() => parseArgs(['--apply'])).toThrow(/read-only/);
  });

  it('validates strict MyDashboard site', () => {
    expect(validateMyDashboardSiteUrl(`${SITE_URL}/`)).toBe(SITE_URL);
    expect(() => validateMyDashboardSiteUrl('https://example.com/sites/MyDashboard')).toThrow(
      /must be MyDashboard/,
    );
  });
});

describe('verify-my-projects-projection-storage readiness/main', () => {
  it('reports ready for fully compliant live snapshots', async () => {
    const live = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.map((d) => liveList(d.title));
    const out: string[] = [];
    const code = await main(
      { json: true },
      {
        listAdapter: adapterFromLive(live),
        now: () => '2026-05-19T00:00:00.000Z',
        stdout: (line) => out.push(line),
      },
    );
    expect(code).toBe(0);
    const report = JSON.parse(out[0]!);
    expect(report.ready).toBe(true);
    expect(report.listReports.length).toBe(7);
  });

  it('classifies wrong-unique when unique field is not unique-enforced', () => {
    const list = liveList(MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR[0]!.title);
    const uniqueField = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR[0]!.fields.find((f) => f.unique)!.internalName;
    list.enforceUniqueValues = { ...list.enforceUniqueValues, [uniqueField]: false };
    const report = buildMyProjectsProjectionStorageReadinessReport({
      generatedAtUtc: 'now',
      liveLists: [list],
    });
    const entry = report.listReports[0]!.entries.find((e) => e.internalName === uniqueField)!;
    expect(entry.state).toBe('wrong-unique');
  });

  it('text formatter includes list/readiness summary', () => {
    const report = buildMyProjectsProjectionStorageReadinessReport({
      generatedAtUtc: 'now',
      liveLists: MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.map((d) => liveList(d.title)),
    });
    const text = formatReport(report, false);
    expect(text).toContain('schema readiness');
    expect(text).toContain('ready: true');
  });
});
