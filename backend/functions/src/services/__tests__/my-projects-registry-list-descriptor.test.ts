import { describe, expect, it } from 'vitest';
import {
  DEACTIVATION_REASON_CHOICES,
  LAUNCH_ACTION_STATE_CHOICES,
  MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR,
  MY_PROJECTS_REGISTRY_LIST_DESCRIPTORS,
  MY_PROJECTS_REGISTRY_LIST_GOVERNANCE,
  MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL,
  MY_PROJECTS_REGISTRY_LIST_TITLE,
  PROJECTION_SOURCE_CHOICES,
  SHAREPOINT_ACTION_KIND_CHOICES,
  SHAREPOINT_ACTION_STATE_CHOICES,
  getMyProjectsRegistryListHostSiteUrl,
} from '../my-projects-projection/registry-list-descriptor.js';

function field(internalName: string) {
  return MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields.find(
    (entry) => entry.internalName === internalName,
  );
}

describe('My Projects Registry — list descriptor', () => {
  it('locks list identity and host site to MyDashboard', () => {
    expect(MY_PROJECTS_REGISTRY_LIST_TITLE).toBe('My Projects Registry');
    expect(MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    );
    expect(getMyProjectsRegistryListHostSiteUrl()).toBe(MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL);
    expect(MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.title).toBe(MY_PROJECTS_REGISTRY_LIST_TITLE);
    expect(MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.template).toBe(100);
    expect(MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.description.length).toBeGreaterThan(0);
  });

  it('exports the descriptor through the singleton barrel', () => {
    expect(MY_PROJECTS_REGISTRY_LIST_DESCRIPTORS).toHaveLength(1);
    expect(MY_PROJECTS_REGISTRY_LIST_DESCRIPTORS[0]).toBe(MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR);
  });

  it('exposes governance posture: not hidden, broken inheritance, backend-only read', () => {
    expect(MY_PROJECTS_REGISTRY_LIST_GOVERNANCE).toEqual({
      hidden: false,
      breakPermissionInheritance: true,
      runtimeReadModel: 'backend-only',
    });
  });

  it('locks the projection source choice values', () => {
    expect([...PROJECTION_SOURCE_CHOICES]).toEqual(['projects-only', 'merged', 'legacy-only']);
    expect(field('ProjectionSource')?.type).toBe('Choice');
    expect(field('ProjectionSource')?.choices).toEqual([...PROJECTION_SOURCE_CHOICES]);
  });

  it('locks the SharePoint action choice values', () => {
    expect([...SHAREPOINT_ACTION_STATE_CHOICES]).toEqual(['available', 'unavailable']);
    expect([...SHAREPOINT_ACTION_KIND_CHOICES]).toEqual(['project-site', 'legacy-folder', 'none']);
    expect(field('SharePointActionState')?.choices).toEqual([...SHAREPOINT_ACTION_STATE_CHOICES]);
    expect(field('SharePointActionKind')?.choices).toEqual([...SHAREPOINT_ACTION_KIND_CHOICES]);
  });

  it('locks the launch action state choices shared by Procore/BC/DC', () => {
    expect([...LAUNCH_ACTION_STATE_CHOICES]).toEqual(['available', 'unavailable']);
    for (const fieldName of [
      'ProcoreActionState',
      'BuildingConnectedActionState',
      'DocumentCrunchActionState',
    ] as const) {
      expect(field(fieldName)?.type).toBe('Choice');
      expect(field(fieldName)?.choices).toEqual([...LAUNCH_ACTION_STATE_CHOICES]);
    }
  });

  it('locks the deactivation reason choice values', () => {
    expect([...DEACTIVATION_REASON_CHOICES]).toEqual([
      'assignment-removed',
      'project-source-deleted',
      'registry-source-deleted',
      'merge-topology-changed',
      'rebuild-obsolete',
      'manual-repair',
      'other',
    ]);
    expect(field('DeactivationReason')?.choices).toEqual([...DEACTIVATION_REASON_CHOICES]);
  });

  it('declares the locked indexed-field set', () => {
    const indexed = MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields
      .filter((entry) => entry.indexed)
      .map((entry) => entry.internalName)
      .sort();
    expect(indexed).toEqual(
      ['IsActive', 'LegacyRegistryItemId', 'ProjectionKey', 'ProjectsListItemId', 'UserUpn'].sort(),
    );
  });

  it('declares ProjectionKey as the only unique-enforced field', () => {
    const unique = MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR.fields
      .filter((entry) => entry.unique)
      .map((entry) => entry.internalName);
    expect(unique).toEqual(['ProjectionKey']);
    expect(field('ProjectionKey')?.indexed).toBe(true);
  });

  it('locks per-field types for required core projection columns', () => {
    expect(field('ProjectionKey')?.type).toBe('Text');
    expect(field('RecordKey')?.type).toBe('Text');
    expect(field('UserUpn')?.type).toBe('Text');
    expect(field('IsActive')?.type).toBe('Boolean');
    expect(field('ProjectionVersion')?.type).toBe('Text');
    expect(field('ProjectionContentHash')?.type).toBe('Text');
  });

  it('locks per-field types for project display columns', () => {
    expect(field('ProjectNumber')?.type).toBe('Text');
    expect(field('ProjectName')?.type).toBe('Text');
    expect(field('ProjectStage')?.type).toBe('Text');
  });

  it('locks per-field types for assignment/provenance columns', () => {
    expect(field('AssignmentRolesJson')?.type).toBe('MultiLineText');
    expect(field('ProjectsListItemId')?.type).toBe('Number');
    expect(field('LegacyRegistryItemId')?.type).toBe('Number');
    expect(field('LegacyMatchedProjectListItemId')?.type).toBe('Number');
    expect(field('FallbackMatchMethod')?.type).toBe('Text');
    expect(field('FallbackMatchConfidence')?.type).toBe('Text');
  });

  it('locks per-field types for SharePoint launch action columns', () => {
    expect(field('SharePointActionState')?.type).toBe('Choice');
    expect(field('SharePointActionKind')?.type).toBe('Choice');
    expect(field('SharePointActionLabel')?.type).toBe('Text');
    expect(field('SharePointActionHref')?.type).toBe('Text');
  });

  it('locks per-field types for Procore launch action columns', () => {
    expect(field('ProcoreActionState')?.type).toBe('Choice');
    expect(field('ProcoreProject')?.type).toBe('Text');
    expect(field('ProcoreActionLabel')?.type).toBe('Text');
    expect(field('ProcoreActionHref')?.type).toBe('Text');
  });

  it('locks per-field types for BuildingConnected launch action columns', () => {
    expect(field('BuildingConnectedActionState')?.type).toBe('Choice');
    expect(field('BuildingConnectedActionLabel')?.type).toBe('Text');
    expect(field('BuildingConnectedActionHref')?.type).toBe('Text');
  });

  it('locks per-field types for Document Crunch launch action columns', () => {
    expect(field('DocumentCrunchActionState')?.type).toBe('Choice');
    expect(field('DocumentCrunchActionLabel')?.type).toBe('Text');
    expect(field('DocumentCrunchActionHref')?.type).toBe('Text');
  });

  it('locks per-field types for warning/operational columns', () => {
    expect(field('WarningsJson')?.type).toBe('MultiLineText');
    expect(field('LastProjectedAtUtc')?.type).toBe('DateTime');
    expect(field('MaxSourceModifiedUtc')?.type).toBe('DateTime');
    expect(field('ProjectionBatchId')?.type).toBe('Text');
    expect(field('DeactivatedAtUtc')?.type).toBe('DateTime');
    expect(field('DeactivationReason')?.type).toBe('Choice');
  });

  it('defaults IsActive to truthy so newly projected rows are visible without a separate write', () => {
    expect(field('IsActive')?.defaultValue).toBe('1');
  });

  it('does not redeclare the built-in Title column (managed by SharePoint)', () => {
    expect(field('Title')).toBeUndefined();
  });

  it('preserves required-flag semantics from the package contract', () => {
    expect(field('ProjectionKey')?.required).toBe(true);
    expect(field('RecordKey')?.required).toBe(true);
    expect(field('UserUpn')?.required).toBe(true);
    expect(field('IsActive')?.required).toBe(true);
    expect(field('ProjectionVersion')?.required).toBe(true);
    expect(field('ProjectionContentHash')?.required).toBe(true);
    expect(field('AssignmentRolesJson')?.required).toBe(true);
    expect(field('LastProjectedAtUtc')?.required).toBe(true);
    expect(field('ProjectionBatchId')?.required).toBe(true);
    expect(field('ProjectStage')?.required).toBeUndefined();
    expect(field('MaxSourceModifiedUtc')?.required).toBeUndefined();
    expect(field('DeactivatedAtUtc')?.required).toBeUndefined();
    expect(field('DeactivationReason')?.required).toBeUndefined();
  });
});
