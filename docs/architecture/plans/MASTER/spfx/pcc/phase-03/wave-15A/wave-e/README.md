# PCC Wave E — State Model and Product Language Remediation Package

## Objective

Use this package to verify, harden, or complete the PCC-wide state model and product-language remediation for Wave 15A / Wave E.

Wave E is not visual polish. It is the product-readiness layer that makes preview, read-only, degraded, unavailable, blocked, setup-required, empty, loading, and error states clear to business users.

## Current Repo-Truth Position

The audited repo already contains a Prompt 05 closeout for Wave 15A indicating that the first implementation of state/product-language remediation has landed. That means the local agent must not blindly rewrite the state model.

Start by determining whether the local branch includes:

- `apps/project-control-center/src/ui/PccPreviewState.tsx` with eight states and product-grade defaults.
- `apps/project-control-center/src/ui/PccDisabledAffordance.tsx`.
- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`.
- `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-05/PROMPT_05_CLOSEOUT.md`.

If present, execute the prompts in verification/hardening mode. If absent, execute the prompts as implementation prompts.

## First Prompt to Execute

Start with:

```text
prompts/Prompt_01_State_Model_Scope_Lock_And_File_Map.md
```

That prompt validates source ownership, confirms whether Prompt 05 work exists locally, creates a file map, defines evidence targets, and prevents duplicate or unrelated remediation.

## Placement

Recommended repo location:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-E-state-model-product-language-remediation/
```

Rationale:

- The blueprint path already contains closeout documents for executed Wave 15A implementation prompts.
- This package is an execution-planning artifact for a local code agent.
- Keeping it under `plans/MASTER/.../wave-15A/` avoids confusing it with completed blueprint closeouts while preserving traceability to Wave 15A.

## Required Local-Agent Behavior

- Inspect repo truth before changing anything.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Prefer shared primitives over one-off surface fixes.
- Preserve existing router IDs, model contracts, app packaging contracts, and bento/card architecture unless a doctrine conflict is confirmed.
- Treat developer-facing language in primary UI as a readiness defect.
- Treat missing state explanation as a user trust defect.
- Treat disabled controls without visible explanation as an accessibility and interaction-affordance defect.
- Do not claim final 56/56 readiness from this wave alone.

## Hard Stop Conditions

Stop and report if:

- Required Wave B shell, Wave C surface header, or Wave D layout primitive work is missing locally.
- Changes require backend/API contracts not present in the current repo.
- A proposed fix would change route IDs, `@hbc/models` contracts, or live integrations.
- State wording requires product-owner judgment beyond obvious developer-language removal.
- Tests cannot run because the local environment is broken outside the touched scope.

## Deliverables Expected from Local Agent

- Exact files inspected.
- Exact files changed.
- State-source file map.
- Surface-by-surface state usage matrix.
- Tests run and results.
- Screenshot evidence index, even if screenshots are operator-pending.
- Accessibility/keyboard notes for state messaging and disabled controls.
- Residual risks and deferments.
- Clear next prompt recommendation.
