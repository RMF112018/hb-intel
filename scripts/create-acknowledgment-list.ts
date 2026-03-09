import { DefaultAzureCredential } from '@azure/identity';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/fields/index.js';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';

const LIST_NAME = 'HbcAcknowledgmentEvents';

/**
 * SF04-T06 one-time setup script for the HbcAcknowledgmentEvents list schema.
 * Idempotent — safe to re-run. Follows create-projects-list.ts pattern (D-PH6-08).
 */
async function createAcknowledgmentList(): Promise<void> {
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
    const addResult = await sp.web.lists.add(LIST_NAME, 'HB Intel acknowledgment event audit trail', 100, true);
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
    required = false,
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

  const ensureBooleanField = async (internalName: string, displayName: string, required = false) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addBoolean(internalName, { Title: displayName, Required: required });
    }
  };

  // SF04-T06: 12 columns per acknowledgment event audit trail spec
  await ensureTextField('EventId', 'Event ID', true);
  await ensureChoiceField('ContextType', 'Context Type', [
    'project-hub-pmp',
    'project-hub-turnover',
    'project-hub-monthly-review',
    'bd-scorecard',
    'estimating-bid-receipt',
    'admin-provisioning',
    'workflow-handoff',
  ], true);
  await ensureTextField('ContextId', 'Context ID', true);
  await ensureTextField('PartyUserId', 'Party User ID', true);
  await ensureTextField('PartyDisplayName', 'Party Display Name');
  await ensureChoiceField('Status', 'Status', ['acknowledged', 'declined', 'bypassed'], true);
  await ensureDateTimeField('AcknowledgedAt', 'Acknowledged At');
  await ensureMultilineField('DeclineReason', 'Decline Reason');
  await ensureTextField('DeclineCategory', 'Decline Category');
  await ensureMultilineField('PromptMessage', 'Prompt Message');
  await ensureBooleanField('IsBypass', 'Is Bypass');
  await ensureTextField('BypassedBy', 'Bypassed By');

  console.log(`${LIST_NAME} schema verified.`);
}

createAcknowledgmentList().catch((error) => {
  console.error('Failed to create HbcAcknowledgmentEvents list schema:', error);
  process.exitCode = 1;
});
