# Prompt 02 — Governing Docs Alignment


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

Update existing governing PCC docs with targeted cross-references to the new developer-contract documentation set.


## Required Existing Docs to Update

Update only where appropriate:

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Required Alignment Language

Add targeted references stating that future implementation must comply with the unified lifecycle developer contracts for bounded contexts, route taxonomy, state machines, field dictionary, permission/redaction, HBI citation/refusal, source integration, audit events, degraded states, module onboarding, and validation gates.

Do not rewrite entire documents. Avoid stale claims of production readiness.


## Commit Summary

`docs(pcc): align unified lifecycle developer contracts`
