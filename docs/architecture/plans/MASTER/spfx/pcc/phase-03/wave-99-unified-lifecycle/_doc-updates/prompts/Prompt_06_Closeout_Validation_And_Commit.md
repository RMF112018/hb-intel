# Prompt 06 — Closeout Validation and Commit


## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This is a documentation-only task. Do not make runtime/source-code changes unless the prompt explicitly allows them. This package does not allow runtime/source-code changes.

## Prohibited Scope

- Editing `docs/architecture/plans/**` unless separately authorized.
- Broad repo formatting.
- Source/runtime code changes.
- Backend route changes.
- SPFx surface, hook, client, adapter, component, shell, router, mount, or CSS changes.
- TypeScript model/package changes.
- Package/dependency changes.
- Lockfile changes.
- Manifest changes.
- Workflow/CI changes.
- SPFx packaging/deployment.
- Tenant mutation.
- Microsoft Graph runtime integration.
- SharePoint REST/PnP runtime operations.
- Procore/Sage/Autodesk/Document Crunch/Adobe/DocuSign/CRM runtime integration.
- Source-system writeback, sync, mirror, mutation, or bulk export.
- Live HBI/vector/search/LLM integration.
- Automatic legal, warranty-responsibility, claim, entitlement, compensability, or delay-damages determinations.
- Production rollout.

## Required Validation

Run repo-correct equivalents of:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
```

For JSON files touched, run:

```bash
python3 -m json.tool <each touched json file>
```

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed;
- validation results;
- lockfile MD5 before/after;
- explicit no-runtime/no-tenant/no-source-system-mutation guardrail confirmation;
- commit summary and commit description if committing.


## Objective

Validate the documentation-only package, create closeout, and commit if all validation passes.


## Required Closeout Doc

Create:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Developer_Contracts_Documentation_Closeout.md
```

Use this package's `PCC_Documentation_Closeout_Template.md` as the basis.

## Required Closeout Evidence

- Baseline branch/HEAD.
- Files created.
- Files modified.
- JSON validation results.
- Prettier validation results.
- `git diff --check` result.
- `pnpm-lock.yaml` MD5 before/after.
- Confirmation no runtime/model/backend/SPFx/package/manifest/tenant/source-system files changed.
- Remaining future-runtime gates.

## Final Diff Review

Before committing, inspect:

```bash
git diff --stat
git diff --name-only
```

Confirm only documentation/reference files were touched.


## Commit Summary

`docs(pcc): close unified lifecycle developer documentation`
