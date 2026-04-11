# Prompt 00 — Repo-Truth Auth Basis Lock

## Objective
Perform a focused repo-truth audit of the People & Culture + HB Kudos comprehensive testing suite’s current live authentication model and lock the exact basis that the device-login remediation will be built against.

## Repo
- `https://github.com/RMF112018/hb-intel`
- Branch: `main`

## Required posture
- Work from repo truth only.
- Do not re-read files that are still within your active context window or already inspected during the current step unless needed for accuracy.
- Do not trust prior completion language if code or docs differ.
- Treat any bearer-token-first live auth behavior as a defect against the new objective.

## Required files to inspect
At minimum inspect:
- `scripts/testing/people-kudos/runAll.ts`
- `scripts/testing/people-kudos/runSuite.ts`
- `scripts/testing/people-kudos/shared/auth.ts`
- `scripts/testing/people-kudos/shared/context.ts`
- `scripts/testing/people-kudos/shared/config.ts`
- `scripts/testing/people-kudos/shared/types.ts`
- `scripts/testing/people-kudos/shared/spClient.ts`
- `scripts/testing/people-kudos/config.example.json`
- the current operations guide and closure docs for this suite
- root `package.json`

## What you must determine
1. Whether `--token` is still supported by the runners.
2. Whether `SHAREPOINT_BEARER_TOKEN` is still supported by the auth helper.
3. Whether Azure CLI token acquisition is still used.
4. Whether any actual device-code/device-login implementation exists.
5. Whether any auth-mode abstraction or auth config model exists.
6. Whether current docs still prescribe bearer-token live runs.
7. Whether the current package already includes `@azure/msal-node`, `@azure/msal-node-extensions`, or any equivalent dependency.

## Deliverables
Write a basis-lock report to:
- `docs/architecture/reviews/people-kudos-device-login-auth-basis-lock.md`

The report must include:
- exact file-by-file findings
- direct evidence of current auth flow
- mismatch between code and docs, if any
- explicit conclusion on whether device login is absent / partial / complete
- explicit conclusion on whether bearer-token live auth is still primary
- recommended implementation approach for the next prompt

## Acceptance criteria
Do not proceed by assumption.
The report must make it impossible for later prompts to claim device login already exists unless code proves it.

