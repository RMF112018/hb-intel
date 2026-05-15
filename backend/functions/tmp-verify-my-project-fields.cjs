const { DefaultAzureCredential } = require('@azure/identity');
const { InjectHeaders } = require('@pnp/queryable');
const { spfi } = require('@pnp/sp');
require('@pnp/nodejs-commonjs');
require('@pnp/sp/fields');
require('@pnp/sp/lists');
require('@pnp/sp/webs');

const keepAlive = setInterval(() => {}, 1000);

(async () => {
  const siteUrl = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
  const lists = ['Projects', 'Legacy Project Fallback Registry'];
  const fields = [
    'leadEstimatorUpns','estimatorUpns','idsManagerUpns','projectAccountantUpns','projectAdministratorUpns',
    'projectCoordinatorUpns','superintendentUpns','leadSuperintendentUpns','projectManagerUpns','leadProjectManagerUpns',
    'projectExecutiveUpns','safetyCoordinatorUpns','qcManagerUpns','warrantyManagerUpns','procoreProject'
  ];

  const tok = await new DefaultAzureCredential().getToken(`${new URL(siteUrl).origin}/.default`);
  if (!tok?.token) throw new Error('No token');

  const sp = spfi(siteUrl).using(InjectHeaders({ Authorization: `Bearer ${tok.token}` }));
  const out = {};

  for (const listTitle of lists) {
    const list = sp.web.lists.getByTitle(listTitle);
    out[listTitle] = {};
    for (const f of fields) {
      try {
        const r = await list.fields.getByInternalNameOrTitle(f).select('TypeAsString')();
        out[listTitle][f] = r.TypeAsString;
      } catch {
        out[listTitle][f] = 'MISSING';
      }
    }
  }

  console.log(JSON.stringify(out, null, 2));
})()
  .catch((e) => {
    console.error('VERIFY_FAIL', e);
    process.exitCode = 1;
  })
  .finally(() => {
    clearInterval(keepAlive);
  });
