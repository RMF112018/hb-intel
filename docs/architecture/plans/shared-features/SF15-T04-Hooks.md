# SF15-T04 — Hooks: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-04, D-05, D-08
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF15-T04 hooks task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Implement hooks for action filtering and invoke lifecycle state.

---

## Hook Contracts

- `useAiActions(record, config, currentRole, complexityTier)`
  - filters by `allowedRoles` and `minComplexity`
- `useAiAction()`
  - invoke
  - loading/streaming state
  - cancel support
  - parsed result and error state

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- useAiActions useAiAction
pnpm --filter @hbc/ai-assist check-types
```
