# Prompt 05 — Read Model, SharePoint Storage, SPFx UX, and Wireframes

## Objective

Document GET-only read-model route contracts, candidate SharePoint storage/list schemas, SPFx UX component contracts, and screen wireframes.


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

- Wave 17 canonical docs under blueprint path.
- `docs/reference/sharepoint/list-schemas/pcc/lists/site-health-*.md`
- `docs/reference/sharepoint/list-schemas/pcc/List-Map.md`
- Planning closeout doc.

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


1. Create read-model/routes/storage/command-gates doc.
2. Create SPFx UX and wireframes doc.
3. Create all wireframe markdown files.
4. Add Site Health list schema docs under `docs/reference/sharepoint/list-schemas/pcc/lists/`.
5. Update PCC List-Map with the new list schema docs.
6. Keep storage as documentation contract only; do not mutate tenant schema.


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


## JSON / Schema Validation

If this prompt creates JSON artifacts, run:

```bash
find docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-17 -name "*.json" -print0 | xargs -0 -n1 python3 -m json.tool >/dev/null
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
