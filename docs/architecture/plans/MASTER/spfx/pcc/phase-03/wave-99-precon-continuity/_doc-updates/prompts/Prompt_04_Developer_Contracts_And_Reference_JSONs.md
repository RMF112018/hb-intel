# Prompt 04 — Developer Contracts and Reference JSONs

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

Create or update developer contract docs and reference JSONs for Preconstruction Continuity under:

```text
docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/
```

## Required Markdown Docs

```text
Preconstruction_Continuity_Developer_Implementation_Decisions_And_Contracts.md
Preconstruction_Continuity_Documentation_Closeout_Template.md
```

## Required Reference JSONs

Create/update in the repo-approved reference location for this doc set:

```text
preconstruction_continuity_data_contract.json
gng_carry_forward_data_contract.json
estimating_kickoff_data_contract.json
preconstruction_visibility_matrix.json
preconstruction_state_machine.json
priority_action_reason_codes.json
fixture_scenarios.json
source_research_urls.json
```

If repo convention places reference JSONs directly under the docs folder or under `reference/`, follow repo truth and document the path.

## Required JSON Contract Content

The JSONs must include:

- source-lineage fields;
- Project Memory contribution fields;
- traceability edge fields;
- HBI eligibility/refusal metadata;
- visibility/redaction classifications;
- audit-event families;
- degraded-state values;
- Priority Action reason codes;
- fixture scenarios;
- hard guardrails.

## Required Validation

Run:

```bash
find docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity -name '*.json' -print0 | xargs -0 -I{} python3 -m json.tool {} >/dev/null
pnpm exec prettier --check <touched markdown/json files>
git diff --check
```

## Commit

Commit summary:

```text
docs(pcc): add preconstruction continuity developer contracts
```

Commit only if files changed.
