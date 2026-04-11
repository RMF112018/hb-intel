# People & Culture + HB Kudos Test Suite
## Device-Login-First Remediation Prompt Package

### Objective
Refactor the People & Culture + HB Kudos comprehensive testing suite so that **live runs use device login / device code flow as the primary authentication path** and **no longer require manual bearer token injection** as the normal operating model.

### Repo
- Live repo: `https://github.com/RMF112018/hb-intel`
- Branch: `main`

### Package Contents
1. `Plan-Summary.md`
2. `Prompt-00-Auth-Basis-Lock.md`
3. `Prompt-01-Implement-Device-Login.md`
4. `Prompt-02-CLI-Config-Docs.md`
5. `Prompt-03-Validation-and-Closure.md`

### Execution Order
Run the prompts in order.

### Ground Rules
- Work from **repo truth** only.
- Do not rely on prior completion claims if code contradicts them.
- Do not re-read files that are still within your active context window or already inspected during the current step unless needed for accuracy.
- Treat the current bearer-token-first live auth model as a defect to be remediated.
- Preserve dry-run behavior.
- Keep legacy token injection only if justified as **explicit fallback-only** behavior.
- Favor least-friction operator experience for human-run SharePoint live testing.

### Current Basis
At the time this package was generated, the suite still showed all of the following on `main`:
- `runAll.ts` usage includes `--live --token <bearer>`
- `runSuite.ts` usage includes `--live --token <bearer>`
- `shared/auth.ts` accepts `explicitToken`, then `SHAREPOINT_BEARER_TOKEN`, then shells out to Azure CLI for `az account get-access-token`
- `shared/spClient.ts` always sends `Authorization: Bearer <token>`
- `shared/types.ts` / `shared/config.ts` do not define a first-class auth mode or auth configuration model
- operations guidance still documents bearer-token live runs and states interactive auth is “not yet implemented”

### Target State
- `--live` with no pasted bearer token should initiate or reuse device-login auth
- cached delegated user tokens should be used silently when available
- SharePoint REST calls should continue to work against `/_api/...`
- CLI help, docs, config examples, and ops guide should all reflect the new normal
- manual token injection should not be required for ordinary live runs

