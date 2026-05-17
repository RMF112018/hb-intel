/**
 * My Projects Custom Links — list descriptor and host-site contract.
 *
 * Backs the user-authored "More Project Resources" custom-link registry
 * surfaced under My Dashboard → My Projects. The list lives on HBCentral
 * alongside the Projects and Legacy Project Fallback Registry lists so the
 * my-project-links provider can co-resolve custom links with the same
 * actor-entitlement filter without crossing a site boundary.
 *
 * Source of truth for the field contract is package doc
 * `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.12 - m-p-add-links/`
 * (`02_SharePoint_Custom_Links_List_Schema.md` +
 * `supporting/Custom_Links_Field_Contract.md`). Built-in `Title` carries the
 * custom-link display title — do NOT add a separate `LinkTitle` column.
 *
 * Server-side rules enforced at the write seam (Prompt 03), not here:
 *   - One-of `ProjectsListItemId` / `LegacyRegistryItemId` must be supplied
 *   - Actor must be currently entitled to the referenced project
 *   - Soft-delete sets `IsActive=false` + `DeletedAtUtc` + `DeletedByUpn`
 */

import type { IListDefinition } from '../sharepoint-service.js';

export const MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE = 'My Projects Custom Links';

export const MY_PROJECTS_CUSTOM_LINKS_LIST_HOST_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

/** Visibility choice values stored on the `Visibility` Choice field. */
export const MY_PROJECTS_CUSTOM_LINKS_VISIBILITY_CHOICES = ['private', 'project'] as const;

export type MyProjectsCustomLinkVisibility =
  (typeof MY_PROJECTS_CUSTOM_LINKS_VISIBILITY_CHOICES)[number];

export const MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
  description: 'User-authored custom resource links for My Dashboard My Projects.',
  template: 100,
  fields: [
    { internalName: 'ProjectNumber', displayName: 'Project Number', type: 'Text', indexed: true },
    { internalName: 'ProjectYear', displayName: 'Project Year', type: 'Number', indexed: true },
    {
      internalName: 'ProjectsListItemId',
      displayName: 'Projects List Item Id',
      type: 'Number',
      indexed: true,
    },
    {
      internalName: 'LegacyRegistryItemId',
      displayName: 'Legacy Registry Item Id',
      type: 'Number',
      indexed: true,
    },
    { internalName: 'LinkUrl', displayName: 'Link Url', type: 'Text' },
    {
      internalName: 'Visibility',
      displayName: 'Visibility',
      type: 'Choice',
      choices: [...MY_PROJECTS_CUSTOM_LINKS_VISIBILITY_CHOICES],
      indexed: true,
    },
    { internalName: 'CreatedByUpn', displayName: 'Created By Upn', type: 'Text', indexed: true },
    { internalName: 'CreatedByOid', displayName: 'Created By Oid', type: 'Text' },
    { internalName: 'CreatedAtUtc', displayName: 'Created At Utc', type: 'DateTime' },
    { internalName: 'UpdatedAtUtc', displayName: 'Updated At Utc', type: 'DateTime' },
    { internalName: 'DeletedAtUtc', displayName: 'Deleted At Utc', type: 'DateTime' },
    { internalName: 'DeletedByUpn', displayName: 'Deleted By Upn', type: 'Text' },
    { internalName: 'DeletedByOid', displayName: 'Deleted By Oid', type: 'Text' },
    {
      internalName: 'IsActive',
      displayName: 'Is Active',
      type: 'Boolean',
      indexed: true,
      defaultValue: '1',
    },
  ],
};

export const MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTORS: readonly IListDefinition[] = [
  MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR,
];

export function getMyProjectsCustomLinksListHostSiteUrl(): string {
  return MY_PROJECTS_CUSTOM_LINKS_LIST_HOST_SITE_URL;
}
