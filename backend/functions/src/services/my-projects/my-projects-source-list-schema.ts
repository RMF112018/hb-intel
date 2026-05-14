import {
  MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS,
  MY_PROJECT_ASSIGNMENT_ROLE_BY_INTERNAL_FIELD,
} from '@hbc/models/myWork';
import { LEGACY_FALLBACK_REGISTRY_LIST_TITLE } from '../legacy-fallback/list-descriptors.js';
import { PROJECTS_LIST_NAME } from '../projects-list-contract.js';
import type { IFieldDefinition } from '../sharepoint-service.js';

export const MY_PROJECTS_SOURCE_LIST_SCHEMA_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

export const MY_PROJECTS_SOURCE_LIST_TITLE_PROJECTS = PROJECTS_LIST_NAME;
export const MY_PROJECTS_SOURCE_LIST_TITLE_LEGACY_REGISTRY = LEGACY_FALLBACK_REGISTRY_LIST_TITLE;

export interface MyProjectsSourceListTarget {
  readonly listTitle: string;
  readonly allowCreateList: false;
  readonly fields: readonly IFieldDefinition[];
}

export interface MyProjectsSourceListSchemaDescriptor {
  readonly siteUrl: string;
  readonly targets: readonly MyProjectsSourceListTarget[];
}

function roleFieldDisplayName(internalName: (typeof MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS)[number]): string {
  return `${MY_PROJECT_ASSIGNMENT_ROLE_BY_INTERNAL_FIELD[internalName].displayLabel} Upns`;
}

export const MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS: readonly IFieldDefinition[] =
  MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS.map((internalName) => ({
    internalName,
    displayName: roleFieldDisplayName(internalName),
    type: 'MultiLineText',
    required: false,
    indexed: false,
  }));

export const MY_PROJECTS_SOURCE_LIST_REGISTRY_EXTRA_FIELDS: readonly IFieldDefinition[] = [
  {
    internalName: 'procoreProject',
    displayName: 'Procore Project',
    type: 'Text',
    required: false,
    indexed: false,
  },
];

export const MY_PROJECTS_SOURCE_LIST_PROJECTS_TARGET: MyProjectsSourceListTarget = {
  listTitle: MY_PROJECTS_SOURCE_LIST_TITLE_PROJECTS,
  allowCreateList: false,
  fields: MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS,
};

export const MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET: MyProjectsSourceListTarget = {
  listTitle: MY_PROJECTS_SOURCE_LIST_TITLE_LEGACY_REGISTRY,
  allowCreateList: false,
  fields: [...MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS, ...MY_PROJECTS_SOURCE_LIST_REGISTRY_EXTRA_FIELDS],
};

export const MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR: MyProjectsSourceListSchemaDescriptor = {
  siteUrl: MY_PROJECTS_SOURCE_LIST_SCHEMA_SITE_URL,
  targets: [
    MY_PROJECTS_SOURCE_LIST_PROJECTS_TARGET,
    MY_PROJECTS_SOURCE_LIST_LEGACY_REGISTRY_TARGET,
  ],
};
