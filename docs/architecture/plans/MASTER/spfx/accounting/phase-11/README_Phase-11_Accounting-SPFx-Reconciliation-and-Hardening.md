# README — Phase 11 Accounting SPFx Prompt Package

## Purpose

This package provides the ordered local-code-agent prompts for **Phase 11** of the Accounting SPFx remediation effort.

The package is designed to convert the Accounting `.sppkg` audit findings into implementation work that is:

- ordered
- evidence-driven
- bounded
- compatible with repo-truth discipline
- suitable for release-governance review

## What This Package Contains

- `Phase-11_Implementation-Summary_Accounting-SPFx-Reconciliation-and-Hardening.md`
- `README_Phase-11_Accounting-SPFx-Reconciliation-and-Hardening.md`
- `Prompt-01_*` through `Prompt-09_*`

## Intended Execution Order

Execute the prompts in numeric order.

The sequence matters because:
- Prompt 01 establishes canonical packaging/build truth.
- Prompt 02 confirms the Accounting entry/bundle contract.
- Prompt 03 reconciles permission posture.
- Prompt 04 hardens runtime injection and packaged-shell evidence.
- Prompt 05 removes or formalizes hidden hosted dependencies.
- Prompt 06 aligns UI/UX shell behavior.
- Prompt 07 produces a fresh, production-target artifact and evidence package.
- Prompt 08 prepares hosted staging and tenant-admin validation.
- Prompt 09 closes the phase with an evidence-backed readiness decision.

## Important Working Notes

- These prompts assume the agent is operating in the live repo and can inspect current code and docs directly.
- The prompts are written to minimize unnecessary re-reading and redundant drift analysis.
- If a prompt disproves one of the original audit findings, the agent should document that clearly and update downstream docs instead of forcing the codebase to match a disproven assumption.
- Prompts intentionally separate:
  - repo truth
  - package truth
  - hosted-environment truth
  - admin/tenant prerequisite truth

## Suggested Commit Discipline

A reasonable approach is:
- one branch for the whole phase, or
- one branch per prompt cluster if the team prefers smaller review increments

At minimum, keep changes grouped so each prompt’s outputs remain auditable.

## Canonical Output Destination in the Repo

`docs/architecture/plans/MASTER/spfx/accounting/phase-11/`

## Completion Expectation

Do not treat this phase as complete merely because the code builds. The phase ends only when the freshly rebuilt Accounting `.sppkg` is evidenced as traceable, governed, and suitable for staged deployment review.
