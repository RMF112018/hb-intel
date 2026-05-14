
# Prompt 03 — Dedicated My Projects Source-List Provisioner

## Objective

Build `scripts/provision-my-projects-source-list-schema.ts`, a dedicated operator-run provisioner for the My Projects source-list schema delta.

## Why this issue exists now

The repo has a verifier and backfill scripts, but no safe mutation script dedicated to creating the required source-list columns.

## Why it matters

Without a dedicated provisioner, operators must choose between manual portal edits, PnP PowerShell, or overbroad legacy fallback provisioning. That is not safe enough for existing production lists.

## Current repo-truth condition

- `scripts/verify-my-project-role-fields.ts` verifies but does not mutate.
- `scripts/provision-legacy-fallback-lists.ts` mutates but is scoped too broadly.
- Backfill scripts assume columns exist before apply.

## Required future state

Add:

```text
scripts/provision-my-projects-source-list-schema.ts
```

Required behavior:

- default dry-run;
- explicit `--apply` for mutation;
- `--json` report output;
- optional `--site-url`, otherwise env `SHAREPOINT_PROJECTS_SITE_URL` / `SHAREPOINT_TENANT_URL`;
- HBCentral host lock;
- explicit identity-lane warning in report;
- no list creation;
- missing fields planned/created;
- existing correct fields live-verified;
- wrong-type fields blocking;
- no delete/recreate behavior;
- exit code `0` only when no blocking drift exists and dry-run/apply completed as intended;
- clear next-command guidance in JSON and text output.

## Exact files / seams / symbols to inspect

- shared utilities from Prompt 01;
- descriptor from Prompt 02;
- `scripts/verify-my-project-role-fields.ts` output shape;
- `ManagedIdentityTokenService`;
- `getPnPContext`;
- `projects-role-schema-readiness.ts`.

## Research-informed technical considerations

- Microsoft Graph columnDefinition create/update endpoints require application `Sites.Manage.All` as least privileged or `Sites.FullControl.All` as higher privileged if implemented through Graph.
- Existing repo PnPjs/SharePoint path can create `Text` and `MultiLineText` fields and validate live `TypeAsString` values.
- If PnPjs breaks in Node 22 ESM, implement the same utility interface over direct SharePoint REST rather than switching to ad hoc Graph logic.

## Required implementation scope

- Implement CLI arg parsing.
- Implement site URL resolution and HBCentral guard.
- Use shared provisioning planner and apply adapter.
- Query current list fields for both target lists.
- Emit structured report.
- Refuse to continue if target lists are absent.
- Refuse to apply if wrong-type fields exist.
- Include operator-visible distinction between HB SharePoint Creator app registration and Function App UAMI in docs/report hints.

## Explicit non-scope

- Do not run backfills.
- Do not mutate items.
- Do not change read-model provider behavior.
- Do not create lists.
- Do not remediate `FolderWebUrl`.

## Required tests

- Arg parsing: default dry-run, `--apply`, `--json`, `--site-url`, invalid flags.
- Dry-run does not call create/update field adapter.
- Apply creates missing fields only.
- Wrong-type field fails apply.
- Missing list fails with no mutation.
- Report shape includes planned mutations, applied mutations, blockers, next commands.

## Validation commands

```bash
pnpm test -- scripts/provision-my-projects-source-list-schema
pnpm test -- backend/functions/src/services/sharepoint-schema-provisioning
pnpm typecheck
```

## Proof-of-closure artifacts

- New script.
- Tests.
- Example dry-run JSON from mocked test fixture.
- README/runbook text update staged in later prompt.

## Completion standard

This prompt is complete when the new provisioner is safe to run in dry-run mode and cannot mutate anything unless `--apply` is explicitly present.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
