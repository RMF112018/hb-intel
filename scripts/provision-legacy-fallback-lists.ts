import { DefaultAzureCredential } from '@azure/identity';
import { InjectHeaders } from '@pnp/queryable';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/fields/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import type { IFieldDefinition, IListDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import {
  LEGACY_FALLBACK_LIST_DESCRIPTORS,
  getLegacyFallbackListHostSiteUrl,
} from '../backend/functions/src/services/legacy-fallback/list-descriptors.js';
import {
  getCompatibleSharePointFieldTypes,
  isSharePointFieldTypeCompatible,
  normalizeListTitle,
} from '../backend/functions/src/services/legacy-fallback/provisioning-compatibility.js';

console.error('[legacy-fallback] provisioning script started');

interface IFieldMutation {
  listTitle: string;
  fieldInternalName: string;
  action: 'created' | 'updated' | 'indexed' | 'defaulted' | 'required-updated' | 'choices-updated';
}

interface IUnresolvedMutation {
  listTitle: string;
  fieldInternalName: string;
  desiredType: IFieldDefinition['type'];
  liveType: string;
  reason: string;
}

interface IListProvisioningResult {
  targetDescriptorTitle: string;
  resolvedListTitle: string;
  createdList: boolean;
  schemaValidated: boolean;
  fieldMutations: IFieldMutation[];
  unresolvedMutations: IUnresolvedMutation[];
}

interface IProvisioningReport {
  hostSiteUrl: string;
  startedAtUtc: string;
  completedAtUtc: string;
  listResults: IListProvisioningResult[];
  unresolvedMutations: IUnresolvedMutation[];
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutMs}ms: ${label}`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

async function resolveSharePointBearerToken(hostSiteUrl: string): Promise<string> {
  const explicitToken = process.env.SHAREPOINT_BEARER_TOKEN?.trim();
  if (explicitToken) {
    return explicitToken;
  }

  const credential = new DefaultAzureCredential();
  const tokenPromise = credential.getToken(`${new URL(hostSiteUrl).origin}/.default`);
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          'Timed out acquiring SharePoint token from DefaultAzureCredential. ' +
            'Set SHAREPOINT_BEARER_TOKEN or ensure managed identity/local Azure credentials are available.',
        ),
      );
    }, 20_000);
  });

  const token = await Promise.race([tokenPromise, timeoutPromise]);
  if (!token?.token) {
    throw new Error('Could not acquire SharePoint access token.');
  }

  return token.token;
}

function parseArgs(argv: string[]): { allowTypeDrift: boolean } {
  return {
    allowTypeDrift: argv.includes('--allow-type-drift'),
  };
}

function isSameListTitle(a: string, b: string): boolean {
  return normalizeListTitle(a) === normalizeListTitle(b);
}

function findEquivalentList(
  allLists: ReadonlyArray<{ Id: string; Title: string }>,
  descriptorTitle: string,
): { Id: string; Title: string } | null {
  const exact = allLists.find((entry) => entry.Title === descriptorTitle);
  if (exact) return exact;

  const equivalent = allLists.find((entry) => isSameListTitle(entry.Title, descriptorTitle));
  return equivalent ?? null;
}

async function createField(list: any, field: IFieldDefinition): Promise<void> {
  switch (field.type) {
    case 'Number':
      await list.fields.addNumber(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
      });
      break;
    case 'DateTime':
      await list.fields.addDateTime(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
      });
      break;
    case 'Boolean':
      await list.fields.addBoolean(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
      });
      break;
    case 'Choice':
      await list.fields.addChoice(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
        Choices: field.choices ?? [],
      });
      break;
    case 'User':
      await list.fields.addUser(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
      });
      break;
    case 'URL':
      await list.fields.addUrl(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
      });
      break;
    case 'Lookup':
      throw new Error('Lookup fields are not supported in legacy fallback descriptors during Prompt 02.');
    case 'MultiLineText':
      await list.fields.addMultilineText(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
        RichText: false,
      });
      break;
    case 'Text':
    default:
      await list.fields.addText(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
      });
      break;
  }
}

async function applyFieldSettings(
  list: any,
  field: IFieldDefinition,
  liveField: any,
  result: IListProvisioningResult,
): Promise<void> {
  if (field.required !== undefined && liveField.Required !== field.required) {
    await list.fields.getByInternalNameOrTitle(field.internalName).update({ Required: field.required });
    result.fieldMutations.push({
      listTitle: result.resolvedListTitle,
      fieldInternalName: field.internalName,
      action: 'required-updated',
    });
  }

  if (field.type === 'Choice' && field.choices && field.choices.length > 0) {
    const currentChoices: string[] = Array.isArray(liveField.Choices) ? liveField.Choices : [];
    const targetChoices = [...field.choices];

    if (JSON.stringify(currentChoices) !== JSON.stringify(targetChoices)) {
      await list.fields.getByInternalNameOrTitle(field.internalName).update({ Choices: targetChoices });
      result.fieldMutations.push({
        listTitle: result.resolvedListTitle,
        fieldInternalName: field.internalName,
        action: 'choices-updated',
      });
    }
  }

  if (field.indexed === true && liveField.Indexed !== true) {
    await list.fields.getByInternalNameOrTitle(field.internalName).update({ Indexed: true });
    result.fieldMutations.push({
      listTitle: result.resolvedListTitle,
      fieldInternalName: field.internalName,
      action: 'indexed',
    });
  }

  if (field.defaultValue !== undefined && liveField.DefaultValue !== field.defaultValue) {
    await list.fields.getByInternalNameOrTitle(field.internalName).update({ DefaultValue: field.defaultValue });
    result.fieldMutations.push({
      listTitle: result.resolvedListTitle,
      fieldInternalName: field.internalName,
      action: 'defaulted',
    });
  }
}

async function ensureListDescriptor(
  sp: any,
  descriptor: IListDefinition,
): Promise<IListProvisioningResult> {
  const allLists = (await sp.web.lists.select('Id', 'Title').top(5000)()) as Array<{ Id: string; Title: string }>;

  const equivalent = findEquivalentList(allLists, descriptor.title);

  let list: any;
  let resolvedTitle = descriptor.title;
  let createdList = false;

  if (!equivalent) {
    const addResult = await sp.web.lists.add(descriptor.title, descriptor.description, descriptor.template, true);
    list = addResult.list;
    createdList = true;
  } else {
    resolvedTitle = equivalent.Title;
    list = sp.web.lists.getById(equivalent.Id);
  }

  const result: IListProvisioningResult = {
    targetDescriptorTitle: descriptor.title,
    resolvedListTitle: resolvedTitle,
    createdList,
    schemaValidated: false,
    fieldMutations: [],
    unresolvedMutations: [],
  };

  const liveFields = (await list.fields
    .select('InternalName', 'Title', 'TypeAsString', 'Required', 'Indexed', 'DefaultValue', 'Choices')
    .top(5000)()) as Array<{
      InternalName: string;
      Title: string;
      TypeAsString: string;
      Required: boolean;
      Indexed: boolean;
      DefaultValue: string;
      Choices?: string[];
    }>;

  for (const field of descriptor.fields) {
    const liveField =
      liveFields.find((entry) => entry.InternalName === field.internalName) ??
      liveFields.find((entry) => entry.Title === field.displayName);

    if (!liveField) {
      await createField(list, field);
      result.fieldMutations.push({
        listTitle: resolvedTitle,
        fieldInternalName: field.internalName,
        action: 'created',
      });
      continue;
    }

    if (!isSharePointFieldTypeCompatible(field.type, liveField.TypeAsString)) {
      result.unresolvedMutations.push({
        listTitle: resolvedTitle,
        fieldInternalName: field.internalName,
        desiredType: field.type,
        liveType: liveField.TypeAsString,
        reason:
          `Type mismatch cannot be auto-converted safely. ` +
          `Allowed live types for ${field.type}: ${getCompatibleSharePointFieldTypes(field.type).join(', ')}`,
      });
      continue;
    }

    await applyFieldSettings(list, field, liveField, result);
  }

  const refreshedFields = (await list.fields
    .select('InternalName', 'TypeAsString', 'Indexed')
    .top(5000)()) as Array<{ InternalName: string; TypeAsString: string; Indexed: boolean }>;

  result.schemaValidated = descriptor.fields.every((field) => {
    const liveField = refreshedFields.find((entry) => entry.InternalName === field.internalName);
    if (!liveField) return false;
    if (!isSharePointFieldTypeCompatible(field.type, liveField.TypeAsString)) return false;
    if (field.indexed === true && liveField.Indexed !== true) return false;
    return true;
  });

  return result;
}

async function provisionLegacyFallbackLists(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const hostSiteUrl = getLegacyFallbackListHostSiteUrl();

  if (hostSiteUrl !== 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral') {
    throw new Error(`Legacy fallback list host must be HBCentral. Received: ${hostSiteUrl}`);
  }

  const bearerToken = await resolveSharePointBearerToken(hostSiteUrl);

  const sp = (spfi(hostSiteUrl) as any).using(
    InjectHeaders({
      Authorization: `Bearer ${bearerToken}`,
    }),
  );

  const startedAtUtc = new Date().toISOString();
  const listResults: IListProvisioningResult[] = [];

  for (const descriptor of LEGACY_FALLBACK_LIST_DESCRIPTORS) {
    const result = await withTimeout(
      ensureListDescriptor(sp, descriptor),
      180_000,
      `provisioning descriptor ${descriptor.title}`,
    );
    listResults.push(result);
  }

  const unresolvedMutations = listResults.flatMap((result) => result.unresolvedMutations);
  const completedAtUtc = new Date().toISOString();

  const report: IProvisioningReport = {
    hostSiteUrl,
    startedAtUtc,
    completedAtUtc,
    listResults,
    unresolvedMutations,
  };

  console.log(JSON.stringify(report, null, 2));

  if (unresolvedMutations.length > 0 && !args.allowTypeDrift) {
    throw new Error(
      `Provisioning completed with ${unresolvedMutations.length} unresolved schema mutations. ` +
        'Re-run with --allow-type-drift only if manual remediation is intentionally deferred.',
    );
  }

  if (listResults.some((result) => !result.schemaValidated)) {
    throw new Error('One or more list descriptors failed post-provisioning schema validation.');
  }
}

const keepAlive = setInterval(() => {
  // Keep the process alive while awaiting credential/network operations.
}, 1_000);

provisionLegacyFallbackLists()
  .catch((error) => {
    console.error('Failed to provision legacy fallback lists:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    clearInterval(keepAlive);
  });
