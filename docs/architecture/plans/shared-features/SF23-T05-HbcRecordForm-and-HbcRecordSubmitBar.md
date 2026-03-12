# SF23-T05 - HbcRecordForm and HbcRecordSubmitBar

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF23-T05 form/submit UI task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define form and submit-bar contracts, including complexity behavior, review/handoff ownership cues, inline AI actions, and deep-link behavior.

---

## `HbcRecordForm`

Behavior:
- module schema rendered through primitive-controlled field runtime
- inline validation and gate calculation for submit readiness
- draft persistence and recovery handoff hooks wired by default
- inline AI actions/placeholders for defaults, draft synthesis, and warning explanations

Complexity:
- Essential: minimal required fields + simple submit bar
- Standard: full renderer + inline validation + read-only review integration
- Expert: retrospective adjustments + full preview + configure link

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

Offline states:
- must render `Saved locally` and `Queued to sync` indicators without blocking edits

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- HbcRecordForm
pnpm --filter @hbc/record-form test -- HbcRecordSubmitBar
pnpm --filter @hbc/features-business-development test -- record-form-ui
pnpm --filter @hbc/features-estimating test -- record-form-ui
```
