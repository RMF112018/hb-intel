# Wave 16 Validation Error Taxonomy And Acceptance Gates

## Purpose

Define Wave 16 validation/error taxonomy, degraded-state handling expectations, and acceptance gate posture for settings governance docs.

## Validation/Error Taxonomy

| Code                             | Meaning                  | Severity      | Remediation           |
| -------------------------------- | ------------------------ | ------------- | --------------------- |
| `SETTING_REQUIRED_MISSING`       | required setting missing | blocked       | request setup         |
| `SETTING_INVALID_URL`            | URL fails policy         | blocked       | correct URL           |
| `SETTING_INVALID_SCOPE`          | invalid scope            | blocked       | admin correction      |
| `SETTING_OVERRIDE_NOT_ALLOWED`   | override blocked         | blocked       | no override           |
| `SETTING_OVERRIDE_EXPIRED`       | expired override         | warning       | renew/request         |
| `SETTING_PENDING_REQUEST_EXISTS` | pending request exists   | warning       | view request          |
| `SETTING_SOURCE_UNAVAILABLE`     | source unavailable       | warning/block | retry/recheck         |
| `SETTING_BACKEND_UNAVAILABLE`    | backend unavailable      | warning/block | retry later           |
| `SETTING_UNAUTHORIZED`           | lacks auth               | blocked       | request access        |
| `SETTING_FORBIDDEN`              | role cannot access       | blocked       | contact admin         |
| `SETTING_SECRET_VALUE_REJECTED`  | raw secret entered       | blocked       | use secret reference  |
| `SETTING_DRIFT_DETECTED`         | drift detected           | warning/block | Site Health review    |
| `SETTING_HBI_REFUSAL`            | unsafe HBI request       | info          | use governed workflow |

## Degraded-State Validation Posture

- Source/backend unavailability must surface explicit degraded states.
- Retry/recheck behavior must be policy-governed and auditable.
- Blocked states require clear disabled-reason copy and escalation path.

## Documentation Acceptance Gates

- Markdown formatting clean.
- JSON artifacts parseable when touched.
- File inventory and scope boundaries respected.
- No lockfile/package/runtime/tenant mutation in docs waves.

## Runtime Gate References (Future)

- GET-only read route posture.
- `readOnly: true` envelopes.
- Secret redaction.
- Role gating.
- Disabled-action reason copy.
- Wave 14 approval handoff.
- Override cannot bypass global policy.
- HBI refusal for unsafe mutation requests.

## Evidence Requirements

For each setting family, documentation should answer ownership, storage, visibility/request/approval path, override policy, validation behavior, degraded-state behavior, audit coverage, redaction policy, and prohibited actions.

## Implementation Boundary

This document defines documentation governance only and does not authorize runtime execution changes.
