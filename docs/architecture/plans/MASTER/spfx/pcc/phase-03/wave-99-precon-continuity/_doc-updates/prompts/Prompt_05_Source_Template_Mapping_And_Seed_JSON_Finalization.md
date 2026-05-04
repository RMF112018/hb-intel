# Prompt 05 — Source Template Mapping and Seed JSON Finalization

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

Create or update source-template mapping documentation and source extraction/reference JSONs so Go / No-Go and Estimating Kickoff source templates can be mapped into the unified lifecycle architecture without becoming workbook clones.

## Required Docs

```text
Preconstruction_Continuity_Source_Template_Mapping.md
```

## Required Reference JSONs

```text
source_template_field_map_requirements.json
source_template_extraction_snapshot.json
```

## Required Extraction Rules

- Use `openpyxl` for workbook metadata extraction.
- Do not unprotect workbooks.
- Do not save/alter source workbooks.
- Use PDF visual review only if required by repo truth.
- Preserve source file path, sheet/page, row/column/cell, label, comment areas, source formulas, merged cells, and protection state.
- Classify sensitive fields.
- Do not copy sensitive raw text into broadly visible docs unless classification allows.
- Mark unverified fields as `unverified-source-mapping`; do not invent source truth.

## Required Mapping Categories

- Go / No-Go decision result;
- score / score band;
- executive override;
- pursuit strategy and differentiators;
- client / market / relationship context;
- risk assumptions;
- staffing/resource assumptions;
- proposal / marketing / estimating deliverables;
- due dates / bid calendar;
- owner assignments;
- evidence/source-document references;
- comments and sensitive notes.

## Required Unified Lifecycle Mapping

Each mapped field must state whether it contributes to:

- lifecycle event;
- Project Memory;
- traceability edge;
- readiness signal;
- Priority Action candidate;
- HBI evidence;
- future-reference knowledge;
- source-only archive context.

## Commit

Commit summary:

```text
docs(pcc): map preconstruction continuity source templates
```

Commit only if files changed.
