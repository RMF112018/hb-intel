import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import {
  FOLEON_LIST_SCHEMAS,
  type FoleonFieldSchema,
  type FoleonListInternalName,
  type FoleonListSchema,
} from '../src/schema/foleonListSchemas.js';

export const PACKAGE_ROOT = resolve(import.meta.dirname, '..');
export const REPO_ROOT = resolve(PACKAGE_ROOT, '..', '..');
export const ASSETS_DIR = resolve(PACKAGE_ROOT, 'sharepoint', 'assets');
export const PACKAGE_SOLUTION_PATH = resolve(PACKAGE_ROOT, 'config', 'package-solution.json');

export const EXPECTED_FEATURE_ID = 'ae66c036-8036-4f10-bb63-0d75107e7ce9';
export const EXPECTED_VERSION = '1.0.20.0';
export const MAX_CUSTOM_INDEXED_FIELDS = 20;
export const EXPECTED_ELEMENT_MANIFESTS = ['elements.xml'] as const;
export const EXPECTED_SCHEMA_FILES = [
  'schema-content-registry.xml',
  'schema-homepage-placements.xml',
  'schema-interaction-events.xml',
  'schema-sync-runs.xml',
] as const;

export const EXPECTED_LISTS: ReadonlyArray<{
  readonly internalName: FoleonListInternalName;
  readonly title: string;
  readonly url: string;
  readonly customSchema: (typeof EXPECTED_SCHEMA_FILES)[number];
  readonly versioningEnabled: boolean;
  readonly disableAttachments: boolean;
}> = [
  {
    internalName: 'HB_FoleonContentRegistry',
    title: 'Foleon Content Registry',
    url: 'Lists/HB_FoleonContentRegistry',
    customSchema: 'schema-content-registry.xml',
    versioningEnabled: true,
    disableAttachments: true,
  },
  {
    internalName: 'HB_FoleonHomepagePlacements',
    title: 'Foleon Homepage Placements',
    url: 'Lists/HB_FoleonHomepagePlacements',
    customSchema: 'schema-homepage-placements.xml',
    versioningEnabled: true,
    disableAttachments: true,
  },
  {
    internalName: 'HB_FoleonInteractionEvents',
    title: 'Foleon Interaction Events',
    url: 'Lists/HB_FoleonInteractionEvents',
    customSchema: 'schema-interaction-events.xml',
    versioningEnabled: false,
    disableAttachments: true,
  },
  {
    internalName: 'HB_FoleonSyncRuns',
    title: 'Foleon Sync Runs',
    url: 'Lists/HB_FoleonSyncRuns',
    customSchema: 'schema-sync-runs.xml',
    versioningEnabled: true,
    disableAttachments: true,
  },
];

export const LAUNCH_INDEXES: Record<FoleonListInternalName, ReadonlyArray<string>> = {
  HB_FoleonContentRegistry: [
    'FoleonDocId',
    'ReaderKey',
    'HomepageSlot',
    'ArchiveGroup',
    'ActiveEdition',
    'LastEditorialUpdate',
    'PublishStatus',
    'IsVisible',
    'IsHomepageEligible',
    'PublishedOn',
    'DisplayFrom',
    'DisplayThrough',
    'SortRank',
    'AllowEmbed',
    'SyncSource',
  ],
  HB_FoleonHomepagePlacements: [
    'PlacementKey',
    'ContentLookup',
    'ContentIdCache',
    'IsActive',
    'DisplayFrom',
    'DisplayThrough',
    'SortRank',
    'LayoutVariant',
  ],
  HB_FoleonInteractionEvents: [
    'EventId',
    'EventType',
    'FoleonDocId',
    'ContentRegistryItemId',
    'UserEmailHash',
    'UserDepartment',
    'PageContext',
    'EventTimestamp',
    'SessionId',
  ],
  HB_FoleonSyncRuns: [
    'RunId',
    'RunKind',
    'Status',
    'StartedUtc',
    'EndedUtc',
    'TriggerSource',
    'ErrorCount',
    'CorrelationId',
  ],
};

export const UNIQUE_FIELDS: Record<FoleonListInternalName, ReadonlyArray<string>> = {
  HB_FoleonContentRegistry: ['FoleonDocId'],
  HB_FoleonHomepagePlacements: [],
  HB_FoleonInteractionEvents: ['EventId'],
  HB_FoleonSyncRuns: ['RunId'],
};

const KNOWN_VIEW_BUILTINS = new Set(['ID', 'LinkTitle', 'Title']);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
});

export interface ValidationCheck {
  readonly name: string;
  readonly pass: boolean;
  readonly details?: string;
}

export interface ParsedListInstance {
  readonly title: string;
  readonly url: string;
  readonly customSchema: string;
  readonly featureId: string;
  readonly templateType: string;
}

export interface ParsedField {
  readonly id?: string;
  readonly internalName: string;
  readonly displayName?: string;
  readonly type: string;
  readonly required: boolean;
  readonly indexed: boolean;
  readonly unique: boolean;
  readonly choices: ReadonlyArray<string>;
  readonly lookupList?: string;
  readonly showField?: string;
}

export interface ParsedView {
  readonly displayName: string;
  readonly defaultView: boolean;
  readonly fieldRefs: ReadonlyArray<string>;
}

export interface ParsedListSchema {
  readonly fileName: string;
  readonly internalName: FoleonListInternalName;
  readonly title: string;
  readonly url: string;
  readonly versioningEnabled: boolean;
  readonly disableAttachments: boolean;
  readonly fields: ReadonlyArray<ParsedField>;
  readonly views: ReadonlyArray<ParsedView>;
  readonly indexedFieldCount: number;
  readonly sha256: string;
}

export interface FoleonFeatureAssetModel {
  readonly packageSolution: PackageSolution;
  readonly assetFiles: ReadonlyArray<string>;
  readonly elementsXml: string;
  readonly elementsSha256: string;
  readonly listInstances: ReadonlyArray<ParsedListInstance>;
  readonly schemas: ReadonlyArray<ParsedListSchema>;
}

interface PackageSolution {
  readonly solution: {
    readonly name: string;
    readonly id: string;
    readonly version: string;
    readonly skipFeatureDeployment?: boolean;
    readonly features: ReadonlyArray<{
      readonly title: string;
      readonly id: string;
      readonly version: string;
      readonly assets?: {
        readonly elementManifests?: ReadonlyArray<string>;
        readonly elementFiles?: ReadonlyArray<string>;
      };
    }>;
  };
}

function asArray<T>(value: T | ReadonlyArray<T> | undefined): ReadonlyArray<T> {
  if (value === undefined) return [];
  return Array.isArray(value) ? (value as ReadonlyArray<T>) : [value as T];
}

function parseXmlObject<T>(xml: string, label: string): T {
  try {
    return parser.parse(xml) as T;
  } catch (error) {
    throw new Error(`${label} XML parse failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function sha256Text(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function loadText(path: string): string {
  if (!existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return readFileSync(path, 'utf8');
}

function fieldRefsFrom(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const node = value as { FieldRef?: unknown };
  return asArray(node.FieldRef as { Name?: string } | ReadonlyArray<{ Name?: string }>)
    .map((fieldRef) => fieldRef.Name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0);
}

function collectFieldRefs(node: unknown): string[] {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap((entry) => collectFieldRefs(entry));
  const record = node as Record<string, unknown>;
  const direct = fieldRefsFrom(record);
  const nested = Object.entries(record)
    .filter(([key]) => key !== 'FieldRef')
    .flatMap(([, value]) => collectFieldRefs(value));
  return [...direct, ...nested];
}

function choiceValuesFrom(field: Record<string, unknown>): ReadonlyArray<string> {
  const choicesNode = field.CHOICES;
  if (!choicesNode || typeof choicesNode !== 'object') return [];
  const rawChoices = (choicesNode as { CHOICE?: unknown }).CHOICE;
  return asArray(rawChoices as string | ReadonlyArray<string>)
    .filter((choice): choice is string => typeof choice === 'string' && choice.length > 0);
}

function listInternalNameFromUrl(url: string): FoleonListInternalName {
  const match = EXPECTED_LISTS.find((list) => list.url === url);
  if (!match) throw new Error(`Unknown Foleon list URL in schema: ${url}`);
  return match.internalName;
}

export function parseElementsXml(elementsXml: string): ParsedListInstance[] {
  const parsed = parseXmlObject<{ Elements?: { ListInstance?: unknown } }>(elementsXml, 'elements.xml');
  const instances = asArray(parsed.Elements?.ListInstance as Record<string, string> | ReadonlyArray<Record<string, string>>);
  return instances.map((instance) => ({
    title: String(instance.Title ?? ''),
    url: String(instance.Url ?? ''),
    customSchema: String(instance.CustomSchema ?? ''),
    featureId: String(instance.FeatureId ?? ''),
    templateType: String(instance.TemplateType ?? ''),
  }));
}

export function parseSchemaXml(fileName: string, xml: string): ParsedListSchema {
  const parsed = parseXmlObject<{
    List?: {
      Title?: string;
      Url?: string;
      VersioningEnabled?: string;
      DisableAttachments?: string;
      MetaData?: {
        Fields?: { Field?: unknown };
        Views?: { View?: unknown };
      };
    };
  }>(xml, fileName);
  const list = parsed.List;
  if (!list) throw new Error(`${fileName} missing root <List>`);
  const url = String(list.Url ?? '');
  const internalName = listInternalNameFromUrl(url);
  const fields = asArray(list.MetaData?.Fields?.Field as Record<string, string> | ReadonlyArray<Record<string, string>>)
    .map((field) => ({
      id: typeof field.ID === 'string' ? field.ID : undefined,
      internalName: String(field.Name ?? ''),
      displayName: typeof field.DisplayName === 'string' ? field.DisplayName : undefined,
      type: String(field.Type ?? ''),
      required: field.Required === 'TRUE',
      indexed: field.Indexed === 'TRUE',
      unique: field.EnforceUniqueValues === 'TRUE',
      choices: choiceValuesFrom(field),
      lookupList: typeof field.List === 'string' ? field.List : undefined,
      showField: typeof field.ShowField === 'string' ? field.ShowField : undefined,
    }));
  const views = asArray(list.MetaData?.Views?.View as Record<string, unknown> | ReadonlyArray<Record<string, unknown>>)
    .map((view) => ({
      displayName: String(view.DisplayName ?? ''),
      defaultView: view.DefaultView === 'TRUE',
      fieldRefs: collectFieldRefs(view),
    }));
  return {
    fileName,
    internalName,
    title: String(list.Title ?? ''),
    url,
    versioningEnabled: list.VersioningEnabled === 'TRUE',
    disableAttachments: list.DisableAttachments === 'TRUE',
    fields,
    views,
    indexedFieldCount: fields.filter((field) => field.indexed).length,
    sha256: sha256Text(xml),
  };
}

export function buildFoleonFeatureAssetModel(): FoleonFeatureAssetModel {
  const packageSolution = JSON.parse(loadText(PACKAGE_SOLUTION_PATH)) as PackageSolution;
  const assetFiles = readdirSync(ASSETS_DIR).sort();
  const elementsXml = loadText(resolve(ASSETS_DIR, 'elements.xml'));
  const schemas = EXPECTED_SCHEMA_FILES.map((fileName) => {
    const xml = loadText(resolve(ASSETS_DIR, fileName));
    return parseSchemaXml(fileName, xml);
  });
  return {
    packageSolution,
    assetFiles,
    elementsXml,
    elementsSha256: sha256Text(elementsXml),
    listInstances: parseElementsXml(elementsXml),
    schemas,
  };
}

function check(name: string, pass: boolean, details?: string): ValidationCheck {
  return { name, pass, ...(details ? { details } : {}) };
}

function schemaFor(internalName: FoleonListInternalName): FoleonListSchema {
  const schema = FOLEON_LIST_SCHEMAS.find((entry) => entry.internalName === internalName);
  if (!schema) throw new Error(`Missing code-level schema for ${internalName}`);
  return schema;
}

function codeField(schema: FoleonListSchema, internalName: string): FoleonFieldSchema | undefined {
  return schema.fields.find((field) => field.internalName === internalName);
}

function validatePackageSolution(model: FoleonFeatureAssetModel): ValidationCheck[] {
  const feature = model.packageSolution.solution.features.find((entry) => entry.id === EXPECTED_FEATURE_ID);
  return [
    check('solution version matches expected package version', model.packageSolution.solution.version === EXPECTED_VERSION),
    check('package is site-installed for Feature Framework assets', model.packageSolution.solution.skipFeatureDeployment === false),
    check('expected Foleon feature is declared', !!feature),
    check('feature version matches expected package version', feature?.version === EXPECTED_VERSION),
    check(
      'package-solution declares exactly the expected element manifests',
      JSON.stringify(feature?.assets?.elementManifests ?? []) === JSON.stringify([...EXPECTED_ELEMENT_MANIFESTS]),
    ),
    check(
      'package-solution declares exactly the expected schema element files',
      JSON.stringify(feature?.assets?.elementFiles ?? []) === JSON.stringify([...EXPECTED_SCHEMA_FILES]),
    ),
  ];
}

function validateAssets(model: FoleonFeatureAssetModel): ValidationCheck[] {
  const staleSchemas = model.assetFiles
    .filter((fileName) => /^schema-.*\.xml$/.test(fileName))
    .filter((fileName) => !EXPECTED_SCHEMA_FILES.includes(fileName as (typeof EXPECTED_SCHEMA_FILES)[number]));
  const customSchemas = model.listInstances.map((instance) => instance.customSchema).filter(Boolean);
  return [
    check('elements.xml exists and parses', model.elementsXml.length > 0),
    check('all expected schema files exist and parse', model.schemas.length === EXPECTED_SCHEMA_FILES.length),
    check('no stale schema XML files exist under sharepoint/assets', staleSchemas.length === 0, staleSchemas.join(', ')),
    check(
      'every CustomSchema reference resolves to an expected schema file',
      customSchemas.every((fileName) => EXPECTED_SCHEMA_FILES.includes(fileName as (typeof EXPECTED_SCHEMA_FILES)[number])),
      customSchemas.join(', '),
    ),
    check(
      'every expected schema file is referenced by one ListInstance',
      EXPECTED_SCHEMA_FILES.every((fileName) => customSchemas.filter((entry) => entry === fileName).length === 1),
      customSchemas.join(', '),
    ),
  ];
}

function validateListInstances(model: FoleonFeatureAssetModel): ValidationCheck[] {
  return EXPECTED_LISTS.flatMap((expected, index) => {
    const instance = model.listInstances[index];
    return [
      check(`${expected.internalName} ListInstance exists in expected order`, instance?.url === expected.url),
      check(`${expected.internalName} CustomSchema matches expected schema`, instance?.customSchema === expected.customSchema),
      check(`${expected.internalName} FeatureId uses generic custom-list feature`, instance?.featureId === '00bfea71-de22-43b2-a848-c05709900100'),
      check(`${expected.internalName} TemplateType is custom list`, instance?.templateType === '100'),
    ];
  });
}

function validateSchemas(model: FoleonFeatureAssetModel): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const allFieldIds = new Map<string, string>();
  const listOrderByUrl = new Map(model.listInstances.map((instance, index) => [instance.url, index]));

  for (const expected of EXPECTED_LISTS) {
    const schema = model.schemas.find((entry) => entry.internalName === expected.internalName);
    const codeSchema = schemaFor(expected.internalName);
    if (!schema) {
      checks.push(check(`${expected.internalName} schema exists`, false));
      continue;
    }

    const fieldNames = schema.fields.map((field) => field.internalName);
    const duplicateNames = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    checks.push(check(`${expected.internalName} schema URL matches ListInstance URL`, schema.url === expected.url));
    checks.push(check(`${expected.internalName} versioning posture is correct`, schema.versioningEnabled === expected.versioningEnabled));
    checks.push(check(`${expected.internalName} attachments are disabled`, schema.disableAttachments === expected.disableAttachments));
    checks.push(check(`${expected.internalName} has no duplicate field internal names`, duplicateNames.length === 0, duplicateNames.join(', ')));
    checks.push(check(`${expected.internalName} indexed custom field count is within threshold`, schema.indexedFieldCount <= MAX_CUSTOM_INDEXED_FIELDS, String(schema.indexedFieldCount)));

    const indexedNames = schema.fields.filter((field) => field.indexed).map((field) => field.internalName);
    const launchIndexes = LAUNCH_INDEXES[expected.internalName];
    const missingLaunchIndexes = launchIndexes.filter((name) => !indexedNames.includes(name));
    const unexpectedIndexes = indexedNames.filter((name) => !launchIndexes.includes(name));
    checks.push(check(`${expected.internalName} required launch indexes are present`, missingLaunchIndexes.length === 0, missingLaunchIndexes.join(', ')));
    checks.push(check(`${expected.internalName} has no unexpected launch indexes`, unexpectedIndexes.length === 0, unexpectedIndexes.join(', ')));

    const uniqueFields = UNIQUE_FIELDS[expected.internalName];
    for (const uniqueField of uniqueFields) {
      const field = schema.fields.find((entry) => entry.internalName === uniqueField);
      checks.push(check(`${expected.internalName}.${uniqueField} is indexed for uniqueness`, field?.indexed === true));
      checks.push(check(`${expected.internalName}.${uniqueField} uses EnforceUniqueValues`, field?.unique === true));
    }

    const declaredFieldNames = new Set([...fieldNames, 'Title']);
    checks.push(check(`${expected.internalName} provisions exactly one default view`, schema.views.length === 1 && schema.views[0]?.defaultView === true, schema.views.map((view) => view.displayName).join(', ')));
    checks.push(check(`${expected.internalName} default view is minimal All Items`, schema.views[0]?.displayName === 'All Items' && JSON.stringify(schema.views[0]?.fieldRefs ?? []) === JSON.stringify(['LinkTitle']), JSON.stringify(schema.views[0]?.fieldRefs ?? [])));
    for (const view of schema.views) {
      const unknownRefs = view.fieldRefs.filter((name) => !declaredFieldNames.has(name) && !KNOWN_VIEW_BUILTINS.has(name));
      checks.push(check(`${expected.internalName} view ${view.displayName} references known fields`, unknownRefs.length === 0, unknownRefs.join(', ')));
    }

    for (const field of schema.fields) {
      if (field.id) {
        const normalizedId = field.id.toLowerCase();
        const priorField = allFieldIds.get(normalizedId);
        checks.push(check(`custom field ID ${field.id} is unique`, !priorField, priorField ? `${priorField} and ${expected.internalName}.${field.internalName}` : undefined));
        allFieldIds.set(normalizedId, `${expected.internalName}.${field.internalName}`);
      }

      const fieldSchema = codeField(codeSchema, field.internalName);
      checks.push(check(`${expected.internalName}.${field.internalName} exists in code schema metadata`, !!fieldSchema));
      if (fieldSchema) {
        checks.push(check(`${expected.internalName}.${field.internalName} required metadata matches XML`, field.required === fieldSchema.required));
        checks.push(check(`${expected.internalName}.${field.internalName} launch-index metadata matches XML`, field.indexed === fieldSchema.indexedAtProvisioning));
        checks.push(check(`${expected.internalName}.${field.internalName} uniqueness metadata matches XML`, field.unique === !!fieldSchema.unique));
        if (fieldSchema.choices) {
          checks.push(check(
            `${expected.internalName}.${field.internalName} choices match code schema metadata`,
            JSON.stringify(field.choices) === JSON.stringify([...fieldSchema.choices]),
            JSON.stringify(field.choices),
          ));
        }
      }

      if (field.type === 'Lookup') {
        const lookupOrder = typeof field.lookupList === 'string' ? listOrderByUrl.get(field.lookupList) : undefined;
        const currentOrder = listOrderByUrl.get(expected.url);
        checks.push(check(`${expected.internalName}.${field.internalName} lookup target matches a ListInstance URL`, lookupOrder !== undefined, field.lookupList));
        checks.push(check(`${expected.internalName}.${field.internalName} lookup target is declared before lookup list`, lookupOrder !== undefined && currentOrder !== undefined && lookupOrder < currentOrder));
        checks.push(check(`${expected.internalName}.${field.internalName} lookup ShowField is Title`, field.showField === 'Title'));
      }
    }
  }

  return checks;
}

export function validateFoleonFeatureAssets(model = buildFoleonFeatureAssetModel()): ValidationCheck[] {
  return [
    ...validatePackageSolution(model),
    ...validateAssets(model),
    ...validateListInstances(model),
    ...validateSchemas(model),
  ];
}

export function assertFoleonFeatureAssetsValid(model = buildFoleonFeatureAssetModel()): void {
  const checks = validateFoleonFeatureAssets(model);
  const failed = checks.filter((entry) => !entry.pass);
  if (failed.length > 0) {
    throw new Error(
      failed
        .map((entry) => `FAIL ${entry.name}${entry.details ? `: ${entry.details}` : ''}`)
        .join('\n'),
    );
  }
}

function printValidation(model: FoleonFeatureAssetModel, checks: ReadonlyArray<ValidationCheck>): void {
  const failed = checks.filter((entry) => !entry.pass);
  if (failed.length === 0) {
    console.log(`PASS Foleon Feature Framework validation (${checks.length} checks)`);
    for (const schema of model.schemas) {
      console.log(`PASS ${schema.fileName} indexedFieldCount=${schema.indexedFieldCount} sha256=${schema.sha256}`);
    }
    return;
  }
  for (const entry of failed) {
    console.log(`FAIL ${entry.name}${entry.details ? ` (${entry.details})` : ''}`);
  }
}

function main(): void {
  const model = buildFoleonFeatureAssetModel();
  const checks = validateFoleonFeatureAssets(model);
  printValidation(model, checks);
  const failed = checks.filter((entry) => !entry.pass);
  if (failed.length > 0) {
    throw new Error(`Foleon Feature Framework validation failed with ${failed.length} failed check(s).`);
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main();
}
