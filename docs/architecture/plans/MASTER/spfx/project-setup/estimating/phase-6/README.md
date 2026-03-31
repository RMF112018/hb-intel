# Phase 6 Prompt Package — Deferred Implementation Closure

## Purpose

This package translates the deferred-implementation inventory from the updated
`project-setup-phase-1-through-5-implementation-and-gap-report.md` into an ordered
implementation sequence for a local code agent.

The goal of Phase 6 is **not** to invent new scope. The goal is to close the
remaining deferred work that is still preventing a truthful production-ready posture.

## Source of truth

Use these as the governing sources:
- live repo truth
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`
- the deferred inventory inside that review report
- the updated Phase 1–5 plan docs under:
  - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/**`

## What this package contains

- `README.md` — this file
- `Phase-6_Implementation-Plan.md` — sequencing, rationale, dependencies, and expected closure model
- `Prompt-07` through `Prompt-14` — execution prompts for the local code agent

## Working rules for the local code agent

- Treat the live repo as authoritative.
- Do not assume the review doc is fully correct unless the repo still proves it.
- Do not re-read files that are already in active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not mark any deferred item complete unless repo truth, tests, and docs all support closure.
- Distinguish clearly between:
  - code complete
  - test-evidenced complete
  - environment-gated
  - operational/manual
  - documented but not proven
- Preserve the intended architecture:
  - shared backend libraries inside the monorepo
  - thin domain-specific hosts
  - Project Setup / Estimating as a dedicated domain boundary
  - least privilege
  - minimal blast radius
  - truthful release/readiness evidence

## Sequence summary

1. Prompt-01 — persistence contract, required-field enforcement, clarification storage decision
2. Prompt-02 — backward compatibility, migration posture, and test truthfulness
3. Prompt-03 — auth convergence, preferences endpoint, deprecated token removal, proxy decision
4. Prompt-04 — deployment-target proof, dedicated-host cutover truth, environment/runtime proof
5. Prompt-05 — observability operationalization, email delivery, provisioning-maturity hardening
6. Prompt-06 — retained-surface frontend regression baseline
7. Prompt-07 — smoke execution, release evidence, and signoff realism
8. Prompt-08 — documentation reconciliation and final deferred-inventory closure

## Expected output from the code agent

At the end of each prompt, the agent should provide:
- concise summary of changes made
- exact files changed
- tests run and results
- remaining caveats
- updated progress notes / closure statements / evidence in:
  - `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

## Success condition for Phase 6

Phase 6 is complete only when:
- all deferred blockers are either closed or explicitly proven external/manual,
- non-blocking deferred items are either closed or truthfully categorized,
- the review report no longer contains deferred items that are actually implemented,
- no phase handoff or signoff doc overstates readiness relative to repo truth.
