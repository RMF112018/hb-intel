import { describe, expect, it, vi } from 'vitest';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import {
  buildProvisioningReport,
  createRestListAdapter,
  main,
  parseArgs,
  resolveSiteUrl,
  selectExitCode,
  validateHBCentralSiteUrl,
  type IListAdapter,
  type IMainDeps,
  type IProvisionTargetReport,
} from './provision-my-projects-source-list-schema';

function field(
  internalName: string,
  type: 'Text' | 'Note',
): {
  InternalName: string;
  Title: string;
  TypeAsString: string;
  Required: boolean;
  Indexed: boolean;
  DefaultValue: string;
  Choices: string[];
} {
  return {
    InternalName: internalName,
    Title: internalName,
    TypeAsString: type,
    Required: false,
    Indexed: false,
    DefaultValue: '',
    Choices: [],
  };
}

function fakeAdapter(input: {
  projects?: { fields: ReturnType<typeof field>[]; createSpy?: ReturnType<typeof vi.fn> };
  registry?: { fields: ReturnType<typeof field>[]; createSpy?: ReturnType<typeof vi.fn> };
}): IListAdapter {
  return {
    async getList(listTitle: string) {
      if (listTitle === 'Projects') {
        if (!input.projects) return null;
        const spy = input.projects.createSpy ?? vi.fn(async (_f: IFieldDefinition) => {});
        return {
          title: listTitle,
          listFields: async () => input.projects!.fields,
          createField: spy,
        };
      }
      if (listTitle === 'Legacy Project Fallback Registry') {
        if (!input.registry) return null;
        const spy = input.registry.createSpy ?? vi.fn(async (_f: IFieldDefinition) => {});
        return {
          title: listTitle,
          listFields: async () => input.registry!.fields,
          createField: spy,
        };
      }
      return null;
    },
  };
}

function deps(listAdapter: IListAdapter, out?: string[]): IMainDeps {
  return {
    listAdapter,
    now: () => '2026-05-14T00:00:00.000Z',
    stdout: (line) => {
      out?.push(line);
    },
  };
}

describe('parseArgs', () => {
  it('defaults to dry-run', () => {
    expect(parseArgs([])).toEqual({ apply: false, json: false, siteUrl: undefined });
  });

  it('parses apply/json/site-url', () => {
    expect(
      parseArgs([
        '--apply',
        '--json',
        '--site-url',
        'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      ]),
    ).toEqual({
      apply: true,
      json: true,
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    });
  });

  it('rejects invalid flags', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(/Unknown argument/);
  });
});

describe('site url resolution', () => {
  it('uses cli site-url over env', () => {
    expect(
      resolveSiteUrl({ apply: false, json: false, siteUrl: 'https://x' }, {
        SHAREPOINT_PROJECTS_SITE_URL: 'https://y',
      } as NodeJS.ProcessEnv),
    ).toBe('https://x');
  });

  it('validates HBCentral lock', () => {
    expect(
      validateHBCentralSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/'),
    ).toBe('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
    expect(() => validateHBCentralSiteUrl('https://example.com/sites/HBCentral')).toThrow(
      /must be HBCentral/,
    );
  });
});

describe('main behavior', () => {
  it('dry-run does not call create adapter and still plans creates', async () => {
    const projectsCreate = vi.fn(async (_f: IFieldDefinition) => {});
    const registryCreate = vi.fn(async (_f: IFieldDefinition) => {});

    const code = await main(
      { apply: false, json: true },
      deps(
        fakeAdapter({
          projects: { fields: [], createSpy: projectsCreate },
          registry: { fields: [], createSpy: registryCreate },
        }),
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(0);
    expect(projectsCreate).not.toHaveBeenCalled();
    expect(registryCreate).not.toHaveBeenCalled();
  });

  it('apply creates missing fields only', async () => {
    const projectsCreate = vi.fn(async (_f: IFieldDefinition) => {});
    const registryCreate = vi.fn(async (_f: IFieldDefinition) => {});

    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: {
            fields: [field('leadEstimatorUpns', 'Note')],
            createSpy: projectsCreate,
          },
          registry: {
            fields: [field('leadEstimatorUpns', 'Note'), field('procoreProject', 'Text')],
            createSpy: registryCreate,
          },
        }),
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(0);
    expect(projectsCreate).toHaveBeenCalled();
    expect(registryCreate).toHaveBeenCalled();
    const projectsCreated = projectsCreate.mock.calls.map(
      ([f]) => (f as IFieldDefinition).internalName,
    );
    const registryCreated = registryCreate.mock.calls.map(
      ([f]) => (f as IFieldDefinition).internalName,
    );
    expect(projectsCreated).toContain('buildingConnectedUrl');
    expect(projectsCreated).toContain('documentCrunchUrl');
    expect(registryCreated).toContain('buildingConnectedUrl');
    expect(registryCreated).toContain('documentCrunchUrl');
    expect(registryCreated).toContain('projectStage');
  });

  it('is idempotent when all required fields already exist', async () => {
    const projectsCreate = vi.fn(async (_f: IFieldDefinition) => {});
    const registryCreate = vi.fn(async (_f: IFieldDefinition) => {});

    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: {
            fields: [
              field('leadEstimatorUpns', 'Note'),
              field('estimatorUpns', 'Note'),
              field('idsManagerUpns', 'Note'),
              field('projectAccountantUpns', 'Note'),
              field('projectAdministratorUpns', 'Note'),
              field('projectCoordinatorUpns', 'Note'),
              field('superintendentUpns', 'Note'),
              field('leadSuperintendentUpns', 'Note'),
              field('projectManagerUpns', 'Note'),
              field('leadProjectManagerUpns', 'Note'),
              field('projectExecutiveUpns', 'Note'),
              field('safetyCoordinatorUpns', 'Note'),
              field('qcManagerUpns', 'Note'),
              field('warrantyManagerUpns', 'Note'),
              field('buildingConnectedUrl', 'Text'),
              field('documentCrunchUrl', 'Text'),
            ],
            createSpy: projectsCreate,
          },
          registry: {
            fields: [
              field('leadEstimatorUpns', 'Note'),
              field('estimatorUpns', 'Note'),
              field('idsManagerUpns', 'Note'),
              field('projectAccountantUpns', 'Note'),
              field('projectAdministratorUpns', 'Note'),
              field('projectCoordinatorUpns', 'Note'),
              field('superintendentUpns', 'Note'),
              field('leadSuperintendentUpns', 'Note'),
              field('projectManagerUpns', 'Note'),
              field('leadProjectManagerUpns', 'Note'),
              field('projectExecutiveUpns', 'Note'),
              field('safetyCoordinatorUpns', 'Note'),
              field('qcManagerUpns', 'Note'),
              field('warrantyManagerUpns', 'Note'),
              field('procoreProject', 'Text'),
              field('buildingConnectedUrl', 'Text'),
              field('documentCrunchUrl', 'Text'),
              field('projectStage', 'Text'),
            ],
            createSpy: registryCreate,
          },
        }),
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(0);
    expect(projectsCreate).not.toHaveBeenCalled();
    expect(registryCreate).not.toHaveBeenCalled();
  });

  it('wrong-type field fails apply and keeps blocker visible in report output', async () => {
    const projectsCreate = vi.fn(async (_f: IFieldDefinition) => {});
    const outputs: string[] = [];

    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: { fields: [field('leadEstimatorUpns', 'Text')], createSpy: projectsCreate },
          registry: { fields: [field('procoreProject', 'Text')] },
        }),
        outputs,
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(1);
    expect(projectsCreate).not.toHaveBeenCalled();
    const report = JSON.parse(outputs[0] ?? '{}');
    expect(report.hasBlockingDrift).toBe(true);
    expect(report.targets[0].blockers.length).toBeGreaterThan(0);
  });

  it('wrong-type external-launch field on Projects (Note instead of Text) blocks apply', async () => {
    const projectsCreate = vi.fn(async (_f: IFieldDefinition) => {});
    const outputs: string[] = [];

    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: {
            fields: [field('buildingConnectedUrl', 'Note')],
            createSpy: projectsCreate,
          },
          registry: { fields: [field('procoreProject', 'Text')] },
        }),
        outputs,
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(1);
    expect(projectsCreate).not.toHaveBeenCalled();
    const report = JSON.parse(outputs[0] ?? '{}');
    expect(report.hasBlockingDrift).toBe(true);
    const projectsTarget = (report.targets as IProvisionTargetReport[]).find(
      (t) => t.listTitle === 'Projects',
    );
    expect(projectsTarget).toBeDefined();
    expect(
      projectsTarget!.blockers.some(
        (b) => b.fieldInternalName === 'buildingConnectedUrl' && b.liveType === 'Note',
      ),
    ).toBe(true);
  });

  it('missing list fails with no mutation and list-missing flag', async () => {
    const outputs: string[] = [];
    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: { fields: [] },
        }),
        outputs,
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(1);
    const report = JSON.parse(outputs[0] ?? '{}');
    expect(report.listsMissing).toBe(true);
    expect(report.success).toBe(false);
  });
});

describe('createRestListAdapter (SharePoint REST seam)', () => {
  const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
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

  it('getList returns null on a 404 status (genuine missing list)', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Not Found', 404));
    const adapter = createRestListAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const result = await adapter.getList('Missing List');
    expect(result).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`${SITE_URL}/_api/web/lists/getByTitle('Missing%20List')`);
  });

  it('getList throws on a 401 status with the HTTP code in the message (never silently null)', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Unauthorized', 401));
    const adapter = createRestListAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(adapter.getList('Projects')).rejects.toThrow(/HTTP 401/);
  });

  it('getList throws on a 403 status with the HTTP code in the message', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Forbidden', 403));
    const adapter = createRestListAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(adapter.getList('Projects')).rejects.toThrow(/HTTP 403/);
  });

  it('listFields maps SharePoint /fields rows into ILiveSharePointFieldSnapshot', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: 'list-guid' }))
      .mockResolvedValueOnce(
        jsonResponse({
          value: [
            {
              InternalName: 'leadEstimatorUpns',
              Title: 'leadEstimatorUpns',
              TypeAsString: 'Text',
              Required: false,
              Indexed: false,
              DefaultValue: '',
              Choices: [],
            },
            {
              InternalName: 'warrantyManagerUpns',
              Title: 'warrantyManagerUpns',
              TypeAsString: 'Note',
              Required: false,
            },
          ],
        }),
      );
    const adapter = createRestListAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    expect(list).not.toBeNull();
    const fields = await list!.listFields();
    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatchObject({
      InternalName: 'leadEstimatorUpns',
      TypeAsString: 'Text',
    });
    expect(fields[1]).toMatchObject({
      InternalName: 'warrantyManagerUpns',
      TypeAsString: 'Note',
    });
    const [fieldsUrl] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(fieldsUrl).toContain(
      "/_api/web/lists/getByTitle('Projects')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,DefaultValue,Choices&$top=5000",
    );
  });

  it('createField POSTs a flat SP.Field body to GUID-addressed /Fields then MERGE-renames Title to the display name', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: 'list-guid' }))
      .mockResolvedValueOnce(jsonResponse({ Id: 'field-guid' }, 201))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const adapter = createRestListAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Projects');
    await list!.createField({
      internalName: 'warrantyManagerUpns',
      displayName: 'Warranty Manager Upns',
      type: 'MultiLineText',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);

    const [createUrl, createInit] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(createUrl).toBe(`${SITE_URL}/_api/web/lists(guid'list-guid')/Fields`);
    expect((createInit.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(String(createInit.body))).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'warrantyManagerUpns',
      FieldTypeKind: 3,
      Required: false,
      StaticName: 'warrantyManagerUpns',
    });

    const [renameUrl, renameInit] = fetchImpl.mock.calls[2] as [string, RequestInit];
    expect(renameUrl).toBe(`${SITE_URL}/_api/web/lists(guid'list-guid')/Fields(guid'field-guid')`);
    expect((renameInit.headers as Record<string, string>)['X-HTTP-Method']).toBe('MERGE');
    expect((renameInit.headers as Record<string, string>)['IF-MATCH']).toBe('*');
    expect(JSON.parse(String(renameInit.body))).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'Warranty Manager Upns',
    });

    const allUrls = fetchImpl.mock.calls.map((c) => c[0] as string).join('\n');
    const allBodies = fetchImpl.mock.calls
      .map((c) => String((c[1] as RequestInit | undefined)?.body ?? ''))
      .join('\n');
    expect(allUrls).not.toMatch(/\/fields\/add($|\?)/i);
    expect(allBodies).not.toContain('SP.FieldCreationInformation');
    expect(allBodies).not.toMatch(/"parameters"\s*:\s*\{/);
  });

  it('createField emits FieldTypeKind 2 with no RichText for Text fields', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: 'registry-guid' }))
      .mockResolvedValueOnce(jsonResponse({ Id: 'field-guid' }, 201))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const adapter = createRestListAdapter({
      siteUrl: SITE_URL,
      tokenService: tokenService(),
      fetchImpl,
    });
    const list = await adapter.getList('Legacy Project Fallback Registry');
    await list!.createField({
      internalName: 'procoreProject',
      displayName: 'Procore Project',
      type: 'Text',
    });
    const [, createInit] = fetchImpl.mock.calls[1] as [string, RequestInit];
    const createBody = JSON.parse(String(createInit.body));
    expect(createBody).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'procoreProject',
      FieldTypeKind: 2,
      Required: false,
      StaticName: 'procoreProject',
    });
    expect(createBody).not.toHaveProperty('RichText');
  });

  it('createField throws when the create POST returns a non-OK status (never silently noop)', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: 'list-guid' }))
      .mockResolvedValueOnce(textResponse('column already exists', 400));
    const adapter = createRestListAdapter({
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
    ).rejects.toThrow(/field create failed.*HTTP 400/);
  });

  it('createField throws when the MERGE rename returns a non-OK status', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: 'list-guid' }))
      .mockResolvedValueOnce(jsonResponse({ Id: 'field-guid' }, 201))
      .mockResolvedValueOnce(textResponse('conflict', 409));
    const adapter = createRestListAdapter({
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
    ).rejects.toThrow(/field rename failed.*HTTP 409/);
  });
});

describe('main propagates adapter failures (no silent success path)', () => {
  it('rejects when getList throws an auth error, leaving stdout empty', async () => {
    const out: string[] = [];
    const throwingAdapter: IListAdapter = {
      async getList(_title: string) {
        throw new Error('Unauthorized: 401');
      },
    };
    await expect(
      main(
        { apply: false, json: true },
        deps(throwingAdapter, out),
        'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      ),
    ).rejects.toThrow(/Unauthorized/);
    expect(out).toEqual([]);
  });
});

describe('report + exit contract', () => {
  it('includes required report fields and next commands', () => {
    const target: IProvisionTargetReport = {
      listTitle: 'Projects',
      listFound: true,
      plannedCreates: ['projectManagerUpns'],
      liveVerified: ['leadEstimatorUpns'],
      blockers: [],
      appliedCreates: [],
    };
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      apply: false,
      startedAtUtc: '2026-05-14T00:00:00.000Z',
      completedAtUtc: '2026-05-14T00:00:01.000Z',
      targets: [target],
    });

    expect(report.nextCommands.length).toBeGreaterThan(0);
    expect(report.identityLaneWarning.runtimeLane).toContain('UAMI');
    expect(report.identityLaneWarning.operatorLane).toContain('HB SharePoint Creator');
    expect(report.success).toBe(true);
    expect(selectExitCode(report)).toBe(0);
  });

  it('returns non-zero when blockers exist', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      apply: true,
      startedAtUtc: '2026-05-14T00:00:00.000Z',
      completedAtUtc: '2026-05-14T00:00:01.000Z',
      targets: [
        {
          listTitle: 'Projects',
          listFound: true,
          plannedCreates: [],
          liveVerified: [],
          blockers: [
            {
              listTitle: 'Projects',
              fieldInternalName: 'leadEstimatorUpns',
              desiredType: 'MultiLineText',
              liveType: 'Text',
              reason: 'mismatch',
            },
          ],
          appliedCreates: [],
        },
      ],
    });

    expect(report.success).toBe(false);
    expect(report.hasBlockingDrift).toBe(true);
    expect(selectExitCode(report)).toBe(1);
  });

  it('marks list-missing as unsuccessful', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      apply: true,
      startedAtUtc: '2026-05-14T00:00:00.000Z',
      completedAtUtc: '2026-05-14T00:00:01.000Z',
      targets: [
        {
          listTitle: 'Legacy Project Fallback Registry',
          listFound: false,
          plannedCreates: [],
          liveVerified: [],
          blockers: [],
          appliedCreates: [],
        },
      ],
    });

    expect(report.listsMissing).toBe(true);
    expect(report.success).toBe(false);
    expect(selectExitCode(report)).toBe(1);
  });
});
