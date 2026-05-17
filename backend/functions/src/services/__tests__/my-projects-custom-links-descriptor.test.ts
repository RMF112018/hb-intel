import { describe, expect, it } from 'vitest';
import {
  MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR,
  MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTORS,
  MY_PROJECTS_CUSTOM_LINKS_LIST_HOST_SITE_URL,
  MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
  MY_PROJECTS_CUSTOM_LINKS_VISIBILITY_CHOICES,
  getMyProjectsCustomLinksListHostSiteUrl,
} from '../my-projects-custom-links/list-descriptor.js';

function field(internalName: string) {
  return MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields.find(
    (entry) => entry.internalName === internalName,
  );
}

describe('My Projects Custom Links — list descriptor', () => {
  it('locks list identity and host site', () => {
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE).toBe('My Projects Custom Links');
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_HOST_SITE_URL).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );
    expect(getMyProjectsCustomLinksListHostSiteUrl()).toBe(
      MY_PROJECTS_CUSTOM_LINKS_LIST_HOST_SITE_URL,
    );
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.title).toBe(
      MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
    );
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.description).toBe(
      'User-authored custom resource links for My Dashboard My Projects.',
    );
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.template).toBe(100);
  });

  it('exports the descriptor through the singleton barrel', () => {
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTORS).toHaveLength(1);
    expect(MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTORS[0]).toBe(
      MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR,
    );
  });

  it('locks the canonical visibility choice values', () => {
    expect([...MY_PROJECTS_CUSTOM_LINKS_VISIBILITY_CHOICES]).toEqual(['private', 'project']);
    expect(field('Visibility')?.type).toBe('Choice');
    expect(field('Visibility')?.choices).toEqual(['private', 'project']);
  });

  it('declares the locked indexed-field set required by the read provider join', () => {
    const indexed = MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR.fields
      .filter((entry) => entry.indexed)
      .map((entry) => entry.internalName)
      .sort();
    expect(indexed).toEqual(
      [
        'CreatedByUpn',
        'IsActive',
        'LegacyRegistryItemId',
        'ProjectNumber',
        'ProjectYear',
        'ProjectsListItemId',
        'Visibility',
      ].sort(),
    );
  });

  it('locks per-field types per the locked field contract', () => {
    expect(field('ProjectNumber')?.type).toBe('Text');
    expect(field('ProjectYear')?.type).toBe('Number');
    expect(field('ProjectsListItemId')?.type).toBe('Number');
    expect(field('LegacyRegistryItemId')?.type).toBe('Number');
    expect(field('LinkUrl')?.type).toBe('Text');
    expect(field('Visibility')?.type).toBe('Choice');
    expect(field('CreatedByUpn')?.type).toBe('Text');
    expect(field('CreatedByOid')?.type).toBe('Text');
    expect(field('CreatedAtUtc')?.type).toBe('DateTime');
    expect(field('UpdatedAtUtc')?.type).toBe('DateTime');
    expect(field('DeletedAtUtc')?.type).toBe('DateTime');
    expect(field('DeletedByUpn')?.type).toBe('Text');
    expect(field('DeletedByOid')?.type).toBe('Text');
    expect(field('IsActive')?.type).toBe('Boolean');
  });

  it('defaults IsActive to truthy so newly created links are visible without a write-time stamp', () => {
    expect(field('IsActive')?.defaultValue).toBe('1');
  });

  it('does not redeclare the built-in Title column (Title carries the link display title)', () => {
    expect(field('Title')).toBeUndefined();
    expect(field('LinkTitle')).toBeUndefined();
  });
});
