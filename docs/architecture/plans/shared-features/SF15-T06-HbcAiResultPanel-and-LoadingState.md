# SF15-T06 — `HbcAiResultPanel` and `HbcAiLoadingState`: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-04, D-08
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF15-T06 result/loading UI task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Implement output display and loading/streaming states with explicit user review controls.

---

## Components

- `HbcAiResultPanel`
  - renders `text`, `bullet-list`, `structured-object`
  - accept/edit/dismiss controls
  - rationale/confidence visibility in expert mode
- `HbcAiLoadingState`
  - streaming placeholder
  - progress label updates
  - cancel action

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- HbcAiResultPanel HbcAiLoadingState
pnpm --filter @hbc/ai-assist build
```
