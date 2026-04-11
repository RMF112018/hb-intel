# Prompt 01 — Implement Device-Login-First Live Auth

## Objective
Refactor the People & Culture + HB Kudos test suite so that **live runs use device code flow as the primary authentication path**, with silent reuse of cached tokens when available.

## Repo
- `https://github.com/RMF112018/hb-intel`
- Branch: `main`

## Required posture
- Work from repo truth and the basis-lock report created in Prompt 00.
- Do not re-read files that are still within your active context window or already inspected during the current step unless needed for accuracy.
- Preserve existing dry-run behavior.
- Keep the suite’s SharePoint REST call path intact unless a specific code change is necessary.

## Required technical direction
Use **MSAL Node** as the primary implementation.

### Required libraries
Add the best-fit dependencies needed for:
- MSAL Node public client device code flow
- persistent token cache for CLI usage

Preferred direction:
- `@azure/msal-node`
- `@azure/msal-node-extensions`

## Required implementation behavior
### Live mode default
When a user runs:

```bash
npx tsx scripts/testing/people-kudos/runAll.ts --live
```

or

```bash
npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --live
```

The suite must:
1. attempt silent token acquisition from local cache
2. reuse a valid cached account/token when available
3. otherwise trigger device code flow
4. present clear device login instructions to the operator
5. continue execution once sign-in completes

### Dry-run
Dry-run must continue to execute without any auth prompt.

### SharePoint target resource
The suite currently calls SharePoint REST directly at:
- `${siteUrl}/_api/...`

Implement token acquisition so the access token is appropriate for the SharePoint resource being called.
Do not change the suite to Microsoft Graph unless there is a repo-truth technical requirement to do so.

## Required code changes
At minimum update:
- `scripts/testing/people-kudos/shared/auth.ts`
- `scripts/testing/people-kudos/shared/context.ts`
- `scripts/testing/people-kudos/shared/types.ts`
- `scripts/testing/people-kudos/shared/config.ts`
- `scripts/testing/people-kudos/config.example.json`
- root `package.json`

## Auth model requirements
Create a first-class auth model rather than hiding everything behind `explicitToken`.

At minimum support configuration for:
- auth mode
- tenant ID
- public client app client ID
- authority / tenant authority override if needed
- SharePoint resource / scope target
- cache settings

## Cache requirements
Use persistent token cache suitable for repeated CLI use.

Required behavior:
- token cache survives process exit
- cache is reused on later live runs
- no refresh token is manually exposed in logs or output
- logs are safe and do not leak access tokens
- provide a practical cache path / name convention for the suite

## Legacy token fallback
You may preserve manual token support only as an **explicit fallback path**.

That means:
- token fallback must not remain the default live behavior
- manual token injection must be clearly labeled as fallback / override only
- any env var support must also be fallback-only

## Implementation notes
Account for:
- Node 20+
- TypeScript / tsx execution style already used by the suite
- operator-friendly device-code messaging
- future maintainability

## Deliverables
1. Implement the auth refactor in code.
2. Add or update any needed types/config models.
3. Produce a concise implementation report at:
   - `docs/architecture/reviews/people-kudos-device-login-auth-implementation-report.md`

The report must include:
- changed files
- auth flow summary
- cache behavior summary
- fallback behavior summary
- any open issues or assumptions

## Acceptance criteria
The normal live-run path must no longer require a pasted bearer token.
If the operator has not signed in before, the suite must guide them through device login.
If they have signed in previously and the cache is valid, the suite should run without prompting.

