# Prompt 02 — Operationalize Control-Panel-Safe Governance Boundaries

## Objective

Strengthen the shell's future control-panel readiness by making the protected vs bounded-configurable model operational, inspectable, and preview-safe.

## Governing authorities

- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`

## Exact files / seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- any persistence / preview / admin / future-governance seams already present
- any docs or tests covering preview validation

Do not re-read files still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required implementation outcome

- make bounded-configurable choices explicit and machine-checkable
- add preview-safe rejection of quality-breaking changes
- expose a stable inspection surface for future control-panel consumers
- preserve all protected entry-state and pairing rules

## Proof of closure

Provide:
- exact governance keys exposed
- exact governance keys protected
- preview / rejection behavior
- files changed
- tests added or updated
