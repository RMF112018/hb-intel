# Prompt 01 — Repo Truth Revalidation


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

Perform a read-only repo-truth audit before documentation edits. Do not edit files in this prompt.


## Required Questions

1. What branch and HEAD are current?
2. Is the worktree clean?
3. Is `pnpm-lock.yaml` unchanged?
4. Do the unified lifecycle doctrine docs exist?
5. Do the unified lifecycle model/read-model/backend/SPFx seams exist?
6. Does Prompt 07 security closeout exist?
7. Is a final aggregate Prompt 08 closeout present or missing?
8. Which governing docs require cross-reference alignment?

## Required File Inspection

Inspect the files listed in `00_Repo_Truth_Context.md`.

## Final Output

Return a repo-truth audit summary and a proposed file change plan for Prompts 02–06. Do not commit.
