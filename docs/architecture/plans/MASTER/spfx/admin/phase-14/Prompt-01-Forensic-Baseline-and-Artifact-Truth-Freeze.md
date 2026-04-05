# Prompt 01 — Forensic Baseline and Artifact Truth Freeze

## Objective

Establish a hard forensic baseline for the Admin SPFx remediation effort so that all later changes can be measured against known package truth, repo truth, and current authoritative docs.


## Non-Negotiable Working Rules

- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, confirm exact wording, inspect a newly changed file, or capture exact evidence for a report.
- Do not make assumptions about the package, build, or runtime contract. Prove every material conclusion.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed doc intent
  4. inferred recommendation
  5. unresolved issue
- Prefer narrow, high-signal code changes over broad speculative edits.
- Do not collapse multiple unresolved root-cause areas into one mixed remediation step.
- Preserve forensic traceability from finding → code change → regenerated artifact → validation evidence.


## Required Context

Authoritative repo:
- `https://github.com/RMF112018/hb-intel.git`

Primary Admin source and doc surfaces:
- `apps/admin/`
- `apps/admin/config/package-solution.json`
- `apps/admin/src/webparts/admin/AdminWebPart.tsx`
- `apps/admin/src/App.tsx`
- `apps/admin/src/router/`
- `apps/admin/README.md`
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md`

Additional relevant comparison surfaces:
- `apps/accounting/config/package-solution.json`
- Admin packaging/build config files
- any repo files that directly generate or transform the Admin `.sppkg`

## Required Tasks

1. Create a **forensic baseline inventory** of the current Admin source, current Admin packaging config, and the Admin `.sppkg` under remediation.
2. Extract and record:
   - solution ID
   - feature ID
   - component IDs
   - asset names
   - `loaderConfig`
   - `entryModuleId`
   - `scriptResources`
   - runtime global/module expectations
   - web API permission declarations
   - packaging/build commands and scripts
3. Freeze the current Admin packaging/runtime contract in a baseline report.
4. Identify every place where Admin runtime contract assumptions are defined:
   - source entry points
   - package metadata
   - packaging pipeline files
   - emitted bundle names
   - runtime global/module names
5. Produce a **drift map** showing where package truth and repo truth already diverge.

## Deliverables

Create a Phase 14 baseline file package that includes:

- `phase-14/baseline/admin-package-inventory.md`
- `phase-14/baseline/admin-repo-truth-inventory.md`
- `phase-14/baseline/admin-package-vs-repo-drift-map.md`
- `phase-14/baseline/admin-remediation-scope-lock.md`

## Hard Gates

Do not modify implementation files in this prompt unless required to preserve current evidence during extraction.
This prompt ends only when the remediation team has a frozen before-state that later prompts can diff against.

## Required Final Report

Return:
- the confirmed baseline facts
- the confirmed drift areas
- the unresolved questions that must be decided before code changes begin
- the exact files that should be treated as authoritative in later prompts
