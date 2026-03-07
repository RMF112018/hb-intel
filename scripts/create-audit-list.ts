import { DefaultAzureCredential } from '@azure/identity';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/fields/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';

const LIST_NAME = 'ProvisioningAuditLog';

/**
 * D-PH6-06 one-time setup: creates ProvisioningAuditLog schema required for fire-and-forget lifecycle writes.
 */
async function createAuditList(): Promise<void> {
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
    const addResult = await sp.web.lists.add(LIST_NAME, 'HB Intel provisioning lifecycle audit log', 100, true);
    list = addResult.list;
    console.log(`${LIST_NAME} created.`);
  }

  const ensureTextField = async (internalName: string, displayName: string, required = true) => {
    try {
      await list.fields.getByInternalNameOrTitle(internalName).select('Id')();
    } catch {
      await list.fields.addText(internalName, { Title: displayName, Required: required });
    }
  };

  await ensureTextField('ProjectId', 'Project ID');
  await ensureTextField('ProjectNumber', 'Project Number');
  await ensureTextField('ProjectName', 'Project Name');
  await ensureTextField('CorrelationId', 'Correlation ID');
  await ensureTextField('TriggeredBy', 'Triggered By');
  await ensureTextField('SubmittedBy', 'Submitted By');

  try {
    await list.fields.getByInternalNameOrTitle('Event').select('Id')();
  } catch {
    await list.fields.addChoice('Event', {
      Title: 'Event',
      Required: true,
      Choices: ['Started', 'Completed', 'Failed'],
    });
  }

  try {
    await list.fields.getByInternalNameOrTitle('Timestamp').select('Id')();
  } catch {
    await list.fields.addDateTime('Timestamp', { Title: 'Timestamp', Required: true });
  }

  try {
    await list.fields.getByInternalNameOrTitle('SiteUrl').select('Id')();
  } catch {
    await list.fields.addUrl('SiteUrl', { Title: 'Site URL', Required: false });
  }

  try {
    await list.fields.getByInternalNameOrTitle('ErrorSummary').select('Id')();
  } catch {
    await list.fields.addMultilineText('ErrorSummary', {
      Title: 'Error Summary',
      Required: false,
      NumberOfLines: 6,
      RichText: false,
    });
  }

  console.log('ProvisioningAuditLog schema verified.');
}

createAuditList().catch((error) => {
  console.error('Failed to create ProvisioningAuditLog:', error);
  process.exitCode = 1;
});
