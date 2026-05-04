# Prompt 03 — Target Architecture Documentation

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

Create or update the Preconstruction Continuity target architecture docs under:

```text
docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/
```

The docs must align with the implemented unified lifecycle layer and developer-contract corpus.

## Required Docs

```text
Preconstruction_Continuity_Target_Architecture.md
Go_NoGo_Carry_Forward_Target_Architecture.md
Estimating_Kickoff_Target_Architecture.md
Preconstruction_Continuity_System_Of_Record_And_Integration_Model.md
```

## Required Content

Use the enhanced closed target architecture from this package. The docs must define:

- Preconstruction Continuity as a unified lifecycle carry-forward layer;
- Go / No-Go as an upstream source-owned decision record with PCC read-only projection after GO;
- Estimating Kickoff as a later-phase Project Readiness / Preconstruction workflow module;
- no standalone shell route;
- Project Memory contributions;
- traceability edge model;
- role/stage visibility;
- HBI citation/refusal posture;
- source-of-record and integration boundaries;
- no live integrations.

## Required Alignment Checks

Before editing, verify:

```bash
test -d docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts
rg "Route Taxonomy|Forbidden Routes|HBI|Permission|Redaction|Audit|Degraded|Module Onboarding" docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts
```

## Commit

Commit summary:

```text
docs(pcc): define preconstruction continuity lifecycle architecture
```

Commit only if files changed.
