# Prompt 01 — Repo Truth and Scope Lock

## Objective

Verify local repo truth, lock the Wave 17 Site Health scope, and produce a closeout note before documentation edits.


## Required Instruction Phrase

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Working Directory

`/Users/bobbyfetting/hb-intel`

## Global Guardrails

- Documentation-only unless this prompt explicitly says otherwise.
- Do not implement runtime code.
- Do not mutate packages, dependencies, manifests, lockfile, CI, tenants, Graph, SharePoint, Entra, external systems, settings, permissions, schemas, or secrets.
- Do not execute repair.
- Do not create production rollout artifacts.
- Do not make legal/accounting/claim/delay/entitlement determinations.
- Preserve Wave 14, Wave 15, and Wave 16 authority boundaries.


## Allowed Files / Likely Files

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-17/_doc-updates/Prompt_01_Closeout.md`
- Package inventory markdown/json files if needed.

## Prohibited Scope

- Runtime source implementation.
- Broad formatting.
- Package or lockfile changes.
- Tenant or external-system calls.
- SharePoint/Graph/PnP/Entra mutation.
- SPFx packaging/deployment changes.

## Repo-Truth Files to Inspect

- `docs/architecture/blueprint/sp-project-control-center/phase-3/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-16/`
- `packages/models/src/pcc/SiteHealth.ts`
- `packages/models/src/pcc/fixtures/siteHealth.ts`
- `packages/project-site-template/schemas/families/site-health.schema.json`
- `packages/project-site-template/fields/families/site-health.fields.json`
- `docs/reference/sharepoint/list-schemas/pcc/List-Map.md`

## Steps


1. Run required repo-truth commands.
2. Verify whether Wave 17 path exists locally.
3. Verify Site Health naming and existing model/schema artifacts.
4. Verify Wave 14, Wave 15, and Wave 16 dependency docs.
5. Verify local package path and docs to be touched.
6. Create a Prompt 01 closeout note in the approved Wave 17 planning path.
7. Do not create canonical docs yet unless the path inventory needs an index note approved by this prompt.


## Validation Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --name-only
git diff --cached --name-only
```



## Staged-File Proof Before Commit

Before commit, run:

```bash
git diff --cached --name-only
```

Include the staged files in the final response.

## Commit Summary and Description

Use a traditional commit summary.

Subject pattern:

`docs(pcc): <specific Wave 17 documentation update>`

Description must include:
- exact files changed;
- validation commands and outcomes;
- lockfile MD5 before and after;
- no-runtime/no-mutation attestation;
- residual risks.

## Final Output Requirements

Return:
- concise summary;
- files changed;
- validations run;
- lockfile MD5 before/after;
- residual risks;
- next prompt to execute.
