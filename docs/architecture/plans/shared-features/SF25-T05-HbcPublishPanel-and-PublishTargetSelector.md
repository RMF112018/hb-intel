# SF25-T05 - HbcPublishPanel and PublishTargetSelector

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF25-T05 panel/target-selector UI task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Define panel and target-selector contracts, including always-visible panel policy, step ownership cues, inline AI actions, and deep-link behavior.

---

## `HbcPublishPanel`

Behavior:
- single publication command surface across modules with primitive-controlled workflow states
- always renders readiness check, approval checklist, supersession/revocation context, and receipt metadata
- projects BIC ownership avatars for active workflow steps

Visibility policy:
- full panel visibility across all modes (locked Decision 2)
- no mode-based hiding of readiness, approval, supersession, or receipt sections

AI constraints:
- inline only (no sidecar)
- source citation required
- explicit approval required before state transition or persistence

---

## `PublishTargetSelector`

Behavior:
- enforces target compatibility with workflow state and policy
- shows target-level readiness and acknowledgment requirements
- blocks invalid target combinations with explicit guidance

Offline states:
- must preserve selected targets in queued request model
- must project `Saved locally` and `Queued to sync` through linked receipt flow

---

## Verification Commands

```bash
pnpm --filter @hbc/publish-workflow test -- HbcPublishPanel
pnpm --filter @hbc/publish-workflow test -- PublishTargetSelector
pnpm --filter @hbc/features-business-development test -- publish-workflow-ui
pnpm --filter @hbc/features-estimating test -- publish-workflow-ui
```

