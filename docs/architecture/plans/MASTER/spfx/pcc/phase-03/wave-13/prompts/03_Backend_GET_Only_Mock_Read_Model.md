# Prompt 03 — Backend GET-Only Mock Read Model

## Objective

Implement the Wave 13 backend GET-only mock read-model route/provider integration for Buyout Log, following existing PCC read-model host conventions and using the shared contracts from Prompt 02.

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

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/services/__tests__/`
- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/fixtures/buyoutLog.ts`

## Prohibited Scope

- Any file not needed for this prompt’s objective.
- Any unrelated refactor.
- Any broad formatting pass.
- Any lockfile/package/manifest/workflow/deployment change unless this prompt explicitly authorizes it.
- Any external-system runtime behavior, writeback, sync, or mutation.

## Repo-Truth Files to Inspect

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/package.json`
- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/fixtures/buyoutLog.ts`

## Implementation Steps

1. Inspect current backend read-model provider interface, mock provider, route registration helper, and existing tests.
2. Add a `PccBuyoutLogReadModel` provider method using the shared model type from Prompt 02.
3. Add deterministic known-project behavior that returns the Wave 13 fixture envelope.
4. Add unknown-project and backend-unavailable/degraded behavior with empty safe read model and warnings.
5. Register a GET-only route under the existing PCC read-model route family, using the repo-conventional route naming pattern. Preferred path if repo truth supports it: `pcc/projects/{projectId}/buyout-log`.
6. Add tests proving:
   - route is GET-only;
   - provider returns known-project fixture;
   - unknown project returns degraded/source-unavailable envelope;
   - backend-unavailable simulation returns empty safe model;
   - no write routes or mutation verbs were added;
   - no prohibited runtime imports or external-system callsites were introduced.
7. Do not add Procore/Sage/Graph/SharePoint/PnP runtime code. Use fixtures only.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
pnpm exec prettier --check backend/functions/src/hosts/pcc-read-model/**/*.ts backend/functions/src/services/__tests__/**/*.ts
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
feat(pcc): add wave 13 buyout log read model route
```

Commit description:

```text
Adds a GET-only PCC Buyout Log mock read-model provider method and route with deterministic fixture data, degraded/unknown-project envelopes, backend-unavailable behavior, and guardrail tests proving no write routes or external-system runtime calls were introduced.
```

## Final Output Requirements

Return:
- route path and route name;
- provider methods changed;
- tests added;
- validation output;
- confirmation that no non-GET route or external runtime call was added.
