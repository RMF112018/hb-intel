# 02 — Implementation Sequence Overview

## Purpose

Define the staged Wave 13 implementation sequence after adapting Buyout Log to the unified lifecycle developer-contract layer.

## Sequence

### Prompt 01 — Implementation Readiness Audit

Read-only. Confirms repo truth, local state, Wave 13 docs, unified lifecycle contract docs, source-model mapping, scripts, seams, and safe implementation order.

### Prompt 02 — Shared Models, Fixtures, State Machine, and Contracts

Adds model contracts, state machines, fixtures, utilities, source-lineage posture, HBI eligibility, Project Memory / traceability references, and tests.

### Prompt 03 — Backend GET-Only Mock Read Model

Adds a GET-only backend read-model route/provider using deterministic fixtures and degraded responses. No write routes or external calls.

### Prompt 04 — SPFx Read-Model Client and Fixture Parity

Adds client route template/method, fixture fallback, backend opt-in parity if repo-standard, and tests.

### Prompt 05 — SPFx Buyout Log Project Readiness Surface

Adds read-only/fixture-safe Buyout Log command-center UI as a Project Readiness module region, not a standalone routed shell workspace.

### Prompt 06 — Unified Lifecycle Integration Seams

Adds safe references to Priority Actions, Project Readiness, Project Memory, traceability, Document Control evidence references, External Systems launcher-only posture, and future Approvals/Checkpoints prompts.

### Prompt 07 — Tests, Guardrails, and Implementation Closeout

Runs full targeted validation, adds closeout doc, confirms guardrails, and records validation evidence.

### Prompt 08 — Fresh Reviewer Prompt

Independent reviewer prompt for after implementation.

## Dependency Rules

- Prompt 02 must not proceed until Prompt 01 resolves or bridges the `buyout-log` model placement issue.
- Prompt 03 depends on exported model/read-model contracts from Prompt 02.
- Prompt 04 depends on backend/read-model route names from Prompt 03 and model exports from Prompt 02.
- Prompt 05 depends on SPFx client/fixture seam from Prompt 04.
- Prompt 06 depends on UI components/VM from Prompt 05.
- Prompt 07 depends on all previous implementation prompts.

## Rollback / Stop Conditions

Stop immediately if:

- local worktree has unrelated user-owned changes that overlap prompt scope;
- lockfile changes unexpectedly;
- package script names cannot be confirmed;
- model mapping cannot be resolved safely;
- route taxonomy would be violated;
- implementation would require live external-system integration;
- tests fail from agent-authored changes and cannot be fixed within scope.
