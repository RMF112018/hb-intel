# 03 — Hard Guardrails

The local code agent must stop and report before doing any prohibited work.

## Repo Scope Guardrails

Do not:

- edit `docs/architecture/plans/**` unless separately authorized;
- run broad formatting across the repo;
- change package dependencies unless strictly required and explicitly justified;
- change `pnpm-lock.yaml` unless package/dependency changes are separately approved;
- change manifests;
- change workflows or CI;
- package/deploy SPFx;
- mutate tenant resources;
- add app settings/secrets.

## Runtime / Integration Guardrails

Do not:

- add backend write routes;
- call Microsoft Graph at runtime;
- call SharePoint REST or PnP at runtime;
- call Procore runtime APIs;
- call Sage runtime APIs;
- scrape or poll AHJ portals;
- submit, schedule, sync, mirror, or write back to external systems;
- perform evidence upload/download/sync/storage behavior;
- mutate Team & Access state;
- execute approvals/checkpoints beyond existing safe preview/reference semantics.

## Legal / Contract Guardrails

Do not:

- provide legal advice;
- infer legal obligations from contracts;
- automatically create legal obligations;
- claim snapshots/exports amend or replace executed contracts;
- convert owner-contract placeholders into active obligations without populated source rows and explicit human review.

## Stop Conditions

Stop and report if:

- local repo truth contradicts Wave 11 closeout;
- the JSON count check fails without a documented intentional change;
- package scripts differ materially from the prompts;
- Wave 11 implementation already exists;
- implementation would require dependency/lockfile/manifest/workflow/deployment changes;
- a requested action requires external runtime writes or legal interpretation.
