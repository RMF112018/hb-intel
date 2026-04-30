# Wave 6 Implementation Sequence

## Prompt 01 — Repo-truth gate and scope lock

Validate current repo state locally, create Wave 6 scope/decision records if needed, and confirm Wave 6 is unblocked.

## Prompt 02 — View model and adapter

Create app-local Team & Access view model and adapter from existing shared models/fixtures.

## Prompt 03 — Request form and status UI

Add access request form and status UI with preview-only behavior.

## Prompt 04 — Request queue and detail review UI

Add request list, request detail, and approve/reject/comment review UI without execution.

## Prompt 05 — Manager execution queue and manual IT posture

Add manager/admin execution queue display and manual IT handled posture.

## Prompt 06 — Optional backend read-model opt-in

Optionally add read-only `team-access` route/client/hook using the Wave 4 explicit opt-in pattern.

## Prompt 07 — Guardrails and regression hardening

Update source-scan and behavior tests to protect no-runtime/no-mutation posture.

## Prompt 08 — Documentation closeout and Wave 7 readiness

Close Wave 6, update README truth, and state Wave 7 readiness.
