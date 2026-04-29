# Agent Execution Prompt — <Title>

## Objective

<One concrete objective.>

## Required Context

<Current repo truth / prior approved decision / paths.>

## Scope Lock

### Authorized

- <authorized>

### Forbidden

- <forbidden>

## Execution Instructions

1. Inspect current repo truth first.
2. Produce a concise implementation plan if the work is risky, cross-cutting, phase/wave-driven, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permissions, CI/CD, or architecture-affecting.
3. Do not execute beyond the approved plan.
4. Make the smallest correct change.
5. Preserve existing behavior unless the objective explicitly changes it.
6. Do not stage unrelated files.
7. Do not push unless explicitly instructed.

## Validation

<Required validation commands or selection logic.>

## Closeout

Report:

- files inspected;
- files modified;
- validation commands and results;
- guardrails preserved;
- known gaps;
- commit summary;
- commit description.
