import { MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS } from '@hbc/models/myWork';
import { describe, expect, it } from 'vitest';
import {
  MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET,
  MY_PROJECTS_SOURCE_LIST_PROJECTS_TARGET,
  MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS,
  MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR,
  MY_PROJECTS_SOURCE_LIST_SCHEMA_SITE_URL,
} from '../my-projects/my-projects-source-list-schema.js';

describe('my projects source-list schema descriptor', () => {
  it('locks source site to HBCentral', () => {
    expect(MY_PROJECTS_SOURCE_LIST_SCHEMA_SITE_URL).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );
    expect(MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR.siteUrl).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );
  });

  it('includes exactly 14 Projects role fields derived from canonical model', () => {
    expect(MY_PROJECTS_SOURCE_LIST_PROJECTS_TARGET.allowCreateList).toBe(false);
    expect(MY_PROJECTS_SOURCE_LIST_PROJECTS_TARGET.fields).toHaveLength(14);
    expect(MY_PROJECTS_SOURCE_LIST_PROJECTS_TARGET.fields.map((f) => f.internalName)).toEqual(
      [...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS],
    );
  });

  it('includes exactly 14 Registry role fields plus procoreProject', () => {
    expect(MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET.allowCreateList).toBe(false);
    expect(MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET.fields).toHaveLength(15);
    expect(MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET.fields.at(-1)?.internalName).toBe(
      'procoreProject',
    );
  });

  it('sets role fields to MultiLineText and not required/indexed', () => {
    expect(MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS).toHaveLength(14);
    for (const field of MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS) {
      expect(field.type).toBe('MultiLineText');
      expect(field.required).toBe(false);
      expect(field.indexed).toBe(false);
    }
  });

  it('sets procoreProject to Text and not required/indexed', () => {
    const procoreField = MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET.fields.find(
      (field) => field.internalName === 'procoreProject',
    );
    expect(procoreField).toBeDefined();
    expect(procoreField?.type).toBe('Text');
    expect(procoreField?.required).toBe(false);
    expect(procoreField?.indexed).toBe(false);
  });

  it('excludes unrelated fields such as FolderWebUrl', () => {
    const allInternalNames = MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR.targets.flatMap((target) =>
      target.fields.map((field) => field.internalName),
    );
    expect(allInternalNames).not.toContain('FolderWebUrl');
  });
});
