import { describe, expect, it, vi } from 'vitest';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import { MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR } from '../backend/functions/src/services/my-projects-projection/storage-list-descriptor.js';
import {
  buildProvisioningReport,
  main,
  parseArgs,
  resolveSiteUrl,
  validateMyDashboardSiteUrl,
  type IMainDeps,
  type IStorageListAdapter,
  type IStorageListRef,
} from './provision-my-projects-projection-storage-core.js';

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

function typeAsString(t: IFieldDefinition['type']): string {
  if (t === 'MultiLineText') return 'Note';
  return t;
}

function compliantFields(listTitle: string) {
  const descriptor = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.find((d) => d.title === listTitle)!;
  return descriptor.fields.map((field) => ({
    InternalName: field.internalName,
    Title: field.displayName,
    TypeAsString: typeAsString(field.type),
    Required: field.required ?? false,
    Indexed: field.indexed ?? false,
    DefaultValue: field.defaultValue ?? '',
    Choices: field.choices ? [...field.choices] : [],
  }));
}

function compliantUniqueMap(listTitle: string): Record<string, boolean> {
  const descriptor = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.find((d) => d.title === listTitle)!;
  const out: Record<string, boolean> = {};
  for (const field of descriptor.fields) {
    if (field.unique === true) out[field.internalName] = true;
  }
  return out;
}

function fakeAdapter(options: {
  readonly missingLists?: readonly string[];
  readonly wrongType?: { readonly listTitle: string; readonly fieldInternalName: string };
} = {}): IStorageListAdapter {
  return {
    async getList(listTitle: string): Promise<IStorageListRef | null> {
      if (options.missingLists?.includes(listTitle)) return null;
      const fields = compliantFields(listTitle);
      if (options.wrongType?.listTitle === listTitle) {
        const target = fields.find((f) => f.InternalName === options.wrongType?.fieldInternalName);
        if (target) target.TypeAsString = 'Text';
      }
      return {
        title: listTitle,
        listFields: async () => fields,
        listFieldUniqueness: async () => compliantUniqueMap(listTitle),
        createField: vi.fn(async (_f: IFieldDefinition) => {}),
        applyFieldSettingsUpdates: vi.fn(async () => {}),
        applyUniqueValuesUpdate: vi.fn(async () => {}),
      };
    },
    async createList(descriptor) {
      return {
        title: descriptor.title,
        listFields: async () => [],
        listFieldUniqueness: async () => ({}),
        createField: vi.fn(async (_f: IFieldDefinition) => {}),
        applyFieldSettingsUpdates: vi.fn(async () => {}),
        applyUniqueValuesUpdate: vi.fn(async () => {}),
      };
    },
  };
}

function deps(listAdapter: IStorageListAdapter, out?: string[]): IMainDeps {
  return {
    listAdapter,
    now: () => '2026-05-19T00:00:00.000Z',
    stdout: (line) => out?.push(line),
  };
}

describe('provision-my-projects-projection-storage parse/guards', () => {
  it('parses args', () => {
    expect(parseArgs(['--apply', '--json', '--allow-type-drift', '--site-url', SITE_URL])).toEqual({
      apply: true,
      json: true,
      allowTypeDrift: true,
      siteUrl: SITE_URL,
    });
  });

  it('resolves site and validates strict MyDashboard host/path', () => {
    expect(resolveSiteUrl({ apply: false, json: false, allowTypeDrift: false }, {} as NodeJS.ProcessEnv)).toBe(SITE_URL);
    expect(validateMyDashboardSiteUrl(`${SITE_URL}/`)).toBe(SITE_URL);
    expect(() => validateMyDashboardSiteUrl('https://example.com/sites/MyDashboard')).toThrow(/must be MyDashboard/);
  });
});

describe('provision-my-projects-projection-storage behavior', () => {
  it('dry-run reports missing lists and refuses success', async () => {
    const out: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      deps(fakeAdapter({ missingLists: [MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR[0]!.title] }), out),
      SITE_URL,
    );
    expect(code).toBe(1);
    const report = JSON.parse(out[0]!);
    expect(report.listsMissing).toBe(true);
  });

  it('apply refuses unsafe wrong-type drift when allowTypeDrift=false', async () => {
    const out: string[] = [];
    const list = MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR[0]!;
    const field = list.fields.find((f) => f.type === 'Choice') ?? list.fields[0]!;
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      deps(fakeAdapter({ wrongType: { listTitle: list.title, fieldInternalName: field.internalName } }), out),
      SITE_URL,
    );
    expect(code).toBe(1);
    const report = JSON.parse(out[0]!);
    expect(report.hasBlockingDrift).toBe(true);
  });

  it('apply is idempotent on compliant schema', async () => {
    const out: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      deps(fakeAdapter(), out),
      SITE_URL,
    );
    expect(code).toBe(0);
    const report = JSON.parse(out[0]!);
    expect(report.success).toBe(true);
  });

  it('report builder tracks next commands', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: false,
      allowTypeDrift: false,
      startedAtUtc: 'a',
      completedAtUtc: 'b',
      targets: [],
    });
    expect(report.nextCommands.length).toBeGreaterThan(0);
  });
});
