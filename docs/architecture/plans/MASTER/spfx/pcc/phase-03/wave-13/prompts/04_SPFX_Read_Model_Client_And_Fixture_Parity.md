# Prompt 04 — SPFx Read-Model Client and Fixture Parity

## Objective

Implement the SPFx read-model client seam for Buyout Log, preserving fixture-first behavior and backend opt-in/fallback conventions already used by the PCC app.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting or broad Prettier writes across the repo.
- Do not change package dependencies, `pnpm-lock.yaml`, manifests, workflows, CI, deployment files, or tenant configuration unless the prompt explicitly authorizes and justifies it.
- Do not add backend write routes or mutation endpoints.
- Do not add Procore, Sage, Microsoft Graph, SharePoint REST/PnP, Autodesk, AHJ portal, utility portal, scraping, polling, sync, mirror, or write-back runtime behavior.
- Do not create, update, approve, post, or transmit commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, payments, accounting entries, legal notices, claims, or entitlement determinations.
- Do not implement evidence-binary upload/download/sync/storage ownership in Wave 13; store/display references only.
- Do not execute Wave 14 approval/checkpoint behavior; create only reference prompts, signals, or candidate records.
- Stage only files authorized by the active prompt.
- Keep backend Wave 13 read model GET-only.
- Keep SPFx fixture-first unless backend opt-in is already repo-standard and explicitly configured.
- Preserve source-lineage for every source-derived value.



## Allowed Files / Likely Files

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/BuyoutLog.ts`

## Prohibited Scope

- Any file not needed for this prompt’s objective.
- Any unrelated refactor.
- Any broad formatting pass.
- Any lockfile/package/manifest/workflow/deployment change unless this prompt explicitly authorizes it.
- Any external-system runtime behavior, writeback, sync, or mutation.

## Repo-Truth Files to Inspect

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/package.json`
- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/fixtures/buyoutLog.ts`

## Implementation Steps

1. Inspect existing route id/path conventions and backend opt-in client/fallback behavior.
2. Add `buyout-log` to read-model route identifiers and route path constants using the backend route from Prompt 03.
3. Add a typed client method for Buyout Log to `IPccReadModelClient`.
4. Add fixture client behavior using shared deterministic fixtures.
5. Add backend HTTP client behavior using GET-only fetch and safe fallback to backend-unavailable fixture envelope.
6. Add state mapping if the current app maps envelope status to UI state.
7. Add fixture/backend parity tests:
   - route id/path coverage;
   - fixture envelope shape;
   - backend success unwrap;
   - backend unavailable fallback;
   - non-2xx/malformed/missing envelope fallback;
   - no write method or non-GET fetch.
8. Preserve fixture-first default; do not import backend client into surfaces unless repo conventions already require it.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
pnpm exec prettier --check apps/project-control-center/src/api/**/*.ts apps/project-control-center/src/tests/**/*.ts
```

## Staged-File Proof Before Commit

Before committing, run and report:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files authorized by this prompt. Then run:

```bash
git diff --cached --name-only
git diff --cached --stat
```

## Commit Summary and Commit Description

Use this commit summary:

```text
feat(pcc): add buyout log spfx read model client
```

Commit description:

```text
Adds the SPFx Buyout Log read-model client seam with route id/path coverage, fixture-first envelope behavior, backend GET-only opt-in support, safe fallback handling, and parity tests.
```

## Final Output Requirements

Return:
- SPFx route id/path added;
- fixture/backend behavior summary;
- tests added;
- validation output;
- confirmation that fixture-first remains default.
