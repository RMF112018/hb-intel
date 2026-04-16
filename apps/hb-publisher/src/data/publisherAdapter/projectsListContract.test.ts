import { describe, expect, it } from 'vitest';
import {
  PROJECTS_LIST_FIELDS,
  PROJECTS_LIST_SELECT_FIELDS,
  PROJECTS_LIST_TITLE,
  buildProjectsListItemsUrl,
  projectsListFetchLabel,
} from './projectsListContract.js';

const HOST = 'https://tenant.sharepoint.com/sites/HBCentral';

describe('PROJECTS_LIST_FIELDS contract', () => {
  it('mirrors the tenant CSV-import field mapping so domain code does not inline field_N literals', () => {
    expect(PROJECTS_LIST_FIELDS).toEqual({
      displayTitle: 'Title',
      projectId: 'field_1',
      projectNumber: 'field_2',
      projectName: 'field_3',
      projectLocation: 'field_4',
    });
  });

  it('drives the uniform $select field list used across every Projects read', () => {
    expect(PROJECTS_LIST_SELECT_FIELDS).toEqual([
      'Title',
      'field_1',
      'field_2',
      'field_3',
      'field_4',
    ]);
  });
});

describe('buildProjectsListItemsUrl', () => {
  it('falls back to getbytitle when no Projects list GUID is available and labels the binding kind', () => {
    const binding = buildProjectsListItemsUrl({
      hostSiteUrl: HOST,
      filter: "substringof('Alpha',field_3)",
      orderBy: PROJECTS_LIST_FIELDS.projectName,
      top: 20,
    });
    expect(binding.kind).toBe('title');
    expect(binding.url).toContain(
      `/_api/web/lists/getbytitle('${encodeURIComponent(PROJECTS_LIST_TITLE)}')/items?`,
    );
    expect(binding.url).toContain(
      '$select=Title,field_1,field_2,field_3,field_4',
    );
    expect(binding.url).toContain('$orderby=field_3');
    expect(binding.url).toContain('$top=20');
    expect(decodeURIComponent(binding.url)).toContain(
      "$filter=substringof('Alpha',field_3)",
    );
  });

  it('upgrades to GUID binding via @hbc/sharepoint-platform when a list GUID is supplied', () => {
    const guid = '2c1dbf2e-4f37-4fb0-b1ab-55a1c9f5a111';
    const binding = buildProjectsListItemsUrl({
      hostSiteUrl: HOST,
      listId: guid,
      filter: "substringof('Beta',field_3)",
      orderBy: PROJECTS_LIST_FIELDS.projectName,
      top: 5,
    });
    expect(binding.kind).toBe('guid');
    expect(binding.url).toContain(`/_api/web/lists(guid'${guid}')/items?`);
    expect(binding.url).not.toContain('getbytitle');
    expect(binding.url).toContain(
      '$select=Title,field_1,field_2,field_3,field_4',
    );
    expect(binding.url).toContain('$orderby=field_3');
    expect(binding.url).toContain('$top=5');
  });

  it('treats whitespace-only listId as no GUID so a stale override never forces guid binding', () => {
    const binding = buildProjectsListItemsUrl({
      hostSiteUrl: HOST,
      listId: '   ',
      filter: 'x',
    });
    expect(binding.kind).toBe('title');
  });

  it('omits optional query fragments cleanly when not supplied', () => {
    const binding = buildProjectsListItemsUrl({ hostSiteUrl: HOST });
    expect(binding.url.endsWith('?$select=Title,field_1,field_2,field_3,field_4')).toBe(true);
    expect(binding.url).not.toContain('$filter=');
    expect(binding.url).not.toContain('$orderby=');
    expect(binding.url).not.toContain('$top=');
  });

  it('URL-encodes the raw $filter expression so operators and quotes are transport-safe', () => {
    const binding = buildProjectsListItemsUrl({
      hostSiteUrl: HOST,
      filter: "substringof('two words',field_3) or substringof('two words',field_2)",
    });
    expect(binding.url).not.toContain(' or ');
    expect(decodeURIComponent(binding.url)).toContain(
      "substringof('two words',field_3) or substringof('two words',field_2)",
    );
  });

  it('trims trailing slash on the host URL so the composed REST path stays canonical', () => {
    const binding = buildProjectsListItemsUrl({ hostSiteUrl: `${HOST}/` });
    expect(binding.url.startsWith(`${HOST}/_api/web/`)).toBe(true);
  });
});

describe('projectsListFetchLabel', () => {
  it('narrates guid-bound reads and title-bound reads differently so operator errors are truthful', () => {
    expect(projectsListFetchLabel('guid')).toBe(`${PROJECTS_LIST_TITLE} list (guid-bound)`);
    expect(projectsListFetchLabel('title')).toBe(`${PROJECTS_LIST_TITLE} list (title-bound)`);
  });
});
