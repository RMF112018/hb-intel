# Fresh Session Reviewer Prompt — Estimating Workbench Developer Docs
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.


## Wave 13G Execution Requirement

Before making any edits, confirm that all Estimating Workbench documentation and implementation references resolve under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

Do not create a separate future wave, `wave-99-estimating-workbench`, or top-level `estimating-workbench-developer-contracts` path. Any future runtime implementation prompts generated from this package must remain Wave 13G sub-prompts unless a later approved authority update supersedes this decision.


You are auditing the completed Estimating Workbench developer documentation update in `/Users/bobbyfetting/hb-intel`.

## Objective

Evaluate whether the documentation update fully implements the attached package and preserves all closed decisions without runtime/source/package/tenant mutation.

## Required Checks

- Re-run repo truth.
- Inspect all new docs and JSON artifacts.
- Confirm governing docs/registers/roadmap updates.
- Confirm MVP = yes, SharePoint/SPFx first, Project Readiness mounting, HB internal cost codes first, Commercial/Multifamily templates, template migration only.
- Confirm dependency evaluation is documented but no package/lockfile change occurred.
- Confirm no decisions remain open.
- Confirm all validation gates pass.

## Output

Provide pass/fail findings, defects, required remediation, and whether the package is developer-ready for a later runtime implementation prompt.
