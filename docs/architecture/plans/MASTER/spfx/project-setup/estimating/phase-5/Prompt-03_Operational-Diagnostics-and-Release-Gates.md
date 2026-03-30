# Prompt 03 — Operational Diagnostics and Release Gates

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 5 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **operator-facing diagnostics, smoke checks, and release gates** required to make production readiness measurable and supportable.

This prompt is focused on making go/no-go decisions explicit and actionable.

## Critical instructions

- Use the Phase 5 baseline created in Prompt 01 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** keep generic error messages where a novice IT technician needs a direct next step.
- Do **not** rely on tribal-knowledge-only release checks.

## Required working approach

1. Review the current runtime diagnostics, logging, readiness checks, and smoke test posture.
2. Define explicit release gates for pre-deploy, deploy, and post-deploy validation.
3. Improve operator-facing diagnostics so key failure classes are understandable and actionable.
4. Add or tighten smoke checks and health assertions for the retained Project Setup surface.
5. Update or create markdown documenting release gates and diagnostic interpretation.

## Specific outcomes required

By the end of this prompt:
- release posture can be evaluated objectively
- key failures are diagnosable by non-developers
- smoke checks exist for the retained production scope
- release gate criteria are explicit and documented

## Required implementation outputs

Make the code / script / markdown changes necessary to:
- improve runtime-mode diagnostics
- clarify startup/config/auth/data-contract/connected-service failure messages
- define pre-release and post-deploy smoke checks
- define explicit pass/fail release gates
- document how operators interpret failures and escalation paths

Update or create markdown summarizing:
- release gates introduced
- diagnostics improved
- smoke checks added
- any remaining observability limitations

## Acceptance criteria

- A release can be evaluated as go / no-go / degraded with explicit criteria.
- Diagnostic outputs are specific enough to support real deployment and support operations.
- Smoke checks cover the retained production surface.

## Required summary back to me

When done, report:
- files changed
- diagnostics added or improved
- release gates defined
- smoke checks added
- any remaining failure classes that are still too opaque
