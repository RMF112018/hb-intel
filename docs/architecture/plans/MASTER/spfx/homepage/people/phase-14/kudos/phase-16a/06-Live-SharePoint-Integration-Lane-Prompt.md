# 06 — Live SharePoint Integration Lane Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to add a **thin live-contract integration lane** for HB Kudos so closure is not based only on simulated harness behavior.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Implement a narrow, safe, non-destructive integration lane against a dedicated SharePoint dev/staging site and test lists that proves the real Microsoft 365 contract seams still work.

## Scope

This is not a full second E2E framework.
This is not a large test suite.
This is a thin reality-check lane.

## Required contract seams to prove

At minimum prove the real environment can exercise:

- request digest fetch
- `ensureUser`
- `ClientPeoplePickerSearchUser`
- list GUID binding
- live list read/write against a non-production test list/site
- MERGE + `If-Match` conflict behavior
- audit-event write/read
- `kudosListHostUrl` override behavior where applicable

Graph photo proof is optional but preferred if a stable test user/setup exists.

## Repo areas to inspect and update

At minimum:

- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- any existing env/test harness support for staging credentials/config
- CI or local secure config path for integration secrets

## Implementation rules

- keep this lane opt-in and environment-gated
- never point it at production lists
- keep writes reversible or write only to disposable test data
- clean up where safe and practical
- use explicit env vars / config
- fail clearly when the integration environment is not configured

## Required tests

At minimum implement a narrow set that proves:

1. digest fetch succeeds
2. people search returns a real result for a known safe query
3. `ensureUser` resolves a known test user
4. a draft can be written to the test Kudos list
5. a governance patch can MERGE that item
6. an audit event is written and can be read back
7. ETag conflict path is real and correctly surfaced
8. list GUID binding targets the intended list even if title text changes in config/input assumptions

## Required deliverables

- a thin integration test lane committed
- a secure configuration/readme for how to run it
- clear env var contract documented
- explicit statement of what the lane proves and what it intentionally does not prove

## Prohibited shortcuts

- do not mock this lane
- do not aim it at production
- do not make it a mandatory CI gate until it is stable and environment-safe
