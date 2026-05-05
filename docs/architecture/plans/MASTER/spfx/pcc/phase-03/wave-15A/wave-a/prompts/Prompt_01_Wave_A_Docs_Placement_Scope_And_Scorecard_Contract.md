# Prompt 01 — Wave A Docs Placement, Scope, and Scorecard Contract

## Role

You are the local code agent acting as PCC Wave 15A documentation placement and baseline authority agent.

## Objective

Place or validate Wave 15A top-level guide files, create the current-state evidence baseline, create the doctrine authority matrix, create the gap-to-56 scorecard contract, confirm remediation order, and prepare the repo for Prompt 02 shared shell remediation.

## Scope

Docs and evidence scaffolding only. Canonical path: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/`. Execution package path: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/remediation-prompt-package/`.

## Non-Scope

Do not implement runtime UI changes. Do not edit PCC runtime source files. Do not remediate surfaces. Do not change backend/API code.

## Required Repo-Truth Inspection

Inspect Wave 15A paths, uploaded/available package files, doctrine docs, scorecard/checklist docs, PCC app source inventory, Wave 15 and Wave 16 planning docs, and Phase 3 blueprint docs. Verify whether the package already exists before writing.

## Required Implementation Work

Create/validate Wave 15A guide docs, evidence folders, scorecard template placement, doctrine authority matrix, current-state inventory, gap-to-56 contract, remediation workstream order, and closeout templates. Copy this remediation-prompt-package into the canonical execution path if absent.

## Required Tests

Run prettier check on changed markdown. Run any repo doc validation script if present. Do not run runtime UI tests unless doc placement touches generated references requiring test validation.

## Required Screenshot / Evidence Output

Create evidence folder structure and screenshot plan. Capture before screenshots only if local/tenant tooling is available; otherwise create explicit placeholder index entries marked `missing`.

## Scorecard Impact

Establishes baseline and enables later score movement. Does not increase score by itself.

## Closeout Requirements

Create Wave A closeout doc listing exact files created/changed, command results, baseline score position, evidence gaps, and next prompt to execute.

## Stop Conditions

Stop if canonical plan-library guard blocks writes, if Wave 15A docs already exist with conflicting content, or if required doctrine docs cannot be located.

## Standing Instruction

Do not re-read files still within your current context unless exact wording, line references, or changed repo state must be verified.

Begin with repo-truth inspection. Avoid unrelated changes. Avoid feature creep. Prefer shared primitives over one-off local styling. Update closeout documentation. Report exact files changed, commands run, validation results, residual issues, and any stop conditions.

