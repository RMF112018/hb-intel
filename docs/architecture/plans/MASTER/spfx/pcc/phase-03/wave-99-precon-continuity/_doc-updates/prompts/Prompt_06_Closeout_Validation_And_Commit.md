# Prompt 06 — Closeout, Validation, and Commit

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

Close the Preconstruction Continuity documentation update sequence by validating all docs/reference JSONs, recording evidence, and committing only if there are changes not yet committed by earlier prompts.

## Required Closeout File

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/Preconstruction_Continuity_Documentation_Closeout_Template.md
```

If the template already exists, create a concrete closeout file only if the package instructions or repo convention require one. Otherwise update the template with completed evidence sections.

## Required Inventory

Report counts for:

- target architecture docs;
- reference JSON files;
- governing docs touched;
- runtime files touched;
- plan docs touched;
- lockfile changes.

## Required Validation

Run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
find docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity -name '*.json' -print0 | xargs -0 -I{} python3 -m json.tool {} >/dev/null
pnpm exec prettier --check <touched markdown/json files>
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
```

## Guardrail Checks

Confirm:

- no runtime/source changes;
- no backend changes;
- no SPFx changes;
- no model/package changes;
- no lockfile/manifest/workflow changes;
- no tenant mutation;
- no source-system mutation;
- no source workbook/PDF mutation;
- no edits to `docs/architecture/plans/**`.

## Commit

If changes are present and validation passes, commit.

Suggested summary:

```text
docs(pcc): align preconstruction continuity with unified lifecycle
```

If no changes are present, do not commit and return no-op closeout.
