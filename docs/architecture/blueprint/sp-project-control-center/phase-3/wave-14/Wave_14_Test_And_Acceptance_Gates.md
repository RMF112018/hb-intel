# Wave 14 Test and Acceptance Gates

## Purpose

Define implementation acceptance contracts for Phase 14 documentation coverage and future-gated runtime readiness posture.

## Dependency Posture Gate

Dependency posture (documentation only, no install/mutation authorized):

- `@fluentui/react-components`: existing usage where aligned with UI-kit doctrine.
- `@tanstack/react-table`: adopt-when-gated for queue sorting/filtering.
- `@tanstack/react-virtual`: adopt-when-gated if queue scale requires virtualization.
- `@pnp/sp`: defer for MVP direct mutation paths.
- `@pnp/queryable`: evaluate only behind approved SharePoint data boundary.
- `ajv`: adopt-when-gated for schema/command validation.
- `zod`: defer unless standardized by repo-level decision.
- `xstate`: defer unless runtime statechart complexity justifies.
- `@testing-library/react`: existing interaction/accessibility test support.
- `@playwright/test`: existing keyboard/responsive/e2e test support.
- `vitest`: existing model/state/contract test support.

## Security/Redaction Gate

- inherited storage + backend read-model filtering/redaction is documented;
- no default item-level unique permission strategy;
- business audit and security/compliance audit split documented;
- append-only audit event posture documented;
- HBI no-authority/refusal behavior documented;
- external writeback guard documented.

## Test Category Gate

Required test categories for future implementation:

- model/contract tests;
- state-machine transition tests (valid + invalid + stale/superseded paths);
- routing-mode tests (single, sequential, parallel-all, parallel-any, advisory, acknowledgement, escalation, admin verification);
- permission/redaction tests;
- source-module integration tests;
- UX/accessibility behavior tests;
- guardrail tests (no writeback, no runtime mutation, no HBI decision execution).

## Validation Command Gate

Documentation validation commands:

- `python3 -m json.tool <json-file>`
- `pnpm exec prettier --check <touched-markdown-json-files>`
- `git diff --check`
- `md5 pnpm-lock.yaml`

Future runtime-gated validation commands are documented in planning strategy and are not executed by this docs-only prompt.

## Guardrail Gate

- no package/dependency installation;
- no package/lockfile mutation;
- no tenant/list/group/security mutation;
- no Procore/Sage/Power Automate writeback;
- no production rollout authorization.

## Failure Conditions

Fail acceptance if contracts introduce runtime implementation claims, contradict no-writeback/no-mutation posture, omit required dependency posture/test categories, or weaken HBI/refusal/security guardrails.
