/**
 * Deterministic provisioning-plan generator for the Foleon MVP
 * SharePoint lists. Consumed by the dry-run CLI and by snapshot
 * tests. Never touches tenant state — the plan is an in-memory
 * description of what a tenant admin must provision.
 */

import {
  FOLEON_CONTENT_REGISTRY_SCHEMA,
  FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA,
  FOLEON_INTERACTION_EVENTS_SCHEMA,
  FOLEON_SYNC_RUNS_SCHEMA,
  type FoleonListSchema,
} from './foleonListSchemas.js';

export interface FoleonProvisioningListPlan {
  readonly displayName: string;
  readonly internalName: string;
  readonly template: 'Generic List';
  readonly versioning: boolean;
  readonly attachmentsEnabled: boolean;
  readonly fields: ReadonlyArray<{
    readonly internalName: string;
    readonly displayName: string;
    readonly type: string;
    readonly required: boolean;
    readonly indexedAtProvisioning: boolean;
    readonly recommendedIndex: boolean;
    readonly filterSafe: boolean;
    readonly unique: boolean;
    readonly choices?: ReadonlyArray<string>;
    readonly lookupTarget?: string;
  }>;
  readonly indexes: ReadonlyArray<string>;
  readonly requiredIndexedFields: ReadonlyArray<string>;
  readonly views: ReadonlyArray<{
    readonly name: string;
    readonly filter: string;
    readonly sort: string;
  }>;
  readonly fieldCount: number;
  readonly indexedFieldCount: number;
}

export interface FoleonProvisioningPlan {
  readonly generatedAt: string;
  readonly site: string;
  readonly status: 'dry-run';
  readonly lists: ReadonlyArray<FoleonProvisioningListPlan>;
}

const PROVISIONING_SITE = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

export function buildFoleonProvisioningListPlan(
  schema: FoleonListSchema,
): FoleonProvisioningListPlan {
  const fields = schema.fields.map((field) => ({
    internalName: field.internalName,
    displayName: field.displayName,
    type: field.type,
    required: field.required,
    indexedAtProvisioning: field.indexedAtProvisioning,
    recommendedIndex: !!field.recommendedIndex,
    filterSafe: !!field.filterSafe,
    unique: !!field.unique,
    ...(field.choices ? { choices: field.choices } : {}),
    ...(field.lookupTarget ? { lookupTarget: field.lookupTarget } : {}),
  }));
  const indexes = schema.fields
    .filter((field) => field.indexedAtProvisioning)
    .map((field) => field.internalName);
  return {
    displayName: schema.displayName,
    internalName: schema.internalName,
    template: 'Generic List',
    versioning: schema.internalName !== 'HB_FoleonInteractionEvents',
    attachmentsEnabled: false,
    fields,
    indexes,
    requiredIndexedFields: schema.requiredIndexedFields,
    views: schema.views,
    fieldCount: fields.length,
    indexedFieldCount: indexes.length,
  };
}

export function buildFoleonProvisioningPlan(options?: {
  readonly now?: Date;
  readonly site?: string;
}): FoleonProvisioningPlan {
  return {
    generatedAt: (options?.now ?? new Date()).toISOString(),
    site: options?.site ?? PROVISIONING_SITE,
    status: 'dry-run',
    lists: [
      buildFoleonProvisioningListPlan(FOLEON_CONTENT_REGISTRY_SCHEMA),
      buildFoleonProvisioningListPlan(FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA),
      buildFoleonProvisioningListPlan(FOLEON_INTERACTION_EVENTS_SCHEMA),
      buildFoleonProvisioningListPlan(FOLEON_SYNC_RUNS_SCHEMA),
    ],
  };
}
