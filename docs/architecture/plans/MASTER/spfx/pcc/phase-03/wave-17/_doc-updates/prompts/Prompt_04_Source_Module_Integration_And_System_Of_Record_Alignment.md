# Prompt 04 — Source Module Integration and System-of-Record Alignment

## Objective

Document module-by-module Site Health integration and system-of-record boundaries for Project Home, Wave 14, Wave 15, Wave 16, Team & Access, Document Control, Priority Actions, HBI, and HB Central.


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


1. Create source-module integration contract.
2. Create system-of-record and health authority contract.
3. Define Priority Action candidate handoff.
4. Define Wave 14 checkpoint candidate handoff.
5. Define Wave 15 source-health consumption.
6. Define Wave 16 settings-health consumption.
7. Define conflict and deduplication rules.


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
