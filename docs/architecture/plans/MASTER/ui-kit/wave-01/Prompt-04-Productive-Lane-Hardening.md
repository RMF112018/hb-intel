# Prompt 04 — Productive Lane Hardening

You are working in the live HB Intel repository.

## Objective

Harden the productive lane so forms, tables, workflow-heavy modules, and operational application surfaces remain coherent, efficient, and clearly distinct from presentation-grade homepage/editorial UI.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`

Inspect representative productive-lane consumers and existing shared primitives.

Do not reread files that are already in your active context unless needed.

## Required work

- confirm or refine the productive lane’s shared visual grammar,
- ensure productive primitives and shared surface structures do not inherit unnecessary editorial drama,
- protect clarity, density discipline, hierarchy, and usability,
- identify any places where productive UI is currently contaminated by presentation-only patterns,
- name the productive-lane consumers materially affected by this wave.

## Consumer naming requirement

Name the specific productive-lane consumers materially affected by this wave.

At minimum, identify:

- which tables/forms/workspace shells or operational modules were examined,
- which named consumers were corrected or intentionally left unchanged,
- any consumer surfaces that were using presentation-lane assumptions inappropriately.

Do not report “productive lane hardening” without naming concrete consumers.

## Deliverables

- productive-lane corrections where warranted,
- explicit notes distinguishing productive patterns from presentation patterns,
- documentation or code comments only where they materially help maintainability.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

The visual section should explain how the productive lane became clearer and more coherent without becoming flat or lifeless.

## Guardrails

- Do not flatten the productive lane into lifeless generic UI.
- Do not import presentation-surface assumptions where productive UI needs speed and clarity.
- Do not leave consumer impact vague; name the actual productive surfaces affected.
