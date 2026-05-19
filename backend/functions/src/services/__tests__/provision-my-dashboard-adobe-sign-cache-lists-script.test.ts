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
} from '../../../../../scripts/provision-my-dashboard-adobe-sign-cache-lists.js';
import {
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
} from '../adobe-sign-cache/cache-list-descriptors.js';

const NOW = '2026-05-19T00:00:00.000Z';
const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

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

function liveFieldsFromDescriptor(descriptor: IListDefinition): ILiveSharePointFieldSnapshot[] {
  return descriptor.fields.map((field) => ({
    InternalName: field.internalName,
    Title: field.displayName,
    TypeAsString: TYPE_MAP[field.type] ?? 'Text',
    Required: field.required ?? false,
    Indexed: field.indexed ?? false,
    DefaultValue: field.defaultValue ?? null,
    Choices: field.choices ? [...field.choices] : null,
  })) as unknown as ILiveSharePointFieldSnapshot[];
}

function uniquenessSnapshot(
  descriptor: IListDefinition,
  overrides: Record<string, boolean> = {},
): Record<string, boolean> {
  const base: Record<string, boolean> = {};
  for (const field of descriptor.fields) {
    base[field.internalName] = field.unique === true;
  }
  return { ...base, ...overrides };
}

interface FakeListRefState extends IRegistryListRef {
  createdFields: string[];
  appliedUpdates: string[];
  appliedUniqueness: Array<{ name: string; value: boolean }>;
}

function makeListRef(
  descriptor: IListDefinition,
  initial: {
    fields: ILiveSharePointFieldSnapshot[];
    uniqueness: Record<string, boolean>;
  },
): FakeListRefState {
  const created: string[] = [];
  const applied: string[] = [];
  const uniqueApplied: Array<{ name: string; value: boolean }> = [];
  const fieldsState = [...initial.fields];
  const uniqState = { ...initial.uniqueness };
  return {
    title: descriptor.title,
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

interface FakeAdapterState extends IRegistryListAdapter {
  createdLists: IListDefinition[];
  refsByTitle: Map<string, FakeListRefState>;
}

/**
 * Multi-list fake adapter. `refsByTitle` maps list-title → preinstalled ref
 * (use `null` to simulate a missing list that should be created on apply).
 */
function makeAdapter(
  refsByTitle: Map<string, FakeListRefState | null>,
): FakeAdapterState {
  const createdLists: IListDefinition[] = [];
  const liveRefs = new Map<string, FakeListRefState>();
  for (const [title, ref] of refsByTitle.entries()) {
    if (ref !== null) liveRefs.set(title, ref);
  }
  return {
    getList: async (title: string) => liveRefs.get(title) ?? null,
    createList: async (descriptor: IListDefinition) => {
      createdLists.push(descriptor);
      // On create, install an empty ref that subsequent reconciliation will populate.
      const newRef = makeListRef(descriptor, { fields: [], uniqueness: {} });
      liveRefs.set(descriptor.title, newRef);
      return newRef;
    },
    createdLists,
    refsByTitle: liveRefs,
  };
}

// ─── parseArgs ─────────────────────────────────────────────────────────────

describe('parseArgs', () => {
  it('defaults to dry-run text output', () => {
    expect(parseArgs([])).toEqual({
      apply: false,
      json: false,
      allowTypeDrift: false,
      siteUrl: undefined,
    });
  });

  it('parses --apply, --json, --allow-type-drift in any order', () => {
    expect(parseArgs(['--allow-type-drift', '--json', '--apply'])).toEqual({
      apply: true,
      json: true,
      allowTypeDrift: true,
      siteUrl: undefined,
    });
  });

  it('parses --site-url with following value', () => {
    expect(parseArgs(['--site-url', SITE_URL])).toMatchObject({
      siteUrl: SITE_URL,
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
    expect(() => parseArgs(['-h'])).toThrow(/Usage:/);
  });
});

// ─── validateMyDashboardSiteUrl ────────────────────────────────────────────

describe('validateMyDashboardSiteUrl', () => {
  it('accepts the canonical MyDashboard URL', () => {
    expect(validateMyDashboardSiteUrl(SITE_URL)).toBe(SITE_URL);
  });

  it('accepts case variations and trailing slashes', () => {
    expect(
      validateMyDashboardSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/mydashboard/'),
    ).toBe(SITE_URL);
    expect(
      validateMyDashboardSiteUrl('https://HEDRICKBROTHERSCOM.SHAREPOINT.COM/sites/MYDASHBOARD'),
    ).toBe(SITE_URL);
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

// ─── resolveSiteUrl ────────────────────────────────────────────────────────

describe('resolveSiteUrl', () => {
  it('uses --site-url when provided', () => {
    expect(
      resolveSiteUrl(
        { apply: false, json: false, allowTypeDrift: false, siteUrl: 'https://example.com/sites/X' },
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
    ).toBe(SITE_URL);
  });
});

// ─── buildProvisioningReport ───────────────────────────────────────────────

describe('buildProvisioningReport', () => {
  function makeTarget(overrides: Partial<IProvisionTargetReport> = {}): IProvisionTargetReport {
    return {
      listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
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

  it('success=true on dry-run with no blockers and every list found', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: false,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE }),
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
        }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE }),
      ],
    });
    expect(report.success).toBe(true);
    expect(report.applied).toBe(false);
    expect(report.hasBlockingDrift).toBe(false);
    expect(report.governanceReminder).toMatch(/permission inheritance/);
    expect(selectExitCode(report)).toBe(0);
  });

  it('success=false when ANY target has wrong-type blockers and allowTypeDrift=false', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: true,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE }),
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
          blockers: [
            {
              listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
              fieldInternalName: 'SortDateUtc',
              desiredType: 'DateTime',
              liveType: 'Text',
              reason: 'wrong-type',
            },
          ],
        }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE }),
      ],
    });
    expect(report.success).toBe(false);
    expect(report.hasBlockingDrift).toBe(true);
    expect(selectExitCode(report)).toBe(1);
  });

  it('success=true when blockers are overridden by --allow-type-drift', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: true,
      allowTypeDrift: true,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
          uniqueBlockers: [
            { fieldInternalName: 'AdobeActorKey', expected: true, observed: false },
          ],
        }),
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
        }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE }),
      ],
    });
    expect(report.success).toBe(true);
    expect(report.hasBlockingDrift).toBe(true);
  });

  it('listsMissing=true forces success=false even with no blockers', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: false,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE, listFound: false }),
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
        }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE }),
      ],
    });
    expect(report.success).toBe(false);
    expect(report.listsMissing).toBe(true);
  });

  it('applied=true when --apply and ANY adapter target reports field creates', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: true,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
          appliedCreates: ['AdobeActorKey'],
        }),
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
        }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE }),
      ],
    });
    expect(report.applied).toBe(true);
  });

  it('emits nextCommands recommending apply on a clean dry-run', () => {
    const report = buildProvisioningReport({
      siteUrl: SITE_URL,
      apply: false,
      allowTypeDrift: false,
      startedAtUtc: NOW,
      completedAtUtc: NOW,
      targets: [
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE }),
        makeTarget({
          listTitle: MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
        }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE }),
        makeTarget({ listTitle: MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE }),
      ],
    });
    expect(report.nextCommands[0]).toMatch(
      /provision-my-dashboard-adobe-sign-cache-lists\.ts --apply/,
    );
    expect(report.nextCommands).toEqual(
      expect.arrayContaining([expect.stringMatching(/verify-my-dashboard-adobe-sign-cache-lists/)]),
    );
  });
});

// ─── main — dry-run scenarios ──────────────────────────────────────────────

describe('main (dry-run scenarios)', () => {
  it('reports listFound=false for every list and plannedCreates for every descriptor field when no lists exist', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      refs.set(descriptor.title, null);
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    expect(report.targets).toHaveLength(4);
    for (const target of report.targets) {
      expect(target.listFound).toBe(false);
      expect(target.plannedCreates.length).toBeGreaterThan(0);
    }
    expect(adapter.createdLists).toHaveLength(0);
  });

  it('reports live-verified state on every list when all fields exist with correct types and uniqueness', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      refs.set(
        descriptor.title,
        makeListRef(descriptor, {
          fields: liveFieldsFromDescriptor(descriptor),
          uniqueness: uniquenessSnapshot(descriptor),
        }),
      );
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    const code = await main(
      { apply: false, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    expect(code).toBe(0);
    const report = JSON.parse(lines.join('\n'));
    expect(report.success).toBe(true);
    for (const target of report.targets) {
      expect(target.listFound).toBe(true);
      expect(target.plannedCreates).toEqual([]);
      expect(target.plannedUniqueChanges).toEqual([]);
    }
    for (const ref of adapter.refsByTitle.values()) {
      expect(ref.createdFields).toEqual([]);
      expect(ref.appliedUpdates).toEqual([]);
      expect(ref.appliedUniqueness).toEqual([]);
    }
  });
});

// ─── main — apply scenarios ────────────────────────────────────────────────

describe('main (apply scenarios)', () => {
  it('creates each missing list and reconciles every descriptor field on --apply', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      refs.set(descriptor.title, null);
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    expect(code).toBe(0);
    expect(adapter.createdLists).toHaveLength(4);
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      const ref = adapter.refsByTitle.get(descriptor.title)!;
      expect(ref.createdFields).toEqual(descriptor.fields.map((f) => f.internalName));
      const uniqueFields = descriptor.fields
        .filter((f) => f.unique === true)
        .map((f) => f.internalName);
      expect(ref.appliedUniqueness.map((entry) => entry.name)).toEqual(uniqueFields);
      for (const entry of ref.appliedUniqueness) {
        expect(entry.value).toBe(true);
      }
    }
    const report = JSON.parse(lines.join('\n'));
    expect(report.applied).toBe(true);
    expect(report.success).toBe(true);
  });

  it('is idempotent: re-applying against fully-provisioned lists creates no fields', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      refs.set(
        descriptor.title,
        makeListRef(descriptor, {
          fields: liveFieldsFromDescriptor(descriptor),
          uniqueness: uniquenessSnapshot(descriptor),
        }),
      );
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    expect(code).toBe(0);
    const report = JSON.parse(lines.join('\n'));
    expect(report.applied).toBe(false);
    for (const ref of adapter.refsByTitle.values()) {
      expect(ref.createdFields).toEqual([]);
      expect(ref.appliedUniqueness).toEqual([]);
    }
  });

  it('refuses to mutate when any list has wrong-unique drift without --allow-type-drift', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      const overrides: Record<string, boolean> = {};
      if (descriptor.title === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE) {
        overrides.AdobeActorKey = false;
      }
      refs.set(
        descriptor.title,
        makeListRef(descriptor, {
          fields: liveFieldsFromDescriptor(descriptor),
          uniqueness: uniquenessSnapshot(descriptor, overrides),
        }),
      );
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    expect(code).toBe(1);
    const report = JSON.parse(lines.join('\n'));
    expect(report.success).toBe(false);
    expect(report.hasBlockingDrift).toBe(true);
    const userCacheTarget = report.targets.find(
      (t: IProvisionTargetReport) => t.listTitle === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    expect(userCacheTarget.uniqueBlockers).toEqual([
      { fieldInternalName: 'AdobeActorKey', expected: true, observed: false },
    ]);
    const userCacheRef = adapter.refsByTitle.get(MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE)!;
    expect(userCacheRef.appliedUniqueness).toEqual([]);
  });

  it('handles a mixed batch: one list missing, others fully reconciled', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      if (descriptor.title === MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE) {
        refs.set(descriptor.title, null);
      } else {
        refs.set(
          descriptor.title,
          makeListRef(descriptor, {
            fields: liveFieldsFromDescriptor(descriptor),
            uniqueness: uniquenessSnapshot(descriptor),
          }),
        );
      }
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    const code = await main(
      { apply: true, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    expect(code).toBe(0);
    expect(adapter.createdLists.map((d) => d.title)).toEqual([
      MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
    ]);
    const syncRunsRef = adapter.refsByTitle.get(MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE)!;
    expect(syncRunsRef.createdFields).toEqual(
      MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR.fields.map((f) => f.internalName),
    );
    const userCacheRef = adapter.refsByTitle.get(MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE)!;
    expect(userCacheRef.createdFields).toEqual([]);
  });
});

// ─── descriptor invariants exercised through the script ────────────────────

describe('descriptor invariants exercised by the script', () => {
  it('all four cache list descriptors flow through the main loop in canonical order', async () => {
    const refs = new Map<string, FakeListRefState | null>();
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      refs.set(
        descriptor.title,
        makeListRef(descriptor, {
          fields: liveFieldsFromDescriptor(descriptor),
          uniqueness: uniquenessSnapshot(descriptor),
        }),
      );
    }
    const adapter = makeAdapter(refs);
    const lines: string[] = [];
    await main(
      { apply: false, json: true, allowTypeDrift: false },
      {
        listAdapter: adapter,
        now: () => NOW,
        stdout: (line) => lines.push(line),
      },
      SITE_URL,
    );
    const report = JSON.parse(lines.join('\n'));
    expect(report.targets.map((t: IProvisionTargetReport) => t.listTitle)).toEqual([
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR.title,
      MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR.title,
      MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_DESCRIPTOR.title,
      MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR.title,
    ]);
  });
});
