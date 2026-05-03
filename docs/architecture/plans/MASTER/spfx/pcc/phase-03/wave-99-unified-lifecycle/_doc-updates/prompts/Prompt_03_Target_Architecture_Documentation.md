# Prompt 03 — Target Architecture Documentation


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

Create the comprehensive developer target architecture documentation set under the PCC blueprint folder.


## Required Target Directory

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
```

## Required Docs

Create:

```text
PCC_Unified_Lifecycle_Developer_Target_Architecture.md
PCC_Bounded_Context_And_Ownership_Map.md
PCC_Route_Taxonomy_And_Forbidden_Routes.md
PCC_Record_State_Machines.md
PCC_Field_Level_Data_Dictionary.md
PCC_Permission_Redaction_Resolution_Algorithm.md
PCC_HBI_Retrieval_Citation_And_Refusal_Contract.md
PCC_Source_System_Integration_Contracts.md
PCC_Audit_Event_Model.md
PCC_Error_Degraded_State_Matrix.md
PCC_Module_Onboarding_Template.md
PCC_Test_Acceptance_Gates.md
PCC_Live_Integration_Readiness_Gates.md
PCC_Implementation_Roadmap_Update.md
PCC_Documentation_Closeout_Template.md
```

## Source Content

Use this package's `docs/unified-lifecycle/` files as the content basis. Adapt paths and cross-references to the live repo.

## Required Decisions

Do not leave decisions open. If a future runtime gate is required, state the gate and the current blocked posture, not an open question.


## Commit Summary

`docs(pcc): define unified lifecycle developer target architecture`
