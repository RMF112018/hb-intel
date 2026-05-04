# Unified Lifecycle Implementation Sequence Overview

## Sequencing Principle

The unified lifecycle layer is cross-cutting. It must be implemented as shared contracts, backend read models, fixture-backed SPFx preview surfaces, and guardrails — not as a standalone route or departmental workspace.

## Stages

| Prompt | Stage | Expected Result |
|---:|---|---|
| 01 | Readiness Audit | Read-only repo truth and implementation gap report. |
| 02 | Models / Fixtures / State / Security | Shared contracts, fixtures, refusal taxonomy, security invariants; or no-op verification. |
| 03 | Backend GET-Only Read Models | Aggregate and leaf GET-only routes/provider seams; or no-op verification. |
| 04 | SPFx Client / Fixtures / Adapters / Hooks | Client parity, fixture fallback, adapters, hook/controller seams; or no-op verification. |
| 05 | Project Home / Project Readiness Integration | Non-routed lifecycle cards and readiness context; or no-op verification. |
| 06 | Ask-HBI / Search / Knowledge / Warranty Guards | Grounding, citations, redaction/no-blame/security tests; or no-op verification. |
| 07 | Tests / Guardrails / Closeout | Full validation and closeout commit if changes exist. |
| 08 | Fresh Reviewer | Independent implementation review prompt. |

## Dependency Rules

- Prompt 02 must precede backend/SPFx implementation unless Prompt 01 proves contracts already exist.
- Prompt 03 must precede SPFx backend-mode consumption unless Prompt 01 proves backend read-model routes already exist.
- Prompt 04 must precede Project Home/Readiness integration unless Prompt 01 proves client/fixture/adapter/hook seams already exist.
- Prompt 05 must not create standalone shell routes.
- Prompt 06 must not introduce live HBI, vector, LLM, Graph, Procore, Sage, CRM, or external-system runtime calls.
- Prompt 07 must validate all touched packages and close with evidence.

## Stop Conditions

Stop before editing if:

- worktree has unrelated changes;
- lockfile is already modified;
- required docs are missing and cannot be reconciled;
- package scripts cannot be determined;
- implementation requires package/dependency/manifest/workflow changes not explicitly authorized;
- any prompt would require tenant mutation or source-system mutation.
