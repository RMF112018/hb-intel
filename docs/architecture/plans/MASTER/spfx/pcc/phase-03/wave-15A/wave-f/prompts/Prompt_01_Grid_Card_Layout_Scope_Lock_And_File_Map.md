# Prompt 01 — Grid/Card Layout Scope Lock and File Map

## Role

You are the local code agent executing PCC Phase 3 Wave 15A / Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives.

## Objective

Confirm local repo truth for Wave D, lock implementation scope, and produce an exact source/evidence file map before runtime changes.

## Scope

- Documentation and audit only.
- Create/update Wave D package placement if missing.
- Confirm prior Prompt 03/04/05 closeouts and current primitive/surface state.
- Produce local source-file map and implementation sequence.

## Non-Scope

- No runtime source changes.
- No CSS tweaks.
- No backend/API/integration work.
- No final 56/56 claim.

## Required Repo-Truth Inspection

- `git status --short`; `git rev-parse HEAD`; `md5 pnpm-lock.yaml`.
- Inspect all files listed in `docs/00_WAVE_D_REPO_TRUTH_AUDIT_FINDINGS.md`.
- Re-check `docs/reference/ui-kit/doctrine/`, `docs/reference/ui-kit/standards/`, `docs/reference/ui-kit/patterns/`, and SPFx scorecard/checklist files.
- Inspect all routed surface source files and current tests.
- Confirm whether this package is already present; if not, place it under the recommended path.

## Exact or Best-Known Source Areas to Change

- Documentation only under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`.
- Blueprint evidence folders under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/` if not present.

## Implementation Requirements

- Create/update `artifacts/source-file-map-template.md` with exact local paths and ownership.
- Confirm the implementation sequence and dependencies.
- Record which primitive changes already exist from Prompt 04 and which still need work.
- Record Team & Access as a high-risk validation route.

## Required Tests

- No runtime tests required unless repository tooling is needed to verify package formatting.
- Run Prettier check on newly created markdown files if repo practice requires it.

## Required Screenshot / Evidence Output

- Create evidence folder skeleton and screenshot index template.
- No screenshot capture required in Prompt 01.

## Scorecard Impact

No score movement. This prompt establishes baseline evidence only.

## Closeout Requirements

Use the shared closeout format below and update/create Wave D evidence docs under the canonical Wave 15A paths.

## Stop Conditions

- Worktree not clean and changes are unrelated.
- Required source paths are missing.
- Doctrine files cannot be located.
- Prompt 04/05 closeouts conflict with current source.

## Instruction on Context Reuse

Do not re-read files that are still within your current context unless exact wording, line references, or changed repo state must be verified.

## Shared Instructions

## Repo-Truth Baseline

- Repository: `RMF112018/hb-intel`
- Audited ref: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- PCC app root: `apps/project-control-center/`
- Recommended package placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Runtime implementation is **not** included in this package. This package is for a local code agent to execute in the repo.

## Non-Negotiables for the Local Agent

- Inspect repo truth before editing.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Preserve active routed-surface semantics: exactly one `[data-pcc-active-surface-panel]` per active route.
- Preserve the bento direct-child invariant unless a shared layout primitive explicitly replaces it.
- Prefer shared primitives and named contracts over one-off surface CSS.
- Do not introduce backend/API, Graph, PnP, Procore SDK, Document Crunch, Adobe Sign, CI, package-manager, or app-catalog scope.
- Do not claim final `56/56` readiness. Wave D can move layout/card/responsive/visual hierarchy categories, but final readiness requires Wave H-style tenant-hosted, screenshot, accessibility, keyboard, and regression evidence.

## Required Closeout Format

At the end of this prompt, report:

- exact files inspected;
- exact files changed;
- tests run and results;
- screenshots/evidence produced;
- lockfile MD5 before/after if any source/docs changed;
- residual issues;
- stop conditions encountered;
- next prompt to execute.

## Next Prompt

Proceed to `Prompt_02_Card_Tier_Component_And_Visual_Hierarchy_Primitives.md`.
