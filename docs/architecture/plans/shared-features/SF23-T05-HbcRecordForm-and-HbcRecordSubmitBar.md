# SF23-T05 - HbcRecordForm and HbcRecordSubmitBar

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF23-T05 form/submit UI task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define form and submit-bar contracts, including complexity behavior, blocked/warning/deferred language, review/handoff ownership cues, inline AI actions, top recommended action behavior, and safe submit affordances.

---

## `HbcRecordForm`

Behavior:

- module schema rendered through primitive-controlled field runtime
- inline validation and gate calculation for submit readiness
- draft persistence and recovery handoff hooks wired by default
- inline AI actions/placeholders for defaults, draft synthesis, and warning explanations
- top recommended action remains visible when the author must take action before submit

Complexity:

- Essential: minimal required fields + simple submit bar + minimal friction cues
- Standard: full renderer + inline validation + read-only review integration + clear warning explanations
- Expert: retrospective adjustments + full preview + configure link + richer diagnostics

AI constraints:

- inline only (no sidecar)
- source citation required
- explicit approval required before persistence

---

## `HbcRecordSubmitBar`

Behavior:

- submit status, validation gate state, and queue/sync indicators
- review/approval and handoff BIC ownership avatars
- My Work projection hints and deep-link actions for downstream steps
- top recommended action summary with reason and owner-side classification

User-facing explainability requirements:

- blocked state explains exactly what prevents submit
- warning state explains why submit remains allowed and what downstream risk remains
- suppressed/deferred state explains why the action is not currently available
- degraded or queued state explains whether submit truth is local-only, queued, or synced

Safety requirements:

- duplicate-submit attempts are guarded while request is in-flight
- destructive actions are never hidden behind ambiguous status transitions
- safe submit affordance behavior remains consistent across complexity modes

Offline states:

- must render `Saved locally` and `Queued to sync` indicators without blocking edits
- must clearly distinguish queued local success from committed remote success

---

## UI Ownership Rule

Any reusable visual submit-bar or review-surface primitive introduced during SF23 implementation must live in `@hbc/ui-kit`.
`@hbc/record-form` consumes those primitives and supplies lifecycle/trust/review state.

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- HbcRecordForm
pnpm --filter @hbc/record-form test -- HbcRecordSubmitBar
pnpm --filter @hbc/features-business-development test -- record-form-ui
pnpm --filter @hbc/features-estimating test -- record-form-ui
```
