import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { IFieldDefinition, IListDefinition } from '../sharepoint-service.js';

export const MY_PROJECTS_PROJECTION_STORAGE_SCHEMA_VERSION = '1.0.0';
export const MY_PROJECTS_PROJECTION_STORAGE_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

export const MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES = {
  registry: 'My Projects Registry',
  sourceSyncState: 'My Projects Projection Source Sync State',
  subscriptionState: 'My Projects Projection Subscription State',
  pendingWork: 'My Projects Projection Pending Work',
  controlState: 'My Projects Projection Control State',
  runs: 'My Projects Projection Runs',
  syncFailures: 'My Projects Projection Sync Failures',
} as const;

export type StorageSchemaFieldType =
  | 'Text'
  | 'Number'
  | 'DateTime'
  | 'Boolean'
  | 'Choice'
  | 'User'
  | 'URL'
  | 'Lookup'
  | 'MultiLineText';

export interface IStorageSchemaField {
  readonly internalName: string;
  readonly type: string;
  readonly required?: boolean;
  readonly indexed?: boolean;
  readonly unique?: boolean;
  readonly choices?: readonly string[];
  readonly default?: string | number | boolean;
}

export interface IStorageSchemaList {
  readonly title: string;
  readonly classification: string;
  readonly purpose: string;
  readonly fields: readonly IStorageSchemaField[];
}

export interface IStorageSchemaDocument {
  readonly schemaVersion: string;
  readonly targetSiteUrl: string;
  readonly lists: readonly IStorageSchemaList[];
}

function resolveSchemaPath(): string {
  const relativePath =
    'docs/architecture/plans/MASTER/spfx/my-dashboard/B05.16 - m-p-sp-cache/resources/My_Projects_SharePoint_Storage_Schema.json';
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), '..', relativePath),
    path.resolve(process.cwd(), '..', '..', relativePath),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return candidates[0];
}

function toFieldType(input: string): StorageSchemaFieldType {
  if (input === 'Note') return 'MultiLineText';
  if (input === 'Text') return 'Text';
  if (input === 'Number') return 'Number';
  if (input === 'DateTime') return 'DateTime';
  if (input === 'Boolean') return 'Boolean';
  if (input === 'Choice') return 'Choice';
  if (input === 'User') return 'User';
  if (input === 'URL') return 'URL';
  if (input === 'Lookup') return 'Lookup';
  return 'Text';
}

function toDefaultValue(input: string | number | boolean | undefined): string | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'string') return input;
  if (typeof input === 'number') return String(input);
  return input ? '1' : '0';
}

export function loadMyProjectsProjectionStorageSchema(): IStorageSchemaDocument {
  const raw = readFileSync(resolveSchemaPath(), 'utf8');
  return JSON.parse(raw) as IStorageSchemaDocument;
}

export function buildMyProjectsProjectionStorageDescriptors(
  schema: IStorageSchemaDocument = loadMyProjectsProjectionStorageSchema(),
): readonly IListDefinition[] {
  return schema.lists.map((list) => ({
    title: list.title,
    description: list.purpose,
    template: 100,
    fields: list.fields.map(
      (field): IFieldDefinition => ({
        internalName: field.internalName,
        displayName: field.internalName,
        type: toFieldType(field.type),
        required: field.required ?? false,
        indexed: field.indexed ?? false,
        unique: field.unique ?? false,
        choices: field.choices ? [...field.choices] : undefined,
        defaultValue: toDefaultValue(field.default),
      }),
    ),
  }));
}

export const MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR =
  buildMyProjectsProjectionStorageDescriptors();

export function getMyProjectsProjectionStorageHostSiteUrl(): string {
  return MY_PROJECTS_PROJECTION_STORAGE_SITE_URL;
}
