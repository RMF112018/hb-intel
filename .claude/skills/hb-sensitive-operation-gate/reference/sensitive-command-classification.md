# Sensitive Command Classification

## Always Requires Explicit Authorization

- `az *`
- `m365 *`
- `pnp *`
- `gh workflow run *`
- app catalog upload/deploy commands
- Azure deployment commands
- SharePoint site/list/library/group/permission mutation
- live Graph/PnP calls
- Procore probes or API calls
- hosted endpoint `curl`
- `.sppkg` generation or deployment
- package publishing
- dependency installation or update commands
- destructive git commands
- package or manifest version changes

## Normally Allowed Only as Read-Only Local Proof

- `git status --short`
- `git diff -- <paths>`
- `git log --oneline -n <n>`
- package-local lint/typecheck/test commands when no environment mutation occurs

## Redaction Required

Any output containing:

- tokens;
- bearer strings;
- JWTs;
- app settings;
- connection strings;
- Key Vault references;
- tenant IDs when sensitive in context;
- user principal data beyond what is necessary;
- endpoint secrets or function keys.
