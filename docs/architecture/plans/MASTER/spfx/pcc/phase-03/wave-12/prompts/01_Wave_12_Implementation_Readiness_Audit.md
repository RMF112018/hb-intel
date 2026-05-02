# Prompt 01 — Wave 12 Implementation Readiness Audit

## Objective

Perform a read-only implementation readiness audit for PCC Phase 3 Wave 12 `Constraints Log` before any source-code implementation. Confirm current local repo truth, Wave 12 documentation completeness, reference JSON validity, source-model placement mismatch, package scripts, backend/SPFx seams, and research refresh requirements.

No edits are authorized in this prompt.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```


## Global Guardrails

You must preserve these guardrails throughout this prompt:

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not make source/runtime changes outside this prompt scope.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, secrets, or tenant settings unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Microsoft Graph, PnP, SharePoint REST, Procore, Sage, Primavera/P6, Autodesk, AHJ portals, utility portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not add scraping, polling, sync, mirroring, writeback, or external-system mutation behavior.
- Do not implement evidence-binary upload/download/sync/storage behavior.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not provide legal advice, infer claim entitlement, determine compensability, calculate delay damages, decide notice sufficiency, or perform forensic schedule-analysis conclusions.
- Stop and report if local repo truth contradicts Wave 12 documentation or this prompt.


## Allowed / Likely Files

Read-only only. Do not edit files.

Likely inspection paths:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/
docs/reference/example/HB_ConstraintsLog_Template.xlsx
packages/models/src/pcc/
backend/functions/src/hosts/pcc-read-model/
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/
package.json
packages/models/package.json
backend/functions/package.json
apps/project-control-center/package.json
```

## Prohibited Scope

- No file edits.
- No generated artifacts committed.
- No formatting writes.
- No source, backend, SPFx, package, lockfile, manifest, workflow, tenant, or external-system changes.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Required Audit Questions

Answer these from local repo truth:

1. What is the latest local HEAD?
2. What branch is checked out?
3. Is the working tree clean aside from user-owned workspace context?
4. What is the pre-audit `pnpm-lock.yaml` MD5?
5. Does `Wave_12_Documentation_Closeout.md` exist?
6. Do all Wave 12 documentation artifacts exist?
7. Do all four Wave 12 reference JSON files validate locally?
8. Is `Constraints Log` consistently named in governing docs?
9. Is `Make-Ready Constraint & Risk Exposure Center` consistently used as the user-facing subtitle?
10. Do Wave 12 docs consistently define risk, constraint, issue, delay exposure, and change exposure?
11. Is Wave 12 positioned as a Project Readiness module?
12. Does `packages/models/src/pcc/WorkflowModules.ts` include `constraints-log`?
13. Does `WorkflowModules.ts` still map `constraints-log` to `risk-issues-decision`?
14. What is the repo-consistent implementation path for resolving that mismatch?
15. Does the Project Readiness framework expose source-module/workflow-module seams that should include `constraints-log`?
16. Are there existing read-model response-map/provider patterns for adding a GET-only mock route?
17. Are there existing SPFx PCC API client patterns for read-model data?
18. Are there existing Project Readiness surface conventions that should host the Constraints Log UI?
19. Are there existing tests for model exports, fixtures, backend read model, SPFx client fixture/backend parity, and prohibited imports?
20. Which package scripts should implementation prompts use for validation?
21. Which files should each staged implementation prompt edit?
22. Which docs must be updated during implementation closeout?

## Web Research Refresh

If web access is available in your environment, refresh research using `reference/05_RESEARCH_PATTERN_REFERENCE.md` and summarize actionable implications for implementation. Include sources in the report.

Research at minimum:

- Lean / Last Planner System make-ready planning, constraints analysis, weekly work planning, reasons for variance, reliable commitments.
- Construction lookahead constraints management, BIC/current owner, responsible party, promised date, need-by date, delivered date, overdue/due-window indicators.
- 5x5 risk matrix, impact dimensions, initial/residual risk, escalation thresholds.
- Construction-specific schedule/cost/safety/quality/contract/client/logistics/reputation exposure dimensions.
- Comparable product patterns from Procore, Autodesk Build, Oracle Primavera Cloud, CII AWP/WFP, and AACE boundary guidance.
- UX patterns for command centers, heat maps, make-ready boards, log tables, detail drawers, huddle mode, root cause, lessons learned, and executive readouts.

## Validation Commands

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json >/tmp/wave12_constraints_seed_structure_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json >/tmp/wave12_risk_matrix_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json >/tmp/wave12_constraint_exposure_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/source_research_urls.json >/tmp/wave12_source_research_urls_validated.json
```

Inspect package scripts in:

```text
package.json
packages/models/package.json
backend/functions/package.json
apps/project-control-center/package.json
```

## Staged-File Proof Before Commit

No commit is allowed. Confirm:

```bash
git diff --name-only
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

## Commit Summary and Commit Description

No commit is permitted for Prompt 01. In your final response, include:

```text
Commit summary:
No commit — read-only Wave 12 implementation readiness audit.

Commit description:
No commit was created because this prompt was read-only. The audit verified local repo truth, Wave 12 docs, JSON references, package scripts, implementation seams, and the source-model mismatch disposition.
```

## Final Output Requirements

- State local HEAD, branch, and working tree status.
- State lockfile MD5.
- State JSON validation results.
- State whether the `constraints-log -> risk-issues-decision` mismatch remains.
- State the recommended smallest safe source-model correction for Prompt 02.
- State package scripts to use for Prompts 02–07.
- State exact allowed likely file targets per prompt.
- State whether web research refresh was completed and cite sources if available.
- Confirm no files were edited.
