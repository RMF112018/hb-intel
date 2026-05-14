import { DefaultAzureCredential } from '@azure/identity';
import { InjectHeaders } from '@pnp/queryable';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/fields/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import type { IListDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import {
  LEGACY_FALLBACK_LIST_DESCRIPTORS,
  getLegacyFallbackListHostSiteUrl,
} from '../backend/functions/src/services/legacy-fallback/list-descriptors.js';
import {
  applyFieldSettingsUpdates,
  buildListFieldPlans,
  createSharePointField,
  normalizeListTitle,
  validateProvisionedFields,
  type ILiveSharePointFieldSnapshot,
  type IListProvisioningResult,
  type IProvisioningReport,
} from '../backend/functions/src/services/sharepoint-schema-provisioning/index.js';

console.error('[legacy-fallback] provisioning script started');

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
    .top(5000)()) as ILiveSharePointFieldSnapshot[];

  const { plans, unresolvedMutations } = buildListFieldPlans(resolvedTitle, descriptor.fields, liveFields);
  result.unresolvedMutations.push(...unresolvedMutations);

  for (const plan of plans) {
    if (plan.kind === 'create') {
      await createSharePointField(list, plan.field);
      result.fieldMutations.push({
        listTitle: resolvedTitle,
        fieldInternalName: plan.field.internalName,
        action: 'created',
      });
      continue;
    }

    if (plan.kind === 'update-settings') {
      const mutations = await applyFieldSettingsUpdates(
        list,
        resolvedTitle,
        plan.field.internalName,
        plan.updates,
      );
      result.fieldMutations.push(...mutations);
      continue;
    }
  }

  const refreshedFields = (await list.fields
    .select('InternalName', 'TypeAsString', 'Indexed')
    .top(5000)()) as Array<{ InternalName: string; TypeAsString: string; Indexed: boolean }>;

  result.schemaValidated = validateProvisionedFields(descriptor.fields, refreshedFields);

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
