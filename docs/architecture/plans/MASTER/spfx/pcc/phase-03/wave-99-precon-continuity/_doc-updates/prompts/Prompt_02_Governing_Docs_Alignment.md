# Prompt 02 — Governing Docs Alignment

## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This is a documentation-only task. Do not make runtime/source-code changes unless this prompt explicitly allows them.

Treat the implemented unified lifecycle layer as controlling architecture. Preconstruction Continuity must align with the live developer-contract corpus under:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
```

Every decision must preserve PCC as one unified project operating layer. Do not create or imply a separate Business Development, Estimating, Preconstruction, Operations, Warranty, Executive, or Admin workspace.

## Global Prohibited Scope

- Editing `docs/architecture/plans/**` unless separately authorized.
- Broad repo formatting.
- Source/runtime code changes.
- Backend route changes.
- SPFx surface/component/client changes.
- Model/type package changes.
- Package/dependency changes.
- Lockfile changes.
- Manifest changes.
- Workflow/CI changes.
- SPFx packaging/deployment.
- Tenant mutation.
- Procore API/runtime integration.
- Direct SPFx-to-Procore behavior.
- Procore write-back.
- Procore full mirror.
- Sage write-back or accounting postings.
- CRM, Unanet, Autodesk, BuildingConnected, Power Automate, Microsoft Graph, SharePoint REST/PnP, or external-system runtime mutation.
- Evidence file upload/sync/storage behavior.
- Automatic project setup, SharePoint site creation, Procore project creation, Sage project creation, accounting setup, staffing commitments, legal decisions, or contractual decisions.
- Treating Go / No-Go scores as legal, accounting, revenue, margin, or profit guarantees.
- Treating Estimating Kickoff assignments as HR/staffing commitments unless separately approved.
- Exposing sensitive executive, committee, pursuit, margin, strategy, or client comments to unauthorized roles.
- Destroying, overwriting, unprotecting, or altering source workbooks, PDFs, or templates.
- Creating standalone `go-no-go`, `preconstruction-continuity`, `estimating-kickoff`, `project-memory`, `unified-search`, or `ask-hbi` shell routes unless the current route taxonomy explicitly authorizes them.
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
git diff --stat
git diff --name-only
pnpm exec prettier --check <touched markdown/json files>
git diff --cached --name-only
```

For JSON files touched, run `python3 -m json.tool` against each touched JSON file.

If no files are touched, run `git diff --quiet` and report the no-op result.

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if any;
- validation results;
- lockfile MD5 before/after;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit no-runtime/no-tenant/no-source-system-mutation confirmation.


## Objective

Align governing PCC docs so Preconstruction Continuity is explicitly governed by the implemented unified lifecycle layer and developer-contract corpus. Use verification-first / no-op-aware execution. Edit only if required cross-reference language is missing.

## Exact Candidate Governing Docs

Inspect these docs and update only those missing required language:

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Required Cross-Reference Meaning

Each applicable doc should make clear, in minimal additive language, that:

```text
Preconstruction Continuity is governed by the unified lifecycle developer contracts. Go / No-Go carry-forward and Estimating Kickoff context must contribute only permission-filtered lifecycle events, Project Memory, traceability edges, readiness signals, Priority Action candidates, HBI-eligible evidence, and future-reference knowledge. These records must not create separate departmental workspaces or override source systems.
```

## Edit Policy

- If compliant language already exists, do not modify.
- If missing, insert minimal additive cross-reference language only.
- Do not rewrite sections.
- Do not touch runtime files.
- Do not edit `docs/architecture/plans/**`.

## Verification Commands

Before editing, run targeted checks:

```bash
rg "Preconstruction Continuity|Go / No-Go|Estimating Kickoff" <candidate docs>
rg "unified lifecycle developer contracts|Project Memory|traceability|HBI|source-lineage|separate departmental workspace" <candidate docs>
```

## Commit

Commit only if actual edits are made.

Commit summary if needed:

```text
docs(pcc): align preconstruction continuity with unified lifecycle
```

If no edits are required, do not commit and report no-op.
