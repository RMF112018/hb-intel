import { describe, expect, it, vi } from 'vitest';
import type {
  IFieldDefinition,
  IListDefinition,
} from '../backend/functions/src/services/sharepoint-service.js';
import type { ILiveSharePointFieldSnapshot } from '../backend/functions/src/services/sharepoint-schema-provisioning/index.js';
import { MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR } from '../backend/functions/src/services/my-projects-custom-links/list-descriptor.js';
import {
  buildProvisioningReport,
  formatReport,
  main,
  parseArgs,
  resolveSiteUrl,
  selectExitCode,
  validateHBCentralSiteUrl,
  type IListAdapter,
  type IListRef,
  type IMainDeps,
  type IProvisionArgs,
} from './provision-my-projects-custom-links';

const HB_SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
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

function liveSnapshot(
  overrides: Partial<Record<string, ILiveSharePointFieldSnapshot>> = {},
): ILiveSharePointFieldSnapshot[] {
  return MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.map((field) => {
    const override = overrides[field.internalName];
    if (override) return override;
    return {
      InternalName: field.internalName,
      Title: field.displayName,
      TypeAsString: TYPE_TO_LIVE[field.type] ?? 'Text',
      Required: field.required ?? false,
      Indexed: field.indexed === true,
      DefaultValue: field.defaultValue ?? '',
      Choices: field.choices ? [...field.choices] : [],
    };
  });
}

function deps(listAdapter: IListAdapter, out?: string[]): IMainDeps {
  return {
    listAdapter,
    now: () => NOW,
    stdout: (line) => {
      out?.push(line);
    },
  };
}

interface IFakeAdapterOptions {
  readonly initialFields?: ILiveSharePointFieldSnapshot[] | null;
  readonly createListSpy?: (descriptor: IListDefinition) => Promise<void> | void;
  readonly createFieldSpy?: (field: IFieldDefinition) => Promise<void> | void;
  readonly updateSettingsSpy?: (
    fieldInternalName: string,
    updates: Record<string, unknown>,
  ) => Promise<void> | void;
}

function fakeAdapter(options: IFakeAdapterOptions): IListAdapter {
  let fields = options.initialFields === null ? null : (options.initialFields ?? []);
  return {
    async getList(listTitle: string): Promise<IListRef | null> {
      if (listTitle !== LIST_TITLE) return null;
      if (fields === null) return null;
      const current = fields;
      return {
        title: listTitle,
        listFields: async () => current,
        createField: async (field: IFieldDefinition) => {
          await options.createFieldSpy?.(field);
        },
        applyFieldSettingsUpdates: async (fieldInternalName, updates) => {
          await options.updateSettingsSpy?.(fieldInternalName, updates);
        },
      };
    },
    async createList(descriptor: IListDefinition): Promise<IListRef> {
      await options.createListSpy?.(descriptor);
      fields = [];
      return {
        title: descriptor.title,
        listFields: async () => fields as ILiveSharePointFieldSnapshot[],
        createField: async (field: IFieldDefinition) => {
          await options.createFieldSpy?.(field);
        },
        applyFieldSettingsUpdates: async (fieldInternalName, updates) => {
          await options.updateSettingsSpy?.(fieldInternalName, updates);
        },
      };
    },
  };
}

describe('parseArgs', () => {
  it('defaults to dry-run with no flags', () => {
    expect(parseArgs([])).toEqual({
      apply: false,
      json: false,
      allowTypeDrift: false,
      siteUrl: undefined,
    });
  });

  it('parses --apply, --json, --allow-type-drift, --site-url', () => {
    expect(
      parseArgs(['--apply', '--json', '--allow-type-drift', '--site-url', HB_SITE_URL]),
    ).toEqual({ apply: true, json: true, allowTypeDrift: true, siteUrl: HB_SITE_URL });
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(/Unknown argument/);
  });

  it('rejects --site-url with no value or flag-shaped value', () => {
    expect(() => parseArgs(['--site-url'])).toThrow(/Missing value for --site-url/);
    expect(() => parseArgs(['--site-url', '--json'])).toThrow(/Missing value for --site-url/);
  });
});

describe('site URL resolution', () => {
  it('prefers --site-url over env', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false, allowTypeDrift: false, siteUrl: 'https://x' }, {
        SHAREPOINT_PROJECTS_SITE_URL: 'https://y',
      } as NodeJS.ProcessEnv),
    ).toBe('https://x');
  });

  it('falls back to the descriptor host when env is unset', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false, allowTypeDrift: false }, {} as NodeJS.ProcessEnv),
    ).toBe(HB_SITE_URL);
  });

  it('locks the canonical host to HBCentral', () => {
    expect(validateHBCentralSiteUrl(`${HB_SITE_URL}/`)).toBe(HB_SITE_URL);
    expect(() => validateHBCentralSiteUrl('https://example.com/sites/HBCentral')).toThrow(
      /must be HBCentral/,
    );
    expect(() =>
      validateHBCentralSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/Other'),
    ).toThrow(/must be HBCentral/);
  });
});

describe('main — dry-run', () => {
  it('plans all descriptor fields as creates when the list is missing and does not call createList', async () => {
    const createListSpy = vi.fn(async (_d: IListDefinition) => {});
    const createFieldSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const out: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      deps(fakeAdapter({ initialFields: null, createListSpy, createFieldSpy }), out),
      HB_SITE_URL,
    );
    expect(code).toBe(1);
    expect(createListSpy).not.toHaveBeenCalled();
    expect(createFieldSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}');
    expect(report.listsMissing).toBe(true);
    expect(report.success).toBe(false);
    expect(report.targets[0].plannedCreates).toEqual(
      MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.map((f) => f.internalName),
    );
  });

  it('marks every field live-verified when the list already matches the descriptor', async () => {
    const createFieldSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const out: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      deps(fakeAdapter({ initialFields: liveSnapshot(), createFieldSpy }), out),
      HB_SITE_URL,
    );
    expect(code).toBe(0);
    expect(createFieldSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}');
    expect(report.targets[0].liveVerified.length).toBe(
      MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.length,
    );
    expect(report.targets[0].plannedCreates).toEqual([]);
    expect(report.targets[0].plannedUpdates).toEqual([]);
  });
});

describe('main — apply', () => {
  it('creates the list and every descriptor field when the list is missing', async () => {
    const createListSpy = vi.fn(async (_d: IListDefinition) => {});
    const createFieldSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const out: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      deps(fakeAdapter({ initialFields: null, createListSpy, createFieldSpy }), out),
      HB_SITE_URL,
    );
    expect(code).toBe(0);
    expect(createListSpy).toHaveBeenCalledTimes(1);
    expect(createListSpy.mock.calls[0]![0]?.title).toBe(LIST_TITLE);
    const created = createFieldSpy.mock.calls.map(([f]) => (f as IFieldDefinition).internalName);
    expect(created).toEqual(
      MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.map((f) => f.internalName),
    );
    const report = JSON.parse(out[0] ?? '{}');
    expect(report.targets[0].createdList).toBe(true);
    expect(report.targets[0].appliedCreates.length).toBe(
      MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.length,
    );
    expect(report.applied).toBe(true);
    expect(report.success).toBe(true);
  });

  it('is idempotent when every required field already exists with the expected type', async () => {
    const createFieldSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const out: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      deps(fakeAdapter({ initialFields: liveSnapshot(), createFieldSpy }), out),
      HB_SITE_URL,
    );
    expect(code).toBe(0);
    expect(createFieldSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}');
    expect(report.targets[0].appliedCreates).toEqual([]);
    expect(report.applied).toBe(false);
    expect(report.success).toBe(true);
  });

  it('refuses apply when wrong-type drift is present, and surfaces the blocker', async () => {
    const createFieldSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const updateSettingsSpy = vi.fn(async () => {});
    const out: string[] = [];
    const wrongVisibility: ILiveSharePointFieldSnapshot = {
      InternalName: 'Visibility',
      Title: 'Visibility',
      TypeAsString: 'Text',
      Required: false,
      Indexed: true,
      DefaultValue: '',
      Choices: [],
    };
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      deps(
        fakeAdapter({
          initialFields: liveSnapshot({ Visibility: wrongVisibility }),
          createFieldSpy,
          updateSettingsSpy,
        }),
        out,
      ),
      HB_SITE_URL,
    );
    expect(code).toBe(1);
    expect(createFieldSpy).not.toHaveBeenCalled();
    expect(updateSettingsSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}');
    expect(report.hasBlockingDrift).toBe(true);
    expect(report.success).toBe(false);
    expect(
      report.targets[0].blockers.some(
        (b: { fieldInternalName: string; liveType: string }) =>
          b.fieldInternalName === 'Visibility' && b.liveType === 'Text',
      ),
    ).toBe(true);
  });

  it('proceeds with apply when wrong-type drift is acknowledged via --allow-type-drift', async () => {
    const createFieldSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const out: string[] = [];
    const fieldsMissingVisibility = liveSnapshot().filter((f) => f.InternalName !== 'Visibility');
    fieldsMissingVisibility.push({
      InternalName: 'Visibility',
      Title: 'Visibility',
      TypeAsString: 'Text',
      Required: false,
      Indexed: true,
      DefaultValue: '',
      Choices: [],
    });
    const code = await main(
      { apply: true, json: true, allowTypeDrift: true },
      deps(fakeAdapter({ initialFields: fieldsMissingVisibility, createFieldSpy }), out),
      HB_SITE_URL,
    );
    expect(code).toBe(0);
    const report = JSON.parse(out[0] ?? '{}');
    expect(report.hasBlockingDrift).toBe(true);
    expect(report.allowTypeDrift).toBe(true);
    expect(report.success).toBe(true);
  });
});

describe('buildProvisioningReport and selectExitCode', () => {
  function target(
    overrides: Partial<{
      listFound: boolean;
      createdList: boolean;
      plannedCreates: string[];
      plannedUpdates: string[];
      liveVerified: string[];
      blockers: Array<{
        listTitle: string;
        fieldInternalName: string;
        desiredType: IFieldDefinition['type'];
        liveType: string;
        reason: string;
      }>;
      appliedCreates: string[];
      appliedUpdates: string[];
    }>,
  ) {
    return {
      listTitle: LIST_TITLE,
      listFound: true,
      createdList: false,
      plannedCreates: [],
      plannedUpdates: [],
      liveVerified: [],
      blockers: [],
      appliedCreates: [],
      appliedUpdates: [],
      ...overrides,
    };
  }

  const baseInput = {
    siteUrl: HB_SITE_URL,
    startedAtUtc: NOW,
    completedAtUtc: NOW,
  };

  it('reports success when the list is found and no blockers are present', () => {
    const report = buildProvisioningReport({
      ...baseInput,
      apply: false,
      allowTypeDrift: false,
      targets: [target({ liveVerified: ['Visibility'] })],
    });
    expect(report.success).toBe(true);
    expect(selectExitCode(report)).toBe(0);
    expect(report.nextCommands).toContain(
      `pnpm tsx scripts/provision-my-projects-custom-links.ts --apply --site-url ${HB_SITE_URL} --json`,
    );
  });

  it('reports failure when blockers exist and allowTypeDrift is false', () => {
    const report = buildProvisioningReport({
      ...baseInput,
      apply: true,
      allowTypeDrift: false,
      targets: [
        target({
          blockers: [
            {
              listTitle: LIST_TITLE,
              fieldInternalName: 'Visibility',
              desiredType: 'Choice',
              liveType: 'Text',
              reason: 'mismatch',
            },
          ],
        }),
      ],
    });
    expect(report.success).toBe(false);
    expect(report.hasBlockingDrift).toBe(true);
    expect(selectExitCode(report)).toBe(1);
  });

  it('reports listsMissing as fatal even under allowTypeDrift', () => {
    const report = buildProvisioningReport({
      ...baseInput,
      apply: true,
      allowTypeDrift: true,
      targets: [target({ listFound: false })],
    });
    expect(report.listsMissing).toBe(true);
    expect(report.success).toBe(false);
    expect(selectExitCode(report)).toBe(1);
  });
});

describe('formatReport', () => {
  const target = {
    listTitle: LIST_TITLE,
    listFound: true,
    createdList: true,
    plannedCreates: [],
    plannedUpdates: [],
    liveVerified: ['Visibility'],
    blockers: [],
    appliedCreates: ['Visibility'],
    appliedUpdates: [],
  };
  const report: ReturnType<typeof buildProvisioningReport> = buildProvisioningReport({
    siteUrl: HB_SITE_URL,
    apply: true,
    allowTypeDrift: false,
    startedAtUtc: NOW,
    completedAtUtc: NOW,
    targets: [target],
  });

  it('round-trips through JSON when asJson is true', () => {
    expect(JSON.parse(formatReport(report, true))).toEqual(report);
  });

  it('produces a human-readable text block when asJson is false', () => {
    const text = formatReport(report, false);
    expect(text).toContain('[provision-my-projects-custom-links]');
    expect(text).toContain(`siteUrl: ${HB_SITE_URL}`);
    expect(text).toContain(LIST_TITLE);
    expect(text).toContain('createdList: true');
    expect(text).toContain('appliedCreates: Visibility');
  });
});

describe('main propagates adapter failures', () => {
  it('rejects when getList throws (auth/network) and does not emit a report', async () => {
    const throwingAdapter: IListAdapter = {
      async getList() {
        throw new Error('Unauthorized: 401');
      },
      async createList() {
        throw new Error('should not be reached');
      },
    };
    const out: string[] = [];
    await expect(
      main(
        { apply: false, json: true, allowTypeDrift: false } satisfies IProvisionArgs,
        deps(throwingAdapter, out),
        HB_SITE_URL,
      ),
    ).rejects.toThrow(/Unauthorized/);
    expect(out).toEqual([]);
  });
});
