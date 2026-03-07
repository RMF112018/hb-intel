import { DefaultAzureCredential } from '@azure/identity';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/fields/index.js';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';

const LIST_NAME = 'Projects';

/**
 * D-PH6-08 one-time setup script for the Projects list schema used by request lifecycle APIs.
 * Traceability: docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md §6.8.1
 */
async function createProjectsList(): Promise<void> {
  const tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
  if (!tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');

  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(`${new URL(tenantUrl).origin}/.default`);

  const sp = (spfi(tenantUrl) as any).using({
    bind(instance: any) {
      instance.on.auth.replace(async (_: unknown, req: Request, done: (request: Request) => void) => {
        req.headers.set('Authorization', `Bearer ${token!.token}`);
        done(req);
      });
    },
  } as any);

  let list: any;
  try {
    list = sp.web.lists.getByTitle(LIST_NAME);
    await list.select('Id')();
    console.log(`${LIST_NAME} already exists.`);
  } catch {
    const addResult = await sp.web.lists.add(LIST_NAME, 'HB Intel central project record store', 100, true);
    list = addResult.list;
    console.log(`${LIST_NAME} created.`);
  }

  const ensureTextField = async (internalName: string, displayName: string, required = false) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addText(internalName, { Title: displayName, Required: required });
    }
  };

  const ensureChoiceField = async (
    internalName: string,
    displayName: string,
    choices: string[],
    required = false
  ) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addChoice(internalName, {
        Title: displayName,
        Choices: choices,
        Required: required,
      });
    }
  };

  const ensureDateTimeField = async (internalName: string, displayName: string, required = false) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addDateTime(internalName, { Title: displayName, Required: required });
    }
  };

  const ensureUrlField = async (internalName: string, displayName: string, required = false) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addUrl(internalName, { Title: displayName, Required: required });
    }
  };

  const ensureMultilineField = async (internalName: string, displayName: string, required = false) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addMultilineText(internalName, {
        Title: displayName,
        Required: required,
        NumberOfLines: 8,
        RichText: false,
      });
    }
  };

  // D-PH6-08 schema fields: exact lifecycle and project metadata contract for Projects list.
  await ensureTextField('ProjectId', 'Project ID', true);
  await ensureTextField('ProjectNumber', 'Project Number');
  await ensureTextField('ProjectName', 'Project Name', true);
  await ensureTextField('ProjectLocation', 'Project Location');
  await ensureChoiceField('ProjectType', 'Project Type', ['GC', 'CM', 'Design-Build', 'Other']);
  await ensureChoiceField('ProjectStage', 'Project Stage', ['Lead', 'Pursuit', 'Active', 'Closed'], true);
  await ensureTextField('SubmittedBy', 'Submitted By');
  await ensureDateTimeField('SubmittedAt', 'Submitted At');
  await ensureChoiceField(
    'RequestState',
    'Request State',
    [
      'Submitted',
      'UnderReview',
      'NeedsClarification',
      'AwaitingExternalSetup',
      'ReadyToProvision',
      'Provisioning',
      'Completed',
      'Failed',
    ]
  );
  await ensureMultilineField('GroupMembersJson', 'Group Members');
  await ensureMultilineField('ClarificationNote', 'Clarification Note');
  await ensureTextField('CompletedBy', 'Completed By');
  await ensureDateTimeField('CompletedAt', 'Completed At');
  await ensureTextField('BdCreatedBy', 'BD Created By');
  await ensureUrlField('SiteUrl', 'Site URL');

  console.log('Projects list schema verified.');
}

createProjectsList().catch((error) => {
  console.error('Failed to create Projects list schema:', error);
  process.exitCode = 1;
});
