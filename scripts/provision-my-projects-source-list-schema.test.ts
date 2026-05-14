import { describe, expect, it, vi } from 'vitest';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import {
  buildProvisioningReport,
  main,
  parseArgs,
  resolveSiteUrl,
  selectExitCode,
  validateHBCentralSiteUrl,
  type IListAdapter,
  type IMainDeps,
  type IProvisionTargetReport,
} from './provision-my-projects-source-list-schema';

function field(internalName: string, type: 'Text' | 'Note'): {
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

function deps(listAdapter: IListAdapter): IMainDeps {
  return {
    listAdapter,
    now: () => '2026-05-14T00:00:00.000Z',
    stdout: () => {},
  };
}

describe('parseArgs', () => {
  it('defaults to dry-run', () => {
    expect(parseArgs([])).toEqual({ apply: false, json: false, siteUrl: undefined });
  });

  it('parses apply/json/site-url', () => {
    expect(parseArgs(['--apply', '--json', '--site-url', 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'])).toEqual({
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
    expect(resolveSiteUrl({ apply: false, json: false, siteUrl: 'https://x' }, { SHAREPOINT_PROJECTS_SITE_URL: 'https://y' } as NodeJS.ProcessEnv)).toBe('https://x');
  });

  it('validates HBCentral lock', () => {
    expect(validateHBCentralSiteUrl('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/')).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );
    expect(() => validateHBCentralSiteUrl('https://example.com/sites/HBCentral')).toThrow(/must be HBCentral/);
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
  });

  it('wrong-type field fails apply', async () => {
    const projectsCreate = vi.fn(async (_f: IFieldDefinition) => {});

    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: { fields: [field('leadEstimatorUpns', 'Text')], createSpy: projectsCreate },
          registry: { fields: [field('procoreProject', 'Text')] },
        }),
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(1);
    expect(projectsCreate).not.toHaveBeenCalled();
  });

  it('missing list fails with no mutation', async () => {
    const code = await main(
      { apply: true, json: true },
      deps(
        fakeAdapter({
          projects: { fields: [] },
        }),
      ),
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );

    expect(code).toBe(1);
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
    expect(selectExitCode(report)).toBe(1);
  });
});
