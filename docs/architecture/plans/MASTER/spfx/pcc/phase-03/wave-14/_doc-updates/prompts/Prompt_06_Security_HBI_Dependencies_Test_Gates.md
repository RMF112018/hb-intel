# Prompt 06 — Security, Redaction, HBI Guardrails, Dependency Evaluation, and Test Gates

## Objective

Document the security/redaction/audit posture, HBI no-authority rules, dependency package evaluation, and implementation acceptance gates for Phase 14.

## Required Inputs

- `docs/08_Security_Redaction_Audit_And_HBI_Guardrails.md`
- `docs/09_Dependency_Package_And_Test_Strategy.md`
- `artifacts/dependency_package_evaluation.json`
- `artifacts/validation_gates.json`
- `artifacts/agent_execution_rules.json`

## Required Outputs

Create/update:

- `Wave_14_HBI_Guardrails_And_Audit_Model.md`
- `Wave_14_Test_And_Acceptance_Gates.md`
- dependency posture section in Wave 14 planning docs.

## Required Coverage

- inherited storage + backend read-model filtering/redaction.
- no default item-level unique permission strategy.
- business vs security/compliance audit.
- append-only audit events.
- HBI allowed/refused behavior.
- external writeback guard.
- dependency posture for Fluent UI, TanStack Table, TanStack Virtual, PnP, Ajv, Zod, XState, Testing Library, Playwright, Vitest.
- test categories and validation commands.
- no package/lockfile mutation.

## Validation

- Every JSON artifact must pass `python3 -m json.tool`.
- Prettier check touched markdown/json.
- `git diff --check`.
- Lockfile MD5 unchanged.

## Closeout

Return commit summary/description with validation evidence.
