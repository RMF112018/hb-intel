import { describe, expect, it, vi } from 'vitest';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import { MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS } from '../backend/functions/src/services/my-projects/my-projects-source-list-schema.js';
import {
  PROJECTS_REMEDIATION_FIELD_COUNT,
  PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES,
  PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST,
  buildRemediationPlan,
  createRestRemediationAdapter,
  executeRemediation,
  main,
  parseArgs,
  resolveSiteUrl,
  selectExitCode,
  validateHBCentralSiteUrl,
  type ILiveFieldSnapshot,
  type IMainDeps,
  type IRemediationListAdapter,
  type IRemediationListRef,
  type IRemediationReport,
} from './remediate-my-projects-projects-role-field-types';

function snapshot(internalName: string, typeAsString: string): ILiveFieldSnapshot {
  return { InternalName: internalName, Title: internalName, TypeAsString: typeAsString };
}

function allThirteenAs(typeAsString: string): ILiveFieldSnapshot[] {
  return PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES.map((n) => snapshot(n, typeAsString));
}

interface IFakeListInput {
  readonly fields: ILiveFieldSnapshot[];
  readonly deleteImpl?: (internalName: string) => Promise<void>;
  readonly createImpl?: (field: IFieldDefinition) => Promise<void>;
  readonly listFieldsImpl?: () => Promise<readonly ILiveFieldSnapshot[]>;
}

function fakeAdapter(projects: IFakeListInput | null): {
  adapter: IRemediationListAdapter;
  deleteSpy: ReturnType<typeof vi.fn>;
  createSpy: ReturnType<typeof vi.fn>;
} {
  const deleteSpy = vi.fn(projects?.deleteImpl ?? (async (_n: string) => {}));
  const createSpy = vi.fn(projects?.createImpl ?? (async (_f: IFieldDefinition) => {}));
  const adapter: IRemediationListAdapter = {
    async getList(listTitle: string): Promise<IRemediationListRef | null> {
      if (listTitle !== 'Projects') return null;
      if (!projects) return null;
      let listFieldsCallCount = 0;
      return {
        title: listTitle,
        listFields: projects.listFieldsImpl ?? (async () => {
          listFieldsCallCount += 1;
          return projects.fields;
        }),
        deleteField: deleteSpy,
        createField: createSpy,
      } satisfies IRemediationListRef & { listFieldsCallCount?: number };
    },
  };
  return { adapter, deleteSpy, createSpy };
}

function deps(adapter: IRemediationListAdapter, out?: string[]): IMainDeps {
  return {
    listAdapter: adapter,
    now: () => '2026-05-15T00:00:00.000Z',
    stdout: (line) => {
      out?.push(line);
    },
  };
}

const HBCENTRAL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

// =============================================================================
// Approved manifest invariants
// =============================================================================

describe('PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES', () => {
  it('declares exactly 13 internal names', () => {
    expect(PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES.length).toBe(13);
    expect(PROJECTS_REMEDIATION_FIELD_COUNT).toBe(13);
  });

  it('does not include warrantyManagerUpns (operator excluded)', () => {
    expect(PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES).not.toContain('warrantyManagerUpns');
  });

  it('matches the explicit operator-confirmed approved 13-field list verbatim', () => {
    expect([...PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES]).toEqual([
      'leadEstimatorUpns',
      'estimatorUpns',
      'idsManagerUpns',
      'projectAccountantUpns',
      'projectAdministratorUpns',
      'projectCoordinatorUpns',
      'superintendentUpns',
      'leadSuperintendentUpns',
      'projectManagerUpns',
      'leadProjectManagerUpns',
      'projectExecutiveUpns',
      'safetyCoordinatorUpns',
      'qcManagerUpns',
    ]);
  });
});

describe('PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST (cross-checked against canonical descriptor)', () => {
  it('has length 13 and every entry is MultiLineText', () => {
    expect(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST.length).toBe(13);
    for (const entry of PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST) {
      expect(entry.type).toBe('MultiLineText');
      expect(entry.required).toBe(false);
      expect(entry.indexed).toBe(false);
    }
  });

  it('resolves displayName from canonical MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS', () => {
    for (const entry of PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST) {
      const canonical = MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS.find(
        (f) => f.internalName === entry.internalName,
      );
      expect(canonical).toBeDefined();
      expect(entry.displayName).toBe(canonical!.displayName);
    }
  });

  it('preserves operator-confirmed delete order (matches internal-names array)', () => {
    expect(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST.map((f) => f.internalName)).toEqual([
      ...PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES,
    ]);
  });
});

// =============================================================================
// parseArgs / resolveSiteUrl / validateHBCentralSiteUrl
// =============================================================================

describe('parseArgs', () => {
  it('defaults to dry-run', () => {
    expect(parseArgs([])).toEqual({ apply: false, json: false, siteUrl: undefined });
  });

  it('parses apply/json/site-url', () => {
    expect(parseArgs(['--apply', '--json', '--site-url', HBCENTRAL])).toEqual({
      apply: true,
      json: true,
      siteUrl: HBCENTRAL,
    });
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(/Unknown argument/);
  });

  it('rejects --site-url with missing value', () => {
    expect(() => parseArgs(['--site-url'])).toThrow(/Missing value for --site-url/);
  });

  it('rejects --site-url followed by another flag (no swallow)', () => {
    expect(() => parseArgs(['--site-url', '--json'])).toThrow(/Missing value for --site-url/);
  });
});

describe('resolveSiteUrl', () => {
  it('prefers CLI --site-url over env', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false, siteUrl: 'https://x' }, {
        SHAREPOINT_PROJECTS_SITE_URL: 'https://y',
      } as NodeJS.ProcessEnv),
    ).toBe('https://x');
  });

  it('falls back to SHAREPOINT_PROJECTS_SITE_URL, then SHAREPOINT_TENANT_URL', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false }, {
        SHAREPOINT_TENANT_URL: 'https://tenant',
      } as NodeJS.ProcessEnv),
    ).toBe('https://tenant');
  });

  it('throws when none provided', () => {
    expect(() => resolveSiteUrl({ apply: false, json: false }, {} as NodeJS.ProcessEnv)).toThrow(
      /Missing site URL/,
    );
  });
});

describe('validateHBCentralSiteUrl', () => {
  it('accepts canonical HBCentral URL (trailing slash, casing)', () => {
    expect(validateHBCentralSiteUrl(HBCENTRAL)).toBe(HBCENTRAL);
    expect(validateHBCentralSiteUrl(`${HBCENTRAL}/`)).toBe(HBCENTRAL);
    expect(
      validateHBCentralSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/hbcentral'),
    ).toBe(HBCENTRAL);
  });

  it('rejects wrong host', () => {
    expect(() => validateHBCentralSiteUrl('https://example.com/sites/HBCentral')).toThrow(
      /must be HBCentral/,
    );
  });

  it('rejects wrong path', () => {
    expect(() =>
      validateHBCentralSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/OtherSite'),
    ).toThrow(/must be HBCentral/);
  });

  it('rejects malformed URL', () => {
    expect(() => validateHBCentralSiteUrl('not-a-url')).toThrow(/Invalid site URL/);
  });
});

// =============================================================================
// buildRemediationPlan (pure)
// =============================================================================

describe('buildRemediationPlan', () => {
  it('returns 13 deletes + 13 creates when all 13 fields are Text', () => {
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, allThirteenAs('Text'));
    expect(plan.safeToApply).toBe(true);
    expect(plan.plannedDeletes.length).toBe(13);
    expect(plan.plannedCreates.length).toBe(13);
    expect(plan.blockers.length).toBe(0);
  });

  it('refuses when one of 13 is missing', () => {
    const live = allThirteenAs('Text').slice(1); // drop leadEstimatorUpns
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, live);
    expect(plan.safeToApply).toBe(false);
    expect(plan.plannedDeletes).toEqual([]);
    expect(plan.plannedCreates).toEqual([]);
    expect(plan.blockers.some((b) => b.kind === 'missing' && b.internalName === 'leadEstimatorUpns')).toBe(true);
  });

  it('refuses when one of 13 is already Note', () => {
    const live = allThirteenAs('Text').map((row) =>
      row.InternalName === 'estimatorUpns' ? snapshot(row.InternalName, 'Note') : row,
    );
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, live);
    expect(plan.safeToApply).toBe(false);
    expect(plan.blockers.some((b) => b.kind === 'already-note' && b.internalName === 'estimatorUpns')).toBe(true);
  });

  it('refuses when one of 13 has an unexpected type (e.g. User)', () => {
    const live = allThirteenAs('Text').map((row) =>
      row.InternalName === 'idsManagerUpns' ? snapshot(row.InternalName, 'User') : row,
    );
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, live);
    expect(plan.safeToApply).toBe(false);
    const blocker = plan.blockers.find((b) => b.kind === 'unexpected-type' && b.internalName === 'idsManagerUpns');
    expect(blocker).toBeDefined();
    expect(blocker && blocker.kind === 'unexpected-type' && blocker.observedType).toBe('User');
  });

  it('refuses on duplicate matches for the same internalName', () => {
    const live = [...allThirteenAs('Text'), snapshot('leadEstimatorUpns', 'Text')];
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, live);
    expect(plan.safeToApply).toBe(false);
    const blocker = plan.blockers.find(
      (b) => b.kind === 'duplicate-match' && b.internalName === 'leadEstimatorUpns',
    );
    expect(blocker).toBeDefined();
    expect(blocker && blocker.kind === 'duplicate-match' && blocker.matchCount).toBe(2);
  });

  it('reports multiple blockers in a single pass (no short-circuit)', () => {
    const live = allThirteenAs('Text').map((row) => {
      if (row.InternalName === 'estimatorUpns') return snapshot(row.InternalName, 'Note');
      if (row.InternalName === 'idsManagerUpns') return snapshot(row.InternalName, 'User');
      return row;
    });
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, live);
    expect(plan.safeToApply).toBe(false);
    expect(plan.blockers.length).toBe(2);
  });

  it('ignores live fields that are not in the approved set (e.g. Title, warrantyManagerUpns)', () => {
    const live = [
      ...allThirteenAs('Text'),
      snapshot('Title', 'Text'),
      snapshot('warrantyManagerUpns', 'Note'),
    ];
    const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, live);
    expect(plan.safeToApply).toBe(true);
    expect(plan.plannedDeletes.length).toBe(13);
  });
});

// =============================================================================
// executeRemediation (destructive helper)
// =============================================================================

function fakeListRef(input: {
  initial: ILiveFieldSnapshot[];
  postDelete?: ILiveFieldSnapshot[]; // what listFields returns after deletes (defaults: filtered initial)
  postCreate?: ILiveFieldSnapshot[]; // what listFields returns after creates
  deleteImpl?: (internalName: string) => Promise<void>;
  createImpl?: (field: IFieldDefinition) => Promise<void>;
  listFieldsImpl?: () => Promise<readonly ILiveFieldSnapshot[]>;
}): {
  list: IRemediationListRef;
  deleteSpy: ReturnType<typeof vi.fn>;
  createSpy: ReturnType<typeof vi.fn>;
  listFieldsSpy: ReturnType<typeof vi.fn>;
} {
  let phase: 'initial' | 'post-create' = 'initial';
  const deleteSpy = vi.fn(async (n: string) => {
    if (input.deleteImpl) return input.deleteImpl(n);
  });
  const createSpy = vi.fn(async (f: IFieldDefinition) => {
    if (input.createImpl) return input.createImpl(f);
  });
  const listFieldsSpy = vi.fn(async () => {
    if (input.listFieldsImpl) return input.listFieldsImpl();
    if (phase === 'initial') return input.initial;
    return input.postCreate ?? allThirteenAs('Note');
  });
  const list: IRemediationListRef = {
    title: 'Projects',
    listFields: listFieldsSpy,
    deleteField: async (n) => {
      await deleteSpy(n);
    },
    createField: async (f) => {
      await createSpy(f);
      // Once all creates have landed without throwing, switch listFields to
      // the post-create snapshot for the post-verify call.
      if (createSpy.mock.calls.length >= PROJECTS_REMEDIATION_FIELD_COUNT) {
        phase = 'post-create';
      }
    },
  };
  return { list, deleteSpy, createSpy, listFieldsSpy };
}

describe('executeRemediation', () => {
  it('deletes all 13, recreates all 13, post-verifies all Note → no failure', async () => {
    const { list, deleteSpy, createSpy, listFieldsSpy } = fakeListRef({
      initial: allThirteenAs('Text'),
      postCreate: allThirteenAs('Note'),
    });
    const outcome = await executeRemediation(list, PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST);
    expect(outcome.failure).toBeNull();
    expect(outcome.appliedDeletes.length).toBe(13);
    expect(outcome.appliedCreates.length).toBe(13);
    expect(outcome.postVerification?.length).toBe(13);
    expect(outcome.postVerification?.every((p) => p.verified)).toBe(true);
    expect(deleteSpy).toHaveBeenCalledTimes(13);
    expect(createSpy).toHaveBeenCalledTimes(13);
    expect(listFieldsSpy).toHaveBeenCalledTimes(1); // post-verify only (no preflight in executor)
  });

  it('stops on delete failure mid-sequence — no creates attempted, partial state reported', async () => {
    let deleteCallCount = 0;
    const { list, deleteSpy, createSpy } = fakeListRef({
      initial: allThirteenAs('Text'),
      deleteImpl: async (internalName) => {
        deleteCallCount += 1;
        if (deleteCallCount === 5) {
          throw new Error(`mock delete failure for ${internalName}`);
        }
      },
    });
    const outcome = await executeRemediation(list, PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST);
    expect(outcome.failure).not.toBeNull();
    expect(outcome.failure?.stage).toBe('delete');
    expect(outcome.appliedDeletes.length).toBe(4);
    expect(outcome.appliedCreates.length).toBe(0);
    expect(outcome.postVerification).toBeNull();
    expect(deleteSpy).toHaveBeenCalledTimes(5);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('stops on create failure mid-sequence — partial creates, all 13 deletes done, no post-verify', async () => {
    let createCallCount = 0;
    const { list, deleteSpy, createSpy } = fakeListRef({
      initial: allThirteenAs('Text'),
      createImpl: async (field) => {
        createCallCount += 1;
        if (createCallCount === 3) {
          throw new Error(`mock create failure for ${field.internalName}`);
        }
      },
    });
    const outcome = await executeRemediation(list, PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST);
    expect(outcome.failure?.stage).toBe('create');
    expect(outcome.appliedDeletes.length).toBe(13);
    expect(outcome.appliedCreates.length).toBe(2);
    expect(outcome.postVerification).toBeNull();
    expect(deleteSpy).toHaveBeenCalledTimes(13);
    expect(createSpy).toHaveBeenCalledTimes(3);
  });

  it('fails when post-verify shows one field still not Note', async () => {
    // Simulate a recreated field that came back as something other than Note.
    const drifted = allThirteenAs('Note').map((row) =>
      row.InternalName === 'projectManagerUpns' ? snapshot(row.InternalName, 'Text') : row,
    );
    const { list } = fakeListRef({
      initial: allThirteenAs('Text'),
      postCreate: drifted,
    });
    const outcome = await executeRemediation(list, PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST);
    expect(outcome.failure?.stage).toBe('post-verify');
    expect(outcome.appliedDeletes.length).toBe(13);
    expect(outcome.appliedCreates.length).toBe(13);
    expect(outcome.postVerification?.find((p) => p.internalName === 'projectManagerUpns')?.verified).toBe(
      false,
    );
  });

  it('fails when post-verify listFields throws', async () => {
    let listFieldsCalls = 0;
    const { list } = fakeListRef({
      initial: allThirteenAs('Text'),
      listFieldsImpl: async () => {
        listFieldsCalls += 1;
        throw new Error('post-verify listFields HTTP 503');
      },
    });
    const outcome = await executeRemediation(list, PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST);
    expect(outcome.failure?.stage).toBe('post-verify');
    expect(outcome.failure?.message).toContain('HTTP 503');
    expect(listFieldsCalls).toBe(1);
  });
});

// =============================================================================
// main flow
// =============================================================================

describe('main — dry-run', () => {
  it('all 13 Text → safeToApply true, no mutation, exit 0', async () => {
    const { adapter, deleteSpy, createSpy } = fakeAdapter({ fields: allThirteenAs('Text') });
    const out: string[] = [];
    const code = await main({ apply: false, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(0);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.safeToApply).toBe(true);
    expect(report.success).toBe(true);
    expect(report.plannedDeletes.length).toBe(13);
    expect(report.plannedCreates.length).toBe(13);
    expect(report.blockers.length).toBe(0);
  });

  it('one field already Note → safeToApply false, exit 1, no mutation', async () => {
    const live = allThirteenAs('Text').map((row) =>
      row.InternalName === 'qcManagerUpns' ? snapshot(row.InternalName, 'Note') : row,
    );
    const { adapter, deleteSpy, createSpy } = fakeAdapter({ fields: live });
    const out: string[] = [];
    const code = await main({ apply: false, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.safeToApply).toBe(false);
    expect(report.blockers.some((b) => b.kind === 'already-note')).toBe(true);
  });

  it('list missing → exit 1, list-missing blocker, no mutation', async () => {
    const adapter: IRemediationListAdapter = { async getList(_t) { return null; } };
    const out: string[] = [];
    const code = await main({ apply: false, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.success).toBe(false);
    expect(report.blockers.some((b) => b.kind === 'list-missing')).toBe(true);
  });

  it('propagates adapter throws (e.g. 401 Unauthorized) — no JSON emitted', async () => {
    const adapter: IRemediationListAdapter = {
      async getList(_t) { throw new Error('HTTP 401 Unauthorized'); },
    };
    const out: string[] = [];
    await expect(main({ apply: false, json: true }, deps(adapter, out), HBCENTRAL)).rejects.toThrow(
      /HTTP 401/,
    );
    expect(out).toEqual([]);
  });
});

describe('main — apply', () => {
  it('all 13 Text → 13 deletes + 13 creates + post-verify success → exit 0', async () => {
    let phase: 'before' | 'after' = 'before';
    const adapter: IRemediationListAdapter = {
      async getList(listTitle) {
        if (listTitle !== 'Projects') return null;
        return {
          title: listTitle,
          listFields: async () =>
            phase === 'before' ? allThirteenAs('Text') : allThirteenAs('Note'),
          deleteField: vi.fn(async (_n: string) => {}),
          createField: vi.fn(async (_f: IFieldDefinition) => {
            // After last create, switch the snapshot phase
            phase = 'after';
          }),
        };
      },
    };
    const out: string[] = [];
    const code = await main({ apply: true, json: true }, deps(adapter, out), HBCENTRAL);
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(code).toBe(0);
    expect(report.success).toBe(true);
    expect(report.appliedDeletes.length).toBe(13);
    expect(report.appliedCreates.length).toBe(13);
    expect(report.postVerification?.every((p) => p.verified)).toBe(true);
  });

  it('preflight blocker (one field already Note) → refuses to mutate, exit 1', async () => {
    const live = allThirteenAs('Text').map((row) =>
      row.InternalName === 'safetyCoordinatorUpns' ? snapshot(row.InternalName, 'Note') : row,
    );
    const deleteSpy = vi.fn(async (_n: string) => {});
    const createSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const adapter: IRemediationListAdapter = {
      async getList(listTitle) {
        if (listTitle !== 'Projects') return null;
        return {
          title: listTitle,
          listFields: async () => live,
          deleteField: deleteSpy,
          createField: createSpy,
        };
      },
    };
    const out: string[] = [];
    const code = await main({ apply: true, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.apply).toBe(true);
    expect(report.safeToApply).toBe(false);
    expect(report.appliedDeletes).toEqual([]);
    expect(report.appliedCreates).toEqual([]);
    expect(report.success).toBe(false);
  });

  it('delete failure mid-sequence → exit 1, partial-state report (deletes only)', async () => {
    let deleteCount = 0;
    const createSpy = vi.fn(async (_f: IFieldDefinition) => {});
    const adapter: IRemediationListAdapter = {
      async getList(listTitle) {
        if (listTitle !== 'Projects') return null;
        return {
          title: listTitle,
          listFields: async () => allThirteenAs('Text'),
          deleteField: vi.fn(async (internalName: string) => {
            deleteCount += 1;
            if (deleteCount === 7) {
              throw new Error(`mock delete failure for ${internalName}`);
            }
          }),
          createField: createSpy,
        };
      },
    };
    const out: string[] = [];
    const code = await main({ apply: true, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    expect(createSpy).not.toHaveBeenCalled();
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.success).toBe(false);
    expect(report.failure?.stage).toBe('delete');
    expect(report.appliedDeletes.length).toBe(6);
    expect(report.appliedCreates.length).toBe(0);
  });

  it('create failure mid-sequence → exit 1, partial-state report (13 deletes + partial creates)', async () => {
    let createCount = 0;
    let phase: 'before' | 'after-delete' = 'before';
    const adapter: IRemediationListAdapter = {
      async getList(listTitle) {
        if (listTitle !== 'Projects') return null;
        return {
          title: listTitle,
          listFields: async () =>
            phase === 'before' ? allThirteenAs('Text') : [],
          deleteField: vi.fn(async (_n: string) => {
            // After the 13th delete the list would effectively be empty.
            // (not strictly observed by main, but reflects reality)
            phase = 'after-delete';
          }),
          createField: vi.fn(async (field: IFieldDefinition) => {
            createCount += 1;
            if (createCount === 4) {
              throw new Error(`mock create failure for ${field.internalName}`);
            }
          }),
        };
      },
    };
    const out: string[] = [];
    const code = await main({ apply: true, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.failure?.stage).toBe('create');
    expect(report.appliedDeletes.length).toBe(13);
    expect(report.appliedCreates.length).toBe(3);
    expect(report.success).toBe(false);
  });

  it('post-verify failure (one field still not Note) → exit 1, postVerification populated', async () => {
    let phase: 'before' | 'after' = 'before';
    const adapter: IRemediationListAdapter = {
      async getList(listTitle) {
        if (listTitle !== 'Projects') return null;
        return {
          title: listTitle,
          listFields: async () => {
            if (phase === 'before') return allThirteenAs('Text');
            // One field drifted in post-verify
            return allThirteenAs('Note').map((row) =>
              row.InternalName === 'projectExecutiveUpns'
                ? snapshot(row.InternalName, 'Text')
                : row,
            );
          },
          deleteField: vi.fn(async (_n: string) => {}),
          createField: vi.fn(async (_f: IFieldDefinition) => {
            phase = 'after';
          }),
        };
      },
    };
    const out: string[] = [];
    const code = await main({ apply: true, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.failure?.stage).toBe('post-verify');
    expect(report.appliedDeletes.length).toBe(13);
    expect(report.appliedCreates.length).toBe(13);
    expect(
      report.postVerification?.find((p) => p.internalName === 'projectExecutiveUpns')?.verified,
    ).toBe(false);
  });

  it('list missing during apply → exit 1, no mutation', async () => {
    const adapter: IRemediationListAdapter = { async getList(_t) { return null; } };
    const out: string[] = [];
    const code = await main({ apply: true, json: true }, deps(adapter, out), HBCENTRAL);
    expect(code).toBe(1);
    const report = JSON.parse(out[0] ?? '{}') as IRemediationReport;
    expect(report.blockers.some((b) => b.kind === 'list-missing')).toBe(true);
    expect(report.appliedDeletes.length).toBe(0);
  });
});

describe('selectExitCode', () => {
  it('returns 0 only when report.success is true', () => {
    const base: IRemediationReport = {
      siteUrl: HBCENTRAL,
      listTitle: 'Projects',
      apply: false,
      safeToApply: true,
      plannedDeletes: [],
      plannedCreates: [],
      blockers: [],
      appliedDeletes: [],
      appliedCreates: [],
      postVerification: null,
      failure: null,
      startedAtUtc: '2026-05-15T00:00:00.000Z',
      completedAtUtc: '2026-05-15T00:00:01.000Z',
      success: true,
    };
    expect(selectExitCode(base)).toBe(0);
    expect(selectExitCode({ ...base, success: false })).toBe(1);
  });
});

// =============================================================================
// REST adapter — SharePoint transport seam
// =============================================================================

describe('createRestRemediationAdapter', () => {
  const SITE_URL = HBCENTRAL;
  const TOKEN = 'fake.token';

  function tokenService() {
    return { getSharePointToken: vi.fn(async (_url: string) => TOKEN) };
  }

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  function textResponse(text: string, status: number): Response {
    return new Response(text, { status, headers: { 'Content-Type': 'text/plain' } });
  }

  it('getList returns null on 404 (genuine missing list)', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Not Found', 404));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(await adapter.getList('Projects')).toBeNull();
    const [url] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`${SITE_URL}/_api/web/lists/getByTitle('Projects')`);
  });

  it('getList throws on 401 with HTTP code in message', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Unauthorized', 401));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(adapter.getList('Projects')).rejects.toThrow(/HTTP 401/);
  });

  it('getList throws on 403 with HTTP code in message', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Forbidden', 403));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(adapter.getList('Projects')).rejects.toThrow(/HTTP 403/);
  });

  it('listFields maps rows from /fields query', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Title: 'Projects' }))
      .mockResolvedValueOnce(
        jsonResponse({
          value: [
            {
              InternalName: 'leadEstimatorUpns',
              Title: 'Lead Estimator Upns',
              TypeAsString: 'Text',
            },
            {
              InternalName: 'warrantyManagerUpns',
              Title: 'Warranty Manager Upns',
              TypeAsString: 'Note',
            },
          ],
        }),
      );
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    expect(list).not.toBeNull();
    const rows = await list!.listFields();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ InternalName: 'leadEstimatorUpns', TypeAsString: 'Text' });
    const [fieldsUrl] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(fieldsUrl).toContain(
      "/_api/web/lists/getByTitle('Projects')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,DefaultValue,Choices&$top=5000",
    );
  });

  it('deleteField POST-tunnels DELETE with IF-MATCH:* and Bearer token', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Title: 'Projects' }))
      .mockResolvedValueOnce(jsonResponse({}, 200));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    await list!.deleteField('leadEstimatorUpns');
    const [deleteUrl, deleteInit] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(deleteUrl).toBe(
      `${SITE_URL}/_api/web/lists/getByTitle('Projects')/fields/getByInternalNameOrTitle('leadEstimatorUpns')`,
    );
    expect(deleteInit.method).toBe('POST');
    const headers = deleteInit.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(headers['X-HTTP-Method']).toBe('DELETE');
    expect(headers['IF-MATCH']).toBe('*');
  });

  it('deleteField throws when POST returns non-OK', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Title: 'Projects' }))
      .mockResolvedValueOnce(textResponse('column locked', 400));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    await expect(list!.deleteField('leadEstimatorUpns')).rejects.toThrow(/HTTP 400/);
  });

  it('createField POSTs SP.FieldCreationInformation with FieldTypeKind 3 + RichText:false', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Title: 'Projects' }))
      .mockResolvedValueOnce(jsonResponse({ Id: 'guid' }, 201));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    await list!.createField({
      internalName: 'leadEstimatorUpns',
      displayName: 'Lead Estimator Upns',
      type: 'MultiLineText',
    });
    const [createUrl, createInit] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(createUrl).toBe(`${SITE_URL}/_api/web/lists/getByTitle('Projects')/fields/add`);
    expect((createInit.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    const body = JSON.parse(String(createInit.body));
    expect(body).toEqual({
      parameters: {
        __metadata: { type: 'SP.FieldCreationInformation' },
        FieldTypeKind: 3,
        Title: 'Lead Estimator Upns',
        InternalName: 'leadEstimatorUpns',
        Required: false,
        RichText: false,
      },
    });
  });

  it('createField throws on non-OK response', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Title: 'Projects' }))
      .mockResolvedValueOnce(textResponse('column already exists', 400));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    await expect(
      list!.createField({
        internalName: 'leadEstimatorUpns',
        displayName: 'Lead Estimator Upns',
        type: 'MultiLineText',
      }),
    ).rejects.toThrow(/HTTP 400/);
  });

  it('createField refuses non-MultiLineText (defense-in-depth)', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Title: 'Projects' }));
    const adapter = createRestRemediationAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    await expect(
      list!.createField({
        internalName: 'procoreProject',
        displayName: 'procoreProject',
        type: 'Text',
      }),
    ).rejects.toThrow(/only recreates MultiLineText/);
    // Only the getList probe should have been called; no POST to /fields/add.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
