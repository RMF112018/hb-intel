# Prompt 05 — Roadmap, Implementation Plan, and Test Gates


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

Update Phase 3 roadmap / implementation planning docs so the developer-contract gate becomes mandatory before further PCC unified lifecycle implementation.


## Required Updates

Update relevant roadmap/register/implementation docs to include a new gate:

```text
Unified Lifecycle Developer Contract Gate
```

## Required Gate Language

This gate must be completed before:

- live source-system integrations;
- live HBI/vector/search runtime;
- cross-project search beyond fixture/preview;
- warranty responsibility runtime behavior;
- Project Memory / Traceability persistence;
- new modules that produce lifecycle memory, traceability, or HBI-eligible data.

## Required Test Gate Language

Add references to `PCC_Test_Acceptance_Gates.md` and `validation_acceptance_gates.json`.

## Do Not

Do not change implementation wave numbers unless existing repo roadmap already has a Wave 99 or architecture-hardening section. Prefer adding a documentation gate rather than rewriting historical wave scope.


## Commit Summary

`docs(pcc): add unified lifecycle developer contract roadmap gate`
