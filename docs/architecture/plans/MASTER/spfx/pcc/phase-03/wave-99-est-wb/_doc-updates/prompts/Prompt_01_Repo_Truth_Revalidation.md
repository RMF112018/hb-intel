# Prompt 01 — Repo Truth Revalidation

## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This is a documentation-only task. Do not make runtime/source-code changes unless the prompt explicitly allows them. This package does not allow runtime/source-code changes.

## Prohibited Scope

- Runtime/source code changes.
- TypeScript model/package changes.
- Backend route changes.
- SPFx components, routes, clients, hooks, adapters, CSS, manifests, or package changes.
- Package/dependency installation.
- `package.json` or `pnpm-lock.yaml` mutation.
- CI/workflow/deployment changes.
- Tenant mutation or SharePoint list creation.
- Procore, Sage, Autodesk, BuildingConnected, Graph, SharePoint REST, or HBI runtime calls.
- Active project workbook import.
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
python3 -m json.tool <each touched json file>
```

## Final Output Requirements

Return files inspected, files changed, validation results, lockfile MD5 before/after, no-runtime/no-tenant/no-source-system-mutation confirmation, and commit summary/description if committing.

## Objective

Perform the read-only repo truth audit for the Estimating Workbench documentation update. Confirm current PCC docs, models, package posture, and workbook reference path before any documentation changes.

## Required Output

Create or update a repo-truth note inside the new documentation package directory after confirming current paths. Do not edit runtime code.
