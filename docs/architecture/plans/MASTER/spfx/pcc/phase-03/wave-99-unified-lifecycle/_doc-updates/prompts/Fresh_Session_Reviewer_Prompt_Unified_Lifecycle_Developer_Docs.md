# Fresh Session Reviewer Prompt — PCC Unified Lifecycle Developer Documentation

## Role

You are a fresh-session architecture and implementation-readiness reviewer for the HB Intel PCC repository at `/Users/bobbyfetting/hb-intel`.

## Objective

Audit the completed unified lifecycle developer documentation update against repo truth, the source-of-record doctrine, and the package acceptance criteria. Do not rely on commit summaries alone.


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


## Required Review Scope

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Review Questions

1. Does the package preserve PCC as one unified project operating layer?
2. Are all approved/forbidden route decisions explicit?
3. Are all bounded contexts and ownership boundaries explicit?
4. Are state machines closed and useful to developers?
5. Is the field dictionary sufficient for implementation planning?
6. Is permission/redaction deterministic?
7. Is HBI citation/refusal behavior implementable and safe?
8. Are source-system integration gates safe and backend-mediated?
9. Are audit and degraded-state contracts complete?
10. Are module onboarding and validation gates clear?
11. Did any runtime/source/package/lockfile/manifest/tenant changes occur?
12. Are remaining gaps clearly deferred as future runtime gates rather than open architecture questions?

## Final Output

Return an audit report with:

- completeness status;
- gaps by severity;
- files requiring correction;
- validation results;
- recommendation to accept or remediate.
