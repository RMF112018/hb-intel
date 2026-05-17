import { describe, expect, it } from 'vitest';
import type { IFieldDefinition, IListDefinition } from '../sharepoint-service.js';
import type { ILiveSharePointFieldSnapshot } from '../sharepoint-schema-provisioning/index.js';
import {
  buildProvisioningReport,
  main,
  parseArgs,
  resolveSiteUrl,
  selectExitCode,
  validateMyDashboardSiteUrl,
  type IProvisionTargetReport,
  type IRegistryListAdapter,
  type IRegistryListRef,
} from '../../../../../scripts/provision-my-projects-registry-schema.js';
import { MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR } from '../my-projects-projection/registry-list-descriptor.js';

const NOW = '2026-05-17T00:00:00.000Z';

function liveFieldsFromDescriptor(): ILiveSharePointFieldSnapshot[] {
  const TYPE_MAP: Record<string, string> = {
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
  return MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.map((field) => ({
    InternalName: field.internalName,
    Title: field.displayName,
    TypeAsString: TYPE_MAP[field.type] ?? 'Text',
    Required: field.required ?? false,
    Indexed: field.indexed ?? false,
    DefaultValue: field.defaultValue ?? null,
    Choices: field.choices ? [...field.choices] : null,
  })) as unknown as ILiveSharePointFieldSnapshot[];
}

function uniquenessSnapshot(overrides: Record<string, boolean> = {}): Record<string, boolean> {
  const base: Record<string, boolean> = {};
  for (const field of MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields) {
    base[field.internalName] = field.unique === true;
  }
  return { ...base, ...overrides };
}

function makeListRef(initial: {
  fields: ILiveSharePointFieldSnapshot[];
  uniqueness: Record<string, boolean>;
}): IRegistryListRef & {
  createdFields: string[];
  appliedUpdates: string[];
  appliedUniqueness: Array<{ name: string; value: boolean }>;
} {
  const created: string[] = [];
  const applied: string[] = [];
  const uniqueApplied: Array<{ name: string; value: boolean }> = [];
  const fieldsState = [...initial.fields];
  const uniqState = { ...initial.uniqueness };
  return {
    title: MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.title,
    listFields: async () => fieldsState,
    listFieldUniqueness: async () => uniqState,
    createField: async (field: IFieldDefinition) => {
      created.push(field.internalName);
    },
    applyFieldSettingsUpdates: async (fieldInternalName: string) => {
      applied.push(fieldInternalName);
    },
    applyUniqueValuesUpdate: async (fieldInternalName: string, enforceUnique: boolean) => {
      uniqueApplied.push({ name: fieldInternalName, value: enforceUnique });
    },
    createdFields: created,
    appliedUpdates: applied,
    appliedUniqueness: uniqueApplied,
  };
}

function makeAdapter(listRef: IRegistryListRef | null): IRegistryListAdapter & {
  createdLists: IListDefinition[];
} {
  const createdLists: IListDefinition[] = [];
  return {
    getList: async () => listRef,
    createList: async (descriptor: IListDefinition) => {
      createdLists.push(descriptor);
      if (!listRef) {
        throw new Error('test adapter has no fallback ref');
      }
      return listRef;
    },
    createdLists,
  };
}

describe('parseArgs', () => {
  it('defaults to dry-run text output', () => {
    expect(parseArgs([])).toEqual({
      apply: false,
      json: false,
      allowTypeDrift: false,
      siteUrl: undefined,
    });
  });

  it('parses --apply, --json, --allow-type-drift', () => {
    expect(parseArgs(['--apply', '--json', '--allow-type-drift'])).toEqual({
      apply: true,
      json: true,
      allowTypeDrift: true,
      siteUrl: undefined,
    });
  });

  it('parses --site-url with following value', () => {
    expect(
      parseArgs(['--site-url', 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard']),
    ).toMatchObject({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    });
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

describe('validateMyDashboardSiteUrl', () => {
  it('accepts the canonical MyDashboard URL', () => {
    expect(
      validateMyDashboardSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard'),
    ).toBe('https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard');
  });

  it('accepts case variations and trailing slashes', () => {
    expect(
      validateMyDashboardSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/mydashboard/'),
    ).toBe('https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard');
    // Note: WHATWG URL parsing lowercases the hostname; the helper returns the
    // canonical lowercase host with the canonical-case `MyDashboard` path.
    expect(
      validateMyDashboardSiteUrl('https://HEDRICKBROTHERSCOM.SHAREPOINT.COM/sites/MYDASHBOARD'),
    ).toBe('https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard');
  });

  it('rejects HBCentral and other site paths', () => {
    expect(() =>
      validateMyDashboardSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'),
    ).toThrow(/Site URL must be MyDashboard/);
    expect(() => validateMyDashboardSiteUrl('https://hedrickbrotherscom.sharepoint.com/')).toThrow(
      /Site URL must be MyDashboard/,
    );
  });

  it('rejects wrong host', () => {
    expect(() =>
      validateMyDashboardSiteUrl('https://contoso.sharepoint.com/sites/MyDashboard'),
    ).toThrow(/Site URL must be MyDashboard/);
  });

  it('rejects malformed URLs', () => {
    expect(() => validateMyDashboardSiteUrl('not-a-url')).toThrow(/Invalid site URL/);
  });
});

describe('resolveSiteUrl', () => {
  it('uses --site-url when provided', () => {
    expect(
      resolveSiteUrl(
        {
          apply: false,
          json: false,
          allowTypeDrift: false,
          siteUrl: 'https://example.com/sites/X',
        },
        {} as NodeJS.ProcessEnv,
      ),
    ).toBe('https://example.com/sites/X');
  });

  it('falls back to SHAREPOINT_MYDASHBOARD_SITE_URL', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false, allowTypeDrift: false }, {
        SHAREPOINT_MYDASHBOARD_SITE_URL: 'https://env.example/sites/X',
      } as NodeJS.ProcessEnv),
    ).toBe('https://env.example/sites/X');
  });

  it('falls back to the descriptor host site URL', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false, allowTypeDrift: false }, {} as NodeJS.ProcessEnv),
    ).toBe('https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard');
  });
});

describe('buildProvisioningReport', () => {
  function makeTarget(overrides: Partial<IProvisionTargetReport> = {}): IProvisionTargetReport {
    return {
      listTitle: 'My Projects Registry',
      listFound: true,
      createdList: false,
      plannedCreates: [],
      plannedUpdates: [],
      plannedUniqueChanges: [],
      liveVerified: [],
      blockers: [],
      uniqueBlockers: [],
      appliedCreates: [],
      appliedUpdates: [],
      appliedUniqueChanges: [],
      ...overrides,
    };
  }

  it('success=true on dry-run with no blockers and list found', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
      apply: false,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [makeTarget()],
    });
    expect(report.success).toBe(true);
    expect(report.applied).toBe(false);
    expect(report.hasBlockingDrift).toBe(false);
    expect(report.governanceReminder).toMatch(/permission inheritance/);
    expect(selectExitCode(report)).toBe(0);
  });

  it('success=false when wrong-type blockers exist and allowTypeDrift=false', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
      apply: true,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({
          blockers: [
            {
              listTitle: 'My Projects Registry',
              fieldInternalName: 'LastProjectedAtUtc',
              desiredType: 'DateTime',
              liveType: 'Text',
              reason: 'wrong-type',
            },
          ],
        }),
      ],
    });
    expect(report.success).toBe(false);
    expect(report.hasBlockingDrift).toBe(true);
    expect(selectExitCode(report)).toBe(1);
  });

  it('success=true when wrong-unique blockers are overridden by --allow-type-drift', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
      apply: true,
      allowTypeDrift: true,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({
          uniqueBlockers: [{ fieldInternalName: 'ProjectionKey', expected: true, observed: false }],
        }),
      ],
    });
    expect(report.success).toBe(true);
    expect(report.hasBlockingDrift).toBe(true);
  });

  it('listsMissing=true forces success=false even when no blockers exist', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
      apply: false,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [makeTarget({ listFound: false })],
    });
    expect(report.success).toBe(false);
    expect(report.listsMissing).toBe(true);
  });

  it('applied=true when --apply and adapter reports field creates', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
      apply: true,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [makeTarget({ appliedCreates: ['ProjectionKey'] })],
    });
    expect(report.applied).toBe(true);
  });
});

describe('main (dry-run scenarios)', () => {
  it('reports listFound=false and plannedCreates for all descriptor fields when the list is missing', async () => {
    const adapter = makeAdapter(null);
    const lines: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    expect(report.targets[0].listFound).toBe(false);
    expect(report.targets[0].plannedCreates).toEqual(
      MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.map((f) => f.internalName),
    );
    expect(report.targets[0].plannedUniqueChanges).toEqual(['ProjectionKey']);
    expect(adapter.createdLists).toHaveLength(0);
  });

  it('reports live-verified state when all fields exist with correct types and uniqueness', async () => {
    const listRef = makeListRef({
      fields: liveFieldsFromDescriptor(),
      uniqueness: uniquenessSnapshot(),
    });
    const adapter = makeAdapter(listRef);
    const lines: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    );
    expect(code).toBe(0);
    const report = JSON.parse(lines.join('\n'));
    expect(report.success).toBe(true);
    expect(report.targets[0].listFound).toBe(true);
    expect(report.targets[0].liveVerified.length).toBe(
      MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.length,
    );
    expect(report.targets[0].plannedUniqueChanges).toEqual([]);
    expect(listRef.createdFields).toEqual([]);
    expect(listRef.appliedUpdates).toEqual([]);
    expect(listRef.appliedUniqueness).toEqual([]);
  });

  it('flags wrong-unique blocker when ProjectionKey lacks EnforceUniqueValues', async () => {
    const listRef = makeListRef({
      fields: liveFieldsFromDescriptor(),
      uniqueness: uniquenessSnapshot({ ProjectionKey: false }),
    });
    const adapter = makeAdapter(listRef);
    const lines: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    expect(report.success).toBe(false);
    expect(report.hasBlockingDrift).toBe(true);
    expect(report.targets[0].uniqueBlockers).toEqual([
      { fieldInternalName: 'ProjectionKey', expected: true, observed: false },
    ]);
    expect(listRef.appliedUniqueness).toEqual([]);
  });

  it('applies uniqueness change under --apply when descriptor matches live and uniqueness is missing', async () => {
    const listRef = makeListRef({
      fields: liveFieldsFromDescriptor(),
      uniqueness: uniquenessSnapshot({ ProjectionKey: false }),
    });
    const adapter = makeAdapter(listRef);
    const lines: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: true },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    );
    expect(code).toBe(0);
    const report = JSON.parse(lines.join('\n'));
    expect(report.applied).toBe(true);
    expect(listRef.appliedUniqueness).toEqual([{ name: 'ProjectionKey', value: true }]);
    expect(report.targets[0].appliedUniqueChanges).toEqual(['ProjectionKey']);
  });
});
