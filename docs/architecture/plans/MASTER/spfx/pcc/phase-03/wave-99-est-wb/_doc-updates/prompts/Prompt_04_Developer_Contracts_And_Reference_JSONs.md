# Prompt 04 — Developer Contracts and Reference JSONs

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

Create the developer contract docs and machine-readable JSON artifacts for SharePoint schema, SPFx surface, read models, commands, state machines, field dictionary, validation, role/action matrix, grid/formula behavior, HBI grounding, error states, and acceptance gates.

## Required Source

Use this package's `docs/estimating-workbench/` and `reference/` files as source content. Adapt paths to repo truth, but do not reopen closed decisions.
